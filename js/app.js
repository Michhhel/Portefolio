/* Contenu, langue, thème, navigation, pages projet et interactions. Tout le texte vient de data/content.json. */
(()=>{
'use strict';
const root=document.documentElement,$=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,SIG=window.SIG||{};
const Q=new URLSearchParams(location.search),LV=Q.get('v'),CHECK=Q.has('check');
if(CHECK)root.classList.add('chk');
let D,U,lang='',first=true,lenis=null,hoverAt=false;
try{lang=localStorage.getItem('lang')||''}catch(e){}
if(lang!=='fr'&&lang!=='en')lang=(navigator.language||'fr').toLowerCase().startsWith('fr')?'fr':'en';

const load=()=>fetch('data/content.json').then(r=>{if(!r.ok)throw 0;return r.json()}).catch(()=>{const n=$('#c');return n?JSON.parse(n.textContent):null});
const merge=k=>(D.fr[k]||[]).map((b,i)=>({...b,...((D[lang][k]||[])[i]||{})}));
const lens=()=>(D.lens||{})[LV];
const projects=()=>{const P=merge('pj'),f=(lens()||{}).first;return f?P.sort((a,b)=>(f.indexOf(a.id)+1||99)-(f.indexOf(b.id)+1||99)):P};
const tags=a=>(a||[]).map(t=>`<li>${t}</li>`).join('');
const chk=x=>x&&x.chk?' data-chk':'';

/* ---------- mini-visualisations (illustratives, aucune donnée réelle) ---------- */
const V={
 dist(){const g=(m,s,h)=>{let d='';for(let x=0;x<=240;x+=6){const y=110-h*Math.exp(-((x-m)**2)/(2*s*s));d+=(x?'L':'M')+x+' '+y.toFixed(1)}return d};
  return`<path class="v0 fl" d="${g(95,34,70)}L240 110L0 110Z"/><path class="v1 ln" d="${g(95,34,70)}"/><path class="v2 ln" d="${g(140,30,58)}"/><path class="v0 dash" d="M118 14V112"/>`},
 ba(){let s='';[[40,58],[34,70],[52,74],[28,52]].forEach(([a,b],i)=>{const x=22+i*56;s+=`<rect class="v0 bar" x="${x}" y="${110-a}" width="18" height="${a}" rx="2"/><rect class="v1 bar" x="${x+22}" y="${110-b}" width="18" height="${b}" rx="2"/>`});return s},
 risk(){let d='';for(let x=0;x<=240;x+=5){const u=x/40+.01,y=110-95*Math.pow(u,1.6)*Math.exp(-u)/1.1;d+=(x?'L':'M')+x+' '+y.toFixed(1)}
  let t='M170 110';for(let x=170;x<=240;x+=5){const u=x/40,y=110-95*Math.pow(u,1.6)*Math.exp(-u)/1.1;t+='L'+x+' '+y.toFixed(1)}t+='L240 110Z';
  return`<path class="v2 fl2" d="${t}"/><path class="v1 ln" d="${d}"/><path class="v0 dash" d="M170 20V112"/>`},
 rows(){let s='';for(let i=0;i<6;i++){const y=16+i*16;s+=`<rect class="v0 bar row" style="--i:${i}" x="12" y="${y}" width="${60+(i*17)%30}" height="7" rx="2"/><rect class="v1 bar row" style="--i:${i}" x="150" y="${y}" width="${36}" height="7" rx="2"/><rect class="v1 bar row o" style="--i:${i}" x="192" y="${y}" width="${22+(i*11)%18}" height="7" rx="2"/>`}
  return s+`<path class="v2 ln" d="M104 58H136M128 50L136 58L128 66"/>`},
 survey(){let s='';for(let i=0;i<32;i++){const c=i%8,r=Math.floor(i/8);s+=`<circle class="${i<3?'v2':'v1'} dot" style="--i:${i}" cx="${28+c*26}" cy="${22+r*24}" r="${i<3?5:4}"/>`}return s},
 bars(){let s='';[96,82,70,61,50,38].forEach((w,i)=>{s+=`<rect class="${i===0?'v2':'v1'} bar" x="16" y="${12+i*16}" width="${w*2}" height="9" rx="2"/>`});return s},
 line(){const P=[[0,86],[30,80],[60,84],[90,66],[120,70],[150,52],[180,48],[210,34],[240,28]];const d=P.map((p,i)=>(i?'L':'M')+p.join(' ')).join('');
  return`<path class="v0 fl" d="${d}L240 112L0 112Z"/><path class="v1 ln" d="${d}"/>${P.map(p=>`<circle class="v1 dot" cx="${p[0]}" cy="${p[1]}" r="2.6"/>`).join('')}`},
 nn(){const L=[[30,[24,56,88]],[120,[16,40,64,88]],[210,[40,72]]];let s='';
  for(let a=0;a<2;a++)for(const y1 of L[a][1])for(const y2 of L[a+1][1])s+=`<path class="v0 edge" d="M${L[a][0]} ${y1}L${L[a+1][0]} ${y2}"/>`;
  L.forEach(([x,ys],a)=>ys.forEach(y=>{s+=`<circle class="${a===2?'v2':'v1'} dot" cx="${x}" cy="${y}" r="6"/>`}));return s},
 dash(){return`<rect class="v0 tile" x="10" y="10" width="64" height="34" rx="5"/><rect class="v0 tile" x="88" y="10" width="64" height="34" rx="5"/><rect class="v0 tile" x="166" y="10" width="64" height="34" rx="5"/>
  <path class="v1 ln" d="M20 30H52M98 30H128M176 30H214"/>${[30,44,38,56,50,64,60,70].map((h,i)=>`<rect class="${i===7?'v2':'v1'} bar" x="${14+i*28}" y="${112-h}" width="16" height="${h}" rx="2"/>`).join('')}`}
};
const viz=(k,cls='')=>`<svg class="viz ${cls}" viewBox="0 0 240 120" aria-hidden="true" focusable="false">${(V[k]||V.line)()}</svg>`;

/* ---------- rendu ---------- */
function splitWords(el){
 if(el.dataset.split===lang)return;el.dataset.split=lang;
 const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();
   c.textContent.split(/(\s+)/).forEach(w=>{if(!w)return;if(/^\s+$/.test(w)){f.appendChild(document.createTextNode(w));return}
    const o=document.createElement('span');o.className='w';const i=document.createElement('span');i.textContent=w;o.appendChild(i);f.appendChild(o)});c.replaceWith(f)}
   else if(c.nodeType===1)walk(c)})};walk(el);
}
function text(){
 U={...D.fr.ui,...D[lang].ui};const ln=lens();if(ln&&ln.sub&&ln.sub[lang])U['h.sub']=ln.sub[lang];
 root.lang=lang;$('meta[name=description]').content=U.desc;
 $$('[data-i]').forEach(e=>{const v=U[e.dataset.i];if(v!=null){e.innerHTML=v;delete e.dataset.split}});
 (D.cfg.chk||[]).forEach(k=>$$(`[data-i="${k}"]`).forEach(e=>e.setAttribute('data-chk','')));
 $('#tg').setAttribute('aria-label',U.theme);$('#bg').setAttribute('aria-label',U.menu);$('#hudl').textContent=U.hud;
 const b=$('#lg');b.textContent=lang==='fr'?'EN':'FR';b.setAttribute('aria-label',lang==='fr'?'Switch to English':'Passer en français');
}
function sections(){
 // atouts
 const AT=merge('at');
 $('#at').innerHTML=AT.map((x,i)=>`<li tabindex="0" data-k="${i}"><span class="an">${x.n}</span><div><h3>${x.t}</h3><p>${x.d}</p></div></li>`).join('');
 SIG.labels=AT.map(x=>x.n);
 // parcours
 const TL=merge('tl');SIG.miles=TL.map(x=>x.x);
 $('#tl').innerHTML=TL.map((x,i)=>`<li data-k="${i}"${chk(x)}><p class="tw">${x.w}</p><h3>${x.t}</h3><p class="to">${x.o}</p><p class="td">${x.d}</p></li>`).join('');
 // projets
 const P=projects(),n=P.length,rest=(n-2)%3;
 $('#pj').innerHTML=P.map((x,i)=>{let sp=i<2?'b':'s';if(rest===1&&i===n-1)sp='w';if(rest===2&&i>=n-2)sp='b';
  return`<a class="pc ${sp}" href="#/projet/${x.id}"${chk(x)}>${viz(x.viz)}<div class="pb"><p class="pk">${x.c}${x.w?`<span>${x.w}</span>`:''}</p><h3>${x.t}</h3><p class="pd">${x.d}</p>${x.m?`<p class="pm">${x.m}</p>`:''}<ul class="tags">${tags(x.k)}</ul><p class="po">${x.det?U['pj.more']:`<span class="soon">${U['pj.soon']}</span>${U['pj.more']}`}</p></div></a>`}).join('');
 // compétences
 network();
 $('#skl').innerHTML=merge('sk').map(x=>`<div><h3>${x.t}</h3><ul class="tags">${tags(x.k)}</ul></div>`).join('');
 $('#sx').innerHTML=merge('sx').map(x=>`<div><h3>${x.t}</h3><ul class="tags">${tags(x.k)}</ul></div>`).join('');
 // engagements
 $('#ld').innerHTML=merge('ld').map(x=>`<div class="li"${chk(x)}><p class="ln">${x.n}</p><h3>${x.t}</h3><p>${x.d}</p></div>`).join('');
 const ph=merge('ph').filter(x=>x.s);
 $('#ph').innerHTML=ph.map(x=>`<figure><img src="${x.s}" alt="${x.a||x.c}" loading="lazy"><figcaption>${x.c}</figcaption></figure>`).join('');$('#ph').hidden=!ph.length;
 // contact et identité
 const c=D.cfg;
 if(c.email){$('#em').href='mailto:'+c.email;$('#em').hidden=false}
 if(c.cv){$('#cvb').href=c.cv;$('#cvb').hidden=false}
 $('#li').href=c.linkedin;$('#gh').href=c.github;
 if(c.avatar){const a=$('#av');a.innerHTML=`<img src="${c.avatar}" alt="" width="64" height="64">`;a.hidden=false}
 if(c.portrait){const i=$('#hpi');if(!i.getAttribute('src')){i.srcset=`${c.portrait.replace('880','480')} 480w, ${c.portrait} 880w`;i.sizes='(max-width: 899px) 0px, 36vw';i.src=c.portrait}i.alt=U['h.alt'];$('#hp').hidden=false;$('#top').classList.add('hasp')}
 // rail des chapitres
 $('#rail').innerHTML=['vision','atouts','parcours','projets','competences','engagements','contact'].map(id=>`<li><a href="#${id}" data-r="${id}" tabindex="-1"><span>${U['nav.'+id]}</span></a></li>`).join('');
 $$('#vision h2, #atouts h2, #parcours h2, #projets h2, #competences h2, #engagements h2, #contact h2').forEach(splitWords);
 watch();
}

