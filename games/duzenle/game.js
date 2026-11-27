/*
 * Düzenle — rahatlatıcı yerleştirme oyunu.
 * Dağınık eşyaları sürükleyip boyutuna uyan bölmeye bırak. Bazı bölümlerde birden çok çekmece (kat) var.
 * Çizimler ve bölümler: art.js
 */
(function () {
  'use strict';

  const DZ = window.DuzenleData;
  const { ITEMS, LEVELS } = DZ;
  const NS = 'http://www.w3.org/2000/svg';
  const HINTS = 3;
  const PAD = 10;        // bölme, eşyadan bu kadar büyük
  const FIT_MIN = 0.75;  // eşya, bölmenin asıl sahibinin en az %75'i boyunda olmalı
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98];

  // ---------------------------------------------------------------- yardımcılar
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const fmt = s => { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const starsHTML = n => '<b>★</b>'.repeat(n) + '★'.repeat(3 - n);
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const STAR = 'M0 -10 Q1.6 -1.6 10 0 Q1.6 1.6 0 10 Q-1.6 1.6 -10 0 Q-1.6 -1.6 0 -10 Z';
  const drawersOf = L => L.drawers || [{ name: '', container: L.container, front: L.front, slots: L.slots }];
  const allSlots = L => drawersOf(L).flatMap(d => d.slots);

  // bölme: eşyanın kendisi değil, boyutuna göre oyulmuş yuvarlak köşeli (ya da oval) yer
  function slotShape(k) {
    const it = ITEMS[k], w = it.w + PAD, h = it.h + PAD;
    if (it.round) return `<ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}" fill="#000"/>`;
    return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${Math.min(16, Math.min(w, h) / 2.6).toFixed(1)}" fill="#000"/>`;
  }

  // bir çekmecenin tamamlanmış hali: kapaklar ve liste için
  function finishedMarkup(D, withItems = true) {
    return `<g>${D.container()}</g>${withItems ? D.slots.map(s => `<g transform="translate(${s.x} ${s.y}) rotate(${s.r || 0})" filter="url(#dz-placed)">${ITEMS[s.k].draw(s.v)}</g>`).join('') : ''}${D.front ? `<g>${D.front()}</g>` : ''}`;
  }
  function tablePattern(L, id) {
    const t = L.table;
    return `<pattern id="${id}" width="260" height="176" patternUnits="userSpaceOnUse">
      <rect width="260" height="176" fill="${t.a}"/><rect y="88" width="260" height="88" fill="${t.b}"/>
      <rect y="86" width="260" height="3" fill="${t.line}"/><rect y="174" width="260" height="2" fill="${t.line}"/>
      <rect x="170" y="0" width="2" height="88" fill="${t.line}"/><rect x="60" y="88" width="2" height="88" fill="${t.line}"/>
      <path d="M0 30 C70 24 140 38 260 30 M0 58 C90 62 160 50 260 60 M0 120 C80 114 170 128 260 118 M0 150 C70 156 150 144 260 152" fill="none" stroke="${t.grain}" stroke-width="2" opacity=".55"/>
    </pattern>`;
  }

  // kapak resmi: ilk bölümün üst çekmecesi, bazı eşyalar dağınık
  function coverSVG(w, h) {
    const L = LEVELS[0], D = drawersOf(L)[0], out = { 3: [120, 330, -28], 6: [560, 110, 34], 11: [790, 380, -60], 13: [-110, 150, 24], 9: [380, 300, 70] };
    const items = D.slots.map((s, i) => {
      const o = out[i];
      if (!o) return `<g transform="translate(${s.x} ${s.y}) rotate(${s.r || 0})" filter="url(#dz-placed)">${ITEMS[s.k].draw(s.v)}</g>`;
      return '';
    }).join('');
    const loose = Object.keys(out).map(i => { const s = D.slots[i], o = out[i]; return `<g transform="translate(${o[0]} ${o[1]}) rotate(${o[2]})" filter="url(#dz-drop)">${ITEMS[s.k].draw(s.v)}</g>`; }).join('');
    const slots = Object.keys(out).map(i => { const s = D.slots[i]; return `<g transform="translate(${s.x} ${s.y}) rotate(${s.r || 0})" filter="url(#dz-slotc)">${slotShape(s.k)}</g>`; }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="-200 -50 1100 733" preserveAspectRatio="xMidYMid slice">
      <defs>${DZ.defs()}${tablePattern(L, 'dz-tblc')}${slotFilter('dz-slotc', L.slotColor)}</defs>
      <rect x="-400" y="-300" width="1600" height="1300" fill="url(#dz-tblc)"/>
      <g>${D.container()}</g>${slots}${items}${loose}</svg>`;
  }
  function drawCover(canvas) {
    const img = new Image();
    img.onload = () => { const c = canvas.getContext('2d'); c.drawImage(img, 0, 0, canvas.width, canvas.height); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(coverSVG(canvas.width, canvas.height));
  }
  // bölmenin içe gölgeli, oyulmuş görünümü
  function slotFilter(id, color) {
    return `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
      <feFlood flood-color="${color}"/><feComposite in2="SourceAlpha" operator="in" result="fill"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="bl"/><feOffset in="bl" dx="0" dy="4" result="off"/>
      <feComposite in="SourceAlpha" in2="off" operator="out" result="rim"/>
      <feFlood flood-color="#3b2340" flood-opacity=".33"/><feComposite in2="rim" operator="in" result="sh"/>
      <feMerge><feMergeNode in="fill"/><feMergeNode in="sh"/></feMerge>
    </filter>`;
  }

  // ---------------------------------------------------------------- ses
  function makeAudio() {
    let ctx = null;
    function ensure() { if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; }
    function tone(f, dur, type = 'sine', vol = 0.1, delay = 0) {
      const a = ensure(); if (!a) return;
      const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.03);
    }
    return {
      pick() { tone(880, 0.05, 'triangle', 0.035); },
      place(step) { const f = PENTA[Math.min(step, PENTA.length - 1)]; tone(f, 0.4, 'sine', 0.12); tone(f * 2, 0.22, 'sine', 0.035); tone(f * 1.5, 0.3, 'triangle', 0.03, 0.05); },
      wrong() { tone(240, 0.1, 'triangle', 0.06); tone(190, 0.14, 'triangle', 0.05, 0.07); },
      hint() { [988, 1319].forEach((f, i) => tone(f, 0.2, 'sine', 0.06, i * 0.08)); },
      drawer() { tone(330, 0.12, 'triangle', 0.05); tone(440, 0.14, 'triangle', 0.04, 0.06); },
      win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.5, 'sine', 0.1, i * 0.1)); },
      close() { if (ctx && ctx.close) ctx.close().catch(() => {}); },
    };
  }

  // ---------------------------------------------------------------- oyun
  function mount(host, api) {
    const KEY = api.gameStoreKey;
    const save = Object.assign({ v: 1, sound: true, levels: {} }, api.store.get(KEY, {}));
    const persist = () => api.store.set(KEY, save);
    const rec = i => save.levels[LEVELS[i].id] || {};
    const unlocked = i => i === 0 || !!rec(i - 1).done;
    const audio = makeAudio();
    const sfx = (name, a) => { if (save.sound) try { audio[name](a); } catch (e) { /* ses yok */ } };

    const root = document.createElement('div');
    root.className = 'dz-root';
    host.appendChild(root);
    const defsHost = document.createElement('div');
    defsHost.className = 'dz-defs';
    defsHost.innerHTML = `<svg width="0" height="0" aria-hidden="true" focusable="false"><defs>${DZ.defs()}</defs></svg>`;
    const view = document.createElement('div');
    view.className = 'dz-view';
    root.append(defsHost, view);

    let destroyed = false;
    const rafs = new Set();
    function tween(ms, fn, done) {
      const t0 = performance.now();
      const step = now => {
        rafs.delete(id);
        if (destroyed) return;
        const t = Math.min(1, (now - t0) / ms);
        fn(t);
        if (t < 1) { id = requestAnimationFrame(step); rafs.add(id); } else if (done) done();
      };
      let id = requestAnimationFrame(step); rafs.add(id);
    }
    const timers = new Set();
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!destroyed) fn(); }, ms); timers.add(t); return t; };

    let play = null;

    // ---------------- bölüm listesi
    function showMap() {
      stopPlay();
      const total = LEVELS.reduce((s, L, i) => s + (rec(i).stars || 0), 0);
      view.innerHTML = `
        <div class="dz-map">
          <div class="dz-map-head">
            <div><h2 class="dz-display">Düzenle</h2><p>Dağınık eşyaları sürükle, her birini kendine uyan bölmeye yerleştir.</p></div>
            <div class="dz-total"><b>★</b> ${total} / ${LEVELS.length * 3}</div>
          </div>
          <div class="dz-levels">
            ${LEVELS.map((L, i) => {
              const r = rec(i), open = unlocked(i), D = drawersOf(L)[0], n = drawersOf(L).length;
              return `<button class="dz-level${open ? '' : ' locked'}" data-go="${i}" ${open ? '' : 'disabled'} aria-label="${i + 1}. bölüm: ${L.name}${open ? '' : ', kilitli'}">
                <span class="dz-thumb"><svg viewBox="-20 -20 ${L.W + 40} ${L.H + 40}" aria-hidden="true">${finishedMarkup(D, !!r.done)}</svg>${open ? '' : '<span class="dz-lock">🔒</span>'}${n > 1 ? `<span class="dz-layers">${n} çekmece</span>` : ''}</span>
                <span class="dz-level-num">${i + 1}</span>
                <span class="dz-level-name dz-display">${L.name}</span>
                <span class="dz-level-sub">${open ? (r.done ? `<span class="dz-stars">${starsHTML(r.stars || 0)}</span>` : `${L.short} · ${allSlots(L).length} eşya`) : 'Önceki bölümü bitir'}</span>
              </button>`;
            }).join('')}
          </div>
          <div class="dz-map-foot"><button class="dz-link" data-act="reset" type="button">İlerlemeyi sıfırla</button></div>
        </div>`;
      view.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => startLevel(+b.dataset.go)));
      view.querySelector('[data-act="reset"]').addEventListener('click', () => {
        modal(`<h3 class="dz-display">Sıfırlansın mı?</h3><p>Tüm yıldızlar ve açılan bölümler silinir.</p>
          <div class="dz-actions"><button class="dz-btn alt" data-m="no">Vazgeç</button><button class="dz-btn" data-m="yes">Sıfırla</button></div>`,
        { yes() { save.levels = {}; persist(); showMap(); }, no() { closeModal(); } });
      });
    }

    function modal(html, handlers) {
      closeModal();
      const m = document.createElement('div');
      m.className = 'dz-modal';
      m.innerHTML = `<div class="dz-card" role="dialog" aria-modal="true">${html}</div>`;
      m.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b && handlers[b.dataset.m]) handlers[b.dataset.m](); });
      root.appendChild(m);
      const first = m.querySelector('.dz-btn:not(.alt)') || m.querySelector('.dz-btn');
      if (first) first.focus({ preventScroll: true });
      return m;
    }
    function closeModal() { root.querySelectorAll('.dz-modal').forEach(m => m.remove()); }

    // ---------------- yerleşim: sahne boyutu ve dağınık eşyaların duracağı alanlar
    function layout(L, aw, ah) {
      const asp = clamp(aw / Math.max(1, ah), 0.45, 3);
      const W = L.W, H = L.H, top = drawersOf(L).length > 1 ? 70 : 0; // çekmece düğmelerine yer
      if (asp >= 1.05) {
        const VH = H + 100 + top;
        const VW = Math.max(W + 2 * 220, VH * asp);
        const side = (VW - W) / 2, cy = (VH - H + top) / 2;
        const zones = [
          [20, 24, side - 30, VH - 48, 1], [side + W + 10, 24, side - 30, VH - 48, 1],
          [side + 30, cy + 20, W - 60, H - 60, 1.6], // çekmecenin üstü de dağınık
        ];
        return { mode: 'land', VW, VH, cx: side, cy, zones };
      }
      const VW = W + 60;
      const VH = Math.max(H + 380 + top, VW / asp);
      const cy = 30 + top;
      const zones = [[24, cy + H + 20, VW - 48, VH - H - cy - 40, 1], [50, cy + 20, W - 40, H - 40, 0.9]];
      return { mode: 'port', VW, VH, cx: 30, cy, zones };
    }
    function scatter(items, zones) {
      const area = zones.map(z => Math.max(1, z[2] * z[3]) * (z[4] || 1));
      const sum = area.reduce((a, b) => a + b, 0);
      const done = [];
      [...items].sort(() => Math.random() - 0.5).forEach(it => {
        const rad = Math.max(it.w, it.h) * 0.5;
        let best = null, bestScore = -Infinity;
        for (let k = 0; k < 40; k++) {
          let pick = Math.random() * sum, zi = 0;
          while (pick > area[zi] && zi < zones.length - 1) pick -= area[zi++];
          const z = zones[zi], m = Math.min(rad * 0.35, z[2] / 2, z[3] / 2);
          const x = z[0] + m + Math.random() * Math.max(0, z[2] - 2 * m);
          const y = z[1] + m + Math.random() * Math.max(0, z[3] - 2 * m);
          let score = 1e9;
          for (const o of done) score = Math.min(score, Math.hypot(o.x - x, o.y - y) - (o.rad + rad) * 0.38);
          if (score > bestScore) { bestScore = score; best = { x, y }; }
          if (score > 0) break; // üst üste binebilirler, ama tamamen gömülmesinler
        }
        it.x = best.x; it.y = best.y; it.rad = rad;
        it.r = Math.random() * 360;
        done.push(it);
      });
    }

    // ---------------- oyun ekranı
    function startLevel(i) {
      if (!unlocked(i)) return;
      stopPlay();
      closeModal();
      const L = LEVELS[i];
      const DS = drawersOf(L);
      view.innerHTML = `
        <div class="dz-play">
          <div class="dz-top">
            <button class="dz-iconbtn" data-act="map" aria-label="Bölümler" title="Bölümler">☰</button>
            <span class="dz-title dz-display">${i + 1}. ${L.name}</span>
            <div class="dz-prog" aria-label="İlerleme"><span class="dz-bar"><i></i></span><b class="dz-count">0/0</b></div>
            <span class="dz-time dz-hide-xs" title="Süre">⏱ <span>0:00</span></span>
            <button class="dz-iconbtn dz-hint" data-act="hint" aria-label="İpucu" title="İpucu">💡<small>${HINTS}</small></button>
            <button class="dz-iconbtn" data-act="sound" aria-label="Ses" title="Ses">${save.sound ? '🔊' : '🔈'}</button>
            <button class="dz-iconbtn dz-hide-xs" data-act="restart" aria-label="Baştan başla" title="Baştan başla">↻</button>
          </div>
          <div class="dz-stage">
            <svg class="dz-scene" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${L.name}"></svg>
            ${DS.length > 1 ? `<div class="dz-tabs" role="tablist" aria-label="Çekmeceler">${DS.map((D, n) => `<button class="dz-tab" role="tab" data-drawer="${n}" aria-selected="${n === 0}"><span class="dz-tab-ico">🗄️</span>${D.name}<small>0/${D.slots.length}</small></button>`).join('')}</div>` : ''}
            <div class="dz-toast" hidden></div>
          </div>
        </div>`;
      root.style.setProperty('--dz-table', L.table.a);
      const svg = view.querySelector('.dz-scene');
      const stage = view.querySelector('.dz-stage');
      play = {
        L, i, svg, stage, items: [], slots: [], drawers: [], cur: 0, placed: 0, hints: HINTS, hintsUsed: 0,
        t0: performance.now(), time: 0, combo: 0, last: 0, done: false, drag: null, lay: null, timer: 0,
      };
      buildScene();
      play.timer = setInterval(tick, 500);
      view.querySelector('[data-act="map"]').addEventListener('click', showMap);
      view.querySelector('[data-act="restart"]').addEventListener('click', () => startLevel(i));
      view.querySelector('[data-act="hint"]').addEventListener('click', hint);
      view.querySelector('[data-act="sound"]').addEventListener('click', e => { save.sound = !save.sound; persist(); e.currentTarget.textContent = save.sound ? '🔊' : '🔈'; });
      view.querySelectorAll('[data-drawer]').forEach(b => b.addEventListener('click', () => switchDrawer(+b.dataset.drawer)));
      svg.addEventListener('pointerdown', onDown);
      svg.addEventListener('pointermove', onMove);
      svg.addEventListener('pointerup', onUp);
      svg.addEventListener('pointercancel', onUp);
      svg.addEventListener('lostpointercapture', onUp);
      play.ro = new ResizeObserver(() => relayout());
      play.ro.observe(stage);
      if (i === 0 && !rec(0).done) toast('Eşyaları sürükle ve boyutuna uyan bölmeye bırak. Üstteki düğmelerle diğer çekmeceyi aç ✨', 6000);
      else if (DS.length > 1) toast(`Bu bölümde ${DS.length} çekmece var. Üstteki düğmelerle aralarında geç.`, 4000);
      updateHUD();
    }

    function buildScene() {
      const { L, svg, stage } = play;
      const box = stage.getBoundingClientRect();
      const lay = play.lay = layout(L, box.width || 800, box.height || 560);
      svg.setAttribute('viewBox', `0 0 ${lay.VW} ${lay.VH}`);
      svg.innerHTML = `<defs>${tablePattern(L, 'dz-tbl')}${drawersOf(L).map((D, n) => slotFilter('dz-slot' + n, D.slotColor || L.slotColor)).join('')}
          <radialGradient id="dz-vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#3b2340" stop-opacity="0"/><stop offset="1" stop-color="#3b2340" stop-opacity=".16"/></radialGradient></defs>
        <rect class="dz-bg" x="-3000" y="-3000" width="${lay.VW + 6000}" height="${lay.VH + 6000}" fill="url(#dz-tbl)"/>
        <rect class="dz-vig" x="0" y="0" width="${lay.VW}" height="${lay.VH}" fill="url(#dz-vig)"/>
        <g class="dz-drawers"></g><g class="dz-loose"></g><g class="dz-fx"></g>`;
      const dg = svg.querySelector('.dz-drawers');
      play.g = { loose: svg.querySelector('.dz-loose'), fx: svg.querySelector('.dz-fx') };
      play.slots = []; play.items = [];
      play.drawers = drawersOf(L).map((D, dn) => {
        const wrap = el('g', { class: 'dz-drawer' }, dg);
        const g = {};
        ['cont', 'slots', 'placed', 'front'].forEach(n => { g[n] = el('g', { class: 'dz-' + n }, wrap); });
        g.cont.innerHTML = D.container();
        if (D.front) g.front.innerHTML = D.front();
        [g.cont, g.front].forEach(x => x.setAttribute('transform', `translate(${lay.cx} ${lay.cy})`));
        if (dn !== 0) wrap.style.display = 'none';
        const drawer = { n: dn, D, wrap, g, slots: [], filled: 0 };
        D.slots.forEach(s => {
          const def = ITEMS[s.k];
          const sg = el('g', { class: 'dz-slot', 'data-k': s.k }, g.slots);
          sg.innerHTML = `<g filter="url(#dz-slot${dn})">${slotShape(s.k)}</g>`;
          const slot = { n: play.slots.length, drawer, k: s.k, lx: s.x, ly: s.y, r: s.r || 0, bw: def.w + PAD, bh: def.h + PAD, round: !!def.round, g: sg, item: null };
          posSlot(slot);
          play.slots.push(slot); drawer.slots.push(slot);
          const ig = el('g', { class: 'dz-item', 'data-i': play.items.length, 'data-k': s.k }, play.g.loose);
          ig.innerHTML = `<rect class="dz-hit" x="${-def.w / 2 - 10}" y="${-def.h / 2 - 10}" width="${def.w + 20}" height="${def.h + 20}" rx="14"/><g class="dz-art" filter="url(#dz-drop)">${def.draw(s.v)}</g>`;
          play.items.push({ n: play.items.length, k: s.k, home: slot, w: def.w, h: def.h, round: !!def.round, g: ig, art: ig.lastChild, x: 0, y: 0, r: 0, s: 1, slot: null });
        });
        return drawer;
      });
      scatter(play.items, lay.zones);
      play.items.forEach(render);
    }
    function posSlot(s) { s.x = play.lay.cx + s.lx; s.y = play.lay.cy + s.ly; s.g.setAttribute('transform', `translate(${s.x} ${s.y}) rotate(${s.r})`); }
    function render(it) { it.g.setAttribute('transform', `translate(${it.x.toFixed(1)} ${it.y.toFixed(1)}) rotate(${it.r.toFixed(1)}) scale(${it.s.toFixed(3)})`); }

    function relayout() {
      if (!play || play.done) return;
      const box = play.stage.getBoundingClientRect();
      if (!box.width) return;
      const old = play.lay, lay = layout(play.L, box.width, box.height);
      if (Math.abs(lay.VW - old.VW) < 1 && Math.abs(lay.VH - old.VH) < 1) return;
      play.lay = lay;
      play.svg.setAttribute('viewBox', `0 0 ${lay.VW} ${lay.VH}`);
      play.svg.querySelector('.dz-vig').setAttribute('width', lay.VW);
      play.svg.querySelector('.dz-vig').setAttribute('height', lay.VH);
      play.drawers.forEach(d => [d.g.cont, d.g.front].forEach(g => g.setAttribute('transform', `translate(${lay.cx} ${lay.cy})`)));
      play.slots.forEach(posSlot);
      const loose = play.items.filter(it => !it.slot && it !== (play.drag && play.drag.it));
      play.items.forEach(it => { if (it.slot) { it.x = it.slot.x; it.y = it.slot.y; render(it); } });
      if (lay.mode !== old.mode) scatter(loose, lay.zones);
      else loose.forEach(it => { it.x = clamp(it.x + (lay.cx - old.cx), 20, lay.VW - 20); it.y = clamp(it.y + (lay.cy - old.cy), 20, lay.VH - 20); });
      loose.forEach(render);
    }

    // ---------------- çekmeceler arasında geçiş
    function switchDrawer(n, quiet) {
      if (!play || n === play.cur || !play.drawers[n]) return;
      const from = play.drawers[play.cur], to = play.drawers[n];
      const dir = n > play.cur ? 1 : -1;
      play.cur = n;
      if (!quiet) sfx('drawer');
      view.querySelectorAll('[data-drawer]').forEach(b => b.setAttribute('aria-selected', String(+b.dataset.drawer === n)));
      tween(170, t => { from.wrap.setAttribute('transform', `translate(0 ${-40 * dir * t})`); from.wrap.setAttribute('opacity', 1 - t); }, () => {
        from.wrap.style.display = 'none'; from.wrap.removeAttribute('transform'); from.wrap.removeAttribute('opacity');
        to.wrap.style.display = '';
        tween(220, t => { const k = easeOut(t); to.wrap.setAttribute('transform', `translate(0 ${40 * dir * (1 - k)})`); to.wrap.setAttribute('opacity', k); }, () => { to.wrap.removeAttribute('transform'); to.wrap.removeAttribute('opacity'); });
      });
    }

    // ---------------- sürükle bırak
    function toSvg(e) {
      const m = play.svg.getScreenCTM();
      if (!m) return { x: 0, y: 0 };
      const pt = play.svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(m.inverse());
    }
    // eşya bu bölmeye sığar mı? sığarsa hangi açıyla (0 ya da 90)
    function fitAngle(it, s) {
      if (it.round !== s.round) return null;
      const ok = (w, h) => w <= s.bw + 1 && h <= s.bh + 1 && w >= (s.bw - PAD) * FIT_MIN && h >= (s.bh - PAD) * FIT_MIN;
      if (ok(it.w, it.h)) return 0;
      if (!s.round && ok(it.h, it.w)) return 90;
      return null;
    }
    const activeSlots = () => play.drawers[play.cur].slots;
    function onDown(e) {
      if (!play || play.done || play.drag) return;
      const g = e.target.closest('.dz-item');
      if (!g) return;
      const it = play.items[+g.dataset.i];
      e.preventDefault();
      try { play.svg.setPointerCapture(e.pointerId); } catch (err) { /* yok */ }
      if (it.slot) unplace(it);
      const p = toSvg(e);
      play.drag = { it, id: e.pointerId, dx: it.x - p.x, dy: it.y - p.y };
      play.g.loose.appendChild(it.g);
      it.g.classList.add('lift');
      it.art.setAttribute('filter', 'url(#dz-lift)');
      const s0 = it.s;
      tween(140, t => { it.s = lerp(s0, 1.1, easeOut(t)); render(it); });
      hideToast();
      clearHint();
      sfx('pick');
    }
    function onMove(e) {
      const d = play && play.drag;
      if (!d || e.pointerId !== d.id) return;
      const p = toSvg(e), it = d.it;
      it.x = clamp(p.x + d.dx, 10, play.lay.VW - 10);
      it.y = clamp(p.y + d.dy, 10, play.lay.VH - 10);
      render(it);
      const s = nearSlot(it);
      if (s !== d.near) { if (d.near) d.near.g.classList.remove('near'); if (s) s.g.classList.add('near'); d.near = s; }
    }
    function onUp(e) {
      const d = play && play.drag;
      if (!d || (e.pointerId !== undefined && e.pointerId !== d.id)) return;
      play.drag = null;
      if (d.near) d.near.g.classList.remove('near');
      const it = d.it, s = nearSlot(it);
      it.g.classList.remove('lift');
      if (s) { place(it, s); return; }
      it.art.setAttribute('filter', 'url(#dz-drop)');
      const s0 = it.s;
      tween(140, t => { it.s = lerp(s0, 1, easeOut(t)); render(it); });
      const wrong = activeSlots().find(x => !x.item && fitAngle(it, x) === null && Math.hypot(x.x - it.x, x.y - it.y) < Math.min(x.bw, x.bh) * 0.5 + 16);
      if (wrong) {
        wiggle(it); sfx('wrong');
        if (!play.toldFit) { play.toldFit = true; toast('Bu eşya o bölmeye uymuyor. Boyutuna bak 🙂', 2600); }
      }
    }
    function nearSlot(it) {
      let best = null, bd = Infinity;
      for (const s of activeSlots()) if (!s.item && fitAngle(it, s) !== null) { const d = Math.hypot(s.x - it.x, s.y - it.y); if (d < bd) { bd = d; best = s; } }
      return best && bd < 24 + 0.3 * Math.max(it.w, it.h) ? best : null;
    }
    function wiggle(it) {
      const r0 = it.r;
      tween(360, t => { it.r = r0 + Math.sin(t * Math.PI * 5) * 9 * (1 - t); render(it); });
    }

    function place(it, s) {
      it.slot = s; s.item = it; s.drawer.filled++; play.placed++;
      s.g.classList.add('filled');
      s.drawer.g.placed.appendChild(it.g);
      it.g.classList.add('done');
      it.art.setAttribute('filter', 'url(#dz-placed)');
      const now = performance.now();
      play.combo = now - play.last < 2600 ? play.combo + 1 : 0;
      play.last = now;
      const target = s.r + fitAngle(it, s);
      const dr = ((target - it.r) % 360 + 540) % 360 - 180;
      const f = { x: it.x, y: it.y, r: it.r, s: it.s };
      tween(190, t => {
        const k = easeOut(t);
        it.x = lerp(f.x, s.x, k); it.y = lerp(f.y, s.y, k); it.r = f.r + dr * k; it.s = lerp(f.s, 1, k);
        render(it);
      }, () => {
        if (it.slot !== s) return;
        it.r = target;
        tween(260, t => { it.s = 1 + 0.08 * Math.sin(Math.PI * t) * (1 - t * 0.3); render(it); });
        sparkle(s.x, s.y, Math.max(it.w, it.h));
      });
      sfx('place', play.combo);
      if (navigator.vibrate) try { navigator.vibrate(12); } catch (e) { /* yok */ }
      updateHUD();
      checkDone(s.drawer);
    }
    function unplace(it) {
      const s = it.slot;
      s.item = null; s.drawer.filled--; play.placed--;
      s.g.classList.remove('filled');
      it.slot = null;
      it.g.classList.remove('done');
      updateHUD();
    }
    function checkDone(drawer) {
      const right = play.slots.every(s => s.item);
      if (right) { win(); return; }
      if (drawer.filled === drawer.slots.length) {
        shine(drawer);
        const next = play.drawers.find(d => d.filled < d.slots.length);
        if (next) {
          toast(`${drawer.D.name || 'Çekmece'} tamam! Sıradaki: ${next.D.name}`, 2600);
          later(() => { if (play && !play.drag && play.cur === drawer.n) switchDrawer(next.n); }, 1100);
        }
      }
    }

    function sparkle(x, y, size) {
      const fx = play.g.fx;
      const ring = el('circle', { cx: x, cy: y, r: 6, fill: 'none', stroke: '#fff', 'stroke-width': 4 }, fx);
      const R0 = size * 0.62;
      tween(520, t => { const k = easeOut(t); ring.setAttribute('r', 6 + R0 * k); ring.setAttribute('stroke-opacity', (1 - t) * 0.85); ring.setAttribute('stroke-width', 5 * (1 - t) + 0.5); }, () => ring.remove());
      const cols = ['#fff', '#ffe08a', '#ffc2d4', '#fff', '#d9c8ff'];
      const n = 9;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + Math.random() * 0.5;
        const dist = R0 * (0.75 + Math.random() * 0.55);
        const sc = 0.6 + Math.random() * 0.8;
        const st = el('path', { d: STAR, fill: cols[k % cols.length] }, fx);
        tween(620 + Math.random() * 200, t => {
          const e = easeOut(t);
          st.setAttribute('transform', `translate(${x + Math.cos(a) * dist * e} ${y + Math.sin(a) * dist * e}) rotate(${t * 120}) scale(${sc * (t < 0.25 ? t * 4 : 1 - (t - 0.25) / 0.75)})`);
        }, () => st.remove());
      }
    }
    function shine(drawer) {
      const { L } = play, { cx, cy } = play.lay;
      let clip = play.svg.querySelector('#dz-clipc');
      if (!clip) { clip = el('clipPath', { id: 'dz-clipc' }, play.svg.querySelector('defs')); el('rect', { x: cx, y: cy, width: L.W, height: L.H, rx: 30 }, clip); }
      const sw = el('rect', { x: cx - 260, y: cy - 40, width: 220, height: L.H + 80, fill: 'url(#dz-sweep)', 'clip-path': 'url(#dz-clipc)', opacity: 0.9 }, play.g.fx);
      tween(900, t => sw.setAttribute('transform', `translate(${(L.W + 400) * easeOut(t)} 0) skewX(-18)`), () => sw.remove());
      for (let k = 0; k < 8; k++) later(() => sparkle(cx + 40 + Math.random() * (L.W - 80), cy + 30 + Math.random() * (L.H - 60), 60 + Math.random() * 50), k * 80);
    }

    function hint() {
      if (!play || play.done || play.hints <= 0) return;
      const loose = play.items.filter(it => !it.slot && it !== (play.drag && play.drag.it));
      if (!loose.length) return;
      // önce açık çekmecedeki bir eşyayı göster
      const here = loose.filter(it => it.home.drawer.n === play.cur);
      const pool = here.length ? here : loose;
      const it = pool[Math.floor(Math.random() * pool.length)];
      const s = it.home;
      play.hints--; play.hintsUsed++;
      sfx('hint');
      clearHint();
      if (s.drawer.n !== play.cur) switchDrawer(s.drawer.n, true);
      play.g.loose.appendChild(it.g);
      const marks = [it, s];
      if (s.item) marks.push(s.item); // yanlış eşya oturmuşsa onu da göster
      marks.forEach(x => x.g.classList.add('hinted'));
      play.hinted = marks;
      const r0 = it.r;
      tween(900, t => { it.s = 1 + 0.12 * Math.sin(t * Math.PI * 3) * (1 - t); it.r = r0 + Math.sin(t * Math.PI * 4) * 6 * (1 - t); render(it); }, () => { it.r = r0; render(it); });
      if (s.item) toast('Bu bölmeye yanlış eşya koymuşsun, onu çıkar.', 2600);
      later(clearHint, 3200);
      updateHUD();
    }
    function clearHint() {
      if (!play || !play.hinted) return;
      play.hinted.forEach(x => x.g.classList.remove('hinted'));
      play.hinted = null;
    }

    function tick() {
      if (!play || play.done) return;
      play.time = (performance.now() - play.t0) / 1000;
      const t = view.querySelector('.dz-time span');
      if (t) t.textContent = fmt(play.time);
    }
    function updateHUD() {
      const n = play.slots.length;
      view.querySelector('.dz-count').textContent = `${play.placed}/${n}`;
      view.querySelector('.dz-bar i').style.width = (play.placed / n * 100) + '%';
      const h = view.querySelector('.dz-hint');
      h.querySelector('small').textContent = play.hints;
      h.disabled = play.hints <= 0;
      view.querySelectorAll('[data-drawer]').forEach(b => {
        const d = play.drawers[+b.dataset.drawer];
        b.querySelector('small').textContent = d.filled === d.slots.length ? '✓' : `${d.filled}/${d.slots.length}`;
        b.classList.toggle('full', d.filled === d.slots.length);
      });
    }
    let toastT = 0;
    function toast(msg, ms = 2400) {
      const t = view.querySelector('.dz-toast');
      if (!t) return;
      t.textContent = msg; t.hidden = false;
      requestAnimationFrame(() => t.classList.add('show'));
      clearTimeout(toastT);
      toastT = later(hideToast, ms);
    }
    function hideToast() { const t = view.querySelector('.dz-toast'); if (t) { t.classList.remove('show'); later(() => { if (!t.classList.contains('show')) t.hidden = true; }, 300); } }

    function win() {
      play.done = true;
      tick();
      const { L, i, time, hintsUsed } = play;
      const stars = hintsUsed === 0 && time <= L.target ? 3 : (hintsUsed <= 1 && time <= L.target * 2 ? 2 : 1);
      const prev = rec(i);
      save.levels[L.id] = { done: true, stars: Math.max(prev.stars || 0, stars), best: Math.min(prev.best || Infinity, Math.round(time)) };
      persist();
      later(() => { sfx('win'); shine(play.drawers[play.cur]); for (let k = 0; k < 8; k++) later(() => { const { cx, cy } = play.lay; sparkle(cx + 40 + Math.random() * (L.W - 80), cy + 30 + Math.random() * (L.H - 60), 80 + Math.random() * 60); }, 300 + k * 70); }, 420);
      later(() => {
        const next = i + 1 < LEVELS.length;
        modal(`<div class="dz-win-stars">${[0, 1, 2].map(k => `<span class="${k < stars ? 'on' : ''}" style="animation-delay:${k * 0.15}s">★</span>`).join('')}</div>
          <h3 class="dz-display">Tertemiz! ✨</h3>
          <p>${L.name} düzenlendi.</p>
          <div class="dz-win-facts"><span>⏱ ${fmt(time)}</span><span>💡 ${hintsUsed} ipucu</span></div>
          ${stars < 3 ? `<p class="dz-small">3 yıldız için ipucu kullanmadan ${fmt(L.target)} içinde bitir.</p>` : ''}
          <div class="dz-actions"><button class="dz-btn alt" data-m="map">Bölümler</button><button class="dz-btn alt" data-m="again">Tekrar</button>${next ? '<button class="dz-btn" data-m="next">Sonraki ▶</button>' : ''}</div>
          ${next ? '' : '<p class="dz-small">Tüm bölümleri bitirdin. Yeni bölümler yakında!</p>'}`,
        { map: showMap, again: () => startLevel(i), next: () => startLevel(i + 1) });
      }, 1800);
    }

    function stopPlay() {
      if (play) { clearInterval(play.timer); if (play.ro) play.ro.disconnect(); }
      play = null;
      closeModal();
    }

    showMap();
    return {
      destroy() {
        destroyed = true;
        stopPlay();
        rafs.forEach(id => cancelAnimationFrame(id));
        timers.forEach(t => clearTimeout(t));
        audio.close();
        root.remove();
      },
    };
  }

  // ---------------------------------------------------------------- kayıt
  const itemCount = LEVELS.reduce((s, L) => s + allSlots(L).length, 0);
  Portal.register({
    slug: 'duzenle',
    title: 'Düzenle',
    category: 'bulmaca',
    isNew: true,
    short: 'Dağınıkları yerleştir',
    tags: ['düzenleme', 'yerleştirme', 'rahatlatıcı', 'makyaj', 'sürükle bırak', 'toparlama', 'mobil'],
    heroFacts: [`${LEVELS.length} bölüm`, `${itemCount} eşya`, 'Rahatlatıcı sesler', 'Mobilde de oynanır'],
    description: `Dağınık duran eşyaları toparla! Her bölümde farklı bir yer var: makyaj çekmecesi, buzdolabı, kalem kutusu, bavul ve dağınık odalar. Eşyaları sürükleyip boyutuna uyan bölmeye bırak, yerine oturunca parıldasın. Bölmeler birbirine benzeyebilir, dikkatli bak! Acele yok, sadece her şeyi düzenlemenin keyfi.`,
    howTo: [
      'Bölüm listesinden açık bir bölüm seç.',
      'Bazı bölümlerde birden çok çekmece var: üstteki düğmelerle çekmeceler arasında geç.',
      'Etrafa dağılmış bir eşyayı tutup sürükle.',
      'Eşyayı boyutuna uyan bölmenin üzerine bırak: uyuyorsa kendiliğinden oturur. Yanlış yere koyduğunu fark edersen tutup çıkarabilirsin.',
      'Takılırsan 💡 ipucu, bir eşyayı ve yerini gösterir. Her bölümde 3 ipucu var.',
      'Bütün eşyaları yerleştirince bölüm biter. İpucusuz ve hızlı bitirmek 3 yıldız kazandırır.',
    ],
    controls: [
      ['Sürükle bırak', 'Eşyayı taşı'],
      ['Dokun ve sürükle', 'Mobilde eşyayı taşı'],
      ['💡', 'İpucu'],
      ['↻', 'Bölümü baştan başlat'],
    ],
    drawCover,
    mount,
  });
  window.__duzenle = { LEVELS, ITEMS };
})();
