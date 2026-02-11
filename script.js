// ===============================
// 1) НАСТРОЙКА: ДАТА НАЧАЛА ОТНОШЕНИЙ
// ===============================
// Формат: "YYYY-MM-DD" (год-месяц-день)
const RELATIONSHIP_START = "2026-02-05";

// ===============================
// ВСПОМОГАТЕЛЬНОЕ
// ===============================
function pad2(n) {
  return String(n).padStart(2, "0");
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

// ===============================
// 2) СЧЁТЧИК (дни/часы/минуты)
// ===============================
function updateCounter() {
  const daysEl = document.getElementById("relDays");
  const hoursEl = document.getElementById("relHours");
  const minsEl = document.getElementById("relMins");

  // если на странице нет счётчика — просто выходим
  if (!daysEl || !hoursEl || !minsEl) return;

  const start = new Date(RELATIONSHIP_START + "T00:00:00");
  const now = new Date();

  const diff = now.getTime() - start.getTime();
  if (diff < 0) {
    daysEl.textContent = "0";
    hoursEl.textContent = "00";
    minsEl.textContent = "00";
    return;
  }

  const totalMins = Math.floor(diff / 60000);
  const mins = totalMins % 60;

  const totalHours = Math.floor(totalMins / 60);
  const hours = totalHours % 24;

  const days = Math.floor(totalHours / 24);

  daysEl.textContent = String(days);
  hoursEl.textContent = pad2(hours);
  minsEl.textContent = pad2(mins);
}

// сразу обновим и дальше раз в минуту
updateCounter();
setInterval(updateCounter, 60000);

// ===============================
// 3) ПЛАВНОЕ ПОЯВЛЕНИЕ СЧЁТЧИКА ПРИ СКРОЛЛЕ
// ===============================
function showCounterOnScroll() {
  const counterScene = document.getElementById("counterScene");
  if (!counterScene) return;

  const r = counterScene.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;

  if (r.top < vh * 0.85) {
    counterScene.classList.add("show");
  }
}
showCounterOnScroll();
window.addEventListener("scroll", showCounterOnScroll, { passive: true });

// ===============================
// 4) КНОПКА "ПРОЧИТАТЬ БОЛЬШЕ"
// ===============================
(function () {
  const btn = document.getElementById("moreBtn");
  const secret = document.getElementById("secret");
  if (!btn || !secret) return;

  btn.addEventListener("click", () => {
    const opened = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!opened));

    if (opened) {
      secret.classList.remove("show");
      setTimeout(() => {
        secret.hidden = true;
      }, 300);
      btn.textContent = "прочитать больше +";
    } else {
      secret.hidden = false;
      requestAnimationFrame(() => secret.classList.add("show"));
      btn.textContent = "скрыть −";
    }
  });
})();

// ===============================
// 5) СЕРДЦЕ (2 слайд): плавное появление
// ===============================
function updateHeart() {
  const heartScene = document.getElementById("heartScene");
  const heartBlock = document.getElementById("heartBlock");
  if (!heartScene || !heartBlock) return;

  const r = heartScene.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;

  // прогресс появления (0..1)
  const t = (vh * 0.95 - r.top) / (vh * 0.95 - vh * 0.25);
  const p = clamp(t, 0, 1);

  heartBlock.style.opacity = String(p);
  heartBlock.style.filter = `blur(${(1 - p) * 14}px)`;
}
updateHeart();
window.addEventListener("scroll", updateHeart, { passive: true });
window.addEventListener("resize", updateHeart);

// ===============================
// 6) БУРГЕР-МЕНЮ (открыть/закрыть)
// ===============================
(function () {
  const burger = document.getElementById("openMenu");
  const dropdown = document.getElementById("menuDropdown");
  if (!burger || !dropdown) return;

  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.hidden = !dropdown.hidden;
  });

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", () => {
    dropdown.hidden = true;
  });
})();

// ===============================
// 7) ОКНО "ТВОИ МЫСЛИ" + ФИКС СКРОЛЛА НА iPHONE
// ===============================
(function () {
  const openBtn = document.getElementById("openThoughts");
  const closeBtn = document.getElementById("closeThoughts");
  const modal = document.getElementById("thoughtsModal");
  const area = document.getElementById("thoughtsArea");
  const savedLabel = document.getElementById("savedLabel");

  if (!openBtn || !closeBtn || !modal) return;

  let savedScroll = 0;

  function openModal() {
    savedScroll = window.scrollY;

    document.body.classList.add("modal-open");
    modal.hidden = false;

    if (area) {
      area.focus();
    }
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");

    // вернуть позицию страницы (фикс прыжка)
    window.scrollTo({ top: savedScroll, behavior: "instant" });
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  // закрыть кликом по затемнению
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // загрузка сохранённого текста
  if (area) {
    area.value = localStorage.getItem("thoughts") || "";

    // автосохранение
    area.addEventListener("input", () => {
      localStorage.setItem("thoughts", area.value);

      if (savedLabel) {
        savedLabel.classList.add("show");
        setTimeout(() => savedLabel.classList.remove("show"), 900);
      }
    });
  }
})();
// ===== ПЛАВНОЕ ИСЧЕЗНОВЕНИЕ "ПРОЛИСТАЙ ВНИЗ" НА 1 СЛАЙДЕ =====
(function () {
  const hint = document.getElementById("hintDown");
  const hero = document.getElementById("hero");
  if (!hint || !hero) return;

  function updateHint() {
    const r = hero.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // 0..1: насколько "1 слайд" ушёл вверх
    const progress = Math.max(0, Math.min(1, (-r.top) / (vh * 0.35)));

    // плавно: меньше прозрачность + чуть блюра + лёгкий сдвиг
    const opacity = 1 - progress;
    const blur = progress * 10;        // до 10px
    const y = progress * -10;          // чуть вверх

    hint.style.opacity = String(opacity);
    hint.style.filter = `blur(${blur}px)`;
    hint.style.transform = `translate(-50%, ${y}px)`;

    // чтобы не кликабельно когда почти исчезло
    hint.style.pointerEvents = opacity < 0.15 ? "none" : "auto";
  }

  updateHint();
  window.addEventListener("scroll", updateHint, { passive: true });
  window.addEventListener("resize", updateHint);
})();



