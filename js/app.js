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
let toastT;function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("on"),2600)}
function loadScript(src){return new Promise((ok,no)=>{if($(`script[src="${src}"]`))return ok();const s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);setTimeout(()=>no(new Error("timeout")),6000)})}
const ART={
 yantra:'<svg class="art" viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" fill="none" stroke="var(--mark)" stroke-width="2"/><rect x="12" y="12" width="76" height="76" fill="none" stroke="var(--mark)" stroke-width="1"/><circle cx="50" cy="50" r="32" fill="none" stroke="var(--ink)" stroke-width="1.4"/><path d="M50 22 74 64H26Z M50 78 26 36H74Z" fill="none" stroke="var(--ink)" stroke-width="1.6"/><circle cx="50" cy="50" r="3.6" fill="var(--dot)"/></svg>',
 strip:'<svg class="art" viewBox="0 0 100 100"><g transform="rotate(-28 50 50)"><rect x="4" y="30" width="92" height="10" rx="2" fill="var(--mark)"/><rect x="4" y="46" width="92" height="10" rx="2" fill="var(--mark)" opacity=".75"/><rect x="4" y="62" width="92" height="10" rx="2" fill="var(--mark)" opacity=".5"/></g></svg>',
 pyramid:'<svg class="art" viewBox="0 0 100 100"><path d="M50 12 90 82H10Z" fill="var(--mark)"/><path d="M50 12 64 82H90Z" fill="var(--ink)" opacity=".25"/><path d="M10 88h80" stroke="var(--ink)" stroke-width="1.4"/></svg>',
 drop:'<svg class="art" viewBox="0 0 100 100"><path d="M50 10C70 36 80 52 80 66a30 30 0 0 1-60 0c0-14 10-30 30-56Z" fill="none" stroke="var(--mark)" stroke-width="3"/><circle cx="50" cy="66" r="10" fill="var(--dot)" opacity=".85"/></svg>',
 coin:'<svg class="art" viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="var(--mark)"/><circle cx="50" cy="50" r="29" fill="none" stroke="var(--ink)" stroke-width="1.4" opacity=".5"/><text x="50" y="62" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="34" fill="var(--ink)">₹1</text></svg>',
 crystal:'<svg class="art" viewBox="0 0 100 100"><circle cx="50" cy="46" r="32" fill="none" stroke="var(--mark)" stroke-width="2.5"/><path d="M34 34a20 20 0 0 1 14-8" stroke="var(--mark)" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M28 86h44l-8-12H36Z" fill="var(--ink)" opacity=".8"/></svg>'
};
const art=p=>p.img?`<img src="${esc(p.img)}" alt="${esc(p.name)}">`:ART[p.art];

/* =========================================================
   Router + transitions
   ========================================================= */
const VIEWS=$$("[data-view]").map(v=>v.dataset.view);
let current=null, bookPick=null, consultMode="online";
// On the live site every page has its own address (/about/, /shop/ ...). In the preview, pages use #about, #shop.
const PATHS={home:"/",about:"/about/",consultations:"/consultations/",shop:"/shop/",book:"/book/",checkout:"/checkout/",contact:"/contact/",policies:"/policies/"};
const PATH_MODE=window.SITE_PATHS===true;
const targetOf=href=>{if(!href)return null;if(href.startsWith("#")){const t=href.slice(1)||"home";const v=t.startsWith("book-")?"book":t;return VIEWS.includes(v)?t:null}
  if(PATH_MODE&&href.startsWith("/")){const u=new URL(href,location.origin);const v=Object.keys(PATHS).find(k=>PATHS[k]===u.pathname);if(!v)return null;const pk=u.searchParams.get("package");return v==="book"&&pk?"book-"+pk:v}return null};
const urlFor=t=>t.startsWith("book-")?PATHS.book+"?package="+encodeURIComponent(t.slice(5)):(PATHS[t]||"/");
function go(t){if(!PATH_MODE){location.hash=t;return}history.pushState({},"",urlFor(t));route()}
function parse(){
  if(PATH_MODE){
    if(location.hash.length>1){const t=targetOf(location.hash);if(t){history.replaceState({},"",urlFor(t));}}
    const t=targetOf(location.pathname+location.search)||"home";if(t.startsWith("book-")){bookPick=t.slice(5);return"book"}return t;
  }
  const h=location.hash.slice(1)||"home";if(h.startsWith("book-")){bookPick=h.slice(5);return"book"}return VIEWS.includes(h)?h:"home"}
