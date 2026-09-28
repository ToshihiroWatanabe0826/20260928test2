(() => {
  const portalCore = globalThis.portalCore;
  if (!portalCore) throw new Error("Portal core is not available.");
  const byId = (id) => document.getElementById(id);
  const panels = [...document.querySelectorAll("[data-panel]")];
  let content;
  let currentGuide;
  let currentNode;
  let guideHistory = [];
  let draft;
  let activePanel;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function category(id) {
    const found = content.categories.find((item) => item.id === id);
    if (!found) throw new Error(`Unknown portal category: ${id}`);
    return found;
  }

  function activatePanel() {
    const requested = location.hash.slice(1);
    const name = portalCore.resolvePanel(
      requested,
      panels.map((panel) => panel.dataset.panel)
    );
    for (const panel of panels) panel.hidden = panel.dataset.panel !== name;
    for (const link of document.querySelectorAll("[data-nav]")) {
      if (link.dataset.nav === name) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    if (activePanel !== name) window.scrollTo({ top: 0 });
    activePanel = name;
  }

  function showPanel(name) {
    location.hash = name;
    activatePanel();
  }

  function populateCategories(id, includeAll) {
    const select = byId(id);
    select.replaceChildren();
    if (includeAll) select.append(new Option("すべてのカテゴリ", ""));
    for (const item of content.categories) select.append(new Option(item.label, item.id));
  }

  function renderArticles() {
    const selected = byId("faq-category").value;
    const articles = portalCore.filterArticles(
      content.articles,
      byId("faq-search").value,
      selected
    );
    const list = byId("faq-list");
    list.replaceChildren();
    for (const article of articles) {
      const details = element("details", "faq-card");
      details.id = `article-${article.id}`;
      const summary = element("summary");
      summary.append(
        element("span", "faq-category", category(article.category).label),
        element("span", "faq-title", article.title),
        element("span", "faq-summary", article.summary)
      );
      const steps = element("ol", "article-steps");
      for (const step of article.steps) steps.append(element("li", "", step));
      details.append(summary, steps);
      list.append(details);
    }
    byId("faq-count").textContent = `${articles.length}件のナレッジ`;
    byId("faq-empty").hidden = articles.length > 0;
  }

  function openArticle(id) {
    byId("faq-search").value = "";
    byId("faq-category").value = "";
    renderArticles();
    showPanel("knowledge");
    const article = byId(`article-${id}`);
    article.open = true;
    article.querySelector("summary").focus();
    article.scrollIntoView({ block: "nearest" });
  }

  function noticeMeta(notice) {
    const meta = element("div", "notice-meta");
    const time = element("time", "", notice.publishedOn.replaceAll("-", "."));
    time.dateTime = notice.publishedOn;
    meta.append(time, element("span", "badge", notice.kind));
    return meta;
  }

  function sortedNotices() {
    return portalCore.filterNotices(content.notices, "");
  }

  function renderNotices() {
    const selected = byId("notice-category").value;
    const notices = portalCore.filterNotices(content.notices, selected);
    const list = byId("notice-list");
    list.replaceChildren();
    for (const notice of notices) {
      const details = element("details", "notice-item");
      details.id = `notice-${notice.id}`;
      const summary = element("summary");
      summary.append(
        noticeMeta(notice),
        element("h2", "", notice.title),
        element("p", "", notice.summary),
        element("span", "read-more", "詳細を開く / 閉じる")
      );
      const body = element("div", "notice-details");
      body.append(element("p", "muted", `対象：${category(notice.category).label}`));
      for (const paragraph of notice.details) body.append(element("p", "", paragraph));
      details.append(summary, body);
      list.append(details);
    }
    byId("notice-count").textContent = `${notices.length}件のお知らせ`;
    byId("notice-empty").hidden = notices.length > 0;
  }

  function renderNoticePreview() {
    const preview = byId("notice-preview");
    preview.replaceChildren();
    for (const notice of sortedNotices().slice(0, 3)) {
      const row = element("div", "notice-preview");
      const link = element("button", "", notice.title);
      link.type = "button";
      link.addEventListener("click", () => {
        byId("notice-category").value = "";
        renderNotices();
        showPanel("notices");
        const details = byId(`notice-${notice.id}`);
        details.open = true;
        details.querySelector("summary").focus();
      });
      row.append(noticeMeta(notice), link);
      preview.append(row);
    }
  }

  function resetGuide() {
    currentGuide = content.guides.find((guide) => guide.id === byId("guide-select").value);
    const state = portalCore.startGuide(currentGuide);
    currentNode = state.node;
    guideHistory = state.history;
    renderGuide();
  }

  function renderGuide() {
    const node = currentGuide.nodes[currentNode];
    const area = byId("guide-step");
    area.replaceChildren();
    const heading = element("h2", "", node.title);
    heading.tabIndex = -1;
    area.append(element("span", "badge", node.kind === "question" ? `確認 ${guideHistory.length + 1}` : "確認結果"), heading);
    if (node.kind === "question") {
      const choices = element("div", "guide-choices");
      for (const choice of node.choices) {
        const button = element("button", "", choice.label);
        button.type = "button";
        button.addEventListener("click", () => {
          const state = portalCore.advanceGuide(
            currentGuide,
            { node: currentNode, history: guideHistory },
            choice
          );
          currentNode = state.node;
          guideHistory = state.history;
          renderGuide();
          byId("guide-step").querySelector("h2").focus();
        });
        choices.append(button);
      }
      area.append(choices);
    } else {
      const steps = element("ol", "article-steps");
      for (const step of node.steps) steps.append(element("li", "", step));
      const actions = element("div", "actions");
      const article = element("button", "", "関連するFAQを読む");
      article.type = "button";
      article.addEventListener("click", () => openArticle(node.articleId));
      const contact = element("button", "primary", "確認結果を付けて相談");
      contact.type = "button";
      contact.addEventListener("click", () => {
        byId("contact-category").value = node.category;
        if (!byId("mail-title").value.trim()) byId("mail-title").value = currentGuide.title;
        const trail = guideHistory.map((item) => `${currentGuide.nodes[item.node].title} → ${item.answer}`);
        const diagnostic = ["【解決ナビの確認結果】", currentGuide.title, ...trail, `案内：${node.title}`].join("\n");
        byId("mail-details").value = [byId("mail-details").value.trim(), diagnostic].filter(Boolean).join("\n\n");
        renderContact();
        clearDraft();
        showPanel("contact");
        byId("mail-details").focus();
      });
      actions.append(article, contact);
      area.append(steps, actions);
    }
    byId("guide-back").disabled = guideHistory.length === 0;
    byId("guide-reset").disabled = guideHistory.length === 0;
  }

  function renderContact() {
    const contact = category(byId("contact-category").value);
    const card = byId("contact-card");
    card.replaceChildren(
      element("strong", "", contact.team),
      element("p", "", `メール：${contact.email}`),
      element("p", "", `受付時間：${contact.hours}`)
    );
  }

  function clearDraft() {
    draft = undefined;
    byId("draft-output").hidden = true;
    byId("draft-placeholder").hidden = false;
    byId("draft-subject").value = "";
    byId("draft-body").value = "";
    byId("open-mail").removeAttribute("href");
    byId("copy-feedback").textContent = "";
    byId("mail-error").hidden = true;
  }

  function createDraft(event) {
    event.preventDefault();
    clearDraft();
    const validation = portalCore.validateDraftInput(
      byId("mail-title").value,
      byId("mail-details").value
    );
    if (!validation.ok) {
      byId("mail-error").textContent = "相談の概要を1〜100文字、相談内容を1〜2,000文字で入力してください。空白だけでは作成できません。";
      byId("mail-error").hidden = false;
      const title = byId("mail-title").value.trim().replace(/\s+/g, " ");
      (!title || title.length > 100 ? byId("mail-title") : byId("mail-details")).focus();
      return;
    }
    const contact = category(byId("contact-category").value);
    draft = portalCore.createDraftContent(
      contact,
      validation.title,
      validation.details
    );
    byId("draft-subject").value = draft.subject;
    byId("draft-body").value = draft.body;
    byId("open-mail").href = draft.mailto;
    byId("draft-placeholder").hidden = true;
    byId("draft-output").hidden = false;
    byId("draft-subject").focus();
  }

  async function copyDraft() {
    const current = draft;
    const feedback = byId("copy-feedback");
    byId("copy-draft").disabled = true;
    try {
      if (!navigator.clipboard) throw new Error("Clipboard is unavailable");
      await navigator.clipboard.writeText(`件名：${current.subject}\n\n${current.body}`);
      if (draft === current) {
        feedback.textContent = "件名・本文をコピーしました。";
        feedback.dataset.status = "ok";
      }
    } catch (error) {
      console.error("Could not copy the email draft:", error);
      if (draft === current) {
        feedback.textContent = "コピーできませんでした。件名・本文を選択して、手動でコピーしてください。";
        feedback.dataset.status = "error";
      }
    } finally {
      byId("copy-draft").disabled = false;
    }
  }

  async function loadPortal() {
    const status = byId("load-state");
    status.hidden = false;
    status.dataset.status = "loading";
    byId("load-message").textContent = "ポータルの情報を読み込んでいます…";
    byId("retry-load").hidden = true;
    document.querySelector("main").setAttribute("aria-busy", "true");
    for (const control of document.querySelectorAll("[data-requires-data]")) control.disabled = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch("/api/portal", { signal: controller.signal });
      if (!response.ok) throw new Error(`Portal response: ${response.status}`);
      content = await response.json();
      populateCategories("faq-category", true);
      populateCategories("notice-category", true);
      populateCategories("contact-category", false);
      renderArticles();
      renderNotices();
      renderNoticePreview();
      const select = byId("guide-select");
      select.replaceChildren();
      for (const guide of content.guides) select.append(new Option(guide.title, guide.id));
      resetGuide();
      renderContact();
      for (const control of document.querySelectorAll("[data-requires-data]")) control.disabled = false;
      status.dataset.status = "ok";
      status.hidden = true;
    } catch (error) {
      console.error("Could not load portal content:", error);
      byId("load-message").textContent = "ポータルの情報を取得できませんでした。接続を確認して、再読み込みしてください。";
      byId("retry-load").hidden = false;
      status.dataset.status = "error";
    } finally {
      clearTimeout(timeout);
      document.querySelector("main").setAttribute("aria-busy", "false");
    }
  }

  byId("faq-search").addEventListener("input", renderArticles);
  byId("faq-category").addEventListener("change", renderArticles);
  byId("clear-search").addEventListener("click", () => {
    byId("faq-search").value = "";
    byId("faq-category").value = "";
    renderArticles();
    byId("faq-search").focus();
  });
  byId("notice-category").addEventListener("change", renderNotices);
  byId("guide-select").addEventListener("change", resetGuide);
  byId("guide-reset").addEventListener("click", resetGuide);
  byId("guide-back").addEventListener("click", () => {
    const state = portalCore.backGuide({
      node: currentNode,
      history: guideHistory
    });
    currentNode = state.node;
    guideHistory = state.history;
    renderGuide();
  });
  byId("contact-category").addEventListener("change", renderContact);
  byId("mail-form").addEventListener("input", clearDraft);
  byId("mail-form").addEventListener("change", clearDraft);
  byId("mail-form").addEventListener("submit", createDraft);
  byId("copy-draft").addEventListener("click", copyDraft);
  byId("retry-load").addEventListener("click", loadPortal);
  window.addEventListener("hashchange", activatePanel);
  activatePanel();
  loadPortal();
})();
