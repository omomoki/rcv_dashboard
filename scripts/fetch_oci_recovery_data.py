#!/usr/bin/env python3
"""Fetch OCI Recovery Service data and write dashboard data.

Run with the Python from the Oracle MCP repo venv, for example:

  /Users/kazumimomoki/Dev/work/mcp/.venv/bin/python scripts/fetch_oci_recovery_data.py \
    --compartment "<compartment OCID or display name>" \
    --region ap-osaka-1 \
    --output dashboard-data.json
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


DEFAULT_MCP_REPO = Path(
    os.environ.get(
        "ORACLE_MCP_REPO",
        "/Users/kazumimomoki/Dev/work/mcp/src/oci-recovery-mcp-server",
    )
)
JST = timezone(timedelta(hours=9), "JST")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build OCI Recovery dashboard data.")
    parser.add_argument(
        "--compartment",
        required=True,
        action="append",
        help="Compartment OCID or display name. Repeat to include several compartments.",
    )
    parser.add_argument("--region", default="ap-osaka-1", help="OCI region.")
    parser.add_argument("--profile", default="DEFAULT", help="OCI config profile.")
    parser.add_argument(
        "--mcp-repo",
        default=str(DEFAULT_MCP_REPO),
        help="Path to oracle/mcp/src/oci-recovery-mcp-server. Can also be set with ORACLE_MCP_REPO.",
    )
    parser.add_argument(
        "--output",
        default="dashboard-data.json",
        help="Output file. Use .json for manual dashboard loading or .js for auto-loading.",
    )
    parser.add_argument(
        "--format",
        choices=("auto", "json", "js"),
        default="auto",
        help="Output format. auto uses the output file extension.",
    )
    parser.add_argument("--window-days", default=30, type=int, help="Reporting window.")
    parser.add_argument(
        "--include-raw",
        action="store_true",
        help="Include raw OCI/MCP payloads for debugging. Avoid committing this output.",
    )
    return parser.parse_args()


def to_plain(value: Any) -> Any:
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, (list, tuple)):
        return [to_plain(item) for item in value]
    if isinstance(value, dict):
        return {str(key): to_plain(item) for key, item in value.items()}
    if hasattr(value, "model_dump"):
        return to_plain(value.model_dump(mode="json", by_alias=False, exclude_none=False))
    if hasattr(value, "dict"):
        return to_plain(value.dict())
    if hasattr(value, "__dict__"):
        return to_plain(
            {key: item for key, item in vars(value).items() if not key.startswith("_")}
        )
    return str(value)


def parse_time(value: Any) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    text = str(value)
    if not text:
        return None
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def minutes_between(start: Any, end: Any) -> float | None:
    started = parse_time(start)
    ended = parse_time(end)
    if not started or not ended:
        return None
    return max((ended - started).total_seconds() / 60, 0)


def num(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def first_number(*values: Any) -> float | None:
    for value in values:
        parsed = num(value)
        if parsed is not None:
            return parsed
    return None


def metric(metrics: dict[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in metrics and metrics[key] is not None:
            return metrics[key]
    return None


def value(data: dict[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return None


def backup_destination_flag(database_details: dict[str, Any], flag_name: str) -> bool | None:
    config = value(database_details, "db_backup_config", "dbBackupConfig") or {}
    destinations = value(config, "backup_destination_details", "backupDestinationDetails") or []
    for destination in destinations:
        destination_type = value(destination, "type")
        if destination_type and str(destination_type).upper() != "DBRS":
            continue
        flag = value(destination, flag_name)
        if flag is not None:
            return bool(flag)
    return None


def classify_database_service(database_details: dict[str, Any]) -> dict[str, Any]:
    db_system_id = value(database_details, "db_system_id", "dbSystemId")
    vm_cluster_id = value(database_details, "vm_cluster_id", "vmClusterId")
    db_home_id = value(database_details, "db_home_id", "dbHomeId")

    if db_system_id:
        return {
            "serviceType": "BaseDB",
            "serviceName": "Oracle Base Database Service",
            "infrastructureId": db_system_id,
            "dbHomeId": db_home_id,
        }

    if vm_cluster_id:
        vm_cluster_text = str(vm_cluster_id).lower()
        if "exadbvmcluster" in vm_cluster_text:
            service_type = "ExaDB-XS"
            service_name = "Exadata Database Service on Exascale Infrastructure"
        elif "cloudvmcluster" in vm_cluster_text:
            service_type = "ExaDB-D"
            service_name = "Exadata Database Service on Dedicated Infrastructure"
        elif ".vmcluster." in vm_cluster_text:
            service_type = "ExaDB-C@C"
            service_name = "Exadata Database Service on Cloud@Customer"
        else:
            service_type = "ExaDB"
            service_name = "Exadata Database Service"
        return {
            "serviceType": service_type,
            "serviceName": service_name,
            "infrastructureId": vm_cluster_id,
            "dbHomeId": db_home_id,
        }

    return {
        "serviceType": "不明",
        "serviceName": "サービス種別未判定",
        "infrastructureId": None,
        "dbHomeId": db_home_id,
    }


def resolve_compartment(server: Any, compartment: str) -> tuple[str, str]:
    resolved_id = server._resolve_compartment_id(compartment)
    name = compartment
    if str(resolved_id).startswith("ocid1.compartment."):
        try:
            response = server.get_identity_client().get_compartment(resolved_id)
            name = getattr(response.data, "name", None) or compartment
        except Exception:
            name = compartment
    return resolved_id, name


def summarize_backups(backups: list[dict[str, Any]], window_days: int) -> dict[str, dict[str, Any]]:
    cutoff = datetime.now(timezone.utc).timestamp() - (window_days * 24 * 60 * 60)
    summary: dict[str, dict[str, Any]] = defaultdict(lambda: {"count": 0, "durations": []})
    for backup in backups:
        started = parse_time(backup.get("time_started"))
        if started and started.tzinfo is None:
            started = started.replace(tzinfo=timezone.utc)
        if started and started.timestamp() < cutoff:
            continue
        database_id = backup.get("database_id")
        if not database_id:
            continue
        duration = minutes_between(backup.get("time_started"), backup.get("time_ended"))
        summary[database_id]["count"] += 1
        if duration is not None:
            summary[database_id]["durations"].append(duration)
    return summary


def build_dashboard_data(args: argparse.Namespace) -> dict[str, Any]:
    os.environ["ORACLE_MCP_AUTH_METHOD"] = "apikey"
    os.environ["OCI_CONFIG_PROFILE"] = args.profile
    sys.path.insert(0, str(Path(args.mcp_repo).expanduser()))

    import oci
    from oracle.oci_recovery_mcp_server import server

    compartments = []
    databases = []
    raw = {"protectedDatabases": {}, "backups": {}, "databaseDetails": {}}
    database_client = server.get_database_client(args.region)
    database_detail_cache: dict[str, dict[str, Any]] = {}

    def get_database_details(database_id: str | None) -> dict[str, Any]:
        if not database_id:
            return {}
        if database_id in database_detail_cache:
            return database_detail_cache[database_id]
        try:
            details = oci.util.to_dict(database_client.get_database(database_id=database_id).data)
        except Exception as exc:
            details = {}
            raw.setdefault("warnings", []).append(
                f"get_database failed for {database_id}: {exc}"
            )
        database_detail_cache[database_id] = details
        return details

    for compartment_arg in args.compartment:
        compartment_id, compartment_name = resolve_compartment(server, compartment_arg)
        protected = to_plain(
            server.list_protected_databases(
                compartment_id=compartment_id,
                region=args.region,
                sort_by="displayName",
                sort_order="ASC",
            )
        )
        try:
            backups = to_plain(
                server.list_backups(
                    compartment_id=compartment_id,
                    region=args.region,
                    aggregate_pages=True,
                )
            )
        except Exception as exc:
            backups = []
            raw.setdefault("warnings", []).append(
                f"list_backups failed for {compartment_name}: {exc}"
            )

        backup_summary = summarize_backups(backups, args.window_days)
        backup_space_total = 0.0

        for item in protected:
            metrics = item.get("metrics") or {}
            database_id = item.get("database_id")
            database_details = get_database_details(database_id)
            service_details = classify_database_service(database_details)
            backup_stats = backup_summary.get(database_id, {"count": 0, "durations": []})
            durations = backup_stats["durations"]
            avg_runtime = sum(durations) / len(durations) if durations else None
            backup_space = first_number(
                metric(metrics, "backup-space-used-in-gbs", "backup_space_used_in_gbs"),
                metric(metrics, "backup-space-estimate-in-gbs", "backup_space_estimate_in_gbs"),
            )
            backup_space_total += backup_space or 0
            unprotected_seconds = first_number(
                metric(
                    metrics,
                    "unprotected-window-in-seconds",
                    "unprotected_window_in_seconds",
                )
            )
            redo_enabled = metric(
                metrics,
                "is-redo-logs-enabled",
                "is_redo_logs_enabled",
            )
            zero_data_loss_enabled = backup_destination_flag(
                database_details,
                "is_zero_data_loss_enabled",
            )
            if redo_enabled is None:
                redo_enabled = zero_data_loss_enabled
            if redo_enabled is None:
                redo_enabled = item.get("is_redo_logs_shipped")

            databases.append(
                {
                    "id": item.get("id"),
                    "name": item.get("db_unique_name") or item.get("display_name"),
                    "displayName": item.get("display_name"),
                    **service_details,
                    "compartment": compartment_name,
                    "compartmentId": compartment_id,
                    "databaseId": database_id,
                    "databaseLifecycle": value(database_details, "lifecycle_state", "lifecycleState"),
                    "lifecycle": item.get("lifecycle_state") or "UNKNOWN",
                    "health": item.get("health") or "UNKNOWN",
                    "backups30d": backup_stats["count"],
                    "backupSpaceGb": round(backup_space or 0, 2),
                    "rpoMinutes": (
                        round(unprotected_seconds / 60, 1)
                        if unprotected_seconds is not None
                        else None
                    ),
                    "rtoMinutes": None,
                    "runtimeMinutes": round(avg_runtime, 1) if avg_runtime is not None else None,
                    "redoEnabled": bool(redo_enabled),
                    "redoStatus": (
                        "enabled"
                        if redo_enabled is True
                        else "disabled"
                        if redo_enabled is False
                        else "unknown"
                    ),
                    "realTimeProtection": bool(redo_enabled),
                    "zeroDataLossEnabled": zero_data_loss_enabled,
                    "retentionDays": first_number(
                        metric(metrics, "retention-period-in-days", "retention_period_in_days")
                    ),
                }
            )

        compartments.append(
            {
                "id": compartment_id,
                "name": compartment_name,
                "monthlyCost": round(backup_space_total * 0.14, 2),
            }
        )
        raw["protectedDatabases"][compartment_name] = protected
        raw["backups"][compartment_name] = backups
        raw["databaseDetails"][compartment_name] = database_detail_cache

    result = {
        "region": args.region,
        "snapshotTime": datetime.now(JST).strftime("%Y-%m-%d %H:%M JST"),
        "windowDays": args.window_days,
        "currency": "USD",
        "compartments": compartments,
        "databases": databases,
        "notes": [
            "RTO は Recovery Service API から直接取得できないため未設定です。",
            "monthlyCost はバックアップ容量からの簡易見積もりです。",
        ],
    }
    if raw.get("warnings"):
        result["warnings"] = raw["warnings"]
    if args.include_raw:
        result["raw"] = raw
    return result


def main() -> int:
    args = parse_args()
    data = build_dashboard_data(args)
    output = Path(args.output)
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    output_format = args.format
    if output_format == "auto":
        output_format = "js" if output.suffix == ".js" else "json"

    if output_format == "js":
        output.write_text(
            f"window.RECOVERY_DASHBOARD_DATA = {payload};\n",
            encoding="utf-8",
        )
    else:
        output.write_text(f"{payload}\n", encoding="utf-8")
    print(f"Wrote {output} with {len(data['databases'])} databases")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
