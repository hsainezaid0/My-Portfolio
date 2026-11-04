const themeToggle = document.querySelector(".theme-toggle");
const themePicker = document.querySelector(".theme-picker");
const themeOptions = document.querySelector(".theme-options");
const themeToolbar = document.querySelector(".theme-toolbar");
const phoneLayout = matchMedia("(max-width: 600px)");

function closeThemeOptions(restoreFocus = false) {
    themeOptions.hidden = true;
    if (phoneLayout.matches) themeToggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) themeToggle.focus({ preventScroll: true });
}

function updateTheme() {
    const light = document.documentElement.dataset.theme === "light";
    const french = document.documentElement.lang === "fr";
    // On mobile the icon shows the current theme; desktop keeps its quick toggle.
    themeToggle.querySelector(".theme-icon").textContent = phoneLayout.matches
        ? (light ? "\u2600" : "\u263e") : (light ? "\u263e" : "\u2600");
    themeToggle.querySelector(".theme-label").textContent = french
        ? (light ? "Mode sombre" : "Mode clair") : (light ? "Dark mode" : "Light mode");
    themeToggle.setAttribute("aria-label", phoneLayout.matches
        ? (french ? "Choisir le mode d’affichage" : "Choose appearance")
        : (french ? `Passer en mode ${light ? "sombre" : "clair"}` : `Switch to ${light ? "dark" : "light"} mode`));
    if (phoneLayout.matches) {
        themeToggle.removeAttribute("aria-pressed");
        themeToggle.setAttribute("aria-controls", "theme-options");
        themeToggle.setAttribute("aria-expanded", String(!themeOptions.hidden));
    } else {
        themeToggle.removeAttribute("aria-controls");
        themeToggle.removeAttribute("aria-expanded");
        themeToggle.setAttribute("aria-pressed", String(light));
    }
    themeOptions.setAttribute("aria-label", french ? "Choisir le mode d’affichage" : "Choose appearance");
    themeOptions.querySelectorAll("[data-theme-option]").forEach(option => {
        const isLight = option.dataset.themeOption === "light";
        option.setAttribute("aria-pressed", String(isLight === light));
        option.querySelector(".theme-option-label").textContent = french
            ? (isLight ? "Mode clair" : "Mode sombre") : (isLight ? "Light mode" : "Dark mode");
    });
}

function selectTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("portfolio-theme", theme); } catch {}
    updateTheme();
}

themeToggle.addEventListener("click", () => {
    if (phoneLayout.matches) {
        themeOptions.hidden = !themeOptions.hidden;
        themeToggle.setAttribute("aria-expanded", String(!themeOptions.hidden));
    } else {
        selectTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
    }
});
themeOptions.querySelectorAll("[data-theme-option]").forEach(option => {
    option.addEventListener("click", () => {
        selectTheme(option.dataset.themeOption);
        closeThemeOptions(true);
    });
});
document.addEventListener("click", event => {
    if (!themePicker.contains(event.target)) closeThemeOptions();
});
themePicker.addEventListener("keydown", event => {
    if (event.key === "Escape" && !themeOptions.hidden) {
        event.preventDefault();
        closeThemeOptions(true);
    }
});
themePicker.addEventListener("focusout", event => {
    if (!themePicker.contains(event.relatedTarget)) closeThemeOptions();
});

// The mobile toolbar only appears at the top, including after page restoration.
function updateToolbarOnScroll() {
    const hidden = phoneLayout.matches && window.scrollY > 1;
    if (hidden) closeThemeOptions();
    themeToolbar.classList.toggle("is-scroll-hidden", hidden);
    themeToolbar.inert = hidden;
}
window.addEventListener("scroll", updateToolbarOnScroll, { passive: true });
window.addEventListener("pageshow", updateToolbarOnScroll);
phoneLayout.addEventListener("change", () => {
    closeThemeOptions();
    updateTheme();
    updateToolbarOnScroll();
});
document.addEventListener("portfolio:languagechange", updateTheme);
updateTheme();
updateToolbarOnScroll();
