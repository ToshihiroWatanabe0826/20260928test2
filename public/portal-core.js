(() => {
  function resolvePanel(requested, availablePanels) {
    return availablePanels.includes(requested) ? requested : "knowledge";
  }

  function normalize(text) {
    return text.normalize("NFKC").toLocaleLowerCase("ja-JP");
  }

  function filterArticles(articles, query, categoryId) {
    const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
    return articles.filter((article) => {
      const searchable = normalize([
        article.title,
        article.summary,
        ...article.tags,
        ...article.steps
      ].join(" "));
      return (!categoryId || article.category === categoryId)
        && terms.every((term) => searchable.includes(term));
    });
  }

  function filterNotices(notices, categoryId) {
    return [...notices]
      .sort((left, right) => right.publishedOn.localeCompare(left.publishedOn))
      .filter((notice) => !categoryId || notice.category === categoryId);
  }

  function startGuide(guide) {
    return { node: guide.start, history: [] };
  }

  function advanceGuide(guide, state, choice) {
    const node = guide.nodes[state.node];
    if (!node || node.kind !== "question"
      || !node.choices.some((item) => item.label === choice.label && item.next === choice.next)) {
      throw new Error("Guide choice is not valid for the current node.");
    }
    return {
      node: choice.next,
      history: [...state.history, { node: state.node, answer: choice.label }]
    };
  }

  function backGuide(state) {
    const previous = state.history.at(-1);
    if (!previous) return state;
    return {
      node: previous.node,
      history: state.history.slice(0, -1)
    };
  }

  function validateDraftInput(titleValue, detailsValue) {
    const title = titleValue.trim().replace(/\s+/g, " ");
    const details = detailsValue.trim();
    if (!title || !details || title.length > 100 || details.length > 2000) {
      return { ok: false };
    }
    return { ok: true, title, details };
  }

  function createDraftContent(contact, title, details) {
    const subject = `[IT相談／${contact.label}] ${title}`;
    const body = `${contact.team} ご担当者様\n\n以下の件について相談します。\n\n【相談カテゴリ】\n${contact.label}\n\n【相談内容・確認したこと】\n${details}\n\nよろしくお願いいたします。`;
    return {
      subject,
      body,
      mailto: `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replaceAll("\n", "\r\n"))}`
    };
  }

  globalThis.portalCore = Object.freeze({
    advanceGuide,
    backGuide,
    createDraftContent,
    filterArticles,
    filterNotices,
    normalize,
    resolvePanel,
    startGuide,
    validateDraftInput
  });
})();
