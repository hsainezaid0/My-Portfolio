const navigation = document.querySelector('header nav');

if (navigation) {
    const icons = {
        'index.html': '<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
        'about.html': '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
        'skills.html': '<path d="M12 5C8 2 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-6-2-10 1Zm0 0v16"/>',
        'projects.html': '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3"/>',
        'contact.html': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>'
    };
    navigation.querySelectorAll('a').forEach(link => {
        const paths = icons[link.getAttribute('href').replace(/^\//, '')];
        if (!paths) return;
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('class', 'nav-icon');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('stroke-width', '1.7');
        icon.setAttribute('stroke-linecap', 'round');
        icon.setAttribute('stroke-linejoin', 'round');
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = paths; 
        link.prepend(icon);
    });
}

// Animated background particles.
const canvas = document.getElementById('matrix');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (canvas) {
    const ctx = canvas.getContext('2d'); //	Contexte contenant les outils de dessin 2D
    let points = [];//Tableau des points à afficher
    let frame = 0;// Identifiant de la prochaine animation demandée
    let last = 0; // Horodatage de l’image précédente

    function resize() { //Adapter le canvas à la fenêtre avec resize()
        const dpr = Math.min(devicePixelRatio || 1, 2); // Cette instruction vérifie la préférence d’accessibilité concernant la réduction des animations.
        canvas.width = innerWidth * dpr; //la résolution interne du dessin
        canvas.height = innerHeight * dpr;
        canvas.style.width = innerWidth + 'px'; // la taille affichée en CSS
        canvas.style.height = innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); //adapte l’échelle de dessin


        // Crée un tableau de points avec des positions et des vitesses aléatoires

        points = Array.from({ length: Math.min(140, Math.max(40, Math.floor(innerWidth / 10))) }, () => ({
            x: Math.random() * innerWidth,
            y: Math.random() * innerHeight,
            vx: (Math.random() - .5) * .3,
            vy: (Math.random() - .5) * .3
        }));
        draw(0); // Dessine les points sans les déplacer.
    }

    // Dessine les points et les lignes entre eux
    function draw(step) {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        points.forEach((point, index) => {
            point.x = (point.x + point.vx * step + innerWidth) % innerWidth;
            point.y = (point.y + point.vy * step + innerHeight) % innerHeight;
            ctx.fillStyle = '#63ead3';
            ctx.fillRect(point.x, point.y, 3, 3);
            for (let next = index + 1; next < points.length; next++) {
                const other = points[next];
                const distance = Math.hypot(point.x - other.x, point.y - other.y);
                if (distance >= 150) continue;
                ctx.strokeStyle = 'rgba(99,234,211,' + (1 - distance / 150) * .55 + ')';
                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
            }
        });
    }
    
    // Animation loop that draws the points and lines at a consistent frame rate
    function animate(time) {
        draw(last ? Math.min((time - last) / 16.67, 2) : 1);
        last = time;
        frame = requestAnimationFrame(animate);
    }
    // Synchronizes the animation with the visibility of the page and user preferences
    function sync() {
        cancelAnimationFrame(frame);
        last = 0;
        if (!document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(animate);
        else draw(0);
    }
    // Set up event listeners for window resize, visibility change, and reduced motion preference change
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    resize();
    sync();
}

// Reveal sections once as they enter the viewport.
(() => {
    const targets = [...document.querySelectorAll('.home-text, .home-layout > .terminal, .technologies, .section-heading, .work-preview > a, .panel, .timeline > li')];
    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => { // fach katl3 l page w kayban element kayweli is revealed 
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
        targets.forEach(element => {
            element.classList.add('scroll-reveal');
            observer.observe(element);
        });
        reducedMotion.addEventListener('change', () => {
            if (reducedMotion.matches) {
                observer.disconnect();
                targets.forEach(element => element.classList.add('is-revealed'));
            }
        });
    }
    // Wrap only the arrow glyph so link text stays still.
    document.querySelectorAll('.button, .about-link, .text-link, .contact-link').forEach(link => {
        const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => {
            if (!/[↗→]/.test(node.textContent)) return;
            const fragment = document.createDocumentFragment();
            node.textContent.split(/([↗→])/).forEach(part => {
                if (/^[↗→]$/.test(part)) {
                    const arrow = document.createElement('span');
                    arrow.className = 'animated-arrow';
                    arrow.textContent = part;
                    fragment.append(arrow);
                } else fragment.append(document.createTextNode(part));
            });
            node.replaceWith(fragment);
        });
    });
})();
// Visible stagger and a one-time terminal command typing effect.
(() => {
    if (reducedMotion.matches) return;
    document.querySelectorAll('.timeline, .skills-grid, .work-preview').forEach(group => {
        [...group.children].forEach((item, index) => {
            item.style.setProperty('--reveal-delay', `${index % 4 * 120}ms`);
        });
    });
    const command = document.querySelector('.home-layout .terminal-content > p:first-child');
    if (!command) return;
    const prompt = command.querySelector('.prompt');
    if (!prompt) return;
    const text = ' cat profile.py';
    const typed = document.createElement('span');
    command.replaceChildren(prompt, typed);
    let position = 0;
    const type = () => {
        if (!command.isConnected) return;
        typed.textContent = text.slice(0, ++position);
        if (position < text.length) setTimeout(type, 85);
    };
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                observer.disconnect();
                setTimeout(type, 400);
            }
        });
        observer.observe(command);
    } else type();
})();
