/*
 * Farkı Bul — iki resim, 7 fark (Oyunluk için özgün yapım).
 * Sahneler kodla çizilir. Farklar her bölümde sahnedeki nesnelerden otomatik ve hep aynı şekilde seçilir
 * (renk değişimi, eksik/fazla nesne, ayna, boyut, parça, sayı...).
 * Yeni bölüm eklemek: LEVELS dizisine bir kayıt ve SCENES içine bir sahne fonksiyonu ekleyin.
 */
(function () {
  'use strict';

  const W = 900, H = 600, DIFFS = 7, HINTS = 3, COMBO_WINDOW = 6000;
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
  const TAU = Math.PI * 2;

  // ---------------------------------------------------------------- renk paletleri
  const PAL = {
    main: ['#e8453c', '#ffc845', '#2f7fd6', '#47b05a', '#9b59d0', '#ff8fab', '#ffffff', '#ff8c2a', '#1fb5b0'],
    roof: ['#7a3b2e', '#2f5d8a', '#3c7a3c', '#5b5b6b', '#c9503a'],
    leaf: ['#3c9a45', '#e88b2a', '#d24b3e', '#d9c23a'],
    petal: ['#e8453c', '#ffc845', '#ff8fab', '#9b59d0', '#2f7fd6', '#ffffff'],
    fish: ['#ff8c2a', '#ffc845', '#2f7fd6', '#e8453c', '#9b59d0', '#47b05a', '#ff8fab'],
    sail: ['#ffffff', '#e8453c', '#ffc845', '#2f7fd6'],
    fence: ['#ffffff', '#8a5a2b', '#e8453c'],
    star: ['#ffd23f', '#ffffff', '#ff8fab', '#7fd3ff'],
    planet: ['#e8834a', '#5aa0e0', '#c86bfa', '#7bd389', '#e8c15a', '#d24b3e'],
    bld: ['#3b4a6b', '#6a3e66', '#2f6a5a', '#7a4a3a', '#55556a'],
    weed: ['#3c9a45', '#2fb59a', '#9ccc3a', '#d0603c'],
    pastel: ['#bfe6ff', '#ffe0b2', '#dcf5c4', '#f8d4e4', '#e6dcff'],
  };
  const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const cdist = (a, b) => { const x = hex(a), y = hex(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
  function otherColor(pal, cur, R) {
    const list = PAL[pal].filter(c => c !== cur);
    const far = list.filter(c => cdist(c, cur) > 150);
    if (far.length) return pick(R, far);
    return list.sort((a, b) => cdist(b, cur) - cdist(a, cur))[0];
  }

  // ---------------------------------------------------------------- emoji
  const SWAP = [
    ['🐄', '🐖', '🐑', '🐐'], ['🐓', '🐤', '🦆', '🐦'], ['🐕', '🐈', '🐇'], ['🍎', '🍐', '🍊', '🍋', '🍑'], ['🍌', '🥕', '🌽'],
    ['🍇', '🍒', '🍓'], ['🍅', '🍆', '🥑'], ['🧀', '🍞', '🥐'], ['🎂', '🍰', '🧁', '🍩', '🍪'], ['🥤', '🧃', '☕'], ['⛱️', '🌂'],
    ['🏐', '⚽', '🏀', '🎾'], ['🐚', '⭐', '🦀'], ['🐙', '🦑'], ['🐢', '🐡', '🐠'], ['🧸', '🤖', '🦖'], ['🚂', '🚗', '🚌', '🚕', '🚓'],
    ['🎲', '🧩', '🎮'], ['🌕', '🌖', '🌗', '🌘'], ['🛸', '🚀', '🛰️'], ['🦊', '🐿️', '🦔'], ['🐞', '🦋', '🐝', '🐌'], ['🍄', '🌰'],
    ['🦌', '🐧'], ['🛷', '🎿', '⛸️'], ['🍯', '🧂', '🥫'], ['🥄', '🍴'], ['🎁', '📦'], ['🌷', '🌻', '🌼', '🌹'], ['🦉', '🕊️'],
    ['🚲', '🛵'], ['📚', '✏️', '🎨'], ['🥁', '🎺', '🎸'], ['🍲', '🍳'], ['🥪', '🍉', '🥧'], ['🐬', '🐳'], ['👽', '☄️'], ['🌍', '🪐'], ['🕶️', '🧢', '👒'],
    ['🎠', '🎪', '🎢'], ['🍭', '🍬', '🍫'], ['🍿', '🌭', '🥨'], ['🐪', '🐫'], ['🦂', '🦎', '🐍'], ['🍂', '🍁'], ['🥬', '🥦', '🥒'], ['🧅', '🥔', '🎃'],
    ['🐸', '🐌'], ['🧤', '🧣'], ['❄️', '⭐'], ['📏', '📐', '✂️'], ['🏆', '🎺'], ['🦅', '🕊️', '🐦'], ['✈️', '🚁'], ['🛍️', '🎁'], ['🥖', '🥐'], ['🍮', '🥧'], ['🔥', '🔦'], ['🎒', '🥾'],
  ];
  const ASYM = new Set(['🐄', '🐖', '🐑', '🐐', '🐓', '🐤', '🦆', '🐦', '🐕', '🐈', '🐇', '🚜', '🐬', '🐳', '🕊️', '🐢', '🐡', '🐠', '🚂', '🚗', '🚌', '🚕', '🚓',
    '🚀', '🛰️', '🦖', '🦊', '🐿️', '🦔', '🐌', '🦌', '🛷', '🚲', '🛵', '🍌', '🥕', '🎺', '🎸', '✏️', '🧃', '🌖', '🌗', '🌘', '🐝', '☄️', '🛸', '🥄', '🎨', '🧢', '☕', '🐪', '🐫', '🦎', '🐍', '🦂', '🦅', '✈️', '🚁', '🐸', '🎒', '🐻', '🥖', '🛍️']);
  const swapGroup = e => SWAP.find(g => g.includes(e));
  const spriteCache = new Map();
  function sprite(e, px) {
    const S = Math.max(16, Math.min(256, Math.ceil(px / 16) * 16));
    const key = e + '|' + S;
    if (spriteCache.has(key)) return spriteCache.get(key);
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const c = cv.getContext('2d');
    c.font = `${S * 0.84}px ${EMOJI_FONT}`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(e, S / 2, S / 2 + S * 0.05);
    spriteCache.set(key, cv);
    return cv;
  }

  // ---------------------------------------------------------------- çizim yardımcıları
  function poly(c, pts, fill) { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } }
  function circ(c, x, y, r, fill) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = fill; c.fill(); }
  function rrect(c, x, y, w, h, r, fill) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); c.fillStyle = fill; c.fill(); }
  function ell(c, x, y, rx, ry, fill, rot = 0) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fillStyle = fill; c.fill(); }
  function hash(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

  /*
   * Nesne türleri. Her nesne: { k, x, y, s, ... } (x, y merkez; s boyut).
   * box: [genişlik, yükseklik] (s katı) ya da fonksiyon. colors: değişebilecek renk alanları -> palet.
   * parts: açılıp kapanabilen parçalar. num: sayısı değişebilen parça. asym: aynada farkı görünür.
   */
  const K = {
    house: {
      box: [1, 1], colors: { col: 'main', col2: 'roof', dc: 'main' }, parts: ['chim', 'win1', 'win2'],
      draw(c, o, s) {
        if (o.chim) { c.fillStyle = '#7a4a2a'; c.fillRect(0.17 * s, -0.42 * s, 0.11 * s, 0.24 * s); }
        poly(c, [[-0.5 * s, -0.04 * s], [0, -0.5 * s], [0.5 * s, -0.04 * s]], o.col2);
        if (o.snow) poly(c, [[-0.3 * s, -0.22 * s], [0, -0.5 * s], [0.3 * s, -0.22 * s], [0.15 * s, -0.26 * s], [0, -0.2 * s], [-0.15 * s, -0.26 * s]], '#ffffff');
        c.fillStyle = o.col; c.fillRect(-0.4 * s, -0.05 * s, 0.8 * s, 0.55 * s);
        c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(-0.4 * s, -0.05 * s, 0.8 * s, 0.05 * s);
        rrect(c, -0.08 * s, 0.22 * s, 0.16 * s, 0.28 * s, 0.03 * s, o.dc);
        c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 0.012 * s; c.strokeRect(-0.08 * s, 0.22 * s, 0.16 * s, 0.28 * s);
        circ(c, 0.04 * s, 0.37 * s, 0.015 * s, '#3b3b3b');
        const win = x => {
          c.fillStyle = o.lit ? '#ffe28a' : '#bfe6ff'; c.fillRect(x, 0.04 * s, 0.17 * s, 0.15 * s);
          c.strokeStyle = '#ffffff'; c.lineWidth = 0.025 * s; c.strokeRect(x, 0.04 * s, 0.17 * s, 0.15 * s);
          c.beginPath(); c.moveTo(x + 0.085 * s, 0.04 * s); c.lineTo(x + 0.085 * s, 0.19 * s); c.moveTo(x, 0.115 * s); c.lineTo(x + 0.17 * s, 0.115 * s); c.stroke();
        };
        if (o.win1) win(-0.33 * s);
        if (o.win2) win(0.16 * s);
      },
    },
    tree: {
      box: [0.8, 1], colors: { col: 'leaf' }, parts: ['apples'],
      draw(c, o, s) {
        c.fillStyle = '#8a5a2b'; c.fillRect(-0.06 * s, 0.05 * s, 0.12 * s, 0.45 * s);
        [[0, -0.18, 0.3], [-0.2, -0.02, 0.2], [0.2, -0.02, 0.2], [0, 0.03, 0.22]].forEach(([x, y, r]) => circ(c, x * s, y * s, r * s, o.col));
        circ(c, -0.1 * s, -0.27 * s, 0.1 * s, 'rgba(255,255,255,.16)');
        if (o.apples) [[-0.15, -0.1], [0.12, -0.24], [0.21, 0.02], [-0.03, 0.06], [-0.22, 0.06]].forEach(([x, y]) => circ(c, x * s, y * s, 0.045 * s, '#e8453c'));
      },
    },
    pine: {
      box: [0.64, 1], parts: ['snow'],
      draw(c, o, s) {
        c.fillStyle = '#7a4a2a'; c.fillRect(-0.05 * s, 0.32 * s, 0.1 * s, 0.18 * s);
        for (let i = 0; i < 3; i++) {
          const top = (-0.5 + i * 0.22) * s, bot = top + 0.42 * s, hw = (0.2 + i * 0.06) * s;
          poly(c, [[-hw, bot], [0, top], [hw, bot]], i % 2 ? '#2a7446' : '#2e7d4f');
          if (o.snow) poly(c, [[-hw * 0.38, top + 0.13 * s], [0, top], [hw * 0.38, top + 0.13 * s]], '#ffffff');
        }
      },
    },
    cloud: {
      box: [1, 0.5], asym: true,
      draw(c, o, s) {
        [[-0.27, 0.06, 0.17], [-0.05, -0.04, 0.2], [0.2, 0.03, 0.18], [0.36, 0.1, 0.12]].forEach(([x, y, r]) => circ(c, x * s, y * s, r * s, o.col || '#ffffff'));
        c.fillStyle = o.col || '#ffffff'; c.fillRect(-0.27 * s, 0.05 * s, 0.63 * s, 0.17 * s);
      },
    },
    sun: {
      box: [1, 1], colors: { col: 'main' }, parts: ['face'], num: [8, 14],
      draw(c, o, s) {
        c.strokeStyle = o.col; c.lineWidth = 0.05 * s; c.lineCap = 'round';
        for (let i = 0; i < o.n; i++) { const a = i / o.n * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 0.35 * s, Math.sin(a) * 0.35 * s); c.lineTo(Math.cos(a) * 0.47 * s, Math.sin(a) * 0.47 * s); c.stroke(); }
        circ(c, 0, 0, 0.3 * s, o.col);
        if (o.face) {
          circ(c, -0.1 * s, -0.06 * s, 0.03 * s, '#7a4a00'); circ(c, 0.1 * s, -0.06 * s, 0.03 * s, '#7a4a00');
          c.strokeStyle = '#7a4a00'; c.lineWidth = 0.025 * s; c.beginPath(); c.arc(0, 0.02 * s, 0.13 * s, 0.2 * Math.PI, 0.8 * Math.PI); c.stroke();
        }
      },
    },
    flower: {
      box: [0.44, 1], colors: { col: 'petal' },
      draw(c, o, s) {
        c.strokeStyle = '#3c9a45'; c.lineWidth = 0.05 * s; c.beginPath(); c.moveTo(0, 0.5 * s); c.lineTo(0, -0.25 * s); c.stroke();
        ell(c, 0.09 * s, 0.2 * s, 0.1 * s, 0.04 * s, '#3c9a45', -0.5);
        for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - Math.PI / 2; circ(c, Math.cos(a) * 0.12 * s, -0.28 * s + Math.sin(a) * 0.12 * s, 0.1 * s, o.col); }
        circ(c, 0, -0.28 * s, 0.08 * s, '#ffd23f');
      },
    },
    balloon: {
      box: [0.5, 1], colors: { col: 'main' },
      draw(c, o, s) {
        c.strokeStyle = '#777'; c.lineWidth = 0.015 * s; c.beginPath(); c.moveTo(0, 0.08 * s); c.quadraticCurveTo(-0.1 * s, 0.3 * s, 0.05 * s, 0.5 * s); c.stroke();
        poly(c, [[0, 0.06 * s], [-0.04 * s, 0.11 * s], [0.04 * s, 0.11 * s]], o.col);
        ell(c, 0, -0.2 * s, 0.22 * s, 0.28 * s, o.col);
        ell(c, -0.08 * s, -0.3 * s, 0.05 * s, 0.09 * s, 'rgba(255,255,255,.45)', 0.4);
      },
    },
    fence: {
      box: o => [o.n * 0.3 * o.s, o.s], colors: { col: 'fence' }, num: [3, 9],
      draw(c, o, s) {
        const w = o.n * 0.3 * s;
        c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-w / 2, -0.12 * s, w, 0.08 * s); c.fillRect(-w / 2, 0.22 * s, w, 0.08 * s);
        c.fillStyle = o.col; c.fillRect(-w / 2, -0.14 * s, w, 0.08 * s); c.fillRect(-w / 2, 0.2 * s, w, 0.08 * s);
        for (let i = 0; i < o.n; i++) {
          const x0 = -w / 2 + i * 0.3 * s + 0.03 * s;
          poly(c, [[x0, 0.5 * s], [x0, -0.38 * s], [x0 + 0.12 * s, -0.5 * s], [x0 + 0.24 * s, -0.38 * s], [x0 + 0.24 * s, 0.5 * s]], o.col);
          c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 0.015 * s; c.stroke();
        }
      },
    },
    boat: {
      box: [1, 0.9], asym: true, colors: { col: 'main', col2: 'sail' }, parts: ['flag'],
      draw(c, o, s) {
        c.fillStyle = '#7a4a2a'; c.fillRect(-0.015 * s, -0.45 * s, 0.03 * s, 0.64 * s);
        poly(c, [[0.03 * s, -0.4 * s], [0.03 * s, 0.13 * s], [0.4 * s, 0.13 * s]], o.col2);
        poly(c, [[-0.03 * s, -0.3 * s], [-0.03 * s, 0.13 * s], [-0.3 * s, 0.13 * s]], o.col2);
        c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 0.012 * s; c.stroke();
        if (o.flag) poly(c, [[-0.015 * s, -0.45 * s], [-0.2 * s, -0.4 * s], [-0.015 * s, -0.35 * s]], '#e8453c');
        poly(c, [[-0.5 * s, 0.17 * s], [0.5 * s, 0.17 * s], [0.36 * s, 0.45 * s], [-0.36 * s, 0.45 * s]], o.col);
        c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-0.44 * s, 0.24 * s, 0.88 * s, 0.035 * s);
      },
    },
    fish: {
      box: [1, 0.6], asym: true, colors: { col: 'fish' }, parts: ['stripe'],
      draw(c, o, s) {
        poly(c, [[-0.28 * s, 0], [-0.5 * s, -0.2 * s], [-0.5 * s, 0.2 * s]], o.col);
        poly(c, [[-0.02 * s, -0.2 * s], [0.12 * s, -0.3 * s], [0.18 * s, -0.18 * s]], o.col);
        ell(c, 0.05 * s, 0, 0.38 * s, 0.24 * s, o.col);
        if (o.stripe) {
          c.save(); c.beginPath(); c.ellipse(0.05 * s, 0, 0.38 * s, 0.24 * s, 0, 0, TAU); c.clip();
          c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(-0.12 * s, -0.3 * s, 0.07 * s, 0.6 * s); c.fillRect(0.06 * s, -0.3 * s, 0.07 * s, 0.6 * s);
          c.restore();
        }
        circ(c, 0.26 * s, -0.05 * s, 0.06 * s, '#ffffff'); circ(c, 0.28 * s, -0.05 * s, 0.03 * s, '#1d1d1d');
      },
    },
    star: {
      box: [1, 1], colors: { col: 'star' },
      draw(c, o, s) {
        const pts = [];
        for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, r = (i % 2 ? 0.2 : 0.48) * s; pts.push([Math.cos(a) * r, Math.sin(a) * r + 0.04 * s]); }
        poly(c, pts, o.col);
      },
    },
    kite: {
      box: [0.6, 1], asym: true, colors: { col: 'main', col2: 'main' },
      draw(c, o, s) {
        c.strokeStyle = '#555'; c.lineWidth = 0.015 * s; c.beginPath(); c.moveTo(0, 0.2 * s); c.bezierCurveTo(0.2 * s, 0.3 * s, -0.1 * s, 0.4 * s, 0.15 * s, 0.5 * s); c.stroke();
        [[0.05, 0.3], [0.08, 0.42]].forEach(([x, y]) => poly(c, [[x * s - 0.05 * s, y * s - 0.03 * s], [x * s + 0.05 * s, y * s + 0.03 * s], [x * s + 0.05 * s, y * s - 0.03 * s], [x * s - 0.05 * s, y * s + 0.03 * s]], o.col2));
        poly(c, [[0, -0.5 * s], [0, 0.2 * s], [-0.28 * s, -0.2 * s]], o.col);
        poly(c, [[0, -0.5 * s], [0.28 * s, -0.2 * s], [0, 0.2 * s]], o.col2);
        c.strokeStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.moveTo(0, -0.5 * s); c.lineTo(0, 0.2 * s); c.moveTo(-0.28 * s, -0.2 * s); c.lineTo(0.28 * s, -0.2 * s); c.stroke();
      },
    },
    car: {
      box: [1, 0.6], asym: true, colors: { col: 'main' },
      draw(c, o, s) {
        poly(c, [[-0.3 * s, -0.02 * s], [-0.18 * s, -0.24 * s], [0.16 * s, -0.24 * s], [0.3 * s, -0.02 * s]], o.col);
        poly(c, [[-0.24 * s, -0.04 * s], [-0.15 * s, -0.2 * s], [-0.02 * s, -0.2 * s], [-0.02 * s, -0.04 * s]], '#cdeeff');
        poly(c, [[0.02 * s, -0.04 * s], [0.02 * s, -0.2 * s], [0.14 * s, -0.2 * s], [0.24 * s, -0.04 * s]], '#cdeeff');
        rrect(c, -0.48 * s, -0.04 * s, 0.96 * s, 0.24 * s, 0.07 * s, o.col);
        circ(c, 0.44 * s, 0.04 * s, 0.035 * s, '#ffe28a');
        [-0.27, 0.27].forEach(x => { circ(c, x * s, 0.2 * s, 0.1 * s, '#2b2b2b'); circ(c, x * s, 0.2 * s, 0.04 * s, '#bbbbbb'); });
      },
    },
    bush: {
      box: [1, 0.6], colors: { col: 'leaf' }, parts: ['berries'],
      draw(c, o, s) {
        [[-0.25, 0.08, 0.2], [0, -0.06, 0.24], [0.25, 0.08, 0.2]].forEach(([x, y, r]) => circ(c, x * s, y * s, r * s, o.col));
        c.fillStyle = o.col; c.fillRect(-0.25 * s, 0.08 * s, 0.5 * s, 0.2 * s);
        circ(c, -0.06 * s, -0.14 * s, 0.08 * s, 'rgba(255,255,255,.15)');
        if (o.berries) [[-0.28, 0.04], [-0.1, 0.12], [0.08, -0.08], [0.22, 0.1], [0.3, 0.0]].forEach(([x, y]) => circ(c, x * s, y * s, 0.035 * s, '#c2185b'));
      },
    },
    snowman: {
      box: [0.62, 1], colors: { col: 'main' }, parts: ['hat'], num: [1, 4],
      draw(c, o, s) {
        c.strokeStyle = '#7a4a2a'; c.lineWidth = 0.025 * s; c.lineCap = 'round';
        c.beginPath(); c.moveTo(-0.13 * s, 0.02 * s); c.lineTo(-0.3 * s, -0.12 * s); c.moveTo(0.13 * s, 0.02 * s); c.lineTo(0.3 * s, -0.12 * s); c.stroke();
        circ(c, 0, 0.3 * s, 0.2 * s, '#ffffff'); circ(c, 0, 0.02 * s, 0.15 * s, '#ffffff'); circ(c, 0, -0.22 * s, 0.11 * s, '#ffffff');
        c.strokeStyle = 'rgba(80,110,140,.25)'; c.lineWidth = 0.01 * s; [[0, 0.3, 0.2], [0, 0.02, 0.15], [0, -0.22, 0.11]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y * s, r * s, 0, TAU); c.stroke(); });
        c.fillStyle = o.col; c.fillRect(-0.12 * s, -0.13 * s, 0.24 * s, 0.05 * s); c.fillRect(0.04 * s, -0.12 * s, 0.05 * s, 0.13 * s);
        circ(c, -0.04 * s, -0.24 * s, 0.015 * s, '#222'); circ(c, 0.04 * s, -0.24 * s, 0.015 * s, '#222');
        poly(c, [[0, -0.21 * s], [0.1 * s, -0.19 * s], [0, -0.18 * s]], '#ff8c2a');
        for (let i = 0; i < o.n; i++) circ(c, 0, (-0.04 + i * 0.055) * s, 0.017 * s, '#333');
        if (o.hat) { c.fillStyle = '#2b2b2b'; c.fillRect(-0.11 * s, -0.35 * s, 0.22 * s, 0.04 * s); c.fillRect(-0.07 * s, -0.5 * s, 0.14 * s, 0.16 * s); }
      },
    },
    planet: {
      box: [1.4, 1], colors: { col: 'planet', col2: 'star' }, parts: ['ring'],
      draw(c, o, s) {
        if (o.ring) { c.strokeStyle = o.col2; c.lineWidth = 0.06 * s; c.beginPath(); c.ellipse(0, 0, 0.68 * s, 0.16 * s, -0.2, Math.PI, TAU); c.stroke(); }
        circ(c, 0, 0, 0.45 * s, o.col);
        c.save(); c.beginPath(); c.arc(0, 0, 0.45 * s, 0, TAU); c.clip();
        circ(c, 0.22 * s, 0.2 * s, 0.45 * s, 'rgba(0,0,0,.18)');
        circ(c, -0.15 * s, -0.12 * s, 0.07 * s, 'rgba(255,255,255,.2)'); circ(c, 0.1 * s, 0.12 * s, 0.05 * s, 'rgba(255,255,255,.15)');
        c.restore();
        if (o.ring) { c.strokeStyle = o.col2; c.lineWidth = 0.06 * s; c.beginPath(); c.ellipse(0, 0, 0.68 * s, 0.16 * s, -0.2, 0, Math.PI); c.stroke(); }
      },
    },
    moon: {
      box: [1, 1], asym: true,
      draw(c, o, s) {
        c.save(); c.beginPath(); c.arc(0, 0, 0.45 * s, 0, TAU); c.clip();
        c.beginPath(); c.arc(0, 0, 0.45 * s, 0, TAU); c.arc(0.22 * s, -0.1 * s, 0.38 * s, 0, TAU, true);
        c.fillStyle = '#fff3c4'; c.fill('evenodd');
        c.restore();
      },
    },
    window: {
      box: [1, 1], colors: { col: 'main' }, parts: ['pot'], only: ['color', 'part'],
      draw(c, o, s) {
        const g = c.createLinearGradient(0, -0.42 * s, 0, 0.32 * s); g.addColorStop(0, o.night ? '#1d2a55' : '#8fd3ff'); g.addColorStop(1, o.night ? '#3a4a80' : '#dff4ff');
        c.fillStyle = g; c.fillRect(-0.4 * s, -0.42 * s, 0.8 * s, 0.74 * s);
        c.strokeStyle = '#ffffff'; c.lineWidth = 0.05 * s; c.strokeRect(-0.4 * s, -0.42 * s, 0.8 * s, 0.74 * s);
        c.lineWidth = 0.03 * s; c.beginPath(); c.moveTo(0, -0.42 * s); c.lineTo(0, 0.32 * s); c.moveTo(-0.4 * s, -0.05 * s); c.lineTo(0.4 * s, -0.05 * s); c.stroke();
        poly(c, [[-0.44 * s, -0.46 * s], [-0.18 * s, -0.46 * s], [-0.3 * s, -0.1 * s], [-0.36 * s, 0.3 * s], [-0.44 * s, 0.3 * s]], o.col);
        poly(c, [[0.44 * s, -0.46 * s], [0.18 * s, -0.46 * s], [0.3 * s, -0.1 * s], [0.36 * s, 0.3 * s], [0.44 * s, 0.3 * s]], o.col);
        c.fillStyle = '#e9e1d0'; c.fillRect(-0.48 * s, 0.31 * s, 0.96 * s, 0.07 * s);
        if (o.pot) {
          poly(c, [[0.14 * s, 0.31 * s], [0.12 * s, 0.2 * s], [0.3 * s, 0.2 * s], [0.28 * s, 0.31 * s]], '#c9643a');
          [[0.16, 0.12], [0.21, 0.08], [0.26, 0.12]].forEach(([x, y]) => ell(c, x * s, y * s + 0.04 * s, 0.03 * s, 0.07 * s, '#3c9a45'));
        }
      },
    },
    frame: {
      box: [1, 0.8], colors: { col: 'pastel' }, parts: ['sun'],
      draw(c, o, s) {
        c.fillStyle = '#8a5a2b'; c.fillRect(-0.5 * s, -0.4 * s, s, 0.8 * s);
        c.fillStyle = o.col; c.fillRect(-0.42 * s, -0.32 * s, 0.84 * s, 0.64 * s);
        if (o.sun) circ(c, 0.22 * s, -0.14 * s, 0.08 * s, '#ffc845');
        poly(c, [[-0.42 * s, 0.32 * s], [-0.16 * s, -0.1 * s], [0.06 * s, 0.32 * s]], '#47b05a');
        poly(c, [[-0.06 * s, 0.32 * s], [0.18 * s, 0.02 * s], [0.42 * s, 0.32 * s]], '#3c8a45');
      },
    },
    building: {
      box: o => [o.s, o.s * o.hr], colors: { col: 'bld' }, custom: 'window', only: ['custom'],
      grid(o) {
        const s = o.s, h = s * o.hr, cols = o.cols || 3, rows = Math.max(2, Math.floor(o.hr * 3.2));
        const mx = 0.14 * s, top = 0.12 * s, gap = 0.08 * s;
        const ww = (s - 2 * mx - (cols - 1) * gap) / cols, wh = Math.min(ww * 1.2, (h - top - 0.16 * s - (rows - 1) * gap) / rows);
        const out = [];
        for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) out.push({ x: -s / 2 + mx + k * (ww + gap), y: -h / 2 + top + r * (wh + gap), w: ww, h: wh });
        return out;
      },
      draw(c, o, s) {
        const h = s * o.hr;
        c.fillStyle = o.col; c.fillRect(-s / 2, -h / 2, s, h);
        c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-s / 2, -h / 2, s, 0.05 * s);
        K.building.grid(o).forEach((w, i) => {
          const lit = (hash(o.seed, i) < 0.5) !== (o.tog === i);
          c.fillStyle = lit ? '#ffe28a' : '#26304a'; c.fillRect(w.x, w.y, w.w, w.h);
        });
      },
    },
    clock: {
      box: [1, 1], colors: { col: 'main' }, custom: 'hand',
      draw(c, o, s) {
        circ(c, 0, 0, 0.48 * s, o.col); circ(c, 0, 0, 0.4 * s, '#fffdf6');
        c.strokeStyle = '#555'; c.lineCap = 'round';
        for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.lineWidth = (i % 3 ? 0.02 : 0.04) * s; c.beginPath(); c.moveTo(Math.cos(a) * 0.32 * s, Math.sin(a) * 0.32 * s); c.lineTo(Math.cos(a) * 0.37 * s, Math.sin(a) * 0.37 * s); c.stroke(); }
        c.strokeStyle = '#222'; c.lineWidth = 0.06 * s; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(o.h) * 0.2 * s, Math.sin(o.h) * 0.2 * s); c.stroke();
        c.lineWidth = 0.035 * s; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(o.m) * 0.31 * s, Math.sin(o.m) * 0.31 * s); c.stroke();
        circ(c, 0, 0, 0.04 * s, '#e8453c');
      },
    },
    lamp: {
      box: [0.36, 1], parts: ['lit'],
      draw(c, o, s) {
        if (o.lit) circ(c, 0, -0.33 * s, 0.17 * s, 'rgba(255,226,138,.35)');
        c.fillStyle = '#3b3b4f'; c.fillRect(-0.025 * s, -0.32 * s, 0.05 * s, 0.8 * s); c.fillRect(-0.09 * s, 0.44 * s, 0.18 * s, 0.06 * s);
        poly(c, [[-0.12 * s, -0.4 * s], [0.12 * s, -0.4 * s], [0.08 * s, -0.46 * s], [-0.08 * s, -0.46 * s]], '#3b3b4f');
        circ(c, 0, -0.34 * s, 0.07 * s, o.lit ? '#ffe28a' : '#8a8fa3');
      },
    },
    weed: {
      box: [0.3, 1], colors: { col: 'weed' },
      draw(c, o, s) {
        c.strokeStyle = o.col; c.lineWidth = 0.07 * s; c.lineCap = 'round';
        c.beginPath(); c.moveTo(0, 0.5 * s);
        for (let t = 0; t <= 1; t += 0.1) c.lineTo(Math.sin(t * 9 + (o.ph || 0)) * 0.07 * s, (0.5 - t * 0.95) * s);
        c.stroke();
        ell(c, 0.06 * s, 0.1 * s, 0.07 * s, 0.03 * s, o.col, -0.6); ell(c, -0.06 * s, -0.15 * s, 0.07 * s, 0.03 * s, o.col, 0.6);
      },
    },
    airballoon: {
      box: [0.7, 1], colors: { col: 'main', col2: 'main' }, num: [2, 5],
      draw(c, o, s) {
        c.strokeStyle = '#6b4a2a'; c.lineWidth = 0.015 * s;
        c.beginPath(); c.moveTo(-0.16 * s, 0.14 * s); c.lineTo(-0.08 * s, 0.36 * s); c.moveTo(0.16 * s, 0.14 * s); c.lineTo(0.08 * s, 0.36 * s); c.stroke();
        rrect(c, -0.1 * s, 0.34 * s, 0.2 * s, 0.16 * s, 0.03 * s, '#a86b3c');
        c.save(); c.beginPath(); c.moveTo(-0.17 * s, 0.14 * s); c.bezierCurveTo(-0.5 * s, -0.1 * s, -0.4 * s, -0.5 * s, 0, -0.5 * s); c.bezierCurveTo(0.4 * s, -0.5 * s, 0.5 * s, -0.1 * s, 0.17 * s, 0.14 * s); c.closePath();
        c.fillStyle = o.col; c.fill(); c.clip();
        c.fillStyle = o.col2; const w = 0.7 * s / (o.n * 2 + 1);
        for (let i = 0; i < o.n; i++) c.fillRect(-0.35 * s + (2 * i + 1) * w, -0.5 * s, w, 0.7 * s);
        c.restore();
        ell(c, -0.14 * s, -0.3 * s, 0.05 * s, 0.1 * s, 'rgba(255,255,255,.3)', 0.4);
      },
    },
    wheel: {
      box: [1, 1], colors: { col: 'main' }, num: [6, 10],
      draw(c, o, s) {
        c.strokeStyle = '#5b5b6b'; c.lineWidth = 0.03 * s;
        c.beginPath(); c.moveTo(0, 0); c.lineTo(-0.28 * s, 0.5 * s); c.moveTo(0, 0); c.lineTo(0.28 * s, 0.5 * s); c.stroke();
        c.lineWidth = 0.02 * s; c.beginPath(); c.arc(0, 0, 0.36 * s, 0, TAU); c.stroke();
        for (let i = 0; i < o.n; i++) { const a = i / o.n * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 0.36 * s, Math.sin(a) * 0.36 * s); c.stroke(); }
        for (let i = 0; i < o.n; i++) { const a = i / o.n * TAU; rrect(c, Math.cos(a) * 0.36 * s - 0.06 * s, Math.sin(a) * 0.36 * s - 0.02 * s, 0.12 * s, 0.1 * s, 0.03 * s, i % 2 ? o.col : '#ffffff'); }
        circ(c, 0, 0, 0.05 * s, '#5b5b6b');
      },
    },
    tent: {
      box: [1, 0.8], asym: true, colors: { col: 'main' }, parts: ['flag', 'door'],
      draw(c, o, s) {
        poly(c, [[-0.5 * s, 0.4 * s], [0, -0.3 * s], [0.5 * s, 0.4 * s]], o.col);
        poly(c, [[0, -0.3 * s], [0.5 * s, 0.4 * s], [0.2 * s, 0.4 * s]], 'rgba(0,0,0,.15)');
        if (o.door) poly(c, [[-0.14 * s, 0.4 * s], [0, 0.1 * s], [0.14 * s, 0.4 * s]], '#3b2a1a');
        c.fillStyle = '#6b4a2a'; c.fillRect(-0.015 * s, -0.4 * s, 0.03 * s, 0.12 * s);
        if (o.flag) poly(c, [[0.015 * s, -0.4 * s], [0.2 * s, -0.36 * s], [0.015 * s, -0.31 * s]], '#ffc845');
      },
    },
    cactus: {
      box: [0.7, 1], parts: ['armL', 'armR', 'bloom'],
      draw(c, o, s) {
        const g = '#3f9a52';
        rrect(c, -0.1 * s, -0.42 * s, 0.2 * s, 0.92 * s, 0.1 * s, g);
        if (o.armL) { rrect(c, -0.32 * s, -0.1 * s, 0.24 * s, 0.1 * s, 0.05 * s, g); rrect(c, -0.32 * s, -0.3 * s, 0.1 * s, 0.3 * s, 0.05 * s, g); }
        if (o.armR) { rrect(c, 0.08 * s, 0.04 * s, 0.24 * s, 0.1 * s, 0.05 * s, g); rrect(c, 0.22 * s, -0.18 * s, 0.1 * s, 0.32 * s, 0.05 * s, g); }
        c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 0.015 * s; c.beginPath(); c.moveTo(0, -0.38 * s); c.lineTo(0, 0.46 * s); c.stroke();
        if (o.bloom) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; circ(c, Math.cos(a) * 0.05 * s, -0.44 * s + Math.sin(a) * 0.05 * s, 0.04 * s, '#ff8fab'); } circ(c, 0, -0.44 * s, 0.03 * s, '#ffd23f'); }
      },
    },
    umbrella: {
      box: [1, 1], asym: true, colors: { col: 'main' },
      draw(c, o, s) {
        c.strokeStyle = '#3b3b3b'; c.lineWidth = 0.035 * s; c.lineCap = 'round';
        c.beginPath(); c.moveTo(0, -0.1 * s); c.lineTo(0, 0.38 * s); c.arc(0.08 * s, 0.38 * s, 0.08 * s, Math.PI, 0, true); c.stroke();
        c.beginPath(); c.moveTo(-0.48 * s, -0.05 * s); c.quadraticCurveTo(-0.45 * s, -0.48 * s, 0, -0.48 * s); c.quadraticCurveTo(0.45 * s, -0.48 * s, 0.48 * s, -0.05 * s);
        for (let i = 3; i >= 0; i--) { const x0 = -0.48 * s + (i + 1) * 0.24 * s; c.quadraticCurveTo(x0 - 0.12 * s, -0.14 * s, x0 - 0.24 * s, -0.05 * s); }
        c.fillStyle = o.col; c.fill();
        c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(0, -0.48 * s); c.quadraticCurveTo(-0.1 * s, -0.25 * s, -0.12 * s, -0.08 * s); c.lineTo(0.12 * s, -0.08 * s); c.quadraticCurveTo(0.1 * s, -0.25 * s, 0, -0.48 * s); c.fill();
      },
    },
    bench: {
      box: [1, 0.5], colors: { col: 'main' },
      draw(c, o, s) {
        c.fillStyle = '#3b3b4f'; c.fillRect(-0.4 * s, 0.05 * s, 0.05 * s, 0.2 * s); c.fillRect(0.35 * s, 0.05 * s, 0.05 * s, 0.2 * s);
        [-0.22, -0.11, 0.0].forEach(y => rrect(c, -0.5 * s, y * s, s, 0.08 * s, 0.02 * s, o.col));
        c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-0.5 * s, 0.06 * s, s, 0.02 * s);
      },
    },
    igloo: {
      box: [1, 0.6], asym: true, parts: ['door'],
      draw(c, o, s) {
        c.beginPath(); c.arc(0, 0.3 * s, 0.48 * s, Math.PI, 0); c.closePath(); c.fillStyle = '#f2f8ff'; c.fill();
        c.strokeStyle = '#b8cde6'; c.lineWidth = 0.015 * s;
        [0.18, 0.06, -0.06].forEach(y => { c.beginPath(); const r = Math.sqrt(Math.max(0, 0.48 * 0.48 - (0.3 - y) * (0.3 - y))) * s; c.moveTo(-r, y * s); c.lineTo(r, y * s); c.stroke(); });
        c.beginPath(); c.arc(0, 0.3 * s, 0.48 * s, Math.PI, 0); c.stroke();
        if (o.door) { c.beginPath(); c.arc(0.22 * s, 0.3 * s, 0.13 * s, Math.PI, 0); c.closePath(); c.fillStyle = '#3a4a6b'; c.fill(); }
      },
    },
    board: {
      box: [1, 0.7], parts: ['sum', 'sun', 'star'],
      draw(c, o, s) {
        c.fillStyle = '#8a5a2b'; c.fillRect(-0.5 * s, -0.35 * s, s, 0.7 * s);
        c.fillStyle = '#2f5a45'; c.fillRect(-0.46 * s, -0.31 * s, 0.92 * s, 0.62 * s);
        c.strokeStyle = '#f4f1ea'; c.fillStyle = '#f4f1ea'; c.lineWidth = 0.015 * s; c.lineCap = 'round';
        if (o.sum) { c.font = `700 ${0.13 * s}px Nunito, sans-serif`; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('2 + 3 = 5', -0.4 * s, -0.16 * s); }
        if (o.sun) { c.beginPath(); c.arc(0.28 * s, -0.12 * s, 0.07 * s, 0, TAU); c.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.beginPath(); c.moveTo(0.28 * s + Math.cos(a) * 0.1 * s, -0.12 * s + Math.sin(a) * 0.1 * s); c.lineTo(0.28 * s + Math.cos(a) * 0.14 * s, -0.12 * s + Math.sin(a) * 0.14 * s); c.stroke(); } }
        if (o.star) { c.beginPath(); for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU - Math.PI / 2, r = (i % 2 ? 0.04 : 0.1) * s; const x = -0.25 * s + Math.cos(a) * r, y = 0.13 * s + Math.sin(a) * r; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
        c.fillStyle = '#f4f1ea'; c.fillRect(0.2 * s, 0.24 * s, 0.1 * s, 0.03 * s);
      },
    },
    rect: { box: o => [o.w, o.h], noDiff: true, draw(c, o) { rrect(c, -o.w / 2, -o.h / 2, o.w, o.h, o.r || 0, o.col); if (o.edge) { c.fillStyle = o.edge; c.fillRect(-o.w / 2, -o.h / 2, o.w, Math.min(10, o.h * 0.25)); } } },
    check: {
      box: o => [o.w, o.h], noDiff: true,
      draw(c, o) { const n = 8, cw = o.w / n, ch = o.h / 5; c.fillStyle = '#ffffff'; c.fillRect(-o.w / 2, -o.h / 2, o.w, o.h); c.fillStyle = o.col; for (let i = 0; i < n; i++) for (let j = 0; j < 5; j++) if ((i + j) % 2) c.fillRect(-o.w / 2 + i * cw, -o.h / 2 + j * ch, cw, ch); },
    },
    emoji: {
      box: [1, 1],
      draw(c, o, s) { const px = s * (Math.abs(c.getTransform().a) || 1); c.drawImage(sprite(o.e, px), -s / 2, -s / 2, s, s); },
    },
  };

  function boxSize(o) { const b = K[o.k].box; return typeof b === 'function' ? b(o) : [b[0] * o.s, b[1] * o.s]; }
  function bbox(o) { const [w, h] = boxSize(o); return [o.x - w / 2, o.y - h / 2, o.x + w / 2, o.y + h / 2]; }
  const hit = (a, b, pad = 0) => a[0] - pad < b[2] && a[2] + pad > b[0] && a[1] - pad < b[3] && a[3] + pad > b[1];
  function drawObj(c, o) {
    if (o.gone) return;
    c.save(); c.translate(o.x, o.y);
    if (o.flip) c.scale(-1, 1);
    if (o.rot) c.rotate(o.rot);
    K[o.k].draw(c, o, o.s);
    c.restore();
  }

  // ---------------------------------------------------------------- sahne kurma
  function builder(R) {
    const objs = [];
    return {
      objs,
      add(o) { objs.push(o); return o; },
      // bölgede boş yer bulup yerleştirir; bulamazsa eklemez
      put(o, zone, pad = 6) {
        for (let t = 0; t < 70; t++) {
          o.x = between(R, zone[0], zone[2]); o.y = between(R, zone[1], zone[3]);
          const b = bbox(o);
          if (b[0] < 4 || b[1] < 4 || b[2] > W - 4 || b[3] > H - 4) continue;
          if (objs.some(p => !p.layer && hit(bbox(p), b, pad))) continue;
          objs.push(o); return o;
        }
        return null;
      },
      many(n, zone, make, pad) { for (let i = 0; i < n; i++) this.put(make(i), zone, pad); },
    };
  }
  const em = (R, list, a, b) => ({ k: 'emoji', e: pick(R, list), s: between(R, a, b) });
  function skyGrad(c, top, bot, y1) { const g = c.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, W, y1); }
  function hill(c, cx, cy, rx, ry, col) { ell(c, cx, cy, rx, ry, col); }
  function dots(c, R, n, zone, cols, r0, r1) { for (let i = 0; i < n; i++) circ(c, between(R, zone[0], zone[2]), between(R, zone[1], zone[3]), between(R, r0, r1), pick(R, cols)); }

  const SCENES = {
    ciftlik(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#7fcbff', '#dff4ff', H * 0.5);
        hill(c, 200, H * 0.55, 420, 120, '#8fd36e'); hill(c, 760, H * 0.56, 380, 100, '#7cc860');
        c.fillStyle = '#7ccf5c'; c.fillRect(0, H * 0.52, W, H);
        dots(c, r, 260, [0, H * 0.55, W, H], ['#6fbf50', '#8fdc6c'], 1, 3);
        c.strokeStyle = '#e6c88f'; c.lineWidth = 46; c.lineCap = 'round'; c.beginPath(); c.moveTo(330, H * 0.56); c.bezierCurveTo(360, 450, 520, 480, 560, H + 20); c.stroke();
      };
      B.add({ k: 'sun', x: 800, y: 80, s: 110, col: '#ffc845', n: 12, face: true });
      B.many(3, [60, 40, 680, 160], () => ({ k: 'cloud', s: between(R, 110, 160) }));
      B.add({ k: 'house', x: 210, y: 270, s: 190, col: '#d24b3e', col2: '#7a3b2e', dc: '#f4f1ea', chim: false, win1: true, win2: true });
      B.add({ k: 'house', x: 650, y: 285, s: 130, col: '#ffe7b0', col2: '#2f5d8a', dc: '#8a5a2b', chim: true, win1: true, win2: true });
      B.add({ k: 'tree', x: 70, y: 255, s: 150, col: '#3c9a45', apples: false });
      B.add({ k: 'tree', x: 820, y: 275, s: 140, col: '#3c9a45', apples: true });
      B.add({ k: 'tree', x: 470, y: 245, s: 110, col: '#3c9a45', apples: false });
      B.add({ k: 'fence', x: 420, y: 372, s: 56, n: 6, col: '#ffffff' });
      B.put({ k: 'emoji', e: '🚜', s: 70 }, [600, 380, 860, 560]);
      B.many(9, [30, 395, 870, 575], () => em(R, ['🐄', '🐑', '🐖', '🐓', '🐤', '🐕', '🦆', '🐐'], 44, 62));
      B.many(7, [30, 400, 870, 580], () => ({ k: 'flower', s: between(R, 44, 60), col: pick(R, PAL.petal) }));
      return { bg, objs: B.objs };
    },
    sahil(R) {
      const B = builder(R);
      const sea = H * 0.42, sand = H * 0.7;
      const bg = (c, r) => {
        skyGrad(c, '#6ec6ff', '#e6f7ff', sea);
        hill(c, 120, sea + 10, 260, 110, '#79b860');
        const g = c.createLinearGradient(0, sea, 0, sand); g.addColorStop(0, '#2aa7c9'); g.addColorStop(1, '#69d3dc'); c.fillStyle = g; c.fillRect(0, sea, W, sand - sea);
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 3;
        for (let i = 0; i < 40; i++) { const x = r() * W, y = between(r, sea + 10, sand - 10); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 12, y - 5, x + 24, y); c.stroke(); }
        c.fillStyle = '#f3d9a4'; c.beginPath(); c.moveTo(0, sand); for (let x = 0; x <= W; x += 20) c.lineTo(x, sand + Math.sin(x / 70) * 6); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        dots(c, r, 300, [0, sand + 10, W, H], ['#e8c88b', '#fff1d0'], 1, 2.5);
      };
      B.add({ k: 'sun', x: 820, y: 70, s: 100, col: '#ffc845', n: 10, face: false });
      B.add({ k: 'house', x: 70, y: 200, s: 90, col: '#ffffff', col2: '#2f5d8a', dc: '#2f7fd6', chim: false, win1: true, win2: true });
      B.add({ k: 'house', x: 170, y: 190, s: 100, col: '#ffe0b2', col2: '#c9503a', dc: '#8a5a2b', chim: true, win1: true, win2: false });
      B.many(2, [300, 30, 700, 130], () => ({ k: 'cloud', s: between(R, 120, 150) }));
      B.many(2, [260, 120, 760, 210], () => ({ k: 'kite', s: between(R, 70, 85), col: pick(R, PAL.main), col2: pick(R, PAL.main) }));
      B.many(3, [280, 30, 880, 220], () => ({ k: 'emoji', e: '🕊️', s: between(R, 34, 44), flip: R() < 0.5 }));
      B.many(4, [60, sea + 40, 860, sand - 40], () => ({ k: 'boat', s: between(R, 90, 120), col: pick(R, PAL.main), col2: pick(R, PAL.sail), flag: R() < 0.5, flip: R() < 0.5 }));
      B.put({ k: 'emoji', e: '🐬', s: 54 }, [60, sea + 30, 860, sand - 30]);
      B.many(4, [40, sand + 20, 860, H - 40], () => ({ k: 'emoji', e: '⛱️', s: between(R, 70, 86) }));
      B.many(10, [30, sand + 10, 870, H - 20], () => em(R, ['🏐', '🐚', '🦀', '⭐', '🍉', '🕶️', '🥤', '🧢'], 36, 50));
      return { bg, objs: B.objs };
    },
    bahce(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#9fdcff', '#eefaff', H * 0.4);
        c.fillStyle = '#4f9e4a'; c.beginPath(); c.moveTo(0, H * 0.4); for (let x = 0; x <= W; x += 30) c.lineTo(x, H * 0.33 + Math.sin(x / 40) * 10); c.lineTo(W, H * 0.42); c.lineTo(0, H * 0.42); c.fill();
        c.fillStyle = '#8bd36a'; c.fillRect(0, H * 0.4, W, H);
        dots(c, r, 300, [0, H * 0.42, W, H], ['#7cc85c', '#9ee07c'], 1, 3);
        c.strokeStyle = '#555'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 40); c.quadraticCurveTo(W / 2, 110, W, 30); c.stroke();
        for (let i = 1; i < 18; i++) { const t = i / 18, x = W * t, y = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 110 + t * t * 30; poly(c, [[x - 14, y], [x + 14, y], [x, y + 26]], PAL.main[i % 8]); }
      };
      B.add({ k: 'rect', x: 450, y: 420, w: 380, h: 120, col: '#ffffff', edge: '#ff8fab', r: 10, layer: true });
      B.add({ k: 'tree', x: 90, y: 250, s: 170, col: '#3c9a45', apples: true });
      B.add({ k: 'tree', x: 820, y: 240, s: 150, col: '#3c9a45', apples: false });
      B.add({ k: 'sun', x: 700, y: 140, s: 80, col: '#ffc845', n: 12, face: true });
      B.add({ k: 'kite', x: 330, y: 170, s: 90, col: '#2f7fd6', col2: '#ffc845' });
      B.many(5, [180, 150, 720, 300], () => ({ k: 'balloon', s: between(R, 70, 90), col: pick(R, PAL.main) }));
      B.many(6, [290, 380, 610, 460], () => em(R, ['🎂', '🍰', '🧁', '🍩', '🍪', '🥤', '🧃', '🍓', '🍎'], 38, 48), 2);
      B.many(4, [20, 360, 880, 580], () => ({ k: 'bush', s: between(R, 90, 120), col: '#3c9a45', berries: R() < 0.5 }));
      B.many(3, [40, 380, 860, 580], () => ({ k: 'emoji', e: pick(R, ['🎁', '📦']), s: between(R, 44, 56) }));
      B.many(7, [20, 360, 880, 590], () => ({ k: 'flower', s: between(R, 44, 58), col: pick(R, PAL.petal) }));
      B.many(3, [40, 360, 860, 590], () => em(R, ['🐕', '🐈', '🦋', '🐞'], 40, 52));
      return { bg, objs: B.objs };
    },
    denizalti(R) {
      const B = builder(R);
      const floor = H * 0.8;
      const bg = (c, r) => {
        skyGrad(c, '#3bb4e0', '#0b4f7a', H);
        c.fillStyle = 'rgba(255,255,255,.07)';
        for (let i = 0; i < 6; i++) { const x = between(r, 0, W); poly(c, [[x, 0], [x + 60, 0], [x + 220, H], [x + 120, H]]); c.fill(); }
        c.fillStyle = '#e9cf91'; c.beginPath(); c.moveTo(0, floor); for (let x = 0; x <= W; x += 20) c.lineTo(x, floor + Math.sin(x / 60) * 10); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        dots(c, r, 200, [0, floor + 10, W, H], ['#d9bc7a', '#f5e2b0'], 1, 3);
        for (let i = 0; i < 6; i++) ell(c, between(r, 0, W), floor + 20, between(r, 40, 70), between(r, 22, 34), pick(r, ['#7c8a96', '#8e9aa4']));
        for (let i = 0; i < 40; i++) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.beginPath(); c.arc(r() * W, r() * floor, between(r, 2, 6), 0, TAU); c.stroke(); }
      };
      B.many(8, [30, floor - 30, 870, H - 60], () => { const s = between(R, 90, 130); return { k: 'weed', s, col: pick(R, PAL.weed), ph: R() * 6 }; });
      B.many(9, [40, 40, 860, floor - 60], () => ({ k: 'fish', s: between(R, 70, 110), col: pick(R, PAL.fish), stripe: R() < 0.5, flip: R() < 0.5 }));
      B.many(3, [40, 40, 860, floor - 40], () => em(R, ['🐢', '🐡', '🐙', '🦑', '🐠'], 52, 66));
      B.many(9, [30, floor - 10, 870, H - 16], () => em(R, ['🐚', '⭐', '🦀', '🐙'], 36, 48));
      B.put({ k: 'emoji', e: '🏺', s: 60 }, [40, floor - 20, 860, H - 30]);
      return { bg, objs: B.objs };
    },
    mutfak(R) {
      const B = builder(R);
      const counter = H * 0.62;
      const bg = (c) => {
        c.fillStyle = '#fff4e0'; c.fillRect(0, 0, W, counter);
        c.strokeStyle = 'rgba(180,140,90,.25)'; c.lineWidth = 2;
        for (let y = 40; y < counter; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
        for (let x = 40; x < W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, counter); c.stroke(); }
        c.fillStyle = '#b97a45'; c.fillRect(0, counter, W, 18); c.fillStyle = '#d9a066'; c.fillRect(0, counter + 18, W, H);
        c.strokeStyle = 'rgba(90,50,20,.3)';
        for (let x = 0; x < W; x += 150) { c.strokeRect(x + 10, counter + 40, 130, H - counter - 50); circ(c, x + 75, counter + 60, 5, '#7a4a2a'); }
      };
      B.add({ k: 'window', x: 660, y: 170, s: 200, col: '#e8453c', pot: true });
      B.add({ k: 'clock', x: 400, y: 80, s: 90, col: '#2f7fd6', h: -Math.PI / 2 + 0.5, m: Math.PI / 2 });
      B.add({ k: 'rect', x: 180, y: 250, w: 300, h: 14, col: '#a86b3c', layer: true });
      B.add({ k: 'rect', x: 180, y: 140, w: 300, h: 14, col: '#a86b3c', layer: true });
      B.many(4, [40, 100, 320, 112], () => em(R, ['🍯', '🧂', '🥫', '☕'], 44, 48), 2);
      B.many(4, [40, 210, 320, 222], () => em(R, ['🍯', '🧂', '🥫', '☕', '📚'], 44, 48), 2);
      B.add({ k: 'frame', x: 420, y: 240, s: 120, col: '#bfe6ff', sun: true });
      B.many(12, [30, counter - 30, 870, counter - 10], () => em(R, ['🍎', '🍌', '🍇', '🥕', '🍅', '🧀', '🍞', '🍲', '🍳', '🍋', '🍆', '🥑'], 44, 56), 3);
      B.many(4, [30, counter + 50, 870, H - 30], () => em(R, ['🐈', '🧺', '🥄', '🍴'], 44, 54));
      return { bg, objs: B.objs };
    },
    kis(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#1d2b5a', '#5a73b0', H * 0.55);
        dots(c, r, 80, [0, 0, W, H * 0.45], ['#ffffff', '#cfe0ff'], 0.6, 1.6);
        hill(c, 250, H * 0.62, 480, 130, '#e9f1fb'); hill(c, 720, H * 0.6, 400, 120, '#dfe9f7');
        c.fillStyle = '#f4f8fd'; c.fillRect(0, H * 0.6, W, H);
        c.strokeStyle = '#d6e2f0'; c.lineWidth = 3;
        for (let i = 0; i < 20; i++) { const x = r() * W, y = between(r, H * 0.62, H); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20, y - 6, x + 40, y); c.stroke(); }
      };
      B.add({ k: 'moon', x: 110, y: 80, s: 90 });
      B.many(5, [200, 30, 880, 200], () => ({ k: 'star', s: between(R, 34, 46), col: '#ffd23f' }));
      B.add({ k: 'house', x: 300, y: 290, s: 150, col: '#c9503a', col2: '#5b5b6b', dc: '#8a5a2b', chim: true, win1: true, win2: true, snow: true, lit: true });
      B.add({ k: 'house', x: 600, y: 300, s: 130, col: '#ffe0b2', col2: '#2f5d8a', dc: '#2f7fd6', chim: false, win1: true, win2: true, snow: true, lit: true });
      B.many(7, [20, 220, 880, 400], () => ({ k: 'pine', s: between(R, 100, 140), snow: R() < 0.7 }));
      B.many(2, [80, 380, 820, 560], () => ({ k: 'snowman', s: between(R, 110, 130), col: pick(R, PAL.main), hat: R() < 0.6, n: 3 }));
      B.many(2, [20, 360, 880, 560], () => ({ k: 'lamp', s: between(R, 120, 140), lit: true }));
      B.many(7, [30, 380, 870, 585], () => em(R, ['🦌', '🐧', '🛷', '🎿', '⛸️', '🦊', '🎁'], 40, 56));
      return { bg, objs: B.objs };
    },
    oyuncak(R) {
      const B = builder(R);
      const floor = H * 0.64;
      const bg = (c) => {
        c.fillStyle = '#e6dcff'; c.fillRect(0, 0, W, floor);
        for (let y = 20; y < floor; y += 40) for (let x = (y / 40 % 2) * 20 + 10; x < W; x += 40) circ(c, x, y, 3, 'rgba(155,89,208,.25)');
        c.fillStyle = '#c99668'; c.fillRect(0, floor, W, H);
        c.fillStyle = 'rgba(90,50,20,.2)'; for (let y = floor; y < H; y += 30) c.fillRect(0, y, W, 2);
        c.fillStyle = '#fff'; c.fillRect(0, floor - 12, W, 12);
        ell(c, 450, H * 0.84, 300, 70, '#ff8fab'); ell(c, 450, H * 0.84, 250, 52, '#ffc2d1');
      };
      B.add({ k: 'window', x: 150, y: 150, s: 190, col: '#47b05a', pot: false });
      B.add({ k: 'frame', x: 760, y: 110, s: 110, col: '#ffe0b2', sun: true });
      B.add({ k: 'frame', x: 760, y: 240, s: 90, col: '#dcf5c4', sun: false });
      B.add({ k: 'rect', x: 450, y: 165, w: 300, h: 14, col: '#a86b3c', layer: true });
      B.add({ k: 'rect', x: 450, y: 300, w: 300, h: 14, col: '#a86b3c', layer: true });
      B.many(5, [310, 120, 590, 130], () => em(R, ['🧸', '🤖', '🦖', '🚂', '🎲', '📚', '🎮'], 40, 48), 2);
      B.many(4, [310, 256, 590, 266], () => em(R, ['🧩', '🎨', '🥁', '🎺', '🎸', '✏️', '🚀'], 40, 48), 2);
      B.many(3, [40, 30, 880, 330], () => ({ k: 'star', s: between(R, 36, 44), col: pick(R, PAL.star) }));
      B.many(2, [300, 330, 860, 360], () => ({ k: 'balloon', s: between(R, 70, 80), col: pick(R, PAL.main) }));
      B.many(3, [40, floor + 20, 860, H - 40], () => ({ k: 'car', s: between(R, 80, 100), col: pick(R, PAL.main), flip: R() < 0.5 }));
      B.many(10, [30, floor + 10, 870, H - 20], () => em(R, ['🧸', '🤖', '🦖', '🚂', '🎲', '🧩', '⚽', '🏀', '🎾', '🚗', '🚌', '🎁', '🥁'], 38, 52));
      return { bg, objs: B.objs };
    },
    uzay(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#05061a', '#251a52', H);
        for (let i = 0; i < 5; i++) { const g = c.createRadialGradient(0, 0, 0, 0, 0, 200); g.addColorStop(0, pick(r, ['rgba(200,107,250,.18)', 'rgba(47,127,214,.18)', 'rgba(255,143,171,.14)'])); g.addColorStop(1, 'rgba(0,0,0,0)'); c.save(); c.translate(r() * W, r() * H); c.fillStyle = g; c.fillRect(-200, -200, 400, 400); c.restore(); }
        dots(c, r, 260, [0, 0, W, H], ['#ffffff', '#cfd8ff', '#ffe9c4'], 0.5, 1.6);
      };
      B.many(5, [60, 60, 840, 540], () => ({ k: 'planet', s: between(R, 70, 110), col: pick(R, PAL.planet), col2: pick(R, PAL.star), ring: R() < 0.5 }), 14);
      B.add({ k: 'moon', x: 820, y: 80, s: 80 });
      B.many(3, [40, 40, 860, 560], () => em(R, ['🚀', '🛸', '🛰️'], 52, 64));
      B.many(5, [30, 30, 870, 570], () => em(R, ['🌕', '🌖', '🌗', '🌘', '👽', '☄️', '🌍'], 36, 48));
      B.many(12, [20, 20, 880, 580], () => ({ k: 'star', s: between(R, 28, 42), col: pick(R, PAL.star) }));
      return { bg, objs: B.objs };
    },
    sehir(R) {
      const B = builder(R);
      const road = H * 0.8;
      const bg = (c, r) => {
        skyGrad(c, '#0c1233', '#3a2f6b', road);
        dots(c, r, 70, [0, 0, W, H * 0.35], ['#ffffff'], 0.5, 1.4);
        c.fillStyle = '#1a1f40'; for (let x = 0; x < W; x += 50) { const h = between(r, 120, 260); c.fillRect(x, road - h, 46, h); }
        c.fillStyle = '#2a2a33'; c.fillRect(0, road, W, H - road);
        c.fillStyle = '#555863'; c.fillRect(0, road, W, 12);
        c.fillStyle = '#ffd23f'; for (let x = 20; x < W; x += 90) c.fillRect(x, road + 55, 50, 6);
      };
      B.add({ k: 'moon', x: 90, y: 70, s: 80 });
      const xs = [70, 205, 340, 500, 650, 805];
      xs.forEach((x, i) => { const hr = between(R, 1.6, 2.6), s = between(R, 105, 125); B.add({ k: 'building', x, y: road - s * hr / 2, s, hr, cols: 3, col: pick(R, PAL.bld), seed: 101 + i * 13, tog: -1 }); });
      B.many(4, [180, 25, 880, 120], () => ({ k: 'star', s: between(R, 26, 34), col: '#ffd23f' }), 4);
      B.many(3, [20, road + 20, 880, H - 20], () => ({ k: 'car', s: between(R, 90, 110), col: pick(R, PAL.main), flip: R() < 0.5 }));
      B.many(4, [10, road - 140, 890, road - 40], () => ({ k: 'lamp', s: between(R, 90, 110), lit: R() < 0.8 }), 2);
      B.many(4, [20, road + 14, 880, H - 14], () => em(R, ['🐈', '🚲', '🛵', '🚕'], 34, 46));
      B.many(2, [20, 20, 880, 160], () => em(R, ['🦉', '🕊️'], 30, 38));
      return { bg, objs: B.objs };
    },
    piknik(R) {
      const B = builder(R);
      const bg = (c, r) => {
        c.fillStyle = '#2f6b3a'; c.fillRect(0, 0, W, H * 0.34);
        for (let i = 0; i < 40; i++) circ(c, r() * W, between(r, 0, H * 0.32), between(r, 30, 60), pick(r, ['#2a5e33', '#3a7a44', '#357340']));
        c.fillStyle = '#86c95f'; c.fillRect(0, H * 0.32, W, H);
        dots(c, r, 380, [0, H * 0.34, W, H], ['#76b94f', '#9ad873'], 1, 3);
        c.strokeStyle = '#d9b97a'; c.lineWidth = 40; c.lineCap = 'round'; c.beginPath(); c.moveTo(-20, H * 0.5); c.bezierCurveTo(250, H * 0.4, 400, H * 0.9, W + 20, H * 0.75); c.stroke();
      };
      B.add({ k: 'check', x: 520, y: 400, w: 260, h: 150, col: '#e8453c', layer: true });
      B.many(5, [20, 120, 880, 230], () => ({ k: 'tree', s: between(R, 120, 150), col: pick(R, ['#3c9a45', '#3c9a45', '#e88b2a']), apples: R() < 0.4 }), 2);
      B.many(4, [20, 100, 880, 260], () => ({ k: 'pine', s: between(R, 110, 140), snow: false }), 2);
      B.many(6, [400, 330, 640, 470], () => em(R, ['🧺', '🥪', '🍓', '🍉', '🧃', '🍎', '🧀', '🥧'], 36, 46), 2);
      B.many(3, [20, 260, 880, 590], () => ({ k: 'bush', s: between(R, 90, 110), col: '#3c9a45', berries: R() < 0.5 }));
      B.many(9, [20, 250, 880, 590], () => em(R, ['🦊', '🐿️', '🦔', '🐇', '🦉', '🐞', '🦋', '🐌', '🐝', '🐦'], 34, 48));
      B.many(6, [20, 260, 880, 590], () => em(R, ['🍄', '🌰', '🌷', '🌻', '🌼'], 32, 42));
      B.many(6, [20, 260, 880, 590], () => ({ k: 'flower', s: between(R, 40, 52), col: pick(R, PAL.petal) }));
      return { bg, objs: B.objs };
    },
    lunapark(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#ffb3c7', '#ffe9b8', H * 0.6);
        c.fillStyle = '#9bd17a'; c.fillRect(0, H * 0.6, W, H);
        c.fillStyle = '#e8d3a8'; c.fillRect(0, H * 0.7, W, 70);
        dots(c, r, 200, [0, H * 0.6, W, H], ['#8bc46a', '#acdc8a'], 1, 3);
        for (let i = 0; i < 6; i++) { const x = 60 + i * 160; poly(c, [[x - 40, H * 0.6], [x, H * 0.48], [x + 40, H * 0.6]], PAL.main[i % 8]); }
      };
      B.add({ k: 'wheel', x: 690, y: 210, s: 300, col: '#e8453c', n: 8 });
      B.many(3, [40, 30, 520, 120], () => ({ k: 'cloud', s: between(R, 100, 130) }));
      B.many(5, [40, 120, 520, 330], () => ({ k: 'balloon', s: between(R, 70, 90), col: pick(R, PAL.main) }));
      B.many(3, [40, 380, 860, 590], () => em(R, ['🎠', '🎪', '🎢'], 70, 84));
      B.many(10, [20, 360, 880, 590], () => em(R, ['🍭', '🍬', '🍫', '🍿', '🌭', '🥨', '🎈', '🧸', '🎟️', '🍦'], 36, 50));
      B.many(2, [40, 370, 860, 590], () => ({ k: 'bench', s: between(R, 90, 110), col: pick(R, PAL.main) }));
      return { bg, objs: B.objs };
    },
    kamp(R) {
      const B = builder(R);
      const lake = H * 0.5;
      const bg = (c, r) => {
        skyGrad(c, '#ff9a6b', '#ffe1a8', lake);
        c.fillStyle = '#4b6d8a'; poly(c, [[0, lake], [160, 170], [320, lake]]); c.fill(); poly(c, [[220, lake], [430, 130], [640, lake]], '#5c7f9c'); poly(c, [[520, lake], [740, 180], [W, lake]], '#4b6d8a');
        poly(c, [[430, 130], [470, 180], [390, 180]], '#ffffff');
        c.fillStyle = '#4a9bc4'; c.fillRect(0, lake, W, 110);
        c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; for (let i = 0; i < 30; i++) { const x = r() * W, y = between(r, lake + 8, lake + 100); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 26, y); c.stroke(); }
        c.fillStyle = '#6fb24f'; c.fillRect(0, lake + 110, W, H);
        dots(c, r, 220, [0, lake + 115, W, H], ['#5fa242', '#82c462'], 1, 3);
      };
      B.add({ k: 'sun', x: 120, y: 70, s: 90, col: '#ffc845', n: 10, face: false });
      B.many(2, [60, lake + 20, 860, lake + 90], () => ({ k: 'boat', s: between(R, 80, 100), col: pick(R, PAL.main), col2: pick(R, PAL.sail), flag: R() < 0.5, flip: R() < 0.5 }));
      B.many(2, [60, lake + 20, 860, lake + 100], () => em(R, ['🦆', '🐟'], 36, 44));
      B.many(3, [40, lake + 150, 860, H - 50], () => ({ k: 'tent', s: between(R, 120, 150), col: pick(R, PAL.main), flag: R() < 0.6, door: true, flip: R() < 0.5 }));
      B.many(5, [20, lake + 120, 880, H - 40], () => ({ k: 'pine', s: between(R, 100, 130), snow: false }));
      B.many(9, [20, lake + 130, 880, H - 16], () => em(R, ['🔥', '🎒', '🔦', '🧭', '🍄', '🦔', '🐿️', '🦉', '🌲', '🥾', '🌰'], 34, 48));
      return { bg, objs: B.objs };
    },
    pastane(R) {
      const B = builder(R);
      const bg = (c) => {
        c.fillStyle = '#ffe9ef'; c.fillRect(0, 0, W, H);
        for (let x = 0; x < W; x += 60) { c.fillStyle = (x / 60) % 2 ? '#ffd5e0' : '#ffe9ef'; c.fillRect(x, 0, 60, 70); }
        for (let i = 0; i < 16; i++) { const x = i * 60 + 30; c.beginPath(); c.arc(x, 70, 30, 0, Math.PI); c.fillStyle = i % 2 ? '#ffd5e0' : '#ff8fab'; c.fill(); }
        c.fillStyle = '#d9a066'; c.fillRect(0, H * 0.82, W, H);
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(40, 120, W - 80, H * 0.68);
      };
      [210, 340, 470].forEach(y => B.add({ k: 'rect', x: 450, y, w: 800, h: 14, col: '#a86b3c', layer: true }));
      B.many(6, [70, 160, 830, 172], () => em(R, ['🎂', '🍰', '🧁', '🍩', '🍪', '🥧', '🍮'], 50, 58), 4);
      B.many(6, [70, 290, 830, 302], () => em(R, ['🥐', '🍞', '🥨', '🥖', '🧀', '🍩'], 50, 58), 4);
      B.many(6, [70, 420, 830, 432], () => em(R, ['🍫', '🍬', '🍭', '🍓', '🍒', '🍪', '☕'], 48, 56), 4);
      B.add({ k: 'clock', x: 820, y: 40, s: 64, col: '#9b59d0', h: 0.4, m: -Math.PI / 2 });
      B.many(4, [30, H * 0.83, 870, H - 14], () => em(R, ['🐈', '🧺', '🛍️', '🌷'], 38, 48));
      return { bg, objs: B.objs };
    },
    sinif(R) {
      const B = builder(R);
      const floor = H * 0.62;
      const bg = (c) => {
        c.fillStyle = '#fff1d6'; c.fillRect(0, 0, W, floor);
        c.fillStyle = '#e6c9a0'; c.fillRect(0, floor - 60, W, 60);
        c.fillStyle = '#c9915c'; c.fillRect(0, floor, W, H);
        c.strokeStyle = 'rgba(90,50,20,.2)'; c.lineWidth = 2; for (let x = 0; x < W; x += 70) { c.beginPath(); c.moveTo(x, floor); c.lineTo(x - 60, H); c.stroke(); }
      };
      B.add({ k: 'board', x: 430, y: 160, s: 360, sum: true, sun: true, star: true });
      B.add({ k: 'clock', x: 720, y: 70, s: 80, col: '#e8453c', h: Math.PI * 0.1, m: -Math.PI / 2 });
      B.add({ k: 'window', x: 110, y: 160, s: 170, col: '#2f7fd6', pot: true });
      B.add({ k: 'frame', x: 790, y: 210, s: 120, col: '#dcf5c4', sun: true });
      for (let i = 0; i < 3; i++) B.add({ k: 'rect', x: 170 + i * 280, y: 470, w: 220, h: 90, col: '#b97a45', edge: '#d9a066', r: 6, layer: true });
      for (let i = 0; i < 3; i++) B.many(3, [80 + i * 280, 455, 260 + i * 280, 485], () => em(R, ['📚', '✏️', '🎨', '🍎', '📏', '🖍️', '📐', '🎒', '🌍', '✂️'], 40, 50), 3);
      B.many(4, [20, 300, 880, 340], () => em(R, ['🌍', '🎒', '🌵', '🐠', '🏆', '🎺'], 44, 54));
      B.many(3, [20, floor + 20, 880, H - 16], () => em(R, ['⚽', '🏀', '🎒', '📚'], 36, 46));
      return { bg, objs: B.objs };
    },
    col(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#ffcf70', '#fff3c9', H * 0.5);
        poly(c, [[480, H * 0.5], [600, 140], [720, H * 0.5]], '#e3b467'); poly(c, [[600, 140], [720, H * 0.5], [650, H * 0.5]], '#c9974f');
        poly(c, [[680, H * 0.5], [760, 220], [840, H * 0.5]], '#e3b467'); poly(c, [[760, 220], [840, H * 0.5], [800, H * 0.5]], '#c9974f');
        c.fillStyle = '#f0cf8a'; c.beginPath(); c.moveTo(0, H * 0.48); for (let x = 0; x <= W; x += 30) c.lineTo(x, H * 0.48 + Math.sin(x / 120) * 18); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        c.strokeStyle = 'rgba(180,130,60,.3)'; c.lineWidth = 3; for (let i = 0; i < 16; i++) { const x = r() * W, y = between(r, H * 0.55, H); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 40, y - 10, x + 80, y); c.stroke(); }
        ell(c, 170, H * 0.62, 130, 34, '#3ab0d0');
      };
      B.add({ k: 'sun', x: 110, y: 80, s: 110, col: '#ff8c2a', n: 12, face: false });
      B.many(5, [20, 220, 880, 560], () => ({ k: 'cactus', s: between(R, 90, 130), armL: R() < 0.7, armR: R() < 0.7, bloom: R() < 0.5 }));
      B.many(2, [40, 250, 860, 420], () => ({ k: 'tree', s: between(R, 110, 130), col: '#3c9a45', apples: false }));
      B.many(2, [40, 300, 860, 560], () => em(R, ['🐪', '🐫'], 70, 84));
      B.many(9, [20, 320, 880, 590], () => em(R, ['🦂', '🦎', '🐍', '🌴', '🏺', '🧭', '💎', '🐚', '🌵'], 34, 48));
      B.many(2, [200, 30, 880, 160], () => em(R, ['🦅', '🕊️'], 36, 44));
      return { bg, objs: B.objs };
    },
    sonbahar(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#9fc9e8', '#f1e6d0', H * 0.45);
        c.fillStyle = '#b5a55a'; c.fillRect(0, H * 0.42, W, H);
        dots(c, r, 500, [0, H * 0.42, W, H], ['#e88b2a', '#d24b3e', '#d9c23a', '#a5602a'], 2, 5);
        c.strokeStyle = '#c9b48a'; c.lineWidth = 50; c.lineCap = 'round'; c.beginPath(); c.moveTo(-20, H * 0.75); c.bezierCurveTo(300, H * 0.6, 600, H * 0.95, W + 20, H * 0.7); c.stroke();
      };
      B.many(2, [60, 30, 840, 130], () => ({ k: 'cloud', s: between(R, 110, 140) }));
      B.many(6, [20, 140, 880, 330], () => ({ k: 'tree', s: between(R, 130, 170), col: pick(R, ['#e88b2a', '#d24b3e', '#d9c23a', '#3c9a45']), apples: R() < 0.3 }), 4);
      B.many(2, [40, 330, 860, 560], () => ({ k: 'bench', s: between(R, 110, 130), col: pick(R, ['#8a5a2b', '#2f7fd6', '#47b05a']) }));
      B.many(2, [20, 300, 880, 560], () => ({ k: 'lamp', s: between(R, 110, 130), lit: false }));
      B.many(12, [20, 300, 880, 590], () => em(R, ['🍂', '🍁', '🐿️', '🦔', '🌰', '🍄', '🎃', '🐦', '🐕', '🍎', '🍐', '☂️'], 32, 46));
      return { bg, objs: B.objs };
    },
    bostan(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#8fd3ff', '#e8f7ff', H * 0.3);
        c.fillStyle = '#86c95f'; c.fillRect(0, H * 0.3, W, H);
        for (let i = 0; i < 4; i++) { const y = H * 0.4 + i * 90; c.fillStyle = '#8a5a3a'; c.fillRect(30, y, W - 60, 46); dots(c, r, 60, [30, y, W - 30, y + 46], ['#6b4428', '#a06c48'], 1, 3); }
      };
      B.add({ k: 'sun', x: 820, y: 60, s: 90, col: '#ffc845', n: 12, face: true });
      B.add({ k: 'house', x: 110, y: 110, s: 130, col: '#ffe0b2', col2: '#c9503a', dc: '#47b05a', chim: true, win1: true, win2: true });
      B.add({ k: 'fence', x: 520, y: 140, s: 50, n: 9, col: '#8a5a2b' });
      B.many(2, [250, 20, 740, 90], () => ({ k: 'cloud', s: between(R, 100, 120) }));
      for (let i = 0; i < 4; i++) B.many(5, [50, H * 0.4 + i * 90 + 10, 850, H * 0.4 + i * 90 + 30], () => em(R, ['🥕', '🥬', '🥦', '🍅', '🌽', '🥒', '🍆', '🧅', '🥔', '🎃', '🍓'], 40, 50), 6);
      B.many(4, [20, 180, 880, 590], () => em(R, ['🐌', '🐞', '🦋', '🐝', '🐇', '🐓', '🧺', '🌻'], 34, 44));
      return { bg, objs: B.objs };
    },
    kutup(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#0f1f45', '#2a6d8a', H * 0.5);
        c.strokeStyle = 'rgba(120,255,190,.25)'; c.lineWidth = 30;
        for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(0, 80 + i * 40); c.bezierCurveTo(300, 20 + i * 50, 600, 160 + i * 30, W, 60 + i * 40); c.stroke(); }
        dots(c, r, 60, [0, 0, W, H * 0.4], ['#ffffff'], 0.5, 1.4);
        c.fillStyle = '#1d4f78'; c.fillRect(0, H * 0.5, W, 80);
        c.fillStyle = '#eef6ff'; c.beginPath(); c.moveTo(0, H * 0.6); for (let x = 0; x <= W; x += 40) c.lineTo(x, H * 0.62 + Math.sin(x / 50) * 8); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        for (let i = 0; i < 5; i++) { const x = between(r, 0, W); poly(c, [[x, H * 0.57], [x + 30, H * 0.5 - 10], [x + 70, H * 0.57]], '#dbeafa'); }
      };
      B.add({ k: 'moon', x: 800, y: 80, s: 80 });
      B.many(4, [40, 30, 760, 180], () => ({ k: 'star', s: between(R, 28, 38), col: '#ffffff' }));
      B.many(2, [40, 330, 860, 470], () => ({ k: 'igloo', s: between(R, 150, 180), door: true, flip: R() < 0.5 }));
      B.many(2, [40, 360, 860, 560], () => ({ k: 'snowman', s: between(R, 100, 120), col: pick(R, PAL.main), hat: R() < 0.6, n: 3 }));
      B.many(2, [40, H * 0.5 + 10, 860, H * 0.5 + 60], () => em(R, ['🐳', '🐬', '🐟'], 40, 50));
      B.many(10, [20, 370, 880, 590], () => em(R, ['🐧', '🦌', '🐟', '🎿', '🛷', '❄️', '🧤', '🧣', '⛸️', '🐻'], 34, 48));
      return { bg, objs: B.objs };
    },
    balonlar(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#5fb8ff', '#fff0d0', H * 0.8);
        hill(c, 200, H * 0.95, 400, 120, '#7cc860'); hill(c, 700, H, 380, 130, '#6db850');
        c.fillStyle = '#6db850'; c.fillRect(0, H * 0.92, W, H);
      };
      B.many(7, [40, 40, 860, 470], () => ({ k: 'airballoon', s: between(R, 110, 160), col: pick(R, PAL.main), col2: pick(R, PAL.main), n: 3 }), 10);
      B.many(4, [20, 20, 880, 520], () => ({ k: 'cloud', s: between(R, 90, 130) }));
      B.many(7, [20, 20, 880, 540], () => em(R, ['🕊️', '🦅', '🐦', '🪁', '🎈', '✈️', '🚁'], 32, 44));
      B.many(4, [20, 530, 880, 590], () => em(R, ['🏠', '🌳', '🐄', '🐑'], 32, 40));
      return { bg, objs: B.objs };
    },
    yagmur(R) {
      const B = builder(R);
      const bg = (c, r) => {
        skyGrad(c, '#6f7f96', '#b9c4d2', H * 0.5);
        c.fillStyle = '#4a5468'; for (let x = 0; x < W; x += 70) { const h = between(r, 80, 180); c.fillRect(x, H * 0.5 - h, 64, h); }
        c.fillStyle = '#7c8794'; c.fillRect(0, H * 0.5, W, H);
        c.fillStyle = '#9aa4b0'; c.fillRect(0, H * 0.5, W, 30);
        for (let i = 0; i < 6; i++) ell(c, between(r, 40, W - 40), between(r, H * 0.62, H - 30), between(r, 50, 90), between(r, 14, 22), 'rgba(140,190,230,.6)');
        c.strokeStyle = 'rgba(220,235,255,.55)'; c.lineWidth = 2; for (let i = 0; i < 180; i++) { const x = r() * W, y = r() * H; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 6, y + 18); c.stroke(); }
      };
      B.many(3, [40, 20, 860, 140], () => ({ k: 'cloud', s: between(R, 130, 170), col: '#e3e8ee' }));
      B.many(6, [30, 260, 870, 560], () => ({ k: 'umbrella', s: between(R, 80, 110), col: pick(R, PAL.main), flip: R() < 0.5 }));
      B.many(2, [20, 260, 880, 400], () => ({ k: 'lamp', s: between(R, 110, 130), lit: true }));
      B.many(2, [40, 420, 860, 590], () => ({ k: 'car', s: between(R, 90, 110), col: pick(R, PAL.main), flip: R() < 0.5 }));
      B.many(9, [20, 300, 880, 590], () => em(R, ['🐸', '🦆', '🐌', '🐕', '🥾', '🚲', '☔', '🌂', '🐈'], 32, 46));
      return { bg, objs: B.objs };
    },
  };

  // ---------------------------------------------------------------- bölümler
  const WEIGHTS = {
    Kolay: { remove: 4, add: 2, color: 4, swap: 3, flip: 1, scale: 2, part: 1, num: 1, custom: 1 },
    Orta: { remove: 3, add: 2, color: 3, swap: 3, flip: 2, scale: 2, part: 2, num: 2, custom: 2 },
    Zor: { remove: 2, add: 1, color: 2, swap: 2, flip: 3, scale: 2, part: 3, num: 3, custom: 3 },
    Uzman: { remove: 1, add: 1, color: 2, swap: 2, flip: 3, scale: 1, part: 4, num: 4, custom: 4 },
  };
  const LEVELS = [
    { id: 'ciftlik', name: 'Çiftlik Sabahı', diff: 'Kolay', scene: 'ciftlik', seed: 101, minS: 44, par: 60 },
    { id: 'sahil', name: 'Sahil Kasabası', diff: 'Kolay', scene: 'sahil', seed: 202, minS: 40, par: 65 },
    { id: 'bahce', name: 'Bahçe Partisi', diff: 'Kolay', scene: 'bahce', seed: 303, minS: 40, par: 70 },
    { id: 'denizalti', name: 'Mercan Bahçesi', diff: 'Orta', scene: 'denizalti', seed: 404, minS: 36, par: 80 },
    { id: 'mutfak', name: 'Ninenin Mutfağı', diff: 'Orta', scene: 'mutfak', seed: 505, minS: 36, par: 85 },
    { id: 'kis', name: 'Karlı Köy', diff: 'Orta', scene: 'kis', seed: 606, minS: 34, par: 90 },
    { id: 'oyuncak', name: 'Oyuncak Odası', diff: 'Orta', scene: 'oyuncak', seed: 707, minS: 34, par: 95 },
    { id: 'uzay', name: 'Uzay Yolculuğu', diff: 'Zor', scene: 'uzay', seed: 808, minS: 28, par: 105 },
    { id: 'sehir', name: 'Gece Şehri', diff: 'Zor', scene: 'sehir', seed: 909, minS: 26, par: 110 },
    { id: 'piknik', name: 'Orman Pikniği', diff: 'Zor', scene: 'piknik', seed: 1001, minS: 30, par: 120 },
    { id: 'lunapark', name: 'Lunapark', diff: 'Orta', scene: 'lunapark', seed: 1101, minS: 34, par: 90 },
    { id: 'kamp', name: 'Göl Kenarında Kamp', diff: 'Orta', scene: 'kamp', seed: 1202, minS: 34, par: 95 },
    { id: 'pastane', name: 'Pastane Vitrini', diff: 'Orta', scene: 'pastane', seed: 1303, minS: 34, par: 95 },
    { id: 'sinif', name: 'Sınıfta Bir Gün', diff: 'Zor', scene: 'sinif', seed: 1404, minS: 30, par: 105 },
    { id: 'col', name: 'Çöl Vahası', diff: 'Zor', scene: 'col', seed: 1505, minS: 30, par: 110 },
    { id: 'sonbahar', name: 'Sonbahar Parkı', diff: 'Zor', scene: 'sonbahar', seed: 1606, minS: 28, par: 115 },
    { id: 'bostan', name: 'Sebze Bahçesi', diff: 'Zor', scene: 'bostan', seed: 1707, minS: 28, par: 120 },
    { id: 'kutup', name: 'Kutup Gecesi', diff: 'Uzman', scene: 'kutup', seed: 1808, minS: 26, par: 120 },
    { id: 'balonlar', name: 'Balon Festivali', diff: 'Uzman', scene: 'balonlar', seed: 1909, minS: 26, par: 125 },
    { id: 'yagmur', name: 'Yağmurlu Sokak', diff: 'Uzman', scene: 'yagmur', seed: 2002, minS: 24, par: 130 },
  ];

  function mutations(o) {
    const k = K[o.k], out = ['remove', 'add', 'scale'];
    if (k.colors) out.push('color');
    if (k.asym || (o.k === 'emoji' && ASYM.has(o.e))) out.push('flip');
    if (o.k === 'emoji' && swapGroup(o.e)) out.push('swap');
    if (k.parts && k.parts.some(p => p in o)) out.push('part');
    if (k.num) out.push('num');
    if (k.custom) out.push('custom');
    return k.only ? out.filter(t => k.only.includes(t)) : out;
  }
  function mutate(o, type, R) {
    const m = Object.assign({}, o);
    let box = null;
    if (type === 'scale') m.s = o.s * (o.s < 70 ? 1.45 : 0.68);
    else if (type === 'color') { const keys = Object.keys(K[o.k].colors).filter(c => c in o); const key = pick(R, keys); m[key] = otherColor(K[o.k].colors[key], o[key], R); }
    else if (type === 'flip') m.flip = !o.flip;
    else if (type === 'swap') m.e = pick(R, swapGroup(o.e).filter(e => e !== o.e));
    else if (type === 'part') { const p = pick(R, K[o.k].parts.filter(p => p in o)); m[p] = !o[p]; }
    else if (type === 'num') { const [a, b] = K[o.k].num; m.n = o.n - 1 >= a ? (o.n + 1 <= b && R() < 0.4 ? o.n + 1 : o.n - (o.k === 'sun' ? 2 : 1)) : o.n + 1; m.n = clamp(m.n, a, b); }
    else if (type === 'custom' && K[o.k].custom === 'window') {
      const g = K.building.grid(o), i = Math.floor(R() * g.length), w = g[i];
      m.tog = i; box = [o.x + w.x, o.y + w.y, o.x + w.x + w.w, o.y + w.y + w.h];
    } else if (type === 'custom' && K[o.k].custom === 'hand') m.h = o.h + (R() < 0.5 ? 1 : -1) * Math.PI / 2;
    return { m, box };
  }

  const levelCache = new Map();
  function buildLevel(L) {
    if (levelCache.has(L.id)) return levelCache.get(L.id);
    const scene = SCENES[L.scene](rng(L.seed));
    const A = scene.objs.map(o => Object.assign({}, o));
    const Rd = rng(L.seed * 31 + 7);
    const boxes = A.map(bbox);
    const weights = WEIGHTS[L.diff];
    const used = {}, canGrow = [];
    let chosen = [];
    for (const minS of [L.minS, L.minS * 0.8, 0]) {
      chosen = [];
      const cand = A.map((o, i) => i).filter(i => {
        const o = A[i], b = boxes[i], big = Math.max(...boxSize(o));
        if (K[o.k].noDiff || o.k === 'emoji' && big < minS || big < minS) return false;
        if (b[0] < 6 || b[1] < 6 || b[2] > W - 6 || b[3] > H - 6) return false;
        const grown = [o.x - (b[2] - b[0]) * 0.75, o.y - (b[3] - b[1]) * 0.75, o.x + (b[2] - b[0]) * 0.75, o.y + (b[3] - b[1]) * 0.75];
        canGrow[i] = grown[0] > 4 && grown[1] > 4 && grown[2] < W - 4 && grown[3] < H - 4;
        for (let j = i + 1; j < A.length; j++) {
          if (K[A[j].k].noDiff) continue;
          if (hit(b, boxes[j], 2)) return false;
          if (hit(grown, boxes[j], 2)) canGrow[i] = false;
        }
        return true;
      });
      for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(Rd() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
      // önce çeşitlilik: aynı türden en fazla 2 nesne (emoji için 4), sonra kalanlarla tamamla
      const kindOf = i => A[i].k, cap = i => (kindOf(i) === 'emoji' ? 4 : 2);
      for (const limited of [true, false]) {
        for (const i of cand) {
          if (chosen.length >= DIFFS) break;
          if (chosen.includes(i) || chosen.some(j => hit(boxes[i], boxes[j], 22))) continue;
          if (limited && chosen.filter(j => kindOf(j) === kindOf(i)).length >= cap(i)) continue;
          chosen.push(i);
        }
      }
      if (chosen.length >= DIFFS) break;
    }
    const Bobjs = A.map(o => Object.assign({}, o));
    const diffs = chosen.map(i => {
      const o = A[i], types = mutations(o).filter(t => t !== 'scale' || o.s >= 70 || canGrow[i]);
      const ws = types.map(t => (weights[t] || 1) / (1 + 2 * (used[t] || 0)));
      let r = Rd() * ws.reduce((a, b) => a + b, 0), type = types[0];
      for (let k = 0; k < types.length; k++) { r -= ws[k]; if (r <= 0) { type = types[k]; break; } }
      used[type] = (used[type] || 0) + 1;
      let box;
      if (type === 'remove') { Bobjs[i].gone = true; box = boxes[i]; }
      else if (type === 'add') { A[i] = Object.assign({}, o, { gone: true }); box = boxes[i]; }
      else {
        const res = mutate(o, type, Rd);
        Bobjs[i] = res.m;
        if (res.box) box = res.box;
        else { const b2 = bbox(res.m), b = boxes[i]; box = [Math.min(b[0], b2[0]), Math.min(b[1], b2[1]), Math.max(b[2], b2[2]), Math.max(b[3], b2[3])]; }
      }
      const cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
      const r0 = Math.max(24, Math.hypot(box[2] - box[0], box[3] - box[1]) / 2 * 0.9);
      return { i, type, box, cx, cy, r: Math.min(r0, 110) };
    });
    const res = { bg: scene.bg, A, B: Bobjs, diffs };
    levelCache.set(L.id, res);
    return res;
  }

  function renderScene(c, L, objs, scale) {
    const lv = buildLevel(L);
    c.save(); c.scale(scale, scale);
    c.beginPath(); c.rect(0, 0, W, H); c.clip();
    lv.bg(c, rng(L.seed + 99));
    objs.forEach(o => drawObj(c, o));
    c.restore();
  }
  function drawThumb(L, canvas) {
    const c = canvas.getContext('2d');
    const s = Math.max(canvas.width / W, canvas.height / H);
    renderScene(c, L, buildLevel(L).A, s);
  }
  function drawCover(canvas) {
    const c = canvas.getContext('2d'), cw = canvas.width, ch = canvas.height;
    const g = c.createLinearGradient(0, 0, cw, ch); g.addColorStop(0, '#5b4bc4'); g.addColorStop(1, '#2b2463');
    c.fillStyle = g; c.fillRect(0, 0, cw, ch);
    const L = LEVELS[0], lv = buildLevel(L), pw = cw * 0.44, ph = pw * H / W, y = (ch - ph) / 2 - ch * 0.07;
    [[cw * 0.04, lv.A], [cw * 0.52, lv.B]].forEach(([x, objs]) => {
      c.save(); c.translate(x, y);
      c.fillStyle = '#fff'; c.fillRect(-3, -3, pw + 6, ph + 6);
      renderScene(c, L, objs, pw / W);
      c.restore();
    });
    const d = lv.diffs[0];
    c.strokeStyle = '#ffc845'; c.lineWidth = Math.max(2, cw / 120);
    c.beginPath(); c.arc(cw * 0.52 + d.cx * pw / W, y + d.cy * ph / H, Math.max(8, d.r * pw / W), 0, TAU); c.stroke();
    c.fillStyle = '#ffc845'; c.font = `700 ${Math.round(ch * 0.13)}px Fredoka, sans-serif`; c.textAlign = 'center';
    c.textBaseline = 'alphabetic'; c.fillText('7 FARK', cw / 2, ch * 0.92);
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
      found(n) { const b = 600 + n * 50; tone(b, 0.12, 'triangle', 0.18); tone(b * 1.5, 0.18, 'triangle', 0.14, 0.08); },
      miss() { tone(160, 0.18, 'square', 0.06); },
      hint() { [880, 1175, 1568].forEach((f, i) => tone(f, 0.18, 'sine', 0.08, i * 0.06)); },
      done() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.16, i * 0.12)); },
    };
  }

  // ---------------------------------------------------------------- oyun
  function mount(host, api) {
    const KEY = api.gameStoreKey;
    const save = Object.assign({ v: 1, sound: true, levels: {} }, api.store.get(KEY, {}));
    const persist = () => api.store.set(KEY, save);
    const unlocked = i => i === 0 || !!(save.levels[LEVELS[i - 1].id] || {}).cleared;
    const audio = makeAudio();
    const sfx = (name, arg) => { if (save.sound) try { audio[name](arg); } catch (e) { /* ses kapalı */ } };

    const root = document.createElement('div');
    root.className = 'fb-root';
    root.tabIndex = 0;
    host.appendChild(root);

    let play = null, raf = 0;
    const cleanups = [];
    const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); cleanups.push(() => el.removeEventListener(ev, fn, opt)); };
    const starsHTML = n => '<b>★</b>'.repeat(n) + '★'.repeat(3 - n);

    // ---------------- bölüm listesi
    function showMap() {
      stopPlay();
      const totalStars = LEVELS.reduce((s, L) => s + ((save.levels[L.id] || {}).stars || 0), 0);
      root.innerHTML = `
        <div class="fb-map">
          <div class="fb-map-head">
            <div><h2 class="fb-display">Farkı Bul</h2><p>İki resim arasındaki 7 farkı bul. Her bölüm biraz daha zor.</p></div>
            <div class="fb-total"><span class="fb-stars"><b>★</b></span> ${totalStars} / ${LEVELS.length * 3}</div>
          </div>
          <div class="fb-levels">
            ${LEVELS.map((L, i) => {
              const s = save.levels[L.id] || {}, open = unlocked(i);
              return `<button class="fb-level" data-i="${i}" ${open ? '' : 'disabled'} aria-label="${L.name}${open ? '' : ' (kilitli)'}">
                <span class="fb-thumb"><canvas width="330" height="220"></canvas>${open ? '' : '<span class="fb-lock">🔒</span>'}</span>
                <span class="fb-level-body">
                  <span class="fb-level-title fb-display">${i + 1}. ${L.name}</span>
                  <span class="fb-level-meta"><span class="fb-diff ${L.diff.toLowerCase()}">${L.diff}</span><span class="fb-stars">${starsHTML(s.stars || 0)}</span></span>
                  <span class="fb-level-meta"><span>${s.cleared ? `En iyi: ${fmtTime(s.bestTime)} · ${(s.bestScore || 0).toLocaleString('tr-TR')} puan` : (open ? 'Başla' : 'Önceki bölümü bitir')}</span></span>
                </span>
              </button>`;
            }).join('')}
          </div>
          <div class="fb-map-foot"><button class="fb-link" data-reset>İlerlemeyi sıfırla</button></div>
        </div>`;
      const btns = [...root.querySelectorAll('.fb-level')];
      btns.forEach(b => b.addEventListener('click', () => { audio.unlock(); startLevel(+b.dataset.i); }));
      // küçük resimleri sırayla çiz (açılışı bekletmesin)
      let k = 0;
      const step = () => { if (!root.isConnected || play || k >= btns.length) return; drawThumb(LEVELS[k], btns[k].querySelector('canvas')); k++; setTimeout(step, 0); };
      step();
      const rb = root.querySelector('[data-reset]');
      let armed = 0;
      rb.addEventListener('click', () => {
        if (!armed) { rb.textContent = 'Emin misin? Tüm yıldızlar silinir. Onaylamak için tekrar tıkla'; armed = setTimeout(() => { armed = 0; rb.textContent = 'İlerlemeyi sıfırla'; }, 4000); return; }
        clearTimeout(armed); save.levels = {}; persist(); showMap();
      });
    }

    // ---------------- bölüm
    function startLevel(idx) {
      stopPlay();
      const L = LEVELS[idx], lv = buildLevel(L);
      root.innerHTML = `
        <div class="fb-play">
          <div class="fb-top">
            <button class="fb-iconbtn" data-act="map" aria-label="Bölüm listesine dön" title="Bölümler">←</button>
            <span class="fb-title fb-display">${idx + 1}. ${L.name}</span>
            <span class="fb-dots" aria-label="Bulunan farklar" data-v="dots">${'<i></i>'.repeat(lv.diffs.length)}</span>
            <div class="fb-stats">
              <span class="fb-stat fb-hide-sm" title="Süre">⏱ <span data-v="time">00:00</span></span>
              <span class="fb-stat" title="Puan">★ <span data-v="score">0</span><span class="fb-combo" data-v="combo"></span></span>
              <button class="fb-hint" data-act="hint" aria-label="İpucu" title="İpucu (H)">💡<span class="fb-hint-count" data-v="hints"></span></button>
              <button class="fb-iconbtn" data-act="sound" aria-label="Sesi aç/kapat"></button>
            </div>
          </div>
          <div class="fb-boards">
            <div class="fb-board" data-b="0"><canvas aria-label="Birinci resim"></canvas></div>
            <div class="fb-board" data-b="1"><canvas aria-label="İkinci resim"></canvas></div>
            <div class="fb-toast" data-v="toast"></div>
          </div>
        </div>`;
      const boardsEl = root.querySelector('.fb-boards');
      const boards = [...root.querySelectorAll('.fb-board')].map(el => ({ el, cv: el.querySelector('canvas'), img: document.createElement('canvas') }));
      const V = s => root.querySelector(`[data-v="${s}"]`);
      const P = play = {
        L, lv, boards, found: new Set(), foundAt: {}, marks: [], ring: null, time: 0, score: 0, hintsLeft: HINTS, hintsUsed: 0, misses: 0,
        combo: 0, lastFind: 0, missTimes: [], lockUntil: 0, modal: false, done: false, last: performance.now(), dirty: true, scale: 1, dpr: 1,
      };
      root._fbPlay = P; // test ve hata ayıklama için

      function layout() {
        const r = boardsEl.getBoundingClientRect(), gap = 10, pad = 10;
        const aw = Math.max(50, r.width - pad * 2), ah = Math.max(50, r.height - pad * 2);
        const side = Math.min((aw - gap) / 2 / W, ah / H), stack = Math.min(aw / W, (ah - gap) / 2 / H);
        const horiz = side >= stack, s = Math.max(side, stack);
        const bw = Math.floor(W * s), bh = Math.floor(H * s);
        const totalW = horiz ? bw * 2 + gap : bw, totalH = horiz ? bh : bh * 2 + gap;
        const x0 = (r.width - totalW) / 2, y0 = (r.height - totalH) / 2;
        P.scale = s; P.dpr = Math.min(window.devicePixelRatio || 1, 2);
        boards.forEach((b, i) => {
          Object.assign(b.el.style, { width: bw + 'px', height: bh + 'px', left: (horiz ? x0 + i * (bw + gap) : x0) + 'px', top: (horiz ? y0 : y0 + i * (bh + gap)) + 'px' });
          const pw = Math.round(bw * P.dpr), ph = Math.round(bh * P.dpr);
          if (b.cv.width !== pw || b.cv.height !== ph) {
            b.cv.width = b.img.width = pw; b.cv.height = b.img.height = ph;
            renderScene(b.img.getContext('2d'), L, i ? lv.B : lv.A, pw / W);
          }
        });
        P.dirty = true;
      }
      const ro = new ResizeObserver(layout);
      ro.observe(boardsEl);
      cleanups.push(() => ro.disconnect());
      layout();

      // ---- arayüz
      function updHud() {
        V('time').textContent = fmtTime(P.time);
        V('score').textContent = P.score.toLocaleString('tr-TR');
        V('combo').textContent = P.combo > 1 && performance.now() - P.lastFind < COMBO_WINDOW ? ` x${P.combo}` : '';
        V('hints').textContent = P.hintsLeft;
        root.querySelector('.fb-hint').disabled = P.hintsLeft <= 0 || P.done;
        root.querySelector('[data-act="sound"]').textContent = save.sound ? '🔊' : '🔇';
        [...V('dots').children].forEach((d, i) => d.classList.toggle('on', i < P.found.size));
      }
      let toastT = 0;
      function toast(msg, ms = 1600) {
        const el = V('toast'); el.textContent = msg; el.classList.add('show');
        clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), ms);
      }

      function tap(bi, e) {
        if (P.modal || P.done) return;
        const now = performance.now();
        if (now < P.lockUntil) return;
        const r = boards[bi].cv.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
        const tol = 10 / P.scale; // dokunma payı (ekran pikseline göre)
        let best = -1, bd = Infinity;
        lv.diffs.forEach((d, k) => {
          if (P.found.has(k)) return;
          const b = d.box, pad = Math.max(10, tol);
          const inBox = x >= b[0] - pad && x <= b[2] + pad && y >= b[1] - pad && y <= b[3] + pad;
          const dist = Math.hypot(x - d.cx, y - d.cy);
          if ((inBox || dist <= d.r + tol) && dist < bd) { bd = dist; best = k; }
        });
        if (best >= 0) found(best); else miss(bi, x, y);
      }
      function found(k) {
        const now = performance.now();
        P.found.add(k); P.foundAt[k] = now;
        P.combo = now - P.lastFind < COMBO_WINDOW ? Math.min(P.combo + 1, 5) : 1;
        P.lastFind = now;
        P.score += 100 + (P.combo - 1) * 50;
        if (P.ring && P.ring.k === k) P.ring = null;
        sfx('found', P.found.size);
        const left = lv.diffs.length - P.found.size;
        if (left) toast(left === 1 ? 'Son bir fark kaldı!' : `Harika! ${left} fark kaldı`, 1200);
        P.dirty = true; updHud();
        if (!left) { P.done = true; setTimeout(complete, 700); }
      }
      function miss(bi, x, y) {
        const now = performance.now();
        P.misses++; P.combo = 0; P.lastFind = 0;
        P.score = Math.max(0, P.score - 20);
        P.marks.push({ bi, x, y, t: now });
        P.missTimes = P.missTimes.filter(t => now - t < 3000); P.missTimes.push(now);
        sfx('miss');
        if (P.missTimes.length >= 4) {
          P.lockUntil = now + 3000; P.missTimes = [];
          const lk = document.createElement('div'); lk.className = 'fb-lockout'; lk.innerHTML = '<span>Rastgele tıklama! 3 saniye bekle</span>';
          boardsEl.appendChild(lk); setTimeout(() => lk.remove(), 3000);
        }
        P.dirty = true; updHud();
      }
      function useHint() {
        if (P.modal || P.done) return;
        if (P.hintsLeft <= 0) { toast('Bu bölümde ipucun kalmadı'); return; }
        const left = lv.diffs.map((d, k) => k).filter(k => !P.found.has(k));
        if (!left.length) return;
        const k = left[Math.floor(Math.random() * left.length)];
        P.hintsLeft--; P.hintsUsed++;
        P.ring = { k, t: performance.now() };
        sfx('hint'); updHud(); P.dirty = true;
      }

      function complete() {
        const bonus = Math.max(0, Math.round((L.par * 1.5 - P.time) * 10));
        P.score += bonus;
        let stars = 1;
        if (P.time <= L.par * 1.7 && P.hintsUsed <= 1) stars = 2;
        if (P.time <= L.par && P.hintsUsed === 0 && P.misses <= 3) stars = 3;
        const s = save.levels[L.id] = save.levels[L.id] || {};
        s.cleared = true;
        s.stars = Math.max(s.stars || 0, stars);
        s.bestTime = Math.min(s.bestTime || Infinity, Math.floor(P.time));
        s.bestScore = Math.max(s.bestScore || 0, P.score);
        persist(); updHud(); sfx('done');
        const next = LEVELS[idx + 1];
        P.modal = true;
        const m = document.createElement('div'); m.className = 'fb-modal';
        m.innerHTML = `<div class="fb-card" role="dialog" aria-label="Bölüm tamamlandı">
          <h3 class="fb-display">7 farkın hepsini buldun!</h3>
          <div class="fb-bigstars">${starsHTML(stars)}</div>
          <div class="fb-results">
            <div>Süre<b>${fmtTime(P.time)}</b></div><div>Puan<b>${P.score.toLocaleString('tr-TR')}</b></div>
            <div>Hız bonusu<b>+${bonus.toLocaleString('tr-TR')}</b></div><div>İpucu / Hata<b>${P.hintsUsed} / ${P.misses}</b></div>
          </div>
          <p class="fb-note">3 yıldız için ${fmtTime(L.par)} altında, ipucusuz ve en fazla 3 hatayla bitir.</p>
          <div class="fb-actions">
            <button class="fb-btn alt" data-m="map">Bölümler</button>
            <button class="fb-btn alt" data-m="again">Tekrar oyna</button>
            ${next ? '<button class="fb-btn" data-m="next">Sonraki bölüm →</button>' : ''}
          </div>
          ${next ? '' : '<p class="fb-note">Tüm bölümleri bitirdin 🎉 Yıldızları tamamlamayı dene.</p>'}</div>`;
        boardsEl.appendChild(m);
        m.addEventListener('click', e => {
          const a = e.target.closest('[data-m]'); if (!a) return;
          if (a.dataset.m === 'next') startLevel(idx + 1); else if (a.dataset.m === 'again') startLevel(idx); else showMap();
        });
      }

      function intro() {
        P.modal = true;
        const m = document.createElement('div'); m.className = 'fb-modal';
        m.innerHTML = `<div class="fb-card fb-intro" role="dialog" aria-label="${L.name}">
          <span class="fb-diff ${L.diff.toLowerCase()}">${L.diff}</span>
          <h3 class="fb-display">${L.name}</h3>
          <p>İki resim neredeyse aynı ama aralarında <b>7 fark</b> var. Farkı gördüğün yere iki resimden birinde dokun.</p>
          <p>Rengi değişen, kaybolan, yön değiştiren ya da büyüyüp küçülen şeylere dikkat et. Takılırsan 💡 ipucu var.</p>
          <div class="fb-actions"><button class="fb-btn" data-m="go">Başla</button></div></div>`;
        boardsEl.appendChild(m);
        m.querySelector('[data-m="go"]').addEventListener('click', () => { audio.unlock(); m.remove(); P.modal = false; P.last = performance.now(); root.focus({ preventScroll: true }); });
      }

      boards.forEach((b, i) => on(b.cv, 'pointerdown', e => { if (e.button > 0) return; e.preventDefault(); audio.unlock(); tap(i, e); }));
      on(root, 'keydown', e => {
        if (play !== P || P.modal) return;
        if (e.key === 'h' || e.key === 'H' || e.key === 'i' || e.key === 'İ') { e.preventDefault(); useHint(); }
      });
      root.querySelector('.fb-play').addEventListener('click', e => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        audio.unlock();
        const a = b.dataset.act;
        if (a === 'map') showMap();
        else if (a === 'sound') { save.sound = !save.sound; persist(); updHud(); }
        else if (a === 'hint') useHint();
      });

      function frame(now) {
        if (play !== P) return;
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.25, (now - P.last) / 1000); P.last = now;
        if (!P.modal && !P.done && !document.hidden) {
          const before = Math.floor(P.time); P.time += dt;
          if (Math.floor(P.time) !== before) updHud();
        }
        if (P.ring && now - P.ring.t > 3500) { P.ring = null; P.dirty = true; }
        P.marks = P.marks.filter(m => now - m.t < 700);
        const anim = P.ring || P.marks.length || Object.values(P.foundAt).some(t => now - t < 400);
        if (!P.dirty && !anim) return;
        P.dirty = false;
        boards.forEach((b, bi) => draw(b, bi, now));
      }
      function draw(b, bi, now) {
        const c = b.cv.getContext('2d'), k = b.cv.width / W;
        c.setTransform(1, 0, 0, 1, 0, 0);
        c.drawImage(b.img, 0, 0);
        c.setTransform(k, 0, 0, k, 0, 0);
        const px = 1 / P.scale; // 1 ekran pikseli
        lv.diffs.forEach((d, i) => {
          if (!P.found.has(i)) return;
          const t = clamp((now - P.foundAt[i]) / 400, 0, 1), e = 1 - Math.pow(1 - t, 3);
          const r = d.r * (0.5 + 0.5 * e) + 4 * px;
          c.lineWidth = 6 * px; c.strokeStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(d.cx, d.cy, r, 0, TAU); c.stroke();
          c.lineWidth = 3.5 * px; c.strokeStyle = '#2ecc71'; c.beginPath(); c.arc(d.cx, d.cy, r, 0, TAU); c.stroke();
        });
        if (P.ring) {
          const d = lv.diffs[P.ring.k], t = (now - P.ring.t) / 1000;
          const r = d.r * (1.15 + 0.2 * Math.sin(t * 7)) + 8 * px;
          c.lineWidth = 5 * px; c.strokeStyle = '#ffc845'; c.setLineDash([10 * px, 7 * px]);
          c.beginPath(); c.arc(d.cx, d.cy, r, 0, TAU); c.stroke(); c.setLineDash([]);
        }
        for (const m of P.marks) {
          if (m.bi !== bi) continue;
          const t = (now - m.t) / 700, s = 12 * px;
          c.globalAlpha = 1 - t; c.strokeStyle = '#d6453d'; c.lineWidth = 4.5 * px; c.lineCap = 'round';
          c.beginPath(); c.moveTo(m.x - s, m.y - s); c.lineTo(m.x + s, m.y + s); c.moveTo(m.x + s, m.y - s); c.lineTo(m.x - s, m.y + s); c.stroke();
          c.globalAlpha = 1;
        }
      }

      updHud();
      raf = requestAnimationFrame(frame);
      if (!save.levels[L.id]) intro(); else root.focus({ preventScroll: true });
    }

    function stopPlay() {
      cancelAnimationFrame(raf);
      play = null;
      while (cleanups.length) cleanups.pop()();
    }
    const onVis = () => { if (play) play.last = performance.now(); };
    document.addEventListener('visibilitychange', onVis);

    showMap();
    return { destroy() { stopPlay(); document.removeEventListener('visibilitychange', onVis); root.remove(); } };
  }

  // ---------------------------------------------------------------- kayıt
  Portal.register({
    slug: 'farki-bul',
    title: 'Farkı Bul',
    category: 'sakli-nesne',
    isNew: true,
    short: '20 bölüm, 7 fark',
    tags: ['fark bulma', '7 fark', 'dikkat', 'resim', 'bulmaca', 'tek oyunculu', 'mobil'],
    heroFacts: ['20 bölüm', 'Her resimde 7 fark', 'İpucu ve kombo', 'Mobilde de oynanır'],
    description: 'Yan yana duran iki resim ilk bakışta aynı görünür, ama aralarında tam 7 fark var. Çiftlikten su altına, karlı köyden uzaya ve gece şehrine, lunaparktan kutba kadar 20 bölümde rengi değişen, kaybolan, yön değiştiren ya da büyüyüp küçülen şeyleri yakala. Bölümler ilerledikçe farklar küçülür ve zorlaşır.',
    howTo: [
      'Bölüm listesinden açık bir bölüm seç.',
      'İki resmi karşılaştır. Farkı gördüğün yere resimlerden birinde dokun.',
      'Doğru bulduğun fark iki resimde de yeşil halkayla işaretlenir. Üstteki 7 nokta kaç fark bulduğunu gösterir.',
      'Arka arkaya hızlı bulursan kombo puanı kazanırsın. Yanlış dokunuş 20 puan götürür.',
      'Takılırsan 💡 ipucunu kullan. Her bölümde 3 ipucu var.',
      '3 saniye içinde 4 yanlış dokunuş 3 saniyelik bekleme cezası getirir.',
      'Hızlı, ipucusuz ve az hatayla bitirirsen 3 yıldız alırsın. Bölümü bitirmek sıradakini açar.',
    ],
    controls: [
      ['Fare tıklaması / dokunma', 'Farkı işaretle'],
      ['<kbd>H</kbd>', 'İpucu kullan'],
      ['Tam ekran düğmesi', 'Resimleri büyüt (telefonda yatay çevirmek de işe yarar)'],
    ],
    drawCover,
    mount,
  });
  // test ve hata ayıklama için
  window.__farkiBul = { LEVELS, buildLevel };
})();
