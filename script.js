// ======================================================
// НАСТРОЙКИ
// ======================================================

// ====== ДАТА НАЧАЛА ОТНОШЕНИЙ (поменяй на вашу) ======
const RELATIONSHIP_START = "2026-02-05";

// iOS/Safari detection (для оптимизаций blur)
const IS_IOS =
  /iP(hone|ad|od)/.test(navigator.platform) ||
  (navigator.userAgent.includes("Mac") && "ontouchend" in document);

const MAX_HINT_BLUR = IS_IOS ? 5 : 6;
const MAX_LOVE_EXTRA_BLUR = IS_IOS ? 1.0 : 1.2;


// ======================================================
// УТИЛИТЫ
// ======================================================

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function wordDays(n) {
  if (n % 10 === 1 && n % 100 !== 11) return "день";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "дня";
  return "дней";
}

function pad2(n) { return String(n).padStart(2, "0"); }


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

  // thoughts
  openThoughts: document.getElementById("openThoughts"),
  thoughtsModal: document.getElementById("thoughtsModal"),
  closeThoughts: document.getElementById("closeThoughts"),
  thoughtsArea: document.getElementById("thoughtsArea"),
  savedLabel: document.getElementById("savedLabel"),
};


// ======================================================
// 1) КНОПКА "прочитать больше"
// ======================================================

function initReadMore() {
  if (!DOM.btn || !DOM.secret) return;

  DOM.btn.addEventListener("click", () => {
    const opened = DOM.btn.getAttribute("aria-expanded") === "true";
    DOM.btn.setAttribute("aria-expanded", String(!opened));

    if (opened) {
      DOM.secret.classList.remove("show");
      setTimeout(() => (DOM.secret.hidden = true), 350);
      DOM.btn.textContent = "прочитать больше +";
    } else {
      DOM.secret.hidden = false;
      requestAnimationFrame(() => DOM.secret.classList.add("show"));
      DOM.btn.textContent = "скрыть −";
    }
  });
}


// ======================================================
// 2) REVEAL КАРТОЧКИ
// ======================================================

function initRevealCard() {
  const card = DOM.card;
  if (!card) return;

  if ("IntersectionObserver" in window) {
    const ioCard = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          card.classList.add("show");
          ioCard.disconnect();
        }
      }
    }, { threshold: 0.15 });

    ioCard.observe(card);
  } else {
    setTimeout(() => card.classList.add("show"), 400);
  }
}


// ======================================================
// 3) СЧЁТЧИК
// ======================================================

function getStartDate() {
  const [y, m, d] = RELATIONSHIP_START.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0);
}

function updateCounter() {
  if (!DOM.elDays || !DOM.elDaysWord || !DOM.elHours || !DOM.elMins) return;

  const start = getStartDate();
  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - start.getTime());
  const totalMins = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMins / 60);

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const mins = totalMins % 60;

  DOM.elDays.textContent = String(days);
  DOM.elDaysWord.textContent = wordDays(days);
  DOM.elHours.textContent = pad2(hours);
  DOM.elMins.textContent = pad2(mins);
}

function initCounter() {
  updateCounter();
  setInterval(updateCounter, 60000);
}


// ======================================================
// 4) ПОКАЗ/СКРЫТИЕ СЧЁТЧИКА ПО СКРОЛЛУ
// ======================================================

function setCounterVisibleByScroll() {
  if (!DOM.counterScene) return;
  const rect = DOM.counterScene.getBoundingClientRect();
  const vh = window.innerHeight;
  const inView = rect.top < vh * 0.75 && rect.bottom > vh * 0.25;

  if (inView) DOM.counterScene.classList.add("show");
  else DOM.counterScene.classList.remove("show");
}


// ======================================================
// 5) АНИМАЦИИ ПРИ СКРОЛЛЕ
// ======================================================

