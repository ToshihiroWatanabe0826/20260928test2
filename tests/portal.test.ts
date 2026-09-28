import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";
import type { PortalContent } from "../src/portal.js";

async function readPortal(): Promise<PortalContent> {
  const response = await request(app).get("/api/portal").expect(200);
  expect(response.headers["content-type"]).toContain("application/json");
  expect(response.headers["cache-control"]).toBe("no-store");
  return response.body;
}

describe("existing IT portal", () => {
  it("provides articles, notices, guides and contact categories", async () => {
    const content = await readPortal();
    expect(content.articles).toHaveLength(6);
    expect(content.notices).toHaveLength(3);
    expect(content.guides).toHaveLength(2);
    expect(content.categories.map((category) => category.id)).toEqual(["account", "network", "device"]);
  });

  it("provides complete articles and notices with unique IDs and valid categories", async () => {
    const content = await readPortal();
    const categories = new Set(content.categories.map((category) => category.id));
    for (const records of [content.articles, content.notices]) {
      expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
      for (const record of records) {
        expect(record.title.trim()).not.toBe("");
        expect(record.summary.trim()).not.toBe("");
        expect(categories.has(record.category)).toBe(true);
      }
    }
    for (const article of content.articles) {
      expect(article.steps.length).toBeGreaterThan(0);
      expect(article.steps.every((step) => step.trim().length > 0)).toBe(true);
    }
    for (const notice of content.notices) {
      expect(notice.publishedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(notice.details.length).toBeGreaterThan(0);
    }
  });

  it("has complete acyclic guide paths with valid article and contact destinations", async () => {
    const content = await readPortal();
    const articleIds = new Set(content.articles.map((article) => article.id));
    const categories = new Set(content.categories.map((category) => category.id));
    for (const guide of content.guides) {
      const reached = new Set<string>();
      function visit(id: string, ancestors: Set<string>): void {
        expect(ancestors.has(id), `Cycle in ${guide.id}: ${id}`).toBe(false);
        const node = guide.nodes[id];
        expect(node, `Missing node ${guide.id}/${id}`).toBeDefined();
        if (!node || ancestors.has(id)) throw new Error(`Invalid guide path: ${guide.id}/${id}`);
        reached.add(id);
        expect(node.title.trim()).not.toBe("");
        if (node.kind === "question") {
          expect(node.choices.length).toBeGreaterThan(1);
          for (const choice of node.choices) {
            expect(choice.label.trim()).not.toBe("");
            visit(choice.next, new Set([...ancestors, id]));
          }
        } else {
          expect(node.steps.length).toBeGreaterThan(0);
          expect(articleIds.has(node.articleId)).toBe(true);
          expect(categories.has(node.category)).toBe(true);
        }
      }
      visit(guide.start, new Set());
      expect([...reached].sort()).toEqual(Object.keys(guide.nodes).sort());
    }
  });

  it("uses fictional contact addresses and does not change published content when read again", async () => {
    const initial = await readPortal();
    for (const category of initial.categories) {
      expect(category.email).toMatch(/^[a-z-]+@example\.com$/);
      expect(category.team.trim()).not.toBe("");
      expect(category.hours.trim()).not.toBe("");
    }
    expect(await readPortal()).toEqual(initial);
  });
});