/* ---------- réseau des compétences ---------- */
function network(){
 const svg=$('#net'),SK=merge('sk'),P=merge('pj'),cx=500,cy=320,NS='http://www.w3.org/2000/svg';
 const hubs=SK.map((s,i)=>{const a=[-135,135,-45,45][i]*Math.PI/180;return{t:s.t,a,x:cx+Math.cos(a)*175,y:cy+Math.sin(a)*130,i}});
 const tools={};SK.forEach((s,i)=>D.fr.sk[i].k.forEach(k=>{(tools[k]=tools[k]||{n:k,h:[]}).h.push(i)}));
 const byHub=hubs.map(()=>[]);Object.values(tools).forEach(t=>{if(t.h.length===1)byHub[t.h[0]].push(t)});
 byHub.forEach((L,h)=>{const sp=Math.min(17,70/Math.max(1,L.length-1));L.forEach((t,j)=>{const a=hubs[h].a+((j-(L.length-1)/2)*sp)*Math.PI/180;t.x=cx+Math.cos(a)*350;t.y=cy+Math.sin(a)*262;t.a=a})});
 Object.values(tools).filter(t=>t.h.length>1).forEach((t,j)=>{const a=Math.atan2(t.h.reduce((s,h)=>s+Math.sin(hubs[h].a),0),t.h.reduce((s,h)=>s+Math.cos(hubs[h].a),0));t.x=cx+Math.cos(a)*240;t.y=cy+Math.sin(a)*205;t.a=a;t.multi=1});
 let s=`<title id="netcap">${U['sk.h']}</title><g class="ed">`;
 hubs.forEach(h=>{s+=`<line class="e0" x1="${cx}" y1="${cy}" x2="${h.x}" y2="${h.y}"/>`});
 Object.values(tools).forEach(t=>t.h.forEach(h=>{s+=`<line class="e1" data-t="${t.n}" x1="${hubs[h].x}" y1="${hubs[h].y}" x2="${t.x}" y2="${t.y}"/>`}));
 s+=`</g><circle class="core" cx="${cx}" cy="${cy}" r="7"/>`;
 hubs.forEach(h=>{const up=h.y<cy;s+=`<g class="hub"><circle cx="${h.x}" cy="${h.y}" r="11"/><text x="${h.x}" y="${h.y+(up?-22:32)}" text-anchor="middle">${h.t}</text></g>`});
 Object.values(tools).forEach(t=>{const c=Math.cos(t.a),anc=Math.abs(c)<.3?'middle':c>0?'start':'end',dx=Math.abs(c)<.3?0:c>0?12:-12,dy=Math.abs(c)<.3?(Math.sin(t.a)>0?22:-14):5;
  s+=`<g class="tool${t.multi?' m':''}" tabindex="0" role="button" data-t="${t.n}"><circle cx="${t.x}" cy="${t.y}" r="${t.multi?7:5.5}"/><text x="${t.x+dx}" y="${t.y+dy}" text-anchor="${anc}">${t.n}</text></g>`});
 svg.innerHTML=s;
 const panel=$('#np'),idle=`<p class="nh">${U['sk.hint']}</p>`;panel.innerHTML=idle;
 const show=name=>{
  svg.classList.toggle('foc',!!name);$$('.tool',svg).forEach(g=>g.classList.toggle('on',g.dataset.t===name));$$('.e1',svg).forEach(l=>l.classList.toggle('on',l.dataset.t===name));
  if(!name){panel.innerHTML=idle;return}
  const t=tools[name],used=P.filter(p=>(D.fr.pj.find(q=>q.id===p.id).tools||[]).includes(name));
  panel.innerHTML=`<h3>${name}</h3><p class="nf">${t.h.map(h=>hubs[h].t).join(' · ')}</p><p class="nu">${U['sk.used']}</p>${used.length?`<ul>${used.map(p=>`<li><a href="#/projet/${p.id}">${p.t}</a></li>`).join('')}</ul>`:`<p class="nn">${U['sk.nouse']}</p>`}`};
 $$('.tool',svg).forEach(g=>{g.addEventListener('mouseenter',()=>show(g.dataset.t));g.addEventListener('focus',()=>show(g.dataset.t));g.addEventListener('click',()=>show(g.dataset.t))});
 svg.addEventListener('mouseleave',()=>show(null));
}

