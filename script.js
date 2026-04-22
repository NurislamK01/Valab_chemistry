/* ===== Core Script ===== */

// Navbar
const navbar=document.getElementById('navbar'),navToggle=document.getElementById('nav-toggle'),navLinks=document.getElementById('nav-links');
if(navToggle&&navLinks){navToggle.addEventListener('click',()=>navLinks.classList.toggle('active'));navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>navLinks.classList.remove('active')))}
window.addEventListener('scroll',()=>{if(navbar)navbar.classList.toggle('scrolled',scrollY>50)});

// Scroll Animations
const obs=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('visible')}),{threshold:.1,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.animate-on-scroll').forEach(el=>obs.observe(el));

// Stat Counter
document.querySelectorAll('[data-count]').forEach(el=>{const t=+el.dataset.count;const o=new IntersectionObserver(e=>{if(e[0].isIntersecting){let c=0;const s=Math.max(1,Math.floor(t/30));const i=setInterval(()=>{c+=s;if(c>=t){c=t;clearInterval(i)}el.textContent=c},50);o.unobserve(el)}},{threshold:.5});o.observe(el)});

// Hero Canvas - Particle Network
const heroCanvas=document.getElementById('hero-canvas');
if(heroCanvas){
    const ctx=heroCanvas.getContext('2d');
    let W,H,particles=[];
    function resize(){W=heroCanvas.width=heroCanvas.offsetWidth;H=heroCanvas.height=heroCanvas.offsetHeight}
    resize();window.addEventListener('resize',resize);
    class Particle{constructor(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=(Math.random()-.5)*.5;this.vy=(Math.random()-.5)*.5;this.r=Math.random()*2+.5;this.a=Math.random()*.5+.1}
    update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>W)this.vx*=-1;if(this.y<0||this.y>H)this.vy*=-1}
    draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle=`rgba(0,229,255,${this.a})`;ctx.fill()}}
    for(let i=0;i<60;i++)particles.push(new Particle());
    function animate(){ctx.clearRect(0,0,W,H);particles.forEach(p=>{p.update();p.draw()});
    for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy);
    if(d<120){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(0,229,255,${.15*(1-d/120)})`;ctx.lineWidth=.5;ctx.stroke()}}
    requestAnimationFrame(animate)}animate();
}

// Theory Tabs
document.querySelectorAll('.th-tab').forEach(btn=>{
    btn.addEventListener('click',()=>{
        document.querySelectorAll('.th-tab').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.theory-content').forEach(c=>c.style.display='none');
        const el=document.getElementById('theory-'+btn.dataset.el);
        if(el)el.style.display='block';
    });
});

// Notification
function showNotif(msg){const n=document.createElement('div');n.className='notif';n.textContent=msg;document.body.appendChild(n);setTimeout(()=>n.remove(),3000)}

// Document Upload (Theory page)
const docFile=document.getElementById('doc-file');
if(docFile){docFile.addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();
reader.onload=ev=>{const content=document.getElementById('doc-content');content.style.display='block';
const text=ev.target.result;
const highlighted=text.replace(/(NH[₃3]|HNO[₃3]|H[₃3]PO[₄4]|N[₂2]|P[₄4]|PCl[₃35]|NO[₂2]|As|Sb|Bi|GaAs)/gi,'<mark style="background:rgba(0,229,255,.15);color:#00e5ff;padding:2px 4px;border-radius:3px">$1</mark>');
content.innerHTML='<h4>📄 '+file.name+'</h4>'+highlighted;
showNotif('Құжат жүктелді: '+file.name)};
reader.readAsText(file)})}

// Language (basic)
const langSelect=document.getElementById('lang-select');
if(langSelect){langSelect.addEventListener('change',()=>{showNotif('Тіл таңдалды: '+langSelect.options[langSelect.selectedIndex].text)})}
