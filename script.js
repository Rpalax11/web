// =========================================================
// Rubén Palacio — Portfolio
// =========================================================
document.documentElement.classList.add('js');

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// ---------- Tema ----------
function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set) return set;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
function applyThemeIcon() {
  const icon = $('.theme-toggle i');
  icon.className = currentTheme() === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}
function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  applyThemeIcon();
}
$('.theme-toggle').addEventListener('click', toggleTheme);
applyThemeIcon();

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
  const t = $('.toast');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 2200);
}

async function copyEmail() {
  const email = 'rubenpalsis11@gmail.com';
  try {
    await navigator.clipboard.writeText(email);
    toast('Email copiado ✓');
  } catch (e) {
    toast(email);
  }
}
$('.copy-mail').addEventListener('click', copyEmail);

// ---------- Nav: scroll, progreso y sección activa ----------
const nav = $('.nav');
const progress = $('.progress');
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 20);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

const navLinks = $$('.nav-links a');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach((s) => sectionObserver.observe(s));

// ---------- Menú móvil ----------
const menuBtn = $('.menu-toggle');
const mobileMenu = $('.mobile-menu');
function setMenu(open) {
  mobileMenu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.querySelector('i').className = open ? 'fas fa-xmark' : 'fas fa-bars';
}
menuBtn.addEventListener('click', () => setMenu(mobileMenu.hidden));
$$('a', mobileMenu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

// ---------- Reloj de Zaragoza ----------
function tick() {
  const time = new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
  }).format(new Date());
  $$('[data-clock]').forEach((el) => { el.textContent = time; });
}
tick();
setInterval(tick, 15000);

