// Cards lean towards the mouse in 3D, lift a little, and carry a soft light
// that follows the cursor. Touch screens and visitors who prefer reduced
// motion keep flat cards.
(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)');

    // selector: [maximum angle in degrees, lift in pixels, growth]
    const groups = {
        '.project-tile > article': [7, 7, 1.015],
        '.explore-grid a': [8, 6, 1.02],
        '.service-card': [8, 6, 1.02],
        '.skill-group': [3, 4, 1.006],
        '.journey-card': [4, 4, 1.01],
        '.reach-form, .reach-side': [2.5, 3, 1.004]
    };

    Object.entries(groups).forEach(([selector, [angle, lift, growth]]) => {
        document.querySelectorAll(selector).forEach(card => {
            const light = document.createElement('span');
            light.className = 'tilt-light';
            light.setAttribute('aria-hidden', 'true');
            card.classList.add('tilt');
            card.prepend(light);

            // Current and wanted values: rotation X, rotation Y, hover amount (0 to 1).
            const now = [0, 0, 0], goal = [0, 0, 0];
            let frame = 0, last = 0;

            function animate(time) {
                const delta = last ? Math.min((time - last) / 1000, 0.05) : 0.016;
                last = time;
                const ease = 1 - Math.exp(-11 * delta);
                let moving = false;
                for (let i = 0; i < 3; i++) {
                    now[i] += (goal[i] - now[i]) * ease;
                    if (Math.abs(goal[i] - now[i]) > 0.002) moving = true; else now[i] = goal[i];
                }
                if (!moving && !goal[2]) {
                    card.style.transform = '';
                    frame = 0;
                    last = 0;
                    return;
                }
                card.style.transform = `perspective(900px) rotateX(${now[0].toFixed(3)}deg) rotateY(${now[1].toFixed(3)}deg) `
                    + `translateY(${(-lift * now[2]).toFixed(2)}px) scale(${(1 + (growth - 1) * now[2]).toFixed(4)})`;
                frame = moving ? requestAnimationFrame(animate) : 0;
                if (!moving) last = 0;
            }

            const start = () => { if (!frame) frame = requestAnimationFrame(animate); };

            card.addEventListener('pointermove', event => {
                if (event.pointerType !== 'mouse' || still.matches) return;
                const box = card.getBoundingClientRect();
                const x = (event.clientX - box.left) / box.width;
                const y = (event.clientY - box.top) / box.height;
                card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
                card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
                card.classList.add('is-tilting');
                // Stay flat while someone is typing inside the card.
                const typing = card.matches(':focus-within') && card.querySelector('input:focus, textarea:focus');
                goal[0] = typing ? 0 : (0.5 - y) * 2 * angle;
                goal[1] = typing ? 0 : (x - 0.5) * 2 * angle;
                goal[2] = typing ? 0 : 1;
                start();
            });

            card.addEventListener('pointerleave', () => {
                card.classList.remove('is-tilting');
                goal[0] = goal[1] = goal[2] = 0;
                start();
            });
        });
    });
})();
