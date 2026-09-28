# 既存アプリ詳細設計書

> 文書の記入項目とID規則は[ドキュメント項目定義](../document-items.md)を参照してください。

## 1. サーバーモジュール

### DD-001 Expressアプリ

対象：`src/app.ts`

- `express()`で生成した`app`をexportします。
- JSONボディパーサーを有効にします。
- `/health`、`/api/portal`、`/assets`、`/`の順にルートを設定します。
- `public/`の絶対パスは`import.meta.url`から解決します。

### DD-002 サーバー起動

対象：`src/server.ts`、`src/server-port.ts`

- `PORT`未指定時は`4174`を使用します。
- `PORT`は数字だけの文字列かつ65535以下とします。
- ポート値の変換と検証は`parseServerPort`へ分離します。
- `127.0.0.1`で待ち受けます。
- 起動成功時はURLと用途を標準出力へ表示します。
- 起動失敗時はエラーを標準エラーへ表示します。
- `SIGINT`、`SIGTERM`でサーバーを閉じます。

### DD-003 ポータルデータ

対象：`src/portal.ts`

```text
CategoryId = "account" | "network" | "device"
PortalContent = {
  categories: Category[]
  articles: Article[]
  notices: Notice[]
  guides: Guide[]
}
```

`GuideNode`は質問ノードと結果ノードの判別可能なUnionとします。

## 2. HTTP契約

| ID | Method / Path | 処理 | 正常結果 |
|---|---|---|---|
| DD-004 | `GET /health` | 固定の稼働状態を返す | JSON `{"status":"ok"}` |
| DD-005 | `GET /api/portal` | `portalContent`を返す | JSON、`Cache-Control: no-store` |
| DD-006 | `GET /assets/*` | `public/`配下を静的配信 | 対応するファイル |
| DD-007 | `GET /` | `public/index.html`を返す | HTML、`Cache-Control: no-store` |

## 3. クライアント状態

対象：`public/portal.js`

| 変数 | 内容 |
|---|---|
| `content` | APIから取得したポータルデータ |
| `currentGuide` | 選択中の解決ナビ |
| `currentNode` | 表示中のナビノードID |
| `guideHistory` | 通過した質問ノードと回答 |
| `draft` | 生成した件名と本文 |
| `activePanel` | 表示中のパネル名 |

状態はブラウザーのメモリだけで保持し、再読込時に破棄します。

## 4. クライアント関数

DOMや通信に依存しない処理は`public/portal-core.js`へ分離し、`globalThis.portalCore`から利用します。`public/portal.js`は画面描画、イベント処理、API読込を担当します。

| ID | 関数 | 入力・参照 | 処理・出力 |
|---|---|---|---|
| DD-008 | `resolvePanel`、`activatePanel` | `location.hash`、表示可能なパネル | 対象パネルを決定し、ナビ状態を更新 |
| DD-009 | `populateCategories` | select ID、全件選択肢の有無 | カテゴリのoptionを生成 |
| DD-010 | `normalize` | 文字列 | NFKC正規化と日本語ロケールの小文字化 |
| DD-011 | `filterArticles`、`renderArticles` | 検索語、カテゴリ、FAQ | 絞り込んだFAQと件数を描画 |
| DD-012 | `filterNotices`、`renderNotices` | カテゴリ、お知らせ | 公開日降順で絞り込み描画 |
| DD-013 | `startGuide`、`resetGuide` | 選択したナビ | 開始ノードと履歴を初期化 |
| DD-014 | `advanceGuide`、`backGuide`、`renderGuide` | 現在ノード、履歴 | 履歴を更新し、質問または結果を描画 |
| DD-015 | `renderContact` | 選択カテゴリ | 窓口情報を描画 |
| DD-016 | `clearDraft` | なし | 下書きと表示状態を初期化 |
| DD-017 | `validateDraftInput`、`createDraftContent`、`createDraft` | フォーム入力 | 検証後、件名・本文・mailtoを生成 |
| DD-018 | `copyDraft` | 現在の下書き | クリップボードへコピー |
| DD-019 | `loadPortal` | `/api/portal` | 取得、初期化、エラー表示 |

## 5. FAQ検索詳細

- 入力値をNFKC正規化し、小文字化します。
- 前後空白を除き、1つ以上の空白で検索語へ分割します。
- 空の検索語は除外します。
- タイトル、概要、タグ、手順を連結した文字列を検索対象にします。
- 全検索語を含み、かつカテゴリ条件を満たすFAQだけを表示します。

## 6. お知らせ詳細

- 元配列を変更しないようコピーしてから並べ替えます。
- `publishedOn`を文字列比較し、降順にします。
- プレビューには先頭3件を表示します。
- プレビュー選択時は絞り込みを解除して対象のお知らせを開きます。

## 7. 解決ナビ詳細

- ナビ選択時に`start`を現在ノードとします。
- 質問回答時に、現在ノードIDと回答表示名を履歴へ追加します。
- 選択肢の`next`を次の現在ノードとします。
- 戻る操作では履歴末尾を削除し、そのノードへ戻ります。
- リセットでは開始ノードへ戻り、履歴を空にします。
- 結果から相談へ進む場合、回答履歴を複数行の文字列へ変換します。

## 8. メール下書き詳細

### DD-020 入力検証

| 項目 | 正規化 | 条件 |
|---|---|---|
| 概要 | trim後、連続空白を1つへ変換 | 1〜100文字 |
| 相談内容 | trim | 1〜2000文字 |

不正な場合は下書きを生成せず、エラーを表示して該当項目へフォーカスします。

### DD-021 出力

件名：

```text
[IT相談／{カテゴリ表示名}] {概要}
```

本文：

```text
{担当チーム} ご担当者様

以下の件について相談します。

【相談カテゴリ】
{カテゴリ表示名}

【相談内容・確認したこと】
{相談内容}

よろしくお願いいたします。
```

`mailto:`では、本文の改行をCRLFへ変換し、件名と本文をURLエンコードします。

## 9. API読込詳細

- 読込開始時に操作を無効化し、`aria-busy`を有効にします。
- `AbortController`を使用し、10秒後に中断します。
- HTTPステータスが成功でない場合は失敗とします。
- 成功後にカテゴリ、FAQ、お知らせ、ナビ、窓口を初期化します。
- 失敗時は再読込ボタンを表示します。
- 成否にかかわらずタイマーと`aria-busy`を解除します。

## 10. 詳細設計と単体テスト

| 詳細設計 | 単体テスト |
|---|---|
| DD-002 | UT-013、UT-014 |
| DD-008 | UT-001、UT-002 |
| DD-010、DD-011 | UT-003〜UT-006 |
| DD-012 | UT-007、UT-008 |
| DD-013、DD-014 | UT-009、UT-010 |
| DD-017、DD-020、DD-021 | UT-011、UT-012 |
| DD-019 | UT-015、UT-016 |
