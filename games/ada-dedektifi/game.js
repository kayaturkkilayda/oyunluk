/*
 * Ada Dedektifi — ada temalı saklı nesne oyunu (Oyunluk için özgün yapım).
 * Sahneler kodla çizilir; eşyalar sistem emojileriyle gösterilir.
 * Yeni bölüm eklemek: LEVELS dizisine bir kayıt ve PAINTERS içine bir çizim fonksiyonu ekleyin.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- veriler
  const LEVELS = [
    {
      id: 'kumsal', name: 'Güneşli Kumsal', diff: 'Kolay', W: 1600, H: 1067, paint: 'beach', seed: 11,
      size: [34, 46], decoys: 170,
      targets: [['🐚', 6], ['🦀', 5], ['🕶️', 4], ['🍉', 4], ['🏐', 3], ['🐠', 4], ['🌺', 4]],
      pool: ['🥥', '🍹', '⛱️', '🧴', '👙', '🍦', '🦩', '🐢', '🧃', '📻', '🎈', '⛵', '🦜', '🍍', '🥭', '🌸', '🪁', '🩱', '🍋', '🥤', '🧢', '🎏'],
    },
    {
      id: 'iskele', name: 'Balıkçı İskelesi', diff: 'Kolay', W: 1800, H: 1200, paint: 'pier', seed: 23,
      size: [32, 44], decoys: 200,
      targets: [['🐟', 6], ['⚓', 4], ['🦞', 4], ['🦐', 5], ['🧭', 3], ['🐙', 3], ['🎣', 4], ['🦑', 3], ['🔔', 3]],
      pool: ['🧺', '📦', '🛶', '🐬', '🐳', '🧤', '🥾', '🧰', '🔧', '🧊', '🐡', '🦈', '🧵', '🔦', '🎒', '🪑', '🕯️', '⛵', '🥫', '🧂', '🍞'],
    },
    {
      id: 'pazar', name: 'Tropik Pazar', diff: 'Orta', W: 2000, H: 1333, paint: 'market', seed: 37,
      size: [30, 42], decoys: 260,
      targets: [['🍍', 6], ['🥭', 5], ['🍌', 5], ['🌶️', 5], ['🍋', 4], ['🧺', 4], ['🧿', 4], ['🪔', 4], ['🥥', 4]],
      pool: ['🍎', '🍐', '🍇', '🍓', '🍒', '🥝', '🍅', '🥑', '🥕', '🌽', '🧄', '🧅', '🥜', '🍯', '🧂', '🍞', '🧀', '🥚', '🍆', '🥬', '🍑', '🍈', '🥔', '🍠'],
    },
    {
      id: 'kamp', name: 'Orman Kampı', diff: 'Orta', W: 2200, H: 1467, paint: 'forest', seed: 41,
      size: [28, 40], decoys: 330,
      targets: [['🔦', 5], ['🍄', 6], ['🦎', 4], ['🐸', 5], ['🦋', 5], ['🐞', 5], ['🎒', 3], ['🪓', 3], ['🌰', 5], ['🦉', 3]],
      pool: ['🍂', '🍁', '🌿', '☘️', '🐿️', '🦔', '🐛', '🐌', '🐝', '🌼', '🌻', '🥾', '🧤', '⛺', '🔥', '🌾', '🐇', '🦊', '🐾', '🌲', '🥫', '🧭'],
    },
    {
      id: 'fener', name: 'Deniz Feneri Koyu', diff: 'Zor', W: 2400, H: 1600, paint: 'cove', seed: 59,
      size: [26, 38], decoys: 420,
      targets: [['🔭', 4], ['🗝️', 5], ['💎', 6], ['📜', 5], ['💰', 4], ['🕯️', 4], ['🦜', 4], ['🏺', 4], ['🔮', 4]],
      pool: ['🗺️', '⚓', '🐚', '🦀', '🐙', '🦑', '🐠', '🐟', '⛵', '🛶', '🐢', '🐬', '🌴', '⚔️', '🛡️', '🏹', '🐦', '🕊️', '🦢', '📦', '🧭', '⏳', '🎩', '🪑'],
    },
    {
      id: 'resif', name: 'Mercan Resifi', diff: 'Orta', W: 2200, H: 1467, paint: 'reef', seed: 67,
      size: [28, 40], decoys: 320,
      targets: [['🐠', 5], ['🐡', 4], ['🐙', 4], ['🦑', 3], ['🐚', 5], ['🐢', 3], ['🦈', 3], ['🐬', 3], ['⚓', 3]],
      pool: ['🐟', '🦞', '🦐', '🦪', '🌿', '💧', '🔱', '💎', '🗝️', '🧭', '🐋', '⭐', '🍀', '🎣', '🐊', '🌀', '🏺', '🔮'],
    },
    {
      id: 'magara', name: 'Gizli Mağara', diff: 'Orta', W: 2200, H: 1467, paint: 'cave', seed: 71,
      size: [28, 40], decoys: 330,
      targets: [['🕯️', 4], ['💎', 5], ['🦇', 5], ['🗝️', 4], ['🔦', 4], ['💰', 4], ['🕷️', 4], ['⛏️', 3], ['🦴', 4]],
      pool: ['🔮', '📜', '🏺', '🧭', '🪔', '🕸️', '🐍', '🐀', '⚱️', '🧲', '⚙️', '🔩', '🧪', '🍄', '🐌', '🦂', '🔔', '📿', '⏳', '🎒'],
    },
    {
      id: 'selale', name: 'Şelale Vadisi', diff: 'Orta', W: 2400, H: 1600, paint: 'waterfall', seed: 83,
      size: [27, 38], decoys: 380,
      targets: [['🦜', 5], ['🐒', 4], ['🍌', 5], ['🦋', 5], ['🌺', 5], ['🐸', 4], ['🦎', 4], ['🍍', 4], ['🥥', 4]],
      pool: ['🌴', '🌿', '🍃', '🌸', '🌼', '🐝', '🐞', '🐛', '🐌', '🍄', '🦚', '🦩', '🐍', '🐊', '🍋', '🥭', '🍇', '🌰', '🦔', '🐿️', '💧', '🌈'],
    },
    {
      id: 'kasaba', name: 'Liman Kasabası', diff: 'Zor', W: 2400, H: 1600, paint: 'town', seed: 97,
      size: [26, 37], decoys: 420,
      targets: [['⛵', 4], ['🚲', 4], ['🐈', 5], ['🎈', 5], ['☂️', 4], ['🧺', 4], ['🍦', 4], ['📮', 3], ['🔔', 4], ['🎨', 3]],
      pool: ['🚗', '🛵', '🌷', '🌻', '🐕', '🐦', '🕊️', '🧳', '📦', '🥖', '🍞', '🧀', '🎒', '👒', '🧢', '🕶️', '📚', '🖼️', '🪑', '🛒', '🎸', '🧸'],
    },
    {
      id: 'festival', name: 'Gece Festivali', diff: 'Zor', W: 2600, H: 1733, paint: 'festival', seed: 113,
      size: [25, 36], decoys: 480,
      targets: [['🏮', 5], ['🎇', 4], ['🎁', 4], ['🎭', 4], ['🥁', 4], ['🎺', 4], ['🍭', 5], ['🎪', 3], ['🌙', 3], ['🎐', 4]],
      pool: ['🎈', '🎉', '🎊', '🍬', '🍫', '🍿', '🧁', '🍩', '🍡', '🍢', '🎀', '🎶', '🎵', '🔥', '⭐', '🌟', '🕯️', '🎸', '🎻', '🎤', '🧃', '🍹', '🌺', '🥥', '🍉', '🎏'],
    },
  ];
  const PAR_PER_ITEM = { Kolay: 12, Orta: 14, Zor: 16 };
  const HINT_MAX = 3, HINT_RECHARGE = 45000, COMBO_WINDOW = 5000;
  const EMOJI_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';

  // ---------------------------------------------------------------- yardımcılar
  function rng(seed) { // mulberry32
    let a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = (R, arr) => arr[Math.floor(R() * arr.length)];
  const between = (R, a, b) => a + R() * (b - a);
  const fmtTime = s => { s = Math.floor(s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

  const spriteCache = new Map();
  function sprite(emoji) {
    if (spriteCache.has(emoji)) return spriteCache.get(emoji);
    const S = 96, cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const c = cv.getContext('2d');
    c.font = `${S * 0.78}px ${EMOJI_FONT}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(emoji, S / 2, S / 2 + S * 0.04);
    spriteCache.set(emoji, cv);
    return cv;
  }

  // ---------------------------------------------------------------- sahne çizimleri
  function speckle(c, W, H, R, n, colors, rmax = 3) {
    for (let i = 0; i < n; i++) { c.fillStyle = pick(R, colors); c.beginPath(); c.arc(R() * W, R() * H, 0.6 + R() * rmax, 0, 6.283); c.fill(); }
  }
  function blob(c, x, y, r, R, fill, stroke) {
    c.beginPath();
    const n = 9;
    for (let i = 0; i <= n; i++) { const a = i / n * 6.283, rr = r * (0.75 + R() * 0.35); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.8; i ? c.lineTo(px, py) : c.moveTo(px, py); }
    c.closePath(); c.fillStyle = fill; c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 3; c.stroke(); }
  }
  function waves(c, W, y0, y1, R, color, n) {
    c.strokeStyle = color; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = R() * W, y = between(R, y0, y1), w = between(R, 30, 70);
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w / 4, y - 7, x + w / 2, y); c.quadraticCurveTo(x + w * 3 / 4, y + 7, x + w, y); c.stroke();
    }
  }
  function palm(c, x, y, r, R) {
    c.fillStyle = 'rgba(40,60,20,.18)'; c.beginPath(); c.ellipse(x + r * 0.35, y + r * 0.3, r, r * 0.7, 0, 0, 6.283); c.fill();
    const n = 7 + Math.floor(R() * 3), base = R() * 6.283;
    for (let i = 0; i < n; i++) {
      const a = base + i / n * 6.283 + between(R, -0.15, 0.15);
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = i % 2 ? '#2f8a3c' : '#3fa34a';
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(r * 0.5, -r * 0.28, r, 0); c.quadraticCurveTo(r * 0.5, r * 0.28, 0, 0); c.fill();
      c.strokeStyle = '#26702f'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(r * 0.95, 0); c.stroke();
      c.restore();
    }
    c.fillStyle = '#7a4b22';
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(x + Math.cos(i * 2.1) * r * 0.1, y + Math.sin(i * 2.1) * r * 0.1, r * 0.09, 0, 6.283); c.fill(); }
  }
  function umbrella(c, x, y, r, colors, R) {
    c.fillStyle = 'rgba(80,50,10,.18)'; c.beginPath(); c.ellipse(x + r * 0.3, y + r * 0.35, r, r * 0.8, 0, 0, 6.283); c.fill();
    const n = 8, rot = R() * 6.283;
    for (let i = 0; i < n; i++) {
      c.fillStyle = colors[i % colors.length];
      c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, rot + i / n * 6.283, rot + (i + 1) / n * 6.283); c.closePath(); c.fill();
    }
    c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r * 0.1, 0, 6.283); c.fill();
  }
  function towel(c, x, y, w, h, a, colors) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = 'rgba(80,50,10,.15)'; c.fillRect(-w / 2 + 5, -h / 2 + 6, w, h);
    const sw = w / colors.length;
    colors.forEach((col, i) => { c.fillStyle = col; c.fillRect(-w / 2 + i * sw, -h / 2, sw + 0.5, h); });
    c.restore();
  }
  function planks(c, x, y, w, h, vertical, R, base) {
    c.fillStyle = base; c.fillRect(x, y, w, h);
    const step = 22;
    if (vertical) {
      for (let yy = y; yy < y + h; yy += step) { c.fillStyle = `rgba(${R() < .5 ? '255,255,255' : '60,30,10'},${between(R, .04, .12)})`; c.fillRect(x, yy, w, step - 3); c.fillStyle = 'rgba(60,30,10,.35)'; c.fillRect(x, yy + step - 3, w, 3); }
    } else {
      for (let xx = x; xx < x + w; xx += step) { c.fillStyle = `rgba(${R() < .5 ? '255,255,255' : '60,30,10'},${between(R, .04, .12)})`; c.fillRect(xx, y, step - 3, h); c.fillStyle = 'rgba(60,30,10,.35)'; c.fillRect(xx + step - 3, y, 3, h); }
    }
  }
  function crate(c, x, y, s, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-s / 2 + 5, -s / 2 + 5, s, s);
    c.fillStyle = '#c8924f'; c.fillRect(-s / 2, -s / 2, s, s);
    c.strokeStyle = '#8a5a26'; c.lineWidth = 4; c.strokeRect(-s / 2 + 2, -s / 2 + 2, s - 4, s - 4);
    c.beginPath(); c.moveTo(-s / 2 + 4, -s / 2 + 4); c.lineTo(s / 2 - 4, s / 2 - 4); c.moveTo(s / 2 - 4, -s / 2 + 4); c.lineTo(-s / 2 + 4, s / 2 - 4); c.stroke();
    c.restore();
  }
  function barrel(c, x, y, r) {
    c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(x + 4, y + 5, r, 0, 6.283); c.fill();
    c.fillStyle = '#9b6233'; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
    c.strokeStyle = '#4a4a4a'; c.lineWidth = 3;
    [0.95, 0.62].forEach(k => { c.beginPath(); c.arc(x, y, r * k, 0, 6.283); c.stroke(); });
  }
  function tree(c, x, y, r, R, greens) {
    c.fillStyle = 'rgba(20,40,10,.25)'; c.beginPath(); c.arc(x + r * 0.25, y + r * 0.25, r, 0, 6.283); c.fill();
    for (let i = 0; i < 6; i++) { c.fillStyle = greens[i % greens.length]; c.beginPath(); c.arc(x + between(R, -r * .45, r * .45), y + between(R, -r * .45, r * .45), r * between(R, .45, .7), 0, 6.283); c.fill(); }
    c.fillStyle = 'rgba(255,255,220,.18)'; c.beginPath(); c.arc(x - r * .3, y - r * .3, r * .35, 0, 6.283); c.fill();
  }

  const PAINTERS = {
    beach(c, W, H, R) {
      c.fillStyle = '#f3d9a4'; c.fillRect(0, 0, W, H);
      speckle(c, W, H, R, 2600, ['#e8c88b', '#f8e6bf', '#e2bf7e', '#fff1d0']);
      const sea = H * 0.27, edge = x => sea + Math.sin(x / 90) * 16 + Math.sin(x / 37) * 6;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0);
      for (let x = W; x >= 0; x -= 16) c.lineTo(x, edge(x));
      c.closePath();
      const g = c.createLinearGradient(0, 0, 0, sea); g.addColorStop(0, '#138fa8'); g.addColorStop(1, '#5fd0d3');
      c.fillStyle = g; c.fill();
      waves(c, W, 10, sea - 30, R, 'rgba(255,255,255,.45)', 70);
      c.strokeStyle = 'rgba(160,120,60,.25)'; c.lineWidth = 34; c.beginPath();
      for (let x = 0; x <= W; x += 16) { const y = edge(x) + 22; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 9; c.beginPath();
      for (let x = 0; x <= W; x += 16) { const y = edge(x); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      planks(c, W * 0.47, H * 0.5, 90, H * 0.5, true, R, '#b98252');
      for (let i = 0; i < 9; i++) towel(c, between(R, 80, W - 80), between(R, sea + 90, H - 70), 120, 62, between(R, -.5, .5), pick(R, [['#ff6b4a', '#fff', '#ff6b4a', '#fff'], ['#2f9ad6', '#ffd166', '#2f9ad6'], ['#7bd389', '#fff', '#7bd389', '#fff', '#7bd389'], ['#c86bfa', '#ffe0f7', '#c86bfa']]));
      for (let i = 0; i < 6; i++) blob(c, between(R, 0, W), between(R, sea - 40, sea + 30), between(R, 18, 34), R, '#9aa3a0', '#7c8582');
      for (let i = 0; i < 7; i++) umbrella(c, between(R, 90, W - 90), between(R, sea + 110, H - 90), between(R, 55, 75), pick(R, [['#ff6b4a', '#fff'], ['#ffc845', '#0f8b8d'], ['#2f9ad6', '#fff'], ['#ff8fab', '#fff3f6']]), R);
      for (let i = 0; i < 4; i++) palm(c, i < 2 ? between(R, 20, 160) : between(R, W - 160, W - 20), between(R, sea + 120, H - 60), between(R, 80, 110), R);
      c.fillStyle = 'rgba(150,110,60,.35)';
      for (let i = 0; i < 26; i++) { const x = W * 0.25 + i * 26 + Math.sin(i) * 10, y = H * 0.85 - i * 14; c.beginPath(); c.ellipse(x + (i % 2) * 12, y, 5, 8, -0.6, 0, 6.283); c.fill(); }
    },
    pier(c, W, H, R) {
      const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1592ad'); g.addColorStop(1, '#0e6f86');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      waves(c, W, 0, H, R, 'rgba(255,255,255,.28)', 160);
      const dy = H * 0.4, dh = H * 0.22;
      planks(c, 0, dy, W, dh, false, R, '#b98252');
      planks(c, W * 0.26, dy + dh, W * 0.13, H - dy - dh, true, R, '#ad7747');
      planks(c, W * 0.68, 0, W * 0.13, dy, true, R, '#ad7747');
      c.fillStyle = '#5b3a1e';
      for (let x = 10; x < W; x += 90) { [dy - 6, dy + dh + 6].forEach(y => { c.beginPath(); c.arc(x, y, 9, 0, 6.283); c.fill(); }); }
      for (let i = 0; i < 6; i++) {
        let x, y; do { x = between(R, 80, W - 80); y = between(R, 60, H - 60); } while (y > dy - 90 && y < dy + dh + 90);
        const a = between(R, -.6, .6), col = pick(R, ['#ff6b4a', '#ffc845', '#f4f1ea', '#2f9ad6', '#7bd389']);
        c.save(); c.translate(x, y); c.rotate(a);
        c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(8, 10, 130, 44, 0, 0, 6.283); c.fill();
        c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 130, 44, 0, 0, 6.283); c.fill();
        c.fillStyle = '#8a5a26'; c.beginPath(); c.ellipse(0, 0, 112, 32, 0, 0, 6.283); c.fill();
        c.fillStyle = '#c8924f'; [-50, 0, 50].forEach(px => c.fillRect(px - 7, -32, 14, 64));
        c.restore();
      }
      for (let i = 0; i < 9; i++) crate(c, between(R, 40, W - 40), between(R, dy + 25, dy + dh - 25), between(R, 46, 64), between(R, -.3, .3));
      for (let i = 0; i < 8; i++) barrel(c, between(R, 30, W - 30), between(R, dy + 25, dy + dh - 25), between(R, 20, 28));
      c.strokeStyle = 'rgba(240,230,200,.55)'; c.lineWidth = 2;
      for (let n = 0; n < 4; n++) {
        const x0 = between(R, 50, W - 250), y0 = between(R, dy + 10, dy + dh - 110);
        for (let k = 0; k <= 10; k++) { c.beginPath(); c.moveTo(x0 + k * 20, y0); c.lineTo(x0 + k * 20 - 40, y0 + 100); c.stroke(); c.beginPath(); c.moveTo(x0 - 40, y0 + k * 10); c.lineTo(x0 + 200, y0 + k * 10); c.stroke(); }
      }
    },
    market(c, W, H, R) {
      const T = 64;
      for (let y = 0; y < H; y += T) for (let x = 0; x < W; x += T) { c.fillStyle = pick(R, ['#e9b98a', '#e3ad7a', '#efc79c', '#dda26f']); c.fillRect(x, y, T - 3, T - 3); }
      c.fillStyle = 'rgba(120,70,30,.25)';
      for (let y = 0; y < H; y += T) c.fillRect(0, y + T - 3, W, 3);
      for (let x = 0; x < W; x += T) c.fillRect(x + T - 3, 0, 3, H);
      const cols = 4, rows = 3, cw = W / cols, rh = H / rows;
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        const x = k * cw + cw * 0.12, y = r * rh + rh * 0.18, w = cw * 0.76, h = rh * 0.56;
        c.fillStyle = 'rgba(60,30,10,.22)'; c.fillRect(x + 8, y + 10, w, h);
        c.fillStyle = '#9b6233'; c.fillRect(x, y, w, h);
        c.fillStyle = '#b97a45'; c.fillRect(x + 8, y + 8, w - 16, h - 16);
        const aw = pick(R, [['#ff6b4a', '#fff4dc'], ['#0f8b8d', '#fff4dc'], ['#ffc845', '#ff6b4a'], ['#7bd389', '#fff'], ['#c86bfa', '#fff']]);
        const ah = h * 0.32, sw = w / 10;
        for (let s = 0; s < 10; s++) { c.fillStyle = aw[s % 2]; c.fillRect(x + s * sw, y - ah * 0.5, sw + 0.5, ah); c.beginPath(); c.arc(x + s * sw + sw / 2, y + ah * 0.5, sw / 2, 0, Math.PI); c.fill(); }
      }
      for (let i = 0; i < 7; i++) {
        const x = between(R, 40, W - 200), y = between(R, 40, H - 120), w = between(R, 120, 180), h = between(R, 70, 100);
        c.fillStyle = pick(R, ['#b23a48', '#3d5a80', '#2a9d8f', '#e76f51']); c.fillRect(x, y, w, h);
        c.strokeStyle = '#ffd166'; c.lineWidth = 4; c.strokeRect(x + 8, y + 8, w - 16, h - 16);
        c.fillStyle = '#ffd166'; c.beginPath(); c.moveTo(x + w / 2, y + 18); c.lineTo(x + w / 2 + 16, y + h / 2); c.lineTo(x + w / 2, y + h - 18); c.lineTo(x + w / 2 - 16, y + h / 2); c.fill();
      }
      for (let i = 0; i < 4; i++) {
        const y0 = between(R, 30, H - 30);
        c.strokeStyle = 'rgba(60,40,20,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, y0); c.quadraticCurveTo(W / 2, y0 + 80, W, y0 - 20); c.stroke();
        for (let t = 0.03; t < 1; t += 0.05) { const x = W * t, y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + 80) + t * t * (y0 - 20); c.fillStyle = pick(R, ['#ff6b4a', '#ffc845', '#7bd389', '#2f9ad6']); c.beginPath(); c.arc(x, y + 8, 8, 0, 6.283); c.fill(); }
      }
    },
    forest(c, W, H, R) {
      c.fillStyle = '#74b857'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 40; i++) blob(c, R() * W, R() * H, between(R, 60, 140), R, pick(R, ['#68ad4c', '#80c262', '#6aa94f']));
      speckle(c, W, H, R, 2600, ['#5e9e44', '#8fcc6e', '#6aa94f'], 2.5);
      c.lineCap = 'round';
      const river = t => [t * W, H * 0.62 + Math.sin(t * 5) * H * 0.12];
      [[120, '#3f8fb5'], [96, '#5fb3d6'], [30, 'rgba(255,255,255,.25)']].forEach(([w, col]) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let t = 0; t <= 1.001; t += 0.02) { const [x, y] = river(t); t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); });
      c.strokeStyle = '#c9a36b'; c.lineWidth = 46; c.beginPath(); c.moveTo(W * 0.15, 0); c.bezierCurveTo(W * 0.3, H * 0.4, W * 0.55, H * 0.2, W * 0.6, H); c.stroke();
      c.fillStyle = '#7d5a35'; c.fillRect(W * 0.555, H * 0.5, 110, 150);
      for (let i = 0; i < 4; i++) {
        const x = between(R, 150, W - 150), y = between(R, 120, H * 0.45), s = between(R, 70, 95), a = between(R, -.4, .4);
        c.save(); c.translate(x, y); c.rotate(a);
        c.fillStyle = 'rgba(20,40,10,.25)'; c.beginPath(); c.moveTo(10, -s + 10); c.lineTo(s * 0.9 + 10, 10); c.lineTo(10, s + 10); c.lineTo(-s * 0.9 + 10, 10); c.fill();
        const col = pick(R, [['#ff8c42', '#e5702a'], ['#2f9ad6', '#1f78ad'], ['#ffc845', '#e0a92a']]);
        c.fillStyle = col[0]; c.beginPath(); c.moveTo(0, -s); c.lineTo(s * 0.9, 0); c.lineTo(0, s); c.fill();
        c.fillStyle = col[1]; c.beginPath(); c.moveTo(0, -s); c.lineTo(-s * 0.9, 0); c.lineTo(0, s); c.fill();
        c.restore();
      }
      const fx = W * 0.42, fy = H * 0.36;
      for (let i = 0; i < 10; i++) { c.fillStyle = '#8d8d8d'; c.beginPath(); c.arc(fx + Math.cos(i / 10 * 6.283) * 42, fy + Math.sin(i / 10 * 6.283) * 42, 12, 0, 6.283); c.fill(); }
      c.fillStyle = '#ff8c42'; c.beginPath(); c.arc(fx, fy, 26, 0, 6.283); c.fill(); c.fillStyle = '#ffd166'; c.beginPath(); c.arc(fx, fy, 14, 0, 6.283); c.fill();
      for (let i = 0; i < 5; i++) { c.save(); c.translate(between(R, 60, W - 60), between(R, 60, H - 60)); c.rotate(R() * 3); c.fillStyle = '#8a5a2b'; c.fillRect(-60, -14, 120, 28); c.fillStyle = '#c8924f'; c.beginPath(); c.arc(60, 0, 14, 0, 6.283); c.fill(); c.restore(); }
      for (let i = 0; i < 46; i++) { const x = R() * W, y = R() * H; const [, ry] = river(x / W); if (Math.abs(y - ry) < 90) continue; tree(c, x, y, between(R, 50, 90), R, ['#2e7d32', '#388e3c', '#43a047', '#1b5e20']); }
    },
    cove(c, W, H, R) {
      c.fillStyle = '#7cc26a'; c.fillRect(0, 0, W, H);
      speckle(c, W, H, R, 2000, ['#6eb35c', '#8dd07b'], 2.5);
      const shore = x => H * 0.42 + x * 0.32 + Math.sin(x / 120) * 30;
      c.beginPath(); c.moveTo(0, H); c.lineTo(0, shore(0) - 40);
      for (let x = 0; x <= W; x += 20) c.lineTo(x, shore(x) - 40); c.lineTo(W, H); c.closePath(); c.fillStyle = '#f1d49b'; c.fill();
      c.beginPath(); c.moveTo(0, H); c.lineTo(0, shore(0) + 60);
      for (let x = 0; x <= W; x += 20) c.lineTo(x, shore(x) + 60); c.lineTo(W, H); c.closePath();
      const g = c.createLinearGradient(0, H * 0.4, 0, H); g.addColorStop(0, '#4fc4cf'); g.addColorStop(1, '#0e6f86'); c.fillStyle = g; c.fill();
      waves(c, W, H * 0.62, H, R, 'rgba(255,255,255,.35)', 120);
      for (let i = 0; i < 24; i++) { const x = R() * W; blob(c, x, shore(x) + between(R, 30, 110), between(R, 22, 50), R, pick(R, ['#8e9795', '#a3aaa8', '#7a8381']), '#6b7371'); }
      for (let i = 0; i < 14; i++) blob(c, between(R, 0, W * 0.4), between(R, 0, H * 0.3), between(R, 40, 90), R, pick(R, ['#9aa09e', '#868d8b']), '#6b7371');
      const lx = W * 0.8, ly = H * 0.2;
      c.fillStyle = 'rgba(255,240,150,.25)'; c.beginPath(); c.arc(lx, ly, 200, 0, 6.283); c.fill();
      c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(lx + 14, ly + 16, 95, 0, 6.283); c.fill();
      [[95, '#f4f1ea'], [80, '#d6453d'], [64, '#f4f1ea'], [48, '#d6453d'], [30, '#2b2b2b'], [20, '#ffd166']].forEach(([r, col]) => { c.fillStyle = col; c.beginPath(); c.arc(lx, ly, r, 0, 6.283); c.fill(); });
      c.strokeStyle = '#c8a46a'; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(lx - 80, ly + 70); c.bezierCurveTo(W * 0.6, H * 0.4, W * 0.4, H * 0.25, W * 0.25, H * 0.55); c.stroke();
      c.save(); c.translate(W * 0.22, H * 0.86); c.rotate(-0.4);
      c.fillStyle = '#5b3a1e'; c.beginPath(); c.ellipse(0, 0, 200, 70, 0, 0, 6.283); c.fill();
      c.fillStyle = '#7d5230'; c.beginPath(); c.ellipse(0, 0, 175, 52, 0, 0, 6.283); c.fill();
      c.strokeStyle = '#4a2e16'; c.lineWidth = 6; for (let k = -150; k <= 150; k += 50) { c.beginPath(); c.moveTo(k, -50); c.lineTo(k, 50); c.stroke(); }
      c.restore();
      for (let i = 0; i < 8; i++) crate(c, between(R, 60, W - 60), between(R, 60, H * 0.7), between(R, 44, 60), between(R, -.4, .4));
      for (let i = 0; i < 12; i++) tree(c, between(R, W * 0.35, W - 40), between(R, 20, H * 0.45), between(R, 40, 70), R, ['#2e7d32', '#388e3c', '#43a047']);
    },
    reef(c, W, H, R) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2bb5c8'); g.addColorStop(1, '#0b5f86');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(255,255,255,.07)';
      for (let i = 0; i < 9; i++) { const x = between(R, -200, W); c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 120, 0); c.lineTo(x + 420, H); c.lineTo(x + 260, H); c.fill(); }
      for (let i = 0; i < 18; i++) blob(c, R() * W, between(R, H * 0.3, H), between(R, 80, 180), R, pick(R, ['#e9d29a', '#dcc38a', '#f0dcaa']));
      speckle(c, W, H, R, 1500, ['rgba(255,255,255,.18)', 'rgba(0,40,60,.15)'], 2);
      c.lineCap = 'round';
      for (let i = 0; i < 26; i++) {
        const x = R() * W, y = R() * H, col = pick(R, ['#ff6b6b', '#ff9f68', '#f78fb3', '#c56cf0', '#ffd166']);
        c.strokeStyle = col;
        const br = (x0, y0, a, len, w, d) => { if (d === 0 || len < 8) return; const x1 = x0 + Math.cos(a) * len, y1 = y0 + Math.sin(a) * len; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); br(x1, y1, a - between(R, .3, .7), len * .7, w * .75, d - 1); br(x1, y1, a + between(R, .3, .7), len * .7, w * .75, d - 1); };
        br(x, y, between(R, 0, 6.283), between(R, 30, 50), 14, 4);
      }
      for (let i = 0; i < 14; i++) {
        const x = R() * W, y = R() * H, r = between(R, 30, 55);
        c.fillStyle = pick(R, ['#a3c95a', '#e6a157', '#d98cb3']); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
        c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 3;
        for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x, y, r * (0.25 + k * 0.2), between(R, 0, 3), between(R, 3.5, 6.2)); c.stroke(); }
      }
      for (let i = 0; i < 30; i++) {
        const x = R() * W, y = R() * H, h = between(R, 80, 160);
        c.strokeStyle = pick(R, ['#2e9e5b', '#48b36b', '#237a45']); c.lineWidth = 9;
        c.beginPath(); c.moveTo(x, y); for (let t = 0; t <= 1; t += 0.1) c.lineTo(x + Math.sin(t * 9 + i) * 12, y - t * h); c.stroke();
      }
      c.save(); c.translate(W * 0.7, H * 0.72); c.rotate(0.5);
      c.fillStyle = '#4a3523'; c.beginPath(); c.ellipse(0, 0, 230, 80, 0, 0, 6.283); c.fill();
      c.fillStyle = '#5e4630'; c.beginPath(); c.ellipse(0, 0, 200, 60, 0, 0, 6.283); c.fill();
      c.strokeStyle = '#3a2817'; c.lineWidth = 7; for (let k = -170; k <= 170; k += 56) { c.beginPath(); c.moveTo(k, -56); c.lineTo(k, 56); c.stroke(); }
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2.5;
      for (let i = 0; i < 90; i++) { c.beginPath(); c.arc(R() * W, R() * H, between(R, 4, 12), 0, 6.283); c.stroke(); }
    },
    cave(c, W, H, R) {
      c.fillStyle = '#7a6656'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 40; i++) blob(c, R() * W, R() * H, between(R, 60, 150), R, pick(R, ['#71604f', '#85705f', '#6b5949']));
      speckle(c, W, H, R, 2600, ['#5e4f42', '#94806e', '#6b5949'], 2.5);
      for (let i = 0; i < 34; i++) { const edge = R() < .5; const x = edge ? (R() < .5 ? between(R, -40, 140) : between(R, W - 140, W + 40)) : R() * W; const y = edge ? R() * H : (R() < .5 ? between(R, -40, 120) : between(R, H - 120, H + 40)); blob(c, x, y, between(R, 70, 150), R, '#3f342c', '#2e2620'); }
      c.fillStyle = '#2f7ea3'; blob(c, W * 0.55, H * 0.6, 190, R, '#2f7ea3', '#1f5d7a');
      c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(W * 0.53, H * 0.57, 90, 30, -0.3, 0, 6.283); c.fill();
      for (let i = 0; i < 7; i++) { const x = between(R, 150, W - 150), y = between(R, 150, H - 150); const gr = c.createRadialGradient(x, y, 0, x, y, 220); gr.addColorStop(0, 'rgba(255,200,110,.45)'); gr.addColorStop(1, 'rgba(255,200,110,0)'); c.fillStyle = gr; c.fillRect(x - 220, y - 220, 440, 440); c.fillStyle = '#ffb347'; c.beginPath(); c.arc(x, y, 10, 0, 6.283); c.fill(); }
      for (let i = 0; i < 12; i++) {
        const x = R() * W, y = R() * H, col = pick(R, [['#b388ff', '#7c4dff'], ['#64ffda', '#1de9b6'], ['#ff80ab', '#f50057']]);
        for (let k = 0; k < 5; k++) { c.save(); c.translate(x + between(R, -25, 25), y + between(R, -20, 20)); c.rotate(between(R, -0.8, 0.8)); c.fillStyle = col[k % 2]; c.beginPath(); c.moveTo(0, -34); c.lineTo(10, -8); c.lineTo(8, 14); c.lineTo(-8, 14); c.lineTo(-10, -8); c.closePath(); c.fill(); c.restore(); }
      }
      for (let i = 0; i < 22; i++) { const x = R() * W, y = R() * H, r = between(R, 16, 30); [[1, '#5a4a3d'], [0.7, '#8d7966'], [0.4, '#b3a08b']].forEach(([k, col]) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r * k, 0, 6.283); c.fill(); }); }
      c.strokeStyle = '#4a3a22'; c.lineWidth = 8; c.beginPath(); c.moveTo(0, H * 0.3); c.lineTo(W, H * 0.42); c.stroke();
      c.lineWidth = 4; for (let x = 20; x < W; x += 50) { const y = H * 0.3 + x / W * H * 0.12; c.beginPath(); c.moveTo(x, y - 14); c.lineTo(x, y + 14); c.stroke(); }
    },
    waterfall(c, W, H, R) {
      c.fillStyle = '#6cb851'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 40; i++) blob(c, R() * W, R() * H, between(R, 60, 140), R, pick(R, ['#5fa947', '#7cc761', '#68b34e']));
      speckle(c, W, H, R, 2600, ['#58a141', '#8fd174'], 2.5);
      c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0);
      for (let x = W; x >= 0; x -= 20) c.lineTo(x, H * 0.22 + Math.sin(x / 70) * 20 + Math.sin(x / 23) * 8);
      c.closePath(); c.fillStyle = '#8b9290'; c.fill();
      for (let i = 0; i < 30; i++) blob(c, R() * W, between(R, 0, H * 0.2), between(R, 30, 70), R, pick(R, ['#7b8280', '#9aa19f', '#6d7472']), '#5d6462');
      const fx = W * 0.45, fw = 220;
      const fg = c.createLinearGradient(fx, 0, fx + fw, 0); fg.addColorStop(0, '#bfe9f5'); fg.addColorStop(.5, '#ffffff'); fg.addColorStop(1, '#bfe9f5');
      c.fillStyle = fg; c.fillRect(fx, 0, fw, H * 0.3);
      c.strokeStyle = 'rgba(70,160,200,.4)'; c.lineWidth = 4; for (let x = fx + 10; x < fx + fw; x += 22) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 4, H * 0.3); c.stroke(); }
      blob(c, fx + fw / 2, H * 0.36, 260, R, '#3fa0c8', '#2b80a6');
      c.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(fx + fw / 2 + between(R, -150, 150), H * 0.3 + between(R, -10, 50), between(R, 6, 16), 0, 6.283); c.fill(); }
      c.lineCap = 'round';
      const rv = t => [fx + fw / 2 + Math.sin(t * 4) * 260 + t * 300, H * 0.36 + t * H * 0.7];
      [[110, '#2b80a6'], [86, '#3fa0c8'], [24, 'rgba(255,255,255,.25)']].forEach(([w, col]) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let t = 0; t <= 1.001; t += 0.02) { const [x, y] = rv(t); t ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); });
      const [bx, by] = rv(0.55);
      planks(c, bx - 160, by - 28, 320, 56, false, R, '#a8743f');
      c.strokeStyle = '#6b4a2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(bx - 160, by - 30); c.lineTo(bx + 160, by - 30); c.moveTo(bx - 160, by + 30); c.lineTo(bx + 160, by + 30); c.stroke();
      for (let i = 0; i < 40; i++) { const x = R() * W, y = between(R, H * 0.22, H); tree(c, x, y, between(R, 45, 80), R, ['#1b5e20', '#2e7d32', '#388e3c', '#43a047']); }
      for (let i = 0; i < 8; i++) palm(c, R() * W, between(R, H * 0.3, H), between(R, 70, 100), R);
      for (let i = 0; i < 160; i++) { c.fillStyle = pick(R, ['#ff6b8b', '#ffd166', '#ffffff', '#c86bfa']); c.beginPath(); c.arc(R() * W, between(R, H * 0.22, H), between(R, 3, 6), 0, 6.283); c.fill(); }
    },
    town(c, W, H, R) {
      c.fillStyle = '#cfc4b4'; c.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += 26) for (let x = (y / 26 % 2) * 18; x < W; x += 36) { c.fillStyle = pick(R, ['#c4b8a6', '#d8cebf', '#bdb19f']); c.beginPath(); c.ellipse(x, y, 16, 11, 0, 0, 6.283); c.fill(); }
      const harbor = H * 0.8;
      const hg = c.createLinearGradient(0, harbor, 0, H); hg.addColorStop(0, '#2aa3b8'); hg.addColorStop(1, '#0e6f86');
      c.fillStyle = hg; c.fillRect(0, harbor, W, H - harbor);
      c.fillStyle = '#8a7f72'; c.fillRect(0, harbor - 14, W, 18);
      waves(c, W, harbor + 30, H, R, 'rgba(255,255,255,.3)', 50);
      for (let i = 0; i < 5; i++) {
        const x = between(R, 120, W - 120), y = between(R, harbor + 70, H - 60), col = pick(R, ['#ff6b4a', '#f4f1ea', '#2f9ad6', '#ffc845']);
        c.save(); c.translate(x, y); c.rotate(between(R, -.3, .3));
        c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 110, 36, 0, 0, 6.283); c.fill();
        c.fillStyle = '#8a5a26'; c.beginPath(); c.ellipse(0, 0, 92, 24, 0, 0, 6.283); c.fill();
        c.restore();
      }
      const cols = 6, rows = 3, cw = W / cols, rh = harbor / rows;
      for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
        if (r === 1 && (k === 2 || k === 3)) continue;
        const x = k * cw + cw * 0.12, y = r * rh + rh * 0.14, w = cw * 0.76, h = rh * 0.62;
        c.fillStyle = 'rgba(40,30,20,.25)'; c.fillRect(x + 12, y + 14, w, h);
        const roof = pick(R, [['#c8553d', '#a8432f'], ['#d9734e', '#b85c3a'], ['#4f7cac', '#3d6489'], ['#7a9e7e', '#5f8263']]);
        c.fillStyle = roof[0]; c.fillRect(x, y, w, h / 2);
        c.fillStyle = roof[1]; c.fillRect(x, y + h / 2, w, h / 2);
        c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 2;
        for (let yy = y + 12; yy < y + h; yy += 14) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); }
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke();
        if (R() < .6) { c.fillStyle = '#8a7f72'; c.fillRect(x + w * between(R, .15, .75), y + h * .15, 22, 22); }
      }
      const px = W / 2, py = rh * 1.5;
      c.fillStyle = '#e8dfd0'; c.beginPath(); c.arc(px, py, 120, 0, 6.283); c.fill();
      c.fillStyle = '#9a9184'; c.beginPath(); c.arc(px, py, 80, 0, 6.283); c.fill();
      c.fillStyle = '#4fc4cf'; c.beginPath(); c.arc(px, py, 64, 0, 6.283); c.fill();
      c.fillStyle = '#e8dfd0'; c.beginPath(); c.arc(px, py, 18, 0, 6.283); c.fill();
      for (let i = 0; i < 8; i++) { const x = between(R, 60, W - 200), y = between(R, 40, harbor - 80); const sw = 14; for (let s = 0; s < 9; s++) { c.fillStyle = s % 2 ? '#fff' : pick(R, ['#ff6b4a', '#0f8b8d', '#ffc845']); c.fillRect(x + s * sw, y, sw, 30); } }
      for (let i = 0; i < 24; i++) tree(c, R() * W, between(R, 0, harbor - 30), between(R, 22, 36), R, ['#2e7d32', '#43a047', '#66bb6a']);
    },
    festival(c, W, H, R) {
      c.fillStyle = '#4b4376'; c.fillRect(0, 0, W, H);
      speckle(c, W, H, R, 2600, ['#57508a', '#3f3866', '#625a96'], 2.5);
      const sea = H * 0.2;
      c.fillStyle = '#1b2556'; c.fillRect(0, 0, W, sea);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, sea); for (let x = 0; x <= W; x += 20) c.lineTo(x, sea + Math.sin(x / 60) * 8); c.stroke();
      c.fillStyle = 'rgba(255,240,180,.35)'; for (let i = 0; i < 18; i++) c.fillRect(W * 0.7 - i * 3 + between(R, -30, 30), 20 + i * (sea - 30) / 18, 60 + i * 4, 5);
      waves(c, W, 10, sea - 20, R, 'rgba(160,180,255,.25)', 40);
      const glow = (x, y, r, col) => { const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2); };
      const fx = W * 0.5, fy = H * 0.55;
      glow(fx, fy, 380, 'rgba(255,170,80,.55)');
      for (let i = 0; i < 12; i++) { c.fillStyle = '#6b6b7a'; c.beginPath(); c.arc(fx + Math.cos(i / 12 * 6.283) * 56, fy + Math.sin(i / 12 * 6.283) * 56, 14, 0, 6.283); c.fill(); }
      c.fillStyle = '#ff7b39'; c.beginPath(); c.arc(fx, fy, 38, 0, 6.283); c.fill(); c.fillStyle = '#ffd166'; c.beginPath(); c.arc(fx, fy, 20, 0, 6.283); c.fill();
      c.fillStyle = '#5a3d2b'; c.fillRect(W * 0.08, H * 0.3, 360, 220); c.fillStyle = '#7a5640'; c.fillRect(W * 0.08 + 12, H * 0.3 + 12, 336, 196);
      glow(W * 0.08 + 180, H * 0.3 + 110, 260, 'rgba(200,120,255,.35)');
      for (let i = 0; i < 6; i++) {
        const x = between(R, 100, W - 300), y = between(R, sea + 80, H - 160), w = 200;
        c.fillStyle = '#5b4a3a'; c.fillRect(x, y, w, 110);
        for (let s = 0; s < 10; s++) { c.fillStyle = s % 2 ? '#f0e6ff' : pick(R, ['#ff5d8f', '#4cc9f0', '#ffd166']); c.fillRect(x + s * 20, y - 16, 20, 36); }
        glow(x + w / 2, y + 50, 160, 'rgba(255,220,120,.3)');
      }
      for (let n = 0; n < 6; n++) {
        const y0 = between(R, sea + 40, H - 40), y1 = between(R, sea + 40, H - 40), sag = between(R, 60, 140);
        c.strokeStyle = 'rgba(20,15,40,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, y0); c.quadraticCurveTo(W / 2, (y0 + y1) / 2 + sag, W, y1); c.stroke();
        for (let t = 0.02; t < 1; t += 0.03) {
          const x = W * t, y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * ((y0 + y1) / 2 + sag) + t * t * y1, col = pick(R, ['255,209,102', '255,93,143', '76,201,240', '144,238,144']);
          glow(x, y + 6, 26, `rgba(${col},.6)`); c.fillStyle = `rgb(${col})`; c.beginPath(); c.arc(x, y + 6, 6, 0, 6.283); c.fill();
        }
      }
      for (let i = 0; i < 400; i++) { c.fillStyle = pick(R, ['#ff5d8f', '#ffd166', '#4cc9f0', '#90ee90', '#ffffff']); c.fillRect(R() * W, between(R, sea, H), 5, 3); }
    },
  };

  // ---------------------------------------------------------------- bölüm düzeni
  const layoutCache = new Map();
  function buildLayout(L) {
    if (layoutCache.has(L.id)) return layoutCache.get(L.id);
    const R = rng(L.seed * 7919 + 3);
    const items = [];
    L.targets.forEach(([e, n]) => { for (let i = 0; i < n; i++) items.push({ e, target: true }); });
    const pool = L.pool.filter(e => !L.targets.some(t => t[0] === e));
    for (let i = 0; i < L.decoys; i++) items.push({ e: pick(R, pool), target: false });
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
    const placed = [], M = 40;
    items.forEach(it => {
      const size = between(R, L.size[0], L.size[1]);
      let best = null;
      for (let tries = 0; tries < 80; tries++) {
        const x = between(R, M, L.W - M), y = between(R, M, L.H - M);
        let ok = true;
        for (const p of placed) { const d = Math.hypot(p.x - x, p.y - y); if (d < (p.size + size) * 0.55) { ok = false; break; } }
        if (ok) { best = { x, y }; break; }
        if (!best) best = { x, y };
      }
      placed.push({ e: it.e, target: it.target, x: best.x, y: best.y, size, rot: between(R, -0.45, 0.45) });
    });
    placed.forEach((p, i) => { p.i = i; });
    const res = { objs: placed, total: placed.filter(p => p.target).length };
    layoutCache.set(L.id, res);
    return res;
  }

  const bgCache = new Map();
  function background(L) {
    if (bgCache.has(L.id)) return bgCache.get(L.id);
    const k = Math.min(1.5, 3000 / Math.max(L.W, L.H));
    const cv = document.createElement('canvas');
    cv.width = Math.round(L.W * k); cv.height = Math.round(L.H * k);
    const c = cv.getContext('2d');
    c.scale(k, k);
    PAINTERS[L.paint](c, L.W, L.H, rng(L.seed));
    const res = { cv, k };
    bgCache.set(L.id, res);
    return res;
  }

  function drawThumb(L, canvas) {
    const c = canvas.getContext('2d');
    const s = Math.max(canvas.width / L.W, canvas.height / L.H);
    c.save(); c.scale(s, s);
    PAINTERS[L.paint](c, L.W, L.H, rng(L.seed));
    buildLayout(L).objs.forEach(o => { c.save(); c.translate(o.x, o.y); c.rotate(o.rot); c.drawImage(sprite(o.e), -o.size / 2, -o.size / 2, o.size, o.size); c.restore(); });
    c.restore();
  }

  // ---------------------------------------------------------------- ses
  function makeAudio() {
    let ctx = null;
    function ensure() { if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; }
    function tone(f, dur, type = 'sine', vol = 0.15, delay = 0) {
      const a = ensure(); if (!a) return;
      const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
    }
    return {
      unlock: ensure,
      found(combo) { const b = 520 + Math.min(combo, 5) * 40; tone(b, .12, 'triangle', .18); tone(b * 1.5, .16, 'triangle', .14, .07); },
      miss() { tone(150, .18, 'square', .06); },
      hint() { [880, 1175, 1568].forEach((f, i) => tone(f, .18, 'sine', .08, i * .06)); },
      done() { [523, 659, 784, 1046].forEach((f, i) => tone(f, .3, 'triangle', .16, i * .12)); },
      typeDone() { tone(784, .12, 'triangle', .14); tone(1046, .2, 'triangle', .14, .1); },
    };
  }

  // ---------------------------------------------------------------- oyun
  function mount(host, api) {
    const KEY = api.gameStoreKey;
    const save = Object.assign({ v: 1, sound: true, hints: { n: HINT_MAX, clock: Date.now() }, levels: {} }, api.store.get(KEY, {}));
    const persist = () => api.store.set(KEY, save);
    const lvlSave = L => (save.levels[L.id] = save.levels[L.id] || { found: [], time: 0, score: 0, hintsUsed: 0, misses: 0, done: false, stars: 0 });
    const cleared = L => { const s = save.levels[L.id] || {}; return !!(s.cleared || s.done); };
    const unlocked = i => i === 0 || cleared(LEVELS[i - 1]);
    const audio = makeAudio();
    const sfx = (name, arg) => { if (save.sound) try { audio[name](arg); } catch (e) { /* ses kapalı */ } };

    const root = document.createElement('div');
    root.className = 'ad-root';
    root.tabIndex = 0;
    host.appendChild(root);

    let play = null; // aktif bölüm durumu
    let raf = 0;
    const cleanups = [];
    const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); cleanups.push(() => el.removeEventListener(ev, fn, opt)); };

    // ---------------- harita
    function showMap() {
      stopPlay();
      const totalAll = LEVELS.reduce((s, L) => s + buildLayout(L).total, 0);
      const foundAll = LEVELS.reduce((s, L) => s + (cleared(L) ? buildLayout(L).total : ((save.levels[L.id] || {}).found || []).length), 0);
      root.innerHTML = `
        <div class="ad-map">
          <div class="ad-map-head">
            <div><h2 class="ad-display">Ada Dedektifi</h2><p>Adayı keşfet, kalabalık sahnelerde saklanan eşyaları bul.</p></div>
            <div class="ad-total"><span>${foundAll} / ${totalAll} eşya</span><span class="ad-bar"><i style="width:${(foundAll / totalAll * 100).toFixed(1)}%"></i></span></div>
          </div>
          <div class="ad-levels">
            ${LEVELS.map((L, i) => {
              const s = save.levels[L.id] || {}, tot = buildLayout(L).total, f = (s.found || []).length, open = unlocked(i);
              const stars = s.stars || 0;
              return `<button class="ad-level" data-i="${i}" ${open ? '' : 'disabled'} aria-label="${L.name}${open ? '' : ' (kilitli)'}">
                <span class="ad-thumb"><canvas width="330" height="220"></canvas>${open ? '' : '<span class="ad-lock">🔒</span>'}</span>
                <span class="ad-level-body">
                  <span class="ad-level-title ad-display">${i + 1}. ${L.name}</span>
                  <span class="ad-level-meta"><span class="ad-diff ${L.diff.toLowerCase()}">${L.diff}</span><span>${open ? `${f} / ${tot}` : 'Önceki bölümü bitir'}</span></span>
                  <span class="ad-mini-bar"><i style="width:${(f / tot * 100).toFixed(1)}%"></i></span>
                  <span class="ad-level-meta"><span class="ad-stars">${'<b>★</b>'.repeat(stars)}${'★'.repeat(3 - stars)}</span><span>${s.done ? 'Tamamlandı · tekrar oyna' : (f ? 'Devam et' : (s.cleared ? 'Tekrar oyna' : (open ? 'Başla' : '')))}</span></span>
                </span>
              </button>`;
            }).join('')}
          </div>
          <div class="ad-map-foot"><button class="ad-link" data-reset>İlerlemeyi sıfırla</button></div>
        </div>`;
      root.querySelectorAll('.ad-level').forEach(b => {
        const L = LEVELS[+b.dataset.i];
        drawThumb(L, b.querySelector('canvas'));
        b.addEventListener('click', () => { audio.unlock(); startLevel(+b.dataset.i); });
      });
      const rb = root.querySelector('[data-reset]');
      let armed = 0;
      rb.addEventListener('click', () => {
        if (!armed) { rb.textContent = 'Emin misin? Tüm bölümler sıfırlanır. Onaylamak için tekrar tıkla'; armed = setTimeout(() => { armed = 0; rb.textContent = 'İlerlemeyi sıfırla'; }, 4000); return; }
        clearTimeout(armed); save.levels = {}; persist(); showMap();
      });
    }

    // ---------------- bölüm
    function startLevel(i) {
      stopPlay();
      const L = LEVELS[i];
      const lay = buildLayout(L);
      const st = lvlSave(L);
      if (st.done) { Object.assign(st, { found: [], time: 0, score: 0, hintsUsed: 0, misses: 0, done: false }); persist(); }
      const foundSet = new Set(st.found);
      const objs = lay.objs.map(o => Object.assign({}, o, { found: foundSet.has(o.i), foundAt: 0 }));
      const types = L.targets.map(([e, n]) => ({ e, n, left: n - objs.filter(o => o.target && o.e === e && o.found).length }));

      root.innerHTML = `
        <div class="ad-play">
          <div class="ad-top">
            <button class="ad-iconbtn" data-act="map" aria-label="Bölüm haritasına dön" title="Harita">←</button>
            <span class="ad-title ad-display">${L.name}</span>
            <div class="ad-stats">
              <span class="ad-stat" title="Bulunan"><small>Bulunan</small><span data-v="found"></span></span>
              <span class="ad-stat ad-hide-sm" title="Süre">⏱ <span data-v="time"></span></span>
              <span class="ad-stat" title="Puan">★ <span data-v="score"></span><span class="ad-combo" data-v="combo"></span></span>
              <button class="ad-iconbtn" data-act="sound" aria-label="Sesi aç/kapat"></button>
            </div>
          </div>
          <div class="ad-stage">
            <canvas aria-label="${L.name} sahnesi"></canvas>
            <div class="ad-zoom"><button data-act="zin" aria-label="Yakınlaştır">+</button><button data-act="zout" aria-label="Uzaklaştır">−</button></div>
            <button class="ad-hint" data-act="hint" aria-label="İpucu">💡<span class="ad-hint-count" data-v="hints"></span>
              <svg viewBox="0 0 76 76"><circle cx="38" cy="38" r="35" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="4"></circle><circle data-v="ring" cx="38" cy="38" r="35" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="220" stroke-dashoffset="0"></circle></svg>
            </button>
            <div class="ad-toast" data-v="toast"></div>
          </div>
          <div class="ad-tray" role="list" aria-label="Bulunacak eşyalar">
            ${types.map((t, k) => `<button class="ad-item${t.left ? '' : ' done'}" role="listitem" data-k="${k}" aria-label="${t.e} ${t.left} kaldı">${t.e}<span class="ad-n">${t.left || '✓'}</span></button>`).join('')}
          </div>
        </div>`;

      const stage = root.querySelector('.ad-stage');
      const canvas = stage.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      const V = sel => root.querySelector(`[data-v="${sel}"]`);
      const trayEls = [...root.querySelectorAll('.ad-item')];
      const bg = background(L);

      play = {
        L, st, objs, types, stage, canvas, ctx, bg,
        cam: { x: 0, y: 0, s: 1 }, vw: 0, vh: 0, dpr: 1, minS: 1, maxS: 3,
        tween: null, ring: null, marks: [], missTimes: [], lockUntil: 0,
        combo: 0, lastFind: 0, sel: -1, dirty: true, last: performance.now(), modal: false, total: lay.total,
      };
      const P = play;
      root._adPlay = P; // test ve hata ayıklama için

      function resize() {
        const r = stage.getBoundingClientRect();
        P.vw = Math.max(1, r.width); P.vh = Math.max(1, r.height);
        P.dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(P.vw * P.dpr); canvas.height = Math.round(P.vh * P.dpr);
        const first = !P.inited; P.inited = true;
        P.minS = Math.max(P.vw / L.W, P.vh / L.H);
        P.maxS = Math.max(P.minS * 4.5, 1.8);
        if (first) P.cam.s = P.minS;
        clampCam(); P.dirty = true;
      }
      function clampCam() {
        const c = P.cam;
        c.s = clamp(c.s, P.minS, P.maxS);
        c.x = clamp(c.x, 0, Math.max(0, L.W - P.vw / c.s));
        c.y = clamp(c.y, 0, Math.max(0, L.H - P.vh / c.s));
      }
      function zoomAt(sx, sy, ns) {
        const c = P.cam, wx = c.x + sx / c.s, wy = c.y + sy / c.s;
        c.s = clamp(ns, P.minS, P.maxS); c.x = wx - sx / c.s; c.y = wy - sy / c.s;
        clampCam(); P.dirty = true;
      }
      function flyTo(wx, wy, s, ms = 600) {
        const c = P.cam, ts = clamp(s, P.minS, P.maxS);
        const to = { s: ts, x: wx - P.vw / ts / 2, y: wy - P.vh / ts / 2 };
        to.x = clamp(to.x, 0, Math.max(0, L.W - P.vw / ts)); to.y = clamp(to.y, 0, Math.max(0, L.H - P.vh / ts));
        P.tween = { from: { ...c }, to, t0: performance.now(), ms };
      }
      const ro = new ResizeObserver(resize);
      ro.observe(stage);
      cleanups.push(() => ro.disconnect());
      resize();

      // ---- arayüz güncelleme
      function updHud() {
        const f = P.objs.filter(o => o.target && o.found).length;
        V('found').textContent = `${f}/${P.total}`;
        V('time').textContent = fmtTime(st.time);
        V('score').textContent = st.score.toLocaleString('tr-TR');
        V('combo').textContent = P.combo > 1 && performance.now() - P.lastFind < COMBO_WINDOW ? ` x${P.combo}` : '';
        root.querySelector('[data-act="sound"]').textContent = save.sound ? '🔊' : '🔇';
        updHint();
      }
      function updHint() {
        const h = save.hints, btn = root.querySelector('.ad-hint');
        if (!btn) return;
        V('hints').textContent = h.n;
        btn.disabled = h.n <= 0;
        const prog = h.n >= HINT_MAX ? 1 : clamp((Date.now() - h.clock) / HINT_RECHARGE, 0, 1);
        V('ring').setAttribute('stroke-dashoffset', String(220 * (1 - prog)));
      }
      let toastT = 0;
      function toast(msg, ms = 1600) {
        const el = V('toast'); el.textContent = msg; el.classList.add('show');
        clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), ms);
      }
      function selectType(k) {
        P.sel = P.sel === k ? -1 : k;
        trayEls.forEach((el, j) => el.classList.toggle('sel', j === P.sel));
        if (P.sel >= 0) toast(`${P.types[k].e} seçildi: ipucu bu eşyayı gösterir`);
      }

      // ---- bulma / ıskalama
      function worldFromScreen(sx, sy) { return { x: P.cam.x + sx / P.cam.s, y: P.cam.y + sy / P.cam.s }; }
      function tap(sx, sy) {
        if (P.modal) return;
        const now = performance.now();
        if (now < P.lockUntil) return;
        const w = worldFromScreen(sx, sy);
        let best = null, bestScore = 1;
        for (const o of P.objs) {
          if (o.found) continue;
          const r = Math.max(o.size * 0.55, 16 / P.cam.s);
          const d = Math.hypot(o.x - w.x, o.y - w.y) / r;
          if (d < bestScore) { bestScore = d; best = o; }
        }
        if (best && best.target) found(best, sx, sy); else miss(w);
      }
      function found(o, sx, sy) {
        const now = performance.now();
        o.found = true; o.foundAt = now;
        st.found.push(o.i);
        P.combo = now - P.lastFind < COMBO_WINDOW ? Math.min(P.combo + 1, 5) : 1;
        P.lastFind = now;
        st.score += 100 * P.combo;
        if (P.ring && P.ring.o === o) P.ring = null;
        const k = P.types.findIndex(t => t.e === o.e), t = P.types[k];
        t.left--;
        const el = trayEls[k];
        flyToTray(o.e, sx, sy, el, () => {
          el.querySelector('.ad-n').textContent = t.left || '✓';
          el.setAttribute('aria-label', `${t.e} ${t.left} kaldı`);
          el.classList.toggle('done', !t.left);
          el.classList.add('bump'); setTimeout(() => el.classList.remove('bump'), 180);
        });
        if (!t.left) { sfx('typeDone'); toast(`Tüm ${t.e} bulundu!`); if (P.sel === k) selectType(k); } else sfx('found', P.combo);
        persist(); P.dirty = true; updHud();
        if (st.found.length >= P.total) setTimeout(complete, 750);
      }
      function miss(w) {
        const now = performance.now();
        st.misses++;
        P.combo = 0; P.lastFind = 0;
        P.marks.push({ x: w.x, y: w.y, t: now });
        P.missTimes = P.missTimes.filter(t => now - t < 2500); P.missTimes.push(now);
        sfx('miss');
        if (P.missTimes.length >= 4) {
          P.lockUntil = now + 3000; P.missTimes = [];
          const lk = document.createElement('div'); lk.className = 'ad-lockout'; lk.innerHTML = '<span>Çok hızlı tıkladın. 3 saniye bekle</span>';
          stage.appendChild(lk); setTimeout(() => lk.remove(), 3000);
        }
        persist(); P.dirty = true; updHud();
      }
      function flyToTray(emoji, sx, sy, el, done) {
        const rr = root.getBoundingClientRect(), sr = stage.getBoundingClientRect();
        el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        const er = el.getBoundingClientRect();
        const f = document.createElement('span'); f.className = 'ad-fly'; f.textContent = emoji;
        f.style.left = (sr.left - rr.left + sx - 20) + 'px'; f.style.top = (sr.top - rr.top + sy - 22) + 'px';
        root.appendChild(f);
        const dx = er.left + er.width / 2 - (sr.left + sx), dy = er.top + er.height / 2 - (sr.top + sy);
        requestAnimationFrame(() => { f.style.transform = `translate(${dx}px,${dy}px) scale(.7)`; });
        setTimeout(() => { f.remove(); done(); }, 620);
      }
      function useHint() {
        if (P.modal) return;
        const h = save.hints;
        if (h.n <= 0) { toast('İpucu dolmak üzere, biraz bekle'); return; }
        let cand = P.objs.filter(o => o.target && !o.found && (P.sel < 0 || o.e === P.types[P.sel].e));
        if (!cand.length) cand = P.objs.filter(o => o.target && !o.found);
        if (!cand.length) return;
        const o = cand[Math.floor(Math.random() * cand.length)];
        if (h.n >= HINT_MAX) h.clock = Date.now();
        h.n--; st.hintsUsed++;
        P.ring = { o, t: performance.now() };
        flyTo(o.x, o.y, Math.max(P.cam.s, P.minS * 2.4));
        sfx('hint'); persist(); updHint();
      }

      function complete() {
        if (st.done) return;
        const par = P.total * PAR_PER_ITEM[L.diff];
        const bonus = Math.max(0, Math.round((par * 1.5 - st.time) * 5));
        st.score += bonus;
        let stars = 1;
        if (st.time <= par * 1.6) stars = 2;
        if (st.time <= par && st.hintsUsed <= 2) stars = 3;
        st.done = true; st.cleared = true;
        st.stars = Math.max(st.stars || 0, stars);
        st.best = { time: Math.min((st.best || {}).time || Infinity, st.time), score: Math.max((st.best || {}).score || 0, st.score) };
        persist(); updHud(); sfx('done');
        const idx = LEVELS.indexOf(L), next = LEVELS[idx + 1];
        P.modal = true;
        const m = document.createElement('div'); m.className = 'ad-modal';
        m.innerHTML = `<div class="ad-card" role="dialog" aria-label="Bölüm tamamlandı">
          <h3 class="ad-display">Bölüm tamamlandı!</h3>
          <div class="ad-bigstars">${'<b>★</b>'.repeat(stars)}${'★'.repeat(3 - stars)}</div>
          <div class="ad-results">
            <div>Süre<b>${fmtTime(st.time)}</b></div><div>Puan<b>${st.score.toLocaleString('tr-TR')}</b></div>
            <div>Hız bonusu<b>+${bonus.toLocaleString('tr-TR')}</b></div><div>İpucu / Hata<b>${st.hintsUsed} / ${st.misses}</b></div>
          </div>
          <p style="margin:0;color:var(--ad-muted);font-size:.85rem">3 yıldız için ${fmtTime(par)} altında bitir ve en fazla 2 ipucu kullan.</p>
          <div class="ad-actions">
            <button class="ad-btn alt" data-m="map">Haritaya dön</button>
            ${next ? `<button class="ad-btn" data-m="next">Sonraki bölüm →</button>` : `<button class="ad-btn" data-m="map">Tüm adayı bitirdin 🎉</button>`}
          </div></div>`;
        root.appendChild(m);
        m.addEventListener('click', e => { const a = e.target.closest('[data-m]'); if (!a) return; if (a.dataset.m === 'next') startLevel(idx + 1); else showMap(); });
      }

      function intro() {
        P.modal = true;
        const m = document.createElement('div'); m.className = 'ad-modal';
        m.innerHTML = `<div class="ad-card ad-intro" role="dialog" aria-label="${L.name}">
          <h3 class="ad-display">${L.name}</h3>
          <p>Bu sahnede <b>${P.total}</b> eşya saklı. Alttaki listedeki her eşyayı bul ve üzerine dokun.</p>
          <div class="ad-preview">${L.targets.map(t => `<span title="${t[1]} adet">${t[0]}</span>`).join('')}</div>
          <p>Sürükleyerek gez, tekerlek ya da iki parmakla yakınlaştır. Takılırsan 💡 ipucunu kullan.</p>
          <div class="ad-actions"><button class="ad-btn" data-m="go">Aramaya başla</button></div></div>`;
        root.appendChild(m);
        m.querySelector('[data-m="go"]').addEventListener('click', () => { audio.unlock(); m.remove(); P.modal = false; P.last = performance.now(); root.focus({ preventScroll: true }); });
      }

      // ---- giriş olayları
      const ptrs = new Map();
      let drag = null, pinch = null;
      const local = e => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
      on(stage, 'pointerdown', e => {
        if (e.target.closest('button')) return;
        stage.setPointerCapture(e.pointerId);
        const p = local(e); ptrs.set(e.pointerId, p);
        P.tween = null;
        if (ptrs.size === 1) drag = { sx: p.x, sy: p.y, cx: P.cam.x, cy: P.cam.y, moved: false };
        else if (ptrs.size === 2) {
          const [a, b] = [...ptrs.values()];
          pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: P.cam.s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
          if (drag) drag.moved = true;
        }
      });
      on(stage, 'pointermove', e => {
        if (!ptrs.has(e.pointerId)) return;
        const p = local(e); ptrs.set(e.pointerId, p);
        if (ptrs.size >= 2 && pinch) {
          const [a, b] = [...ptrs.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          P.cam.x -= (mx - pinch.mx) / P.cam.s; P.cam.y -= (my - pinch.my) / P.cam.s;
          pinch.mx = mx; pinch.my = my;
          zoomAt(mx, my, pinch.s * d / pinch.d);
        } else if (drag) {
          const dx = p.x - drag.sx, dy = p.y - drag.sy;
          if (!drag.moved && Math.hypot(dx, dy) > 7) { drag.moved = true; stage.classList.add('dragging'); }
          if (drag.moved) { P.cam.x = drag.cx - dx / P.cam.s; P.cam.y = drag.cy - dy / P.cam.s; clampCam(); P.dirty = true; }
        }
      });
      const up = e => {
        if (!ptrs.has(e.pointerId)) return;
        const p = local(e);
        ptrs.delete(e.pointerId);
        if (ptrs.size < 2) pinch = null;
        if (ptrs.size === 0) {
          if (drag && !drag.moved && e.type === 'pointerup') tap(p.x, p.y);
          drag = null; stage.classList.remove('dragging');
        } else if (ptrs.size === 1) {
          const [q] = [...ptrs.values()]; drag = { sx: q.x, sy: q.y, cx: P.cam.x, cy: P.cam.y, moved: true };
        }
      };
      on(stage, 'pointerup', up); on(stage, 'pointercancel', up);
      on(stage, 'wheel', e => { e.preventDefault(); const p = local(e); P.tween = null; zoomAt(p.x, p.y, P.cam.s * Math.exp(-e.deltaY * 0.0016)); }, { passive: false });
      on(root, 'keydown', e => {
        if (!play || P.modal) return;
        const step = 80 / P.cam.s;
        const k = e.key;
        if (k === '+' || k === '=') zoomAt(P.vw / 2, P.vh / 2, P.cam.s * 1.25);
        else if (k === '-' || k === '_') zoomAt(P.vw / 2, P.vh / 2, P.cam.s / 1.25);
        else if (k === 'ArrowLeft') { P.cam.x -= step; clampCam(); }
        else if (k === 'ArrowRight') { P.cam.x += step; clampCam(); }
        else if (k === 'ArrowUp') { P.cam.y -= step; clampCam(); }
        else if (k === 'ArrowDown') { P.cam.y += step; clampCam(); }
        else if (k === 'h' || k === 'H' || k === 'i' || k === 'İ') useHint();
        else return;
        e.preventDefault(); P.dirty = true;
      });
      root.querySelector('.ad-play').addEventListener('click', e => {
        const b = e.target.closest('[data-act],[data-k]');
        if (!b) return;
        audio.unlock();
        if (b.dataset.k !== undefined) return selectType(+b.dataset.k);
        const a = b.dataset.act;
        if (a === 'map') showMap();
        else if (a === 'sound') { save.sound = !save.sound; persist(); updHud(); }
        else if (a === 'zin') { P.tween = null; zoomAt(P.vw / 2, P.vh / 2, P.cam.s * 1.4); }
        else if (a === 'zout') { P.tween = null; zoomAt(P.vw / 2, P.vh / 2, P.cam.s / 1.4); }
        else if (a === 'hint') useHint();
      });

      // ---- çizim döngüsü
      function frame(now) {
        if (play !== P) return;
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.25, (now - P.last) / 1000); P.last = now;
        if (!P.modal && !document.hidden && !st.done) {
          const before = Math.floor(st.time); st.time += dt;
          if (Math.floor(st.time) !== before) { updHud(); if (Math.floor(st.time) % 5 === 0) persist(); }
        }
        const h = save.hints;
        if (h.n < HINT_MAX && Date.now() - h.clock >= HINT_RECHARGE) { h.n++; h.clock = Date.now(); persist(); toast('Yeni ipucu hazır 💡'); }
        if (Math.floor(now / 250) !== P.hintTick) { P.hintTick = Math.floor(now / 250); updHint(); }
        if (P.tween) {
          const tw = P.tween, k = clamp((now - tw.t0) / tw.ms, 0, 1), e = 1 - Math.pow(1 - k, 3);
          P.cam.s = tw.from.s + (tw.to.s - tw.from.s) * e; P.cam.x = tw.from.x + (tw.to.x - tw.from.x) * e; P.cam.y = tw.from.y + (tw.to.y - tw.from.y) * e;
          clampCam(); P.dirty = true; if (k >= 1) P.tween = null;
        }
        if (P.ring && now - P.ring.t > 4000) { P.ring = null; P.dirty = true; }
        P.marks = P.marks.filter(m => now - m.t < 600);
        const anim = P.ring || P.marks.length || P.objs.some(o => o.found && now - o.foundAt < 450);
        if (!P.dirty && !anim) return;
        P.dirty = false;
        draw(now);
      }
      function draw(now) {
        const c = P.ctx, cam = P.cam, d = P.dpr;
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.fillStyle = '#0b3b3c'; c.fillRect(0, 0, canvas.width, canvas.height);
        c.setTransform(d * cam.s, 0, 0, d * cam.s, -cam.x * cam.s * d, -cam.y * cam.s * d);
        c.imageSmoothingEnabled = true;
        c.drawImage(bg.cv, 0, 0, L.W, L.H);
        const x0 = cam.x - 60, y0 = cam.y - 60, x1 = cam.x + P.vw / cam.s + 60, y1 = cam.y + P.vh / cam.s + 60;
        for (const o of P.objs) {
          if (o.x < x0 || o.x > x1 || o.y < y0 || o.y > y1) continue;
          let sc = 1, al = 1;
          if (o.found) { const k = (now - o.foundAt) / 450; if (k >= 1) continue; sc = 1 + k * 0.8; al = 1 - k; }
          c.globalAlpha = al;
          c.save(); c.translate(o.x, o.y); c.rotate(o.rot); c.scale(sc, sc);
          c.drawImage(sprite(o.e), -o.size / 2, -o.size / 2, o.size, o.size);
          c.restore();
        }
        c.globalAlpha = 1;
        if (P.ring) {
          const o = P.ring.o, k = (now - P.ring.t) / 1000;
          const r = o.size * (0.9 + 0.25 * Math.sin(k * 7));
          c.lineWidth = 5 / cam.s; c.strokeStyle = '#ffc845';
          c.beginPath(); c.arc(o.x, o.y, r, 0, 6.283); c.stroke();
          c.lineWidth = 2.5 / cam.s; c.strokeStyle = '#fff';
          c.beginPath(); c.arc(o.x, o.y, r + 8 / cam.s, 0, 6.283); c.stroke();
        }
        for (const m of P.marks) {
          const k = (now - m.t) / 600, s = 14 / cam.s;
          c.globalAlpha = 1 - k; c.strokeStyle = '#d6453d'; c.lineWidth = 5 / cam.s; c.lineCap = 'round';
          c.beginPath(); c.moveTo(m.x - s, m.y - s); c.lineTo(m.x + s, m.y + s); c.moveTo(m.x + s, m.y - s); c.lineTo(m.x - s, m.y + s); c.stroke();
        }
        c.globalAlpha = 1;
      }

      updHud();
      raf = requestAnimationFrame(frame);
      if (!st.found.length && st.time < 1) intro(); else { toast('Kaldığın yerden devam ediyorsun'); root.focus({ preventScroll: true }); }
    }

    function stopPlay() {
      cancelAnimationFrame(raf);
      if (play) persist();
      play = null;
      while (cleanups.length) cleanups.pop()();
    }

    const onVis = () => { if (play) { play.last = performance.now(); persist(); } };
    document.addEventListener('visibilitychange', onVis);

    showMap();
    return {
      destroy() { stopPlay(); document.removeEventListener('visibilitychange', onVis); root.remove(); },
    };
  }

  // ---------------------------------------------------------------- kayıt
  Portal.register({
    slug: 'ada-dedektifi',
    title: 'Ada Dedektifi',
    category: 'sakli-nesne',
    featured: true,
    isNew: true,
    short: '10 bölüm, 380+ eşya',
    tags: ['saklı nesne', 'ada', 'bulmaca', 'dikkat', 'tek oyunculu', 'mobil'],
    heroFacts: ['10 ada bölümü', '380+ saklı eşya', 'İpucu ve kombo', 'Mobilde de oynanır'],
    description: 'Tropik bir adada dedektiflik yap. Kumsaldan mercan resifine, gizli mağaradan şelale vadisine ve gece festivaline kadar on kalabalık sahnede saklanan eşyaları bul. Bölümleri bitirdikçe yeni yerlerin kilidi açılır.',
    howTo: [
      'Haritadan açık bir bölüm seç.',
      'Alttaki listede aranacak eşyalar ve kaç tane kaldığı yazar.',
      'Sahneyi sürükleyerek gez, yakınlaştırıp eşyanın üzerine dokun.',
      'Arka arkaya hızlı bulursan kombo çarpanı (x5\'e kadar) puanını katlar.',
      'Takılırsan 💡 ipucunu kullan. İpuçları her 45 saniyede bir dolar, en fazla 3 tane birikir.',
      'Rastgele tıklama: 2,5 saniyede 4 yanlış tıklama 3 saniyelik bekleme cezası getirir.',
      'Hızlı bitirip az ipucu kullanırsan 3 yıldız alırsın.',
    ],
    controls: [
      ['Fare tıklaması / dokunma', 'Eşyayı seç'],
      ['Sürükle', 'Sahnede gez'],
      ['Fare tekerleği / iki parmak', 'Yakınlaştır, uzaklaştır'],
      ['<kbd>+</kbd> <kbd>−</kbd>', 'Yakınlaştır, uzaklaştır'],
      ['<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd>', 'Sahneyi kaydır'],
      ['<kbd>H</kbd>', 'İpucu kullan'],
      ['Listedeki eşyaya dokun', 'İpucunu o eşyaya yönlendir'],
    ],
    drawCover(canvas) { drawThumb(LEVELS[0], canvas); },
    mount,
  });
})();