/* ---------- observateurs : rail, chapitre actif, atout et jalon actifs ---------- */
let obs=[];
function watch(){
 obs.forEach(o=>o.disconnect());obs=[];
 const rail=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const id=e.target.id;$$('#rail a,#mu a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+id))}}),{rootMargin:'-45% 0px -50% 0px'});
 $$('#home main > section').forEach(s=>rail.observe(s));obs.push(rail);
 const near=(sel,cb)=>{const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)cb(+e.target.dataset.k,e.target)}),{rootMargin:'-42% 0px -48% 0px'});$$(sel).forEach(e=>o.observe(e));obs.push(o)};
 near('#tl li',(k,el)=>{SIG.ms=k;$$('#tl li').forEach(l=>l.classList.toggle('on',l===el));$$('#tl li').forEach(l=>l.classList.toggle('seen',+l.dataset.k<=k))});
 near('#at li',k=>{if(!hoverAt){SIG.hl=k;$$('#at li').forEach(l=>l.classList.toggle('on',+l.dataset.k===k))}});
 $$('#at li').forEach(l=>{const on=()=>{hoverAt=true;SIG.hl=+l.dataset.k;$$('#at li').forEach(m=>m.classList.toggle('on',m===l))};l.addEventListener('mouseenter',on);l.addEventListener('focus',on);l.addEventListener('mouseleave',()=>{hoverAt=false})});
 const head=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){reveal(e.target);head.unobserve(e.target)}}),{threshold:.3});
 $$('h2[data-split]').forEach(h=>{if(!h.classList.contains('done'))head.observe(h)});obs.push(head);
}
function reveal(h){
 h.classList.add('done');if(RM||!window.gsap)return;
 gsap.fromTo($$('.w>span',h),{yPercent:105},{yPercent:0,duration:.9,ease:'power3.out',stagger:.035});
}

