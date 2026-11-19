/* =========================================================
   Helpers
   ========================================================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const inr=n=>"₹"+Math.round(n).toLocaleString("en-IN");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
const store={get(k,d){try{const v=localStorage.getItem("rcv-"+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem("rcv-"+k,JSON.stringify(v))}catch(e){}}};
const calendlyReady=u=>u&&!/YOUR-HANDLE/.test(u);
const liveMode=!!CONFIG.razorpayKey;
const waLink=t=>"https://wa.me/"+CONFIG.whatsapp+(t?"?text="+encodeURIComponent(t):"");
const AR='<span class="bi"><svg><use href="#i-ar"/></svg><svg><use href="#i-ar"/></svg></span>';
const btn=(label,attrs="",cls="button")=>`<${/href=/.test(attrs)?"a":"button"} class="${cls}" ${attrs}>${AR}${label}</${/href=/.test(attrs)?"a":"button"}>`;
let toastT;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("on"),2600)}
function loadScript(src){return new Promise((ok,no)=>{if($(`script[src="${src}"]`))return ok();const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);setTimeout(()=>no(new Error("timeout")),6000)})}
const PORTRAIT=($(".arch img")||{}).src||"";
const ART={
 yantra:'<svg class="art" viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" fill="none" stroke="var(--gold-2)" stroke-width="2"/><rect x="12" y="12" width="76" height="76" fill="none" stroke="var(--gold-2)" stroke-width="1"/><circle cx="50" cy="50" r="32" fill="none" stroke="var(--em)" stroke-width="1.4"/><path d="M50 22 74 64H26Z M50 78 26 36H74Z" fill="none" stroke="var(--em)" stroke-width="1.6"/><circle cx="50" cy="50" r="3.6" fill="var(--dot)"/></svg>',
 pyramid:'<svg class="art" viewBox="0 0 100 100"><path d="M50 12 90 82H10Z" fill="var(--gold-2)"/><path d="M50 12 64 82H90Z" fill="var(--sindoor)" opacity=".55"/><path d="M10 88h80" stroke="var(--em)" stroke-width="1.4"/></svg>',
 coin:'<svg class="art" viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="var(--gold-2)"/><circle cx="50" cy="50" r="29" fill="none" stroke="var(--sindoor)" stroke-width="1.4" opacity=".6"/><text x="50" y="62" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-size="32" fill="var(--sindoor-2)">₹1</text></svg>',
 strip:'<svg class="art" viewBox="0 0 100 100"><g transform="rotate(-28 50 50)"><rect x="4" y="30" width="92" height="10" rx="2" fill="var(--gold-2)"/><rect x="4" y="46" width="92" height="10" rx="2" fill="var(--gold-2)" opacity=".75"/><rect x="4" y="62" width="92" height="10" rx="2" fill="var(--gold-2)" opacity=".5"/></g></svg>'
};
const art=p=>p.img?`<img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">`:(ART[p.art]||ART.yantra);
const fromPrice=Math.min(...PACKAGES.filter(p=>p.mode==="online").map(p=>p.price));

/* =========================================================
   Router: real page addresses on the live site, #pages in the preview.
   Section anchors (#mapper, #how, #stories, #finder) open the home page and scroll there.
   ========================================================= */
const VIEWS=$$("[data-view]").map(v=>v.dataset.view);
const ANCHORS=["mapper","finder","how","stories","booknow","faq-home"];
let current=null, bookPick=null, anchor=null;
const PATHS={home:"/",about:"/about/",consultations:"/consultations/",shop:"/shop/",book:"/book/",checkout:"/checkout/",contact:"/contact/",policies:"/policies/"};
const PATH_MODE=window.SITE_PATHS===true;
function targetOf(href){
  if(!href)return null;
  if(href.startsWith("#")){const t=href.slice(1)||"home";if(ANCHORS.includes(t))return"home#"+t;const v=t.startsWith("book-")?"book":t;return VIEWS.includes(v)?t:null}
  if(PATH_MODE&&href.startsWith("/")){const u=new URL(href,location.origin);const v=Object.keys(PATHS).find(k=>PATHS[k]===u.pathname);if(!v)return null;const pk=u.searchParams.get("package");const h=u.hash.slice(1);return v==="book"&&pk?"book-"+pk:(v==="home"&&ANCHORS.includes(h)?"home#"+h:v)}
  return null}
const urlFor=t=>t.startsWith("home#")?"/#"+t.slice(5):t.startsWith("book-")?PATHS.book+"?package="+encodeURIComponent(t.slice(5)):(PATHS[t]||"/");
function go(t){if(!PATH_MODE){location.hash=t.startsWith("home#")?t.slice(5):t;return}history.pushState({},"",urlFor(t));route()}
function parse(){
  anchor=null;let t;
  if(PATH_MODE){
    const h=location.hash.slice(1);
    if(h&&!ANCHORS.includes(h)){const tt=targetOf("#"+h);if(tt){history.replaceState({},"",urlFor(tt))}}
    t=targetOf(location.pathname+location.search+location.hash)||"home";
  }else{const h=location.hash.slice(1)||"home";t=ANCHORS.includes(h)?"home#"+h:(VIEWS.includes(h)||h.startsWith("book-")?h:"home")}
  if(t.startsWith("home#")){anchor=t.slice(5);return"home"}
  if(t.startsWith("book-")){bookPick=t.slice(5);return"book"}
  return t;
}
if(PATH_MODE){
  document.addEventListener("click",e=>{if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest("a[href]");if(!a||a.target==="_blank")return;const t=targetOf(a.getAttribute("href"));if(!t)return;e.preventDefault();go(t)});
  addEventListener("popstate",route);
}else addEventListener("hashchange",route);
function scrollToAnchor(smooth){const el=anchor&&document.getElementById(anchor);if(!el)return;const y=el.getBoundingClientRect().top+scrollY-72;window.scrollTo({top:y,behavior:smooth&&!reduced?"smooth":"auto"})}
function show(v){
  $$("[data-view]").forEach(el=>el.hidden=el.dataset.view!==v);
  $$(".links a").forEach(a=>{const t=targetOf(a.getAttribute("href"));if(t===v)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  current=v;
  if(v==="checkout")renderCheckout();
  if(v==="book"||v==="home")mountBook(v);
  if(v==="consultations")renderPkgs();
  if(v==="home")requestAnimationFrame(()=>{mapper.resize();drawBeam()});
  document.title=(window.PAGE_TITLES&&PAGE_TITLES[v])||((v==="home"?"":({about:"About",consultations:"Packages",shop:"Shop",checkout:"Checkout",book:"Book",contact:"Contact",policies:"Policies"}[v])+" · ")+"Rituchakkra Vastu");
  if(anchor)requestAnimationFrame(()=>scrollToAnchor(false));else window.scrollTo(0,0);
  requestAnimationFrame(armReveals);
}
function route(){
  const prev=current,v=parse();closeAll();
  if(prev===v&&anchor){scrollToAnchor(true);return}
  if(prev===null){show(v);return}
  if(document.startViewTransition&&!reduced){document.startViewTransition(()=>show(v))}
  else{const m=$("#main");m.classList.add("fade");setTimeout(()=>{show(v);m.classList.remove("fade")},200)}
}

/* reveals: content is visible at rest; only off-screen blocks get a rise-in */
let io;
function armReveals(){
  io&&io.disconnect();
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove("pre");e.target.classList.add("in");io.unobserve(e.target);if(e.target.id==="chat")playChat()}}),{rootMargin:"0px 0px -8% 0px"});
  $$(`[data-view="${current}"] .rv`).forEach(el=>{
    if(reduced){if(el.id==="chat")playChat();return}
    el.classList.remove("in");
    if(el.getBoundingClientRect().top<innerHeight*.95){el.classList.add("in");if(el.id==="chat")playChat()}else{el.classList.add("pre");io.observe(el)}
  });
}
addEventListener("scroll",()=>{$("#topbar").classList.toggle("scrolled",scrollY>8);$("#mbar").classList.toggle("show",scrollY>420)},{passive:true});