if(PATH_MODE){
  document.addEventListener("click",e=>{if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest("a[href]");if(!a||a.target==="_blank")return;const t=targetOf(a.getAttribute("href"));if(!t)return;e.preventDefault();go(t)});
  addEventListener("popstate",route);
}
function show(v){
  $$("[data-view]").forEach(el=>el.hidden=el.dataset.view!==v);
  $$(".menu a").forEach(a=>{if(targetOf(a.getAttribute("href"))===v)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
  window.scrollTo(0,0);
  if(v==="checkout")renderCheckout();
  if(v==="book")renderBook();
  if(v==="consultations")renderPkgs(false);
  if(v==="about")$("#timeline").classList.remove("go");
  current=v;document.title=(window.PAGE_TITLES&&PAGE_TITLES[v])||((v==="home"?"":titleFor(v)+" · ")+"Rituchakkra Vastu");
  requestAnimationFrame(armReveals);
}
const titleFor=v=>({about:"About",consultations:"Consultations",shop:"Shop",checkout:"Checkout",book:"Book",contact:"Contact",policies:"Policies"}[v]||"");
function route(){
  const v=parse();closeAll();
  if(current===null){show(v);return}
  if(document.startViewTransition&&!reduced){document.startViewTransition(()=>show(v))}
  else{const m=$("#main");m.classList.add("fallback-out");setTimeout(()=>{show(v);m.classList.remove("fallback-out")},200)}
}
if(!PATH_MODE)addEventListener("hashchange",route);

/* scroll reveals */
let io;
function armReveals(){
  io&&io.disconnect();
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove("pre");e.target.classList.add("in");io.unobserve(e.target);if(e.target.id==="timeline")e.target.classList.add("go")}}),{rootMargin:"0px 0px -8% 0px"});
  $$(`[data-view="${current}"] .rv, [data-view="${current}"] #timeline`).forEach(el=>{
    if(reduced){el.classList.add("go");return}
    el.classList.remove("in");
    if(el.getBoundingClientRect().top<innerHeight*.95){el.classList.add("in");if(el.id==="timeline")el.classList.add("go")}else{el.classList.add("pre");io.observe(el)}
  });
}
addEventListener("scroll",()=>$("#topbar").classList.toggle("scrolled",scrollY>8),{passive:true});

/* =========================================================
   Home
   ========================================================= */
(function ring(){
  const s=$("#ring"),N="http://www.w3.org/2000/svg";let h=`<circle cx="200" cy="200" r="196" fill="none" stroke="var(--line)"/>`;
  for(let i=0;i<120;i++){const a=i*3*Math.PI/180,l=i%10===0?14:6,r=196;h+=`<line x1="${200+r*Math.sin(a)}" y1="${200-r*Math.cos(a)}" x2="${200+(r-l)*Math.sin(a)}" y2="${200-(r-l)*Math.cos(a)}" stroke="var(--muted)" stroke-width="${i%10?0.6:1.2}" opacity=".7"/>`}
  ["N","E","S","W"].forEach((d,i)=>{const a=i*90*Math.PI/180;h+=`<text x="${200+168*Math.sin(a)}" y="${200-168*Math.cos(a)+4}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="12" fill="var(--copper)">${d}</text>`});
  s.innerHTML=h;
})();
$("#mq").innerHTML=Array(2).fill(["Homes","Plots","Offices","Health","Shops","Factories","Hotels","Rentals"].map(w=>`<span>${w}</span>`).join("")).join("");
$("#from-online").textContent="From "+inr(Math.min(...PACKAGES.filter(p=>p.mode==="online").map(p=>p.price)));
$("#from-person").textContent="From "+inr(Math.min(...PACKAGES.filter(p=>p.mode==="person").map(p=>p.price)));
$$(".way").forEach(w=>w.addEventListener("click",()=>{consultMode=w.dataset.mode}));

// counters
if(!reduced)$$("[data-count]").forEach(el=>{const t=+el.dataset.count,suf=el.dataset.suffix||"",st=performance.now();(function f(n){const k=Math.min(1,(n-st)/1600),e=1-Math.pow(1-k,3);el.textContent=Math.round(t*e).toLocaleString("en-IN")+suf;if(k<1)requestAnimationFrame(f)})(st)});

