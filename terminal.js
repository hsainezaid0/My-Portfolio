// Makes the home page terminal usable: type a command, press Enter.
// Up / Down recall earlier commands, Tab completes, Ctrl+L clears the screen.
// Answers follow the site's language (English or French).
(() => {
    const terminal = document.getElementById('terminal');
    if (!terminal) return;
    const screen = terminal.querySelector('.terminal-content');
    const log = terminal.querySelector('.terminal-log');
    const form = terminal.querySelector('.terminal-form');
    const input = terminal.querySelector('.terminal-input');
    const footer = terminal.querySelector('.terminal-footer');
    const idle = terminal.querySelector('.terminal-idle');
    if (!screen || !log || !form || !input) return;

    const french = () => document.documentElement.lang === 'fr';
    const say = (en, fr) => (french() ? fr : en);

    const links = {
        email: 'hsainezaid@gmail.com',
        github: 'https://github.com/hsainezaid0',
        cv: 'https://hsainezaid0.github.io/CV---RESUME/'
    };
    const pages = {
        home: 'index.html',
        about: 'about.html',
        education: 'about.html#education-title',
        skills: 'skills.html',
        projects: 'projects.html',
        contact: 'contact.html'
    };
    const projects = [
        ['Personal portfolio', 'Portfolio personnel'],
        ['Snort intrusion detection', 'Détection d’intrusion Snort'],
        ['Smart parking (Arduino)', 'Parking intelligent (Arduino)'],
        ['EMSI hackathon app', 'Appli du hackathon EMSI'],
        ['Discord bot', 'Bot Discord']
    ];
    const skills = [
        ['Programming', 'Programmation', 'C, Python, SQL'],
        ['Web', 'Web', 'HTML, CSS, JavaScript'],
        ['Systems & tools', 'Systèmes & outils', 'Linux, Git, GitHub'],
        ['Cybersecurity', 'Cybersécurité', 'Networking, Footprinting,\n  Cryptography, Web security, Snort']
    ];
    const education = [
        ['2023', 'Scientific baccalaureate', 'Baccalauréat scientifique'],
        ['2023-24', 'Cybersecurity bootcamp', 'Bootcamp cybersécurité'],
        ['2024-25', 'EMSI, prep year 1', 'EMSI, cycle prépa 1'],
        ['2025-26', 'EMSI, prep year 2', 'EMSI, cycle prépa 2'],
        ['2026-27', 'EPITECH Paris, exchange', 'EPITECH Paris, échange']
    ];
    const files = {
        'profile.py': () => [
            'name = "Zaid Hsaine"',
            '',
            'school = "EMSI"',
            'exchange = "EPITECH Paris"',
            '',
            'interests = [',
            `    "${say('Cybersecurity', 'Cybersécurité')}",`,
            `    "${say('Software development', 'Développement logiciel')}"`,
            ']',
            '',
            `status = "${say('Still learning...', 'Toujours en apprentissage...')}"`
        ].join('\n'),
        'goals.py': () => [
            'goals = [',
            `    "${say('Build useful software', 'Créer des logiciels utiles')}",`,
            `    "${say('Understand security', 'Comprendre la sécurité')}",`,
            `    "${say('Learn through practice', 'Apprendre par la pratique')}",`,
            `    "${say('Keep improving', 'Continuer à progresser')}"`,
            ']',
            '',
            `mindset = "${say('Try. Debug. Repeat.', 'Essayer. Déboguer. Recommencer.')}"`
        ].join('\n'),
        'contact.txt': () => `email   ${links.email}\ngithub  ${links.github.replace('https://', '')}\ncv      ${links.cv.replace('https://', '')}`
    };

    const history = [];
    let historyIndex = null;

    const error = text => ({ text, error: true });

    // Each command returns the text to print (or nothing).
    const commands = {
        help: {
            about: ['List the commands', 'Lister les commandes'],
            run: () => {
                const names = Object.keys(commands).filter(name => !commands[name].hidden);
                const width = Math.max(...names.map(name => name.length));
                return { text: names.map(name => name.padEnd(width + 2) + say(...commands[name].about)).join('\n') };
            }
        },
        whoami: {
            about: ['Who is Zaid?', 'Qui est Zaid ?'],
            run: () => ({
                text: say(
                    'Zaid Hsaine, computer science student, Paris, FR\nStudent at EMSI, on exchange at EPITECH Paris.\nLooking for a cybersecurity alternance starting in 2027.',
                    'Zaid Hsaine, étudiant en informatique, Paris, FR\nÉtudiant à l’EMSI, en échange à EPITECH Paris.\nÀ la recherche d’une alternance en cybersécurité à partir de 2027.'
                )
            })
        },
        ls: {
            about: ['List files', 'Lister les fichiers'],
            run: () => ({ text: Object.keys(files).join('   ') })
        },
        cat: {
            about: ['Show a file', 'Lire un fichier'],
            run: args => {
                if (!args[0]) return error(say('Usage: cat <file>. Try cat goals.py', 'Usage : cat <fichier>. Essayez cat goals.py'));
                const file = files[args[0]];
                if (!file) return error(say(`cat: ${args[0]}: no such file`, `cat: ${args[0]} : fichier introuvable`));
                return { text: file() };
            }
        },
        projects: {
            about: ['My projects', 'Mes projets'],
            run: () => ({
                text: projects.map(([en, fr]) => '- ' + say(en, fr)).join('\n')
                    + say('\n\nType open projects for the details.', '\n\nTapez open projects pour les détails.')
            })
        },
        skills: {
            about: ['My skills', 'Mes compétences'],
            run: () => ({ text: skills.map(([en, fr, list]) => `${say(en, fr)}\n  ${list}`).join('\n') })
        },
        education: {
            about: ['My studies', 'Mon parcours'],
            run: () => ({ text: education.map(([year, en, fr]) => year.padEnd(9) + say(en, fr)).join('\n') })
        },
        contact: {
            about: ['Reach me', 'Me contacter'],
            run: () => ({ text: files['contact.txt']() })
        },
        open: {
            about: ['Open a page', 'Ouvrir une page'],
            run: args => {
                const page = args[0] || '';
                if (page === 'github' || page === 'cv') {
                    window.open(links[page], '_blank', 'noopener');
                    return { text: say(`Opening ${page} in a new tab...`, `Ouverture de ${page} dans un nouvel onglet...`) };
                }
                if (!pages[page]) {
                    const list = [...Object.keys(pages), 'github', 'cv'].join(', ');
                    return error(say(`No page named "${page}". Try: ${list}`, `Aucune page « ${page} ». Essayez : ${list}`));
                }
                setTimeout(() => { location.href = pages[page]; }, 350);
                return { text: say(`Opening ${page}...`, `Ouverture de ${page}...`) };
            }
        },
        theme: {
            about: ['Light / dark mode', 'Mode clair / sombre'],
            run: args => {
                if (args[0] !== 'dark' && args[0] !== 'light') {
                    return error(say('Usage: theme dark  or  theme light', 'Usage : theme dark  ou  theme light'));
                }
                if (typeof selectTheme === 'function') selectTheme(args[0]);
                return { text: `theme -> ${args[0]}` };
            }
        },
        lang: {
            about: ['English / French', 'Anglais / français'],
            run: args => {
                if (args[0] !== 'en' && args[0] !== 'fr') return error(say('Usage: lang en  or  lang fr', 'Usage : lang en  ou  lang fr'));
                const button = document.querySelector('.language-toggle');
                if (button && document.documentElement.lang !== args[0]) button.click();
                return { text: args[0] === 'fr' ? 'Langue : français' : 'Language: English' };
            }
        },
        history: {
            about: ['Past commands', 'Commandes tapées'],
            run: () => ({ text: history.map((line, index) => String(index + 1).padStart(3) + '  ' + line).join('\n') })
        },
        clear: {
            about: ['Clear the screen', 'Effacer l’écran'],
            run: () => { clear(); return null; }
        },
        sudo: {
            hidden: true,
            run: () => error(say('Nice try. This incident will be reported.', 'Bien essayé. Cet incident sera signalé.'))
        }
    };

    function print(text, kind) {
        const line = document.createElement(kind === 'input' ? 'p' : 'pre');
        line.className = 'terminal-line is-' + kind;
        if (kind === 'input') {
            const prompt = document.createElement('span');
            prompt.className = 'prompt';
            prompt.textContent = '$';
            line.append(prompt, ' ' + text);
        } else line.textContent = text;
        log.append(line);
    }

    function clear() {
        log.replaceChildren();
        // The first command and its file are part of the page: hide them too.
        screen.querySelectorAll(':scope > p:first-child, :scope > pre').forEach(element => { element.hidden = true; });
        screen.style.maxHeight = screen.offsetHeight + 'px';
        screen.style.minHeight = screen.offsetHeight + 'px';
    }

    function execute(raw) {
        const line = raw.trim();
        if (!line) return;
        history.push(line);
        historyIndex = null;
        print(line, 'input');
        const [name, ...args] = line.split(/\s+/);
        const command = commands[name.toLowerCase()];
        const result = command
            ? command.run(args)
            : error(say(`command not found: ${name}. Type help to see what's available.`,
                `commande introuvable : ${name}. Tapez help pour voir la liste.`));
        if (result && result.text) print(result.text, result.error ? 'error' : 'output');
        screen.scrollTop = screen.scrollHeight;
    }

    // Tab: completes the command name, or the argument of open / cat / lang / theme.
    function complete(value) {
        const parts = value.split(' ');
        if (parts.length === 1) {
            const matches = Object.keys(commands).filter(name => !commands[name].hidden && name.startsWith(parts[0].toLowerCase()));
            return matches.length === 1 ? matches[0] + ' ' : value;
        }
        const options = {
            open: [...Object.keys(pages), 'github', 'cv'],
            cat: Object.keys(files),
            lang: ['en', 'fr'],
            theme: ['dark', 'light']
        }[parts[0]];
        if (!options || parts.length !== 2) return value;
        const matches = options.filter(option => option.startsWith(parts[1]));
        return matches.length === 1 ? parts[0] + ' ' + matches[0] : value;
    }

    form.addEventListener('submit', event => {
        event.preventDefault();
        execute(input.value);
        input.value = '';
    });

    input.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (!history.length) return;
            historyIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
            input.value = history[historyIndex];
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (historyIndex === null) return;
            historyIndex++;
            if (historyIndex >= history.length) {
                historyIndex = null;
                input.value = '';
            } else input.value = history[historyIndex];
        } else if (event.key === 'Tab' && input.value) {
            const completed = complete(input.value);
            if (completed !== input.value) {
                event.preventDefault();
                input.value = completed;
            }
        } else if (event.key.toLowerCase() === 'l' && event.ctrlKey) {
            event.preventDefault();
            clear();
        }
    });

    // Clicking anywhere in the terminal puts the cursor in the command line,
    // unless the visitor is selecting text.
    screen.addEventListener('click', event => {
        if (event.target === input || String(getSelection())) return;
        input.focus({ preventScroll: true });
    });

    if (footer) {
        footer.querySelectorAll('[data-command]').forEach(button => {
            button.addEventListener('click', () => execute(button.dataset.command));
        });
        footer.hidden = false;
    }

    // Keep the terminal the size it has on arrival: longer output scrolls inside it.
    function fit() {
        log.hidden = true;
        screen.style.maxHeight = 'none';
        const height = screen.scrollHeight;
        log.hidden = false;
        screen.style.maxHeight = Math.max(height, 260) + 'px';
        screen.scrollTop = screen.scrollHeight;
    }

    if (idle) idle.hidden = true;
    form.hidden = false;
    terminal.classList.add('is-interactive');
    fit();
    addEventListener('resize', fit);
    document.addEventListener('portfolio:languagechange', () => requestAnimationFrame(fit));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