/* =========================================================
   Home: ring, band, counters, beam, chat
   ========================================================= */
function ringSVG(){
  let h=`<circle cx="200" cy="210" r="192" fill="none" stroke="var(--hair)"/><circle cx="200" cy="210" r="172" fill="none" stroke="var(--hair)" opacity=".7"/>`;
  for(let i=0;i<120;i++){const a=i*3*Math.PI/180,l=i%5===0?12:6;h+=`<line x1="${(200+192*Math.sin(a)).toFixed(2)}" y1="${(210-192*Math.cos(a)).toFixed(2)}" x2="${(200+(192-l)*Math.sin(a)).toFixed(2)}" y2="${(210-(192-l)*Math.cos(a)).toFixed(2)}" stroke="var(--gold-2)" stroke-width="${i%5?0.6:1.1}" opacity=".6"/>`}
  ZONES.forEach((z,i)=>{const a=i*22.5*Math.PI/180,x=200+182*Math.sin(a),y=210-182*Math.cos(a);h+=`<text x="${x.toFixed(1)}" y="${(y+3.4).toFixed(1)}" text-anchor="middle" transform="rotate(${i*22.5} ${x.toFixed(1)} ${y.toFixed(1)})">${z[0]}</text>`});
  return h;
}
$$("#ring,[data-ring]").forEach(g=>g.innerHTML=ringSVG());
$("#band-a").innerHTML=Array(2).fill(["Homes","Plots","Offices","Shops","Factories","Clinics","Hotels","Rentals"].map(w=>`<span>${w}</span>`).join("")).join("");
$("#band-b").innerHTML=Array(2).fill(["without breaking a wall","online across India","16 zones, one reading","remedies you can place"].map(w=>`<span>${w}</span>`).join("")).join("");
$("#from-price").textContent=inr(fromPrice);$("#chip-price").textContent=inr(fromPrice);$("#mbar-book").textContent="Book from "+inr(fromPrice);
$$("#ig-pill,#reel-chip,#ig-btn,[data-ig]").forEach(a=>a.href=CONFIG.instagram);
$("#wa-float").href=$("#mbar-wa").href=$("#wa-how").href=waLink("Namaste, I'd like to know more about your Vastu consultations.");
$("#f-phone").textContent=CONFIG.phone;$("#f-email").textContent=CONFIG.email;$("#f-addr").textContent=CONFIG.address;
if(!reduced){const run=el=>{const t=+el.dataset.count,suf=el.dataset.suffix||"",st=performance.now();(function f(n){const k=Math.min(1,(n-st)/1600),e=1-Math.pow(1-k,3);el.textContent=Math.round(t*e).toLocaleString("en-IN")+suf;if(k<1)requestAnimationFrame(f)})(st)};
  const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){run(e.target);cio.unobserve(e.target)}}));$$("[data-count]").forEach(el=>cio.observe(el))}
function drawBeam(){
  const svg=$("#beam-lines"),nodes=$$("#nodes .node");if(!svg||!nodes.length||getComputedStyle(svg).display==="none")return;
  const b=svg.getBoundingClientRect();if(!b.width)return;
  const pts=nodes.map(n=>{const r=n.getBoundingClientRect();return[r.left-b.left+r.width/2,r.bottom-b.top]});
  const y=b.height-26;let d=`M${pts[0][0]} ${pts[0][1]} V${y-14} Q${pts[0][0]} ${y} ${pts[0][0]+14} ${y} H${pts[pts.length-1][0]-14} Q${pts[pts.length-1][0]} ${y} ${pts[pts.length-1][0]} ${y-14} V${pts[pts.length-1][1]}`;
  let ticks=pts.slice(1,-1).map(p=>`M${p[0]} ${p[1]} V${y}`).join(" ");
  svg.innerHTML=`<path d="${d} ${ticks}"/><path class="flow" d="${d}"/>`;
}
addEventListener("resize",()=>{if(current==="home"){drawBeam();mapper.resize()}});
let chatPlayed=false;
function playChat(){if(chatPlayed)return;chatPlayed=true;$$("#chat .bub").forEach((b,i)=>setTimeout(()=>b.classList.add("on"),reduced?0:350+i*650))}

/* =========================================================
   Zone Mapper
   ========================================================= */
