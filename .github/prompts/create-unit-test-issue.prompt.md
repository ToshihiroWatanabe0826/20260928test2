# 単体テストIssueを作成する

現在のリポジトリに、詳細設計と実装をもとに社内問い合わせ管理機能の単体テストを作成・実行するIssueを作成してください。ローカルのファイルは変更しないでください。

## 対象

- 入力: `docs/detailed-design/detailed-design.md`、対象コード
- 成果物: `docs/unit-test/unit-test-spec.md`、単体テストコード、実測結果
- 結合テスト、システムテストには進まない。

## 実行条件

- Issueタイトルを`[単体テスト]`で始める。
- Issue本文に、工程が単体テスト、使用するAgentとSkillが`unit-test`、base branchが`master`であることを記載する。
- Issue本文に、対象UTの実行コマンドを必ず打鍵し、終了コードと成功・失敗件数を実測結果として記録するよう記載する。
- Issue本文に、実行ログを`docs/unit-test/evidence/`へ保存し、実測結果と証跡ファイルを`docs/unit-test/unit-test-spec.md`の`実施証跡`へ追記するよう記載する。
- Issue本文で、テスト仕様・コード・結果を更新するドラフトPull Requestを作成するよう依頼する。
- `origin/master`が存在しない場合や、Issue作成に失敗した場合は、理由を報告して停止する。

完了後は、Issue番号、URL、base branchを返してください。
