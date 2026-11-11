(function(){
"use strict";
const box=document.getElementById("gameHome"),cv=document.getElementById("gameCanvas"),chip=document.getElementById("gameChip");
if(!box||!cv||!cv.getContext)return;
const cx=cv.getContext("2d");
let W=0,H=0;
function rs(){
  const d=Math.min(window.devicePixelRatio||1,2),cw=cv.clientWidth,ch=cv.clientHeight;
  const z=Math.max(1,Math.min(2,cw/420));
  W=cw/z;H=ch/z;
  cv.width=Math.round(cw*d);cv.height=Math.round(ch*d);
  cx.setTransform(d*z,0,0,d*z,0,0);cx.imageSmoothingEnabled=false;
}

const WW=1600,WH=1200,S=2,HEX=/^#[0-9a-f]{6}$/i;
const BODY=["#f4a6c8","#a6d4f4","#f4e08a","#b9e6a0","#c9a6f4","#f2f2f2","#f4a77a"];
const MANE=["#7b2d8b","#2d6bd6","#e8458b","#2a2a2a","#f5c542","#1fa37a"];
const SAY=["Halo!","Cuaca cerah ya","Ayo main bareng","Aku suka bunga","Ada yang lihat kue?","Hehe","Selamat datang di kota!","Ke kolam yuk","Hai hai ✨"];
const REP=["Halo juga!","Hai! Salam kenal","Wah seru!","Hehe iya","Ayo jalan-jalan","Aku setuju","❤️"];
const KOLAM=["Airnya sejuk!","Segar sekali 💦","Glek glek"];
const ISTI=["Zzz…","Capek, istirahat dulu","Hoaam 😴"];
const ACT={jalan:"jalan-jalan",kolam:"main di kolam",ngobrol:"ngobrol",istirahat:"istirahat"};

let seed=7;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
const pick=a=>a[Math.random()*a.length|0];
const P={x:1150,y:300,rx:150,ry:90};
const onPath=(x,y)=>(y>550&&y<670)||(x>740&&x<860);
const inPond=(x,y,m=0)=>((x-P.x)/(P.rx+m))**2+((y-P.y)/(P.ry+m))**2<1;
const trees=[];
for(let i=0;i<60;i++){const x=rnd()*WW,y=40+rnd()*(WH-60);if(!onPath(x,y)&&!inPond(x,y,40))trees.push({x,y})}

// latar (rumput, jalan, bunga, kolam)
const bg=document.createElement("canvas");bg.width=WW;bg.height=WH;
(function(){const b=bg.getContext("2d");
b.fillStyle="#6fbf5f";b.fillRect(0,0,WW,WH);
for(let i=0;i<3500;i++){const x=(rnd()*WW|0)&~1,y=(rnd()*WH|0)&~1;b.fillStyle=rnd()<.5?"#62b052":"#7bcb69";b.fillRect(x,y,4,2);if(rnd()<.4){b.fillStyle="#58a449";b.fillRect(x+1,y-2,2,2)}}
b.fillStyle="#dcc088";b.fillRect(0,580,WW,60);b.fillRect(770,0,60,WH);
for(let i=0;i<700;i++){const x=(rnd()*WW|0)&~1,y=(rnd()*WH|0)&~1;if(!((y>=580&&y<640)||(x>=770&&x<830)))continue;b.fillStyle=rnd()<.5?"#c9ab70":"#e8d3a0";b.fillRect(x,y,2,2)}
const fc=["#fff","#ffd24a","#ff7aa8","#b48cff"];
for(let i=0;i<320;i++){const x=(rnd()*WW|0)&~1,y=(rnd()*WH|0)&~1;if(onPath(x,y)||inPond(x,y,20))continue;b.fillStyle="#3f8f35";b.fillRect(x+2,y+4,2,4);b.fillStyle=fc[i%4];b.fillRect(x+2,y,2,2);b.fillRect(x,y+2,2,2);b.fillRect(x+4,y+2,2,2);b.fillRect(x+2,y+4,2,2);b.fillStyle="#ffd24a";b.fillRect(x+2,y+2,2,2)}
b.fillStyle="#9fd3f0";b.beginPath();b.ellipse(P.x,P.y,P.rx+10,P.ry+10,0,0,7);b.fill();
b.fillStyle="#4aa3df";b.beginPath();b.ellipse(P.x,P.y,P.rx,P.ry,0,0,7);b.fill();
b.fillStyle="rgba(255,255,255,.35)";for(let i=0;i<14;i++)b.fillRect(P.x-100+i*14,P.y-34+(i%4)*18,8,2);
})();

const solid=(x,y)=>{if(x<15||x>WW-15||y<25||y>WH-10)return true;if(inPond(x,y))return true;for(const t of trees){const dx=x-t.x,dy=y-t.y;if(dx*dx+dy*dy<324)return true}return false};
const mv=(e,dx,dy)=>{if(!solid(e.x+dx,e.y))e.x+=dx;if(!solid(e.x,e.y+dy))e.y+=dy};

// para pony
function mk(n,x,y){
  while(solid(x,y)){x=300+Math.random()*1000;y=300+Math.random()*600}
  return{name:n,x,y,body:pick(BODY),mane:pick(MANE),horn:Math.random()<.4,dir:1,t:0,say:"",sayT:0,moving:false,
    tx:x,ty:y,wait:Math.random()*3,ns:3+Math.random()*8,act:"istirahat",partner:null,replyIn:0,speed:42+Math.random()*16}}
const me=mk("Poni",760+Math.random()*80,590+Math.random()*50);
try{const s=JSON.parse(localStorage.getItem("poni")||"null");
  if(s){if(s.n)me.name=String(s.n).slice(0,12);if(HEX.test(s.b))me.body=s.b;if(HEX.test(s.m))me.mane=s.m;me.horn=!!s.h}}catch(e){}
const ponies=[me].concat(["Bintang","Pelangi","Melati","Awan","Cokelat","Senja"].map(n=>mk(n,500+Math.random()*600,420+Math.random()*400)));

// kegiatan otomatis
function around(e,r){
  for(let i=0;i<12;i++){const x=e.x+(Math.random()-.5)*r*1.4,y=e.y+(Math.random()-.5)*r;
    if(!solid(x,y)&&x>40&&x<WW-40&&y>60&&y<WH-40)return[x,y]}
  return[e.x,e.y]}
function go(e,act,x,y){e.act=act;e.tx=x;e.ty=y}
function choose(e){
  e.partner=null;
  const r=Math.random();
  if(r<.15){
    const a=Math.random()*6.283,x=P.x+Math.cos(a)*(P.rx+30),y=P.y+Math.sin(a)*(P.ry+30);
    if(!solid(x,y)&&x>40&&x<WW-40&&y>60&&y<WH-40)return go(e,"kolam",x,y)}
  else if(r<.4){
    const c=ponies.filter(q=>q!==e&&q.act!=="ngobrol"&&Math.hypot(q.x-e.x,q.y-e.y)<450);
    if(c.length){const q=pick(c),x=q.x+(e.x<q.x?-55:55);
      if(!solid(x,q.y)){q.act="ngobrol";q.tx=q.x;q.ty=q.y;q.wait=18;q.moving=false;e.partner=q;return go(e,"ngobrol",x,q.y)}}}
  else if(r<.6){
    e.act="istirahat";e.tx=e.x;e.ty=e.y;e.wait=4+Math.random()*5;e.moving=false;
    if(Math.random()<.5){e.say=pick(ISTI);e.sayT=3}
    return}
  const p=around(e,420);go(e,"jalan",p[0],p[1])}
function arrive(e){
  e.moving=false;
  const q=e.partner;
  if(e.act==="ngobrol"&&q&&Math.hypot(q.x-e.x,q.y-e.y)<110){
    e.dir=q.x>e.x?1:-1;q.dir=-e.dir;q.moving=false;
    e.wait=q.wait=6;e.say=pick(SAY);e.sayT=4;q.replyIn=1.8;e.ns=q.ns=14;e.partner=null;return}
  if(e.act==="kolam"){e.say=pick(KOLAM);e.sayT=3.5;e.wait=4+Math.random()*3;return}
  e.wait=.5+Math.random()*2}
function step(e,dt){
  e.sayT-=dt;e.ns-=dt;
  if(e.replyIn>0){e.replyIn-=dt;if(e.replyIn<=0){e.say=pick(REP);e.sayT=3.5}}
  if(e.ns<0){if(e.act!=="ngobrol"){e.say=pick(SAY);e.sayT=4}e.ns=12+Math.random()*14}
  if(e.wait>0){e.wait-=dt;e.moving=false;if(e.wait<=0)choose(e);return}
  const dx=e.tx-e.x,dy=e.ty-e.y,d=Math.hypot(dx,dy);
  if(d<6){arrive(e);return}
  const ox=e.x,oy=e.y;mv(e,dx/d*e.speed*dt,dy/d*e.speed*dt);
  e.moving=true;e.t+=dt;if(Math.abs(dx)>1)e.dir=dx>0?1:-1;
  if(Math.abs(e.x-ox)+Math.abs(e.y-oy)<.01){e.moving=false;e.wait=.3}}

// kamera: berpindah mengikuti pony berbeda
let focus=me,focusT=18,camX=0,camY=0,first=true,txt="",cax=0,cay=0;
const cam=(v,view,size)=>view>=size?(size-view)/2:Math.max(0,Math.min(size-view,v));
function update(dt){
  ponies.forEach(e=>step(e,dt));
  focusT-=dt;
  if(focusT<=0){focusT=16+Math.random()*8;focus=focus!==me&&Math.random()<.5?me:pick(ponies.filter(q=>q!==focus))}
  const k=first?1:Math.min(1,dt*2.5);first=false;
  camX+=(cam(focus.x-W/2,W,WW)-camX)*k;camY+=(cam(focus.y-H/2,H,WH)-camY)*k;
  const s="🐴 "+focus.name+" sedang "+ACT[focus.act];
  if(s!==txt){txt=s;if(chip)chip.textContent=s}}

// gambar
const OUT="#3a2c3f";
function sh(c,f){const n=parseInt(c.slice(1),16),g=s=>Math.max(0,Math.min(255,Math.round(((n>>s)&255)*f)));return"rgb("+g(16)+","+g(8)+","+g(0)+")"}
function dp(L){
for(const p of L)if(p[5]!==0){cx.fillStyle=OUT;cx.fillRect((p[1]-1)*S,(p[2]-1)*S,(p[3]+2)*S,(p[4]+2)*S)}
for(const p of L){cx.fillStyle=p[0];cx.fillRect(p[1]*S,p[2]*S,p[3]*S,p[4]*S)}}
function pony(e){
const x=Math.round(e.x-cax),y=Math.round(e.y-cay),b=e.body,m=e.mane,w=e.moving,t=e.t*10;
if(x<-60||x>W+60||y<-10||y>H+110)return;
const l=i=>w&&Math.sin(t+i*1.6)>0?2:0,sw=w?Math.round(Math.sin(t*.8)*1.5):0,bd=sh(b,.8),hl=sh(b,1.12),hf="#4a3f4f";
cx.save();cx.translate(x,y);
cx.fillStyle="rgba(0,0,0,.2)";cx.beginPath();cx.ellipse(2,0,30,6,0,0,7);cx.fill();
cx.scale(e.dir,1);
if(w)cx.translate(0,-Math.round(Math.abs(Math.sin(t))*2));
const L=[
[m,-18,-17,5,9],[m,-20+sw*2,-10,4,8],[sh(m,1.3),-16,-16,1,7,0],
[bd,-9,-8,3,8-l(1)],[hf,-9,-2-l(1),3,2,0],[bd,3,-8,3,8-l(3)],[hf,3,-2-l(3),3,2,0],
[b,-14,-18,22,10],[sh(b,.88),-14,-10,22,2,0],[hl,-12,-17,18,1,0],[m,-9,-16,1,3,0],[m,-10,-15,3,1,0],
[b,-13,-8,3,8-l(0)],[hf,-13,-2-l(0),3,2,0],[b,6,-8,3,8-l(2)],[hf,6,-2-l(2),3,2,0],
[b,3,-25,6,9],
[m,1,-30,5,16],[sh(m,1.3),3,-29,1,12,0],[m,0,-22,2,7],
[bd,12,-34,3,5],
[b,6,-30,12,10],[b,16,-26,5,6],[b,8,-35,3,6],["#f3b4c6",9,-34,1,3,0]];
if(e.horn)L.push(["#fff1b8",12,-38,3,9],["#fff1b8",13,-41,1,3],["#f1c453",12,-35,3,1,0],["#f1c453",12,-32,3,1,0]);
L.push([m,5,-32,13,3],[m,15,-29,3,5],["#fff",11,-26,4,4,0],[sh(m,.9),12,-26,3,4,0],["#111",13,-25,2,3,0],["#fff",13,-26,1,1,0],["rgba(0,0,0,.4)",19,-23,1,1,0],[sh(b,.6),17,-21,3,1,0],["rgba(255,90,130,.4)",10,-22,3,2,0]);
dp(L);cx.restore()}
function tree(t){
const x=Math.round(t.x-cax),y=Math.round(t.y-cay);
if(x<-60||x>W+60||y<-10||y>H+110)return;
cx.save();cx.translate(x,y);
dp([["#7a5230",-3,-16,6,16],["#7a5230",-5,-2,2,2],["#7a5230",3,-2,2,2],["#5e3e22",-1,-14,1,9,0],["#92683b",1,-15,1,7,0],
["#2a6e2e",-15,-26,30,12],["#2f7d32",-13,-34,26,12],["#3e9a42",-10,-40,20,10],["#4fb352",-6,-45,12,8],
["#6bcb6a",-6,-43,4,2,0],["#5cbf5c",-11,-37,4,2,0],["#5cbf5c",3,-35,4,2,0],["#215c25",-13,-17,4,2,0],["#215c25",3,-16,5,2,0],["#215c25",9,-22,3,2,0],["#215c25",-4,-27,4,2,0]]);
cx.restore()}
function wrap(t,mw){const w=t.split(" "),L=[];let c="";for(const s of w){const n=c?c+" "+s:s;if(cx.measureText(n).width>mw&&c){L.push(c);c=s}else c=n}L.push(c);return L}
function label(e){
const x=e.x-cax,y=e.y-cay-(e.horn?94:78);
if(x<-100||x>W+100||y<-20||y>H+120)return;
cx.textAlign="center";cx.font="bold 12px system-ui,sans-serif";cx.lineWidth=3;cx.strokeStyle="rgba(0,0,0,.6)";cx.fillStyle=e===focus?"#ffe27a":"#fff";
cx.strokeText(e.name,x,y);cx.fillText(e.name,x,y);
if(e.sayT>0){cx.font="12px system-ui,sans-serif";const L=wrap(e.say,170);
const bw=Math.max(...L.map(s=>cx.measureText(s).width))+16,bh=L.length*15+8,bx=x-bw/2,by=y-18-bh;
cx.beginPath();if(cx.roundRect)cx.roundRect(bx,by,bw,bh,8);else cx.rect(bx,by,bw,bh);
cx.fillStyle="#fff";cx.fill();cx.lineWidth=1.5;cx.strokeStyle="#333";cx.stroke();
cx.fillStyle="#222";L.forEach((s,i)=>cx.fillText(s,x,by+15+i*15))}}
function draw(){
cx.fillStyle="#4a8a3e";cx.fillRect(0,0,W,H);
cax=Math.round(camX);cay=Math.round(camY);
cx.drawImage(bg,-cax,-cay);
ponies.map(e=>({y:e.y,f:()=>pony(e)})).concat(trees.map(t=>({y:t.y,f:()=>tree(t)}))).sort((a,b)=>a.y-b.y).forEach(o=>o.f());
ponies.forEach(label)}

// loop: berhenti saat game tidak terlihat atau tab disembunyikan (hemat baterai)
let raf=0,last=0,vis=true;
function frame(ts){
  const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
  update(dt);draw();raf=requestAnimationFrame(frame)}
function sync(){
  const on=vis&&!document.hidden;
  if(on&&!raf){last=performance.now();raf=requestAnimationFrame(frame)}
  else if(!on&&raf){cancelAnimationFrame(raf);raf=0}}
if("ResizeObserver" in window)new ResizeObserver(rs).observe(box);else addEventListener("resize",rs);
rs();
if("IntersectionObserver" in window)new IntersectionObserver(en=>{vis=en[0].isIntersecting;sync()}).observe(box);
document.addEventListener("visibilitychange",sync);
sync();
})();
