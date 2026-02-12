// ======================================================
// НАСТРОЙКИ
// ======================================================

const RELATIONSHIP_START = "2026-02-05";

// iOS detection
const IS_IOS =
  /iP(hone|ad|od)/.test(navigator.platform) ||
  (navigator.userAgent.includes("Mac") && "ontouchend" in document);

const MAX_HINT_BLUR = IS_IOS ? 5 : 6;
const MAX_LOVE_EXTRA_BLUR = IS_IOS ? 1.0 : 1.2;


// ======================================================
// УТИЛИТЫ
// ======================================================

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
function pad2(n){ return String(n).padStart(2,"0"); }

function wordDays(n){
  if(n%10===1 && n%100!==11) return "день";
  if([2,3,4].includes(n%10) && ![12,13,14].includes(n%100)) return "дня";
  return "дней";
}

function quantize(v, step){
  return Math.round(v/step)*step;
}


// ======================================================
// DOM
// ======================================================

const DOM = {
  btn: document.getElementById("moreBtn"),
  secret: document.getElementById("secret"),
  card: document.getElementById("card"),

  elDays: document.getElementById("relDays"),
  elDaysWord: document.getElementById("relDaysWord"),
  elHours: document.getElementById("relHours"),
  elMins: document.getElementById("relMins"),

  hero: document.getElementById("hero"),
  loveWord: document.getElementById("loveWord"),
  hintDown: document.getElementById("hintDown"),

  heartScene: document.getElementById("heartScene"),
  heartBlock: document.getElementById("heartBlock"),
  counterScene: document.getElementById("counterScene"),

  openMenu: document.getElementById("openMenu"),
  menuDropdown: document.getElementById("menuDropdown"),

  openThoughts: document.getElementById("openThoughts"),
  thoughtsModal: document.getElementById("thoughtsModal"),
  closeThoughts: document.getElementById("closeThoughts"),
  thoughtsArea: document.getElementById("thoughtsArea"),
  savedLabel: document.getElementById("savedLabel"),
};


// ======================================================
// READ MORE
// ======================================================

function initReadMore(){
  if(!DOM.btn || !DOM.secret) return;

  DOM.btn.addEventListener("click", ()=>{
    const opened = DOM.btn.getAttribute("aria-expanded")==="true";
    DOM.btn.setAttribute("aria-expanded", String(!opened));

    if(opened){
      DOM.secret.classList.remove("show");
      setTimeout(()=>DOM.secret.hidden=true,350);
      DOM.btn.textContent="прочитать больше +";
    }else{
      DOM.secret.hidden=false;
      requestAnimationFrame(()=>DOM.secret.classList.add("show"));
      DOM.btn.textContent="скрыть −";
    }
  });
}


// ======================================================
// REVEAL CARD
// ======================================================

function initRevealCard(){
  const card=DOM.card;
  if(!card) return;

  const io=new IntersectionObserver(e=>{
    if(e[0].isIntersecting){
      card.classList.add("show");
      io.disconnect();
    }
  },{threshold:.15});

  io.observe(card);
}


// ======================================================
// COUNTER
// ======================================================

function getStartDate(){
  const [y,m,d]=RELATIONSHIP_START.split("-").map(Number);
  return new Date(y,m-1,d,0,0,0);
}

function updateCounter(){
  if(!DOM.elDays) return;

  const diff=Math.max(0,new Date()-getStartDate());
  const mins=Math.floor(diff/60000);
  const hours=Math.floor(mins/60);

  const days=Math.floor(hours/24);

  DOM.elDays.textContent=days;
  DOM.elDaysWord.textContent=wordDays(days);
  DOM.elHours.textContent=pad2(hours%24);
  DOM.elMins.textContent=pad2(mins%60);
}

function initCounter(){
  updateCounter();
  setInterval(updateCounter,60000);
}


// ======================================================
// COUNTER VISIBILITY
// ======================================================

function setCounterVisibleByScroll(){
  const el=DOM.counterScene;
  if(!el) return;

  const r=el.getBoundingClientRect();
  const vh=window.innerHeight;

  const visible=r.top<vh*.75 && r.bottom>vh*.25;
  el.classList.toggle("show",visible);
}


// ======================================================
// SCROLL ANIMATIONS
// ======================================================

