const nav = document.querySelector('header nav');
if (nav) {
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'nav-toggle'; toggle.textContent = '☰ Menu';
    nav.id = 'main-navigation'; nav.classList.add('collapsible-nav');
    toggle.setAttribute('aria-controls', nav.id); toggle.setAttribute('aria-expanded', 'false');
    nav.before(toggle);
    const setOpen = open => { nav.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? '× Close' : '☰ Menu'; };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('click', e => { if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false); });
    nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); } });
    matchMedia('(max-width:700px)').addEventListener('change', () => setOpen(false));
}
const cards = [...document.querySelectorAll('.project-card')];
const filters = document.querySelector('.filter-bar');
if (filters) filters.addEventListener('click', e => {
    const button = e.target.closest('button'); if (!button) return;
    filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    cards.forEach(card => card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter);
    const count = cards.filter(card => !card.hidden).length;
    document.querySelector('#filter-status').textContent = `${count} project${count === 1 ? '' : 's'} shown`;
});
const canvas = document.getElementById('matrix');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (canvas) {
 const ctx = canvas.getContext('2d'); let points = [], frame = 0, last = 0;
 function resize(){const dpr = Math.min(devicePixelRatio || 1, 2);canvas.width = innerWidth*dpr;canvas.height = innerHeight*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);points=Array.from({length:Math.min(46,Math.floor(innerWidth/25))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3}));draw(0);}
 function draw(step){ctx.clearRect(0,0,innerWidth,innerHeight);points.forEach((p,i)=>{p.x=(p.x+p.vx*step+innerWidth)%innerWidth;p.y=(p.y+p.vy*step+innerHeight)%innerHeight;ctx.fillStyle='#63ead3';ctx.fillRect(p.x,p.y,2,2);for(let j=i+1;j<points.length;j++){const q=points[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<150){ctx.strokeStyle=`rgba(99,234,211,${(1-d/150)*.4})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}});}
 function animate(time){draw(last ? Math.min((time-last)/16.67,2) : 1);last=time;frame=requestAnimationFrame(animate);}
 function sync(){cancelAnimationFrame(frame);last=0;if(!document.hidden&&!reducedMotion.matches)frame=requestAnimationFrame(animate);else draw(0);}
 addEventListener('resize', resize);document.addEventListener('visibilitychange',sync);reducedMotion.addEventListener('change',sync);resize();sync();
}
