/* app.js — @mrdkmkl */

/* ══════════════════════════════════════
   X  F I E L D
══════════════════════════════════════ */
(function buildXField() {
  const field  = document.getElementById('x-field');
  const CELL   = 90, PER = 5, RADIUS = 85, PUSH = 24;
  let mouseX = -999, mouseY = -999, allMarks = [];

  function build() {
    field.innerHTML = ''; allMarks = [];
    const cols = Math.ceil(window.innerWidth  / CELL) + 1;
    const rows = Math.ceil(window.innerHeight / CELL) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * CELL, cy = r * CELL;
        const cell = document.createElement('div');
        cell.className = 'x-cell';
        cell.style.cssText = `left:${cx}px;top:${cy}px;width:${CELL}px;height:${CELL}px;`;
        for (let i = 0; i < PER; i++) {
          const span = document.createElement('span');
          span.className = 'x-mark'; span.textContent = 'x';
          const ox = (Math.random() - 0.5) * (CELL * 0.82);
          const oy = (Math.random() - 0.5) * (CELL * 0.82);
          span.style.left     = (CELL / 2 + ox) + 'px';
          span.style.top      = (CELL / 2 + oy) + 'px';
          span.style.fontSize = (11 + Math.random() * 10) + 'px';
          span.style.opacity  = (0.38 + Math.random() * 0.50).toFixed(2);
          cell.appendChild(span);
          allMarks.push({ el: span, wx: cx+CELL/2+ox, wy: cy+CELL/2+oy, dx:0, dy:0 });
        }
        field.appendChild(cell);
      }
    }
  }

  build();
  window.addEventListener('resize', build);
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  (function tick() {
    for (const m of allMarks) {
      const ddx = mouseX - m.wx, ddy = mouseY - m.wy;
      const dist = Math.sqrt(ddx*ddx + ddy*ddy);
      let tx = 0, ty = 0;
      if (dist < RADIUS && dist > 0) {
        const f = (RADIUS - dist) / RADIUS;
        tx = -(ddx/dist)*f*PUSH; ty = -(ddy/dist)*f*PUSH;
      }
      m.dx += (tx - m.dx) * 0.14;
      m.dy += (ty - m.dy) * 0.14;
      m.el.style.transform = `translate(${m.dx.toFixed(2)}px,${m.dy.toFixed(2)}px)`;
    }
    requestAnimationFrame(tick);
  })();
})();


/* ══════════════════════════════════════
   S C R E E N  S T A C K
══════════════════════════════════════ */
const screens = {
  launch:      document.getElementById('screen-launch'),
  directories: document.getElementById('screen-directories'),
  gallery:     document.getElementById('screen-gallery'),
};

function showScreen(name) {
  Object.entries(screens).forEach(([k, el]) => {
    el.classList.toggle('hidden', k !== name);
  });
  if (name === 'gallery') {
    const wrap = document.getElementById('gallery-wrap');
    if (wrap) wrap.scrollTop = 0;
  }
}


/* ══════════════════════════════════════
   P H O T O  O F  T H E  D A Y
══════════════════════════════════════ */
function initPotd(allPhotos) {
  const frame  = document.getElementById('potd-frame');
  const toggle = document.getElementById('potd-toggle');

  if (allPhotos.length) {
    const KEY = 'mrdkmkl_seen';
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem(KEY)) || []; } catch(e) {}
    let pool = allPhotos.filter(p => !seen.includes(p.src));
    if (!pool.length) { seen = []; pool = [...allPhotos]; }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    seen.push(pick.src);
    try { localStorage.setItem(KEY, JSON.stringify(seen)); } catch(e) {}
    frame.innerHTML = `<img src="${pick.src}" alt="${pick.title || ''}">`;
  }

  toggle.addEventListener('click', () => {
    const open = frame.classList.toggle('open');
    toggle.textContent = open ? 'hide' : 'preview';
  });
}


/* ══════════════════════════════════════
   D I R E C T O R I E S
══════════════════════════════════════ */
function renderDirectories() {
  const grid = document.getElementById('folders-grid');
  if (grid.dataset.built) return;
  grid.dataset.built = '1';

  if (!FOLDERS || !FOLDERS.length) {
    grid.innerHTML = `<p style="font-size:11px;letter-spacing:.15em;color:var(--mid);padding:20px 0">open photos.js to add your folders.</p>`;
    return;
  }

  FOLDERS.forEach((folder, fi) => {
    const cover = folder.photos && folder.photos.length ? folder.photos[0].src : null;
    const count = folder.photos ? folder.photos.length : 0;

    const div = document.createElement('div');
    div.className = 'folder';
    div.style.animationDelay = `${fi * 0.06}s`;

    div.innerHTML = `
      <div class="folder-thumb">
        ${cover
          ? `<img src="${cover}" alt="${folder.name}">`
          : `<div class="folder-thumb-empty">[ empty ]</div>`}
      </div>
      <div class="folder-info">
        <div class="folder-name">${folder.name}</div>
        <div class="folder-count">${count} photo${count !== 1 ? 's' : ''}</div>
      </div>
    `;

    div.addEventListener('click', () => openGallery(folder));
    grid.appendChild(div);
  });
}


