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
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = light ? "#f0f5fa" : "#080d1b";
    const french = document.documentElement.lang === "fr";
    // On mobile the icon shows the current theme; desktop keeps its quick toggle.
    // The icon itself is drawn in CSS from data-icon (sun or moon).
    themeToggle.querySelector(".theme-icon").dataset.icon = (phoneLayout.matches ? light : !light) ? "sun" : "moon";
    // The text label is optional: pages may show the icon alone.
    const label = french
        ? (light ? "Mode sombre" : "Mode clair") : (light ? "Dark mode" : "Light mode");
    const themeLabel = themeToggle.querySelector(".theme-label");
    if (themeLabel) themeLabel.textContent = label;
    themeToggle.title = phoneLayout.matches ? "" : label;
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

// The new theme spreads in a circle from the theme button (View Transitions API).
// Browsers without it fade the colors instead; with reduced motion the change is instant.
function selectTheme(theme) {
    const root = document.documentElement;
    const apply = () => {
        root.dataset.theme = theme;
        try { localStorage.setItem("portfolio-theme", theme); } catch {}
        updateTheme();
    };
    if (root.dataset.theme === theme || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        apply();
        return;
    }
    if (!document.startViewTransition) {
        root.classList.add("theme-fading");
        apply();
        setTimeout(() => root.classList.remove("theme-fading"), 450);
        return;
    }
    const button = themeToggle.getBoundingClientRect();
    const x = button.left + button.width / 2;
    const y = button.top + button.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add("theme-switching");
    const transition = document.startViewTransition(apply);
    transition.ready.then(() => {
        root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 700, easing: "cubic-bezier(.4, 0, .2, 1)", pseudoElement: "::view-transition-new(root)" }
        );
    }).catch(() => {});
    transition.finished.finally(() => root.classList.remove("theme-switching"));
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
