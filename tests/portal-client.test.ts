import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import { describe, expect, it, vi } from "vitest";
import { portalContent } from "../src/portal.js";

class FakeElement {
  children: FakeElement[] = [];
  textContent = "";
  hidden = false;
  value = "";
  disabled = false;
  dataset: Record<string, string> = {};
  private readonly attributes = new Map<string, string>();
  private hasSelectedOption = false;

  constructor(readonly tagName = "div") {}

  append(...children: FakeElement[]): void {
    this.children.push(...children);
    if (!this.hasSelectedOption) {
      const firstOption = children.find((child) => child.tagName === "option");
      if (firstOption) {
        this.value = firstOption.value;
        this.hasSelectedOption = true;
      }
    }
  }

  replaceChildren(...children: FakeElement[]): void {
    this.children = children;
    this.textContent = "";
    this.hasSelectedOption = false;
    const firstOption = children.find((child) => child.tagName === "option");
    if (firstOption) {
      this.value = firstOption.value;
      this.hasSelectedOption = true;
    }
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  focus(): void {}

  addEventListener(): void {}
}

class FakeOption extends FakeElement {
  constructor(text: string, value: string) {
    super("option");
    this.textContent = text;
    this.value = value;
  }
}

interface PortalTestHooks {
  loadPortal: () => Promise<void>;
}

function createHarness(fetchMock: ReturnType<typeof vi.fn>): {
  elements: Map<string, FakeElement>;
  hooks: PortalTestHooks;
} {
  const elements = new Map<string, FakeElement>();
  const main = new FakeElement("main");
  const dataControls = [new FakeElement("fieldset"), new FakeElement("button")];
  const document = {
    getElementById(id: string): FakeElement {
      let found = elements.get(id);
      if (!found) {
        found = new FakeElement();
        elements.set(id, found);
      }
      return found;
    },
    createElement(tagName: string): FakeElement {
      return new FakeElement(tagName);
    },
    querySelector(selector: string): FakeElement | undefined {
      return selector === "main" ? main : undefined;
    },
    querySelectorAll(selector: string): FakeElement[] {
      if (selector === "[data-requires-data]") return dataControls;
      return [];
    }
  };
  const context: {
    AbortController: typeof AbortController;
    clearTimeout: typeof clearTimeout;
    console: Console;
    document: typeof document;
    encodeURIComponent: typeof encodeURIComponent;
    fetch: typeof fetchMock;
    location: { hash: string };
    Option: typeof FakeOption;
    portalCore?: unknown;
    portalTestHooks?: PortalTestHooks;
    setTimeout: typeof setTimeout;
  } = {
    AbortController,
    clearTimeout,
    console,
    document,
    encodeURIComponent,
    fetch: fetchMock,
    location: { hash: "" },
    Option: FakeOption,
    setTimeout
  };
  const coreSource = readFileSync(
    new URL("../public/portal-core.js", import.meta.url),
    "utf8"
  );
  new Script(coreSource).runInNewContext(context);
  const source = readFileSync(new URL("../public/portal.js", import.meta.url), "utf8");
  const setupMarker = '  byId("faq-search").addEventListener';
  const setupIndex = source.indexOf(setupMarker);
  if (setupIndex < 0) throw new Error("Portal script setup marker was not found.");
  const instrumented = `${source.slice(0, setupIndex)}
  globalThis.portalTestHooks = { loadPortal };
})();`;
  new Script(instrumented).runInNewContext(context);
  if (!context.portalTestHooks) throw new Error("Portal test hooks were not installed.");
  return { elements, hooks: context.portalTestHooks };
}

describe("portal data loading integration", () => {
  it("shows retry after an API failure and initializes the portal after retry", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async (): Promise<unknown> => ({})
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async (): Promise<unknown> => portalContent
      });
    const { elements, hooks } = createHarness(fetchMock);

    try {
      await hooks.loadPortal();

      expect(elements.get("load-message")?.textContent)
        .toBe("ポータルの情報を取得できませんでした。接続を確認して、再読み込みしてください。");
      expect(elements.get("retry-load")?.hidden).toBe(false);
      expect(elements.get("load-state")?.dataset.status).toBe("error");

      await hooks.loadPortal();

      expect(errorLog).toHaveBeenCalledOnce();
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(elements.get("load-state")?.hidden).toBe(true);
      expect(elements.get("load-state")?.dataset.status).toBe("ok");
      expect(elements.get("faq-count")?.textContent).toBe("6件のナレッジ");
      expect(elements.get("notice-count")?.textContent).toBe("3件のお知らせ");
    } finally {
      errorLog.mockRestore();
    }
  });
});
