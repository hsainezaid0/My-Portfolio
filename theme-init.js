// Apply the saved preference before styles load to avoid a theme flash.
(() => {
    let theme = "dark";
    try {
        const saved = localStorage.getItem("portfolio-theme");
        if (saved === "light" || saved === "dark") theme = saved;
    } catch {
        // The toggle still works when browser storage is unavailable.
    }
    document.documentElement.dataset.theme = theme;
})();
