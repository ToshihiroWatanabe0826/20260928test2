import request from "supertest";
import { Script } from "node:vm";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("GET /", () => {
  it("serves the Japanese application page", async () => {
    const response = await request(app).get("/").expect(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain('lang="ja"');
    expect(response.text).toMatch(/<main\b[^>]*>/);
  });

  it("serves syntactically valid inline scripts", async () => {
    const response = await request(app).get("/").expect(200);
    for (const script of response.text.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      expect(() => new Script(script[1] ?? "")).not.toThrow();
    }
  });

  it("serves the portal script and stylesheet referenced by the page", async () => {
    const page = await request(app).get("/").expect(200);
    expect(page.text).toContain('src="/assets/portal-core.js"');
    expect(page.text).toContain('src="/assets/portal.js"');
    expect(page.text).toContain('href="/assets/portal.css"');
    const coreScript = await request(app).get("/assets/portal-core.js").expect(200);
    expect(coreScript.headers["content-type"]).toMatch(/javascript/);
    expect(() => new Script(coreScript.text)).not.toThrow();
    const script = await request(app).get("/assets/portal.js").expect(200);
    expect(script.headers["content-type"]).toMatch(/javascript/);
    expect(() => new Script(script.text)).not.toThrow();
    const style = await request(app).get("/assets/portal.css").expect(200);
    expect(style.headers["content-type"]).toContain("text/css");
  });
  it("implements portal behavior without HTML string rendering", async () => {
    const script = await request(app).get("/assets/portal.js").expect(200);
    expect(script.text).toContain("portalCore.filterArticles");
    expect(script.text).toContain("portalCore.advanceGuide");
    expect(script.text).toContain("portalCore.createDraftContent");
    expect(script.text).toContain("new AbortController()");
    expect(script.text).not.toContain(".innerHTML");

    const style = await request(app).get("/assets/portal.css").expect(200);
    expect(style.text).toContain("@media (max-width: 900px)");
    expect(style.text).toContain("@media (max-width: 600px)");
  });
});
