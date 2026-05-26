# OCI Recovery Service Dashboard

OCI Recovery Service の保護状況を、ローカル JSON から表示する静的ダッシュボードです。

GitHub Pages やローカルのブラウザで `index.html` を開き、`JSON読込` から手元のデータを読み込むだけで表示できます。実環境の OCID や DB 名を GitHub に置かない運用を想定しています。

## 使い方

1. `index.html` をブラウザで開く
2. `JSON読込` を押す
3. 取得済みの `dashboard-data.json` を選択する

サンプルデータは `samples/sample-data.json` にあります。

## データ取得

Oracle MCP リポジトリと OCI CLI 認証が設定済みの場合、次のように JSON を作成できます。

```bash
python scripts/fetch_oci_recovery_data.py \
  --compartment "<compartment OCID or display name>" \
  --region ap-osaka-1 \
  --output dashboard-data.json
```

Oracle MCP サーバーの場所が標準と違う場合は、環境変数かオプションで指定します。

```bash
export ORACLE_MCP_REPO=/path/to/oracle/mcp/src/oci-recovery-mcp-server
python scripts/fetch_oci_recovery_data.py \
  --compartment "<compartment OCID or display name>" \
  --region ap-osaka-1 \
  --output dashboard-data.json
```

## 公開時の注意

`dashboard-data.json` や `dashboard-data.js` には実環境の情報が含まれる可能性があります。公開リポジトリにはコミットせず、手元で読み込む運用にしてください。

取得スクリプトは標準では raw API ペイロードを出力しません。デバッグ目的で `--include-raw` を使う場合、その出力は特に公開しないでください。

## 表示できる主な情報

- 保護対象 DB 数、バックアップ回数、総バックアップ容量
- サービス別サマリ: ExaDB-XS、ExaDB-D、BaseDB など
- リアルタイム REDO の有効、無効、不明の割合
- バックアップ間隔ウォッチ
- 保護データ量が多い DB
- サービス別にグループ化した DB 一覧