// zone wheel
(function wheel(){
  const s=$("#wheel");let h="";const cx=200,cy=200,R=200,r=78;
  ZONES.forEach((z,i)=>{
    const a0=(i*22.5-11.25-90)*Math.PI/180,a1=(i*22.5+11.25-90)*Math.PI/180;
    const p=(rr,a)=>`${cx+rr*Math.cos(a)} ${cy+rr*Math.sin(a)}`;
    h+=`<path class="wedge" data-i="${i}" tabindex="0" role="button" aria-label="${z[1]}: ${z[2]}" d="M${p(r,a0)}L${p(R,a0)}A${R} ${R} 0 0 1 ${p(R,a1)}L${p(r,a1)}A${r} ${r} 0 0 0 ${p(r,a0)}Z"/>`;
    const am=(i*22.5-90)*Math.PI/180;h+=`<text data-t="${i}" x="${cx+152*Math.cos(am)}" y="${cy+152*Math.sin(am)+4}" text-anchor="middle">${z[0]}</text>`;
  });
  h+=`<use href="#mk" x="${cx-58}" y="${cy-66}" width="116" height="132" style="color:var(--mark)"/>`;
  s.innerHTML=h;
  $("#zone-pills").innerHTML=ZONES.map((z,i)=>`<button aria-pressed="false" data-i="${i}">${z[0]}</button>`).join("");
  const pick=i=>{
    $$(".wedge",s).forEach(w=>w.classList.toggle("on",+w.dataset.i===i));$$("text",s).forEach(t=>t.classList.toggle("on",+t.dataset.t===i));
    $$("#zone-pills button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.i===i));
    const z=ZONES[i],lo=(i*22.5-11.25+360)%360,hi=i*22.5+11.25;
    $("#zone-out").innerHTML=`<div class="swap"><div class="dir">${z[0]}</div><div class="deg">${lo.toFixed(2)}° – ${hi.toFixed(2)}° · ${z[1]}</div><h3 style="margin-top:10px">${z[2]}</h3><p class="muted" style="margin-top:8px;max-width:46ch">What sits in this zone, and its colour, affects this area of life. A consultation reads all 16 together.</p></div>`;
  };
  s.addEventListener("click",e=>{const w=e.target.closest(".wedge");if(w)pick(+w.dataset.i)});
  s.addEventListener("keydown",e=>{const w=e.target.closest(".wedge");if(w&&(e.key==="Enter"||e.key===" ")){e.preventDefault();pick(+w.dataset.i)}});
  $("#zone-pills").addEventListener("click",e=>{const b=e.target.closest("button");if(b)pick(+b.dataset.i)});
  pick(2);
})();

// testimonials
(function(){
  if(!TESTIMONIALS.length||!$("#tq"))return;
  $("#tq").innerHTML=TESTIMONIALS.map((t,i)=>`<figure class="${i?"":"on"}"><blockquote>“${esc(t[0])}”</blockquote><figcaption>${esc(t[1])}</figcaption></figure>`).join("");
  $("#tdots").innerHTML=TESTIMONIALS.map((_,i)=>`<button aria-label="Testimonial ${i+1}" aria-current="${!i}"></button>`).join("");
  let k=0,timer;const go=i=>{k=i;$$("#tq figure").forEach((f,j)=>f.classList.toggle("on",j===i));$$("#tdots button").forEach((b,j)=>b.setAttribute("aria-current",j===i))};
  const auto=()=>{clearInterval(timer);if(!reduced)timer=setInterval(()=>go((k+1)%TESTIMONIALS.length),6000)};
  $("#tdots").addEventListener("click",e=>{const b=e.target.closest("button");if(b){go($$("#tdots button").indexOf(b));auto()}});auto();
})();

/* =========================================================
   Products, quick view, cart
   ========================================================= */
const priced=p=>typeof p.price==="number";
const askLink=p=>waLink(`Namaste, I'd like the price and details for the ${p.name}.`);
const buyBtn=(p,cls="btn sm")=>priced(p)?`<button class="${cls}" data-add="${p.id}">Add to cart</button>`:`<a class="${cls}" target="_blank" rel="noopener" href="${esc(askLink(p))}">Ask on WhatsApp ↗</a>`;
const card=(p,i)=>`<article class="prod" style="--d:${(i%8)*.05}s" data-id="${p.id}" tabindex="0"><div class="img">${art(p)}<div class="quick">${buyBtn(p)}</div></div><div class="info"><span class="cat">${esc(p.cat)}</span><h3>${esc(p.name)}</h3><span class="pr">${priced(p)?inr(p.price):"Price on request"}</span></div></article>`;
$("#home-prods").innerHTML=PRODUCTS.slice(0,4).map(card).join("");
const CATS=["All",...new Set(PRODUCTS.map(p=>p.cat))];
$("#filters").innerHTML=CATS.map((c,i)=>`<button class="chip" aria-pressed="${!i}" data-c="${c}">${c}</button>`).join("");
function renderShop(c){$("#shop-grid").innerHTML=PRODUCTS.filter(p=>c==="All"||p.cat===c).map(card).join("")}
renderShop("All");
$("#filters").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;$$(".chip").forEach(x=>x.setAttribute("aria-pressed",x===b));renderShop(b.dataset.c)});

document.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]");if(add){e.stopPropagation();addToCart(add.dataset.add,1,add);return}
  if(e.target.closest(".prod a"))return;const p=e.target.closest(".prod");if(p)openQV(p.dataset.id);
});
document.addEventListener("keydown",e=>{const p=e.target.closest&&e.target.closest(".prod");if(p&&e.key==="Enter"&&e.target===p)openQV(p.dataset.id);if(e.key==="Escape")closeAll()});

function openQV(id){
  const p=PRODUCTS.find(x=>x.id===id);
  $("#qv").innerHTML=`<button class="icon-btn mclose" data-close aria-label="Close"><svg><use href="#i-x"/></svg></button><div class="qv"><div class="img">${art(p)}</div><div class="txt"><span class="eyebrow">${esc(p.cat)}</span><h2>${esc(p.name)}</h2><div class="price">${priced(p)?inr(p.price):"Price on request"}</div><p class="muted">${esc(p.desc)}</p><ul>${p.details.map(d=>`<li>${esc(d)}</li>`).join("")}</ul><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">${priced(p)?`<button class="btn" data-add="${p.id}">Add to cart</button><button class="btn line" data-buy="${p.id}">Buy now</button>`:buyBtn(p,"btn")}</div></div></div>`;
  openLayer("#qv");
}
$("#qv").addEventListener("click",e=>{if(e.target.closest("[data-close]"))closeAll();const b=e.target.closest("[data-buy]");if(b){addToCart(b.dataset.buy,1,null,true);go("checkout")}});

