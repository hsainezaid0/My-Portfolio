// Search window (command palette). Open it with the Search button, Ctrl+K
// (Cmd+K on a Mac) or the "/" key. Type to filter, move with the arrow keys,
// press Enter to go. It finds pages, projects, skill areas and quick actions,
// in the site's current language.
(() => {
    // Two buttons open the search: the one in the top bar (computer, tablet)
    // and the diamond in the middle of the bottom bar (phone).
    const openers = [...document.querySelectorAll('.search-open, .nav-search')];
    const opener = document.querySelector('.search-open');
    if (!openers.length || typeof HTMLDialogElement !== 'function') {
        openers.forEach(button => { button.hidden = true; });
        return;
    }
    let lastOpener = null;

    const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    const shortcut = opener && opener.querySelector('kbd');
    if (shortcut && mac) shortcut.textContent = '⌘ K';

    const french = () => document.documentElement.lang === 'fr';
    const say = (en, fr) => (french() ? fr : en);
    const email = 'hsainezaid@gmail.com';

    // Each entry: group, English label, French label, extra words to match, what to do.
    // `go` is a page of this site, `out` an outside link, `run` a function.
    const entries = [
        ['pages', 'Home', 'Accueil', 'start index globe terminal', { go: 'index.html' }],
        ['pages', 'About', 'À propos', 'profile story education studies parcours formation', { go: 'about.html' }],
        ['pages', 'Education', 'Formation', 'studies school emsi epitech iteip bootcamp baccalaureate diplome', { go: 'about.html#education-title' }],
        ['pages', 'Skills', 'Compétences', 'tools services toolbox outils', { go: 'skills.html' }],
        ['pages', 'Projects', 'Projets', 'work portfolio realisations', { go: 'projects.html' }],
        ['pages', 'Contact', 'Contact', 'email message form formulaire feedback', { go: 'contact.html' }],

        ['projects', 'Snort network intrusion detection', 'Détection d’intrusion réseau avec Snort', 'security ids nmap linux securite', { go: 'projects.html#snort' }],
        ['projects', 'This portfolio', 'Ce portfolio', 'web html css javascript site', { go: 'projects.html#portfolio' }],
        ['projects', 'Smart parking system', 'Parking intelligent', 'arduino embedded sensors embarque capteurs', { go: 'projects.html#smart-parking' }],
        ['projects', 'EMSI hackathon: an everyday app', 'Hackathon EMSI : une appli du quotidien', 'app teamwork application', { go: 'projects.html#emsi-hackathon' }],
        ['projects', 'Discord bot', 'Bot Discord', 'automation python automatisation', { go: 'projects.html#discord-bot' }],
        ['projects', 'HireLoop job board', 'Job board HireLoop', 'python sql api job board emploi', { go: 'projects.html#hireloop' }],
        ['projects', '2D game in Java', 'Jeu 2D en Java', 'java game jeu 2d', { go: 'projects.html#game-2d' }],

        ['skills', 'Programming', 'Programmation', 'c python typescript react code', { go: 'skills.html#group-programming' }],
        ['skills', 'Web', 'Web', 'html css responsive accessibility', { go: 'skills.html#group-web' }],
        ['skills', 'Systems & tools', 'Systèmes & outils', 'linux git github bash ssh terminal', { go: 'skills.html#group-tools' }],
        ['skills', 'Cybersecurity', 'Cybersécurité', 'network security cryptography cewl reconnaissance reseau securite', { go: 'skills.html#group-security' }],

        ['actions', 'Switch to light mode', 'Passer en mode clair', 'theme light clair appearance apparence', { run: () => setTheme('light') }],
        ['actions', 'Switch to dark mode', 'Passer en mode sombre', 'theme dark sombre night nuit appearance apparence', { run: () => setTheme('dark') }],
        ['actions', 'Passer le site en français', 'Switch the site to English', 'language langue french english francais anglais', { run: switchLanguage }],
        ['actions', 'Copy my email address', 'Copier mon adresse e-mail', 'mail contact hsainezaid gmail', { run: copyEmail, stay: true }],
        ['actions', 'Open GitHub', 'Ouvrir GitHub', 'code repository depot', { out: 'https://github.com/hsainezaid0' }],
        ['actions', 'Open my online CV', 'Ouvrir mon CV en ligne', 'resume curriculum', { out: 'https://hsainezaid0.github.io/CV---RESUME/' }]
    ];
    const groups = {
        pages: ['Pages', 'Pages'],
        projects: ['Projects', 'Projets'],
        skills: ['Skills', 'Compétences'],
        actions: ['Actions', 'Actions']
    };

    function setTheme(theme) {
        if (typeof selectTheme === 'function') selectTheme(theme);
    }

    function switchLanguage() {
        const button = document.querySelector('.language-toggle');
        if (button) button.click();
    }

    async function copyEmail(item) {
        let done = false;
        try {
            await navigator.clipboard.writeText(email);
            done = true;
        } catch {
            const field = document.createElement('textarea');
            field.value = email;
            field.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
            dialog.append(field);
            field.select();
            try { done = document.execCommand('copy'); } catch {}
            field.remove();
        }
        const note = item.querySelector('small');
        if (note) note.textContent = done ? say('copied', 'copié') : email;
        input.focus();
        if (done) setTimeout(() => dialog.close(), 700);
    }

    // ---------- The window itself ----------

    const dialog = document.createElement('dialog');
    dialog.className = 'palette';
    dialog.innerHTML = `
        <div class="palette-field">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.800-3.800"/></svg>
            <input class="palette-input" type="text" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list"
                autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="go" maxlength="60" />
            <kbd>esc</kbd>
        </div>
        <ul class="palette-list" id="palette-list" role="listbox"></ul>
        <p class="palette-help" aria-hidden="true">
            <span><kbd>↑</kbd><kbd>↓</kbd><span data-help="move"></span></span>
            <span><kbd>↵</kbd><span data-help="open"></span></span>
            <span><kbd>esc</kbd><span data-help="close"></span></span>
        </p>`.replace('3.800-3.800', '3.8-3.8');
    document.body.append(dialog);
    const input = dialog.querySelector('.palette-input');
    const list = dialog.querySelector('.palette-list');

    let shown = [];       // entries currently listed
    let active = 0;       // index of the highlighted one

    // Lower case, without accents, so "competences" finds "Compétences".
    const plain = text => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    function render() {
        const words = plain(input.value).split(/\s+/).filter(Boolean);
        const light = document.documentElement.dataset.theme === 'light';
        shown = entries.filter(entry => {
            // Only offer the theme you are not already using.
            if (entry[1] === 'Switch to light mode' && light) return false;
            if (entry[1] === 'Switch to dark mode' && !light) return false;
            const text = plain(`${entry[1]} ${entry[2]} ${entry[3]} ${groups[entry[0]].join(' ')}`);
            return words.every(word => text.includes(word));
        });
        active = Math.min(active, Math.max(shown.length - 1, 0));
        list.replaceChildren();

        if (!shown.length) {
            const empty = document.createElement('li');
            empty.className = 'palette-empty';
            empty.setAttribute('role', 'presentation');
            empty.textContent = say(`No result for "${input.value.trim()}"`, `Aucun résultat pour « ${input.value.trim()} »`);
            list.append(empty);
            input.removeAttribute('aria-activedescendant');
            return;
        }

        let previous = '';
        shown.forEach((entry, index) => {
            const [group, en, fr, , action] = entry;
            if (group !== previous) {
                const title = document.createElement('li');
                title.className = 'palette-group';
                title.setAttribute('role', 'presentation');
                title.textContent = say(...groups[group]);
                list.append(title);
                previous = group;
            }
            const item = document.createElement('li');
            item.className = 'palette-item';
            item.id = 'palette-item-' + index;
            item.setAttribute('role', 'option');
            item.setAttribute('aria-selected', String(index === active));
            const mark = document.createElement('span');
            mark.className = 'palette-mark';
            mark.setAttribute('aria-hidden', 'true');
            mark.textContent = '>';
            const label = document.createElement('span');
            label.textContent = say(en, fr);
            const note = document.createElement('small');
            note.textContent = action.out ? '↗' : action.go ? '/' + action.go.split('#')[0].replace('.html', '').replace('index', '') : '';
            item.append(mark, label, note);
            item.addEventListener('click', () => choose(index));
            item.addEventListener('pointermove', () => { if (active !== index) select(index, false); });
            list.append(item);
        });
        input.setAttribute('aria-activedescendant', 'palette-item-' + active);
    }

    function select(index, scroll = true) {
        active = (index + shown.length) % shown.length;
        list.querySelectorAll('.palette-item').forEach((item, i) => {
            item.setAttribute('aria-selected', String(i === active));
            if (i === active && scroll) item.scrollIntoView({ block: 'nearest' });
        });
        input.setAttribute('aria-activedescendant', 'palette-item-' + active);
    }

    function choose(index) {
        const entry = shown[index];
        if (!entry) return;
        const action = entry[4];
        const item = list.querySelector('#palette-item-' + index);
        if (action.run) {
            action.run(item);
            if (!action.stay) dialog.close();
        } else if (action.out) {
            dialog.close();
            const link = document.createElement('a');
            link.href = action.out;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.click();
        } else {
            dialog.close();
            const [page, hash] = action.go.split('#');
            const here = location.pathname.split('/').pop() || 'index.html';
            // Same page: just move to the section. Other page: load it.
            if (page === here && hash) location.hash = hash;
            else if (page === here) scrollTo({ top: 0, behavior: 'smooth' });
            else location.href = action.go;
        }
    }

    function open() {
        if (dialog.open) return;
        input.value = '';
        active = 0;
        input.placeholder = say('Search pages, projects, skills...', 'Rechercher une page, un projet, une compétence...');
        input.setAttribute('aria-label', say('Search the site', 'Rechercher sur le site'));
        dialog.querySelector('[data-help="move"]').textContent = say('move', 'naviguer');
        dialog.querySelector('[data-help="open"]').textContent = say('open', 'ouvrir');
        dialog.querySelector('[data-help="close"]').textContent = say('close', 'fermer');
        render();
        dialog.showModal();
        list.scrollTop = 0;
    }

    openers.forEach(button => button.addEventListener('click', () => { lastOpener = button; open(); }));
    input.addEventListener('input', () => { active = 0; render(); });
    input.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') { event.preventDefault(); if (shown.length) select(active + 1); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); if (shown.length) select(active - 1); }
        else if (event.key === 'Home' && shown.length) { event.preventDefault(); select(0); }
        else if (event.key === 'End' && shown.length) { event.preventDefault(); select(shown.length - 1); }
        else if (event.key === 'Enter') { event.preventDefault(); choose(active); }
    });
    // A click on the dark area around the window closes it.
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    // Focus goes back to the button that opened the window (or to the visible one).
    dialog.addEventListener('close', () => {
        const button = lastOpener || openers.find(item => item.offsetParent !== null);
        lastOpener = null;
        if (button) button.focus({ preventScroll: true });
    });

    document.addEventListener('keydown', event => {
        const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
        if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            if (dialog.open) dialog.close(); else if (!document.querySelector('dialog[open]')) open();
        } else if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !document.querySelector('dialog[open]')) {
            event.preventDefault();
            open();
        }
    });
    // The language or the theme can change while the window is open (from its own actions).
    document.addEventListener('portfolio:languagechange', () => { if (dialog.open) { dialog.close(); } });
})();