const mapper=(function(){
  const cv=$("#zm"),cw=$("#cw"),ctx=cv.getContext("2d");
  let W=0,img=null,center={x:.5,y:.5},north=0,sel=2,drag=false,dpr=1,moved=false;
  const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function resize(){const r=cw.getBoundingClientRect();if(!r.width)return;dpr=Math.min(2,devicePixelRatio||1);W=r.width;cv.width=W*dpr;cv.height=W*dpr;draw()}
  function samplePlan(){
    const s=W,L=.12*s,T=.12*s,R=.88*s,B=.88*s,x1=.42*s,x2=.6*s,y1=.38*s,y2=.66*s;
    ctx.fillStyle="#FDF8F2";ctx.fillRect(0,0,s,s);
    ctx.strokeStyle="#3A2426";ctx.lineWidth=Math.max(2,s/220);ctx.lineCap="square";
    ctx.strokeRect(L,T,R-L,B-T);
    const ln=(a,b,c,d)=>{ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke()};
    ln(L,y1,R,y1);ln(x1,T,x1,y1);ln(x2,T,x2,y1);ln(L,y2,x1,y2);ln(x1,y1,x1,B);ln(x2,y2,R,y2);ln(x2,y2,x2,B);
    ctx.fillStyle="#FDF8F2";ctx.fillRect(R-2,y1+(y2-y1)*.35,6,(y2-y1)*.3);
    ctx.fillStyle="#76625D";ctx.font=`700 ${Math.max(9,s/52)}px Manrope,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";
    [["BEDROOM",(L+x1)/2,(T+y1)/2],["BATH",(x1+x2)/2,(T+y1)/2],["POOJA",(x2+R)/2,(T+y1)/2],["STUDY",(L+x1)/2,(y1+y2)/2],["LIVING",(x1+R)/2,(y1+y2)/2],["MASTER BED",(L+x1)/2,(y2+B)/2],["DINING",(x1+x2)/2,(y2+B)/2],["KITCHEN",(x2+R)/2,(y2+B)/2]].forEach(([t,x,y])=>ctx.fillText(t,x,y));
    ctx.fillStyle="#B95B22";ctx.fillText("ENTRANCE →",R-s*.09,y1+(y2-y1)*.5+s*.05);
  }
  function draw(){
    if(!W)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,W);
    if(img){ctx.fillStyle="#fff";ctx.fillRect(0,0,W,W);const k=Math.min(W/img.width,W/img.height),w=img.width*k,h=img.height*k;ctx.drawImage(img,(W-w)/2,(W-h)/2,w,h)}else samplePlan();
    const cx=center.x*W,cy=center.y*W,R=W*1.5,rad=d=>(d-90)*Math.PI/180;
    const a0=north+sel*22.5-11.25,a1=a0+22.5;
    ctx.fillStyle="rgba(185,91,34,.22)";ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,rad(a0),rad(a1));ctx.closePath();ctx.fill();
    ctx.strokeStyle="rgba(185,91,34,.55)";ctx.lineWidth=1;
    for(let i=0;i<16;i++){const a=rad(north+i*22.5-11.25);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+R*Math.cos(a),cy+R*Math.sin(a));ctx.stroke()}
    const lr=W*.43;ctx.font=`800 ${Math.max(9,W/50)}px Manrope,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";
    ZONES.forEach((z,i)=>{const a=rad(north+i*22.5),x=cx+lr*Math.cos(a),y=cy+lr*Math.sin(a);if(x<10||y<10||x>W-10||y>W-10)return;const tw=ctx.measureText(z[0]).width+12,th=W/28+4;
      ctx.fillStyle=i===sel?"#B95B22":"rgba(255,255,255,.94)";ctx.strokeStyle=i===sel?"#B95B22":"rgba(58,36,38,.25)";ctx.beginPath();ctx.roundRect?ctx.roundRect(x-tw/2,y-th/2,tw,th,6):ctx.rect(x-tw/2,y-th/2,tw,th);ctx.fill();ctx.stroke();
      ctx.fillStyle=i===sel?"#fff":"#3A2426";ctx.fillText(z[0],x,y+1)});
    ctx.strokeStyle="#B95B22";ctx.lineWidth=2;const c=W/34;ctx.beginPath();ctx.moveTo(cx-c,cy);ctx.lineTo(cx+c,cy);ctx.moveTo(cx,cy-c);ctx.lineTo(cx,cy+c);ctx.stroke();
    ctx.fillStyle="#DD8A4E";ctx.beginPath();ctx.arc(cx,cy,W/110+2,0,7);ctx.fill();
  }
  function zoneAt(x,y){const cx=center.x*W,cy=center.y*W;let ang=Math.atan2(x-cx,-(y-cy))*180/Math.PI;ang=((ang-north+11.25)%360+360)%360;return Math.floor(ang/22.5)%16}
  function pos(e){const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
  cv.addEventListener("pointerdown",e=>{const[x,y]=pos(e);moved=false;if(Math.hypot(x-center.x*W,y-center.y*W)<Math.max(28,W/14)){drag=true;cw.classList.add("drag");cv.setPointerCapture(e.pointerId)}});
  cv.addEventListener("pointermove",e=>{if(!drag)return;moved=true;const[x,y]=pos(e);center={x:Math.min(.95,Math.max(.05,x/W)),y:Math.min(.95,Math.max(.05,y/W))};$("#cw-hint").style.opacity=0;draw()});
  cv.addEventListener("pointerup",e=>{if(drag){drag=false;cw.classList.remove("drag");if(moved)return}const[x,y]=pos(e);pick(zoneAt(x,y))});
  // dial
  const dial=$("#dial");let ticks="";for(let i=0;i<36;i++){const a=i*10*Math.PI/180,l=i%9===0?8:4;ticks+=`<line x1="${56+50*Math.sin(a)}" y1="${56-50*Math.cos(a)}" x2="${56+(50-l)*Math.sin(a)}" y2="${56-(50-l)*Math.cos(a)}" stroke="rgba(255,255,255,.45)" stroke-width="${i%9?1:1.6}"/>`}
  $("#dial-svg").innerHTML=`<circle cx="56" cy="56" r="54" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.18)"/>${ticks}<g id="needle" style="transform-origin:56px 56px"><path d="M56 12 L63 56 H49Z" fill="#DD8A4E"/><path d="M56 100 L63 56 H49Z" fill="rgba(255,255,255,.35)"/><text x="56" y="34" text-anchor="middle" font-family="Manrope,sans-serif" font-size="10" font-weight="800" fill="#2A1416">N</text></g><circle cx="56" cy="56" r="4" fill="#fff"/>`;
  function setNorth(d){north=((Math.round(d)%360)+360)%360;$("#needle").style.transform=`rotate(${north}deg)`;$("#deg").textContent=String(north).padStart(3,"0")+"°";dial.setAttribute("aria-valuenow",north);draw();info()}
  let dd=false;const dang=e=>{const r=dial.getBoundingClientRect();return Math.atan2(e.clientX-(r.left+r.width/2),-(e.clientY-(r.top+r.height/2)))*180/Math.PI};
  dial.addEventListener("pointerdown",e=>{dd=true;dial.setPointerCapture(e.pointerId);setNorth(dang(e))});
  dial.addEventListener("pointermove",e=>{if(dd)setNorth(dang(e))});
  dial.addEventListener("pointerup",()=>dd=false);
  dial.addEventListener("keydown",e=>{const s=e.shiftKey?15:1;if(e.key==="ArrowRight"||e.key==="ArrowUp"){e.preventDefault();setNorth(north+s)}if(e.key==="ArrowLeft"||e.key==="ArrowDown"){e.preventDefault();setNorth(north-s)}});
  // zone info
  $("#zchips").innerHTML=ZONES.map((z,i)=>`<button aria-pressed="false" data-i="${i}">${z[0]}</button>`).join("");
  $("#zchips").addEventListener("click",e=>{const b=e.target.closest("button");if(b)pick(+b.dataset.i)});
  function info(){const z=ZONES[sel],lo=((sel*22.5-11.25)%360+360)%360,hi=sel*22.5+11.25;
    $("#zinfo").innerHTML=`<div class="swap"><div class="zc">${z[0]}</div><div class="zd">${lo.toFixed(2)}° to ${hi.toFixed(2)}° · ${esc(z[1])}</div><h3>${esc(z[2])}</h3><p>${esc((typeof ZONE_NOTES!=="undefined"?ZONE_NOTES:{})[z[0]]||"")}</p></div>`;
    $$("#zchips button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.i===sel))}
  function pick(i){sel=i;draw();info()}
  $("#plan-file").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;if(!/^image\//.test(f.type)){toast("Please choose an image (a photo or screenshot of your plan).");return}const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{img=im;center={x:.5,y:.5};draw();toast("Plan loaded. Drag the cross to the centre.")};im.src=r.result};r.readAsDataURL(f)});
  $("#plan-sample").onclick=()=>{img=null;$("#plan-file").value="";center={x:.5,y:.5};setNorth(0)};
  setNorth(0);
  return{resize};
})();

/* =========================================================
   Package finder (home) and package pages
   ========================================================= */
const pkgCard=(p,{dim,pick,label="Best match"}={})=>`<article class="pkg${pick?" pick":""}${dim?" dim":""}"><span class="match">${esc(label)}</span><div class="tag">${esc(p.tag||(p.mode==="online"?"Video call":"Site visit"))}</div><h3>${esc(p.name)}</h3><div class="pr">${inr(p.price)}<small>${esc(p.unit)}</small></div><div class="meta">${esc(p.meta)}</div><ul>${p.feat.map(f=>`<li>${esc(f)}</li>`).join("")}</ul>${btn("Choose",`href="#book-${p.id}" data-choose="${p.id}"`,"button sm")}</article>`;
const fq={for:"home",need:"full",meet:"online"};
function renderFinder(){
  const list=PACKAGES.filter(p=>p.mode===fq.meet);let best;
  if(fq.meet==="online")best=fq.for==="office"?"commercial":fq.need==="quick"?"online-45":"online-report";
  else best=fq.for==="home"?"visit-2bhk":"visit-factory";
  $("#fpkgs").innerHTML=list.map(p=>pkgCard(p,{pick:p.id===best,dim:p.id!==best})).join("");
  $("#fnote").textContent=fq.meet==="online"?"Prices include GST. Business and larger packages start at the price shown; the final fee depends on size.":"Site visits are in Mumbai. Homes above 2 BHK are "+inr(PACKAGES.find(p=>p.id==="visit-large").price)+". Travel outside Mumbai is agreed before you pay.";
}
$$(".opts[data-q]").forEach(g=>g.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;fq[g.dataset.q]=b.dataset.v;$$("button",g).forEach(x=>x.setAttribute("aria-pressed",x===b));renderFinder()}));
renderFinder();
let consultMode="online";
function renderPkgs(){$("#seg").dataset.v=consultMode;$$("#seg button").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===consultMode));$("#pkgs").innerHTML=PACKAGES.filter(p=>p.mode===consultMode).map(p=>pkgCard(p,{pick:!!p.tag,label:p.tag||""})).join("")}
$("#seg").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;consultMode=b.dataset.v;renderPkgs()});
(function(){
  const rows=[["Meeting","Video call","Online","Online","Site visit","Site visit","Site visit"],["Floor plan and photo review",1,1,1,1,1,1],["Zones mapped and remedies",1,1,1,1,1,1],["Written report",0,1,1,1,1,1],["Remedies placed on site",0,0,0,1,1,1],["Nirantar follow-up",0,1,1,1,1,1]];
  $("#cmp").innerHTML=`<table><thead><tr><th>Includes</th>${PACKAGES.map(p=>`<th>${esc(p.name)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td>${r.slice(1).map(v=>v===1?`<td class="y">✓</td>`:v===0?`<td class="muted">–</td>`:`<td>${v}</td>`).join("")}</tr>`).join("")}<tr><td><b>Price</b></td>${PACKAGES.map(p=>`<td class="num"><b>${inr(p.price)}</b>${p.unit==="onwards"?" +":""}</td>`).join("")}</tr></tbody></table>`;
  $$("[data-faq]").forEach(el=>el.innerHTML=FAQ.map(q=>`<details><summary>${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join(""));
  $("#legacy").innerHTML=CREDENTIALS.map(c=>`<div class="node"><div class="when">${esc(c[0])}</div><b>${esc(c[1])}</b><p>${esc(c[2])}</p></div>`).join("");
  if(TESTIMONIALS.length){$("#reviews").hidden=false;$("#reviews-track").innerHTML=Array(2).fill(TESTIMONIALS.map(t=>`<div class="rcard"><span style="color:var(--gold);letter-spacing:2px">★★★★★</span><p>${esc(t[0])}</p><b>${esc(t[1])}</b></div>`).join("")).join("")}
})();

/* =========================================================
   Products, quick view, cart
   ========================================================= */
const priced=p=>typeof p.price==="number";
const askLink=p=>waLink(`Namaste, I'd like the price and details for the ${p.name}.`);
const buyBtn=(p,cls="ghost")=>priced(p)?`<button class="${cls}" data-add="${p.id}">Add to cart</button>`:`<a class="${cls}" target="_blank" rel="noopener" href="${esc(askLink(p))}">Ask on WhatsApp ↗</a>`;
const card=p=>`<article class="prod" data-id="${p.id}" tabindex="0"><div class="img">${art(p)}</div><div class="info"><span class="cat">${esc(p.cat)}</span><h3>${esc(p.name)}</h3><span class="pp">${priced(p)?inr(p.price):"Price on request"}</span><div class="act">${buyBtn(p)}</div></div></article>`;
$("#home-prods").innerHTML=PRODUCTS.slice(0,4).map(card).join("");
const CATS=["All",...new Set(PRODUCTS.map(p=>p.cat))];
$("#filters").innerHTML=CATS.map((c,i)=>`<button aria-pressed="${!i}" data-c="${c}">${c}</button>`).join("");
function renderShop(c){$("#shop-grid").innerHTML=PRODUCTS.filter(p=>c==="All"||p.cat===c).map(card).join("")}
renderShop("All");
$("#filters").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;$$("#filters button").forEach(x=>x.setAttribute("aria-pressed",x===b));renderShop(b.dataset.c)});
document.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]");if(add){e.stopPropagation();addToCart(add.dataset.add,1);return}
  if(e.target.closest(".prod a"))return;const p=e.target.closest(".prod");if(p)openQV(p.dataset.id);
});
document.addEventListener("keydown",e=>{const p=e.target.closest&&e.target.closest(".prod");if(p&&e.key==="Enter"&&e.target===p)openQV(p.dataset.id);if(e.key==="Escape")closeAll()});
function openQV(id){
  const p=PRODUCTS.find(x=>x.id===id);
  $("#qv").innerHTML=`<button class="ib mclose" data-close aria-label="Close"><svg><use href="#i-x"/></svg></button><div class="qv"><div class="img">${art(p)}</div><div class="txt"><span class="label">${esc(p.cat)}</span><h2>${esc(p.name)}</h2><div class="price">${priced(p)?inr(p.price):"Price on request"}</div><p class="muted">${esc(p.desc)}</p><ul>${p.details.map(d=>`<li>${esc(d)}</li>`).join("")}</ul><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">${priced(p)?btn("Add to cart",`data-add="${p.id}"`)+`<button class="ghost" data-buy="${p.id}">Buy now</button>`:`<a class="button" target="_blank" rel="noopener" href="${esc(askLink(p))}">${AR}Ask on WhatsApp</a>`}</div></div></div>`;
  openLayer("#qv");
}
$("#qv").addEventListener("click",e=>{if(e.target.closest("[data-close]"))closeAll();const b=e.target.closest("[data-buy]");if(b){addToCart(b.dataset.buy,1,true);go("checkout")}});
let cart=store.get("cart",{});
const cartItems=()=>Object.entries(cart).map(([id,q])=>({p:PRODUCTS.find(x=>x.id===id),q})).filter(x=>x.p&&priced(x.p));
const subtotal=()=>cartItems().reduce((s,x)=>s+x.p.price*x.q,0);
const shipping=()=>{const s=subtotal();return s===0||s>=CONFIG.freeShippingOver?0:CONFIG.shippingFlat};
function saveCart(bump){store.set("cart",cart);const n=cartItems().reduce((a,x)=>a+x.q,0),b=$("#cart-count");b.hidden=!n;b.textContent=n;if(bump){b.classList.remove("bump");void b.offsetWidth;b.classList.add("bump")}renderCart()}
function addToCart(id,q,silent){cart[id]=(cart[id]||0)+q;saveCart(true);if(!silent)toast(PRODUCTS.find(x=>x.id===id).name+" added to cart")}
function renderCart(){
  const items=cartItems();
  $("#cart-lines").innerHTML=items.length?items.map(({p,q})=>`<div class="cline"><div class="th">${art(p)}</div><div><b>${esc(p.name)}</b><div class="qty"><button data-q="${p.id}" data-d="-1" aria-label="Fewer">−</button><span>${q}</span><button data-q="${p.id}" data-d="1" aria-label="More">+</button></div></div><div class="amt">${inr(p.price*q)}<button class="rm" data-rm="${p.id}">Remove</button></div></div>`).join(""):`<div class="empty"><svg><use href="#mk"/></svg><p>Your cart is empty.</p><a class="ghost" href="/shop/">Browse the shop</a></div>`;
  $("#cart-foot").innerHTML=items.length?`<div class="sum"><div class="r"><span>Subtotal</span><span>${inr(subtotal())}</span></div><div class="r muted"><span>Shipping</span><span>${shipping()?inr(shipping()):"Free"}</span></div><div class="r t"><span>Total</span><span>${inr(subtotal()+shipping())}</span></div>${btn("Checkout",'href="/checkout/"')}</div>`:"";
}
$("#cart").addEventListener("click",e=>{const q=e.target.closest("[data-q]"),r=e.target.closest("[data-rm]");if(q){const id=q.dataset.q;cart[id]=(cart[id]||0)+ +q.dataset.d;if(cart[id]<=0)delete cart[id];saveCart()}if(r){delete cart[r.dataset.rm];saveCart()}});
saveCart();
function openLayer(sel){$("#scrim").classList.add("on");$(sel).classList.add("on");$(sel).setAttribute("aria-hidden","false");setTimeout(()=>{const f=$(sel).querySelector("button,a,input");f&&f.focus()},60)}
function closeAll(){["#cart","#qv","#mnav"].forEach(s=>{$(s).classList.remove("on","open");$(s).setAttribute("aria-hidden","true")});if(!$("#pay").classList.contains("on"))$("#scrim").classList.remove("on")}
$("#cart-btn").onclick=()=>openLayer("#cart");$("#cart-x").onclick=closeAll;
$("#scrim").onclick=()=>{if(!$("#pay").classList.contains("on"))closeAll()};
$("#burger").onclick=()=>{$("#mnav").classList.add("open");$("#mnav").setAttribute("aria-hidden","false")};$("#mclose").onclick=closeAll;