// ---------- Animaciones de entrada ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// Escalonado para elementos hermanos
$$('.reveal').forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
  el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 6) * 0.07}s`);
  revealObserver.observe(el);
});

// ---------- Contador ----------
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const end = Number(el.dataset.count);
    countObserver.unobserve(el);
    if (reduceMotion) return;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach((el) => {
  if (!reduceMotion) el.textContent = '0';
  countObserver.observe(el);
});

// ---------- Efectos de puntero (solo ratón) ----------
if (finePointer && !reduceMotion) {
  // Foco de luz que sigue al cursor
  $$('.spot').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // Botones magnéticos
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  // Tarjeta 3D
  const badge = $('[data-tilt]');
  const stage = $('.badge-stage');
  stage.addEventListener('pointermove', (e) => {
    const r = badge.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    badge.classList.add('is-tilting');
    badge.style.setProperty('--ry', `${(px - 0.5) * 22}deg`);
    badge.style.setProperty('--rx', `${(0.5 - py) * 18}deg`);
    badge.style.setProperty('--sx', `${px * 100}%`);
    badge.style.setProperty('--sy', `${py * 100}%`);
  });
  stage.addEventListener('pointerleave', () => {
    badge.classList.remove('is-tilting');
    badge.style.setProperty('--rx', '0deg');
    badge.style.setProperty('--ry', '0deg');
  });
}

// ---------- Galerías de proyectos (rotación automática) ----------
const galleries = {};
$$('.media-stack').forEach((stack) => {
  const imgs = $$('img', stack);
  const name = stack.dataset.gallery;
  galleries[name] = imgs;
  let i = 0;
  imgs[0].classList.add('is-on');
  imgs.forEach((img, idx) => img.addEventListener('click', () => openLightbox(name, idx)));
  if (reduceMotion || imgs.length < 2) return;
  let timer = null;
  const start = () => {
    if (timer) return;
    timer = setInterval(() => {
      imgs[i].classList.remove('is-on');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('is-on');
    }, 3200);
  };
  const stop = () => { clearInterval(timer); timer = null; };
  // Solo rota cuando está en pantalla
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(stack);
});
$$('[data-open]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const imgs = galleries[btn.dataset.open];
    const current = Math.max(0, imgs.findIndex((img) => img.classList.contains('is-on')));
    openLightbox(btn.dataset.open, current);
  });
});

// ---------- Lightbox ----------
const lb = $('.lightbox');
const lbImg = $('img', lb);
const lbCap = $('figcaption', lb);
let lbSet = [];
let lbIndex = 0;
let lastFocus = null;

function showLightbox() {
  const img = lbSet[lbIndex];
  lbImg.src = img.dataset.full || img.src;
  lbImg.alt = img.alt;
  lbCap.textContent = `${img.alt} · ${lbIndex + 1}/${lbSet.length}`;
}
function openLightbox(name, index) {
  lbSet = galleries[name];
  lbIndex = index;
  lastFocus = document.activeElement;
  showLightbox();
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  $('.lb-close').focus();
}
function closeLightbox() {
  lb.hidden = true;
  document.body.style.overflow = '';
  lastFocus?.focus();
}
function stepLightbox(dir) {
  lbIndex = (lbIndex + dir + lbSet.length) % lbSet.length;
  showLightbox();
}
$('.lb-close').addEventListener('click', closeLightbox);
$('.lb-prev').addEventListener('click', () => stepLightbox(-1));
$('.lb-next').addEventListener('click', () => stepLightbox(1));
lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

let touchX = null;
lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) stepLightbox(dx < 0 ? 1 : -1);
  touchX = null;
});

// ---------- Filtros de proyectos ----------
const filters = $$('.filter');
filters.forEach((btn) => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    $$('.project').forEach((p) => {
      const show = f === 'all' || p.dataset.cat.split(' ').includes(f);
      p.classList.toggle('is-hidden', !show);
      if (show) p.classList.add('is-in');
    });
  });
});

// ---------- Paleta de comandos ----------
const cmdk = $('.cmdk');
const cmdkInput = $('input', cmdk);
const cmdkList = $('.cmdk-list', cmdk);

const go = (id) => () => $(id).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
const open = (url) => () => window.open(url, '_blank', 'noopener');
const downloadCV = () => {
  const a = document.createElement('a');
  a.href = 'CV_Ruben_Palacio.pdf';
  a.download = '';
  a.click();
};

const commands = [
  { group: 'Navegar', icon: 'fas fa-house', label: 'Inicio', run: go('#top') },
  { group: 'Navegar', icon: 'fas fa-user', label: 'Sobre mí', run: go('#sobre-mi') },
  { group: 'Navegar', icon: 'fas fa-briefcase', label: 'Experiencia', run: go('#experiencia') },
  { group: 'Navegar', icon: 'fas fa-rocket', label: 'Proyectos', run: go('#proyectos') },
  { group: 'Navegar', icon: 'fas fa-graduation-cap', label: 'Formación y logros', run: go('#formacion') },
  { group: 'Navegar', icon: 'fas fa-layer-group', label: 'Stack', run: go('#stack') },
  { group: 'Navegar', icon: 'fas fa-paper-plane', label: 'Contacto', run: go('#contacto') },
  { group: 'Acciones', icon: 'fas fa-copy', label: 'Copiar email', hint: 'rubenpalsis11@gmail.com', run: copyEmail },
  { group: 'Acciones', icon: 'fas fa-download', label: 'Descargar CV', hint: 'PDF', run: downloadCV },
  { group: 'Acciones', icon: 'fas fa-circle-half-stroke', label: 'Cambiar tema claro / oscuro', run: toggleTheme },
  { group: 'Enlaces', icon: 'fab fa-github', label: 'GitHub', hint: 'RubenPalSis', run: open('https://github.com/RubenPalSis') },
  { group: 'Enlaces', icon: 'fab fa-linkedin', label: 'LinkedIn', run: open('https://linkedin.com/in/ruben-palacio-sisamon-4bb30425a') },
  { group: 'Enlaces', icon: 'fas fa-globe', label: 'GestionaTeam', hint: 'app', run: open('https://gestionateam.web.app/') },
  { group: 'Enlaces', icon: 'fas fa-globe', label: 'Tapicerías Deluxe', hint: 'web', run: open('https://tapiceriasdeluxe.com/') },
  { group: 'Enlaces', icon: 'fas fa-globe', label: 'TermaEbro', hint: 'web', run: open('https://termaebro.com') },
];

let visible = [];
let sel = 0;
const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function renderCmdk() {
  const q = normalize(cmdkInput.value.trim());
  visible = commands.filter((c) => normalize(`${c.label} ${c.group} ${c.hint || ''}`).includes(q));
  sel = Math.min(sel, Math.max(visible.length - 1, 0));
  if (!visible.length) {
    cmdkList.innerHTML = '<li class="cmdk-empty">Sin resultados</li>';
    return;
  }
  let html = '';
  let lastGroup = '';
  visible.forEach((c, i) => {
    if (c.group !== lastGroup) {
      html += `<li class="cmdk-group" role="presentation">${c.group}</li>`;
      lastGroup = c.group;
    }
    html += `<li class="cmdk-item${i === sel ? ' is-sel' : ''}" role="option" aria-selected="${i === sel}" data-i="${i}">
      <i class="${c.icon}"></i><span>${c.label}</span>${c.hint ? `<span class="hint">${c.hint}</span>` : ''}</li>`;
  });
  cmdkList.innerHTML = html;
  $('.is-sel', cmdkList)?.scrollIntoView({ block: 'nearest' });
}
function openCmdk() {
  lastFocus = document.activeElement;
  cmdk.hidden = false;
  cmdkInput.value = '';
  sel = 0;
  renderCmdk();
  cmdkInput.focus();
}
function closeCmdk() {
  cmdk.hidden = true;
  lastFocus?.focus();
}
function runCmd(i) {
  const c = visible[i];
  if (!c) return;
  closeCmdk();
  setMenu(false);
  c.run();
}

$('.cmdk-trigger').addEventListener('click', openCmdk);
$('[data-close]', cmdk).addEventListener('click', closeCmdk);
cmdkInput.addEventListener('input', () => { sel = 0; renderCmdk(); });
cmdkList.addEventListener('click', (e) => {
  const item = e.target.closest('.cmdk-item');
  if (item) runCmd(Number(item.dataset.i));
});
cmdkList.addEventListener('pointermove', (e) => {
  const item = e.target.closest('.cmdk-item');
  if (item && Number(item.dataset.i) !== sel) { sel = Number(item.dataset.i); renderCmdk(); }
});

// ---------- Teclado global ----------
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (cmdk.hidden) openCmdk(); else closeCmdk();
    return;
  }
  if (!cmdk.hidden) {
    const n = Math.max(visible.length, 1);
    if (e.key === 'Escape') closeCmdk();
    else if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % n; renderCmdk(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + n) % n; renderCmdk(); }
    else if (e.key === 'Enter') { e.preventDefault(); runCmd(sel); }
    return;
  }
  if (!lb.hidden) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') stepLightbox(1);
    else if (e.key === 'ArrowLeft') stepLightbox(-1);
    return;
  }
  if (e.key === 'Escape' && !mobileMenu.hidden) setMenu(false);
});

// ---------- Atajo según sistema ----------
if (!/Mac|iPhone|iPad/.test(navigator.platform)) {
  $$('kbd').forEach((k) => { if (k.textContent === '⌘K') k.textContent = 'Ctrl K'; });
}

// ---------- Anclas antiguas → secciones nuevas ----------
const legacyHash = { estudios: 'formacion', habilidades: 'stack', 'movilidad-logros': 'formacion' };
const oldHash = location.hash.slice(1);
if (legacyHash[oldHash]) {
  history.replaceState(null, '', `#${legacyHash[oldHash]}`);
  $(`#${legacyHash[oldHash]}`).scrollIntoView();
}

// ---------- Año ----------
$('#year').textContent = new Date().getFullYear();
