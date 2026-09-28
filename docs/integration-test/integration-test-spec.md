# 既存アプリ結合テスト仕様書

> 文書の記入項目とID規則は[ドキュメント項目定義](../document-items.md)を参照してください。

## 1. 目的

Expressアプリ、ポータルデータ、HTML、JavaScript、CSSの結合とHTTP契約を確認します。

## 2. 対象

- Expressルーティング
- ポータル固定データと参照整合性
- HTML・静的ファイル配信
- `portal-core.js`と`portal.js`の読込契約
- ポータルAPI失敗後の画面再試行

## 3. 実行方法

```text
npm run test:integration
```

VitestとSupertestを使用し、実サーバーのポートを開かずに`app`へHTTPリクエストを行います。クライアントのAPI失敗・再試行は最小DOMハーネスで確認します。

## 4. テストケース

| ID | 結合対象 | 操作 | 期待結果 | 対応基本設計 | 自動化 |
|---|---|---|---|---|---|
| IT-001 | App＋healthルート | `GET /health` | HTTP 200、`{"status":"ok"}` | BD-001 | 済 |
| IT-002 | App＋ポータルデータ | `GET /api/portal` | HTTP 200、JSON、`no-store` | BD-001、BD-002 | 済 |
| IT-003 | App＋HTML | `GET /` | HTTP 200、HTML、日本語設定、main要素 | BD-001、BD-003 | 済 |
| IT-004 | HTML＋JavaScript | HTMLと2つのJavaScriptを取得 | 参照が存在し、構文エラーがない | BD-001、BD-003、BD-004 | 済 |
| IT-005 | HTML＋CSS | HTMLとCSSを取得 | 参照が存在し、CSSとして配信される | BD-001、BD-003、BD-005 | 済 |
| IT-006 | API＋固定データ | ポータルデータを取得 | カテゴリ3件、FAQ6件、お知らせ3件、ナビ2件 | BD-002 | 済 |
| IT-007 | FAQ・お知らせ＋カテゴリ | 全レコードを検査 | IDが一意で、カテゴリ参照と必須内容が有効 | BD-002 | 済 |
| IT-008 | 解決ナビ内部参照 | 全経路を探索 | 循環、参照切れ、未到達ノードがない | BD-002 | 済 |
| IT-009 | 解決ナビ＋FAQ・カテゴリ | 結果ノードを検査 | 関連FAQとカテゴリが存在する | BD-002 | 済 |
| IT-010 | カテゴリ＋相談窓口 | 全カテゴリを検査 | チーム、受付時間、架空メールが存在する | BD-002 | 済 |
| IT-011 | API＋固定データ | APIを2回取得 | 2回の応答内容が同一 | BD-001、BD-002 | 済 |
| IT-012 | API失敗＋画面 | 初回取得を失敗させ、再試行する | 日本語エラーと再読込を表示し、復旧後に初期化する | BD-003、BD-004 | 済 |

## 5. 実装テストとの対応

| テストファイル | 主なケース |
|---|---|
| `tests/health.test.ts` | IT-001 |
| `tests/portal.test.ts` | IT-002、IT-006〜IT-011 |
| `tests/ui.test.ts` | IT-003〜IT-005 |
| `tests/portal-client.test.ts` | IT-012 |

## 6. 完了条件

- 自動化済みケースがすべて成功します。
- HTTPステータス、Content-Type、キャッシュ設定、参照関係を確認します。
- 標準出力・標準エラーを含むログを`docs/integration-test/evidence/`へ保存します。
- 実行日時、対象実装Commit、コマンド、件数、証跡ファイルを実施証跡へ記録します。

## 7. 実施証跡

| 実行日時 | 対象実装Commit | コマンド | 終了コード | 成功 | 失敗 | 未実施 | 証跡ファイル | 結果 |
|---|---|---|---:|---:|---:|---:|---|---|
| 2026-09-27 16:36 JST | `skeleton-refresh`作業ツリー（base `24c251e`） | `npm run test:integration` | 0 | 10 | 0 | 0 | `evidence/integration-test-20260927.log` | 成功 |