/* =========================================================
   Payments (Razorpay) — live when CONFIG.razorpayKey is set
   ========================================================= */
async function pay({amount,description,notes,prefill}){
  if(liveMode){
    try{
      await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      let order=null;
      try{const r=await fetch(CONFIG.createOrderUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({amount:Math.round(amount*100),notes})});if(r.ok)order=await r.json()}catch(e){}
      return await new Promise((ok,no)=>{
        const rz=new Razorpay({key:CONFIG.razorpayKey,amount:Math.round(amount*100),currency:"INR",name:CONFIG.business,description,order_id:order&&order.id,notes,prefill,theme:{color:"#B95B22"},
          handler:async res=>{let verified=null;try{const v=await fetch(CONFIG.verifyUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(res)});verified=v.ok?(await v.json()).verified:null}catch(e){}ok({id:res.razorpay_payment_id,verified,test:false})},
          modal:{ondismiss:()=>no(new Error("Payment cancelled"))}});
        rz.on("payment.failed",r=>no(new Error(r.error&&r.error.description||"Payment failed")));rz.open();
      });
    }catch(e){if(e.message&&/cancel|fail/i.test(e.message))throw e;toast("Couldn't reach Razorpay. Using test mode.")}
  }
  return testPay({amount,description});
}
function testPay({amount,description}){
  return new Promise((ok,no)=>{
    const m=$("#pay");
    m.innerHTML=`<div class="ps-head"><svg><use href="#mk"/></svg><div><div style="font-size:13px;opacity:.75">${esc(description)}</div><div class="amt">${inr(amount)}</div></div></div><div class="ps-body"><span class="test">Test mode · no money will be charged</span><div class="methods" role="radiogroup" aria-label="Payment method"><label><input type="radio" name="pm" id="pm-upi" checked> UPI · GPay, PhonePe, Paytm</label><label><input type="radio" name="pm" id="pm-card"> Debit or credit card</label><label><input type="radio" name="pm" id="pm-nb"> Net banking</label></div><button class="button" id="ps-go">${AR}Pay ${inr(amount)}</button><button class="ghost" id="ps-cancel" style="justify-content:center">Cancel</button><p class="muted" style="font-size:12.5px">Add your Razorpay key in the site settings to take real payments here.</p></div>`;
    $("#scrim").classList.add("on");m.classList.add("on");setTimeout(()=>$("#ps-go").focus(),60);
    const close=()=>{m.classList.remove("on");$("#scrim").classList.remove("on")};
    $("#ps-cancel").onclick=()=>{close();no(new Error("Payment cancelled"))};
    $("#ps-go").onclick=()=>{const b=$("#ps-go");b.innerHTML='<span class="spin"></span> Processing';b.disabled=true;setTimeout(()=>{close();ok({id:"pay_TEST"+Math.random().toString(36).slice(2,12).toUpperCase(),test:true})},1300)};
  });
}