function onScroll() {
  const y = window.scrollY || 0;

  // 1 слайд: подсказка исчезает
  if (DOM.hintDown) {
    const tHint = clamp(y / 160, 0, 1);
    DOM.hintDown.style.opacity = String(1 - tHint);
    DOM.hintDown.style.filter = `blur(${tHint * MAX_HINT_BLUR}px)`;
    DOM.hintDown.style.transform = `translate(-50%, ${-tHint * 10}px)`;
  }

  // 1 слайд: "любовь" усиливает blur
  const heroH = DOM.hero?.offsetHeight || window.innerHeight;
  const tHero = clamp(y / (heroH * 0.75), 0, 1);

  if (DOM.loveWord) {
    const op = clamp(0.96 - tHero * 0.25, 0.70, 0.96);
    DOM.loveWord.style.opacity = String(op);
    DOM.loveWord.style.filter = `blur(${2.6 + tHero * MAX_LOVE_EXTRA_BLUR}px)`;
  }

  // 2 слайд: сердце плавно появляется/исчезает
  if (DOM.heartScene && DOM.heartBlock) {
    const rect = DOM.heartScene.getBoundingClientRect();
    const vh = window.innerHeight;

    const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);

    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    let o;
    if (progress < 0.4) o = progress / 0.4;
    else if (progress < 0.6) o = 1;
    else o = clamp((1 - progress) / 0.4, 0, 1);

    o = ease(o);

    const base = IS_IOS ? 12 : 14;
    const blur = base - base * o;

    DOM.heartBlock.style.opacity = String(o);
    DOM.heartBlock.style.filter = `blur(${blur}px)`;
  }

  // 3 слайд: показать счётчик
  setCounterVisibleByScroll();
}


// ======================================================
// 6) rAF ДЛЯ ПЛАВНОСТИ
// ======================================================

let ticking = false;
function requestTick() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      onScroll();
    });
  }
}


// ======================================================
// 7) МЕНЮ (бургер)
// ======================================================

function initMenu() {
  if (!DOM.openMenu || !DOM.menuDropdown) return;

  const closeMenu = () => {
    DOM.menuDropdown.hidden = true;
    DOM.openMenu.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    DOM.menuDropdown.hidden = false;
    DOM.openMenu.setAttribute("aria-expanded", "true");
  };

  const toggleMenu = () => {
    const isOpen = !DOM.menuDropdown.hidden;
    if (isOpen) closeMenu();
    else openMenu();
  };

  DOM.openMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  DOM.menuDropdown.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", () => closeMenu());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}


// ======================================================
// 8) "ТВОИ МЫСЛИ" (модалка + сохранение + iPhone lock scroll)
// ======================================================

function initThoughts() {
  if (!DOM.openThoughts || !DOM.thoughtsModal || !DOM.closeThoughts || !DOM.thoughtsArea) return;

  const KEY = "for_you_thoughts";

  const lockScroll = (locked) => {
    document.documentElement.classList.toggle("no-scroll", locked);
    document.body.classList.toggle("no-scroll", locked);
  };

  const showSaved = () => {
    if (!DOM.savedLabel) return;
    DOM.savedLabel.classList.remove("show");
    void DOM.savedLabel.offsetWidth; // перезапуск анимации
    DOM.savedLabel.classList.add("show");
  };

  const open = () => {
    DOM.thoughtsModal.hidden = false;

    const saved = localStorage.getItem(KEY);
    if (saved != null) DOM.thoughtsArea.value = saved;

    lockScroll(true);

    requestAnimationFrame(() => {
      DOM.thoughtsArea.focus();
      DOM.thoughtsArea.setSelectionRange(
        DOM.thoughtsArea.value.length,
        DOM.thoughtsArea.value.length
      );
    });
  };

  const close = () => {
    DOM.thoughtsModal.hidden = true;
    lockScroll(false);
  };

  DOM.openThoughts.addEventListener("click", (e) => {
    e.stopPropagation();
    open();
  });

  DOM.closeThoughts.addEventListener("click", close);

  DOM.thoughtsModal.addEventListener("click", (e) => {
    if (e.target === DOM.thoughtsModal) close();
  });

  // автосохранение при вводе
  let saveTimer = null;
  DOM.thoughtsArea.addEventListener("input", () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(KEY, DOM.thoughtsArea.value);
      showSaved();
    }, 250);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !DOM.thoughtsModal.hidden) close();
  });
}


// ======================================================
// INIT
// ======================================================

function init() {
  initReadMore();
  initRevealCard();
  initCounter();

  initMenu();
  initThoughts();

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  window.addEventListener("orientationchange", () => setTimeout(requestTick, 250));

  onScroll();
}

init();
