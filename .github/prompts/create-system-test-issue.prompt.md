# システムテストIssueを作成する

現在のリポジトリに、要件と実装をもとに社内問い合わせ管理機能のシステムテストを作成・実行するIssueを作成してください。ローカルのファイルは変更しないでください。

## 対象

- 入力: `docs/requirements/requirements.md`、対象アプリ
- 成果物: `docs/system-test/system-test-spec.md`、必要なテストコード、実測結果
- 要件にない合否基準は追加しない。

## 実行条件

- Issueタイトルを`[システムテスト]`で始める。
- Issue本文に、工程がシステムテスト、使用するAgentとSkillが`system-test`、base branchが`master`であることを記載する。
- Issue本文に、Playwrightの実行ログと主要シナリオの画面画像を`docs/system-test/evidence/`へ保存し、実測結果と証跡ファイルを`docs/system-test/system-test-spec.md`の`実施証跡`へ追記するよう記載する。
- Issue本文で、テスト仕様・結果を更新するドラフトPull Requestを作成するよう依頼する。
- `origin/master`が存在しない場合や、Issue作成に失敗した場合は、理由を報告して停止する。

完了後は、Issue番号、URL、base branchを返してください。