let cart=store.get("cart",{});
const cartItems=()=>Object.entries(cart).map(([id,q])=>({p:PRODUCTS.find(x=>x.id===id),q})).filter(x=>x.p);
const subtotal=()=>cartItems().reduce((s,x)=>s+x.p.price*x.q,0);
const shipping=()=>{const s=subtotal();return s===0||s>=CONFIG.freeShippingOver?0:CONFIG.shippingFlat};
function saveCart(){store.set("cart",cart);const n=Object.values(cart).reduce((a,b)=>a+b,0),b=$("#cart-count");b.hidden=!n;b.textContent=n;b.classList.remove("bump");void b.offsetWidth;b.classList.add("bump");renderCart()}
function addToCart(id,q,src,silent){cart[id]=(cart[id]||0)+q;saveCart();const p=PRODUCTS.find(x=>x.id===id);if(!silent){toast(p.name+" added to cart");if(src&&!reduced)flyTo(src)}}
function flyTo(src){const r=src.getBoundingClientRect(),t=$("#cart-btn").getBoundingClientRect(),d=document.createElement("div");d.style.cssText=`position:fixed;z-index:130;left:${r.left+r.width/2-8}px;top:${r.top+r.height/2-8}px;width:16px;height:16px;border-radius:50%;background:var(--dot);transition:transform .7s cubic-bezier(.5,-.3,.6,1),opacity .7s`;document.body.appendChild(d);requestAnimationFrame(()=>{d.style.transform=`translate(${t.left+t.width/2-r.left-r.width/2}px,${t.top+t.height/2-r.top-r.height/2}px) scale(.5)`;d.style.opacity=".4"});setTimeout(()=>d.remove(),720)}
function renderCart(){
  const items=cartItems();
  $("#cart-lines").innerHTML=items.length?items.map(({p,q})=>`<div class="cline"><div class="th">${ART[p.art]}</div><div><b>${esc(p.name)}</b><div class="qty"><button data-q="${p.id}" data-d="-1" aria-label="Fewer">−</button><span>${q}</span><button data-q="${p.id}" data-d="1" aria-label="More">+</button></div></div><div class="amt">${inr(p.price*q)}<button class="rm" data-rm="${p.id}">Remove</button></div></div>`).join(""):`<div class="empty"><svg><use href="#mk"/></svg><p>Your cart is empty.</p><a class="btn sm" href="/shop/">Browse the shop</a></div>`;
  $("#cart-foot").innerHTML=items.length?`<div class="sum"><div class="r"><span>Subtotal</span><span>${inr(subtotal())}</span></div><div class="r muted"><span>Shipping</span><span>${shipping()?inr(shipping()):"Free"}</span></div><div class="r t"><span>Total</span><span>${inr(subtotal()+shipping())}</span></div><a class="btn" href="/checkout/" style="margin-top:8px">Checkout <span class="arrow">→</span></a>${subtotal()<CONFIG.freeShippingOver?`<p class="muted" style="font-size:.85rem;text-align:center">Add ${inr(CONFIG.freeShippingOver-subtotal())} more for free shipping</p>`:""}</div>`:"";
}
$("#cart").addEventListener("click",e=>{const q=e.target.closest("[data-q]"),r=e.target.closest("[data-rm]");if(q){const id=q.dataset.q;cart[id]=(cart[id]||0)+ +q.dataset.d;if(cart[id]<=0)delete cart[id];saveCart()}if(r){delete cart[r.dataset.rm];saveCart()}});
saveCart();$("#cart-count").classList.remove("bump");

/* layers */
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
        const rz=new Razorpay({key:CONFIG.razorpayKey,amount:Math.round(amount*100),currency:"INR",name:CONFIG.business,description,order_id:order&&order.id,notes,prefill,theme:{color:getComputedStyle(document.documentElement).getPropertyValue("--copper").trim()||"#B95B22"},
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
    m.innerHTML=`<div class="ps-head"><svg><use href="#mk"/></svg><div><div style="font-size:.85rem;opacity:.75">${esc(description)}</div><div class="amt">${inr(amount)}</div></div></div><div class="ps-body"><span class="test">Test mode · no money will be charged</span><div class="methods" role="radiogroup" aria-label="Payment method"><label><input type="radio" name="pm" id="pm-upi" checked> UPI · GPay, PhonePe, Paytm</label><label><input type="radio" name="pm" id="pm-card"> Debit or credit card</label><label><input type="radio" name="pm" id="pm-nb"> Netbanking</label></div><button class="btn" id="ps-go">Pay ${inr(amount)}</button><button class="btn line" id="ps-cancel">Cancel</button><p class="muted" style="font-size:.8rem">Add your Razorpay key in the site settings to take real payments here.</p></div>`;
    $("#scrim").classList.add("on");m.classList.add("on");setTimeout(()=>$("#ps-go").focus(),60);
    const close=()=>{m.classList.remove("on");$("#scrim").classList.remove("on")};
    $("#ps-cancel").onclick=()=>{close();no(new Error("Payment cancelled"))};
    $("#ps-go").onclick=()=>{const b=$("#ps-go");b.innerHTML='<span class="spin"></span> Processing';b.disabled=true;setTimeout(()=>{close();ok({id:"pay_TEST"+Math.random().toString(36).slice(2,12).toUpperCase(),test:true})},1300)};
  });
}

