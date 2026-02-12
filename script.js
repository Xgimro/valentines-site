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
  // read more
  btn: document.getElementById("moreBtn"),
  secret: document.getElementById("secret"),

  // reveal card
  card: document.getElementById("card"),

  // counter
  elDays: document.getElementById("relDays"),
  elDaysWord: document.getElementById("relDaysWord"),
  elHours: document.getElementById("relHours"),
  elMins: document.getElementById("relMins"),

  // scroll anim
  hero: document.getElementById("hero"),
  loveWord: document.getElementById("loveWord"),
  hintDown: document.getElementById("hintDown"),

  heartScene: document.getElementById("heartScene"),
  heartBlock: document.getElementById("heartBlock"),

  counterScene: document.getElementById("counterScene"),

  // menu
  openMenu: document.getElementById("openMenu"),
  menuDropdown: document.getElementById("menuDropdown"),
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
  const card = DOM.card;
  if(!card) return;

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries)=>{
      for(const e of entries){
        if(e.isIntersecting){
          card.classList.add("show");
          io.disconnect();
        }
      }
    }, { threshold: 0.15 });

    io.observe(card);
  } else {
    setTimeout(()=>card.classList.add("show"), 400);
  }
}


// ======================================================
// COUNTER
// ======================================================

function getStartDate(){
  const [y,m,d] = RELATIONSHIP_START.split("-").map(Number);
  return new Date(y, m-1, d, 0,0,0);
}

function updateCounter(){
  if(!DOM.elDays || !DOM.elDaysWord || !DOM.elHours || !DOM.elMins) return;

  const diff = Math.max(0, new Date() - getStartDate());
  const mins = Math.floor(diff/60000);
  const hours = Math.floor(mins/60);

  const days = Math.floor(hours/24);

  DOM.elDays.textContent = String(days);
  DOM.elDaysWord.textContent = wordDays(days);
  DOM.elHours.textContent = pad2(hours % 24);
  DOM.elMins.textContent = pad2(mins % 60);
}

function initCounter(){
  updateCounter();
  setInterval(updateCounter, 60000);
}


// ======================================================
// COUNTER VISIBILITY
// ======================================================

function setCounterVisibleByScroll(){
  const el = DOM.counterScene;
  if(!el) return;

  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;

  const visible = r.top < vh*0.75 && r.bottom > vh*0.25;
  el.classList.toggle("show", visible);
}


// ======================================================
// SCROLL ANIMATIONS
// ======================================================

function onScroll(){
  const y = window.scrollY || 0;

  // hint
  if(DOM.hintDown){
    const t = clamp(y/160, 0, 1);

    DOM.hintDown.style.opacity = String(1 - t);

    const blurRaw = t * MAX_HINT_BLUR;
    const blur = IS_IOS ? quantize(blurRaw, 1) : blurRaw;
    const nextFilter = `blur(${blur}px)`;

    if(DOM.hintDown.style.filter !== nextFilter){
      DOM.hintDown.style.filter = nextFilter;
    }

    DOM.hintDown.style.transform = `translate(-50%, ${-t*10}px)`;
  }

  // love word blur on scroll
  const heroH = DOM.hero?.offsetHeight || window.innerHeight;
  const tHero = clamp(y/(heroH*0.75), 0, 1);

  if(DOM.loveWord){
    const op = clamp(0.96 - tHero*0.25, 0.70, 0.96);
    DOM.loveWord.style.opacity = String(op);

    const raw = 2.6 + tHero * MAX_LOVE_EXTRA_BLUR;
    const blur = IS_IOS ? quantize(raw, 0.6) : raw;
    const nextFilter = `blur(${blur}px)`;

    if(DOM.loveWord.style.filter !== nextFilter){
      DOM.loveWord.style.filter = nextFilter;
    }
  }

  // heart
  if(DOM.heartScene && DOM.heartBlock){
    const rect = DOM.heartScene.getBoundingClientRect();
    const vh = window.innerHeight;

    const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
    const ease = (t)=> (t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2);

    let o;
    if(progress < 0.4) o = progress / 0.4;
    else if(progress < 0.6) o = 1;
    else o = clamp((1 - progress) / 0.4, 0, 1);

    o = ease(o);

    const base = IS_IOS ? 12 : 14;
    const blurRaw = base - base*o;
    const blur = IS_IOS ? quantize(blurRaw, 1) : blurRaw;

    DOM.heartBlock.style.opacity = String(o);

    const nextFilter = `blur(${blur}px)`;
    if(DOM.heartBlock.style.filter !== nextFilter){
      DOM.heartBlock.style.filter = nextFilter;
    }
  }

  setCounterVisibleByScroll();
}


// ======================================================
// RAF
// ======================================================

let ticking = false;
function requestTick(){
  if(!ticking){
    ticking = true;
    requestAnimationFrame(()=>{
      ticking = false;
      onScroll();
    });
  }
}


// ======================================================
// MENU
// ======================================================

function initMenu(){
  if(!DOM.openMenu || !DOM.menuDropdown) return;

  const close = ()=>{
    DOM.menuDropdown.hidden = true;
    DOM.openMenu.setAttribute("aria-expanded", "false");
  };

  const open = ()=>{
    DOM.menuDropdown.hidden = false;
    DOM.openMenu.setAttribute("aria-expanded", "true");
  };

  const toggle = ()=>{
    const isOpen = !DOM.menuDropdown.hidden;
    if(isOpen) close(); else open();
  };

  DOM.openMenu.addEventListener("click", (e)=>{
    e.stopPropagation();
    toggle();
  });

  DOM.menuDropdown.addEventListener("click", (e)=> e.stopPropagation());

  document.addEventListener("click", close);
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") close();
  });
}


// ======================================================
// HEADER BEHAVIOR (hide on scroll down / show on up)
// ======================================================

function initHeaderScroll(){
  const header = document.querySelector(".top-menu");
  if(!header) return;

  const THRESHOLD_SCROLLED = 6;
  const HIDE_AFTER = 40;
  const DELTA = 4;

  let lastY = window.scrollY || 0;

  const update = ()=>{
    const y = window.scrollY || 0;

    // если открыто меню — шапку не прячем
    const menuOpen = DOM.menuDropdown && !DOM.menuDropdown.hidden;
    if(menuOpen){
      header.classList.remove("is-hidden");
      header.classList.toggle("is-scrolled", y > THRESHOLD_SCROLLED);
      lastY = y;
      return;
    }

    header.classList.toggle("is-scrolled", y > THRESHOLD_SCROLLED);

    const goingDown = y > lastY + DELTA;
    const goingUp   = y < lastY - DELTA;

    if(goingDown && y > HIDE_AFTER) header.classList.add("is-hidden");
    if(goingUp) header.classList.remove("is-hidden");
    if(y <= 2) header.classList.remove("is-hidden");

    lastY = y;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}


// ======================================================
// PERF MODE: отключаем тяжелое стекло во время активного скролла
// ======================================================

function initScrollPerfMode(){
  let t = null;

  const on = ()=>{
    document.body.classList.add("is-scrolling");
    if(t) clearTimeout(t);
    t = setTimeout(()=> document.body.classList.remove("is-scrolling"), 120);
  };

  window.addEventListener("scroll", on, { passive: true });
}


// ======================================================
// INIT
// ======================================================

function init(){
  initReadMore();
  initRevealCard();
  initCounter();
  initMenu();

  initHeaderScroll();
  initScrollPerfMode();

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  window.addEventListener("orientationchange", ()=> setTimeout(requestTick, 250));

  onScroll();
}

init();
