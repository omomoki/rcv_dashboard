const SAMPLE_DATA = {
  region: "ap-osaka-1",
  snapshotTime: "2026-05-26 15:30 JST",
  windowDays: 30,
  currency: "USD",
  compartments: [
    {
      id: "sample-prod-osaka",
      name: "本番-大阪",
      monthlyCost: 219.28,
    },
    {
      id: "sample-stg-osaka",
      name: "検証-大阪",
      monthlyCost: 62.2,
    },
    {
      id: "sample-dr-tokyo",
      name: "東京DR",
      monthlyCost: 92.33,
    },
  ],
  databases: [
    {
      name: "PAY-XS-01",
      displayName: "PAY-XS-01",
      compartment: "本番-大阪",
      serviceType: "ExaDB-XS",
      serviceName: "Exadata Database Service on Exascale Infrastructure",
      lifecycle: "ACTIVE",
      health: "HEALTHY",
      backups30d: 30,
      backupSpaceGb: 368.4,
      rpoMinutes: 1,
      rtoMinutes: null,
      runtimeMinutes: 9,
      redoEnabled: true,
      realTimeProtection: true,
    },
    {
      name: "ORDER-XS-02",
      displayName: "ORDER-XS-02",
      compartment: "本番-大阪",
      serviceType: "ExaDB-XS",
      serviceName: "Exadata Database Service on Exascale Infrastructure",
      lifecycle: "ACTIVE",
      health: "HEALTHY",
      backups30d: 30,
      backupSpaceGb: 214.6,
      rpoMinutes: 1,
      rtoMinutes: null,
      runtimeMinutes: 7,
      redoEnabled: true,
      realTimeProtection: true,
    },
    {
      name: "CRM-DED-01",
      displayName: "CRM-DED-01",
      compartment: "本番-大阪",
      serviceType: "ExaDB-D",
      serviceName: "Exadata Database Service on Dedicated Infrastructure",
      lifecycle: "ACTIVE",
      health: "HEALTHY",
      backups30d: 30,
      backupSpaceGb: 486.9,
      rpoMinutes: 12,
      rtoMinutes: null,
      runtimeMinutes: 24,
      redoEnabled: true,
      realTimeProtection: true,
    },
    {
      name: "ERP-DED-02",
      displayName: "ERP-DED-02",
      compartment: "本番-大阪",
      serviceType: "ExaDB-D",
      serviceName: "Exadata Database Service on Dedicated Infrastructure",
      lifecycle: "ACTIVE",
      health: "WARNING",
      backups30d: 29,
      backupSpaceGb: 361.2,
      rpoMinutes: 180,
      rtoMinutes: null,
      runtimeMinutes: 42,
      redoEnabled: false,
      realTimeProtection: false,
    },
    {
      name: "MART-DED-03",
      displayName: "MART-DED-03",
      compartment: "東京DR",
      serviceType: "ExaDB-D",
      serviceName: "Exadata Database Service on Dedicated Infrastructure",
      lifecycle: "ACTIVE",
      health: "HEALTHY",
      backups30d: 30,
      backupSpaceGb: 298.7,
      rpoMinutes: 35,
      rtoMinutes: null,
      runtimeMinutes: 21,
      redoEnabled: false,
      realTimeProtection: false,
    },
    {
      name: "APP-BASE-01",
      displayName: "APP-BASE-01",
      compartment: "検証-大阪",
      serviceType: "BaseDB",
      serviceName: "Oracle Base Database Service",
      lifecycle: "ACTIVE",
      health: "HEALTHY",
      backups30d: 30,
      backupSpaceGb: 92.5,
      rpoMinutes: 28,
      rtoMinutes: null,
      runtimeMinutes: 12,
      redoEnabled: false,
      realTimeProtection: false,
    },
    {
      name: "DEV-BASE-02",
      displayName: "DEV-BASE-02",
      compartment: "検証-大阪",
      serviceType: "BaseDB",
      serviceName: "Oracle Base Database Service",
      lifecycle: "ACTIVE",
      health: "HEALTHY",
      backups30d: 30,
      backupSpaceGb: 58.2,
      rpoMinutes: 62,
      rtoMinutes: null,
      runtimeMinutes: 10,
      redoEnabled: false,
      realTimeProtection: false,
    },
    {
      name: "BATCH-BASE-03",
      displayName: "BATCH-BASE-03",
      compartment: "東京DR",
      serviceType: "BaseDB",
      serviceName: "Oracle Base Database Service",
      lifecycle: "ACTIVE",
      health: "WARNING",
      backups30d: 28,
      backupSpaceGb: 154.8,
      rpoMinutes: 95,
      rtoMinutes: null,
      runtimeMinutes: 19,
      redoEnabled: false,
      realTimeProtection: false,
    },
    {
      name: "REPORT-ADB-01",
      displayName: "REPORT-ADB-01",
      compartment: "東京DR",
      serviceType: "Autonomous",
      serviceName: "Autonomous Database",
      lifecycle: "ACTIVE",
      health: "HEALTHY",
      backups30d: 30,
      backupSpaceGb: 128.3,
      rpoMinutes: 15,
      rtoMinutes: null,
      runtimeMinutes: 6,
      redoEnabled: true,
      realTimeProtection: true,
    },
    {
      name: "ANALYTICS-ADB-02",
      displayName: "ANALYTICS-ADB-02",
      compartment: "東京DR",
      serviceType: "Autonomous",
      serviceName: "Autonomous Database",
      lifecycle: "ACTIVE",
      health: "HEALTHY",
      backups30d: 30,
      backupSpaceGb: 77.6,
      rpoMinutes: 18,
      rtoMinutes: null,
      runtimeMinutes: 5,
      redoEnabled: true,
      realTimeProtection: true,
    },
    {
      name: "LEGACY-DB-01",
      displayName: "LEGACY-DB-01",
      compartment: "検証-大阪",
      serviceType: "不明",
      serviceName: "サービス種別未判定",
      lifecycle: "DELETE_SCHEDULED",
      health: "ALERT",
      backups30d: 0,
      backupSpaceGb: 21.5,
      rpoMinutes: 1440,
      rtoMinutes: null,
      runtimeMinutes: null,
      redoEnabled: false,
      redoStatus: "unknown",
      realTimeProtection: null,
    },
  ],
};

