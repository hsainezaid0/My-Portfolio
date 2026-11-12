// Projects page: the filters show one category at a time, and "Open preview"
// opens the project's details in a dialog. A link such as projects.html#snort
// opens that project's preview directly.
(() => {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    const tiles = [...grid.querySelectorAll('.project-tile')];
    const filters = [...document.querySelectorAll('.project-filters [data-filter]')];

    function show(category) {
        filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
        tiles.forEach((tile, index) => {
            const visible = category === 'all' || tile.dataset.category === category;
            tile.hidden = !visible;
            // Cards that stay or come back appear again with a short animation.
            tile.classList.remove('is-entering');
            if (!visible) return;
            tile.classList.add('scroll-reveal', 'is-revealed');
            tile.style.setProperty('--reveal-delay', '0ms');
            void tile.offsetWidth;
            tile.querySelector('article').style.animationDelay = `${index % 3 * 60}ms`;
            tile.classList.add('is-entering');
        });
    }

    filters.forEach(button => button.addEventListener('click', () => show(button.dataset.filter)));

    function open(tile) {
        const dialog = tile.querySelector('dialog');
        if (!dialog || dialog.open || typeof dialog.showModal !== 'function') return;
        dialog.showModal();
        dialog.querySelector('.preview-body').scrollTop = 0;
    }

    tiles.forEach(tile => {
        const dialog = tile.querySelector('dialog');
        const button = tile.querySelector('.tile-open');
        if (!dialog || !button) return;
        // Older browsers without <dialog>: the button would do nothing, so hide it.
        if (typeof dialog.showModal !== 'function') {
            button.hidden = true;
            return;
        }
        button.addEventListener('click', () => open(tile));
        dialog.querySelector('.preview-close').addEventListener('click', () => dialog.close());
        // A click on the dark area around the preview closes it.
        dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
        dialog.addEventListener('close', () => {
            // Remove "#snort" from the address without adding a history entry.
            if (location.hash === '#' + tile.id) history.replaceState(null, '', location.pathname + location.search);
        });
    });

    function openFromAddress() {
        const tile = tiles.find(item => item.id && item.id === decodeURIComponent(location.hash.slice(1)));
        if (!tile) return;
        show('all');
        open(tile);
    }

    addEventListener('hashchange', openFromAddress);
    openFromAddress();
})();
