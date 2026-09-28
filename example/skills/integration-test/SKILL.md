---
name: integration-test
description: 基本設計に対応するAPI、画面、データ、モジュール間の連携テストを作成・実行するときに使用する。
---

## 使用する場面

複数の構成要素を組み合わせ、インターフェースとデータ連携を検証するときに使用する。

## 進め方

1. `docs/test-standards.md` の共通ルールと結合テストのゴールを確認する。
2. 基本設計IDと結合する構成要素を確認する。
3. 正常時とエラー時の操作、入力、期待結果を整理する。
4. テストを作成・実行し、契約とデータの整合性を記録する。
5. 標準出力・標準エラーを含む実行ログを`docs/integration-test/evidence/`へ保存する。
6. `docs/integration-test/integration-test-spec.md`の`実施証跡`へ、実行日時、対象Commit SHA、コマンド、終了コード、成功・失敗・未実施件数、証跡ファイル、結果を追記する。

## 参照資料・判断基準

`docs/test-standards.md`、`docs/basic-design/basic-design.md`、`docs/integration-test/integration-test-spec.md` を参照し、規約と設計した連携との一致で判定する。

## 出力形式

結合テスト仕様書とテストコードを更新し、ケースID、対応設計ID、実測結果、再実行可能な実施証跡を記載する。

## 完了・停止条件

対象連携を実行し、規約のゴールと結果を説明できたら完了する。未実施や仕様不明は成功扱いにしない。
