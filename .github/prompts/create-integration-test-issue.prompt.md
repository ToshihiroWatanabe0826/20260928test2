# 結合テストIssueを作成する

現在のリポジトリに、基本設計と実装をもとに社内問い合わせ管理機能の結合テストを作成・実行するIssueを作成してください。ローカルのファイルは変更しないでください。

## 対象

- 入力: `docs/basic-design/basic-design.md`、対象コード
- 成果物: `docs/integration-test/integration-test-spec.md`、結合テストコード、実測結果
- システムテストには進まない。

## 実行条件

- Issueタイトルを`[結合テスト]`で始める。
- Issue本文に、工程が結合テスト、使用するAgentとSkillが`integration-test`、base branchが`master`であることを記載する。
- Issue本文に、実行ログを`docs/integration-test/evidence/`へ保存し、実測結果と証跡ファイルを`docs/integration-test/integration-test-spec.md`の`実施証跡`へ追記するよう記載する。
- Issue本文で、テスト仕様・コード・結果を更新するドラフトPull Requestを作成するよう依頼する。
- `origin/master`が存在しない場合や、Issue作成に失敗した場合は、理由を報告して停止する。

完了後は、Issue番号、URL、base branchを返してください。
