/* Moteur « Du bruit au signal » : un seul nuage de particules qui change de forme
   au fil du défilement (bruit, Afrique, monde, clusters, série temporelle, grille, orbe). */
(()=>{
'use strict';
const cv=document.getElementById('sig');if(!cv)return;
const cx=cv.getContext('2d',{alpha:true}),root=document.documentElement;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const SIG=window.SIG={hl:-1,labels:[],miles:[],ms:-1,ready:false};
let W=0,H=0,DPR=1,N=0,mob=false,T={},t0=performance.now(),mx=-1e4,my=-1e4,last=0,hudOld='';
let X,Y,PH,SP,DL,GL,CH;                         // positions, phases, vitesses, délais, glyphes
let C={p1:'46,230,246',p2:'245,179,66',ink:'234,240,248',a:1,s:1};
const rnd=(a=0,b=1)=>a+Math.random()*(b-a),gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*v)};
const clamp=(v,a=0,b=1)=>v<a?a:v>b?b:v,ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

function colors(){const q=getComputedStyle(root);const g=(k,d)=>(q.getPropertyValue(k).trim()||d);
 C={p1:g('--p1',C.p1),p2:g('--p2',C.p2),ink:g('--ink-rgb',C.ink),a:parseFloat(g('--pa','1'))||1,s:parseFloat(g('--ps','1'))||1};
 const m=document.querySelector('meta[name=theme-color]');if(m)m.content=g('--bg','#070C1A')}
SIG.colors=colors;

/* ---------- géométrie : boîte de scène selon l'écran ---------- */
function box(type){
 if(mob)return{x:W*.05,y:H*.09,w:W*.9,h:H*.44};
 if(type==='world')return{x:W*.43,y:H*.16,w:W*.54,h:H*.7};
 return{x:W*.5,y:H*.13,w:W*.44,h:H*.76};
}
function fitGeo(g,b){
 const P=g.d.split(';').map(s=>s.split(',').map(Number)),aw=g.w*1000,ah=g.h*1000;
 const s=Math.min(b.w/aw,b.h/ah),ox=b.x+(b.w-aw*s)/2,oy=b.y+(b.h-ah*s)/2;
 const M=P.length,cell=s*1000*Math.sqrt(g.w*g.h/M);
 const x=new Float32Array(N),y=new Float32Array(N),k=new Uint8Array(N);
 const sel=[];for(let j=0;j<N;j++)sel.push(N<=M?Math.floor(j*M/N):j%M);
 for(let j=sel.length-1;j>0;j--){const r=Math.floor(Math.random()*(j+1));[sel[j],sel[r]]=[sel[r],sel[j]]}
 for(let i=0;i<N;i++){const p=P[sel[i]],dup=N>M&&i>=M;x[i]=ox+p[0]*s+(dup?rnd(-.4,.4)*cell:0);y[i]=oy+p[1]*s+(dup?rnd(-.4,.4)*cell:0);k[i]=p[2]}
 let cxs=0,cys=0,n=0;for(let i=0;i<N;i++)if(k[i]===1){cxs+=x[i];cys+=y[i];n++}
 return{x,y,k,ox:n?cxs/n:b.x+b.w/2,oy:n?cys/n:b.y+b.h/2,cell};
}
function build(type){
 const x=new Float32Array(N),y=new Float32Array(N),k=new Uint8Array(N),b=box(type),o={x,y,k,b};
 if(type==='noise'){for(let i=0;i<N;i++){x[i]=rnd(-20,W+20);y[i]=rnd(-20,H+20)}}
 else if(type==='africa'&&window.GEO)Object.assign(o,fitGeo(GEO.af,b));
 else if(type==='world'&&window.GEO)Object.assign(o,fitGeo(GEO.wd,b));
 else if(type==='clusters'){
  const cs=mob?[[.25,.3],[.75,.3],[.25,.75],[.75,.75]]:[[.3,.27],[.74,.31],[.27,.74],[.72,.71]];
  o.c=cs.map(([u,v])=>[b.x+u*b.w,b.y+v*b.h]);const sd=Math.min(b.w,b.h)*(mob?.075:.085);o.sd=sd;
  for(let i=0;i<N;i++){const c=i%4;k[i]=c;
   if(i%23===0){x[i]=rnd(b.x,b.x+b.w);y[i]=rnd(b.y,b.y+b.h);k[i]=9}
   else{const sx=sd*(c%2?1.15:.85),sy=sd*(c%2?.8:1.1);x[i]=o.c[c][0]+gauss()*sx;y[i]=o.c[c][1]+gauss()*sy}}
 }
 else if(type==='series'){
  o.f=t=>{const s=1/(1+Math.exp(-7*(t-.45)));return b.y+b.h*(.86-.68*s-.035*Math.sin(t*13))};
  o.t=new Float32Array(N);
  for(let i=0;i<N;i++){let t=Math.random(),r=Math.random();o.t[i]=t;x[i]=b.x+t*b.w;
   if(r<.72){y[i]=o.f(t)+gauss()*2.4;k[i]=0}
   else if(r<.86){y[i]=o.f(t)+gauss()*b.h*.045;k[i]=3}
   else{t=.9+Math.random()*.1;o.t[i]=t;x[i]=b.x+t*b.w;y[i]=o.f(t)+gauss()*(t-.9)*b.h*.9;k[i]=4}}
 }
 else if(type==='field'){
  const g=Math.max(24,Math.sqrt(W*H/N)),cols=Math.ceil(W/g)+1,rows=Math.ceil(H/g)+2;o.g=g;
  for(let i=0;i<N;i++){const c=i%(cols*rows);x[i]=(c%cols)*g+g*.5;y[i]=Math.floor(c/cols)*g}
 }
 else if(type==='orb'){
  o.cx=W/2;o.cy=H*(mob?.27:.3);const r=Math.min(W,H)*(mob?.16:.11);o.r=r;o.rr=new Float32Array(N);o.a=new Float32Array(N);
  for(let i=0;i<N;i++){o.rr[i]=Math.abs(gauss())*r*.55+(i%9===0?r*rnd(.9,1.6):0);o.a[i]=rnd(0,6.2832)}
 }
 return o;
}
const get=t=>T[t]||(T[t]=build(t));