/* =========================================================
   Checkout
   ========================================================= */
let lastOrder=null;
function field(id,label,ac,type="text",full){return `<div class="fld"${full?' style="grid-column:1/-1"':""}><label for="${id}">${label}</label><input id="${id}" type="${type}" autocomplete="${ac}"><span class="err"></span></div>`}
function validate(ids){let ok=true;ids.forEach(([id,test,msg])=>{const el=$("#"+id),f=el.closest(".fld"),bad=!test(el.value.trim());f.classList.toggle("bad",bad);f.querySelector(".err").textContent=bad?msg:"";if(bad&&ok){el.focus();ok=false}});return ok}
const isEmail=v=>/^\S+@\S+\.\S+$/.test(v), isPhone=v=>v.replace(/\D/g,"").length>=10, has=v=>v.length>1, isPin=v=>/^\d{6}$/.test(v);
function renderCheckout(){
  const root=$("#co-root");
  if(lastOrder){root.innerHTML=successHTML("Order placed",`Thank you, ${esc(lastOrder.name)}. We'll energise and dispatch your order within 2–3 working days and share tracking on WhatsApp.`,[["Order total",inr(lastOrder.total)],["Payment ID",lastOrder.pay.id+(lastOrder.pay.test?" (test)":"")],["Items",lastOrder.items]],`<a class="btn" href="/shop/">Continue shopping</a>`);lastOrder=null;return}
  const items=cartItems();
  if(!items.length){root.innerHTML=`<div class="empty" style="padding-bottom:88px"><svg><use href="#mk"/></svg><p>Your cart is empty.</p><a class="btn" href="/shop/">Browse the shop</a></div>`;return}
  root.innerHTML=`<div class="co"><form class="panel form" id="co-form" novalidate><h3>Delivery details</h3><div class="f2">${field("co-name","Full name","name")}${field("co-phone","Mobile number","tel","tel")}${field("co-email","Email","email","email",true)}${field("co-addr","Address","street-address","text",true)}${field("co-city","City","address-level2")}${field("co-pin","PIN code","postal-code","text")}${field("co-state","State","address-level1","text",true)}</div><button class="btn" type="submit" id="co-pay"><svg width="16" height="16"><use href="#i-lock"/></svg> Pay ${inr(subtotal()+shipping())}</button><div class="secure"><svg><use href="#i-lock"/></svg>Payments are processed securely by Razorpay. We never see your card or UPI details.</div><div class="paylogos"><span>UPI</span><span>Cards</span><span>Netbanking</span><span>Wallets</span></div></form>
  <div class="panel aside"><h3>Summary</h3>${items.map(({p,q})=>`<div class="cline" style="grid-template-columns:52px 1fr auto"><div class="th" style="width:52px;height:52px">${ART[p.art]}</div><div><b>${esc(p.name)}</b><small class="muted">Qty ${q}</small></div><div class="amt">${inr(p.price*q)}</div></div>`).join("")}<div class="sum"><div class="r"><span>Subtotal</span><span>${inr(subtotal())}</span></div><div class="r muted"><span>Shipping</span><span>${shipping()?inr(shipping()):"Free"}</span></div><div class="r t"><span>Total</span><span>${inr(subtotal()+shipping())}</span></div></div></div></div>`;
  const saved=store.get("details",{});["name","phone","email"].forEach(k=>{if(saved[k])$("#co-"+k).value=saved[k]});
  $("#co-form").onsubmit=async e=>{
    e.preventDefault();
    if(!validate([["co-name",has,"Enter your name"],["co-phone",isPhone,"Enter a 10-digit mobile number"],["co-email",isEmail,"Enter a valid email"],["co-addr",has,"Enter your address"],["co-city",has,"Enter your city"],["co-pin",isPin,"Enter a 6-digit PIN code"],["co-state",has,"Enter your state"]]))return;
    const d={name:$("#co-name").value.trim(),phone:$("#co-phone").value.trim(),email:$("#co-email").value.trim()};store.set("details",d);
    const total=subtotal()+shipping(),itemsTxt=cartItems().map(({p,q})=>`${p.name} × ${q}`).join(", ");
    try{
      const res=await pay({amount:total,description:"Vastu products order",prefill:{name:d.name,email:d.email,contact:d.phone},notes:{type:"product_order",items:itemsTxt.slice(0,250),address:`${$("#co-addr").value}, ${$("#co-city").value} ${$("#co-pin").value}, ${$("#co-state").value}`.slice(0,250)}});
      lastOrder={name:d.name,total,pay:res,items:itemsTxt};cart={};saveCart();renderCheckout();scrollTo(0,0);
    }catch(err){toast(err.message||"Payment didn't go through. Please try again.")}
  };
}
function successHTML(title,msg,rows,actions){return `<div class="success swap" style="padding-bottom:88px"><svg class="seal${reduced||!(window.CSS&&CSS.registerProperty)?"":" draw"}"><use href="#mk"/></svg><h2>${title}</h2><p class="muted" style="max-width:52ch">${msg}</p><dl class="kv">${rows.map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join("")}</dl><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center">${actions}</div></div>`}

