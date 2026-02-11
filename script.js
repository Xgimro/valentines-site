// ===============================
// 0) ВСПОМОГАТЕЛЬНОЕ
// ===============================
function pad2(n) {
  return String(n).padStart(2, "0");
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

// ===============================
// 1) НАСТРОЙКА: ДАТА НАЧАЛА ОТНОШЕНИЙ
// ===============================
// Формат: "YYYY-MM-DD" (год-месяц-день)
const RELATIONSHIP_START = "2026-02-05"; // <-- поменяй на вашу дату

// ===============================
// 2) СЧЁТЧИК (дни/часы/минуты)
// ===============================
function updateCounter() {
  const daysEl = document.getElementById("relDays");
  const hoursEl = document.getElementById("relHours");
  const minsEl = document.getElementById("relMins");

  if (!daysEl || !hoursEl || !minsEl) return;

  const start = new Date(RELATIONSHIP_START + "T00:00:00");
  const now = new Date();

  const diff = now.getTime() - start.getTime();

  // если дата в будущем — просто нули
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

updateCounter();
setInterval(updateCounter, 60000);

// ===============================
// 3) ПОЯВЛЕНИЕ СЧЁТЧИКА ПРИ СКРОЛЛЕ
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
// 4) "ПРОЛИСТАЙ ВНИЗ" ПЛАВНО ИСЧЕЗАЕТ НА 1 СЛАЙДЕ
// ===============================
(function () {
  const hint = document.getElementById("hintDown");
  const hero = document.getElementById("hero");
  if (!hint || !hero) return;

  function updateHint() {
    const r = hero.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    const progress = clamp((-r.top) / (vh * 0.35), 0, 1);

    const opacity = 1 - progress;
    const blur = progress * 10;
    const y = progress * -10;

    hint.style.opacity = String(opacity);
    hint.style.filter = `blur(${blur}px)`;
    hint.style.transform = `translate(-50%, ${y}px)`;
    hint.style.pointerEvents = opacity < 0.15 ? "none" : "auto";
  }

  updateHint();
  window.addEventListener("scroll", updateHint, { passive: true });
  window.addEventListener("resize", updateHint);
})();

// ===============================
// 5) "ПРОЧИТАТЬ БОЛЬШЕ"
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
      setTimeout(() => (secret.hidden = true), 300);
      btn.textContent = "прочитать больше +";
    } else {
      secret.hidden = false;
      requestAnimationFrame(() => secret.classList.add("show"));
      btn.textContent = "скрыть −";
    }
  });
})();

// ===============================
// 6) СЕРДЦЕ: ПОЯВЛЯЕТСЯ И ОЧЕНЬ СИЛЬНО ИСЧЕЗАЕТ ПРИ СКРОЛЛЕ ВНИЗ
// ===============================
(function () {
  const heartWrap = document.getElementById("heartBlock"); // .heart-wrap
  const heartScreen = document.getElementById("heartScene"); // section
  if (!heartWrap || !heartScreen) return;

  function updateHeart() {
    const rect = heartScreen.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // 0..1: насколько мы "вошли" в секцию (появление)
    const inT = (vh * 0.95 - rect.top) / (vh * 0.95 - vh * 0.35);
    const progressIn = clamp(inT, 0, 1);

    // 0..1: насколько мы "уходим вниз" из секции (исчезание)
    // чем меньше bottom, тем сильнее исчезает
    const outT = (rect.bottom - vh * 0.10) / (vh * 0.75);
    const progressOut = clamp(outT, 0, 1);

    // итоговая видимость: вошли * не ушли
    const visible = progressIn * progressOut;

    // усиленные эффекты исчезания
    const opacity = clamp(visible, 0, 1);
    const blur = (1 - visible) * 28;          // сильнее размытие
    const scale = 1 - (1 - visible) * 0.10;   // чуть уменьшается
    const y = (1 - visible) * 18;             // немного уходит вниз

    heartWrap.style.opacity = String(opacity);
    heartWrap.style.filter = `blur(${blur}px)`;
    heartWrap.style.transform = `translateY(${y}px) scale(${scale})`;
  }

  updateHeart();
  window.addEventListener("scroll", updateHeart, { passive: true });
  window.addEventListener("resize", updateHeart);
})();

// ===============================
// 7) БУРГЕР-МЕНЮ (открыть/закрыть)
// ===============================
(function () {
  const burger = document.getElementById("openMenu");
  const dropdown = document.getElementById("menuDropdown");
  if (!burger || !dropdown) return;

  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.hidden = !dropdown.hidden;
  });

  dropdown.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", () => {
    dropdown.hidden = true;
  });
})();

// ===============================
// 8) ОКНО "ТВОИ МЫСЛИ" + ФИКС СКРОЛЛА НА iPHONE
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

    if (area) area.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");

    window.scrollTo({
      top: savedScroll,
      behavior: "instant",
    });
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  // закрыть кликом по затемнению
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // загрузка сохранённого текста + автосохранение
  if (area) {
    area.value = localStorage.getItem("thoughts") || "";

    area.addEventListener("input", () => {
      localStorage.setItem("thoughts", area.value);

      if (savedLabel) {
        savedLabel.classList.add("show");
        setTimeout(() => savedLabel.classList.remove("show"), 900);
      }
    });
  }
})();



