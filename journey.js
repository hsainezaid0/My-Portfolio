// Education diagram on the About page: the steps are nodes joined by a path
// that draws itself as the visitor scrolls. Each node lights up when the line
// reaches it. The path is computed from the real position of the nodes, so it
// always passes through them, whatever the screen size or the text length.
(() => {
    const journey = document.querySelector('.journey');
    if (!journey) return;
    const steps = [...journey.querySelectorAll('.journey-step')];
    const nodes = steps.map(step => step.querySelector('.journey-node'));
    if (nodes.length < 2 || nodes.includes(null)) return;

    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const SVG = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'journey-svg');
    svg.setAttribute('aria-hidden', 'true');
    const track = document.createElementNS(SVG, 'path');
    track.setAttribute('class', 'journey-track');
    const line = document.createElementNS(SVG, 'path');
    line.setAttribute('class', 'journey-line');
    svg.append(track, line);
    journey.prepend(svg);
    journey.classList.add('is-live');

    let length = 0;          // total length of the path
    let reachAt = [];        // length of the path at each node
    let shown = 0;           // part of the path currently drawn (0 to 1)
    let target = 0;          // part that should be drawn for this scroll position
    let frame = 0;

    // Position of an element inside the diagram. offsetLeft / offsetTop ignore CSS
    // transforms, so the result is right even while a section is still appearing.
    function place(element) {
        let x = 0, y = 0;
        for (let current = element; current && current !== journey; current = current.offsetParent) {
            x += current.offsetLeft;
            y += current.offsetTop;
        }
        return { x, y, width: element.offsetWidth, height: element.offsetHeight };
    }

    // The path leaves a node, runs through the empty space between two steps
    // and comes down on the next node, with rounded corners.
    function measure() {
        const points = nodes.map(node => {
            const box = place(node);
            return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        });
        const rows = steps.map(place);
        let d = `M ${points[0].x} ${points[0].y}`;
        reachAt = [0];
        for (let i = 1; i < points.length; i++) {
            const a = points[i - 1], b = points[i];
            const side = Math.sign(b.x - a.x);
            if (side) {
                const gap = (rows[i - 1].y + rows[i - 1].height + rows[i].y) / 2;
                const corner = Math.max(0, Math.min(18, gap - a.y, b.y - gap, Math.abs(b.x - a.x) / 2));
                d += ` L ${a.x} ${gap - corner} Q ${a.x} ${gap} ${a.x + side * corner} ${gap}`
                    + ` L ${b.x - side * corner} ${gap} Q ${b.x} ${gap} ${b.x} ${gap + corner}`;
            }
            d += ` L ${b.x} ${b.y}`;
            track.setAttribute('d', d);
            reachAt.push(track.getTotalLength());
        }
        svg.setAttribute('viewBox', `0 0 ${journey.offsetWidth} ${journey.offsetHeight}`);
        line.setAttribute('d', d);
        length = reachAt[reachAt.length - 1];
        line.style.strokeDasharray = `${length} ${length}`;
        update();
        render();
    }

    // The line starts when the diagram enters the lower part of the screen
    // and is complete a little before its end leaves the middle.
    function update() {
        if (still.matches) {
            target = shown = 1;
            return;
        }
        const box = journey.getBoundingClientRect();
        const progress = (innerHeight * 0.72 - box.top) / (box.height + innerHeight * 0.12);
        target = Math.max(0, Math.min(1, progress));
    }

    function render() {
        line.style.strokeDashoffset = String(length * (1 - shown));
        line.style.visibility = shown > 0.001 ? 'visible' : 'hidden';
        const drawn = length * shown;
        steps.forEach((step, index) => {
            step.classList.toggle('is-reached', shown > 0 && drawn >= reachAt[index] - 1);
        });
    }

    // The line follows the scroll position smoothly. The speed depends on real
    // time, not on the number of frames, so it ends on time on slow screens too.
    let lastTime = 0;
    function animate(now) {
        const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0.016;
        lastTime = now;
        const distance = target - shown;
        const step = distance * (1 - Math.exp(-9 * delta)) + Math.sign(distance) * 0.15 * delta;
        shown = Math.abs(step) >= Math.abs(distance) ? target : shown + step;
        if (shown === target) {
            frame = 0;
            lastTime = 0;
        } else frame = requestAnimationFrame(animate);
        render();
    }

    function onScroll() {
        update();
        if (still.matches) render();
        else if (!frame && shown !== target) frame = requestAnimationFrame(animate);
    }

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    still.addEventListener('change', onScroll);
    if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); onScroll(); }).observe(journey);
    // Fonts and the language switch change the height of the cards.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    document.addEventListener('portfolio:languagechange', () => requestAnimationFrame(measure));
    measure();
    onScroll();
})();