/* =========================================================
   Consultations
   ========================================================= */
function renderPkgs(anim=true){
  const list=PACKAGES.filter(p=>p.mode===consultMode),el=$("#pkgs");
  $("#seg").dataset.v=consultMode;$$("#seg button").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===consultMode));
  el.innerHTML=list.map(p=>`<article class="pkg${p.tag?" feat":""}"><div class="tag">${p.tag||""}</div><h3>${esc(p.name)}</h3><div class="price">${inr(p.price)}<small>${esc(p.unit)}</small></div><div class="meta">${esc(p.meta)}</div><ul>${p.feat.map(f=>`<li>${esc(f)}</li>`).join("")}</ul><a class="btn${p.tag?"":" line"}" href="#book-${p.id}">Book &amp; pay <span class="arrow">→</span></a></article>`).join("");
  el.classList.remove("enter");void el.offsetWidth;el.classList.add("enter");
}
$("#seg").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;consultMode=b.dataset.v;renderPkgs()});
(function(){
  const rows=[["Mode","Video call","Online","Online","Site visit","Site visit","Site visit"],["Floor plan and photo review",1,1,1,1,1,1],["Zones mapped and remedies",1,1,1,1,1,1],["Written report",0,1,1,1,1,1],["Remedies placed on site",0,0,0,1,1,1],["Nirantar follow-up",0,1,1,1,1,1]];
  $("#cmp").innerHTML=`<table><thead><tr><th>Includes</th>${PACKAGES.map(p=>`<th>${esc(p.name)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td>${r.slice(1).map(v=>v===1?`<td class="y">✓</td>`:v===0?`<td class="muted">–</td>`:`<td>${v}</td>`).join("")}</tr>`).join("")}<tr><td><b>Price</b></td>${PACKAGES.map(p=>`<td style="font-variant-numeric:tabular-nums"><b>${inr(p.price)}</b></td>`).join("")}</tr></tbody></table>`;
  $("#faq").innerHTML=FAQ.map(q=>`<details><summary>${esc(q[0])}<span class="pm" aria-hidden="true">+</span></summary><div class="ans">${esc(q[1])}</div></details>`).join("");
})();

/* =========================================================
   Booking: package → details → pay → schedule
   ========================================================= */
let bk={step:0,pkg:null,d:{},pay:null,slot:null};
function setStep(n){bk.step=n;$$("#stepper li").forEach((li,i)=>{li.className=i<n?"done":i===n?"on":""})}
function renderBook(){
  if(bookPick){const p=PACKAGES.find(x=>x.id===bookPick);if(p){bk={step:1,pkg:p,d:bk.d||{},pay:null,slot:null}}bookPick=null}
  if(bk.pay)return stepSchedule();
  if(!bk.pkg||bk.step===0)return stepPackage();
  stepDetails();
}
function bookAside(){const p=bk.pkg;return p?`<div class="panel aside"><span class="eyebrow">${p.mode==="online"?"Online":"In person"}</span><h3 style="margin:8px 0 4px">${esc(p.name)}</h3><p class="muted" style="font-size:.92rem">${esc(p.meta)}</p><div class="sum" style="margin-top:12px"><div class="r t"><span>To pay now</span><span>${inr(p.price)}</span></div></div>${p.unit==="onwards"?`<p class="muted" style="font-size:.85rem;margin-top:10px">Any balance for larger areas is confirmed before your consultation.</p>`:""}<div class="secure"><svg><use href="#i-lock"/></svg>Secured by Razorpay</div></div>`:""}
function stepPackage(){
  setStep(0);
  $("#book-root").innerHTML=`<div class="co swap"><div class="panel"><h3>Choose a package</h3><div class="pick" id="pick">${["online","person"].map(m=>`<div class="eyebrow" style="margin-top:6px">${m==="online"?"Online":"In person"}</div>`+PACKAGES.filter(p=>p.mode===m).map(p=>`<label class="opt${bk.pkg&&bk.pkg.id===p.id?" sel":""}"><input type="radio" name="pk" value="${p.id}"${bk.pkg&&bk.pkg.id===p.id?" checked":""}><span><b>${esc(p.name)}</b><small>${esc(p.meta)}</small></span><span class="p">${inr(p.price)}</span></label>`).join("")).join("")}</div><button class="btn" id="pk-next" style="margin-top:20px"${bk.pkg?"":" disabled"}>Continue <span class="arrow">→</span></button></div>${bookAside()||`<div class="panel aside"><h3>How booking works</h3><p class="muted">Pick a package, add your details and pay securely. Then choose a time from the live calendar.</p></div>`}</div>`;
  $("#pick").addEventListener("change",e=>{bk.pkg=PACKAGES.find(p=>p.id===e.target.value);stepPackage()});
  $("#pk-next").onclick=()=>{bk.step=1;stepDetails()};
}
function stepDetails(){
  setStep(1);const p=bk.pkg,saved=Object.assign(store.get("details",{}),bk.d);
  $("#book-root").innerHTML=`<div class="co swap"><form class="panel form" id="bk-form" novalidate><h3>Your details</h3><div class="f2">${field("bk-name","Full name","name")}${field("bk-phone","Mobile / WhatsApp","tel","tel")}${field("bk-email","Email","email","email",true)}${field("bk-city","City","address-level2","text",true)}${p.mode==="person"?field("bk-addr","Site address","street-address","text",true):""}</div><div class="fld"><label for="bk-note">About your space</label><textarea id="bk-note" placeholder="e.g. 3 BHK, east-facing entrance, issues with sleep in the master bedroom"></textarea></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" type="submit"><svg width="16" height="16"><use href="#i-lock"/></svg> Pay ${inr(p.price)}</button><button class="btn line" type="button" id="bk-back">Change package</button></div></form>${bookAside()}</div>`;
  ["name","phone","email","city"].forEach(k=>{if(saved[k])$("#bk-"+k).value=saved[k]});if(saved.note)$("#bk-note").value=saved.note;
  $("#bk-back").onclick=()=>{bk.step=0;stepPackage()};
  $("#bk-form").onsubmit=async e=>{
    e.preventDefault();
    const rules=[["bk-name",has,"Enter your name"],["bk-phone",isPhone,"Enter a 10-digit mobile number"],["bk-email",isEmail,"Enter a valid email"],["bk-city",has,"Enter your city"]];if(p.mode==="person")rules.push(["bk-addr",has,"Enter the site address"]);
    if(!validate(rules))return;
    bk.d={name:$("#bk-name").value.trim(),phone:$("#bk-phone").value.trim(),email:$("#bk-email").value.trim(),city:$("#bk-city").value.trim(),note:$("#bk-note").value.trim(),addr:p.mode==="person"?$("#bk-addr").value.trim():""};
    store.set("details",{name:bk.d.name,phone:bk.d.phone,email:bk.d.email,city:bk.d.city});
    setStep(2);
    try{bk.pay=await pay({amount:p.price,description:p.name,prefill:{name:bk.d.name,email:bk.d.email,contact:bk.d.phone},notes:{type:"consultation",package:p.name,city:bk.d.city}});stepSchedule();scrollTo(0,0)}
    catch(err){setStep(1);toast(err.message||"Payment didn't go through. Please try again.")}
  };
}
function stepSchedule(){
  setStep(3);const p=bk.pkg,d=bk.d;
  if(bk.slot){return bookingDone()}
  const url=calendlyReady(p.calendly)?p.calendly+(p.calendly.includes("?")?"&":"?")+new URLSearchParams({name:d.name,email:d.email,a1:`Payment ${bk.pay.id} · ${d.phone} · ${d.city}${d.note?" · "+d.note:""}`.slice(0,1000),hide_gdpr_banner:1}):"";
  $("#book-root").innerHTML=`<div class="swap"><div class="note" style="margin-bottom:20px"><span style="color:var(--ok);font-weight:700">✓</span><span><b>Payment received${bk.pay.test?" (test)":""}.</b> ID ${esc(bk.pay.id)}. Now choose a time for your ${esc(p.name)}.</span></div><div class="panel" id="cal-host"></div></div>`;
  const host=$("#cal-host");
  if(url){
    host.innerHTML=`<div class="cal-embed" id="cal"></div><div id="cal-fb" hidden style="display:grid;gap:12px;justify-items:start"><h3>Pick your slot</h3><p class="muted">Your details and payment ID are filled in for you.</p><a class="btn" target="_blank" rel="noopener" href="${esc(url)}">Open the booking calendar <span class="arrow">↗</span></a><button class="btn line" id="cal-done">I've booked my slot</button></div>`;
    loadScript("https://assets.calendly.com/assets/external/widget.js").then(()=>{
      Calendly.initInlineWidget({url,parentElement:$("#cal"),prefill:{name:d.name,email:d.email}});
      addEventListener("message",function h(e){if(e.data&&e.data.event==="calendly.event_scheduled"){removeEventListener("message",h);bk.slot={label:"Confirmed in Calendly"};bookingDone()}});
    }).catch(()=>{$("#cal").remove();$("#cal-fb").hidden=false;$("#cal-done").onclick=()=>{bk.slot={label:"Booked in Calendly"};bookingDone()}});
  }else demoScheduler(host);
}
function demoScheduler(host){
  const days=[];let t=new Date();t.setHours(0,0,0,0);while(days.length<10){t=new Date(t.getTime()+864e5);if(t.getDay()!==0)days.push(new Date(t))}
  const times=["10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00"];let di=0,ti=null;
  const draw=()=>{host.innerHTML=`<div class="slots"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:baseline"><h3 style="margin:0">Pick your slot</h3><span class="test">Sample calendar · add your Calendly link to show real availability</span></div><div class="days" role="group" aria-label="Date">${days.map((d,i)=>`<button class="day" aria-pressed="${i===di}" data-di="${i}"><small>${d.toLocaleDateString("en-IN",{weekday:"short"})}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString("en-IN",{month:"short"})}</small></button>`).join("")}</div><div class="times" role="group" aria-label="Time (IST)">${times.map((x,i)=>`<button aria-pressed="${i===ti}" data-ti="${i}" ${(di*3+i)%5===2?"disabled style='opacity:.35;text-decoration:line-through'":""}>${x}</button>`).join("")}</div><button class="btn" id="slot-ok" ${ti===null?"disabled":""} style="justify-self:start">Confirm ${ti===null?"slot":days[di].toLocaleDateString("en-IN",{day:"numeric",month:"short"})+", "+times[ti]+" IST"}</button></div>`;
    $$(".day",host).forEach(b=>b.onclick=()=>{di=+b.dataset.di;ti=null;draw()});$$("[data-ti]",host).forEach(b=>b.onclick=()=>{ti=+b.dataset.ti;draw()});
    $("#slot-ok").onclick=()=>{bk.slot={label:days[di].toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})+", "+times[ti]+" IST"};bookingDone()}};
  draw();
}
function bookingDone(){
  setStep(4);const p=bk.pkg,d=bk.d;
  const msg=`Namaste, I've booked ${p.name}.\nName: ${d.name}\nSlot: ${bk.slot.label}\nPayment ID: ${bk.pay.id}`;
  $("#book-root").innerHTML=successHTML("You're booked",`Thank you, ${esc(d.name)}. A confirmation is on its way to ${esc(d.email)}. ${p.mode==="online"?"Keep your floor plan ready; we'll send a checklist on WhatsApp.":"We'll call to confirm directions to your site."}`,[["Package",p.name],["Slot",bk.slot.label],["Paid",inr(p.price)],["Payment ID",bk.pay.id+(bk.pay.test?" (test)":"")]],`<a class="btn" target="_blank" rel="noopener" href="${esc(waLink(msg))}">Send details on WhatsApp ↗</a><a class="btn line" href="/" id="bk-reset">Back to home</a>`);
  $("#bk-reset").onclick=()=>{bk={step:0,pkg:null,d:{},pay:null,slot:null}};
}

