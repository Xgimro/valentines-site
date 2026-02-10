// ====== ДАТА НАЧАЛА ОТНОШЕНИЙ (поменяй на вашу) ======
const RELATIONSHIP_START = "2026-02-05";

// ====== утилиты ======
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function wordDays(n) {
  if (n % 10 === 1 && n % 100 !== 11) return "день";
  if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return "дня";
  return "дней";
}
function pad2(n) { return String(n).padStart(2, "0"); }

// iOS/Safari detection (для оптимизаций blur)
const IS_IOS = /iP(hone|ad|od)/.test(navigator.platform) ||
  (navigator.userAgent.includes("Mac") && "ontouchend" in document);

const MAX_HINT_BLUR = IS_IOS ? 5 : 6;
const MAX_LOVE_EXTRA_BLUR = IS_IOS ? 1.0 : 1.2;

// ====== кнопка "прочитать больше" ======
const btn = document.getElementById("moreBtn");
const secret = document.getElementById("secret");

if (btn && secret) {
  btn.addEventListener("click", () => {
    const opened = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!opened));

    if (opened) {
      secret.classList.remove("show");
      setTimeout(() => (secret.hidden = true), 350);
      btn.textContent = "прочитать больше +";
    } else {
      secret.hidden = false;
      requestAnimationFrame(() => secret.classList.add("show"));
      btn.textContent = "скрыть −";
    }
  });
}

// ====== reveal карточки ======
const card = document.getElementById("card");
if (card && "IntersectionObserver" in window) {
  const ioCard = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        card.classList.add("show");
        ioCard.disconnect();
      }
    }
  }, { threshold: 0.15 });
  ioCard.observe(card);
} else if (card) {
  setTimeout(() => card.classList.add("show"), 400);
}

// ====== счётчик ======
const elDays = document.getElementById("relDays");
const elDaysWord = document.getElementById("relDaysWord");
const elHours = document.getElementById("relHours");
const elMins = document.getElementById("relMins");

function getStartDate() {
  const [y, m, d] = RELATIONSHIP_START.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0);
}

function updateCounter() {
  if (!elDays || !elDaysWord || !elHours || !elMins) return;

  const start = getStartDate();
  const now = new Date();

  const diffMs = Math.max(0, now.getTime() - start.getTime());
  const totalMins = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMins / 60);

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const mins = totalMins % 60;

  elDays.textContent = String(days);
  elDaysWord.textContent = wordDays(days);
  elHours.textContent = pad2(hours);
  elMins.textContent = pad2(mins);
}

updateCounter();
setInterval(updateCounter, 60000);

// ====== элементы для анимаций ======
const hero = document.getElementById("hero");
const loveWord = document.getElementById("loveWord");
const hintDown = document.getElementById("hintDown");

const heartScene = document.getElementById("heartScene");
const heartBlock = document.getElementById("heartBlock");

const counterScene = document.getElementById("counterScene");

// ====== показать/скрыть счётчик по скроллу (работает везде) ======
function setCounterVisibleByScroll() {
  if (!counterScene) return;
  const rect = counterScene.getBoundingClientRect();
  const vh = window.innerHeight;
  const inView = rect.top < vh * 0.75 && rect.bottom > vh * 0.25;

  if (inView) counterScene.classList.add("show");
  else counterScene.classList.remove("show");
}

// ====== анимации при скролле ======
function onScroll() {
  const y = window.scrollY || 0;

  // 1 слайд: подсказка исчезает
  if (hintDown) {
    const tHint = clamp(y / 160, 0, 1);
    hintDown.style.opacity = String(1 - tHint);
    hintDown.style.filter = `blur(${tHint * MAX_HINT_BLUR}px)`;
    hintDown.style.transform = `translate(-50%, ${-tHint * 10}px)`;
  }

  // 1 слайд: "любовь" усиливает blur
  const heroH = hero?.offsetHeight || window.innerHeight;
  const tHero = clamp(y / (heroH * 0.75), 0, 1);
  if (loveWord) {
    const op = clamp(0.96 - tHero * 0.25, 0.70, 0.96);
    loveWord.style.opacity = String(op);
    loveWord.style.filter = `blur(${2.6 + tHero * MAX_LOVE_EXTRA_BLUR}px)`;
  }

  // 2 слайд: сердце плавно появляется/исчезает
  if (heartScene && heartBlock) {
    const rect = heartScene.getBoundingClientRect();
    const vh = window.innerHeight;

    const progress = clamp((vh - rect.top) / (vh + rect.height), 0, 1);

    const ease = (t) => (t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2);

    let o;
    if (progress < 0.4) o = progress / 0.4;
    else if (progress < 0.6) o = 1;
    else o = clamp((1 - progress) / 0.4, 0, 1);

    o = ease(o);

    const base = IS_IOS ? 12 : 14;
    const blur = base - base * o;

    heartBlock.style.opacity = String(o);
    heartBlock.style.filter = `blur(${blur}px)`;
  }

  // 3 слайд: показать счётчик
  setCounterVisibleByScroll();
}

// ====== rAF для плавности ======
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

window.addEventListener("scroll", requestTick, { passive: true });
window.addEventListener("resize", requestTick);
window.addEventListener("orientationchange", () => setTimeout(requestTick, 250));

// старт
onScroll();