const EXTERNAL_DATA =
  typeof window !== "undefined" && window.RECOVERY_DASHBOARD_DATA
    ? window.RECOVERY_DASHBOARD_DATA
    : null;
const DEFAULT_DATA = normalizeData(EXTERNAL_DATA || SAMPLE_DATA);

let dashboardData = structuredClone(DEFAULT_DATA);
let selectedCompartment = defaultCompartmentSelection(DEFAULT_DATA);
let selectedWindowDays = 30;

const COLORS = {
  active: "#3fb950",
  deleteScheduled: "#d29922",
  healthy: "#3fb950",
  warning: "#d29922",
  alert: "#f85149",
  rpo: "#d29922",
  runtime: "#58a6ff",
};

const formatter = new Intl.NumberFormat("ja-JP", {
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "code",
  maximumFractionDigits: 0,
});

const LIFECYCLE_LABELS = {
  ACTIVE: "稼働中",
  DELETE_SCHEDULED: "削除予定",
};

const HEALTH_LABELS = {
  PROTECTED: "正常",
  HEALTHY: "正常",
  WARNING: "警告",
  ALERT: "重大",
  UNKNOWN: "不明",
};

const SERVICE_LABELS = {
  "ExaDB-XS": "Exadata Database Service on Exascale Infrastructure",
  "ExaDB-D": "Exadata Database Service on Dedicated Infrastructure",
  "ExaDB-C@C": "Exadata Database Service on Cloud@Customer",
  ExaDB: "Exadata Database Service",
  BaseDB: "Oracle Base Database Service",
  Autonomous: "Autonomous Database",
  不明: "サービス種別未判定",
};

const REGION_LABELS = {
  "ap-osaka-1": "大阪 (ap-osaka-1)",
  "ap-tokyo-1": "東京 (ap-tokyo-1)",
};