/* ---------- pages projet ---------- */
function detail(id){
 const L=projects(),i=L.findIndex(p=>p.id===id);if(i<0){go('#projets');return}
 const x=L[i],p=L[(i+L.length-1)%L.length],n=L[(i+1)%L.length];
 const S=(h,b)=>b?`<section><h2>${h}</h2>${b}</section>`:'',ul=(a,t)=>a&&a.length?`<${t}>${a.map(s=>`<li>${s}</li>`).join('')}</${t}>`:'';
 const kf=(x.kf||[]).concat(x.rs||[]),lk=(x.lk||[]).map(l=>`<a class="btn" href="${l.u}" target="_blank" rel="noopener">${U['lk.'+l.k]}</a>`).join('');
 const gal=(x.img||[]).map(m=>`<figure><img src="${m.s}" alt="${m.a||m.c||''}" loading="lazy"><figcaption>${m.c||''}</figcaption></figure>`).join('');
 document.title=x.t+' — Michel YAO';
 $('#dt').innerHTML=`<article class="dv"${chk(x)}>
 <a class="back" href="#projets">${U['dt.back']}</a>
 <header class="dh"><p class="pk">${x.c}${x.w?`<span>${x.w}</span>`:''}</p><h1>${x.t}</h1><p class="org">${x.org}</p></header>
 <div class="dvz">${viz(x.viz,'lg')}</div>
 ${kf.length?`<dl class="kf">${kf.map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl>`:''}
 <div class="dg"><div class="dm">${S(U['dt.ctx'],x.ctx&&`<p>${x.ctx}</p>`)}${S(U['dt.role'],x.role&&`<p>${x.role}</p>`)}${S(U['dt.pts'],ul(x.pts,'ul'))}${S(U['dt.st'],ul(x.st,'ol'))}${S(U['dt.ls'],x.ls&&`<p>${x.ls}</p>`)}${gal?S(U['dt.img'],`<div class="gal">${gal}</div>`):''}${x.det?'':`<p class="note">${x.nt||U['dt.soon']}</p>`}</div>
 <aside class="ds"><h2>${U['dt.tools']}</h2><ul class="tags">${tags(x.k)}</ul>${lk?`<h2>${U['dt.links']}</h2><div class="lks">${lk}</div>`:''}</aside></div>
 <nav class="pn"><a href="#/projet/${p.id}"><small>${U['dt.prev']}</small>${p.t}</a><a href="#/projet/${n.id}"><small>${U['dt.next']}</small>${n.t}</a></nav></article>`;
}
function route(scroll){
 const m=location.hash.match(/^#\/projet\/([\w-]+)/);
 closeMenu();
 const apply=()=>{
  if(m){$('#home').hidden=true;$('#dt').hidden=false;detail(m[1]);toTop(0,true)}
  else{const was=!$('#dt').hidden;$('#dt').hidden=true;$('#home').hidden=false;document.title=U.title;
   const id=location.hash.slice(1),t=id&&document.getElementById(decodeURIComponent(id));
   if(t&&(scroll||was))requestAnimationFrame(()=>toTop(t,true))}
  if(SIG.refresh)SIG.refresh();
 };
 if(!first&&document.startViewTransition&&!RM)document.startViewTransition(apply);else apply();
}
function toTop(t,instant){
 const y=t===0?0:t.getBoundingClientRect().top+scrollY-(t.id==='vision'?0:56);
 if(lenis)lenis.scrollTo(y,{immediate:!!instant,force:true});else scrollTo({top:y,behavior:instant?'instant':'smooth'});
}
function go(h){if(location.hash!==h){location.hash=h}else route(true)}

/* ---------- navigation ---------- */
const nav=$('#nav'),bg=$('#bg');
function closeMenu(){nav.classList.remove('o');bg.setAttribute('aria-expanded','false');root.classList.remove('nolock')}
bg.addEventListener('click',()=>{const o=nav.classList.toggle('o');bg.setAttribute('aria-expanded',o)});
addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href^="#"]');if(!a)return;const h=a.getAttribute('href');
 if(h.startsWith('#/'))return;                      // pages projet : gérées par hashchange
 e.preventDefault();closeMenu();
 if(!$('#dt').hidden){history.pushState(null,'',h);route(true);return}
 const t=h==='#top'?0:document.getElementById(h.slice(1));if(t===null)return;
 history.replaceState(null,'',h==='#top'?location.pathname+location.search:h);toTop(t,false);
});
addEventListener('hashchange',()=>D&&route(true));
addEventListener('scroll',()=>{nav.classList.toggle('s',scrollY>12);const m=document.body.scrollHeight-innerHeight;$('#pg').style.transform=`scaleX(${m>0?scrollY/m:0})`},{passive:true});

