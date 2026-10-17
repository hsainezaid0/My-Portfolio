const navigation = document.querySelector('header nav');

if (navigation) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.setAttribute('aria-expanded', 'false');
    navigation.id = 'main-navigation';
    toggle.setAttribute('aria-controls', navigation.id);
    toggle.innerHTML = '<span class="nav-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span><span class="nav-toggle-label">Menu</span>';
    navigation.before(toggle);
    navigation.classList.add('collapsible-nav');

    function setMenuOpen(open) {
        navigation.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    }

    toggle.addEventListener('click', () => {
        setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    navigation.addEventListener('click', event => {
        if (event.target.closest('a')) setMenuOpen(false);
    });
    document.addEventListener('click', event => {
        if (!navigation.contains(event.target) && !toggle.contains(event.target)) {
            setMenuOpen(false);
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setMenuOpen(false);
            toggle.focus();
        }
    });
    window.matchMedia('(max-width: 600px)').addEventListener('change', () => setMenuOpen(false));
}

const canvas = document.getElementById('matrix');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (canvas) {
 const ctx = canvas.getContext('2d'); let points = [], frame = 0, last = 0;
 function resize(){const dpr = Math.min(devicePixelRatio || 1, 2);canvas.width = innerWidth*dpr;canvas.height = innerHeight*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);points=Array.from({length:Math.min(140,Math.max(40,Math.floor(innerWidth/10)))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3}));draw(0);}
 function draw(step){ctx.clearRect(0,0,innerWidth,innerHeight);points.forEach((p,i)=>{p.x=(p.x+p.vx*step+innerWidth)%innerWidth;p.y=(p.y+p.vy*step+innerHeight)%innerHeight;ctx.fillStyle='#63ead3';ctx.fillRect(p.x,p.y,3,3);for(let j=i+1;j<points.length;j++){const q=points[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<150){ctx.strokeStyle=`rgba(99,234,211,${(1-d/150)*.55})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}});}
 function animate(time){draw(last ? Math.min((time-last)/16.67,2) : 1);last=time;frame=requestAnimationFrame(animate);}
 function sync(){cancelAnimationFrame(frame);last=0;if(!document.hidden&&!reducedMotion.matches)frame=requestAnimationFrame(animate);else draw(0);}
 addEventListener('resize', resize);document.addEventListener('visibilitychange',sync);reducedMotion.addEventListener('change',sync);resize();sync();
}


// Reveal sections once as they enter the viewport.
(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const targets = [...document.querySelectorAll('.home-text, .home-layout > .terminal, .technologies, .section-heading, .work-preview > a, .panel, .timeline > li')];
    if (!motion.matches && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
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
        motion.addEventListener('change', () => {
            if (motion.matches) {
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
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.timeline, .skills-grid, .work-preview').forEach(group => {
        [...group.children].forEach((item, index) => {
            item.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 120}ms`);
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