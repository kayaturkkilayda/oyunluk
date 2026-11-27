/*
 * Düzenle — çizimler ve bölümler.
 * Her eşya (ITEMS) kendi merkezine (0,0) göre çizilen bir SVG parçasıdır: { w, h, draw(v) }.
 * Yuvalar (slot) aynı çizimin gölgeli siluetidir, bu yüzden her eşya kendi şeklindeki yere oturur.
 * Bölüm eklemek için LEVELS dizisine yeni bir kayıt ekleyin (bkz. README).
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- yardımcılar
  const R = (x, y, w, h, r, fill, ex = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${ex}/>`;
  const C = (cx, cy, r, fill, ex = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${ex}/>`;
  const E = (cx, cy, rx, ry, fill, ex = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${ex}/>`;
  const P = (d, fill, ex = '') => `<path d="${d}" fill="${fill}" ${ex}/>`;
  const L = (d, stroke, w, ex = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${ex}/>`;
  const EDGE = 'stroke="#4a2c3f" stroke-opacity=".22" stroke-width="1.5"';
  const CYL = 'url(#dz-cyl)', CYLV = 'url(#dz-cylv)', GLOSS = 'url(#dz-gloss)', DOME = 'url(#dz-dome)';
  const GOLD = 'url(#dz-gold)', GOLDV = 'url(#dz-goldv)', SILVER = 'url(#dz-silver)', SILVERV = 'url(#dz-silverv)';
  const TOP = 'url(#dz-topshine)', BOT = 'url(#dz-bottomshade)';

  // ortak degrade ve filtreler (sahnede bir kez tanımlanır)
  function defs() {
    const cyl = (id, v) => `<linearGradient id="${id}" x1="0" y1="0" x2="${v ? 0 : 1}" y2="${v ? 1 : 0}">
      <stop offset="0" stop-color="#000" stop-opacity=".14"/><stop offset=".16" stop-color="#fff" stop-opacity=".6"/>
      <stop offset=".32" stop-color="#fff" stop-opacity=".06"/><stop offset=".72" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>`;
    const metal = (id, v, cols) => `<linearGradient id="${id}" x1="0" y1="0" x2="${v ? 0 : 1}" y2="${v ? 1 : 0}">${cols.map((c, i) => `<stop offset="${i / (cols.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
    const gold = ['#b3842b', '#f6da86', '#d6a441', '#fff1bd', '#a67720'];
    const silver = ['#8996a3', '#eef3f7', '#b2bec9', '#fafcfd', '#7a8794'];
    const shadow = (id, dy, sd, op) => `<filter id="${id}" x="-40%" y="-40%" width="180%" height="190%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="${dy}" stdDeviation="${sd}" flood-color="#3b2340" flood-opacity="${op}"/></filter>`;
    return `${cyl('dz-cyl', 0)}${cyl('dz-cylv', 1)}
      ${metal('dz-gold', 0, gold)}${metal('dz-goldv', 1, gold)}${metal('dz-silver', 0, silver)}${metal('dz-silverv', 1, silver)}
      <radialGradient id="dz-gloss" cx=".33" cy=".28" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".3" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="dz-dome" cx=".5" cy=".45" r=".55"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>
      <linearGradient id="dz-topshine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="dz-bottomshade" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
      <linearGradient id="dz-sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <pattern id="dz-dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.4" fill="#fff" fill-opacity=".55"/><circle cx="10.5" cy="10.5" r="1.4" fill="#fff" fill-opacity=".55"/></pattern>
      <pattern id="dz-weave" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 2h8M0 6h8" stroke="#000" stroke-opacity=".05" stroke-width="1.6"/><path d="M2 0v8M6 0v8" stroke="#fff" stroke-opacity=".12" stroke-width="1.2"/></pattern>
      ${shadow('dz-drop', 5, 3.5, 0.3)}${shadow('dz-lift', 16, 9, 0.28)}${shadow('dz-placed', 2, 1.6, 0.3)}${shadow('dz-cont', 14, 12, 0.22)}`;
  }

  // ---------------------------------------------------------------- eşyalar
  const ITEMS = {
    // --- makyaj
    lipstick: {
      w: 34, h: 120,
      draw: v => `
        ${P('M-10 -34 V-50 Q-10 -59 -1 -59 L10 -47 V-34 Z', v.color, EDGE)}
        ${P('M-10 -34 V-50 Q-10 -59 -1 -59 L10 -47 V-34 Z', CYL)}
        ${P('M-6 -50 Q-6 -55 -2 -55', 'none', 'stroke="#fff" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round"')}
        ${R(-12, -36, 24, 16, 2, GOLD)}
        ${R(-16, -22, 32, 14, 3, GOLD, EDGE)}
        ${R(-15, -9, 30, 68, 7, v.body, EDGE)}
        ${R(-15, 46, 30, 13, 6, '#000', 'fill-opacity=".1"')}
        ${R(-15, -9, 30, 68, 7, CYL)}`,
    },
    polish: {
      w: 50, h: 102,
      draw: v => `
        ${R(-9, -51, 18, 42, 6, v.cap, EDGE)}${R(-9, -51, 18, 42, 6, CYL)}
        ${R(-12, -12, 24, 7, 2, GOLD)}
        ${R(-25, -7, 50, 58, 15, v.color, EDGE)}
        ${R(-19, -1, 38, 46, 11, '#fff', 'fill-opacity=".14"')}
        ${R(-25, -7, 50, 58, 15, CYL)}
        ${R(-25, -7, 50, 58, 15, 'none', 'stroke="#fff" stroke-opacity=".55" stroke-width="2.5"')}
        ${P('M0 30 c-6 -5 -10 -8 -10 -12 a5 5 0 0 1 10 -2 a5 5 0 0 1 10 2 c0 4 -4 7 -10 12z', '#fff', 'fill-opacity=".75"')}`,
    },
    compact: {
      round: true, w: 96, h: 100,
      draw: v => `
        ${R(-12, -50, 24, 10, 3, GOLD)}
        ${C(0, 2, 47, GOLD, EDGE)}
        ${C(0, 2, 40, v.color)}
        ${C(0, 2, 40, DOME)}
        ${[0, 72, 144, 216, 288].map(a => { const r = a * Math.PI / 180; return C((Math.sin(r) * 12).toFixed(1), (2 - Math.cos(r) * 12).toFixed(1), 9, v.petal); }).join('')}
        ${C(0, 2, 6, GOLD)}
        ${C(0, 2, 40, GLOSS)}`,
    },
    palette: {
      w: 156, h: 100,
      draw: v => `
        ${R(-78, -50, 156, 100, 14, v.case, EDGE)}
        ${R(-70, -42, 140, 84, 9, '#000', 'fill-opacity=".18"')}
        ${v.pans.map((c, i) => { const x = -46 + (i % 3) * 46, y = i < 3 ? -19 : 19; return `${C(x, y, 19, GOLD)}${C(x, y, 16, c)}${C(x, y, 16, DOME)}${E(x - 5, y - 6, 6, 3.5, '#fff', 'fill-opacity=".45"')}`; }).join('')}
        ${R(-78, -50, 156, 100, 14, TOP)}`,
    },
    brush: {
      w: 32, h: 198,
      draw: v => `
        ${P('M-8 10 L-5 92 Q0 99 5 92 L8 10 Z', v.handle, EDGE)}
        ${P('M-8 10 L-5 92 Q0 99 5 92 L8 10 Z', CYL)}
        ${R(-9, -22, 18, 34, 3, SILVER, EDGE)}
        ${L('M-9 -6 H9', '#000', 1, 'stroke-opacity=".15"')}
        ${P('M-9 -21 C-17 -42 -17 -78 0 -99 C17 -78 17 -42 9 -21 Z', v.bristle, EDGE)}
        ${P('M-12 -66 C-11 -82 -6 -92 0 -99 C6 -92 11 -82 12 -66 C6 -70 -6 -70 -12 -66 Z', v.tip)}
        ${L('M-5 -26 C-8 -50 -6 -75 -2 -90', '#fff', 1.6, 'stroke-opacity=".45"')}
        ${L('M4 -26 C6 -50 5 -72 3 -88', '#000', 1.4, 'stroke-opacity=".12"')}`,
    },
    mascara: {
      w: 28, h: 154,
      draw: v => `
        ${R(-11, -77, 22, 62, 7, v.cap, EDGE)}${R(-11, -77, 22, 62, 7, CYL)}
        ${R(-13, -18, 26, 9, 2, GOLD)}
        ${R(-14, -10, 28, 87, 9, v.tube, EDGE)}
        ${R(-14, 22, 28, 18, 0, v.band)}
        ${R(-14, -10, 28, 87, 9, CYL)}`,
    },
    perfume: {
      w: 96, h: 116,
      draw: v => `
        ${P('M-18 -58 H18 L24 -44 L18 -32 H-18 L-24 -44 Z', v.cap, EDGE)}
        ${P('M-18 -58 H0 L-6 -44 L0 -32 H-18 L-24 -44 Z', '#fff', 'fill-opacity=".3"')}
        ${R(-12, -34, 24, 10, 2, GOLD)}
        ${R(-46, -26, 92, 84, 20, v.glass, EDGE)}
        ${R(-37, -4, 74, 54, 13, v.liquid)}
        ${P('M-46 -6 L-30 -26 H-14 L-38 6 Z', '#fff', 'fill-opacity=".35"')}
        ${P('M30 58 L46 40 V24 L20 58 Z', '#000', 'fill-opacity=".08"')}
        ${R(-46, -26, 92, 84, 20, 'none', 'stroke="#fff" stroke-opacity=".6" stroke-width="3"')}
        ${R(-20, 12, 40, 22, 4, '#fff', 'fill-opacity=".7"')}${R(-14, 19, 28, 3, 1.5, v.liquid)}${R(-9, 25, 18, 2.5, 1.2, v.liquid)}`,
    },
    sponge: {
      round: true, w: 60, h: 78,
      draw: v => `
        ${P('M0 -38 C21 -38 29 -6 29 10 C29 28 16 38 0 38 C-16 38 -29 28 -29 10 C-29 -6 -21 -38 0 -38 Z', v.color, EDGE)}
        ${[[-10, 6], [8, -10], [12, 16], [-4, 24], [-14, -12], [2, 2], [18, 2], [-18, 18]].map(([x, y]) => C(x, y, 2, '#000', 'fill-opacity=".08"')).join('')}
        ${P('M0 -38 C21 -38 29 -6 29 10 C29 28 16 38 0 38 C-16 38 -29 28 -29 10 C-29 -6 -21 -38 0 -38 Z', GLOSS)}
        ${P('M0 -38 C21 -38 29 -6 29 10 C29 28 16 38 0 38 C-16 38 -29 28 -29 10 C-29 -6 -21 -38 0 -38 Z', DOME)}`,
    },
    gloss: {
      w: 28, h: 118,
      draw: v => `
        ${R(-11, -59, 22, 54, 6, v.cap, EDGE)}${R(-11, -59, 22, 54, 6, CYL)}
        ${R(-11, -14, 22, 6, 1, '#000', 'fill-opacity=".12"')}
        ${R(-13, -7, 26, 66, 9, v.color, EDGE + ' fill-opacity=".9"')}
        ${R(-3, -7, 6, 52, 3, '#fff', 'fill-opacity=".25"')}
        ${E(0, 48, 7, 9, '#fff', 'fill-opacity=".25"')}
        ${R(-13, -7, 26, 66, 9, CYL)}`,
    },
  };

  const RING = (cx, cy, rx, ry, irx, iry, fill, ex = '') => P(`M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0ZM${cx - irx} ${cy}a${irx} ${iry} 0 1 0 ${2 * irx} 0a${irx} ${iry} 0 1 0 ${-2 * irx} 0Z`, fill, `fill-rule="evenodd" ${ex}`);
  const shade = (hex, amt) => { // rengi aç (+) / koyulaştır (-)
    const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt))));
    return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(c => c.toString(16).padStart(2, '0')).join('');
  };

  Object.assign(ITEMS, {
    // --- kalem kutusu
    pencil: {
      w: 22, h: 172,
      draw: v => `
        ${P('M-10 -56 L-2.6 -78 H2.6 L10 -56 Z', '#f3d2a6', EDGE)}
        ${P('M-2.6 -78 L0 -86 L2.6 -78 Z', '#4a4048')}
        ${R(-10, -56, 20, 124, 0, v.color, EDGE)}
        ${P('M-10 -56 Q-6.7 -61 -3.3 -56 Q0 -61 3.3 -56 Q6.7 -61 10 -56 V-50 H-10 Z', v.color)}
        ${R(-3.3, -54, 6.6, 122, 0, '#fff', 'fill-opacity=".2"')}${R(3.3, -54, 6.7, 122, 0, '#000', 'fill-opacity=".1"')}
        ${R(-10.5, 66, 21, 12, 1.5, SILVER, EDGE)}${L('M-10 70 H10 M-10 74 H10', '#000', .8, 'stroke-opacity=".2"')}
        ${P('M-10 78 H10 V82 Q10 86 6 86 H-6 Q-10 86 -10 82 Z', '#f7a5b8', EDGE)}`,
    },
    marker: {
      w: 28, h: 144,
      draw: v => `
        ${R(-13, -27, 26, 98, 7, '#fbf7f4', EDGE)}
        ${R(-13, 28, 26, 16, 0, v.color)}
        ${R(-10, 64, 20, 8, 3, v.color)}
        ${R(-13, -27, 26, 98, 7, CYL)}
        ${R(-12, -72, 24, 48, 8, v.color, EDGE)}${R(-12, -72, 24, 48, 8, CYL)}
        ${R(8, -68, 6, 36, 3, shade(v.color, -0.18))}`,
    },
    highlighter: {
      w: 36, h: 134,
      draw: v => `
        ${R(-17, -28, 34, 95, 11, v.body, EDGE)}
        ${R(-17, 10, 34, 30, 0, v.color, 'fill-opacity=".9"')}
        ${R(-17, -28, 34, 95, 11, CYL)}
        ${R(-15, -67, 30, 42, 10, v.color, EDGE)}${R(-15, -67, 30, 42, 10, CYL)}`,
    },
    eraser: {
      w: 76, h: 44,
      draw: v => `
        ${R(-37, -21, 74, 42, 9, '#fff6f4', EDGE)}
        ${R(-8, -21, 45, 42, 7, v.sleeve, EDGE)}
        ${R(-2, -9, 32, 6, 3, '#fff', 'fill-opacity=".7"')}${R(-2, 2, 22, 5, 2.5, '#fff', 'fill-opacity=".5"')}
        ${R(-37, -21, 74, 42, 9, TOP)}`,
    },
    sharpener: {
      w: 50, h: 60,
      draw: v => `
        ${R(-24, -29, 48, 58, 10, v.color, EDGE)}
        ${R(-24, -29, 48, 58, 10, TOP)}
        ${R(-17, -20, 34, 16, 3, SILVER, EDGE)}${C(0, -12, 3.2, '#7a8794')}
        ${E(0, 13, 11, 8, '#3a2b33')}${E(0, 11, 7, 4, '#000', 'fill-opacity=".3"')}`,
    },
    ruler: {
      w: 304, h: 46,
      draw: v => `
        ${R(-151, -22, 302, 44, 7, v.color, EDGE + ' fill-opacity=".92"')}
        ${Array.from({ length: 29 }, (_, i) => `<path d="M${-140 + i * 10} -22 v${i % 5 ? 8 : 15}" stroke="#4a2c3f" stroke-opacity=".45" stroke-width="1.5"/>`).join('')}
        ${R(-151, -22, 302, 14, 7, '#fff', 'fill-opacity=".25"')}
        ${R(-151, 8, 302, 14, 7, '#000', 'fill-opacity=".05"')}`,
    },
    scissors: {
      w: 76, h: 154,
      draw: v => `
        ${P('M-9 8 C-9 -30 -4 -60 3 -77 C5 -50 5 -20 7 8 Z', SILVER, EDGE)}
        ${P('M9 8 C9 -30 4 -60 -3 -77 C-5 -50 -5 -20 -7 8 Z', SILVER, EDGE)}
        ${R(-13, 2, 26, 18, 8, v.color, EDGE)}
        ${RING(-18, 44, 16, 24, 8, 14, v.color, EDGE)}${RING(18, 44, 16, 24, 8, 14, v.color, EDGE)}
        ${RING(-18, 44, 16, 24, 8, 14, GLOSS)}${RING(18, 44, 16, 24, 8, 14, GLOSS)}
        ${C(0, 6, 4.5, SILVER, EDGE)}`,
    },
    glue: {
      w: 42, h: 124,
      draw: v => `
        ${R(-20, -24, 40, 84, 11, '#fffaf3', EDGE)}
        ${R(-20, 0, 40, 38, 0, v.label)}${R(-12, 12, 24, 6, 3, '#fff', 'fill-opacity=".8"')}${R(-8, 22, 16, 5, 2.5, '#fff', 'fill-opacity=".6"')}
        ${R(-17, 54, 34, 8, 3, v.cap)}
        ${R(-20, -24, 40, 84, 11, CYL)}
        ${R(-18, -62, 36, 41, 11, v.cap, EDGE)}${R(-18, -62, 36, 41, 11, CYL)}`,
    },
    pen: {
      w: 22, h: 164,
      draw: v => `
        ${P('M-7 66 L0 81 L7 66 Z', SILVER, EDGE)}
        ${R(-9, -30, 18, 98, 7, '#f9f4f0', EDGE)}
        ${R(-9, 38, 18, 26, 4, v.color, 'fill-opacity=".85"')}
        ${R(-9, -30, 18, 98, 7, CYL)}
        ${R(-8, -82, 16, 56, 6, v.color, EDGE)}${R(-8, -82, 16, 56, 6, CYL)}
        ${R(4, -79, 5, 42, 2.5, SILVER)}`,
    },
    clip: {
      w: 28, h: 68,
      draw: v => `${L('M-6 22 V-20 a6 6 0 0 1 12 0 V26 a9 9 0 0 1 -18 0 V-16', v.color, 5)}${L('M-6 22 V-20 a6 6 0 0 1 12 0 V26 a9 9 0 0 1 -18 0 V-16', '#fff', 1.4, 'stroke-opacity=".55"')}`,
    },
    notes: {
      w: 80, h: 80,
      draw: v => `
        ${R(-36, -34, 74, 74, 5, shade(v.color, -0.12), EDGE)}
        ${R(-38, -38, 74, 72, 5, v.color, EDGE)}
        ${L('M-26 -16 H24 M-26 -2 H24 M-26 12 H10', '#000', 2, 'stroke-opacity=".1"')}
        ${P('M36 14 V29 Q36 34 31 34 H16 Z', shade(v.color, -0.15))}
        ${P('M36 14 L16 34 Q22 22 36 14 Z', '#fff', 'fill-opacity=".6"')}`,
    },
    crayon: {
      w: 22, h: 104,
      draw: v => `
        ${P('M-9 -34 L-4 -50 Q0 -53 4 -50 L9 -34 Z', v.color, EDGE)}
        ${R(-10, -36, 20, 88, 4, v.color, EDGE)}
        ${R(-10, -26, 20, 66, 0, '#fffaf3', 'fill-opacity=".85"')}
        ${L('M-10 -18 H10 M-10 32 H10', v.color, 3)}
        ${R(-5, -8, 10, 30, 3, v.color, 'fill-opacity=".6"')}
        ${R(-10, -36, 20, 88, 4, CYL)}`,
    },

    // --- çocuk odası (önden görünüm)
    book: {
      w: 32, h: 112,
      draw: v => book(v, 30, 112),
    },
    bookTall: { w: 28, h: 120, draw: v => book(v, 26, 120) },
    bookWide: { w: 40, h: 96, draw: v => book(v, 38, 96) },
    ball: {
      round: true, w: 66, h: 66,
      draw: v => `
        ${C(0, 0, 32, '#fff', EDGE)}
        ${P('M0 -32 C-14 -18 -14 18 0 32 C-22 30 -32 14 -32 0 C-32 -14 -22 -30 0 -32 Z', v.a)}
        ${P('M0 -32 C14 -18 14 18 0 32 C22 30 32 14 32 0 C32 -14 22 -30 0 -32 Z', v.b)}
        ${P('M0 -32 C-6 -16 -6 16 0 32 C6 16 6 -16 0 -32 Z', v.c)}
        ${C(0, 0, 32, DOME)}${C(0, 0, 32, GLOSS)}${C(0, -28, 4, '#fff')}`,
    },
    duck: {
      w: 62, h: 56,
      draw: v => `
        ${P('M-28 4 C-30 -6 -20 -8 -10 -2 L14 -2 C24 -2 30 6 30 14 C30 24 18 27 0 27 C-18 27 -28 20 -28 4 Z', v.color, EDGE)}
        ${C(8, -12, 15, v.color, EDGE)}
        ${P('M20 -12 Q31 -12 31 -7 Q30 -2 20 -4 Z', '#ff9a4a', EDGE)}
        ${C(12, -16, 2.6, '#3a2b33')}${C(12.8, -16.8, 0.9, '#fff')}
        ${P('M-8 6 Q4 2 12 10 Q2 18 -8 6 Z', shade(v.color, -0.12))}
        ${E(0, 0, 30, 27, GLOSS)}`,
    },
    block: {
      w: 42, h: 42,
      draw: v => `
        ${R(-20, -20, 40, 40, 7, v.color, EDGE)}
        ${R(-14, -14, 28, 28, 5, shade(v.color, 0.35))}
        ${v.icon === 'star' ? P('M0 -9 L2.6 -3 L9 -2.8 L4 1.5 L5.6 8 L0 4.4 L-5.6 8 L-4 1.5 L-9 -2.8 L-2.6 -3 Z', v.color)
          : v.icon === 'heart' ? P('M0 8 C-8 2 -10 -2 -10 -4 A5 5 0 0 1 0 -6 A5 5 0 0 1 10 -4 C10 -2 8 2 0 8 Z', v.color)
          : C(0, 0, 7, v.color)}
        ${R(-20, -20, 40, 40, 7, TOP)}`,
    },
    car: {
      w: 100, h: 56,
      draw: v => `
        ${P('M-46 10 C-46 -2 -40 -6 -30 -7 L-18 -22 C-15 -25 -12 -26 -8 -26 H14 C19 -26 22 -24 25 -20 L34 -7 C42 -6 48 -2 48 8 V12 C48 16 45 18 41 18 H-42 C-45 18 -46 16 -46 12 Z', v.color, EDGE)}
        ${P('M-14 -20 H-1 V-8 H-24 Z', '#d9f1fb')}${P('M4 -20 H15 C17 -20 19 -19 20 -17 L27 -8 H4 Z', '#d9f1fb')}
        ${R(-46, -4, 94, 8, 4, '#fff', 'fill-opacity=".25"')}
        ${R(40, 0, 7, 5, 2, '#ffe9a3')}
        ${C(-26, 18, 10, '#4a3a48')}${C(-26, 18, 4.5, SILVER)}${C(28, 18, 10, '#4a3a48')}${C(28, 18, 4.5, SILVER)}`,
    },
    lamp: {
      w: 64, h: 114,
      draw: v => `
        ${R(-4, -14, 8, 58, 3, GOLD)}
        ${P('M-24 56 Q-24 46 0 46 Q24 46 24 56 Z', v.base, EDGE)}
        ${P('M-16 -56 H16 L30 -10 H-30 Z', v.shade, EDGE)}
        ${P('M-16 -56 H-4 L-12 -10 H-30 Z', '#fff', 'fill-opacity=".3"')}
        ${R(-30, -14, 60, 5, 2.5, '#000', 'fill-opacity=".08"')}`,
    },
    stacker: {
      w: 74, h: 72,
      draw: v => `
        ${R(-4, -32, 8, 52, 4, '#f3d2a6')}
        ${E(0, 30, 34, 6, '#c99a6b', EDGE)}
        ${[['#f7a1b4', 30, 22], ['#ffc785', 26, 12], ['#fbe48b', 22, 2], ['#9fdcc4', 18, -8], ['#9cc7f2', 14, -18]].map(([c, rx, y]) => `${E(0, y, rx, 7, c, EDGE)}${E(-rx * 0.35, y - 2, rx * 0.35, 2.4, '#fff', 'fill-opacity=".45"')}`).join('')}
        ${C(0, -30, 7, '#c8a2e6', EDGE)}${C(-2, -32, 2.4, '#fff', 'fill-opacity=".6"')}`,
    },
    dino: {
      w: 98, h: 66,
      draw: v => `
        ${P('M-46 18 C-36 16 -26 8 -20 0 C-14 -10 0 -12 10 -8 L22 -22 C26 -28 36 -30 42 -24 C48 -18 46 -10 40 -8 L32 -6 C34 4 30 14 22 18 L22 30 H12 L12 22 C4 24 -4 24 -10 22 L-10 30 H-20 L-20 20 C-30 22 -40 22 -46 18 Z', v.color, EDGE)}
        ${P('M-16 -2 L-12 -10 L-8 -3 Z M-6 -8 L-2 -16 L2 -9 Z M4 -9 L9 -17 L12 -8 Z', v.spike)}
        ${C(36, -20, 2.6, '#3a2b33')}${C(36.8, -20.8, 0.9, '#fff')}
        ${P('M-4 6 C4 2 14 4 18 10 C10 16 0 16 -4 6 Z', shade(v.color, 0.3))}`,
    },
    pillow: {
      w: 126, h: 64,
      draw: v => `
        ${P('M-58 -26 Q-62 -30 -54 -30 Q0 -22 54 -30 Q62 -30 58 -26 Q52 0 58 26 Q62 30 54 30 Q0 22 -54 30 Q-62 30 -58 26 Q-52 0 -58 -26 Z', v.color, EDGE)}
        ${P('M-50 -20 Q0 -14 50 -20 Q46 0 50 20 Q0 14 -50 20 Q-46 0 -50 -20 Z', '#fff', 'fill-opacity=".18"')}
        ${[-30, 0, 30].map(x => C(x, 0, 3, shade(v.color, -0.15))).join('')}
        ${P('M-58 -26 Q-62 -30 -54 -30 Q0 -22 54 -30 Q62 -30 58 -26 Q52 0 58 26 Q62 30 54 30 Q0 22 -54 30 Q-62 30 -58 26 Q-52 0 -58 -26 Z', TOP)}`,
    },
    teddy: {
      w: 94, h: 106,
      draw: v => {
        const c = v.color, d = shade(c, -0.15), l = shade(c, 0.45);
        return `
        ${C(-22, -40, 11, c, EDGE)}${C(22, -40, 11, c, EDGE)}${C(-22, -40, 5.5, l)}${C(22, -40, 5.5, l)}
        ${E(-30, 12, 12, 20, d, EDGE + ' transform="rotate(25 -30 12)"')}${E(30, 12, 12, 20, d, EDGE + ' transform="rotate(-25 30 12)"')}
        ${E(0, 22, 30, 30, c, EDGE)}${E(0, 26, 17, 18, l)}
        ${E(-22, 46, 15, 10, c, EDGE)}${E(22, 46, 15, 10, c, EDGE)}${E(-22, 47, 8, 5.5, l)}${E(22, 47, 8, 5.5, l)}
        ${C(0, -22, 26, c, EDGE)}
        ${E(0, -14, 12, 9, l)}${E(0, -18, 4.5, 3.2, '#4a3a48')}
        ${L('M0 -15 V-11 M-4 -10 Q0 -7 4 -10', '#4a3a48', 1.6)}
        ${C(-10, -27, 3, '#4a3a48')}${C(10, -27, 3, '#4a3a48')}${C(-9, -28, 1, '#fff')}${C(11, -28, 1, '#fff')}
        ${C(-17, -17, 4, '#f7a1b4', 'fill-opacity=".5"')}${C(17, -17, 4, '#f7a1b4', 'fill-opacity=".5"')}
        ${P('M-12 0 L0 6 L12 0 L12 10 L0 5 L-12 10 Z', v.bow)}
        ${C(0, -22, 26, GLOSS)}`;
      },
    },
    backpack: {
      w: 96, h: 116,
      draw: v => `
        ${RING(0, -46, 16, 14, 9, 8, shade(v.color, -0.2))}
        ${R(-40, -42, 80, 98, 22, v.color, EDGE)}
        ${R(-40, -42, 80, 40, 22, shade(v.color, -0.08))}
        ${R(-28, 8, 56, 38, 12, shade(v.color, 0.25), EDGE)}
        ${R(-14, 22, 28, 4, 2, '#fff', 'fill-opacity=".6"')}
        ${L('M-28 -3 H28', shade(v.color, -0.25), 2.5)}
        ${C(0, -4, 4, GOLD)}
        ${R(-40, -42, 80, 98, 22, TOP)}`,
    },
    cap: {
      w: 106, h: 62,
      draw: v => `
        ${P('M-30 14 C-34 -18 -14 -30 4 -30 C24 -30 38 -16 36 14 Z', v.color, EDGE)}
        ${P('M-30 14 C-34 -18 -14 -30 4 -30 C-6 -20 -12 -4 -10 14 Z', '#fff', 'fill-opacity=".22"')}
        ${P('M30 6 C40 6 52 10 52 16 C52 22 40 22 30 20 Z', shade(v.color, -0.15), EDGE)}
        ${R(-32, 10, 70, 10, 5, shade(v.color, -0.2))}
        ${C(4, -30, 4, shade(v.color, -0.2))}`,
    },
    clock: {
      round: true, w: 80, h: 80,
      draw: v => `
        ${C(0, 0, 38, v.color, EDGE)}${C(0, 0, 31, '#fffaf5')}
        ${[0, 90, 180, 270].map(a => `<rect x="-1.6" y="-28" width="3.2" height="7" rx="1.6" fill="#4a3a48" transform="rotate(${a})"/>`).join('')}
        ${L('M0 0 V-18 M0 0 L12 6', '#4a3a48', 3.2)}${C(0, 0, 3, v.color)}
        ${C(0, 0, 38, GLOSS)}`,
    },
    sneakers: {
      w: 108, h: 48,
      draw: v => {
        const shoe = (dx, c) => `<g transform="translate(${dx} 0)">
          ${P('M-30 14 C-32 0 -28 -16 -16 -18 C-8 -20 -4 -10 4 -8 C14 -6 26 -2 28 8 C30 14 26 18 20 18 H-26 C-30 18 -30 16 -30 14 Z', c, EDGE)}
          ${R(-31, 12, 60, 8, 4, '#fffaf5', EDGE)}
          ${L('M-12 -10 L-4 -4 M-14 -4 L-6 2', '#fff', 2)}
          ${P('M-30 4 C-24 0 -18 4 -14 12 H-30 Z', '#fff', 'fill-opacity=".35"')}</g>`;
        return shoe(-20, shade(v.color, -0.08)) + shoe(20, v.color);
      },
    },
  });
  function book(v, w, h) {
    const x = -w / 2, y = -h / 2;
    return `${R(x, y, w, h, 3, v.color, EDGE)}
      ${R(x, y + 10, w, 6, 0, shade(v.color, -0.2))}${R(x, y + h - 16, w, 6, 0, shade(v.color, -0.2))}
      ${R(x + 5, y + h * 0.32, w - 10, h * 0.24, 2, '#fff', 'fill-opacity=".75"')}
      ${R(x + 8, y + h * 0.38, w - 16, 3, 1.5, shade(v.color, -0.25))}
      ${R(x, y, w, h, 3, CYL)}`;
  }

  Object.assign(ITEMS, {
    // --- buzdolabı (önden)
    milk: {
      w: 62, h: 114,
      draw: v => `
        ${R(-20, -56, 40, 9, 2, '#fffaf5', EDGE)}
        ${P('M-28 -30 L-20 -48 H20 L28 -30 Z', v.color, EDGE)}
        ${R(-28, -31, 56, 88, 4, '#fffaf5', EDGE)}
        ${R(-28, 4, 56, 32, 0, v.color)}
        ${E(-14, -12, 7, 5, '#4a3a48', 'fill-opacity=".8"')}${E(12, -18, 5, 4, '#4a3a48', 'fill-opacity=".8"')}${E(16, 48, 6, 4, '#4a3a48', 'fill-opacity=".8"')}
        ${R(-18, 12, 36, 6, 3, '#fff')}${R(-12, 23, 24, 5, 2.5, '#fff', 'fill-opacity=".7"')}
        ${R(-28, -31, 56, 88, 4, CYL)}`,
    },
    juice: {
      w: 46, h: 134,
      draw: v => `
        ${R(-10, -67, 20, 15, 4, v.cap, EDGE)}
        ${P('M-10 -53 H10 C10 -40 21 -36 21 -24 V58 Q21 66 13 66 H-13 Q-21 66 -21 58 V-24 C-21 -36 -10 -40 -10 -53 Z', v.color, EDGE)}
        ${R(-21, 0, 42, 36, 0, '#fffaf5')}${C(0, 18, 11, v.fruit)}${C(0, 18, 11, GLOSS)}${P('M0 7 q6 -6 10 -2 q-5 3 -10 2z', '#7cc46a')}
        ${P('M-10 -53 H10 C10 -40 21 -36 21 -24 V58 Q21 66 13 66 H-13 Q-21 66 -21 58 V-24 C-21 -36 -10 -40 -10 -53 Z', CYL)}`,
    },
    water: {
      w: 42, h: 144,
      draw: v => `
        ${R(-9, -72, 18, 13, 3, v.cap, EDGE)}
        ${P('M-9 -59 H9 C9 -46 19 -44 19 -32 V62 Q19 70 11 70 H-11 Q-19 70 -19 62 V-32 C-19 -44 -9 -46 -9 -59 Z', '#cdeefa', EDGE + ' fill-opacity=".9"')}
        ${R(-19, -10, 38, 30, 0, v.label)}${P('M-8 0 q8 -10 16 0 q-8 10 -16 0z', '#fff', 'fill-opacity=".8"')}
        ${L('M-19 34 H19 M-19 46 H19', '#fff', 2, 'stroke-opacity=".7"')}
        ${P('M-9 -59 H9 C9 -46 19 -44 19 -32 V62 Q19 70 11 70 H-11 Q-19 70 -19 62 V-32 C-19 -44 -9 -46 -9 -59 Z', CYL)}`,
    },
    ketchup: {
      w: 44, h: 106,
      draw: v => `
        ${R(-9, -53, 18, 10, 3, '#fffaf5', EDGE)}${R(-14, -45, 28, 12, 4, '#fffaf5', EDGE)}
        ${P('M-14 -34 H14 C20 -30 21 -20 21 -10 V44 Q21 52 13 52 H-13 Q-21 52 -21 44 V-10 C-21 -20 -20 -30 -14 -34 Z', v.color, EDGE)}
        ${R(-21, -2, 42, 30, 0, '#fffaf5')}${P('M-6 13 a6 6 0 1 1 12 0 a6 6 0 1 1 -12 0z', v.color)}${P('M0 5 l3 -5 l2 4z', '#7cc46a')}
        ${P('M-14 -34 H14 C20 -30 21 -20 21 -10 V44 Q21 52 13 52 H-13 Q-21 52 -21 44 V-10 C-21 -20 -20 -30 -14 -34 Z', CYL)}`,
    },
    jam: {
      w: 58, h: 68,
      draw: v => `
        ${R(-25, -18, 50, 51, 11, v.color, EDGE)}
        ${C(0, 8, 14, '#fffaf5')}${C(0, 8, 9, v.color, 'fill-opacity=".7"')}
        ${R(-25, -18, 50, 51, 11, CYL)}
        ${R(-27, -34, 54, 18, 5, '#fff', EDGE)}
        ${[-20, -8, 4, 16].map(x => R(x, -34, 6, 18, 0, v.lid, 'fill-opacity=".8"')).join('')}
        ${R(-27, -27, 54, 4, 0, v.lid, 'fill-opacity=".5"')}`,
    },
    cheese: {
      w: 86, h: 52,
      draw: () => `
        ${P('M-41 24 V-2 L33 -24 L42 -18 V24 Z', '#ffd65c', EDGE)}
        ${P('M-41 -2 L33 -24 L42 -18 L-32 2 Z', '#ffe797')}
        ${E(-18, 12, 6, 5, '#f2b93a')}${E(10, 4, 5, 4, '#f2b93a')}${E(24, 16, 7, 5, '#f2b93a')}${E(-2, 18, 3.5, 3, '#f2b93a')}`,
    },
    butter: {
      w: 94, h: 48,
      draw: v => `
        ${R(-26, -2, 52, 14, 3, '#ffe9a6')}
        ${P('M-36 14 C-36 -12 -20 -18 0 -18 C20 -18 36 -12 36 14 Z', v.color, EDGE + ' fill-opacity=".85"')}
        ${P('M-28 8 C-28 -6 -18 -12 -6 -13', 'none', 'stroke="#fff" stroke-opacity=".6" stroke-width="4" stroke-linecap="round"')}
        ${C(0, -20, 5, v.color, EDGE)}
        ${R(-46, 12, 92, 11, 5.5, '#fffaf5', EDGE)}`,
    },
    yogurt: {
      w: 50, h: 48,
      draw: v => `
        ${P('M-22 -15 H22 L18 21 Q17 24 13 24 H-13 Q-17 24 -18 21 Z', '#fffaf5', EDGE)}
        ${P('M-20.5 -2 H20.5 L19 10 H-19 Z', v.color)}
        ${C(0, 4, 4.5, '#fff', 'fill-opacity=".85"')}
        ${P('M-22 -15 H22 L18 21 Q17 24 13 24 H-13 Q-17 24 -18 21 Z', CYL)}
        ${R(-25, -23, 50, 9, 4, v.color, EDGE)}${R(-25, -23, 50, 4, 2, '#fff', 'fill-opacity=".4"')}`,
    },
    lemon: {
      round: true, w: 54, h: 40,
      draw: () => `
        ${P('M-26 0 C-26 -12 -14 -19 0 -19 C14 -19 26 -12 26 0 C26 12 14 19 0 19 C-14 19 -26 12 -26 0 Z', '#ffe066', EDGE)}
        ${E(-27, 0, 3, 4, '#ffd23f')}${E(27, 0, 3, 4, '#ffd23f')}
        ${E(0, 0, 26, 19, GLOSS)}${E(0, 0, 26, 19, DOME)}`,
    },
    egg: {
      round: true, w: 32, h: 40,
      draw: () => `${P('M0 -19 C10 -19 15 -4 15 5 C15 14 8 19 0 19 C-8 19 -15 14 -15 5 C-15 -4 -10 -19 0 -19 Z', '#fff4e3', EDGE)}${E(0, 0, 15, 19, GLOSS)}${E(0, 0, 15, 19, DOME)}`,
    },
    carrot: {
      w: 126, h: 34,
      draw: () => `
        ${P('M-44 -8 C-52 -20 -60 -18 -62 -12 C-56 -10 -52 -6 -44 -4 Z M-44 0 C-56 -2 -62 4 -60 10 C-54 8 -50 6 -44 4 Z M-44 -2 C-58 -10 -63 -4 -63 -1 C-56 -1 -50 0 -44 1Z', '#7cc46a')}
        ${P('M-44 -12 C-12 -14 30 -6 60 0 C30 6 -12 14 -44 12 Q-48 0 -44 -12 Z', '#ff9a4a', EDGE)}
        ${L('M-26 -8 l6 3 M-6 4 l7 -3 M14 -4 l6 3 M32 2 l5 -2', '#e2742a', 1.6)}
        ${P('M-44 -12 C-12 -14 30 -6 60 0 C30 6 -12 14 -44 12 Q-48 0 -44 -12 Z', CYLV)}`,
    },
    broccoli: {
      w: 70, h: 76,
      draw: () => `
        ${P('M-8 4 L-10 36 Q0 40 10 36 L8 4 Z', '#a8dc8f', EDGE)}
        ${[[-18, -6, 15], [18, -6, 15], [0, -16, 18], [-20, -24, 13], [20, -24, 13], [0, -30, 12]].map(([x, y, r]) => C(x, y, r, '#5fb85a', EDGE)).join('')}
        ${[[-22, -10], [14, -12], [-4, -22], [16, -28], [-18, -28], [4, -8]].map(([x, y]) => C(x, y, 4, '#7fd06f')).join('')}
        ${E(0, -14, 34, 26, GLOSS)}`,
    },
    apple: {
      round: true, w: 58, h: 62,
      draw: v => `
        ${L('M1 -18 C1 -26 3 -30 6 -32', '#8a5a3c', 3.2)}
        ${P('M6 -26 C12 -34 22 -32 24 -26 C18 -22 10 -22 6 -26 Z', '#7cc46a')}
        ${P('M0 -18 C10 -24 27 -20 27 2 C27 20 15 30 6 29 C3 29 2 27 0 27 C-2 27 -3 29 -6 29 C-15 30 -27 20 -27 2 C-27 -20 -10 -24 0 -18 Z', v.color, EDGE)}
        ${E(-10, -6, 7, 10, '#fff', 'fill-opacity=".4" transform="rotate(20 -10 -6)"')}
        ${E(0, 4, 27, 27, DOME)}`,
    },

    // --- takı kutusu
    ring: {
      round: true, w: 54, h: 62,
      draw: v => `
        ${RING(0, 8, 23, 23, 16, 16, v.metal, EDGE)}
        ${P('M-11 -16 L-6 -27 H6 L11 -16 L0 -4 Z', v.gem, EDGE)}
        ${P('M-6 -27 H0 L-3 -16 H-11 Z', '#fff', 'fill-opacity=".55"')}${P('M0 -4 L11 -16 H3 Z', '#000', 'fill-opacity=".12"')}`,
    },
    hoop: {
      round: true, w: 50, h: 56,
      draw: v => `${RING(0, 4, 22, 22, 17, 17, v.metal, EDGE)}${C(0, -20, 4, v.metal, EDGE)}${C(-14, -10, 3, '#fff', 'fill-opacity=".7"')}`,
    },
    stud: {
      round: true, w: 30, h: 30,
      draw: v => v.pearl ? `${C(0, 0, 12, '#fbf6ef', EDGE)}${C(0, 0, 12, DOME)}${C(0, 0, 12, GLOSS)}`
        : `${C(0, 0, 12.5, GOLD, EDGE)}${C(0, 0, 9, v.gem)}${P('M-9 0 L0 -9 L9 0 L0 9 Z', '#fff', 'fill-opacity=".25"')}${C(-3, -3, 2.5, '#fff', 'fill-opacity=".8"')}`,
    },
    necklace: {
      w: 152, h: 128,
      draw: v => `
        ${L('M-68 -58 C-70 4 -30 38 0 40 C30 38 70 4 68 -58', v.metal, 4.5)}
        ${L('M-68 -58 C-70 4 -30 38 0 40 C30 38 70 4 68 -58', '#fff', 1.2, 'stroke-opacity=".6" stroke-dasharray="3 5"')}
        ${C(-68, -58, 4, v.metal)}${C(68, -58, 4, v.metal)}
        ${C(0, 42, 4, v.metal)}
        ${P('M0 66 C-12 57 -17 50 -17 45 A8 8 0 0 1 0 41 A8 8 0 0 1 17 45 C17 50 12 57 0 66 Z', v.gem, EDGE)}
        ${P('M-10 46 A4 4 0 0 1 -3 44', 'none', 'stroke="#fff" stroke-opacity=".7" stroke-width="2.5" stroke-linecap="round"')}`,
    },
    bracelet: {
      round: true, w: 98, h: 98,
      draw: v => Array.from({ length: 16 }, (_, i) => {
        const a = i / 16 * Math.PI * 2, x = (Math.cos(a) * 38).toFixed(1), y = (Math.sin(a) * 38).toFixed(1);
        return `${C(x, y, 8.5, i % 2 ? v.a : v.b, EDGE)}${C(x - 2.5, y - 2.5, 2.6, '#fff', 'fill-opacity=".7"')}`;
      }).join(''),
    },
    bangle: {
      round: true, w: 94, h: 94,
      draw: v => `${RING(0, 0, 45, 45, 36, 36, v.metal, EDGE)}${RING(0, 0, 45, 45, 36, 36, GLOSS)}${[0, 60, 120, 180, 240, 300].map(a => { const r = a * Math.PI / 180; return C((Math.cos(r) * 40.5).toFixed(1), (Math.sin(r) * 40.5).toFixed(1), 3, v.gem); }).join('')}`,
    },
    watch: {
      w: 66, h: 160,
      draw: v => `
        ${R(-16, -79, 32, 58, 9, v.strap, EDGE)}${R(-16, 22, 32, 58, 9, v.strap, EDGE)}
        ${[40, 52, 64].map(y => C(0, y, 2.2, shade(v.strap, -0.3))).join('')}
        ${R(27, -5, 6, 10, 2, v.metal)}
        ${C(0, 0, 29, v.metal, EDGE)}${C(0, 0, 23, '#fffaf5')}
        ${[0, 90, 180, 270].map(a => `<rect x="-1.3" y="-20" width="2.6" height="5" rx="1.3" fill="#7d6479" transform="rotate(${a})"/>`).join('')}
        ${L('M0 0 V-14 M0 0 L9 5', '#4a3a48', 2.4)}${C(0, 0, 2.4, v.metal)}${C(0, 0, 23, GLOSS)}`,
    },
    brooch: {
      round: true, w: 68, h: 68,
      draw: v => `
        ${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="0" cy="-17" rx="11" ry="16" fill="${v.color}" ${EDGE} transform="rotate(${a})"/>`).join('')}
        ${[0, 60, 120, 180, 240, 300].map(a => `<ellipse cx="-3" cy="-20" rx="3.5" ry="6" fill="#fff" fill-opacity=".5" transform="rotate(${a})"/>`).join('')}
        ${C(0, 0, 11, GOLD, EDGE)}${C(0, 0, 7.5, v.gem)}${C(-2.5, -2.5, 2.2, '#fff', 'fill-opacity=".8"')}`,
    },
    hairclip: {
      w: 100, h: 34,
      draw: () => `${R(-48, -9, 96, 18, 9, GOLD, EDGE)}${Array.from({ length: 7 }, (_, i) => `${C(-36 + i * 12, 0, 7, '#fbf6ef', EDGE)}${C(-38 + i * 12, -2, 2.4, '#fff')}`).join('')}`,
    },
    pearls: {
      round: true, w: 106, h: 86,
      draw: () => Array.from({ length: 22 }, (_, i) => {
        const a = i / 22 * Math.PI * 2, x = (Math.cos(a) * 44).toFixed(1), y = (Math.sin(a) * 33).toFixed(1);
        return `${C(x, y, 7.5, '#fbf6ef', EDGE)}${C(x - 2, y - 2, 2.4, '#fff')}`;
      }).join('') + C(44, 0, 5, GOLD, EDGE),
    },

    // --- bavul (üstten)
    tshirt: {
      w: 128, h: 108,
      draw: v => `
        ${R(-60, -50, 120, 100, 12, v.color, EDGE)}
        ${R(-60, -50, 120, 100, 12, 'url(#dz-weave)')}
        ${P('M-22 -50 Q0 -30 22 -50', shade(v.color, -0.2), 'stroke="' + shade(v.color, -0.2) + '" stroke-width="5" fill="none"')}
        ${L('M-36 -50 V50 M36 -50 V50', shade(v.color, -0.12), 2)}
        ${P('M0 16 C-10 8 -14 3 -14 -1 A7 7 0 0 1 0 -4 A7 7 0 0 1 14 -1 C14 3 10 8 0 16 Z', v.print)}
        ${R(-60, -50, 120, 100, 12, TOP)}`,
    },
    shorts: {
      w: 116, h: 96,
      draw: v => `
        ${R(-55, -45, 110, 90, 10, v.color, EDGE)}${R(-55, -45, 110, 90, 10, 'url(#dz-weave)')}
        ${R(-55, -45, 110, 18, 8, shade(v.color, 0.3))}
        ${L('M-6 -30 Q-10 -18 -16 -12 M6 -30 Q10 -18 16 -12', '#fff', 2.4)}
        ${L('M0 -27 V45', shade(v.color, -0.15), 2)}
        ${R(-55, -45, 110, 90, 10, TOP)}`,
    },
    socks: {
      w: 56, h: 40,
      draw: v => `
        ${R(-26, -18, 52, 36, 18, v.color, EDGE)}
        ${R(-26, -18, 20, 36, 10, shade(v.color, 0.4))}${L('M-18 -18 V18 M-12 -18 V18', v.stripe, 3)}
        ${L('M6 -8 Q14 -4 18 6', shade(v.color, -0.2), 2)}
        ${R(-26, -18, 52, 36, 18, TOP)}`,
    },
    sunglasses: {
      w: 128, h: 50,
      draw: v => `
        ${L('M-56 -14 L-56 18 M56 -14 L56 18', v.frame, 5)}
        ${E(-30, 2, 27, 21, v.frame, EDGE)}${E(30, 2, 27, 21, v.frame, EDGE)}
        ${E(-30, 2, 22, 16, v.lens)}${E(30, 2, 22, 16, v.lens)}
        ${L('M-8 -4 Q0 -10 8 -4', v.frame, 5)}
        ${P('M-44 -6 L-28 -12 L-40 10 Z M16 -6 L32 -12 L20 10 Z', '#fff', 'fill-opacity=".45"')}`,
    },
    sunhat: {
      round: true, w: 138, h: 138,
      draw: v => `
        ${C(0, 0, 67, '#f5d9a4', EDGE)}${C(0, 0, 67, 'url(#dz-weave)')}
        ${C(0, 0, 40, '#efcc8c', EDGE)}${C(0, 0, 40, 'url(#dz-weave)')}
        ${RING(0, 0, 41, 41, 33, 33, v.ribbon)}
        ${P('M30 26 C44 34 50 46 46 58 L36 50 L30 60 C28 46 26 36 30 26 Z', v.ribbon, EDGE)}
        ${C(0, 0, 40, GLOSS)}${C(0, 0, 67, DOME)}`,
    },
    flipL: {
      w: 56, h: 116,
      draw: v => flip(v, 1),
    },
    flipR: {
      w: 56, h: 116,
      draw: v => flip(v, -1),
    },
    sunscreen: {
      w: 56, h: 116,
      draw: v => `
        ${P('M-22 -48 Q-22 -54 -16 -54 H16 Q22 -54 22 -48 L18 40 H-18 Z', v.color, EDGE)}
        ${C(0, -14, 12, '#ffd65c')}${Array.from({ length: 8 }, (_, i) => `<rect x="-1.5" y="-30" width="3" height="6" rx="1.5" fill="#ffd65c" transform="rotate(${i * 45} 0 -14)"/>`).join('')}
        ${R(-12, 10, 24, 5, 2.5, '#fff', 'fill-opacity=".8"')}${R(-8, 19, 16, 4, 2, '#fff', 'fill-opacity=".6"')}
        ${R(-20, 38, 40, 18, 6, v.cap, EDGE)}
        ${P('M-22 -48 Q-22 -54 -16 -54 H16 Q22 -54 22 -48 L18 40 H-18 Z', CYL)}`,
    },
    novel: {
      w: 96, h: 126,
      draw: v => `
        ${R(-44, -59, 90, 120, 6, '#fffaf0', EDGE)}
        ${R(-46, -61, 88, 120, 6, v.color, EDGE)}
        ${R(-34, -40, 64, 34, 4, '#fff', 'fill-opacity=".8"')}${R(-26, -30, 48, 5, 2.5, v.color)}${R(-20, -20, 36, 4, 2, v.color, 'fill-opacity=".6"')}
        ${C(-2, 24, 13, shade(v.color, 0.35))}
        ${P('M26 59 V72 L30 68 L34 72 V59 Z', v.ribbon)}
        ${R(-46, -61, 10, 120, 3, '#000', 'fill-opacity=".1"')}`,
    },
    camera: {
      w: 116, h: 76,
      draw: v => `
        ${R(-38, -38, 26, 12, 4, '#4a3a48')}
        ${R(-56, -30, 112, 66, 14, v.color, EDGE)}
        ${R(-56, -30, 112, 18, 9, shade(v.color, 0.3))}
        ${C(4, 6, 26, '#4a3a48', EDGE)}${C(4, 6, 19, '#6e8fb8')}${C(4, 6, 11, '#2c3e5a')}${C(-3, -1, 5, '#fff', 'fill-opacity=".7"')}
        ${R(34, -22, 14, 9, 3, '#fffaf5')}${C(-40, -4, 5, '#ff8f7a')}`,
    },
    toothbrush: {
      w: 24, h: 154,
      draw: v => `
        ${R(-8, -74, 16, 34, 5, '#fffaf5', EDGE)}
        ${[-68, -61, -54, -47].map(y => R(-6, y, 12, 4.5, 2, v.bristle)).join('')}
        ${P('M-5 -40 L-4 -20 Q-8 0 -8 20 V70 Q-8 77 0 77 Q8 77 8 70 V20 Q8 0 4 -20 L5 -40 Z', v.color, EDGE)}
        ${R(-4, 20, 8, 40, 4, '#fff', 'fill-opacity=".45"')}`,
    },
    passport: {
      w: 70, h: 96,
      draw: v => `
        ${R(-33, -46, 66, 92, 6, v.color, EDGE)}
        ${C(0, -6, 15, 'none', 'stroke="#f6d27a" stroke-width="2.5"')}${P('M0 -16 L4 -6 L0 4 L-4 -6 Z', '#f6d27a')}
        ${R(-18, 22, 36, 4, 2, '#f6d27a')}${R(-12, 30, 24, 3, 1.5, '#f6d27a', 'fill-opacity=".7"')}
        ${R(-33, -46, 66, 92, 6, TOP)}`,
    },
    towel: {
      w: 114, h: 84,
      draw: v => `
        ${R(-55, -39, 110, 78, 12, v.color, EDGE)}${R(-55, -39, 110, 78, 12, 'url(#dz-weave)')}
        ${R(-55, 14, 110, 8, 0, v.stripe)}${R(-55, 26, 110, 4, 0, v.stripe)}
        ${L('M-55 -10 H55', shade(v.color, -0.12), 2)}
        ${R(-55, -39, 110, 78, 12, TOP)}`,
    },

    // --- banyo (önden)
    shampoo: {
      w: 56, h: 128,
      draw: v => `
        ${R(-13, -63, 26, 20, 5, v.cap, EDGE)}${R(-6, -66, 12, 6, 2, v.cap)}
        ${P('M-14 -44 H14 C24 -40 26 -30 26 -20 V54 Q26 62 18 62 H-18 Q-26 62 -26 54 V-20 C-26 -30 -24 -40 -14 -44 Z', v.color, EDGE)}
        ${R(-18, -6, 36, 40, 8, '#fffaf5', 'fill-opacity=".85"')}${P('M0 4 C6 10 6 18 0 20 C-6 18 -6 10 0 4 Z', v.color)}
        ${P('M-14 -44 H14 C24 -40 26 -30 26 -20 V54 Q26 62 18 62 H-18 Q-26 62 -26 54 V-20 C-26 -30 -24 -40 -14 -44 Z', CYL)}`,
    },
    pump: {
      w: 52, h: 130,
      draw: v => `
        ${R(-4, -54, 8, 22, 2, '#fffaf5', EDGE)}${P('M-6 -64 H18 Q22 -64 22 -60 V-56 H-6 Z', '#fffaf5', EDGE)}
        ${R(-12, -36, 24, 10, 3, '#fffaf5', EDGE)}
        ${R(-24, -28, 48, 92, 14, v.color, EDGE)}
        ${R(-16, -2, 32, 36, 6, '#fffaf5', 'fill-opacity=".85"')}${C(0, 16, 7, v.color, 'fill-opacity=".8"')}
        ${R(-24, -28, 48, 92, 14, CYL)}`,
    },
    cotton: {
      w: 66, h: 84,
      draw: v => `
        ${R(-28, -24, 56, 64, 12, '#e8f6fb', EDGE + ' fill-opacity=".9"')}
        ${[[-14, 24], [4, 26], [18, 22], [-8, 8], [12, 6], [-18, -6], [2, -8], [18, -8]].map(([x, y]) => `${C(x, y, 10, '#fff', EDGE)}`).join('')}
        ${R(-28, -24, 56, 64, 12, CYL)}
        ${R(-31, -40, 62, 18, 6, v.lid, EDGE)}${R(-31, -40, 62, 7, 3.5, '#fff', 'fill-opacity=".4"')}`,
    },
    towelRoll: {
      w: 96, h: 56,
      draw: v => `
        ${R(-46, -26, 82, 52, 20, v.color, EDGE)}${R(-46, -26, 82, 52, 20, 'url(#dz-weave)')}
        ${R(-34, -26, 6, 52, 0, v.stripe)}
        ${E(36, 0, 12, 26, shade(v.color, 0.15), EDGE)}
        ${L('M36 -16 C44 -16 44 14 36 14 C30 14 30 -8 36 -8 C40 -8 40 6 36 6', shade(v.color, -0.2), 2)}
        ${R(-46, -26, 82, 52, 20, CYLV)}`,
    },
    toothpaste: {
      w: 128, h: 42,
      draw: v => `
        ${P('M-62 -12 L-56 -18 H-52 V18 H-56 L-62 12 Z', shade(v.color, -0.1), EDGE)}
        ${P('M-52 -18 C0 -20 30 -16 46 -12 V12 C30 16 0 20 -52 18 Z', '#fffaf5', EDGE)}
        ${P('M-30 -19 C0 -19 20 -17 46 -12 V12 C20 17 0 19 -30 19 Z', v.color)}
        ${R(-14, -5, 34, 10, 5, '#fff', 'fill-opacity=".8"')}
        ${R(46, -9, 18, 18, 4, v.color, EDGE)}
        ${P('M-52 -18 C0 -20 30 -16 46 -12 V12 C30 16 0 20 -52 18 Z', CYLV)}`,
    },
    cream: {
      w: 68, h: 46,
      draw: v => `
        ${R(-28, -8, 56, 30, 10, '#fffaf5', EDGE)}${R(-28, 2, 56, 10, 0, v.color, 'fill-opacity=".6"')}
        ${R(-28, -8, 56, 30, 10, CYL)}
        ${R(-31, -22, 62, 16, 6, v.color, EDGE)}${R(-31, -22, 62, 6, 3, '#fff', 'fill-opacity=".45"')}`,
    },
    soap: {
      w: 78, h: 40,
      draw: v => `
        ${R(-37, -17, 74, 34, 15, v.color, EDGE)}
        ${R(-31, -17, 62, 12, 6, '#fff', 'fill-opacity=".35"')}
        ${C(26, -22, 6, '#fff', EDGE + ' fill-opacity=".9"')}${C(36, -28, 3.5, '#fff', EDGE + ' fill-opacity=".9"')}
        ${R(-14, -2, 28, 6, 3, shade(v.color, -0.12))}`,
    },
    comb: {
      w: 124, h: 34,
      draw: v => `
        ${R(-60, -15, 120, 12, 6, v.color, EDGE)}
        ${Array.from({ length: 19 }, (_, i) => R(-56 + i * 6, -4, 3.4, i < 9 ? 18 : 13, 1.7, v.color)).join('')}
        ${R(-60, -15, 120, 5, 2.5, '#fff', 'fill-opacity=".4"')}`,
    },
    cup: {
      w: 60, h: 114,
      draw: v => `
        ${P('M-14 -10 L-18 -50 Q-19 -57 -13 -57 Q-8 -56 -8 -50 L-6 -10 Z', '#9fd8f5', EDGE)}${R(-21, -60, 12, 18, 4, '#fffaf5', EDGE)}
        ${P('M6 -10 L12 -48 Q13 -55 19 -54 Q24 -53 22 -46 L14 -10 Z', '#f7a1b4', EDGE)}${R(12, -58, 12, 18, 4, '#fffaf5', EDGE + ' transform="rotate(10 18 -49)"')}
        ${P('M-26 -12 H26 L22 52 Q21 57 15 57 H-15 Q-21 57 -22 52 Z', v.color, EDGE)}
        ${R(-24, 10, 48, 8, 0, '#fff', 'fill-opacity=".5"')}
        ${P('M-26 -12 H26 L22 52 Q21 57 15 57 H-15 Q-21 57 -22 52 Z', CYL)}`,
    },

    // --- mutfak çekmecesi (üstten)
    fork: {
      w: 30, h: 174,
      draw: v => `
        ${P('M-13 -86 V-56 Q-13 -40 -4 -33 L-4 -8 H4 L4 -33 Q13 -40 13 -56 V-86 H9.5 V-56 H5.2 V-86 H1.8 V-56 H-1.8 V-86 H-5.2 V-56 H-9.5 V-86 Z', SILVER, EDGE)}
        ${R(-7, -12, 14, 98, 7, v.handle, EDGE)}${R(-7, -12, 14, 98, 7, CYL)}`,
    },
    spoon: {
      w: 34, h: 172,
      draw: v => `
        ${R(-3, -40, 6, 32, 3, SILVER)}
        ${E(0, -60, 16, 25, SILVER, EDGE)}${E(1, -58, 11, 19, '#000', 'fill-opacity=".07"')}${E(-5, -68, 4, 8, '#fff', 'fill-opacity=".8"')}
        ${R(-7, -12, 14, 97, 7, v.handle, EDGE)}${R(-7, -12, 14, 97, 7, CYL)}`,
    },
    knife: {
      w: 24, h: 180,
      draw: v => `
        ${P('M-8 -8 V-74 Q-8 -89 5 -90 Q9 -60 8 -8 Z', SILVER, EDGE)}
        ${L('M-4 -14 V-72', '#fff', 1.5, 'stroke-opacity=".7"')}
        ${R(-8, -12, 16, 102, 8, v.handle, EDGE)}${C(0, 10, 2.4, SILVER)}${C(0, 60, 2.4, SILVER)}${R(-8, -12, 16, 102, 8, CYL)}`,
    },
    teaspoon: {
      w: 24, h: 124,
      draw: v => `
        ${R(-2.2, -30, 4.4, 24, 2, SILVER)}
        ${E(0, -44, 11, 17, SILVER, EDGE)}${E(-3, -50, 3, 5.5, '#fff', 'fill-opacity=".8"')}
        ${R(-5, -10, 10, 72, 5, v.handle, EDGE)}${R(-5, -10, 10, 72, 5, CYL)}`,
    },
    ladle: {
      w: 68, h: 224,
      draw: v => `
        ${R(-5, -56, 10, 112, 5, SILVER, EDGE)}
        ${C(0, -80, 31, SILVER, EDGE)}${C(2, -78, 23, '#000', 'fill-opacity=".08"')}${E(-12, -90, 6, 9, '#fff', 'fill-opacity=".7"')}
        ${R(-8, 46, 16, 64, 8, v.handle, EDGE)}${C(0, 100, 3.5, '#fff', 'fill-opacity=".6"')}${R(-8, 46, 16, 64, 8, CYL)}`,
    },
    spatula: {
      w: 60, h: 214,
      draw: v => `
        ${R(-4, -40, 8, 60, 3, SILVER)}
        ${R(-27, -106, 54, 72, 14, v.head, EDGE)}
        ${[-13, 0, 13].map(x => R(x - 3, -94, 6, 40, 3, shade(v.head, -0.2))).join('')}
        ${R(-27, -106, 54, 20, 10, '#fff', 'fill-opacity=".25"')}
        ${R(-8, 14, 16, 92, 8, v.head, EDGE)}${R(-8, 14, 16, 92, 8, CYL)}`,
    },
    whisk: {
      w: 54, h: 204,
      draw: v => `
        ${['M-4 20 C-30 -20 -26 -80 0 -100 C26 -80 30 -20 4 20', 'M-3 20 C-18 -20 -15 -82 0 -100 C15 -82 18 -20 3 20', 'M-1 20 C-6 -20 -5 -84 0 -100 C5 -84 6 -20 1 20'].map(d => L(d, '#a9b5c1', 3)).join('')}
        ${L('M-4 20 C-30 -20 -26 -80 0 -100', '#fff', 1, 'stroke-opacity=".6"')}
        ${R(-6, 10, 12, 16, 3, SILVER)}
        ${R(-8, 22, 16, 80, 8, v.handle, EDGE)}${R(-8, 22, 16, 80, 8, CYL)}`,
    },
  });
  function flip(v, m) {
    return `<g transform="scale(${m} 1)">
      ${P('M-4 -56 C12 -56 24 -44 22 -24 C20 -8 14 0 15 16 C16 34 18 54 0 57 C-16 58 -20 44 -20 28 C-20 10 -24 -6 -24 -24 C-24 -44 -16 -56 -4 -56 Z', v.sole, EDGE)}
      ${P('M-4 -50 C8 -50 18 -40 16 -24 C14 -10 9 -2 10 14 C11 32 12 48 0 51 C-11 52 -14 40 -14 26 C-14 8 -18 -6 -18 -24 C-18 -42 -12 -50 -4 -50 Z', shade(v.sole, 0.3))}
      ${L('M-2 -36 C-12 -20 -20 -10 -20 0 M-2 -36 C10 -22 18 -10 20 -2', v.strap, 7)}
      ${C(-2, -36, 4.5, v.strap)}</g>`;
  }

  Object.assign(ITEMS, {
    nailfile: {
      w: 20, h: 152,
      draw: v => `
        ${R(-9, -76, 18, 152, 9, v.color, EDGE)}
        ${R(-9, 30, 18, 46, 9, shade(v.color, -0.2))}
        ${Array.from({ length: 12 }, (_, i) => C(i % 2 ? 3 : -3, -64 + i * 8, 1.2, '#fff', 'fill-opacity=".55"')).join('')}
        ${R(-9, -76, 18, 152, 9, CYL)}`,
    },
    mirror: {
      w: 92, h: 166,
      draw: v => `
        ${R(-9, 4, 18, 78, 9, v.frame, EDGE)}${R(-9, 4, 18, 78, 9, CYL)}
        ${C(0, -37, 45, v.frame, EDGE)}
        ${C(0, -37, 37, '#e3f2fa')}
        ${P('M-30 -50 L-12 -72 L-2 -72 L-30 -38 Z M-26 -24 L8 -66 L14 -60 L-20 -18 Z', '#fff', 'fill-opacity=".7"')}
        ${C(0, -37, 45, TOP)}`,
    },
    rollingPin: {
      w: 206, h: 42,
      draw: v => `
        ${R(-102, -8, 36, 16, 8, v.handle, EDGE)}${R(66, -8, 36, 16, 8, v.handle, EDGE)}
        ${R(-70, -20, 140, 40, 14, '#f3d2a6', EDGE)}
        ${L('M-50 -10 C-20 -14 20 -6 50 -10 M-40 8 C-10 4 30 12 56 6', '#d9ad78', 1.5)}
        ${R(-70, -20, 140, 40, 14, CYLV)}`,
    },
  });

  Object.assign(ITEMS, {
    // --- yatak odası / masa / mutfak dolabı (önden)
    mug: {
      w: 74, h: 64,
      draw: v => `
        ${RING(24, 0, 13, 15, 6, 8, v.color, EDGE)}
        ${R(-28, -30, 52, 60, 12, v.color, EDGE)}
        ${E(-2, -27, 24, 5, shade(v.color, -0.25))}
        ${P('M-2 12 C-10 6 -13 2 -13 -1 A6 6 0 0 1 -2 -3 A6 6 0 0 1 9 -1 C9 2 6 6 -2 12 Z', '#fff', 'fill-opacity=".85"')}
        ${R(-28, -30, 52, 60, 12, CYL)}`,
    },
    mugTop: {
      w: 84, h: 66,
      draw: v => `
        ${R(18, -9, 22, 18, 8, v.color, EDGE)}
        ${C(-8, 0, 32, v.color, EDGE)}${C(-8, 0, 25, '#8a5a3c')}${E(-14, -8, 9, 5, '#fff', 'fill-opacity=".35"')}
        ${C(-8, 0, 32, DOME)}`,
    },
    phone: {
      w: 58, h: 110,
      draw: v => `
        ${R(-28, -54, 56, 108, 12, v.color, EDGE)}
        ${R(-23, -46, 46, 88, 6, '#2e2a40')}
        ${P('M-23 -46 H6 L-23 0 Z', '#fff', 'fill-opacity=".12"')}
        ${R(-8, -51, 16, 3, 1.5, '#2e2a40')}${R(-10, 46, 20, 4, 2, shade(v.color, -0.2))}`,
    },
    headphones: {
      w: 124, h: 104,
      draw: v => `
        ${L('M-46 22 C-50 -44 50 -44 46 22', v.color, 11)}
        ${L('M-44 16 C-46 -36 46 -36 44 16', '#fff', 2.5, 'stroke-opacity=".45"')}
        ${E(-46, 28, 15, 22, v.color, EDGE)}${E(46, 28, 15, 22, v.color, EDGE)}
        ${E(-44, 28, 9, 15, v.pad)}${E(44, 28, 9, 15, v.pad)}`,
    },
    plant: {
      w: 74, h: 106,
      draw: v => `
        ${P('M0 10 C-6 -10 -26 -16 -32 -38 C-12 -36 -4 -20 0 4 Z', '#6cc08a', EDGE)}
        ${P('M0 10 C6 -16 22 -26 30 -48 C10 -44 2 -24 0 4 Z', '#7fd19a', EDGE)}
        ${P('M0 8 C-2 -20 0 -40 4 -52 C10 -34 6 -14 2 8 Z', '#5cb87c', EDGE)}
        ${P('M-24 12 H24 L18 52 Q17 53 14 53 H-14 Q-17 53 -18 52 Z', v.pot, EDGE)}
        ${R(-27, 6, 54, 12, 5, shade(v.pot, -0.12), EDGE)}${R(-27, 6, 54, 5, 2.5, '#fff', 'fill-opacity=".3"')}`,
    },
    frame: {
      w: 72, h: 88,
      draw: v => `
        ${R(-34, -42, 68, 84, 6, v.color, EDGE)}
        ${R(-26, -34, 52, 68, 3, '#cdebfa')}
        ${P('M-26 34 V14 L-10 -2 L4 12 L12 4 L26 18 V34 Z', '#8fd6a6')}${C(12, -18, 6, '#ffe08a')}
        ${R(-34, -42, 68, 84, 6, TOP)}`,
    },
    slippers: {
      w: 110, h: 46,
      draw: v => {
        const one = dx => `<g transform="translate(${dx} 0)">${P('M-26 16 C-30 0 -20 -14 0 -14 C20 -14 30 0 26 16 Z', v.color, EDGE)}${E(0, -8, 18, 9, '#fff', 'fill-opacity=".85"')}${C(0, -12, 6, v.pom)}${R(-28, 13, 56, 8, 4, shade(v.color, -0.15))}</g>`;
        return one(-26) + one(26);
      },
    },
    // --- piknik sepeti (üstten)
    sandwich: {
      w: 96, h: 90,
      draw: () => `
        ${P('M-44 38 L0 -42 L44 38 Z', '#e8b06a', EDGE + ' stroke-linejoin="round"')}
        ${P('M-34 32 L0 -30 L34 32 Z', '#fbe7c3')}
        ${L('M-36 34 L0 -32 L36 34', '#7cc46a', 3, 'stroke-dasharray="6 3"')}
        ${C(-8, 14, 6, '#f2606e', 'fill-opacity=".8"')}${C(10, 20, 5, '#ffd65c', 'fill-opacity=".8"')}`,
    },
    cupcake: {
      w: 62, h: 70,
      draw: v => `
        ${P('M-22 6 H22 L16 34 H-16 Z', v.cup, EDGE)}
        ${L('M-12 8 L-9 32 M0 8 V32 M12 8 L9 32', shade(v.cup, -0.2), 2)}
        ${P('M-27 8 C-32 -6 -18 -14 -12 -14 C-14 -26 0 -32 8 -24 C20 -24 24 -12 20 -6 C30 -4 30 8 26 10 Z', v.frost, EDGE)}
        ${C(4, -30, 6, '#ef4a5a', EDGE)}${C(2, -32, 2, '#fff', 'fill-opacity=".7"')}
        ${[[-14, -2], [6, -10], [16, 2], [-4, 2]].map(([x, y], i) => R(x, y, 6, 2.5, 1.2, ['#7fc8ee', '#ffd65c', '#8fd6a6', '#c3a6ee'][i])).join('')}`,
    },
    strawberry: {
      w: 42, h: 48,
      draw: () => `
        ${P('M0 22 C-14 14 -20 0 -18 -8 C-16 -16 -6 -16 0 -14 C6 -16 16 -16 18 -8 C20 0 14 14 0 22 Z', '#f2556a', EDGE)}
        ${P('M-12 -14 L-4 -12 L0 -22 L4 -12 L12 -14 L6 -8 L0 -10 L-6 -8 Z', '#6cc06a')}
        ${[[-8, -2], [4, -4], [-2, 6], [8, 4], [-6, 10], [2, 14]].map(([x, y]) => E(x, y, 1.2, 2, '#ffe9a6')).join('')}
        ${E(-6, -4, 4, 6, '#fff', 'fill-opacity=".3"')}`,
    },
    grapes: {
      w: 64, h: 82,
      draw: () => `
        ${L('M0 -30 C2 -36 6 -38 10 -40', '#8a5a3c', 3)}${P('M4 -32 C10 -42 24 -40 26 -32 C18 -28 10 -28 4 -32 Z', '#7cc46a')}
        ${[[-14, -18], [0, -20], [14, -18], [-20, -4], [-6, -6], [8, -6], [20, -4], [-12, 8], [2, 8], [14, 8], [-6, 21], [8, 21], [1, 33]].map(([x, y]) => `${C(x, y, 8.5, '#a77fd6', EDGE)}${C(x - 2.5, y - 2.5, 2.4, '#fff', 'fill-opacity=".55"')}`).join('')}`,
    },
    thermos: {
      w: 48, h: 142,
      draw: v => `
        ${R(-16, -71, 32, 24, 6, shade(v.color, -0.2), EDGE)}
        ${R(-20, -50, 40, 120, 14, v.color, EDGE)}
        ${R(-20, -10, 40, 22, 0, '#fffaf5', 'fill-opacity=".85"')}${C(0, 1, 6, v.color)}
        ${R(-20, -50, 40, 120, 14, CYL)}`,
    },
    // --- dikiş kutusu
    spool: {
      w: 46, h: 62,
      draw: v => `
        ${R(-22, -30, 44, 9, 4, '#e8c393', EDGE)}${R(-22, 21, 44, 9, 4, '#e8c393', EDGE)}
        ${R(-17, -21, 34, 42, 3, v.color)}
        ${Array.from({ length: 6 }, (_, i) => L(`M-17 ${-16 + i * 7} H17`, shade(v.color, -0.15), 1.4)).join('')}
        ${R(-17, -21, 34, 42, 3, CYL)}`,
    },
    button: {
      round: true, w: 38, h: 38,
      draw: v => `${C(0, 0, 18, v.color, EDGE)}${C(0, 0, 13, shade(v.color, -0.1))}${[[-4, -4], [4, -4], [-4, 4], [4, 4]].map(([x, y]) => C(x, y, 2.2, shade(v.color, -0.4))).join('')}${C(0, 0, 18, GLOSS)}`,
    },
    pincushion: {
      round: true, w: 74, h: 66,
      draw: () => `
        ${E(0, 4, 34, 28, '#f2606e', EDGE)}
        ${L('M0 -24 V32 M-22 -16 C-30 4 -24 22 -16 28 M22 -16 C30 4 24 22 16 28', '#d9465a', 2)}
        ${P('M-10 -24 L0 -18 L10 -24 L4 -16 L0 -30 L-4 -16 Z', '#6cc06a')}
        ${[[-14, -6, '#7fc8ee'], [12, -2, '#ffd65c'], [-4, 12, '#c3a6ee'], [18, 14, '#8fd6a6']].map(([x, y, c]) => `${L(`M${x} ${y} l-8 -12`, '#b2bec9', 1.6)}${C(x - 8, y - 12, 3.5, c)}`).join('')}
        ${E(0, 4, 34, 28, GLOSS)}`,
    },
    tape: {
      round: true, w: 72, h: 72,
      draw: () => `
        ${C(0, 0, 34, '#ffd65c', EDGE)}${C(0, 0, 24, '#ffe797')}
        ${Array.from({ length: 24 }, (_, i) => `<rect x="-0.8" y="-33" width="1.6" height="${i % 2 ? 4 : 7}" fill="#8a6a2c" transform="rotate(${i * 15})"/>`).join('')}
        ${C(0, 0, 8, '#f2a93a', EDGE)}${C(0, 0, 34, GLOSS)}`,
    },
    thimble: {
      w: 36, h: 40,
      draw: () => `
        ${P('M-15 18 V-4 C-15 -14 -8 -19 0 -19 C8 -19 15 -14 15 -4 V18 Z', SILVER, EDGE)}
        ${R(-17, 14, 34, 6, 3, SILVERV, EDGE)}
        ${[[-7, -8], [0, -12], [7, -8], [-8, 1], [0, -2], [8, 1], [-8, 9], [0, 7], [8, 9]].map(([x, y]) => C(x, y, 1.4, '#7a8794')).join('')}`,
    },
    yarn: {
      round: true, w: 68, h: 68,
      draw: v => `
        ${C(0, 0, 32, v.color, EDGE)}
        ${L('M-26 -16 C-6 -24 18 -12 28 6 M-30 2 C-10 -8 14 4 22 22 M-22 18 C-6 8 8 16 10 30 M-10 -30 C-18 -6 -10 18 2 32', shade(v.color, -0.18), 2.4)}
        ${L('M28 18 C38 24 36 34 30 36', v.color, 3)}
        ${C(0, 0, 32, GLOSS)}`,
    },
    // --- mutfak dolabı (önden)
    spice: {
      w: 42, h: 82,
      draw: v => `
        ${R(-17, -40, 34, 14, 4, v.lid, EDGE)}
        ${R(-18, -28, 36, 68, 8, '#eef8fb', EDGE + ' fill-opacity=".9"')}
        ${R(-18, -2, 36, 42, 8, v.color)}
        ${R(-12, -18, 24, 14, 2, '#fffaf5')}
        ${R(-18, -28, 36, 68, 8, CYL)}`,
    },
    plates: {
      w: 122, h: 42,
      draw: v => [12, 2, -8].map(y => `${E(0, y, 58, 9, '#fffaf5', EDGE)}${E(0, y - 1, 44, 5, v.color, 'fill-opacity=".45"')}`).join('') + E(0, -9, 58, 9, 'none', `stroke="${v.color}" stroke-width="2.5"`),
    },
    teapot: {
      w: 112, h: 86,
      draw: v => `
        ${P('M30 6 C42 -2 48 -14 54 -18 L52 -10 C46 0 42 14 30 20 Z', v.color, EDGE)}
        ${RING(-38, 4, 16, 18, 8, 10, v.color, EDGE)}
        ${P('M-32 34 C-40 20 -38 -10 -20 -20 H20 C38 -10 40 20 32 34 Z', v.color, EDGE)}
        ${R(-20, -28, 40, 10, 5, shade(v.color, -0.12), EDGE)}${C(0, -34, 6, shade(v.color, -0.12), EDGE)}
        ${C(-8, 6, 8, '#fff', 'fill-opacity=".8"')}${C(10, 12, 6, '#fff', 'fill-opacity=".6"')}
        ${P('M-32 34 C-40 20 -38 -10 -20 -20 H20 C38 -10 40 20 32 34 Z', CYL)}`,
    },
    cereal: {
      w: 72, h: 112,
      draw: v => `
        ${R(-34, -54, 68, 108, 4, v.color, EDGE)}
        ${R(-34, -54, 68, 18, 4, shade(v.color, -0.15))}
        ${E(0, 14, 24, 18, '#fffaf5')}${[[-8, 10], [6, 8], [0, 18], [-12, 20], [12, 18]].map(([x, y]) => C(x, y, 5, '#f2b93a')).join('')}
        ${R(-24, -28, 48, 10, 5, '#fff', 'fill-opacity=".85"')}
        ${R(-34, -54, 12, 108, 3, '#000', 'fill-opacity=".08"')}`,
    },
    pasta: {
      w: 66, h: 112,
      draw: v => `
        ${R(-27, -55, 54, 16, 5, v.lid, EDGE)}
        ${R(-30, -40, 60, 94, 12, '#eef8fb', EDGE + ' fill-opacity=".9"')}
        ${Array.from({ length: 14 }, (_, i) => `<rect x="${-22 + (i % 4) * 12}" y="${-6 + Math.floor(i / 4) * 14}" width="9" height="5" rx="2" fill="#f2c66a" transform="rotate(${(i * 37) % 60 - 30} ${-18 + (i % 4) * 12} ${-4 + Math.floor(i / 4) * 14})"/>`).join('')}
        ${R(-30, -40, 60, 94, 12, CYL)}`,
    },
  });

  // ---------------------------------------------------------------- kaplar (çekmece, dolap, oda...)
  function drawer(W, H, c) {
    // üstten görünen çekmece: dış çerçeve, iç duvar, köpük taban, ön panel ve kulp
    return `
      ${R(18, 24, W - 36, H - 30, 30, '#3b2340', 'fill-opacity=".25" filter="url(#dz-cont)"')}
      ${R(10, 0, W - 20, H - 40, 30, c.frame, EDGE)}
      ${R(10, 0, W - 20, 60, 30, TOP)}
      ${R(32, 22, W - 64, H - 84, 18, c.wall)}
      ${R(40, 32, W - 80, H - 100, 14, c.foam)}
      ${R(40, 32, W - 80, H - 100, 14, 'url(#dz-dots)')}
      ${R(40, 32, W - 80, 16, 8, '#000', 'fill-opacity=".07"')}
      ${R(0, H - 62, W, 62, 18, c.front, EDGE)}
      ${R(0, H - 62, W, 24, 12, TOP)}
      ${R(W / 2 - 50, H - 40, 100, 16, 8, GOLD, EDGE)}
      ${R(W / 2 - 50, H - 40, 100, 6, 3, '#fff', 'fill-opacity=".35"')}`;
  }

  function pencilCase(W, H, c) {
    return `
      ${R(18, 26, W - 36, H - 30, 40, '#3b2340', 'fill-opacity=".25" filter="url(#dz-cont)"')}
      ${R(0, 0, W, H, 42, c.shell, EDGE)}
      ${R(0, 0, W, 80, 42, TOP)}
      ${R(13, 13, W - 26, H - 26, 32, 'none', `stroke="${c.zip}" stroke-width="9" stroke-dasharray="2.6 2.6"`)}
      ${R(26, 26, W - 52, H - 52, 26, c.wall)}
      ${R(34, 36, W - 68, H - 70, 20, c.foam)}
      ${R(34, 36, W - 68, H - 70, 20, 'url(#dz-dots)')}
      ${R(34, 36, W - 68, 14, 7, '#000', 'fill-opacity=".06"')}
      ${R(W - 22, H / 2 - 34, 30, 68, 12, SILVER, EDGE)}${R(W - 14, H / 2 - 18, 14, 36, 7, c.wall)}`;
  }
  function kidsRoom(W, H) {
    const fy = 440; // zemin çizgisi
    return `
      <defs>
        <pattern id="dz-wp-oda" width="56" height="56" patternUnits="userSpaceOnUse"><rect width="56" height="56" fill="#fde7dc"/><circle cx="14" cy="14" r="3" fill="#f9c9b8"/><path d="M42 36 l2 4.5 4.8.5-3.6 3.2 1 4.8-4.2-2.5-4.2 2.5 1-4.8-3.6-3.2 4.8-.5z" fill="#fbd7a8"/></pattern>
        <linearGradient id="dz-sky-oda" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ed6f5"/><stop offset="1" stop-color="#dff2fc"/></linearGradient>
        <clipPath id="dz-clip-oda"><rect width="${W}" height="${H}" rx="30"/></clipPath>
      </defs>
      ${R(14, 22, W - 28, H - 24, 30, '#3b2340', 'fill-opacity=".22" filter="url(#dz-cont)"')}
      <g clip-path="url(#dz-clip-oda)">
        ${R(0, 0, W, fy, 0, 'url(#dz-wp-oda)')}
        ${R(0, fy, W, H - fy, 0, '#f0cfae')}
        ${Array.from({ length: 4 }, (_, i) => R(0, fy + 6 + i * 36, W, 2, 0, '#e2b991')).join('')}
        ${Array.from({ length: 12 }, (_, i) => R((i * 173) % W, fy + 8 + (i % 4) * 36, 2, 34, 0, '#e2b991')).join('')}
        ${R(0, fy - 10, W, 14, 0, '#fffaf5')}${R(0, fy + 2, W, 3, 0, '#000', 'fill-opacity=".06"')}
        <!-- pencere -->
        ${R(352, 44, 196, 172, 14, '#fffaf5', EDGE)}${R(364, 56, 172, 148, 8, 'url(#dz-sky-oda)')}
        ${E(420, 110, 26, 12, '#fff')}${E(440, 102, 18, 13, '#fff')}${E(500, 150, 20, 9, '#fff', 'fill-opacity=".85"')}
        ${C(512, 84, 13, '#ffe08a')}
        ${R(447, 56, 6, 148, 0, '#fffaf5')}${R(364, 127, 172, 6, 0, '#fffaf5')}
        ${R(336, 34, 228, 10, 5, '#d9b3e8')}
        ${P('M338 40 H382 C378 110 386 170 398 226 H338 Z', '#f7b6c8', EDGE)}${P('M562 40 H518 C522 110 514 170 502 226 H562 Z', '#f7b6c8', EDGE)}
        ${L('M350 50 V214 M366 50 C364 120 370 180 380 220 M550 50 V214 M534 50 C536 120 530 180 520 220', '#fff', 2, 'stroke-opacity=".4"')}
        <!-- kitaplık -->
        ${R(36, 60, 208, 382, 12, '#bfe6d9', EDGE)}
        ${R(50, 74, 180, 354, 6, '#a3d6c5')}
        ${[200, 320, 422].map(y => `${R(42, y, 196, 12, 4, '#d5f0e7', EDGE)}${R(42, y + 10, 196, 4, 0, '#000', 'fill-opacity=".08"')}`).join('')}
        ${R(36, 60, 208, 14, 7, '#d5f0e7', EDGE)}
        <!-- oyuncak dolabı -->
        ${R(296, 338, 268, 102, 12, '#fff2d6', EDGE)}${R(296, 332, 268, 14, 7, '#ffe3b0', EDGE)}
        ${R(308, 354, 118, 78, 8, '#f2dcb3')}${R(434, 354, 118, 78, 8, '#f2dcb3')}
        <!-- askılar ve saat -->
        ${C(612, 96, 5, GOLD, EDGE)}${C(720, 94, 5, GOLD, EDGE)}
        <!-- yatak -->
        ${R(842, 230, 50, 214, 18, '#c9b3ec', EDGE)}${R(842, 230, 50, 30, 15, TOP)}
        ${R(586, 330, 290, 64, 16, '#fffaf5', EDGE)}
        ${P('M586 360 H760 C770 360 776 370 776 380 V420 C776 428 770 432 762 432 H600 C592 432 586 426 586 418 Z', '#9ed3ef', EDGE)}
        ${[610, 650, 690, 730].map(x => C(x, 396, 5, '#fff', 'fill-opacity=".6"')).join('')}
        ${R(586, 392, 290, 12, 4, '#000', 'fill-opacity=".05"')}
        ${R(596, 424, 12, 22, 4, '#c9b3ec')}${R(850, 424, 12, 22, 4, '#c9b3ec')}
        <!-- halı ve ayakkabılık -->
        ${E(560, 512, 200, 40, '#f9c6d3')}${E(560, 512, 170, 30, 'none', 'stroke="#fff" stroke-opacity=".6" stroke-width="4" stroke-dasharray="10 8"')}
        ${R(236, 528, 130, 26, 13, '#d9c6f0', EDGE)}
      </g>
      ${R(0, 0, W, H, 30, 'none', 'stroke="#fff" stroke-width="10"')}${R(0, 0, W, H, 30, 'none', EDGE)}`;
  }

  function fridge(W, H) {
    return `
      <defs><radialGradient id="dz-fr-in" cx=".5" cy=".05" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcedf4"/></radialGradient></defs>
      ${R(14, 22, W - 28, H - 24, 40, '#3b2340', 'fill-opacity=".22" filter="url(#dz-cont)"')}
      ${R(0, 0, W, H, 40, '#bfe3ef', EDGE)}${R(0, 0, W, 80, 40, TOP)}
      ${R(24, 24, W - 48, H - 48, 26, 'url(#dz-fr-in)')}
      ${R(W / 2 - 60, 32, 120, 9, 4.5, '#fff6c9')}${E(W / 2, 46, 120, 16, '#fff9dc', 'fill-opacity=".45"')}
      ${[215, 375].map(y => `${R(30, y, W - 60, 12, 5, '#cbe8f3', EDGE + ' fill-opacity=".9"')}${R(30, y, W - 60, 4, 2, '#fff', 'fill-opacity=".8"')}${R(36, y + 12, W - 72, 8, 4, '#000', 'fill-opacity=".05"')}`).join('')}
      ${R(36, 398, W - 72, 222, 16, '#e3f1f7', EDGE)}`;
  }
  function fridgeFront(W) {
    return `
      ${R(330, 352, 232, 26, 9, '#fffaf5', EDGE)}${Array.from({ length: 6 }, (_, i) => E(352 + i * 37.5, 352, 15, 6, '#f1e7da')).join('')}${R(330, 366, 232, 12, 6, '#000', 'fill-opacity=".05"')}
      ${R(36, 478, W - 72, 142, 16, '#c7e6f2', EDGE + ' fill-opacity=".5"')}
      ${R(36, 478, W - 72, 10, 5, '#fff', 'fill-opacity=".8"')}
      ${R(W / 2 - 60, 494, 120, 12, 6, '#fff', 'fill-opacity=".85"')}
      ${P(`M60 600 L120 488 H150 L90 600 Z`, '#fff', 'fill-opacity=".25"')}`;
  }
  function jewelryBox(W, H) {
    return `
      <defs><radialGradient id="dz-velvet-taki" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#bfe4e0"/><stop offset="1" stop-color="#8fcac4"/></radialGradient></defs>
      ${R(18, 24, W - 36, H - 30, 30, '#3b2340', 'fill-opacity=".25" filter="url(#dz-cont)"')}
      ${R(0, 0, W, H, 30, '#fff3ea', EDGE)}${R(0, 0, W, 60, 30, TOP)}
      ${R(10, 10, W - 20, H - 20, 24, 'none', 'stroke="url(#dz-gold)" stroke-width="4"')}
      ${R(26, 26, W - 52, H - 52, 18, '#e8d6c6')}
      ${R(34, 34, W - 68, H - 68, 14, 'url(#dz-velvet-taki)')}
      ${R(34, 34, W - 68, H - 68, 14, 'url(#dz-weave)')}
      ${R(34, 34, W - 68, 14, 7, '#000', 'fill-opacity=".08"')}
      ${R(40, 268, W - 80, 6, 3, '#e8d6c6')}
      ${[[16, 16], [W - 16, 16], [16, H - 16], [W - 16, H - 16]].map(([x, y]) => C(x, y, 8, GOLD, EDGE)).join('')}`;
  }
  function suitcase(W, H) {
    return `
      ${R(18, 26, W - 36, H - 30, 44, '#3b2340', 'fill-opacity=".25" filter="url(#dz-cont)"')}
      ${R(W / 2 - 70, -22, 140, 40, 18, '#9b84d8', EDGE)}${R(W / 2 - 50, -12, 100, 16, 8, '#efe6fb')}
      ${R(0, 0, W, H, 44, '#b9a2ec', EDGE)}${R(0, 0, W, 80, 44, TOP)}
      ${[W * 0.28, W * 0.5, W * 0.72].map(x => R(x - 5, 6, 10, H - 12, 5, '#000', 'fill-opacity=".05"')).join('')}
      ${R(20, 20, W - 40, H - 40, 32, '#8f78d0')}
      ${R(28, 30, W - 56, H - 58, 26, '#f4effc')}
      ${R(28, 30, W - 56, H - 58, 26, 'url(#dz-weave)')}
      ${R(28, 30, W - 56, 14, 7, '#000', 'fill-opacity=".06"')}
      ${R(28, 298, W - 56, 16, 0, '#d9cdf3')}${R(28, 298, W - 56, 4, 0, '#fff', 'fill-opacity=".5"')}
      ${R(W / 2 - 22, 292, 44, 28, 6, SILVER, EDGE)}${R(W / 2 - 12, 299, 24, 14, 3, '#d9cdf3')}`;
  }
  function bathCabinet(W, H) {
    return `
      <defs><pattern id="dz-tile-banyo" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#e3f4f3"/><rect x="1.5" y="1.5" width="41" height="41" rx="5" fill="#eefaf9"/></pattern></defs>
      ${R(14, 22, W - 28, H - 24, 30, '#3b2340', 'fill-opacity=".22" filter="url(#dz-cont)"')}
      ${R(0, 0, W, H, 30, '#fffaf5', EDGE)}${R(0, 0, W, 60, 30, TOP)}
      ${R(22, 22, W - 44, H - 44, 18, 'url(#dz-tile-banyo)')}
      ${R(22, 22, W - 44, 16, 8, '#000', 'fill-opacity=".05"')}
      ${[200, 380].map(y => `${R(26, y, W - 52, 11, 5, '#cfeeee', EDGE + ' fill-opacity=".92"')}${R(26, y, W - 52, 4, 2, '#fff', 'fill-opacity=".85"')}${R(32, y + 11, W - 64, 8, 4, '#000', 'fill-opacity=".05"')}`).join('')}
      ${R(22, 560, W - 44, 58, 0, '#f6ece2')}${R(22, 560, W - 44, 5, 0, '#000', 'fill-opacity=".06"')}
      ${R(0, H - 22, W, 22, 11, '#fffaf5', EDGE)}`;
  }

  function bedroom(W, H) {
    const fy = 440;
    return `
      <defs>
        <pattern id="dz-wp-yatak" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#ece4fb"/><path d="M15 10 q4 6 0 12 q-4 -6 0 -12z M45 40 q4 6 0 12 q-4 -6 0 -12z" fill="#d9ccf5"/></pattern>
        <clipPath id="dz-clip-yatak"><rect width="${W}" height="${H}" rx="30"/></clipPath>
      </defs>
      ${R(14, 22, W - 28, H - 24, 30, '#3b2340', 'fill-opacity=".22" filter="url(#dz-cont)"')}
      <g clip-path="url(#dz-clip-yatak)">
        ${R(0, 0, W, fy, 0, 'url(#dz-wp-yatak)')}
        ${R(0, fy, W, H - fy, 0, '#e9cfb4')}
        ${Array.from({ length: 4 }, (_, i) => R(0, fy + 6 + i * 36, W, 2, 0, '#dbb994')).join('')}
        ${R(0, fy - 10, W, 14, 0, '#fffaf5')}
        <!-- duvar rafı ve şifonyer -->
        ${R(30, 150, 250, 12, 5, '#f6dcc0', EDGE)}${R(30, 160, 250, 4, 0, '#000', 'fill-opacity=".07"')}
        ${R(30, 300, 250, 142, 12, '#fbe6d2', EDGE)}${R(24, 294, 262, 14, 7, '#f3d2b4', EDGE)}
        ${[322, 362, 402].map(y => `${R(44, y, 222, 32, 6, '#f8dcc4', EDGE)}${R(140, y + 13, 30, 6, 3, GOLD)}`).join('')}
        <!-- komodin -->
        ${R(312, 360, 104, 82, 10, '#fbe6d2', EDGE)}${R(306, 354, 116, 12, 6, '#f3d2b4', EDGE)}${R(326, 384, 76, 26, 5, '#f8dcc4', EDGE)}${C(364, 397, 4, GOLD)}
        <!-- yatak -->
        ${R(832, 220, 54, 224, 20, '#f6b8c8', EDGE)}${R(832, 220, 54, 30, 15, TOP)}
        ${R(440, 340, 430, 60, 16, '#fffaf5', EDGE)}
        ${P('M440 368 H690 C700 368 708 378 708 390 V428 C708 436 700 440 692 440 H454 C446 440 440 434 440 426 Z', '#c9b3ec', EDGE)}
        ${[470, 520, 570, 620, 670].map(x => P(`M${x} 384 l6 10 l-6 10 l-6 -10z`, '#fff', 'fill-opacity=".5"')).join('')}
        ${R(450, 430, 12, 16, 4, '#f6b8c8')}${R(846, 430, 12, 16, 4, '#f6b8c8')}
        <!-- askı -->
        ${C(480, 120, 5, GOLD, EDGE)}
        <!-- halı -->
        ${E(560, 515, 190, 38, '#cfeee4')}${E(560, 515, 160, 28, 'none', 'stroke="#fff" stroke-opacity=".6" stroke-width="4" stroke-dasharray="10 8"')}
      </g>
      ${R(0, 0, W, H, 30, 'none', 'stroke="#fff" stroke-width="10"')}${R(0, 0, W, H, 30, 'none', EDGE)}`;
  }
  function deskMat(W, H) {
    return `
      ${R(18, 26, W - 36, H - 30, 30, '#3b2340', 'fill-opacity=".25" filter="url(#dz-cont)"')}
      ${R(0, 0, W, H, 30, '#c7a4e6', EDGE)}${R(0, 0, W, 60, 30, TOP)}
      ${R(14, 14, W - 28, H - 28, 22, '#ede4fa')}
      ${R(14, 14, W - 28, H - 28, 22, 'url(#dz-dots)')}
      ${R(26, 26, W - 52, H - 52, 16, 'none', 'stroke="#c7a4e6" stroke-width="2" stroke-dasharray="8 6"')}
      ${R(26, 250, W - 52, 2, 1, '#c7a4e6', 'fill-opacity=".5"')}`;
  }
  function picnicBasket(W, H) {
    return `
      <defs><pattern id="dz-gingham" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#fff4f6"/><rect width="20" height="40" fill="#f9c6d3" fill-opacity=".55"/><rect width="40" height="20" fill="#f9c6d3" fill-opacity=".55"/></pattern>
        <pattern id="dz-wicker" width="24" height="16" patternUnits="userSpaceOnUse"><rect width="24" height="16" fill="#e2b77c"/><path d="M0 4 Q6 0 12 4 T24 4 M0 12 Q6 8 12 12 T24 12" stroke="#c99a5c" stroke-width="2.5" fill="none"/></pattern></defs>
      ${R(18, 26, W - 36, H - 30, 40, '#3b2340', 'fill-opacity=".25" filter="url(#dz-cont)"')}
      ${R(-16, H / 2 - 50, 40, 100, 18, 'none', 'stroke="#c99a5c" stroke-width="10"')}${R(W - 24, H / 2 - 50, 40, 100, 18, 'none', 'stroke="#c99a5c" stroke-width="10"')}
      ${R(0, 0, W, H, 40, 'url(#dz-wicker)', EDGE)}${R(0, 0, W, 60, 40, TOP)}
      ${R(20, 20, W - 40, H - 40, 30, '#c99a5c')}
      ${R(28, 30, W - 56, H - 58, 24, 'url(#dz-gingham)')}
      ${R(28, 30, W - 56, 14, 7, '#000', 'fill-opacity=".06"')}`;
  }
  function sewingBox(W, H, fabric) {
    return `
      ${R(18, 24, W - 36, H - 30, 30, '#3b2340', 'fill-opacity=".25" filter="url(#dz-cont)"')}
      ${R(0, 0, W, H, 30, '#f0d2b0', EDGE)}${R(0, 0, W, 60, 30, TOP)}
      ${L(`M20 ${H * 0.3} H${W - 20} M20 ${H * 0.7} H${W - 20}`, '#d9b48a', 2, 'stroke-opacity=".5"')}
      ${R(24, 24, W - 48, H - 48, 20, '#d9b48a')}
      ${R(32, 32, W - 64, H - 64, 16, fabric)}
      ${R(32, 32, W - 64, H - 64, 16, 'url(#dz-dots)')}
      ${R(32, 32, W - 64, 14, 7, '#000', 'fill-opacity=".07"')}
      ${R(40, 258, W - 80, 6, 3, '#d9b48a')}`;
  }
  function kitchenCabinet(W, H) {
    return `
      <defs><pattern id="dz-plank-dolap" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#eaf6ef"/><rect x="58" width="2" height="60" fill="#d4ebdd"/></pattern></defs>
      ${R(14, 22, W - 28, H - 24, 30, '#3b2340', 'fill-opacity=".22" filter="url(#dz-cont)"')}
      ${R(0, 0, W, H, 30, '#fff3e3', EDGE)}${R(0, 0, W, 60, 30, TOP)}
      ${R(22, 22, W - 44, H - 44, 18, 'url(#dz-plank-dolap)')}
      ${R(22, 22, W - 44, 16, 8, '#000', 'fill-opacity=".05"')}
      ${[210, 400].map(y => `${R(22, y, W - 44, 14, 4, '#f6dcc0', EDGE)}${R(22, y, W - 44, 4, 2, '#fff', 'fill-opacity=".6"')}${R(28, y + 14, W - 56, 8, 4, '#000', 'fill-opacity=".05"')}`).join('')}
      ${R(22, 600, W - 44, 38, 0, '#f6dcc0')}${R(22, 600, W - 44, 5, 0, '#000', 'fill-opacity=".06"')}
      ${R(0, H - 22, W, 22, 11, '#fff3e3', EDGE)}`;
  }

  // ---------------------------------------------------------------- bölümler
  // slots: { k: eşya türü, v: renk/çeşit, x, y: kabın içindeki konum, r: açı }
  const LEVELS = [
    {
      id: 'makyaj', name: 'Makyaj Çekmecesi', short: 'Rujlar, ojeler, fırçalar',
      W: 700, H: 520, target: 150,
      table: { a: '#efe3f6', b: '#e6d6f0', line: '#d8c4e6', grain: '#d2bce2' },
      slotColor: '#f1bccb',
      drawers: [
        {
          name: 'Üst çekmece',
          container: () => drawer(700, 520, { frame: '#f6b8c8', wall: '#e994ab', foam: '#fde4ea', front: '#f9c6d3' }),
          slots: [
            { k: 'palette', v: { case: '#f9d3dd', pans: ['#f6b1a0', '#e98aa5', '#c8a2e6', '#f3d3a3', '#d9876e', '#9a6a8c'] }, x: 150, y: 116 },
            { k: 'compact', v: { color: '#f4b6c6', petal: '#fde0e8' }, x: 300, y: 116 },
            { k: 'compact', v: { color: '#c9b4ef', petal: '#ebe2fb' }, x: 408, y: 116 },
            { k: 'sponge', v: { color: '#f59ab3' }, x: 530, y: 116 },
            { k: 'sponge', v: { color: '#ffc9a8' }, x: 612, y: 116 },
            { k: 'lipstick', v: { color: '#d93d63', body: '#2f2430' }, x: 88, y: 322 },
            { k: 'lipstick', v: { color: '#f07a8e', body: '#f8c9d4' }, x: 134, y: 322 },
            { k: 'lipstick', v: { color: '#b83a5e', body: '#e9d9f4' }, x: 180, y: 322 },
            { k: 'lipstick', v: { color: '#e9567a', body: '#c9b4ef' }, x: 226, y: 322 },
            { k: 'gloss', v: { cap: '#f5e3c8', color: '#f48aa7' }, x: 286, y: 322 },
            { k: 'gloss', v: { cap: '#f5e3c8', color: '#c8a2e6' }, x: 326, y: 322 },
            { k: 'mascara', v: { cap: '#3a2b3c', tube: '#f7b4c6', band: '#3a2b3c' }, x: 384, y: 318 },
            { k: 'perfume', v: { cap: '#c7b3ef', glass: '#e6dcfb', liquid: '#cbb3f2' }, x: 488, y: 326 },
            { k: 'mascara', v: { cap: '#3a2b3c', tube: '#c9b4ef', band: '#fff' }, x: 590, y: 318 },
          ],
        },
        {
          name: 'Alt çekmece', slotColor: '#dccbf3',
          container: () => drawer(700, 520, { frame: '#cdb8f0', wall: '#a98fdc', foam: '#f1eafc', front: '#d9c8f5' }),
          slots: [
            { k: 'polish', v: { color: '#ef6f8f', cap: '#f8eef1' }, x: 90, y: 112 },
            { k: 'polish', v: { color: '#b49ae8', cap: '#f8eef1' }, x: 150, y: 112 },
            { k: 'polish', v: { color: '#7fd1be', cap: '#f8eef1' }, x: 210, y: 112 },
            { k: 'polish', v: { color: '#ffb36b', cap: '#f8eef1' }, x: 270, y: 112 },
            { k: 'hairclip', v: {}, x: 400, y: 86 },
            { k: 'hairclip', v: {}, x: 400, y: 136 },
            { k: 'comb', v: { color: '#f7a1b4' }, x: 572, y: 90 },
            { k: 'comb', v: { color: '#9fdcc8' }, x: 572, y: 140 },
            { k: 'brush', v: { handle: '#f3a6bb', bristle: '#f5dccd', tip: '#d9a48e' }, x: 96, y: 302 },
            { k: 'brush', v: { handle: '#b49ae8', bristle: '#f5dccd', tip: '#c69a86' }, x: 146, y: 302 },
            { k: 'brush', v: { handle: '#7fd1be', bristle: '#f5dccd', tip: '#d9a48e' }, x: 196, y: 302 },
            { k: 'nailfile', v: { color: '#f7a1b4' }, x: 256, y: 322 },
            { k: 'nailfile', v: { color: '#c3a6ee' }, x: 294, y: 322 },
            { k: 'mirror', v: { frame: '#f6c453' }, x: 402, y: 318 },
            { k: 'perfume', v: { cap: '#f7c0cf', glass: '#fde6ee', liquid: '#f7a1b4' }, x: 560, y: 326 },
          ],
        },
      ],
    },
    {
      id: 'kalem-kutusu', name: 'Kalem Kutusu', short: 'Kalemler, silgi, makas',
      W: 740, H: 500, target: 90,
      table: { a: '#dff3ec', b: '#d3ede4', line: '#c2e2d6', grain: '#bcdccf' },
      slotColor: '#bfe3d6',
      container: () => pencilCase(740, 500, { shell: '#9fdcc8', zip: '#6fbfa6', wall: '#7ccab2', foam: '#e3f6ef' }),
      slots: [
        { k: 'ruler', v: { color: '#bfe0f7' }, x: 206, y: 96 },
        { k: 'notes', v: { color: '#ffe48f' }, x: 412, y: 98 },
        { k: 'eraser', v: { sleeve: '#8fc6f0' }, x: 518, y: 96 },
        { k: 'sharpener', v: { color: '#f7a1b4' }, x: 606, y: 98 },
        { k: 'clip', v: { color: '#c3a6ee' }, x: 664, y: 100 },
        { k: 'scissors', v: { color: '#f58aa6' }, x: 96, y: 312 },
        { k: 'pencil', v: { color: '#ffcf5c' }, x: 160, y: 312 },
        { k: 'pencil', v: { color: '#9fd8f5' }, x: 192, y: 312 },
        { k: 'pencil', v: { color: '#f7a1b4' }, x: 224, y: 312 },
        { k: 'marker', v: { color: '#f27a9b' }, x: 268, y: 312 },
        { k: 'marker', v: { color: '#7fc8ee' }, x: 302, y: 312 },
        { k: 'marker', v: { color: '#8fd6a6' }, x: 336, y: 312 },
        { k: 'highlighter', v: { color: '#fff07a', body: '#fffbe0' }, x: 384, y: 312 },
        { k: 'highlighter', v: { color: '#ffb3d0', body: '#fff0f6' }, x: 425, y: 312 },
        { k: 'glue', v: { cap: '#b39bea', label: '#ffd36b' }, x: 482, y: 312 },
        { k: 'pen', v: { color: '#6f9fe8' }, x: 530, y: 312 },
        { k: 'pen', v: { color: '#e86f8f' }, x: 562, y: 312 },
        { k: 'crayon', v: { color: '#ff9f6b' }, x: 610, y: 320 },
        { k: 'crayon', v: { color: '#b49ae8' }, x: 650, y: 320 },
      ],
    },
    {
      id: 'cocuk-odasi', name: 'Çocuk Odası', short: 'Oyuncakları ve kitapları topla',
      W: 900, H: 580, target: 120,
      table: { a: '#f3e6dc', b: '#ecdcd0', line: '#e0cbbb', grain: '#dcc5b4' },
      slotColor: '#e9c3b4',
      inside: [[390, 462, 470, 100]],
      container: () => kidsRoom(900, 580),
      slots: [
        { k: 'book', v: { color: '#f58aa6' }, x: 68, y: 144 },
        { k: 'bookTall', v: { color: '#7fc8ee' }, x: 100, y: 140 },
        { k: 'bookWide', v: { color: '#ffcf5c' }, x: 134, y: 152 },
        { k: 'book', v: { color: '#9a86d8' }, x: 170, y: 144 },
        { k: 'bookTall', v: { color: '#8fd6a6' }, x: 204, y: 140 },
        { k: 'bookWide', v: { color: '#f7a77a' }, x: 72, y: 272 },
        { k: 'bookWide', v: { color: '#7fb6ee' }, x: 112, y: 272 },
        { k: 'block', v: { color: '#f58aa6', icon: 'heart' }, x: 166, y: 299 },
        { k: 'block', v: { color: '#7fc8ee', icon: 'star' }, x: 208, y: 299 },
        { k: 'block', v: { color: '#ffc04d', icon: 'dot' }, x: 187, y: 257 },
        { k: 'ball', v: { a: '#f58aa6', b: '#7fc8ee', c: '#ffe08a' }, x: 96, y: 389 },
        { k: 'duck', v: { color: '#ffd84d' }, x: 186, y: 394 },
        { k: 'car', v: { color: '#f27a8f' }, x: 362, y: 304 },
        { k: 'lamp', v: { shade: '#ffd0dc', base: '#c9b3ec' }, x: 516, y: 276 },
        { k: 'stacker', v: {}, x: 367, y: 396 },
        { k: 'dino', v: { color: '#8fd6a6', spike: '#5cb889' }, x: 493, y: 400 },
        { k: 'pillow', v: { color: '#ffd9e3' }, x: 790, y: 300 },
        { k: 'teddy', v: { color: '#e0b48c', bow: '#f27a9b' }, x: 668, y: 282 },
        { k: 'backpack', v: { color: '#9ec9f5' }, x: 612, y: 156 },
        { k: 'cap', v: { color: '#f7a77a' }, x: 720, y: 124 },
        { k: 'clock', v: { color: '#f58aa6' }, x: 820, y: 120 },
        { k: 'sneakers', v: { color: '#9fdcc8' }, x: 301, y: 516 },
      ],
    },
    {
      id: 'buzdolabi', name: 'Buzdolabı', short: 'Süt, yumurta, sebzeler',
      W: 600, H: 660, target: 120,
      table: { a: '#e2f1f7', b: '#d6eaf2', line: '#c5dfea', grain: '#c0dbe7' },
      slotColor: '#d2e6ee',
      container: () => fridge(600, 660),
      front: () => fridgeFront(600),
      slots: [
        { k: 'milk', v: { color: '#7fb6ee' }, x: 86, y: 158 },
        { k: 'juice', v: { color: '#ffb54d', cap: '#7cc46a', fruit: '#ff9a3c' }, x: 156, y: 148 },
        { k: 'water', v: { cap: '#7fc8ee', label: '#7fc8ee' }, x: 210, y: 143 },
        { k: 'ketchup', v: { color: '#ef5a5a' }, x: 264, y: 162 },
        { k: 'jam', v: { color: '#e0567c', lid: '#f58aa6' }, x: 330, y: 181 },
        { k: 'cheese', v: {}, x: 420, y: 189 },
        { k: 'butter', v: { color: '#d8eef7' }, x: 522, y: 191 },
        { k: 'yogurt', v: { color: '#f7a1b4' }, x: 72, y: 351 },
        { k: 'yogurt', v: { color: '#c3a6ee' }, x: 124, y: 351 },
        { k: 'yogurt', v: { color: '#ffd36b' }, x: 176, y: 351 },
        { k: 'lemon', v: {}, x: 240, y: 355 },
        { k: 'lemon', v: {}, x: 294, y: 355 },
        ...Array.from({ length: 6 }, (_, i) => ({ k: 'egg', v: {}, x: 352 + i * 37.5, y: 344 })),
        { k: 'carrot', v: {}, x: 152, y: 538 },
        { k: 'carrot', v: {}, x: 152, y: 580 },
        { k: 'broccoli', v: {}, x: 300, y: 573 },
        { k: 'apple', v: { color: '#f2606e' }, x: 390, y: 580 },
        { k: 'apple', v: { color: '#9bd36a' }, x: 452, y: 580 },
        { k: 'apple', v: { color: '#f2606e' }, x: 514, y: 580 },
      ],
    },
    {
      id: 'taki-kutusu', name: 'Takı Kutusu', short: 'Yüzükler, küpeler, kolyeler',
      W: 700, H: 480, target: 150,
      table: { a: '#fbeee6', b: '#f6e4da', line: '#ecd2c4', grain: '#e8cbbb' },
      slotColor: '#7fbcb5',
      drawers: [
        {
          name: 'Üst kat',
          container: () => jewelryBox(700, 480),
          slots: [
            { k: 'ring', v: { metal: GOLD, gem: '#7fc8ee' }, x: 90, y: 140 },
            { k: 'ring', v: { metal: SILVER, gem: '#f27a9b' }, x: 150, y: 140 },
            { k: 'ring', v: { metal: GOLD, gem: '#8fd6a6' }, x: 210, y: 140 },
            { k: 'ring', v: { metal: SILVER, gem: '#c3a6ee' }, x: 270, y: 140 },
            { k: 'ring', v: { metal: GOLD, gem: '#ffd36b' }, x: 330, y: 140 },
            { k: 'hoop', v: { metal: GOLD }, x: 420, y: 140 },
            { k: 'hoop', v: { metal: SILVER }, x: 480, y: 140 },
            { k: 'hoop', v: { metal: GOLD }, x: 540, y: 140 },
            { k: 'brooch', v: { color: '#c3a6ee', gem: '#ffd36b' }, x: 616, y: 140 },
            { k: 'stud', v: { gem: '#f27a9b' }, x: 100, y: 334 },
            { k: 'stud', v: { gem: '#f27a9b' }, x: 144, y: 334 },
            { k: 'stud', v: { pearl: true }, x: 188, y: 334 },
            { k: 'stud', v: { pearl: true }, x: 100, y: 382 },
            { k: 'stud', v: { gem: '#7fc8ee' }, x: 144, y: 382 },
            { k: 'stud', v: { gem: '#7fc8ee' }, x: 188, y: 382 },
            { k: 'brooch', v: { color: '#f7a1b4', gem: '#fff' }, x: 292, y: 358 },
            { k: 'hairclip', v: {}, x: 432, y: 334 },
            { k: 'hairclip', v: {}, x: 432, y: 384 },
            { k: 'bangle', v: { metal: GOLD, gem: '#f27a9b' }, x: 590, y: 358 },
          ],
        },
        {
          name: 'Alt kat',
          container: () => jewelryBox(700, 480),
          slots: [
            { k: 'necklace', v: { metal: GOLD, gem: '#f27a9b' }, x: 128, y: 128 },
            { k: 'bracelet', v: { a: '#f7a1b4', b: '#fbf6ef' }, x: 300, y: 140 },
            { k: 'watch', v: { metal: GOLD, strap: '#f3b8c6' }, x: 424, y: 148 },
            { k: 'pearls', v: {}, x: 568, y: 140 },
            { k: 'necklace', v: { metal: SILVER, gem: '#7fc8ee' }, x: 128, y: 352 },
            { k: 'bracelet', v: { a: '#9fdcc8', b: '#fbf6ef' }, x: 300, y: 360 },
            { k: 'watch', v: { metal: SILVER, strap: '#b9d7f2' }, x: 424, y: 362 },
            { k: 'bangle', v: { metal: SILVER, gem: '#7fc8ee' }, x: 568, y: 360 },
          ],
        },
      ],
    },
    {
      id: 'bavul', name: 'Tatil Bavulu', short: 'Tişört, şapka, güneş gözlüğü',
      W: 780, H: 520, target: 100,
      table: { a: '#fdf1dc', b: '#f8e8cc', line: '#efd8b2', grain: '#ebd1a6' },
      slotColor: '#ddd3f2',
      container: () => suitcase(780, 520),
      slots: [
        { k: 'sunhat', v: { ribbon: '#f27a9b' }, x: 122, y: 132 },
        { k: 'tshirt', v: { color: '#9fdcc8', print: '#fff' }, x: 292, y: 110 },
        { k: 'shorts', v: { color: '#7fb6ee' }, x: 292, y: 238 },
        { k: 'novel', v: { color: '#f7a77a', ribbon: '#f27a9b' }, x: 448, y: 128 },
        { k: 'passport', v: { color: '#5f6fb8' }, x: 568, y: 102 },
        { k: 'camera', v: { color: '#f3b8c6' }, x: 674, y: 102 },
        { k: 'towel', v: { color: '#ffe08a', stripe: '#f7a77a' }, x: 616, y: 224 },
        { k: 'flipL', v: { sole: '#f58aa6', strap: '#fffaf5' }, x: 92, y: 400 },
        { k: 'flipR', v: { sole: '#f58aa6', strap: '#fffaf5' }, x: 154, y: 400 },
        { k: 'sunglasses', v: { frame: '#4a3a48', lens: '#6e5a8a' }, x: 296, y: 368 },
        { k: 'socks', v: { color: '#f7a1b4', stripe: '#fff' }, x: 264, y: 434 },
        { k: 'socks', v: { color: '#9ec9f5', stripe: '#fff' }, x: 326, y: 434 },
        { k: 'sunscreen', v: { color: '#7fd1be', cap: '#fffaf5' }, x: 432, y: 400 },
        { k: 'toothbrush', v: { color: '#f27a9b', bristle: '#9fd8f5' }, x: 498, y: 398 },
        { k: 'tshirt', v: { color: '#f7a1b4', print: '#fff' }, x: 630, y: 402 },
      ],
    },
    {
      id: 'banyo', name: 'Banyo Dolabı', short: 'Şampuan, havlu, sabun',
      W: 620, H: 640, target: 110,
      table: { a: '#e4f4f1', b: '#d8eeea', line: '#c6e3dd', grain: '#c0ded8' },
      slotColor: '#c8e6e3',
      container: () => bathCabinet(620, 640),
      slots: [
        { k: 'shampoo', v: { color: '#f7a1b4', cap: '#fffaf5' }, x: 82, y: 137 },
        { k: 'shampoo', v: { color: '#9fdcc8', cap: '#fffaf5' }, x: 144, y: 137 },
        { k: 'pump', v: { color: '#c3a6ee' }, x: 208, y: 136 },
        { k: 'cotton', v: { lid: '#f7a1b4' }, x: 284, y: 159 },
        { k: 'perfume', v: { cap: '#f7c0cf', glass: '#fde6ee', liquid: '#f7a1b4' }, x: 398, y: 142 },
        { k: 'duck', v: { color: '#ffd84d' }, x: 520, y: 172 },
        { k: 'towelRoll', v: { color: '#9ec9f5', stripe: '#fff' }, x: 92, y: 353 },
        { k: 'towelRoll', v: { color: '#f7a1b4', stripe: '#fff' }, x: 192, y: 353 },
        { k: 'towelRoll', v: { color: '#ffe08a', stripe: '#fff' }, x: 142, y: 299 },
        { k: 'toothpaste', v: { color: '#7fc8ee' }, x: 352, y: 359 },
        { k: 'cream', v: { color: '#f7a1b4' }, x: 474, y: 357 },
        { k: 'cream', v: { color: '#9fdcc8' }, x: 548, y: 357 },
        { k: 'soap', v: { color: '#ffc2d4' }, x: 82, y: 541 },
        { k: 'soap', v: { color: '#c9e9a6' }, x: 168, y: 541 },
        { k: 'comb', v: { color: '#c3a6ee' }, x: 298, y: 543 },
        { k: 'cup', v: { color: '#ffd36b' }, x: 424, y: 503 },
        { k: 'sponge', v: { color: '#9fdcc8' }, x: 528, y: 521 },
      ],
    },
    {
      id: 'mutfak', name: 'Mutfak Çekmecesi', short: 'Çatal, kaşık, bıçak',
      W: 700, H: 520, target: 140,
      table: { a: '#f6eadf', b: '#efe0d2', line: '#e3cfbd', grain: '#dec7b2' },
      slotColor: '#ead2b8',
      drawers: [
        {
          name: 'Çatal bıçak',
          container: () => drawer(700, 520, { frame: '#f2d6b8', wall: '#ddb894', foam: '#fbf0e3', front: '#f5dfc6' }),
          slots: [
            ...['#f7a1b4', '#9fdcc8', '#c3a6ee', '#ffd36b'].map((c, i) => ({ k: 'fork', v: { handle: c }, x: 92 + i * 38, y: 192 })),
            ...['#f7a1b4', '#9fdcc8', '#c3a6ee', '#ffd36b'].map((c, i) => ({ k: 'knife', v: { handle: c }, x: 262 + i * 34, y: 190 })),
            ...['#f7a1b4', '#9fdcc8', '#c3a6ee', '#ffd36b'].map((c, i) => ({ k: 'spoon', v: { handle: c }, x: 424 + i * 40, y: 192 })),
            ...['#f7a1b4', '#9fdcc8', '#c3a6ee', '#ffd36b'].map((c, i) => ({ k: 'teaspoon', v: { handle: c }, x: 130 + i * 140, y: 392, r: 90 })),
          ],
        },
        {
          name: 'Gereçler', slotColor: '#c9e6d9',
          container: () => drawer(700, 520, { frame: '#bfe3d6', wall: '#8fcab5', foam: '#eef8f3', front: '#cfeadf' }),
          slots: [
            { k: 'ladle', v: { handle: '#ffd36b' }, x: 96, y: 196 },
            { k: 'ladle', v: { handle: '#f7a1b4' }, x: 176, y: 196 },
            { k: 'spatula', v: { head: '#f58aa6' }, x: 262, y: 192 },
            { k: 'spatula', v: { head: '#9fd8f5' }, x: 334, y: 192 },
            { k: 'whisk', v: { handle: '#7fc8ee' }, x: 414, y: 190 },
            { k: 'whisk', v: { handle: '#c3a6ee' }, x: 484, y: 190 },
            { k: 'teaspoon', v: { handle: '#9fdcc8' }, x: 568, y: 160 },
            { k: 'teaspoon', v: { handle: '#f7a1b4' }, x: 616, y: 160 },
            { k: 'rollingPin', v: { handle: '#f7a1b4' }, x: 200, y: 394 },
            { k: 'rollingPin', v: { handle: '#9fdcc8' }, x: 470, y: 394 },
          ],
        },
      ],
    },
    {
      id: 'yatak-odasi', name: 'Yatak Odası', short: 'Yastıklar, kitaplar, çerçeveler',
      W: 900, H: 580, target: 110,
      table: { a: '#efe7f7', b: '#e7ddf2', line: '#d9cbe8', grain: '#d4c4e4' },
      slotColor: '#d6c6ee',
      container: () => bedroom(900, 580),
      slots: [
        { k: 'book', v: { color: '#f7a77a' }, x: 62, y: 94 },
        { k: 'bookTall', v: { color: '#9ec9f5' }, x: 94, y: 90 },
        { k: 'book', v: { color: '#f58aa6' }, x: 126, y: 94 },
        { k: 'frame', v: { color: '#f6c453' }, x: 210, y: 106 },
        { k: 'perfume', v: { cap: '#c7b3ef', glass: '#e6dcfb', liquid: '#cbb3f2' }, x: 84, y: 236 },
        { k: 'cream', v: { color: '#f7a1b4' }, x: 160, y: 271 },
        { k: 'plant', v: { pot: '#f7a77a' }, x: 236, y: 241 },
        { k: 'lamp', v: { shade: '#cfeee4', base: '#f6b8c8' }, x: 352, y: 297 },
        { k: 'clock', v: { color: '#c9b3ec' }, x: 364, y: 180 },
        { k: 'cap', v: { color: '#9fdcc8' }, x: 486, y: 150 },
        { k: 'frame', v: { color: '#f7a1b4' }, x: 640, y: 170 },
        { k: 'frame', v: { color: '#9fdcc8' }, x: 740, y: 170 },
        { k: 'teddy', v: { color: '#f3c9a6', bow: '#9ec9f5' }, x: 600, y: 287 },
        { k: 'pillow', v: { color: '#fde2ea' }, x: 700, y: 306 },
        { k: 'pillow', v: { color: '#e6dcfb' }, x: 790, y: 306 },
        { k: 'slippers', v: { color: '#f7a1b4', pom: '#fff' }, x: 560, y: 512 },
      ],
    },
    {
      id: 'calisma-masasi', name: 'Çalışma Masası', short: 'Kulaklık, telefon, kalemler',
      W: 780, H: 520, target: 110,
      table: { a: '#f3eadf', b: '#ece0d2', line: '#e0cfbc', grain: '#dbc7b1' },
      slotColor: '#d6c6ee',
      container: () => deskMat(780, 520),
      slots: [
        { k: 'novel', v: { color: '#9ec9f5', ribbon: '#f27a9b' }, x: 102, y: 112 },
        { k: 'notes', v: { color: '#ffe48f' }, x: 222, y: 90 },
        { k: 'notes', v: { color: '#ffc2d4' }, x: 222, y: 182 },
        { k: 'phone', v: { color: '#f7a1b4' }, x: 322, y: 112 },
        { k: 'headphones', v: { color: '#9fdcc8', pad: '#fffaf5' }, x: 452, y: 112 },
        { k: 'mugTop', v: { color: '#f7a77a' }, x: 592, y: 100 },
        { k: 'sunglasses', v: { frame: '#c3a6ee', lens: '#e3f2fa' }, x: 680, y: 202 },
        { k: 'pencil', v: { color: '#ffcf5c' }, x: 80, y: 362 },
        { k: 'pencil', v: { color: '#9fd8f5' }, x: 112, y: 362 },
        { k: 'pencil', v: { color: '#f7a1b4' }, x: 144, y: 362 },
        { k: 'pen', v: { color: '#6f9fe8' }, x: 186, y: 362 },
        { k: 'pen', v: { color: '#e86f8f' }, x: 218, y: 362 },
        { k: 'ruler', v: { color: '#fbd3df' }, x: 420, y: 300 },
        { k: 'eraser', v: { sleeve: '#c3a6ee' }, x: 330, y: 404 },
        { k: 'sharpener', v: { color: '#9fdcc8' }, x: 430, y: 404 },
        { k: 'clip', v: { color: '#f7a1b4' }, x: 500, y: 402 },
        { k: 'clip', v: { color: '#7fc8ee' }, x: 540, y: 402 },
        { k: 'marker', v: { color: '#c3a6ee' }, x: 620, y: 372 },
        { k: 'marker', v: { color: '#ffb36b' }, x: 662, y: 372 },
      ],
    },
    {
      id: 'piknik', name: 'Piknik Sepeti', short: 'Sandviç, meyve, kek',
      W: 760, H: 500, target: 100,
      table: { a: '#e4f3dc', b: '#d9edcf', line: '#c8e2bb', grain: '#c2ddb3' },
      slotColor: '#f3c2cf',
      container: () => picnicBasket(760, 500),
      slots: [
        { k: 'sandwich', v: {}, x: 112, y: 120 },
        { k: 'sandwich', v: {}, x: 222, y: 120 },
        { k: 'grapes', v: {}, x: 330, y: 122 },
        { k: 'thermos', v: { color: '#9ec9f5' }, x: 410, y: 150 },
        { k: 'juice', v: { color: '#ffb54d', cap: '#7cc46a', fruit: '#ff9a3c' }, x: 472, y: 150 },
        { k: 'cheese', v: {}, x: 590, y: 102 },
        { k: 'lemon', v: {}, x: 568, y: 172 },
        { k: 'lemon', v: {}, x: 630, y: 172 },
        { k: 'cupcake', v: { cup: '#9fdcc8', frost: '#ffd9e3' }, x: 100, y: 362 },
        { k: 'cupcake', v: { cup: '#c3a6ee', frost: '#fff3d6' }, x: 172, y: 362 },
        { k: 'strawberry', v: {}, x: 244, y: 340 },
        { k: 'strawberry', v: {}, x: 294, y: 340 },
        { k: 'strawberry', v: {}, x: 244, y: 396 },
        { k: 'strawberry', v: {}, x: 294, y: 396 },
        { k: 'apple', v: { color: '#f2606e' }, x: 374, y: 362 },
        { k: 'apple', v: { color: '#9bd36a' }, x: 444, y: 362 },
        { k: 'towel', v: { color: '#fffaf5', stripe: '#f58aa6' }, x: 580, y: 360 },
      ],
    },
    {
      id: 'dikis-kutusu', name: 'Dikiş Kutusu', short: 'Makaralar, düğmeler, yün',
      W: 700, H: 480, target: 140,
      table: { a: '#fdf0e6', b: '#f8e6d8', line: '#eed3c0', grain: '#eacdb6' },
      slotColor: '#e9a9bd',
      drawers: [
        {
          name: 'Üst kat',
          container: () => sewingBox(700, 480, '#f9c6d3'),
          slots: [
            ...['#f27a9b', '#7fc8ee', '#ffd36b', '#8fd6a6', '#c3a6ee', '#ffb36b'].map((c, i) => ({ k: 'spool', v: { color: c }, x: 80 + i * 52, y: 122 })),
            { k: 'thimble', v: {}, x: 432, y: 112 },
            { k: 'thimble', v: {}, x: 482, y: 112 },
            { k: 'pincushion', v: {}, x: 590, y: 122 },
            { k: 'tape', v: {}, x: 108, y: 356 },
            { k: 'scissors', v: { color: '#7fc8ee' }, x: 232, y: 352 },
            { k: 'spool', v: { color: '#f7a1b4' }, x: 332, y: 360 },
            { k: 'spool', v: { color: '#9fdcc8' }, x: 384, y: 360 },
            { k: 'yarn', v: { color: '#c3a6ee' }, x: 484, y: 358 },
            { k: 'yarn', v: { color: '#ffb36b' }, x: 580, y: 358 },
          ],
        },
        {
          name: 'Alt kat', slotColor: '#a6d6c6',
          container: () => sewingBox(700, 480, '#cfeee4'),
          slots: [
            ...['#f27a9b', '#7fc8ee', '#ffd36b', '#8fd6a6', '#c3a6ee', '#ffb36b', '#f7a1b4', '#9fdcc8'].map((c, i) => ({ k: 'button', v: { color: c }, x: 92 + (i % 4) * 58, y: i < 4 ? 108 : 168 })),
            { k: 'yarn', v: { color: '#f27a9b' }, x: 410, y: 138 },
            { k: 'yarn', v: { color: '#7fc8ee' }, x: 500, y: 138 },
            { k: 'scissors', v: { color: '#f58aa6' }, x: 604, y: 160 },
            ...['#ffd36b', '#c3a6ee', '#f27a9b', '#8fd6a6'].map((c, i) => ({ k: 'spool', v: { color: c }, x: 92 + i * 54, y: 362 })),
            { k: 'pincushion', v: {}, x: 390, y: 362 },
            { k: 'tape', v: {}, x: 500, y: 362 },
          ],
        },
      ],
    },
    {
      id: 'mutfak-dolabi', name: 'Mutfak Dolabı', short: 'Baharatlar, kavanozlar, demlik',
      W: 640, H: 660, target: 120,
      table: { a: '#fdf3e4', b: '#f8ead4', line: '#efd9b8', grain: '#ebd2ac' },
      slotColor: '#cfe6da',
      container: () => kitchenCabinet(640, 660),
      slots: [
        ...['#e05a3c', '#f2b93a', '#7cc46a', '#b5703f', '#f27a9b'].map((c, i) => ({ k: 'spice', v: { color: c, lid: '#fffaf5' }, x: 70 + i * 48, y: 168 })),
        { k: 'jam', v: { color: '#f2a93a', lid: '#ffd36b' }, x: 336, y: 175 },
        { k: 'jam', v: { color: '#e0567c', lid: '#f58aa6' }, x: 402, y: 175 },
        { k: 'mug', v: { color: '#9ec9f5' }, x: 484, y: 177 },
        { k: 'mug', v: { color: '#f7a1b4' }, x: 566, y: 177 },
        { k: 'plates', v: { color: '#7fc8ee' }, x: 102, y: 378 },
        { k: 'teapot', v: { color: '#f7a1b4' }, x: 248, y: 356 },
        { k: 'pasta', v: { lid: '#f7a77a' }, x: 378, y: 343 },
        { k: 'pasta', v: { lid: '#9fdcc8' }, x: 452, y: 343 },
        { k: 'spice', v: { color: '#c3a6ee', lid: '#fffaf5' }, x: 530, y: 358 },
        { k: 'spice', v: { color: '#ffd36b', lid: '#fffaf5' }, x: 580, y: 358 },
        { k: 'cereal', v: { color: '#ffb36b' }, x: 80, y: 543 },
        { k: 'cereal', v: { color: '#9fdcc8' }, x: 160, y: 543 },
        { k: 'plates', v: { color: '#f58aa6' }, x: 290, y: 578 },
        { k: 'jam', v: { color: '#c3a6ee', lid: '#e6dcfb' }, x: 410, y: 565 },
        { k: 'thermos', v: { color: '#f7a77a' }, x: 500, y: 528 },
        { k: 'mug', v: { color: '#ffd36b' }, x: 574, y: 567 },
      ],
    },
  ];

  window.DuzenleData = { ITEMS, LEVELS, defs };
})();