/* ---------- position animée d'une particule dans une scène ---------- */
function pos(o,type,i,t,S,out){
 let x=o.x[i],y=o.y[i];
 if(type==='noise'&&!RM){x+=Math.sin(t*.00023*SP[i]+PH[i])*26;y+=Math.cos(t*.00019*SP[i]+PH[i]*1.7)*20}
 else if(type==='field'){y-=(S*.06)%o.g;if(y<-o.g)y+=H+o.g*2}
 else if(type==='orb'){const rr=o.rr[i],a=o.a[i]+(RM?0:t*.00018*(1.6-rr/o.r));x=o.cx+Math.cos(a)*rr;y=o.cy+Math.sin(a)*rr*.92}
 else if(!RM){x+=Math.sin(t*.0011+PH[i])*.7;y+=Math.cos(t*.0009+PH[i])*.7}
 out[0]=x;out[1]=y;
}
/* style : [couleur 0=p1 1=p2 2=ink, alpha, taille] */
function sty(o,type,i,t,out){
 const k=o.k[i];let c=0,a=.75,s=1;
 switch(type){
  case'noise':a=.5+.25*Math.sin(t*.0012*SP[i]+PH[i]);s=1.1;break;
  case'africa':if(k===1){c=1;a=1;s=1.5}else a=.78;break;
  case'world':if(k===1){c=1;a=1;s=1.6}else if(k===2)a=.95;else{a=.62;c=2};break;
  case'clusters':if(k===9){c=2;a=.25}else{a=SIG.hl<0?.85:(k===SIG.hl?1:.4);if(k===SIG.hl)s=1.25};break;
  case'series':{const p=o.prog||0,vis=o.t[i]<=p+.015;a=k===0?.95:k===3?.38:.3;if(k===4)c=1;if(!vis)a*=.08;break}
  case'field':a=.2+.12*Math.sin(t*.0009+PH[i]);c=2;break;
  case'orb':a=.9;if(o.rr[i]>o.r*.85){a=.35}break;
 }
 out[0]=c;out[1]=a;out[2]=s;
}