/* =========================================================
   Forms
   ========================================================= */
function field(id,label,ac,type="text",full){return `<div class="fld${full?" full":""}"><label for="${id}">${label}</label><input id="${id}" type="${type}" autocomplete="${ac}"><span class="err"></span></div>`}
function validate(ids){let ok=true;ids.forEach(([id,test,msg])=>{const el=$("#"+id),f=el.closest(".fld"),bad=!test(el.value.trim());f.classList.toggle("bad",bad);f.querySelector(".err").textContent=bad?msg:"";if(bad&&ok){el.focus();ok=false}});return ok}
const isEmail=v=>/^\S+@\S+\.\S+$/.test(v), isPhone=v=>v.replace(/\D/g,"").length>=10, has=v=>v.length>1, isPin=v=>/^\d{6}$/.test(v);
const doneHTML=(title,msg,rows,actions)=>`<div class="done-box swap"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h3 style="font-size:32px;margin:0">${title}</h3><p class="muted" style="max-width:52ch">${msg}</p><dl class="kv">${rows.map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join("")}</dl><div class="acts" style="justify-content:center">${actions}</div></div>`;

/* checkout */
let lastOrder=null;
function renderCheckout(){
  const root=$("#co-root");
  if(lastOrder){root.innerHTML=`<div class="panel" style="margin-bottom:clamp(64px,8vw,100px)">${doneHTML("Order placed",`Thank you, ${esc(lastOrder.name)}. We'll energise and dispatch your order within 2–3 working days and share tracking on WhatsApp.`,[["Order total",inr(lastOrder.total)],["Payment ID",lastOrder.pay.id+(lastOrder.pay.test?" (test)":"")],["Items",lastOrder.items]],btn("Continue shopping",'href="/shop/"'))}</div>`;lastOrder=null;return}
  const items=cartItems();
  if(!items.length){root.innerHTML=`<div class="empty" style="padding-bottom:88px"><svg><use href="#mk"/></svg><p>Your cart is empty.</p><a class="ghost" href="/shop/">Browse the shop</a></div>`;return}
  root.innerHTML=`<div class="co"><form class="panel" id="co-form" novalidate><h3>Delivery details</h3><div class="fields">${field("co-name","Full name","name")}${field("co-phone","Mobile number","tel","tel")}${field("co-email","Email","email","email",true)}${field("co-addr","Address","street-address","text",true)}${field("co-city","City","address-level2")}${field("co-pin","PIN code","postal-code")}${field("co-state","State","address-level1","text",true)}</div><div class="acts"><button class="button" type="submit">${AR}Pay ${inr(subtotal()+shipping())}</button></div><p class="secure" style="margin-top:14px"><svg><use href="#i-lock"/></svg>Secured by Razorpay. UPI, cards and net banking.</p></form>
  <aside class="summary"><b style="font-family:var(--display);font-size:20px">Summary</b>${items.map(({p,q})=>`<div class="cline" style="grid-template-columns:48px 1fr auto"><div class="th" style="width:48px;height:48px">${art(p)}</div><div><b>${esc(p.name)}</b><small class="muted">Qty ${q}</small></div><div class="amt">${inr(p.price*q)}</div></div>`).join("")}<div class="sum"><div class="r"><span>Subtotal</span><span>${inr(subtotal())}</span></div><div class="r muted"><span>Shipping</span><span>${shipping()?inr(shipping()):"Free"}</span></div></div><div class="tot"><span>Total</span><span>${inr(subtotal()+shipping())}</span></div></aside></div>`;
  const saved=store.get("details",{});["name","phone","email"].forEach(k=>{if(saved[k])$("#co-"+k).value=saved[k]});
  $("#co-form").onsubmit=async e=>{
    e.preventDefault();
    if(!validate([["co-name",has,"Enter your name"],["co-phone",isPhone,"Enter a 10-digit mobile number"],["co-email",isEmail,"Enter a valid email"],["co-addr",has,"Enter your address"],["co-city",has,"Enter your city"],["co-pin",isPin,"Enter a 6-digit PIN code"],["co-state",has,"Enter your state"]]))return;
    const d={name:$("#co-name").value.trim(),phone:$("#co-phone").value.trim(),email:$("#co-email").value.trim()};store.set("details",Object.assign(store.get("details",{}),d));
    const total=subtotal()+shipping(),itemsTxt=cartItems().map(({p,q})=>`${p.name} × ${q}`).join(", ");
    try{const res=await pay({amount:total,description:"Vastu products order",prefill:{name:d.name,email:d.email,contact:d.phone},notes:{type:"product_order",items:itemsTxt.slice(0,250),address:`${$("#co-addr").value}, ${$("#co-city").value} ${$("#co-pin").value}, ${$("#co-state").value}`.slice(0,250)}});
      lastOrder={name:d.name,total,pay:res,items:itemsTxt};cart={};saveCart();renderCheckout();scrollTo(0,0)}
    catch(err){toast(err.message||"Payment didn't go through. Please try again.")}
  };
}

/* =========================================================
   Booking: 1 Time → 2 Your home → 3 Pay
   With a Calendly link the live calendar is step 1; otherwise a sample calendar shows.
   ========================================================= */
let bk={pkg:PACKAGES.find(p=>p.id==="online-report"),step:0,slot:null,d:{},file:null,pay:null};
let bookHost=null;
function mountBook(v){bookHost=$(`.book-host[data-host="${v}"]`);$$(".book-host").forEach(h=>{if(h!==bookHost)h.innerHTML=""});
  if(bookPick){const p=PACKAGES.find(x=>x.id===bookPick);if(p){if(bk.pay)bk={pkg:p,step:0,slot:null,d:{},file:null,pay:null};else if(bk.pkg.id!==p.id){bk.pkg=p;bk.slot=null;bk.step=0}}bookPick=null}
  renderBook()}
document.addEventListener("click",e=>{const c=e.target.closest("[data-choose]");if(!c||current!=="home")return;e.preventDefault();e.stopImmediatePropagation();const p=PACKAGES.find(x=>x.id===c.dataset.choose);if(bk.pay)bk={pkg:p,step:0,slot:null,d:{},file:null,pay:null};else{bk.pkg=p;bk.slot=null;bk.step=0}renderBook();anchor="booknow";scrollToAnchor(true)},true);
function renderBook(){
  if(!bookHost)return;
  bookHost.innerHTML=`<div class="book"><div style="min-width:0"><div class="stepper">${["Time","Your home","Pay"].map((s,i)=>`<span class="${bk.pay||i<bk.step?"done":i===bk.step?"on":""}"><i>${bk.pay||i<bk.step?"✓":i+1}</i>${s}</span>`).join("")}</div><div class="panel" id="bk-panel"></div></div><aside class="summary" id="bk-sum"></aside></div>`;
  renderSummary();
  if(bk.pay)return stepDone();
  [stepTime,stepHome,stepPay][bk.step]();
}
function renderSummary(){
  const p=bk.pkg;$("#bk-sum").innerHTML=`<div class="who"><img src="${esc(PORTRAIT)}" alt=""><div><b>Rahul Purohit</b><small>Your consultant</small></div></div><dl><dt>Package</dt><dd>${esc(p.name)}</dd><dt>Meeting</dt><dd>${p.mode==="online"?"Video call":"Site visit"}</dd><dt>When</dt><dd>${bk.slot?esc(bk.slot.label):"Pick a time"}</dd><dt>Floor plan</dt><dd>${bk.file?esc(bk.file.name.length>22?bk.file.name.slice(0,20)+"…":bk.file.name):"Share after booking"}</dd></dl><div class="tot"><span>Total</span><span>${inr(p.price)}</span></div>${p.unit==="onwards"?`<p class="muted" style="font-size:12.5px">Starting price. Any balance for larger spaces is confirmed before the consultation.</p>`:""}<p class="secure"><svg><use href="#i-lock"/></svg>Secured by Razorpay. UPI, cards and net banking.</p>`;
}
function pkSelect(){return `<div class="pksel" id="pksel" role="group" aria-label="Package">${PACKAGES.map(p=>`<button aria-pressed="${p.id===bk.pkg.id}" data-p="${p.id}">${esc(p.name)}<small>${inr(p.price)} · ${p.mode==="online"?"video":"site visit"}</small></button>`).join("")}</div>`}
function stepTime(){
  const p=bk.pkg,panel=$("#bk-panel");
  panel.innerHTML=`<div class="swap"><h3>Choose a package and time</h3>${pkSelect()}<div id="cal-host"></div></div>`;
  $("#pksel").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;bk.pkg=PACKAGES.find(x=>x.id===b.dataset.p);bk.slot=null;renderBook()});
  const host=$("#cal-host");
  if(calendlyReady(p.calendly)){
    const saved=store.get("details",{});const url=p.calendly+(p.calendly.includes("?")?"&":"?")+"hide_gdpr_banner=1";
    host.innerHTML=`<div class="cal-embed" id="cal"></div><div id="cal-fb" hidden style="display:grid;gap:12px;justify-items:start"><p class="muted">Open the calendar, book a slot, then come back here to finish.</p><a class="ghost" target="_blank" rel="noopener" href="${esc(url)}">Open the booking calendar ↗</a>${btn("I've picked my slot",'id="cal-done"')}</div>`;
    loadScript("https://assets.calendly.com/assets/external/widget.js").then(()=>{
      Calendly.initInlineWidget({url,parentElement:$("#cal"),prefill:{name:saved.name||"",email:saved.email||""}});
      addEventListener("message",function h(e){if(e.data&&e.data.event==="calendly.event_scheduled"){removeEventListener("message",h);bk.slot={label:"Booked in Calendly"};bk.step=1;renderBook()}});
    }).catch(()=>{$("#cal").remove();$("#cal-fb").hidden=false;$("#cal-done").onclick=()=>{bk.slot={label:"Booked in Calendly"};bk.step=1;renderBook()}});
    return;
  }
  const days=[];let t=new Date();t.setHours(0,0,0,0);while(days.length<7){t=new Date(t.getTime()+864e5);if(t.getDay()!==0)days.push(new Date(t))}
  const times=["10:00 am","11:00 am","12:30 pm","3:00 pm","4:30 pm","6:00 pm","7:30 pm","8:30 pm"];
  let di=bk._di??0,ti=bk._ti??null;
  const draw=()=>{host.innerHTML=`<div class="days" role="group" aria-label="Day">${days.map((d,i)=>`<button aria-pressed="${i===di}" data-di="${i}">${d.toLocaleDateString("en-IN",{weekday:"short"})}<b>${d.getDate()}</b>${d.toLocaleDateString("en-IN",{month:"short"})}</button>`).join("")}</div><div class="times" role="group" aria-label="Time (IST)">${times.map((x,i)=>`<button aria-pressed="${i===ti}" data-ti="${i}" ${(di*3+i)%5===2?"disabled":""}>${x}</button>`).join("")}</div><p class="hint">Times in IST. Sample calendar: live slots appear here once Rahul's Calendly link is added.</p><div class="acts">${btn("Continue",`id="t-next"${ti===null?" disabled":""}`)}</div>`;
    $$("[data-di]",host).forEach(b=>b.onclick=()=>{di=+b.dataset.di;ti=null;draw()});
    $$("[data-ti]",host).forEach(b=>b.onclick=()=>{ti=+b.dataset.ti;bk.slot={label:days[di].toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})+", "+times[ti]};renderSummary();draw()});
    $("#t-next").onclick=()=>{bk._di=di;bk._ti=ti;bk.step=1;renderBook()}};
  draw();
}
const DIRS=["Not sure","North","North-east","East","South-east","South","South-west","West","North-west"];
function stepHome(){
  const p=bk.pkg,saved=Object.assign({},store.get("details",{}),bk.d);
  $("#bk-panel").innerHTML=`<form class="swap" id="bk-form" novalidate><h3>Tell us about your home</h3><div class="fields">${field("bk-name","Full name","name")}${field("bk-phone","Mobile / WhatsApp","tel","tel")}${field("bk-email","Email","email","email")}${field("bk-city","City","address-level2")}${p.mode==="person"?field("bk-addr","Site address","street-address","text",true):""}<div class="fld full"><label for="bk-door">Main door faces</label><select id="bk-door">${DIRS.map(d=>`<option>${d}</option>`).join("")}</select></div>
  <label class="drop" for="bk-file"><input type="file" id="bk-file" accept="image/*,application/pdf"><span class="ic"><svg viewBox="0 0 24 24"><use href="#i-up"/></svg></span><span><b id="bk-file-t">${bk.file?esc(bk.file.name):"Add your floor plan (optional)"}</b><small>A photo with the main door marked is enough. After paying, you'll send it to Rahul on WhatsApp.</small></span></label>
  <div class="fld full"><label for="bk-note">Anything Rahul should know?</label><textarea id="bk-note" placeholder="e.g. 3 BHK, trouble sleeping in the master bedroom"></textarea></div></div>
  <div class="acts">${btn("Continue to payment",'type="submit"')}<button class="ghost" type="button" id="bk-back">Back</button></div></form>`;
  ["name","phone","email","city","addr","note","door"].forEach(k=>{const el=$("#bk-"+k);if(el&&saved[k])el.value=saved[k]});
  $("#bk-file").onchange=e=>{bk.file=e.target.files[0]||null;$("#bk-file-t").textContent=bk.file?bk.file.name:"Add your floor plan (optional)";renderSummary()};
  $("#bk-back").onclick=()=>{collect();bk.step=0;renderBook()};
  function collect(){bk.d={name:$("#bk-name").value.trim(),phone:$("#bk-phone").value.trim(),email:$("#bk-email").value.trim(),city:$("#bk-city").value.trim(),addr:p.mode==="person"?$("#bk-addr").value.trim():"",door:$("#bk-door").value,note:$("#bk-note").value.trim()}}
  $("#bk-form").onsubmit=e=>{e.preventDefault();
    const rules=[["bk-name",has,"Enter your name"],["bk-phone",isPhone,"Enter a 10-digit mobile number"],["bk-email",isEmail,"Enter a valid email"],["bk-city",has,"Enter your city"]];if(p.mode==="person")rules.push(["bk-addr",has,"Enter the site address"]);
    if(!validate(rules))return;collect();store.set("details",{name:bk.d.name,phone:bk.d.phone,email:bk.d.email,city:bk.d.city});bk.step=2;renderBook()};
}
function stepPay(){
  const p=bk.pkg,d=bk.d;
  $("#bk-panel").innerHTML=`<div class="swap"><h3>Review and pay</h3><dl class="kv"><dt>Package</dt><dd>${esc(p.name)}</dd><dt>When</dt><dd>${esc(bk.slot.label)}</dd><dt>Name</dt><dd>${esc(d.name)}</dd><dt>WhatsApp</dt><dd>${esc(d.phone)}</dd><dt>Main door</dt><dd>${esc(d.door)}</dd></dl><div class="acts">${btn("Pay "+inr(p.price),'id="bk-pay"')}<button class="ghost" id="bk-back2">Back</button></div><p class="secure" style="margin-top:14px"><svg><use href="#i-lock"/></svg>Secured by Razorpay. We never see your card or UPI details.</p></div>`;
  $("#bk-back2").onclick=()=>{bk.step=1;renderBook()};
  $("#bk-pay").onclick=async()=>{
    try{bk.pay=await pay({amount:p.price,description:p.name,prefill:{name:d.name,email:d.email,contact:d.phone},notes:{type:"consultation",package:p.name,slot:bk.slot.label,city:d.city,door:d.door,note:d.note.slice(0,200)}});renderBook()}
    catch(err){toast(err.message||"Payment didn't go through. Please try again.")}};
}
function stepDone(){
  const p=bk.pkg,d=bk.d;
  const msg=`Namaste, I've booked ${p.name}.\nName: ${d.name}\nSlot: ${bk.slot.label}\nMain door: ${d.door}\nPayment ID: ${bk.pay.id}${d.note?"\nNote: "+d.note:""}\nI'm sending my floor plan here.`;
  const canShare=bk.file&&navigator.canShare&&navigator.canShare({files:[bk.file]});
  $("#bk-panel").innerHTML=doneHTML("You're booked",`Thank you, ${esc(d.name)}. ${p.mode==="online"?"Send your floor plan on WhatsApp so Rahul can study it before the call.":"We'll call to confirm the visit and directions."}`,[["Package",p.name],["When",bk.slot.label],["Paid",inr(p.price)],["Payment ID",bk.pay.id+(bk.pay.test?" (test)":"")]],
    (canShare?btn("Send floor plan on WhatsApp",'id="bk-share"'):`<a class="button" target="_blank" rel="noopener" href="${esc(waLink(msg))}">${AR}Send details on WhatsApp</a>`)+`<button class="ghost" id="bk-new">Book another</button>`);
  if(canShare)$("#bk-share").onclick=()=>navigator.share({files:[bk.file],text:msg}).catch(()=>window.open(waLink(msg),"_blank"));
  $("#bk-new").onclick=()=>{bk={pkg:bk.pkg,step:0,slot:null,d:{},file:null,pay:null};renderBook()};
}

