type CategoryId = "account" | "network" | "device";

interface Category {
  id: CategoryId;
  label: string;
  team: string;
  email: string;
  hours: string;
}

interface Article {
  id: string;
  category: CategoryId;
  title: string;
  summary: string;
  tags: string[];
  steps: string[];
}

interface Notice {
  id: string;
  category: CategoryId;
  kind: string;
  publishedOn: string;
  title: string;
  summary: string;
  details: string[];
}

type GuideNode =
  | { kind: "question"; title: string; choices: { label: string; next: string }[] }
  | { kind: "result"; title: string; steps: string[]; articleId: string; category: CategoryId };

interface Guide {
  id: string;
  title: string;
  start: string;
  nodes: Record<string, GuideNode>;
}

export interface PortalContent {
  categories: Category[];
  articles: Article[];
  notices: Notice[];
  guides: Guide[];
}

export const portalContent: PortalContent = {
  categories: [
    { id: "account", label: "アカウント・認証", team: "アカウントサポート", email: "account-help@example.com", hours: "平日 9:00–17:30" },
    { id: "network", label: "ネットワーク・VPN", team: "ネットワークサポート", email: "network-help@example.com", hours: "平日 9:00–18:00" },
    { id: "device", label: "PC・周辺機器・アプリ", team: "ITサービスデスク", email: "it-help@example.com", hours: "平日 9:00–18:00" }
  ],
  articles: [
    {
      id: "vpn-connection", category: "network", title: "VPNに接続できないとき",
      summary: "接続環境と表示メッセージを確認して、原因を切り分けます。",
      tags: ["VPN", "在宅勤務", "接続"],
      steps: ["通常のWebサイトが開くか確認し、インターネット接続を切り分けます。", "ポータルのお知らせで、VPNのメンテナンス予定を確認します。", "指定のVPNアプリと接続先を確認し、一度接続をやり直します。", "改善しない場合は発生時刻とエラーメッセージを控え、ネットワークサポートへ相談します。"]
    },
    {
      id: "wifi-connection", category: "network", title: "社内Wi-Fiにつながらないとき",
      summary: "接続先や利用場所を確認する基本手順です。",
      tags: ["Wi-Fi", "無線", "オフィス"],
      steps: ["機内モードが無効で、Wi-Fiが有効になっていることを確認します。", "会社指定のネットワーク名を選択しているか確認します。", "他の場所でも同じ症状か確認します。認証情報を共有する必要はありません。", "利用場所・端末名・発生時刻を添えてネットワークサポートへ相談します。"]
    },
    {
      id: "password-reset", category: "account", title: "パスワードを忘れたとき",
      summary: "本人確認を伴う正規のリセット手順を案内します。",
      tags: ["パスワード", "サインイン", "ログイン"],
      steps: ["組織指定のサインイン画面から、パスワードのリセット手続きを選びます。", "画面に表示された本人確認の手順に従います。", "手続きが進まない場合はアカウントサポートへ相談します。", "パスワードや認証コードは、メール本文やチャットに記載しないでください。"]
    },
    {
      id: "mfa-device", category: "account", title: "認証用の端末を変更したい",
      summary: "機種変更の前に確認しておくことをまとめています。",
      tags: ["MFA", "認証", "機種変更"],
      steps: ["旧端末を利用できるうちに、組織の認証方法変更手順を確認します。", "指定された方法で新しい端末を登録し、利用できることを確認します。", "旧端末が利用できない場合は、アカウントサポートへ本人確認を依頼します。", "認証コードを第三者へ渡したり、セキュリティ設定を独断で無効にしたりしないでください。"]
    },
    {
      id: "printer-connection", category: "device", title: "プリンターから出力されない",
      summary: "出力先と印刷待ちの状態を確認します。",
      tags: ["印刷", "プリンター", "周辺機器"],
      steps: ["選択しているプリンター名と設置場所を確認します。", "プリンターの表示に用紙切れやエラーがないか確認します。", "自分の印刷ジョブの状態を確認します。他の人のジョブは操作しません。", "プリンター名・発生時刻・表示メッセージを控えてITサービスデスクへ相談します。"]
    },
    {
      id: "software-request", category: "device", title: "業務アプリを利用したい",
      summary: "新しいアプリの利用相談に必要な情報を確認できます。",
      tags: ["アプリ", "ソフトウェア", "ライセンス"],
      steps: ["アプリ名・利用目的・利用人数・希望時期を整理します。", "配布済みの標準アプリで対応できないか確認します。", "ITサービスデスクへ、ライセンスと利用条件の確認を依頼します。", "確認が完了するまでは、独自にインストールや契約をしないでください。"]
    }
  ],
  notices: [
    {
      id: "vpn-maintenance", category: "network", kind: "メンテナンス", publishedOn: "2026-09-24",
      title: "9/28 夜間 VPNサービスのメンテナンス",
      summary: "20:00–21:00の間、一時的に接続できなくなる予定です。",
      details: ["対象はリモート接続用VPNです。作業前に編集中のデータを保存してください。", "終了予定時刻を過ぎても接続できない場合は、VPNの確認手順をご覧ください。"]
    },
    {
      id: "authentication-guide", category: "account", kind: "手順更新", publishedOn: "2026-09-22",
      title: "認証用端末の変更手順を更新しました",
      summary: "機種変更前の確認事項をFAQへ追加しました。",
      details: ["FAQの「認証用の端末を変更したい」から手順をご確認ください。", "旧端末が利用できない場合の相談先も案内しています。"]
    },
    {
      id: "onboarding", category: "device", kind: "ご案内", publishedOn: "2026-09-18",
      title: "新入社員向け PC・アプリ準備のご案内",
      summary: "業務開始前に、必要な機器とアプリをご確認ください。",
      details: ["利用するアプリや周辺機器を所属チームへ確認してください。", "追加のアプリが必要な場合は、利用目的と希望時期を添えてITサービスデスクへ相談してください。"]
    }
  ],
  guides: [
    {
      id: "vpn", title: "VPNに接続できない", start: "internet",
      nodes: {
        internet: {
          kind: "question", title: "通常のWebサイトは開けますか？",
          choices: [{ label: "開ける", next: "message" }, { label: "開けない", next: "connection" }]
        },
        message: {
          kind: "question", title: "認証やサインインに関するエラーですか？",
          choices: [{ label: "認証のエラーが表示される", next: "authentication" }, { label: "それ以外・分からない", next: "vpn" }]
        },
        connection: {
          kind: "result", title: "まずネットワーク接続を確認しましょう",
          steps: ["接続先のネットワークとWi-Fi設定を確認してください。", "解消しない場合は、利用場所と発生時刻を添えて窓口へ相談してください。"],
          articleId: "wifi-connection", category: "network"
        },
        authentication: {
          kind: "result", title: "アカウントの確認が必要です",
          steps: ["表示されたメッセージを控えて、アカウントサポートへ相談してください。", "パスワードや認証コードをメールへ記載しないでください。"],
          articleId: "password-reset", category: "account"
        },
        vpn: {
          kind: "result", title: "VPNの確認手順をお試しください",
          steps: ["メンテナンス予定とVPNアプリの接続先を確認してください。", "再接続しても改善しない場合は、エラーメッセージを添えて相談してください。"],
          articleId: "vpn-connection", category: "network"
        }
      }
    },
    {
      id: "printing", title: "プリンターから出力されない", start: "printer",
      nodes: {
        printer: {
          kind: "question", title: "プリンター本体に用紙切れやエラーの表示はありますか？",
          choices: [{ label: "表示がある", next: "device" }, { label: "表示はない・確認できない", next: "queue" }]
        },
        device: {
          kind: "result", title: "本体の表示内容を確認しましょう",
          steps: ["用紙補充など、社内で案内されている範囲の対応を確認してください。", "解消しない場合は、機器名と表示内容を添えて相談してください。"],
          articleId: "printer-connection", category: "device"
        },
        queue: {
          kind: "result", title: "出力先と印刷待ちを確認しましょう",
          steps: ["選択したプリンター名と、自分のジョブの状態を確認してください。", "連続して送信せず、確認結果を添えてITサービスデスクへ相談してください。"],
          articleId: "printer-connection", category: "device"
        }
      }
    }
  ]
};