/* ---------- impulsions (arcs) Abidjan → reste du continent / monde ---------- */
const arcs={africa:[],world:[]};
function arcsDraw(type,w,t){
 if(w<.05||RM)return;const o=get(type),L=arcs[type],n=type==='world'?5:6;
 while(L.length<n)L.push({j:Math.floor(Math.random()*N),t0:t+Math.random()*2400,d:rnd(1500,2400)});
 cx.lineWidth=1.2*DPR;
 for(const A of L){let p=(t-A.t0)/A.d;if(p<0)continue;if(p>1.25){A.j=Math.floor(Math.random()*N);A.t0=t+rnd(200,1400);A.d=rnd(1500,2400);continue}
  const x0=o.ox,y0=o.oy,x1=o.x[A.j],y1=o.y[A.j],mxp=(x0+x1)/2,myp=(y0+y1)/2-Math.hypot(x1-x0,y1-y0)*.32;
  const q=Math.min(p,1),fade=p>1?1-(p-1)/.25:1;
  cx.strokeStyle=`rgba(${C.p2},${.55*w*fade*C.a})`;cx.beginPath();cx.moveTo(x0*DPR,y0*DPR);
  const st=Math.ceil(q*26);let hx=x0,hy=y0;for(let s=1;s<=st;s++){const u=Math.min(s/26,q);hx=(1-u)*(1-u)*x0+2*(1-u)*u*mxp+u*u*x1;hy=(1-u)*(1-u)*y0+2*(1-u)*u*myp+u*u*y1;cx.lineTo(hx*DPR,hy*DPR)}
  cx.stroke();cx.fillStyle=`rgba(${C.p2},${w*fade*C.a})`;cx.beginPath();cx.arc(hx*DPR,hy*DPR,2.2*DPR,0,6.2832);cx.fill();
  if(p>=1){cx.fillStyle=`rgba(${C.p1},${.35*w*fade*C.a})`;cx.beginPath();cx.arc(x1*DPR,y1*DPR,(3+9*(p-1)*4)*DPR,0,6.2832);cx.fill()}
 }
 const pulse=.5+.5*Math.sin(t*.003);cx.fillStyle=`rgba(${C.p2},${.18*w*C.a})`;cx.beginPath();cx.arc(o.ox*DPR,o.oy*DPR,(8+10*pulse)*DPR,0,6.2832);cx.fill();
}
/* ---------- surcouches : étiquettes des clusters, axes de la série, halo de l'orbe ---------- */
function overlays(type,w,t){
 if(w<.04)return;const o=get(type);cx.save();
 if(type==='clusters'){
  o.c.forEach(([x,y],j)=>{const on=SIG.hl<0||SIG.hl===j;
   cx.strokeStyle=`rgba(${C.p1},${(on?.35:.12)*w*C.a})`;cx.lineWidth=DPR;cx.setLineDash([3*DPR,4*DPR]);
   cx.beginPath();cx.ellipse(x*DPR,y*DPR,o.sd*2.5*(j%2?1.15:.85)*DPR,o.sd*2.5*(j%2?.8:1.1)*DPR,0,0,6.2832);cx.stroke();cx.setLineDash([]);
   const lb=SIG.labels[j];if(lb){cx.font=`500 ${(mob?18:26)*DPR}px Newsreader, Georgia, serif`;cx.textAlign='center';cx.fillStyle=`rgba(${C.ink},${(on?.95:.35)*w})`;cx.fillText(lb,x*DPR,(y-o.sd*2.7)*DPR)}});
 }
 if(type==='series'){
  const b=o.b,y0=b.y+b.h*.97;cx.strokeStyle=`rgba(${C.ink},${.22*w})`;cx.lineWidth=DPR;cx.beginPath();cx.moveTo(b.x*DPR,y0*DPR);cx.lineTo((b.x+b.w)*DPR,y0*DPR);cx.stroke();
  cx.font=`${(mob?10:11)*DPR}px "IBM Plex Mono", monospace`;cx.textAlign='center';cx.fillStyle=`rgba(${C.ink},${.5*w})`;
  for(let yr=2020;yr<=2027;yr++){const xx=b.x+(yr-2019.5)/8*b.w;if(mob&&yr%2)continue;cx.fillText(yr,xx*DPR,(y0+16)*DPR);cx.fillRect(xx*DPR,(y0-3)*DPR,DPR,4*DPR)}
  SIG.miles.forEach((yr,j)=>{const u=(yr-2019.5)/8,xx=b.x+u*b.w,yy=o.f(u),on=j===SIG.ms,seen=u<=(o.prog||0)+.02;if(!seen)return;
   cx.fillStyle=`rgba(${on?C.p2:C.p1},${w*C.a})`;cx.beginPath();cx.arc(xx*DPR,yy*DPR,(on?5:3.2)*DPR,0,6.2832);cx.fill();
   if(on){cx.strokeStyle=`rgba(${C.p2},${.5*w*C.a})`;cx.beginPath();cx.arc(xx*DPR,yy*DPR,(11+3*Math.sin(t*.004))*DPR,0,6.2832);cx.stroke();
    cx.strokeStyle=`rgba(${C.p2},${.35*w})`;cx.setLineDash([2*DPR,4*DPR]);cx.beginPath();cx.moveTo(xx*DPR,(yy+12)*DPR);cx.lineTo(xx*DPR,(y0-4)*DPR);cx.stroke();cx.setLineDash([])}});
 }
 if(type==='orb'){
  const p=RM?1:.75+.25*Math.sin(t*.0018),g=cx.createRadialGradient(o.cx*DPR,o.cy*DPR,0,o.cx*DPR,o.cy*DPR,o.r*2.6*DPR);
  g.addColorStop(0,`rgba(${C.p1},${.32*w*p*C.a})`);g.addColorStop(.35,`rgba(${C.p1},${.1*w*p*C.a})`);g.addColorStop(1,`rgba(${C.p1},0)`);
  cx.fillStyle=g;cx.fillRect((o.cx-o.r*3)*DPR,(o.cy-o.r*3)*DPR,o.r*6*DPR,o.r*6*DPR);
  cx.fillStyle=`rgba(${C.p2},${w*C.a})`;cx.beginPath();cx.arc(o.cx*DPR,o.cy*DPR,(3+1.5*p)*DPR,0,6.2832);cx.fill();
 }
 cx.restore();
}