/* =========================================================
   Contact, policies, misc
   ========================================================= */
$("#cinfo").innerHTML=[["WhatsApp / Phone",CONFIG.phone],["Email",CONFIG.email],["Studio",CONFIG.address],["Hours",CONFIG.hours]].filter(r=>r[1]).map(([k,v],i)=>`<div class="ci"><dt>${k}</dt><dd><span>${esc(v)}</span>${i<2?`<button class="copy" data-copy="${esc(v)}">Copy</button>`:""}</dd></div>`).join("")+`<div class="ci"><dt>Instagram</dt><dd><a class="tlink" target="_blank" rel="noopener" href="${CONFIG.instagram}">@rituchakkravastu ↗</a></dd></div><div style="padding-top:20px"><a class="button" target="_blank" rel="noopener" href="${waLink("Namaste, I have a question about Vastu consultation.")}">${AR}Chat on WhatsApp</a></div>`;
document.addEventListener("click",e=>{const c=e.target.closest("[data-copy]");if(!c)return;const v=c.dataset.copy;const fb=()=>{const s=getSelection(),r=document.createRange();r.selectNodeContents(c.previousElementSibling);s.removeAllRanges();s.addRange(r);toast("Selected. Press copy.")};try{navigator.clipboard.writeText(v).then(()=>toast("Copied"),fb)}catch(err){fb()}});
$("#cform").onsubmit=e=>{e.preventDefault();if(!validate([["c-name",has,"Enter your name"]]))return;const t=`Namaste, I'm ${$("#c-name").value.trim()}${$("#c-city").value?" from "+$("#c-city").value.trim():""}.\nAbout: ${$("#c-topic").value}\n${$("#c-msg").value.trim()}`;$("#c-out").innerHTML=`<div class="note swap">Your message is ready.</div><div style="margin-top:10px"><a class="ghost" target="_blank" rel="noopener" href="${esc(waLink(t))}">Open WhatsApp to send ↗</a></div>`};
let polKey="terms";
function renderPol(){$("#polnav").innerHTML=Object.entries(POLICIES).map(([k,v])=>`<button aria-pressed="${k===polKey}" data-k="${k}">${v[0]}</button>`).join("");$("#poltext").innerHTML=`<div class="swap" style="display:grid;gap:14px"><h2>${POLICIES[polKey][0]}</h2>${POLICIES[polKey][1]}<p style="font-size:13px">Last updated November 2026.</p></div>`}
$("#polnav").addEventListener("click",e=>{const b=e.target.closest("button");if(b){polKey=b.dataset.k;renderPol()}});
document.addEventListener("click",e=>{const a=e.target.closest("[data-pol]");if(a){polKey=a.dataset.pol;renderPol()}});
renderPol();
(function(){const bits=[];if(!liveMode)bits.push("test payments");if(PACKAGES.some(p=>!calendlyReady(p.calendly)))bits.push("sample calendar");if(!bits.length||store.get("hidebar",false))return;
  $("#cbar").hidden=false;$("#cbar-txt").innerHTML="Preview: <b>"+bits.join(" and ")+"</b>. Nothing is charged until Razorpay and Calendly are connected.";$("#cbar-x").onclick=()=>{$("#cbar").hidden=true;store.set("hidebar",true)}})();
route();