/* ══════════════════════════════════════
   G A L L E R Y
══════════════════════════════════════ */
let activeFolder  = null;

function openGallery(folder) {
  activeFolder = folder;
  document.getElementById('gallery-title').textContent = folder.name + '.';

  const grid = document.getElementById('photo-grid');
  grid.innerHTML = '';

  if (!folder.photos || !folder.photos.length) {
    grid.innerHTML = `<p style="font-size:11px;letter-spacing:.15em;color:var(--mid);padding:20px 0;grid-column:1/-1">no photos in this collection yet.</p>`;
    showScreen('gallery');
    return;
  }

  const aspects = ['4/3','3/4','1/1','5/4','4/5'];

  folder.photos.forEach((photo, index) => {
    const card   = document.createElement('div');
    card.className = 'photo-card';
    card.style.animationDelay = `${index * 0.04}s`;

    const aspect = aspects[index % aspects.length];

    card.innerHTML = `
      <div class="photo-card-img-wrap" style="aspect-ratio:${aspect}">
        <img src="${photo.src}" alt="${photo.title || ''}" loading="lazy">
      </div>
      ${photo.date ? `<div class="photo-card-date">taken on — ${photo.date}</div>` : ''}
    `;

    card.addEventListener('click', () => openLightbox(index));
    grid.appendChild(card);
  });

  showScreen('gallery');
}


/* ══════════════════════════════════════
   L I G H T B O X
══════════════════════════════════════ */
let lbIndex = 0;

function openLightbox(index) {
  lbIndex = index;
  renderLightbox(false);
  document.getElementById('lightbox').classList.remove('hidden');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
}

function renderLightbox(transition = true) {
  const photos = activeFolder.photos;
  const photo  = photos[lbIndex];
  const total  = photos.length;

  const img    = document.getElementById('lb-img');
  const title  = document.getElementById('lb-title');
  const tags   = document.getElementById('lb-tags');
  const counter = document.getElementById('lb-counter');

  /* image transition */
  if (transition) {
    img.style.opacity   = '0';
    img.style.transform = 'scale(0.97)';
    setTimeout(() => {
      img.src = photo.src;
      img.style.opacity   = '1';
      img.style.transform = 'scale(1)';
    }, 180);
  } else {
    img.src = photo.src;
    img.style.opacity   = '1';
    img.style.transform = 'scale(1)';
  }

  /* title */
  title.textContent = photo.title || 'untitled';

  /* labeled tags */
  tags.innerHTML = '';

  if (photo.date) {
    tags.appendChild(makeTag('taken on', photo.date, 'date'));
  }
  if (photo.camera) {
    tags.appendChild(makeTag('shot with', photo.camera, 'camera'));
  }

  /* counter */
  counter.textContent = `${lbIndex + 1} / ${total}`;

  /* arrows */
  document.getElementById('lb-prev').style.display = total > 1 ? '' : 'none';
  document.getElementById('lb-next').style.display = total > 1 ? '' : 'none';
}

function makeTag(label, value, type) {
  const wrap = document.createElement('div');
  wrap.className = `lb-tag lb-tag--${type}`;
  wrap.innerHTML = `
    <span class="lb-tag-label">${label}:</span>
    <span class="lb-tag-value">${value}</span>
  `;
  return wrap;
}

function lbPrev() {
  lbIndex = (lbIndex - 1 + activeFolder.photos.length) % activeFolder.photos.length;
  renderLightbox(true);
}
function lbNext() {
  lbIndex = (lbIndex + 1) % activeFolder.photos.length;
  renderLightbox(true);
}

/* swipe support */
let touchStartX = 0;
document.getElementById('lightbox').addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
document.getElementById('lightbox').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) { dx < 0 ? lbNext() : lbPrev(); }
});

document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lb-prev').addEventListener('click', lbPrev);
document.getElementById('lb-next').addEventListener('click', lbNext);

/* close on backdrop */
document.getElementById('lightbox').addEventListener('click', e => {
  if (e.target === document.getElementById('lightbox')) closeLightbox();
});

/* keyboard */
document.addEventListener('keydown', e => {
  if (document.getElementById('lightbox').classList.contains('hidden')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lbPrev();
  if (e.key === 'ArrowRight') lbNext();
});


/* ══════════════════════════════════════
   N A V I G A T I O N
══════════════════════════════════════ */
document.getElementById('start-btn').addEventListener('click', () => {
  renderDirectories();
  showScreen('directories');
});
document.getElementById('dir-back').addEventListener('click', () => showScreen('launch'));
document.getElementById('gallery-back').addEventListener('click', () => showScreen('directories'));


/* ══════════════════════════════════════
   B O O T
══════════════════════════════════════ */
const allPhotos = (FOLDERS || []).flatMap(f => f.photos || []);
initPotd(allPhotos);