/* =========================================================
   Contact, policies, misc
   ========================================================= */
$("#cinfo").innerHTML=[["WhatsApp / Phone",CONFIG.phone],["Email",CONFIG.email],["Studio",CONFIG.address],["Hours",CONFIG.hours]].filter(r=>r[1]).map(([k,v],i)=>`<div class="ci"><dt>${k}</dt><dd><span>${esc(v)}</span>${i<2?`<button class="copy" data-copy="${esc(v)}">Copy</button>`:""}</dd></div>`).join("")+`<div class="ci"><dt>Instagram</dt><dd><a class="textlink" target="_blank" rel="noopener" href="${CONFIG.instagram}">@rituchakkravastu ↗</a></dd></div><a class="btn" target="_blank" rel="noopener" href="${waLink("Namaste, I have a question about Vastu consultation.")}" style="justify-self:start"><svg width="18" height="18"><use href="#i-wa"/></svg> Chat on WhatsApp</a>`;
document.addEventListener("click",e=>{const c=e.target.closest("[data-copy]");if(!c)return;const v=c.dataset.copy;navigator.clipboard&&navigator.clipboard.writeText(v).then(()=>toast("Copied")).catch(()=>{const s=getSelection(),r=document.createRange();r.selectNodeContents(c.previousElementSibling);s.removeAllRanges();s.addRange(r);toast("Selected. Press copy.")})});
$("#cform").onsubmit=e=>{e.preventDefault();if(!validate([["c-name",has,"Enter your name"]]))return;const t=`Namaste, I'm ${$("#c-name").value.trim()}${$("#c-city").value?" from "+$("#c-city").value.trim():""}.\nAbout: ${$("#c-topic").value}\n${$("#c-msg").value.trim()}`;$("#c-out").innerHTML=`<div class="note swap"><span>Your message is ready.</span></div><a class="btn line" style="margin-top:10px" target="_blank" rel="noopener" href="${esc(waLink(t))}">Open WhatsApp to send ↗</a>`};
$("#wa-float").href=waLink("Namaste, I'd like to know more about your Vastu consultations.");