/* ---------- thème et langue ---------- */
$('#tg').addEventListener('click',()=>{const t=root.dataset.theme==='light'?'dark':'light';root.classList.add('tt');root.dataset.theme=t;try{localStorage.setItem('theme',t)}catch(e){}
 setTimeout(()=>root.classList.remove('tt'),500);if(SIG.colors){SIG.colors();SIG.kick&&SIG.kick()}});
$('#lg').addEventListener('click',()=>{lang=lang==='fr'?'en':'fr';try{localStorage.setItem('lang',lang)}catch(e){}text();sections();if(!$('#dt').hidden)route(false);SIG.refresh&&SIG.refresh()});

/* ---------- ouverture : le nom se décode, les chiffres montent ---------- */
function intro(){
 const spans=$$('#name .l1, #name .l2');
 const GL='0123456789σμβ∑';
 spans.forEach((s,k)=>{const fin=s.textContent;s.dataset.f=fin;
  if(RM)return;const t0=performance.now()+k*180,dur=1100;
  (function step(now){const p=Math.max(0,(now-t0)/dur);let o='';for(let i=0;i<fin.length;i++){o+=p*fin.length*1.15>i+Math.random()*.6?fin[i]:GL[Math.floor(Math.random()*GL.length)]}
   s.textContent=o;if(p<1)requestAnimationFrame(step);else s.textContent=fin})(performance.now())});
 $$('.stats .num').forEach(el=>{const to=+el.dataset.to,sf=el.dataset.suf||'';if(RM){el.textContent=to+sf;return}
  const o={v:0};if(window.gsap)gsap.to(o,{v:to,duration:1.6,delay:1,ease:'power2.out',onUpdate:()=>el.textContent=Math.round(o.v)+sf});else el.textContent=to+sf});
 root.classList.add('ready');
}

/* ---------- démarrage ---------- */
load().then(d=>{if(!d)return;D=d;text();sections();
 if(!RM&&window.Lenis){lenis=new Lenis({lerp:.11,smoothWheel:true,wheelMultiplier:.95});const r=t=>{lenis.raf(t);requestAnimationFrame(r)};requestAnimationFrame(r)}
 route(true);first=false;intro();
});
})();
