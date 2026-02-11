// ===== ДАТА НАЧАЛА ОТНОШЕНИЙ =====
const RELATIONSHIP_START = "2026-02-05";

function pad2(n){
  return String(n).padStart(2, "0");
}

// ===== СЧЁТЧИК ВРЕМЕНИ =====
function updateCounter(){
  const start = new Date(RELATIONSHIP_START);
  const now = new Date();

  const diff = now - start;

  const mins = Math.floor(diff / 60000) % 60;
  const hours = Math.floor(diff / 3600000) % 24;
  const days = Math.floor(diff / 86400000);

  const d = document.getElementById("relDays");
  const h = document.getElementById("relHours");
  const m = document.getElementById("relMins");

  if (d) d.textContent = days;
  if (h) h.textContent = pad2(hours);
  if (m) m.textContent = pad2(mins);
}

updateCounter();
setInterval(updateCounter, 60000);


// ===== КНОПКА "ПРОЧИТАТЬ БОЛЬШЕ" =====
const btn = document.getElementById("moreBtn");
const secret = document.getElementById("secret");

if (btn && secret) {
  btn.addEventListener("click", () => {
    const opened = btn.getAttribute("aria-expanded") === "true";

    if (opened) {
      secret.classList.remove("show");
      setTimeout(() => {
        secret.hidden = true;
      }, 300);

      btn.textContent = "прочитать больше +";
    } else {
      secret.hidden = false;

      setTimeout(() => {
        secret.classList.add("show");
      }, 20);

      btn.textContent = "скрыть −";
    }

    btn.setAttribute("aria-expanded", String(!opened));
  });
}


// ===== ПОЯВЛЕНИЕ СЧЁТЧИКА ПРИ СКРОЛЛЕ =====
window.addEventListener("scroll", () => {
  const block = document.getElementById("counterScene");
  if (!block) return;

  const r = block.getBoundingClientRect();

  if (r.top < window.innerHeight * 0.8) {
    block.classList.add("show");
  }
});


// ===== ОКНО "ТВОИ МЫСЛИ" =====
const openBtn = document.getElementById("openThoughts");
const closeBtn = document.getElementById("closeThoughts");
const modal = document.getElementById("thoughtsModal");
const area = document.getElementById("thoughtsArea");
const saved = document.getElementById("savedLabel");

// ОТКРЫТЬ ОКНО
if (openBtn && modal && area) {
  openBtn.addEventListener("click", () => {
    modal.hidden = false;
    area.focus();
  });
}

// ЗАКРЫТЬ ПО КРЕСТИКУ
if (closeBtn && modal) {
  closeBtn.addEventListener("click", () => {
    modal.hidden = true;
  });
}

// ЗАКРЫТЬ ПО КЛИКУ НА ФОН
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.hidden = true;
    }
  });
}

// ЗАГРУЗИТЬ СОХРАНЁННЫЙ ТЕКСТ
if (area) {
  area.value = localStorage.getItem("thoughts") || "";
}

// АВТОСОХРАНЕНИЕ
if (area && saved) {
  area.addEventListener("input", () => {
    localStorage.setItem("thoughts", area.value);

    saved.classList.add("show");
    setTimeout(() => {
      saved.classList.remove("show");
    }, 900);
  });
}
// ===== ВЫПАДАЮЩЕЕ МЕНЮ (бургер) =====
const openMenuBtn = document.getElementById("openMenu");
const menuDropdown = document.getElementById("menuDropdown");

openMenuBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  menuDropdown.hidden = !menuDropdown.hidden;
});

menuDropdown?.addEventListener("click", (e) => {
  e.stopPropagation(); // чтобы клик внутри не закрывал
});

// клик в любое место вне меню — закрыть
document.addEventListener("click", () => {
  if (menuDropdown) menuDropdown.hidden = true;
});
document.querySelectorAll(".menu-dropdown .menu-item").forEach((el) => {
  el.addEventListener("click", () => {
    const dd = document.getElementById("menuDropdown");
    if (dd) dd.hidden = true;
  });
});
// ===== ПОЯВЛЕНИЕ СЕРДЦА НА 2 СЛАЙДЕ =====
function updateHeart(){
  const heartScene = document.getElementById("heartScene");
  const heartBlock = document.getElementById("heartBlock");
  if (!heartScene || !heartBlock) return;

  const r = heartScene.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;

  // прогресс: 0 когда только подошли, 1 когда центр примерно в зоне просмотра
  const start = vh * 0.95;
  const end = vh * 0.25;
  const t = (start - r.top) / (start - end);
  const clamped = Math.max(0, Math.min(1, t));

  // плавная картинка: чем ближе — тем видимее и меньше блюр
  heartBlock.style.opacity = String(clamped);
  heartBlock.style.filter = `blur(${(1 - clamped) * 14}px)`;
}

updateHeart();
window.addEventListener("scroll", updateHeart, { passive: true });
window.addEventListener("resize", updateHeart);