let polKey="terms";
function renderPol(){$("#polnav").innerHTML=Object.entries(POLICIES).map(([k,v])=>`<button aria-pressed="${k===polKey}" data-k="${k}">${v[0]}</button>`).join("");$("#poltext").innerHTML=`<div class="swap" style="display:grid;gap:14px"><h2>${POLICIES[polKey][0]}</h2>${POLICIES[polKey][1]}<p style="font-size:.85rem">Last updated October 2026.</p></div>`}
$("#polnav").addEventListener("click",e=>{const b=e.target.closest("button");if(b){polKey=b.dataset.k;renderPol()}});
document.addEventListener("click",e=>{const a=e.target.closest("[data-pol]");if(a){polKey=a.dataset.pol;renderPol()}});
renderPol();

(function(){const hide=store.get("hidepreview",false);const el=$("#preview");if(hide){el.hidden=true;return}
  const bits=[];if(!liveMode)bits.push("test payments");if(PACKAGES.some(p=>!calendlyReady(p.calendly)))bits.push("sample calendar");if(!bits.length){el.hidden=true;return}
  $("#preview-txt").textContent="Preview: "+bits.join(", ");$("#preview-x").onclick=()=>{el.hidden=true;store.set("hidepreview",true)}})();

if(!(window.CSS&&CSS.registerProperty))$$(".draw").forEach(e=>e.classList.remove("draw"));
route();