function onScroll(){
  const y=window.scrollY||0;

  // hint
  if(DOM.hintDown){
    const t=clamp(y/160,0,1);

    DOM.hintDown.style.opacity=1-t;

    const blurRaw=t*MAX_HINT_BLUR;
    const blur=IS_IOS?quantize(blurRaw,1):blurRaw;

    const next=`blur(${blur}px)`;
    if(DOM.hintDown.style.filter!==next)
      DOM.hintDown.style.filter=next;

    DOM.hintDown.style.transform=`translate(-50%,${-t*10}px)`;
  }

  // love word
  const heroH=DOM.hero?.offsetHeight||window.innerHeight;
  const tHero=clamp(y/(heroH*.75),0,1);

  if(DOM.loveWord){
    const op=clamp(.96-tHero*.25,.7,.96);
    DOM.loveWord.style.opacity=op;

    const raw=2.6+tHero*MAX_LOVE_EXTRA_BLUR;
    const blur=IS_IOS?quantize(raw,.6):raw;

    const next=`blur(${blur}px)`;
    if(DOM.loveWord.style.filter!==next)
      DOM.loveWord.style.filter=next;
  }

  // heart
  if(DOM.heartScene && DOM.heartBlock){
    const rect=DOM.heartScene.getBoundingClientRect();
    const vh=window.innerHeight;

    const progress=clamp((vh-rect.top)/(vh+rect.height),0,1);

    const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

    let o;
    if(progress<.4) o=progress/.4;
    else if(progress<.6) o=1;
    else o=clamp((1-progress)/.4,0,1);

    o=ease(o);

    const base=IS_IOS?12:14;
    const blur=IS_IOS?quantize(base-base*o,1):base-base*o;

    DOM.heartBlock.style.opacity=o;

    const next=`blur(${blur}px)`;
    if(DOM.heartBlock.style.filter!==next)
      DOM.heartBlock.style.filter=next;
  }

  setCounterVisibleByScroll();
}


// ======================================================
// RAF SCROLL LOOP
// ======================================================

let ticking=false;
function requestTick(){
  if(!ticking){
    ticking=true;
    requestAnimationFrame(()=>{
      ticking=false;
      onScroll();
    });
  }
}


// ======================================================
// MENU
// ======================================================

function initMenu(){
  if(!DOM.openMenu) return;

  const close=()=>{
    DOM.menuDropdown.hidden=true;
    DOM.openMenu.setAttribute("aria-expanded","false");
  };

  const toggle=()=>{
    const open=!DOM.menuDropdown.hidden;
    DOM.menuDropdown.hidden=open;
    DOM.openMenu.setAttribute("aria-expanded",String(!open));
  };

  DOM.openMenu.addEventListener("click",e=>{
    e.stopPropagation();
    toggle();
  });

  document.addEventListener("click",close);
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape") close();
  });
}


// ======================================================
// THOUGHTS MODAL
// ======================================================

function initThoughts(){
  if(!DOM.openThoughts) return;

  const KEY="for_you_thoughts";

  const lock=s=>{
    document.body.classList.toggle("no-scroll",s);
  };

  const open=()=>{
    DOM.thoughtsModal.hidden=false;
    lock(true);

    const saved=localStorage.getItem(KEY);
    if(saved) DOM.thoughtsArea.value=saved;
  };

  const close=()=>{
    DOM.thoughtsModal.hidden=true;
    lock(false);
  };

  DOM.openThoughts.onclick=open;
  DOM.closeThoughts.onclick=close;

  DOM.thoughtsModal.addEventListener("click",e=>{
    if(e.target===DOM.thoughtsModal) close();
  });

  let timer=null;
  DOM.thoughtsArea.addEventListener("input",()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>{
      localStorage.setItem(KEY,DOM.thoughtsArea.value);
      DOM.savedLabel.classList.add("show");
      setTimeout(()=>DOM.savedLabel.classList.remove("show"),800);
    },250);
  });
}


// ======================================================
// HEADER SCROLL BEHAVIOR
// ======================================================

function initHeaderScroll(){
  const header=document.querySelector(".top-menu");
  if(!header) return;

  let lastY=window.scrollY||0;

  const update=()=>{
    const y=window.scrollY||0;

    const menuOpen=!DOM.menuDropdown.hidden;
    const modalOpen=!DOM.thoughtsModal.hidden;

    if(menuOpen||modalOpen){
      header.classList.remove("is-hidden");
      lastY=y;
      return;
    }

    header.classList.toggle("is-scrolled",y>6);

    if(y>lastY+4 && y>40)
      header.classList.add("is-hidden");

    if(y<lastY-4)
      header.classList.remove("is-hidden");

    if(y<=2)
      header.classList.remove("is-hidden");

    lastY=y;
  };

  window.addEventListener("scroll",update,{passive:true});
}


// ======================================================
// SCROLL PERFORMANCE MODE (iPhone fix)
// ======================================================

function initScrollPerfMode(){
  let t=null;

  const on=()=>{
    document.body.classList.add("is-scrolling");
    clearTimeout(t);
    t=setTimeout(()=>{
      document.body.classList.remove("is-scrolling");
    },120);
  };

  window.addEventListener("scroll",on,{passive:true});
}


// ======================================================
// INIT
// ======================================================

function init(){
  initReadMore();
  initRevealCard();
  initCounter();
  initMenu();
  initThoughts();
  initHeaderScroll();
  initScrollPerfMode();

  window.addEventListener("scroll",requestTick,{passive:true});
  window.addEventListener("resize",requestTick);
  window.addEventListener("orientationchange",()=>setTimeout(requestTick,250));

  onScroll();
}

init();