/* ---------- ancres de scène (ordre du document) ---------- */
function anchors(S){
 const dt=document.getElementById('dt');
 if(dt&&!dt.hidden)return{a:'field',b:'field',f:0,el:null,v:1};
 const L=[...document.querySelectorAll('#home [data-scene]')];if(!L.length)return{a:'noise',b:'noise',f:0,v:0};
 const P=L.map((e,i)=>{const r=e.getBoundingClientRect();return{e,type:e.dataset.scene,top:r.top+S,h:r.height,p:i?r.top+S-H*.3:0}});
 let i=0;while(i<P.length-1&&S>=P[i+1].p)i++;
 const nx=P[Math.min(i+1,P.length-1)],win=Math.min(H*.65,Math.max(1,(nx.p-P[i].p)*.6));
 const f=i===P.length-1?0:clamp((S-(nx.p-win))/win);
 return{a:P[i].type,b:nx.type,f,P,i,v:(i+f)/Math.max(1,P.length-1)};
}

/* ---------- boucle ---------- */
const o2=[0,0],s1=[0,0,0],s2=[0,0,0],xy=[0,0];
const B=[];for(let c=0;c<3;c++)for(let l=0;l<10;l++)B.push([]);
function frame(now){
 const t=now-t0,S=window.scrollY||0;
 if(cv.clientWidth!==W||cv.clientHeight!==H)resize();
 const A=anchors(S),oa=get(A.a),ob=get(A.b);
 // progression de la série temporelle (section parcours)
 const sr=A.P&&A.P.find(p=>p.type==='series');
 if(sr&&T.series)T.series.prog=clamp((S-(sr.top-H*.55))/Math.max(1,sr.h-H*.35));
 cx.clearRect(0,0,cv.width,cv.height);
 for(const b of B)b.length=0;
 const wa=1-A.f,wb=A.f,wNoise=(A.a==='noise'?wa:0)+(A.b==='noise'&&A.a!==A.b?wb:0);
 const lens=wNoise>.2&&!RM&&mx>-1e3,R=mob?0:150,R2=R*R,gs=15;
 for(let i=0;i<N;i++){
  let fi=A.a===A.b?0:ease(clamp((A.f-DL[i]*.32)/.68));
  pos(oa,A.a,i,t,S,o2);const ax=o2[0],ay=o2[1];
  let x=ax,y=ay;if(fi>0){pos(ob,A.b,i,t,S,o2);x=ax+(o2[0]-ax)*fi;y=ay+(o2[1]-ay)*fi}
  sty(oa,A.a,i,t,s1);let c=s1[0],al=s1[1],sz=s1[2];
  if(fi>0){sty(ob,A.b,i,t,s2);al=al+(s2[1]-al)*fi;sz=sz+(s2[2]-sz)*fi;if(fi>.5)c=s2[0]}
  if(lens){const dx=x-mx,dy=y-my,d2=dx*dx+dy*dy;if(d2<R2){const k=Math.pow(1-Math.sqrt(d2)/R,1.6)*wNoise;x+=(Math.round(x/gs)*gs-x)*k;y+=(Math.round(y/gs)*gs-y)*k;al=al+(1-al)*k;sz+=k*.5}}
  X[i]=x;Y[i]=y;GL[i]=sz;
  B[c*10+Math.min(9,Math.round(al*C.a*9))].push(i);
 }
 const base=(mob?1.6:1.8)*DPR*C.s,showGly=wNoise>.35;
 cx.font=`${12*DPR}px "IBM Plex Mono", monospace`;cx.textAlign='center';
 const cols=[C.p1,C.p2,C.ink];
 for(let c=0;c<3;c++)for(let l=1;l<10;l++){const L=B[c*10+l];if(!L.length)continue;
  cx.fillStyle=`rgba(${cols[c]},${(l/9).toFixed(2)})`;
  for(const i of L){const s=base*GL[i];
   if(showGly&&CH[i]){cx.globalAlpha=Math.min(1,wNoise*1.1);cx.fillText(CH[i],X[i]*DPR,Y[i]*DPR);cx.globalAlpha=1}
   else cx.fillRect(X[i]*DPR-s/2,Y[i]*DPR-s/2,s,s)}}
 if(!RM&&showGly&&Math.random()<.5){const i=Math.floor(Math.random()*N);if(CH[i])CH[i]='0123456789'[Math.floor(Math.random()*10)]}
 for(const ty of['africa','world']){const w=(A.a===ty?wa:0)+(A.b===ty&&A.a!==A.b?wb:0);arcsDraw(ty,w,t)}
 for(const ty of['clusters','series','orb']){const w=(A.a===ty?wa:0)+(A.b===ty&&A.a!==A.b?wb:0);overlays(ty,w,t)}
 const hv=String(Math.max(3,Math.round(A.v*100))).padStart(2,'0');
 if(hv!==hudOld){hudOld=hv;const e=document.getElementById('hudv');if(e)e.textContent=hv}
 SIG.scene=A.f>.5?A.b:A.a;
}
function resize(){
 DPR=Math.min(window.devicePixelRatio||1,W*H>2e6?1.5:2);
 W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
 const m2=W<900;const n2=m2?(W<500?820:1100):Math.round(Math.min(2000,Math.max(1300,W*H/700)));
 if(n2!==N||m2!==mob||!X){mob=m2;N=n2;X=new Float32Array(N);Y=new Float32Array(N);PH=new Float32Array(N);SP=new Float32Array(N);DL=new Float32Array(N);GL=new Float32Array(N);CH=new Array(N);
  for(let i=0;i<N;i++){PH[i]=rnd(0,6.28);SP[i]=rnd(.6,1.4);DL[i]=Math.random();CH[i]=i%6===0?'0123456789σμβ'[Math.floor(Math.random()*13)]:''}
  arcs.africa.length=0;arcs.world.length=0}
 T={};
}
let raf=0,run=true;
function loop(now){raf=0;if(!run)return;frame(now);if(!RM)raf=requestAnimationFrame(loop)}
function kick(){if(!raf&&run)raf=requestAnimationFrame(loop)}
SIG.kick=kick;
SIG.refresh=()=>{T={};kick()};
addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){mx=e.clientX;my=e.clientY}},{passive:true});
document.addEventListener('pointerleave',()=>{mx=my=-1e4});
document.addEventListener('visibilitychange',()=>{run=!document.hidden;if(run)kick()});
if(RM){addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick)}
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{T={};kick()},120)});
colors();resize();SIG.ready=true;kick();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(kick);
})();