function init() {
  document.getElementById("loadButton").addEventListener("click", () => {
    document.getElementById("jsonInput").click();
  });

  document
    .getElementById("jsonInput")
    .addEventListener("change", handleJsonLoad);
  document.getElementById("resetButton").addEventListener("click", () => {
    dashboardData = structuredClone(DEFAULT_DATA);
    selectedCompartment = defaultCompartmentSelection(dashboardData);
    selectedWindowDays = dashboardData.windowDays || 30;
    render();
  });

  document.querySelectorAll("[data-window]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedWindowDays = Number(button.dataset.window);
      document.querySelectorAll("[data-window]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      render();
    });
  });

  document
    .getElementById("compartmentSelect")
    .addEventListener("change", (event) => {
      selectedCompartment = event.target.value;
      render();
    });

  render();
}

function handleJsonLoad(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      dashboardData = normalizeData(parsed);
      selectedCompartment = defaultCompartmentSelection(dashboardData);
      selectedWindowDays = dashboardData.windowDays || selectedWindowDays;
      render();
    } catch (error) {
      window.alert(`JSONを読み込めませんでした: ${error.message}`);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function normalizeData(data) {
  const normalized = {
    ...SAMPLE_DATA,
    ...data,
    compartments: Array.isArray(data.compartments)
      ? data.compartments
      : SAMPLE_DATA.compartments,
    databases: Array.isArray(data.databases)
      ? data.databases
      : SAMPLE_DATA.databases,
  };

  normalized.currency = normalized.currency || "USD";
  normalized.databases = normalized.databases.map((database) => {
    const merged = {
      backups30d: 0,
      backupSpaceGb: 0,
      rpoMinutes: 0,
      rtoMinutes: 0,
      runtimeMinutes: 0,
      redoEnabled: false,
      realTimeProtection: false,
      health: "UNKNOWN",
      lifecycle: "ACTIVE",
      ...database,
    };
    const serviceType = merged.serviceType || inferServiceType(merged);
    return {
      ...merged,
      serviceType,
      serviceName:
        merged.serviceName || SERVICE_LABELS[serviceType] || serviceType,
      redoStatus:
        merged.redoStatus || (merged.redoEnabled ? "enabled" : "disabled"),
    };
  });

  return normalized;
}

function defaultCompartmentSelection(data) {
  return data.compartments?.length === 1 ? data.compartments[0].name : "ALL";
}

function displaySelectedCompartment() {
  if (selectedCompartment === "ALL") {
    return dashboardData.compartments.length === 1
      ? dashboardData.compartments[0].name
      : "全コンパートメント";
  }

  const compartment = dashboardData.compartments.find(
    (item) =>
      item.name === selectedCompartment || item.id === selectedCompartment,
  );
  return compartment?.name || selectedCompartment || "不明";
}

function getVisibleDatabases() {
  if (selectedCompartment === "ALL") return dashboardData.databases;
  return dashboardData.databases.filter(
    (database) => database.compartment === selectedCompartment,
  );
}

function render() {
  const visibleDatabases = getVisibleDatabases();
  syncWindowButtons();
  renderHeader(visibleDatabases);
  renderCompartmentSelect();
  renderMetrics(visibleDatabases);
  renderServiceSummary(visibleDatabases);
  renderServiceDatabaseGroups(visibleDatabases);
  renderLifecycle(visibleDatabases);
  renderBarChart(
    "gapChart",
    visibleDatabases,
    "rpoMinutes",
    "分",
    COLORS.rpo,
  );
  renderBarChart(
    "runtimeChart",
    visibleDatabases,
    "runtimeMinutes",
    "分",
    COLORS.runtime,
  );
  renderCompartmentUsage();
  renderCapacityLeaders(visibleDatabases);
  renderTable(visibleDatabases);
}

function syncWindowButtons() {
  document.querySelectorAll("[data-window]").forEach((button) => {
    button.classList.toggle(
      "is-active",
      Number(button.dataset.window) === selectedWindowDays,
    );
  });
}

function renderHeader(visibleDatabases) {
  document.getElementById("regionLabel").textContent = displayRegion(
    dashboardData.region,
  );
  document.getElementById("snapshotLabel").textContent =
    displaySnapshotTime(dashboardData.snapshotTime);
  document.getElementById("windowLabel").textContent =
    `${selectedWindowDays}日`;
}

function renderCompartmentSelect() {
  const select = document.getElementById("compartmentSelect");
  const currentValue = select.value || selectedCompartment;
  select.innerHTML = "";

  if (dashboardData.compartments.length !== 1) {
    select.appendChild(new Option("全コンパートメント", "ALL"));
  }
  dashboardData.compartments.forEach((compartment) => {
    select.appendChild(new Option(compartment.name, compartment.name));
  });

  select.value = currentValue;
  if (!select.value) {
    selectedCompartment = defaultCompartmentSelection(dashboardData);
    select.value = selectedCompartment;
  }
}

function renderMetrics(databases) {
  const active = databases.filter(
    (database) => database.lifecycle === "ACTIVE",
  );
  const healthy = active.filter((database) => isHealthy(database.health));
  const warnings = databases.filter(
    (database) => database.health === "WARNING",
  ).length;
  const alerts = databases.filter(
    (database) => database.health === "ALERT",
  ).length;
  const backups = databases.reduce(
    (sum, database) => sum + scaleBackups(database.backups30d),
    0,
  );
  const backupSpace = databases.reduce(
    (sum, database) => sum + database.backupSpaceGb,
    0,
  );
  const redo = active.filter((database) => database.redoEnabled).length;
  const watch = databases.filter(isWatchItem);
  const cost = getVisibleCost(databases);
  const avgRpo = average(databases.map((database) => database.rpoMinutes));

  const cards = [
    {
      label: "保護対象DB",
      value: databases.length,
      subtext: `稼働中: ${active.length}件`,
    },
    {
      label: `${selectedWindowDays}日間のバックアップ`,
      value: backups,
      subtext: `実行時間あり: ${backups}件`,
    },
    {
      label: "総バックアップ容量",
      value: `${formatter.format(backupSpace)} GB`,
      subtext: "稼働中 + 削除予定を含む",
    },
    {
      label: "REDO転送",
      value: `${redo}/${active.length || 0}`,
      subtext: `有効: ${redo}件 / 無効: ${Math.max(active.length - redo, 0)}件`,
    },
    {
      label: "月額コスト見込み",
      value: currencyFormatter.format(cost),
      subtext: `${formatter.format(backupSpace)} GB を保護中`,
    },
  ];

  document.getElementById("metricGrid").innerHTML = cards
    .map(
      (card, index) => `
        <article class="metric-card metric-accent-${index % 5} ${card.tone || ""}">
          <h2>${card.label}</h2>
          <div class="metric-value">${card.value}</div>
          <p class="metric-subtext">${card.subtext}</p>
        </article>
      `,
    )
    .join("");
}

function renderLifecycle(databases) {
  const counts = databases.reduce((accumulator, database) => {
    accumulator[database.lifecycle] =
      (accumulator[database.lifecycle] || 0) + 1;
    return accumulator;
  }, {});

  const total = Math.max(databases.length, 1);
  let current = 0;
  const segments = Object.entries(counts).map(([name, value]) => {
    const start = current;
    const degrees = (value / total) * 360;
    current += degrees;
    return `${lifecycleColor(name)} ${start}deg ${current}deg`;
  });

  const donut = document.getElementById("lifecycleDonut");
  donut.style.background = segments.length
    ? `conic-gradient(${segments.join(", ")})`
    : "rgba(255,255,255,0.08)";

  document.getElementById("lifecycleLegend").innerHTML = Object.entries(counts)
    .map(
      ([name, value]) => `
        <div class="legend-item">
          <span class="legend-swatch" style="background:${lifecycleColor(name)}"></span>
          <span>${displayLifecycle(name)}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");
}

function renderServiceSummary(databases) {
  const rows = getServiceRows(databases);
  const target = document.getElementById("serviceSummary");
  if (!rows.length) {
    target.innerHTML = `<div class="empty-state">データがありません</div>`;
    return;
  }

  const maxSpace = Math.max(...rows.map((row) => row.backupSpace), 1);
  target.innerHTML = rows
    .map((row) => {
      const redoKnown = row.redoEnabled + row.redoDisabled;
      const redoRate = redoKnown
        ? Math.round((row.redoEnabled / redoKnown) * 100)
        : 0;
      const spaceWidth = Math.max(
        (row.backupSpace / maxSpace) * 100,
        row.backupSpace ? 3 : 0,
      );
      return `
        <div class="service-summary-row ${serviceClass(row.serviceType)}">
          <div class="service-title">
            <span class="service-chip ${serviceClass(row.serviceType)}">${row.serviceType}</span>
            <strong title="${row.serviceName}">${row.serviceName}</strong>
          </div>
          <div class="service-kpis">
            <div><span>保護DB</span><strong>${row.count}</strong></div>
            <div><span>稼働中</span><strong>${row.active}</strong></div>
            <div><span>REDO有効</span><strong>${row.redoEnabled}</strong></div>
            <div><span>要確認</span><strong>${row.watch}</strong></div>
          </div>
          <div class="service-meter">
            <div class="service-meter-header">
              <span>リアルタイムREDO ${redoRate}%</span>
              <span>${formatter.format(row.backupSpace)} GB</span>
            </div>
            <div class="redo-stack" aria-label="${row.serviceType} のREDO内訳">
              <span class="redo-on" style="width:${stackWidth(row.redoEnabled, row.count)}%"></span>
              <span class="redo-off" style="width:${stackWidth(row.redoDisabled, row.count)}%"></span>
              <span class="redo-unknown" style="width:${stackWidth(row.redoUnknown, row.count)}%"></span>
            </div>
            <div class="track service-space">
              <div class="track-fill" style="width:${spaceWidth}%"></div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderServiceDatabaseGroups(databases) {
  const rows = getServiceRows(databases);
  const target = document.getElementById("serviceDatabaseGroups");
  if (!rows.length) {
    target.innerHTML = `<div class="empty-state">データがありません</div>`;
    return;
  }

  target.innerHTML = rows
    .map((row) => {
      const sorted = [...row.databases].sort((a, b) => {
        if (isWatchItem(a) !== isWatchItem(b)) return isWatchItem(a) ? -1 : 1;
        return String(a.name).localeCompare(String(b.name), "ja");
      });
      return `
        <section class="service-db-group ${serviceClass(row.serviceType)}">
          <div class="service-db-heading">
            <div>
              <span class="service-chip ${serviceClass(row.serviceType)}">${row.serviceType}</span>
              <strong>${row.count}台</strong>
            </div>
            <span>${row.redoEnabled}台 REDO有効 / ${row.redoDisabled}台 無効</span>
          </div>
          <div class="service-db-list">
            ${sorted
              .map(
                (database) => `
                  <div class="service-db-item">
                    <div class="service-db-main">
                      <strong title="${database.name}">${database.name}</strong>
                      <span>${displayLifecycle(database.lifecycle)} / ${formatDuration(database.rpoMinutes)}</span>
                    </div>
                    <div class="service-db-badges">
                      <span
                        class="redo-icon ${redoIconClass(database)}"
                        title="${displayRedo(database)}"
                        aria-label="${displayRedo(database)}"
                      >
                        <span class="sr-only">${displayRedo(database)}</span>
                      </span>
                    </div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderBarChart(targetId, databases, key, suffix, color) {
  const target = document.getElementById(targetId);
  if (!databases.length) {
    target.innerHTML = `<div class="empty-state">データがありません</div>`;
    return;
  }

  const values = databases.map((database) => Number(database[key]) || 0);
  const max = Math.max(...values, 1);
  const axisMax = niceMax(max);
  const axisValues = [
    axisMax,
    axisMax * 0.75,
    axisMax * 0.5,
    axisMax * 0.25,
    0,
  ];
  const axis = getChartAxis(key, axisMax, suffix);

  target.innerHTML = `
    <div class="chart-axis">
      <span class="axis-unit">単位: ${axis.unit}</span>
      <div class="axis-scale">
        ${axisValues.map((value) => `<span>${axis.format(value)}</span>`).join("")}
      </div>
    </div>
    <div class="chart-scroll" style="--bar-count:${databases.length}">
      <div class="chart-bars">
        ${databases
          .map((database) => {
            const value = Number(database[key]) || 0;
            const height = Math.max((value / axisMax) * 100, value > 0 ? 3 : 0);
            return `
              <div class="chart-bar" title="${database.name}: ${formatChartValue(value, suffix)}">
                <div class="chart-bar-fill" style="height:${height}%; background:${color}"></div>
              </div>
            `;
          })
          .join("")}
      </div>
      <div class="chart-labels">
        ${databases
          .map((database) => {
            const value = Number(database[key]) || 0;
            return `
              <span class="chart-label" title="${database.name}">
                <strong>${shortDatabaseLabel(database)}</strong>
                <small>${formatChartValue(value, suffix)}</small>
              </span>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderCompartmentUsage() {
  const rows = dashboardData.compartments.map((compartment) => {
    const databases = dashboardData.databases.filter(
      (database) => database.compartment === compartment.name,
    );
    const backupSpace = databases.reduce(
      (sum, database) => sum + database.backupSpaceGb,
      0,
    );
    const cost = compartment.monthlyCost || estimateCost(backupSpace);
    return { ...compartment, backupSpace, cost };
  });
  const maxSpace = Math.max(...rows.map((row) => row.backupSpace), 1);

  document.getElementById("compartmentUsage").innerHTML = rows
    .map(
      (row) => `
        <div class="usage-row">
          <div class="usage-name" title="${row.name}">${row.name}</div>
          <div class="track" aria-label="${row.name} のバックアップ容量">
            <div class="track-fill" style="width:${(row.backupSpace / maxSpace) * 100}%"></div>
          </div>
          <div class="usage-value">
            ${formatter.format(row.backupSpace)} GB
            <span>月額 ${currencyFormatter.format(row.cost)}</span>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderCapacityLeaders(databases) {
  const rows = [...databases]
    .sort((a, b) => (Number(b.backupSpaceGb) || 0) - (Number(a.backupSpaceGb) || 0))
    .slice(0, 6);
  const target = document.getElementById("capacityList");

  if (!rows.length) {
    target.innerHTML = `<div class="empty-state">データがありません</div>`;
    return;
  }

  const maxSpace = Math.max(...rows.map((database) => Number(database.backupSpaceGb) || 0), 1);
  target.innerHTML = rows
    .map((database, index) => {
      const width = Math.max(((Number(database.backupSpaceGb) || 0) / maxSpace) * 100, 3);
      return `
        <div class="capacity-row ${serviceClass(database.serviceType)}">
          <div class="capacity-rank">${index + 1}</div>
          <div class="capacity-main">
            <div class="capacity-heading">
              <strong title="${database.name}">${database.name}</strong>
              <span class="service-chip ${serviceClass(database.serviceType)}">${database.serviceType}</span>
            </div>
            <div class="track capacity-track">
              <div class="track-fill" style="width:${width}%"></div>
            </div>
          </div>
          <div class="capacity-meta">
            <strong>${formatter.format(database.backupSpaceGb)} GB</strong>
            <span
              class="redo-icon ${redoIconClass(database)}"
              title="${displayRedo(database)}"
              aria-label="${displayRedo(database)}"
            >
              <span class="sr-only">${displayRedo(database)}</span>
            </span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderTable(databases) {
  const serviceRows = getServiceRows(databases);
  const totalWatch = databases.filter(isWatchItem).length;

  document.getElementById("reviewCount").textContent =
    `全${databases.length}件 / 要確認 ${totalWatch}件`;
  document.getElementById("databaseRows").innerHTML = serviceRows
    .map((service) => {
      const sorted = [...service.databases].sort((a, b) => {
        if (isWatchItem(a) !== isWatchItem(b)) return isWatchItem(a) ? -1 : 1;
        return (Number(b.rpoMinutes) || 0) - (Number(a.rpoMinutes) || 0);
      });

      return `
        <tr class="service-table-row ${serviceClass(service.serviceType)}">
          <td colspan="10">
            <div>
              <span class="service-chip ${serviceClass(service.serviceType)}">${service.serviceType}</span>
              <strong>${service.serviceName}</strong>
              <span>${service.count}台 / REDO有効 ${service.redoEnabled}台 / 要確認 ${service.watch}台</span>
            </div>
          </td>
        </tr>
        ${sorted
          .map(
            (database) => `
        <tr>
          <td>${database.name}</td>
          <td>${database.serviceType}</td>
          <td>${database.compartment}</td>
          <td>${displayLifecycle(database.lifecycle)}</td>
          <td><span class="badge ${healthClass(database.health)}">${displayHealth(database.health)}</span></td>
          <td>${formatDuration(database.rpoMinutes)}</td>
          <td>${formatDuration(database.rtoMinutes)}</td>
          <td>${formatter.format(database.backupSpaceGb)} GB</td>
          <td>${scaleBackups(database.backups30d)}</td>
          <td>${displayRedo(database).replace("REDO", "")}</td>
        </tr>
      `,
          )
          .join("")}
      `;
    })
    .join("");
}

function scaleBackups(backups30d) {
  return Math.round(((Number(backups30d) || 0) / 30) * selectedWindowDays);
}

function getVisibleCost(databases) {
  if (selectedCompartment === "ALL") {
    return dashboardData.compartments.reduce((sum, compartment) => {
      if (compartment.monthlyCost) return sum + compartment.monthlyCost;
      const compartmentDatabases = dashboardData.databases.filter(
        (database) => database.compartment === compartment.name,
      );
      const backupSpace = compartmentDatabases.reduce(
        (subtotal, database) => subtotal + database.backupSpaceGb,
        0,
      );
      return sum + estimateCost(backupSpace);
    }, 0);
  }

  const compartment = dashboardData.compartments.find(
    (item) => item.name === selectedCompartment,
  );
  if (compartment?.monthlyCost) return compartment.monthlyCost;

  const backupSpace = databases.reduce(
    (sum, database) => sum + database.backupSpaceGb,
    0,
  );
  return estimateCost(backupSpace);
}

function estimateCost(backupSpaceGb) {
  return backupSpaceGb * 0.14;
}

function getServiceRows(databases) {
  const groups = databases.reduce((accumulator, database) => {
    const serviceType = database.serviceType || inferServiceType(database);
    if (!accumulator.has(serviceType)) {
      accumulator.set(serviceType, {
        serviceType,
        serviceName:
          database.serviceName || SERVICE_LABELS[serviceType] || serviceType,
        databases: [],
      });
    }
    accumulator.get(serviceType).databases.push(database);
    return accumulator;
  }, new Map());

  return [...groups.values()]
    .map((group) => {
      const databasesInService = group.databases;
      return {
        ...group,
        count: databasesInService.length,
        active: databasesInService.filter(
          (database) => database.lifecycle === "ACTIVE",
        ).length,
        redoEnabled: databasesInService.filter(isRedoEnabled).length,
        redoDisabled: databasesInService.filter(
          (database) => redoStatus(database) === "disabled",
        ).length,
        redoUnknown: databasesInService.filter(
          (database) => redoStatus(database) === "unknown",
        ).length,
        watch: databasesInService.filter(isWatchItem).length,
        backupSpace: databasesInService.reduce(
          (sum, database) => sum + (Number(database.backupSpaceGb) || 0),
          0,
        ),
      };
    })
    .sort((a, b) => serviceRank(a.serviceType) - serviceRank(b.serviceType));
}

function serviceRank(serviceType) {
  const order = [
    "ExaDB-XS",
    "ExaDB-D",
    "ExaDB-C@C",
    "ExaDB",
    "BaseDB",
    "Autonomous",
    "不明",
  ];
  const rank = order.indexOf(serviceType);
  return rank === -1 ? order.length : rank;
}

function serviceClass(serviceType) {
  const classes = {
    "ExaDB-XS": "service-exadb-xs",
    "ExaDB-D": "service-exadb-d",
    "ExaDB-C@C": "service-exadb-c-at-c",
    ExaDB: "service-exadb",
    BaseDB: "service-basedb",
    Autonomous: "service-autonomous",
    不明: "service-unknown",
  };
  return classes[serviceType] || "service-unknown";
}

function stackWidth(value, total) {
  if (!total || !value) return 0;
  return Math.max((value / total) * 100, 3);
}

function inferServiceType(database) {
  const infrastructureId = String(
    database.infrastructureId || "",
  ).toLowerCase();
  if (database.dbSystemId || infrastructureId.includes("dbsystem"))
    return "BaseDB";
  if (infrastructureId.includes("exadbvmcluster")) {
    return "ExaDB-XS";
  }
  if (infrastructureId.includes("cloudvmcluster")) {
    return "ExaDB-D";
  }
  if (infrastructureId.includes(".vmcluster.")) return "ExaDB-C@C";
  if (infrastructureId.includes("autonomous")) return "Autonomous";
  return "不明";
}

function isWatchItem(database) {
  return (
    !isHealthy(database.health) ||
    database.rpoMinutes > 60 ||
    database.lifecycle !== "ACTIVE"
  );
}

function isHealthy(health) {
  return health === "HEALTHY" || health === "PROTECTED";
}

function lifecycleColor(lifecycle) {
  if (lifecycle === "ACTIVE") return COLORS.active;
  if (lifecycle === "DELETE_SCHEDULED") return COLORS.deleteScheduled;
  return "#7ca7ff";
}

function displayLifecycle(lifecycle) {
  return LIFECYCLE_LABELS[lifecycle] || lifecycle || "不明";
}

function displayHealth(health) {
  return HEALTH_LABELS[health] || health || "不明";
}

function displayRegion(region) {
  return REGION_LABELS[region] || region || "不明";
}

function displaySnapshotTime(snapshotTime) {
  if (!snapshotTime) return "不明";
  if (String(snapshotTime).includes("JST")) return snapshotTime;

  const utcMatch = String(snapshotTime).match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2})?\s*UTC$/,
  );
  if (!utcMatch) return snapshotTime;

  const [, year, month, day, hour, minute] = utcMatch.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replaceAll("/", "-")
    .replace(" ", " ") + " JST";
}

function shortDatabaseLabel(database) {
  const displayName = database.displayName || database.name;
  if (!displayName) return "不明";
  if (String(displayName).length <= 12) return displayName;
  return String(displayName).replace(/_kix$/i, "").slice(0, 12);
}

function formatChartValue(value, suffix) {
  if (suffix === "分") return formatDuration(value);
  return `${formatter.format(value)} ${suffix}`;
}

function getChartAxis(key, axisMax, suffix) {
  if (key === "rpoMinutes") {
    if (axisMax >= 1440) {
      return {
        unit: "日",
        format: (value) => compactAxisNumber(value / 1440),
      };
    }
    if (axisMax >= 60) {
      return {
        unit: "時間",
        format: (value) => compactAxisNumber(value / 60),
      };
    }
  }

  return {
    unit: suffix,
    format: (value) => compactAxisNumber(value),
  };
}

function compactAxisNumber(value) {
  if (value === 0) return "0";
  if (Math.abs(value) >= 100) return formatter.format(Math.round(value));
  if (Math.abs(value) >= 10) return formatter.format(Math.round(value));
  return formatter.format(Math.round(value * 10) / 10);
}

function healthClass(health) {
  if (isHealthy(health)) return "ok";
  if (health === "WARNING") return "warn";
  return "alert";
}

function redoStatus(database) {
  if (database.redoStatus) return database.redoStatus;
  if (database.redoEnabled === true) return "enabled";
  if (database.redoEnabled === false) return "disabled";
  return "unknown";
}

function isRedoEnabled(database) {
  return redoStatus(database) === "enabled";
}

function displayRedo(database) {
  const status = redoStatus(database);
  if (status === "enabled") return "REDO有効";
  if (status === "disabled") return "REDO無効";
  return "REDO不明";
}

function redoClass(database) {
  const status = redoStatus(database);
  if (status === "enabled") return "ok";
  if (status === "disabled") return "warn";
  return "alert";
}

function redoIconClass(database) {
  return `redo-${redoStatus(database)}`;
}

function average(values) {
  const numeric = values
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map(Number)
    .filter((value) => Number.isFinite(value));
  if (!numeric.length) return null;
  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}

function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || minutes === "")
    return "未設定";
  const rounded = Math.round(Number(minutes) || 0);
  if (rounded < 1) return "1分未満";
  if (rounded < 60) return `${rounded}分`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest ? `${hours}時間 ${rest}分` : `${hours}時間`;
}

function niceMax(value) {
  if (value <= 10) return 10;
  if (value <= 60) return 60;
  if (value <= 120) return 120;
  if (value <= 240) return 240;
  return Math.ceil(value / 100) * 100;
}

init();
