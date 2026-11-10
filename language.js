(() => {
    const button = document.querySelector(".language-toggle");
    if (!button) return;
    const french = window.portfolioFrench;
    const normalize = text => text.replace(/\s+/g, " ").trim();
    const entries = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest("script, style, .theme-picker, .language-toggle")) continue;
        const original = node.nodeValue;
        const translation = french[normalize(original)];
        if (translation !== undefined) {
            const leading = original.match(/^\s*/)[0];
            const trailing = original.match(/\s*$/)[0];
            entries.push({ node, original, translated: leading + translation + trailing });
        }
    }
    const attributes = [];
    document.querySelectorAll("[aria-label], [placeholder], [alt], meta[name='description']").forEach(element => {
        if (element.closest(".theme-picker, .language-toggle")) return;
        for (const name of ["aria-label", "placeholder", "alt", "content"]) {
            const original = element.getAttribute(name);
            if (original && french[original]) attributes.push({ element, name, original, translated: french[original] });
        }
    });
    const originalTitle = document.title;
    function applyLanguage(language) {
        const isFrench = language === "fr";
        document.documentElement.lang = language;
        entries.forEach(entry => { entry.node.nodeValue = isFrench ? entry.translated : entry.original; });
        attributes.forEach(entry => entry.element.setAttribute(entry.name, isFrench ? entry.translated : entry.original));
        document.title = isFrench ? (french[originalTitle] || originalTitle) : originalTitle;
        // The button shows both languages; CSS highlights the active one from <html lang>.
        button.lang = isFrench ? "en" : "fr";
        button.setAttribute("aria-label", isFrench ? "Switch website to English" : "Passer le site en français");
        button.title = isFrench ? "Switch to English" : "Passer en français";
        document.dispatchEvent(new Event("portfolio:languagechange"));
    }
    let language = "en";
    try { if (localStorage.getItem("portfolio-language") === "fr") language = "fr"; } catch {}
    applyLanguage(language);
    button.addEventListener("click", () => {
        language = document.documentElement.lang === "fr" ? "en" : "fr";
        applyLanguage(language);
        try { localStorage.setItem("portfolio-language", language); } catch {}
    });
})();
