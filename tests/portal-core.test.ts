import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";
import { describe, expect, it } from "vitest";
import { portalContent, type PortalContent } from "../src/portal.js";

interface GuideState {
  node: string;
  history: Array<{ node: string; answer: string }>;
}

type Guide = PortalContent["guides"][number];

interface PortalCore {
  advanceGuide: (
    guide: Guide,
    state: GuideState,
    choice: { label: string; next: string }
  ) => GuideState;
  backGuide: (state: GuideState) => GuideState;
  createDraftContent: (
    contact: { label: string; team: string; email: string },
    title: string,
    details: string
  ) => { subject: string; body: string; mailto: string };
  filterArticles: (
    articles: typeof portalContent.articles,
    query: string,
    categoryId: string
  ) => typeof portalContent.articles;
  filterNotices: (
    notices: typeof portalContent.notices,
    categoryId: string
  ) => typeof portalContent.notices;
  normalize: (text: string) => string;
  resolvePanel: (requested: string, availablePanels: string[]) => string;
  startGuide: (guide: Guide) => GuideState;
  validateDraftInput: (
    title: string,
    details: string
  ) => { ok: false } | { ok: true; title: string; details: string };
}

function loadPortalCore(): PortalCore {
  const context: { portalCore?: PortalCore } = {};
  const sourceUrl = new URL("../public/portal-core.js", import.meta.url);
  const source = readFileSync(sourceUrl, "utf8");
  new Script(source, { filename: fileURLToPath(sourceUrl) }).runInNewContext(context);
  if (!context.portalCore) throw new Error("Portal core was not installed.");
  return context.portalCore;
}

describe("existing portal core logic", () => {
  const core = loadPortalCore();

  it("selects known panels and falls back to knowledge", () => {
    const panels = ["knowledge", "notices", "troubleshoot", "contact"];

    expect(core.resolvePanel("notices", panels)).toBe("notices");
    expect(core.resolvePanel("", panels)).toBe("knowledge");
    expect(core.resolvePanel("unknown", panels)).toBe("knowledge");
  });

  it("normalizes full-width and uppercase search text", () => {
    expect(core.normalize("ＶＰＮ ABC")).toBe("vpn abc");
  });

  it("filters articles by all search terms and category", () => {
    expect(core.filterArticles(portalContent.articles, "", "")).toHaveLength(6);
    expect(core.filterArticles(portalContent.articles, "VPN 接続", ""))
      .toEqual([expect.objectContaining({ id: "vpn-connection" })]);
    expect(core.filterArticles(portalContent.articles, "確認", "account")
      .every((article) => article.category === "account")).toBe(true);
    expect(core.filterArticles(portalContent.articles, "存在しない語", ""))
      .toEqual([]);
  });

  it("sorts notices newest first and filters by category", () => {
    expect(core.filterNotices(portalContent.notices, "").map((notice) => notice.id))
      .toEqual(["vpn-maintenance", "authentication-guide", "onboarding"]);
    expect(core.filterNotices(portalContent.notices, "account").map((notice) => notice.id))
      .toEqual(["authentication-guide"]);
  });

  it("starts, advances, and returns through a guide without mutating history", () => {
    const guide = portalContent.guides[0];
    if (!guide) throw new Error("VPN guide must exist.");
    const started = core.startGuide(guide);
    const firstNode = guide.nodes[started.node];
    if (!firstNode || firstNode.kind !== "question") {
      throw new Error("Guide must start with a question.");
    }
    const choice = firstNode.choices[0];
    if (!choice) throw new Error("Guide choice must exist.");

    const advanced = core.advanceGuide(guide, started, choice);
    expect(advanced).toEqual({
      node: choice.next,
      history: [{ node: guide.start, answer: choice.label }]
    });
    expect(started).toEqual({ node: guide.start, history: [] });
    expect(core.backGuide(advanced)).toEqual(started);
    expect(core.backGuide(started)).toEqual(started);
  });

  it("rejects invalid guide transitions", () => {
    const guide = portalContent.guides[0];
    if (!guide) throw new Error("VPN guide must exist.");
    expect(() => core.advanceGuide(
      guide,
      core.startGuide(guide),
      { label: "不正", next: "missing" }
    )).toThrow("Guide choice is not valid");
  });

  it("validates draft input at normal and boundary lengths", () => {
    expect(core.validateDraftInput("  VPN   接続  ", "  詳細  ")).toEqual({
      ok: true,
      title: "VPN 接続",
      details: "詳細"
    });
    expect(core.validateDraftInput("a", "b").ok).toBe(true);
    expect(core.validateDraftInput("a".repeat(100), "b".repeat(2000)).ok).toBe(true);
    expect(core.validateDraftInput("", "details")).toEqual({ ok: false });
    expect(core.validateDraftInput(" ", "details")).toEqual({ ok: false });
    expect(core.validateDraftInput("a".repeat(101), "details")).toEqual({ ok: false });
    expect(core.validateDraftInput("title", "b".repeat(2001))).toEqual({ ok: false });
  });

  it("generates a Japanese email draft and encoded mail link", () => {
    const contact = portalContent.categories[1];
    if (!contact) throw new Error("Network contact must exist.");
    const draft = core.createDraftContent(contact, "VPN接続", "再接続を試しました。");

    expect(draft.subject).toBe("[IT相談／ネットワーク・VPN] VPN接続");
    expect(draft.body).toContain("ネットワークサポート ご担当者様");
    expect(draft.body).toContain("再接続を試しました。");
    expect(draft.mailto).toContain("mailto:network-help@example.com");
    expect(decodeURIComponent(draft.mailto)).toContain(draft.subject);
  });
});
