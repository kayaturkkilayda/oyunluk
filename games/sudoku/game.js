/*
 * Sudoku — 4 zorluk, her zorlukta 12 bulmaca (toplam 48).
 * Bulmacalar tarayıcıda, sabit bir tohumdan (seed) üretilir: herkes aynı bölümde aynı bulmacayı görür
 * ve her bulmacanın tek bir çözümü vardır. Bölüm eklemek için DIFFS içindeki "count" değerini artırın.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- zorluklar ve bölümler
  const DIFFS = [
    { id: 'kolay', name: 'Kolay', clues: 40, target: 6 * 60, base: 1000, count: 12, info: 'Isınmak için: bol ipucu rakam, hızlı çözülür.' },
    { id: 'orta', name: 'Orta', clues: 33, target: 11 * 60, base: 2000, count: 12, info: 'Biraz düşünmek gerekir. Notlar işine yarar.' },
    { id: 'zor', name: 'Zor', clues: 28, target: 18 * 60, base: 3000, count: 12, info: 'Az rakam, çok mantık. Notları mutlaka kullan.' },
    { id: 'uzman', name: 'Uzman', clues: 24, target: 25 * 60, base: 4500, count: 12, info: 'En az rakamla en zorlu bulmacalar.' },
  ];
  const LEVELS = [];
  DIFFS.forEach((d, di) => { for (let n = 0; n < d.count; n++) LEVELS.push({ id: d.id + '-' + (n + 1), diff: d, di, n, seed: 7919 * (di + 1) + 104729 * (n + 1) }); });
  const MAX_MISTAKES = 3;
  const HINTS = 3;

  // ---------------------------------------------------------------- üretici ve çözücü
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(arr, r) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
  const ROW = i => Math.floor(i / 9), COL = i => i % 9, BOX = i => Math.floor(ROW(i) / 3) * 3 + Math.floor(COL(i) / 3);
  const PEERS = [];
  for (let i = 0; i < 81; i++) { const s = new Set(); for (let j = 0; j < 81; j++) if (j !== i && (ROW(j) === ROW(i) || COL(j) === COL(i) || BOX(j) === BOX(i))) s.add(j); PEERS.push([...s]); }
  const UNITS = [];
  for (let k = 0; k < 9; k++) {
    UNITS.push({ kind: 'satır', cells: [...Array(9)].map((_, j) => k * 9 + j) });
    UNITS.push({ kind: 'sütun', cells: [...Array(9)].map((_, j) => j * 9 + k) });
    UNITS.push({ kind: 'kutu', cells: [...Array(9)].map((_, j) => (Math.floor(k / 3) * 3 + Math.floor(j / 3)) * 9 + (k % 3) * 3 + (j % 3)) });
  }
  const bits = m => { let c = 0; while (m) { m &= m - 1; c++; } return c; };
  function candMask(g, i) { let used = 0; for (const p of PEERS[i]) if (g[p]) used |= 1 << g[p]; return 0x3FE & ~used; }

  // Çözüm sayısını (en fazla limit kadar) sayar. En az adaylı hücreden dallanır.
  function countSolutions(grid, limit) {
    const g = grid.slice(); let count = 0;
    (function rec() {
      if (count >= limit) return;
      let best = -1, bestMask = 0, bestN = 10;
      for (let i = 0; i < 81; i++) if (!g[i]) { const m = candMask(g, i), n = bits(m); if (n < bestN) { best = i; bestMask = m; bestN = n; if (n <= 1) break; } }
      if (best < 0) { count++; return; }
      if (bestN === 0) return;
      for (let v = 1; v <= 9; v++) if (bestMask & (1 << v)) { g[best] = v; rec(); if (count >= limit) break; }
      g[best] = 0;
    })();
    return count;
  }
  function fullGrid(r) {
    const g = new Array(81).fill(0);
    (function rec(i) {
      if (i === 81) return true;
      const m = candMask(g, i);
      for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], r)) if (m & (1 << v)) { g[i] = v; if (rec(i + 1)) return true; }
      g[i] = 0; return false;
    })(0);
    return g;
  }
  const cache = {};
  function buildLevel(L) {
    if (cache[L.id]) return cache[L.id];
    const r = rng(L.seed);
    const solution = fullGrid(r);
    const puzzle = solution.slice();
    let clues = 81;
    // simetrik çiftler halinde rakam sil, tek çözüm bozulursa geri koy
    const order = shuffle([...Array(41).keys()], r);
    for (const i of order) {
      if (clues <= L.diff.clues) break;
      const j = 80 - i, a = puzzle[i], b = puzzle[j];
      puzzle[i] = 0; puzzle[j] = 0;
      if (countSolutions(puzzle, 2) !== 1) { puzzle[i] = a; puzzle[j] = b; }
      else clues -= (i === j ? 1 : 2);
    }
    // simetri yüzünden hedefe inilemediyse tek tek dene
    if (clues > L.diff.clues) {
      for (const i of shuffle([...Array(81).keys()], r)) {
        if (clues <= L.diff.clues) break;
        if (!puzzle[i]) continue;
        const a = puzzle[i]; puzzle[i] = 0;
        if (countSolutions(puzzle, 2) !== 1) puzzle[i] = a; else clues--;
      }
    }
    return (cache[L.id] = { puzzle, solution, clues });
  }

  // ---------------------------------------------------------------- kapak
  function drawCover(canvas) {
    const c = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    const bg = c.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#17a3a5'); bg.addColorStop(1, '#0b3b40');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const S = H * 0.82, x0 = W / 2 - S / 2 + W * 0.04, y0 = (H - S) / 2, cs = S / 9;
    c.save(); c.translate(W / 2, H / 2); c.rotate(-0.06); c.translate(-W / 2, -H / 2);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x0 + 6, y0 + 8, S, S);
    c.fillStyle = '#fffaf0'; c.fillRect(x0, y0, S, S);
    const ex = buildLevel(LEVELS[0]);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < 81; i++) {
      const x = x0 + COL(i) * cs, y = y0 + ROW(i) * cs;
      if (ROW(i) === 4 || COL(i) === 4) { c.fillStyle = '#e6edf2'; c.fillRect(x, y, cs, cs); }
      if (i === 40) { c.fillStyle = '#ffd979'; c.fillRect(x, y, cs, cs); }
      const v = ex.puzzle[i] || (i % 7 === 0 ? ex.solution[i] : 0);
      if (v) { c.fillStyle = ex.puzzle[i] ? '#1d2b3a' : '#2357c6'; c.font = `600 ${cs * 0.62}px Fredoka, sans-serif`; c.fillText(v, x + cs / 2, y + cs / 2 + 1); }
    }
    for (let k = 0; k <= 9; k++) {
      c.strokeStyle = k % 3 ? '#c9bda4' : '#24343f'; c.lineWidth = k % 3 ? 1 : 3;
      c.beginPath(); c.moveTo(x0 + k * cs, y0); c.lineTo(x0 + k * cs, y0 + S); c.stroke();
      c.beginPath(); c.moveTo(x0, y0 + k * cs); c.lineTo(x0 + S, y0 + k * cs); c.stroke();
    }
    c.restore();
    c.font = `${H * 0.2}px serif`; c.fillText('✏️', W * 0.16, H * 0.78);
  }

  // ---------------------------------------------------------------- ses
  function makeAudio() {
    let ctx = null;
    function ensure() { if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; }
    function tone(f, dur, type = 'sine', vol = 0.12, delay = 0) {
      const a = ensure(); if (!a) return;
      const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
    }
    return {
      place() { tone(660, 0.08, 'triangle', 0.1); },
      note() { tone(990, 0.05, 'sine', 0.05); },
      miss() { tone(170, 0.2, 'square', 0.05); },
      unit() { [784, 988, 1175].forEach((f, i) => tone(f, 0.14, 'triangle', 0.1, i * 0.06)); },
      hint() { [880, 1175, 1568].forEach((f, i) => tone(f, 0.16, 'sine', 0.07, i * 0.06)); },
      done() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.3, 'triangle', 0.14, i * 0.12)); },
      fail() { [392, 330, 262].forEach((f, i) => tone(f, 0.25, 'sawtooth', 0.05, i * 0.14)); },
    };
  }

  const fmt = s => { s = Math.floor(s); const m = Math.floor(s / 60); return m + ':' + String(s % 60).padStart(2, '0'); };
  const starsHTML = n => '<b>★</b>'.repeat(n) + '★'.repeat(3 - n);

  // ---------------------------------------------------------------- oyun
  function mount(host, api) {
    const KEY = api.gameStoreKey;
    const save = Object.assign({ v: 1, sound: true, autoNotes: true, levels: {}, cur: null, tab: 'kolay' }, api.store.get(KEY, {}));
    const persist = () => api.store.set(KEY, save);
    const rec = L => save.levels[L.id] || {};
    const unlocked = L => L.n === 0 || !!rec(LEVELS.find(x => x.di === L.di && x.n === L.n - 1)).cleared;
    const audio = makeAudio();
    const sfx = name => { if (save.sound) try { audio[name](); } catch (e) { /* ses kapalı */ } };

    const root = document.createElement('div');
    root.className = 'sd-root';
    host.appendChild(root);

    const cleanups = [];
    const on = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); cleanups.push(() => el.removeEventListener(ev, fn, opt)); };
    let play = null;

    // ---------------- bölüm listesi
    function showMap() {
      stopPlay();
      const d = DIFFS.find(x => x.id === save.tab) || DIFFS[0];
      const totalStars = LEVELS.reduce((s, L) => s + (rec(L).stars || 0), 0);
      const cur = save.cur && LEVELS.find(L => L.id === save.cur.id);
      root.innerHTML = `
        <div class="sd-map">
          <div class="sd-map-head">
            <div><h2 class="sd-display">Sudoku</h2><p>Her satıra, sütuna ve 3×3 kutuya 1'den 9'a kadar rakamları birer kez yerleştir.</p></div>
            <div class="sd-total"><b>★</b> ${totalStars} / ${LEVELS.length * 3}</div>
          </div>
          ${cur ? `<div class="sd-resume"><span>Yarım kalan bulmaca: ${cur.diff.name} ${cur.n + 1} · ${fmt(save.cur.time || 0)}</span><button class="sd-btn" data-go="${cur.id}">▶ Devam et</button></div>` : ''}
          <div class="sd-tabs" role="group" aria-label="Zorluk">
            ${DIFFS.map(x => { const done = LEVELS.filter(L => L.diff === x && rec(L).cleared).length; return `<button class="sd-tab" data-tab="${x.id}" aria-pressed="${x === d}">${x.name} <small>${done}/${x.count}</small></button>`; }).join('')}
          </div>
          <p class="sd-diff-info">${d.info} 3 yıldız için ${Math.round(d.target / 60)} dakikanın altında bitir.</p>
          <div class="sd-levels">
            ${LEVELS.filter(L => L.diff === d).map(L => {
              const r = rec(L), open = unlocked(L), isCur = cur === L;
              return `<button class="sd-level${isCur ? ' cur' : ''}" data-go="${L.id}" ${open ? '' : 'disabled'} aria-label="${d.name} ${L.n + 1}${open ? '' : ', kilitli'}">
                <span class="sd-level-num sd-display">${open ? L.n + 1 : '🔒'}</span>
                <span class="sd-stars">${starsHTML(r.stars || 0)}</span>
                <span class="sd-level-sub">${r.bestTime ? '⏱ ' + fmt(r.bestTime) : (open ? 'Yeni' : '')}</span>
              </button>`;
            }).join('')}
          </div>
          <div class="sd-map-foot"><button class="sd-link" data-act="reset">İlerlemeyi sıfırla</button></div>
        </div>`;
      root.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { save.tab = b.dataset.tab; persist(); showMap(); }));
      root.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => startLevel(LEVELS.find(L => L.id === b.dataset.go))));
      root.querySelector('[data-act="reset"]').addEventListener('click', () => confirmReset());
    }

    function confirmReset() {
      modal(`<h3 class="sd-display">Sıfırlansın mı?</h3><p>Tüm yıldızlar, süreler ve yarım kalan bulmaca silinir.</p>
        <div class="sd-actions"><button class="sd-btn alt" data-m="no">Vazgeç</button><button class="sd-btn" data-m="yes">Sıfırla</button></div>`,
      { yes() { save.levels = {}; save.cur = null; persist(); showMap(); }, no() { closeModal(); } });
    }

    // ---------------- pencere yardımcıları
    function modal(html, handlers) {
      closeModal();
      const m = document.createElement('div');
      m.className = 'sd-modal';
      m.innerHTML = `<div class="sd-card" role="dialog">${html}</div>`;
      m.addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b && handlers[b.dataset.m]) handlers[b.dataset.m](); });
      root.appendChild(m);
      const first = m.querySelector('.sd-btn:not(.alt)') || m.querySelector('.sd-btn');
      if (first) first.focus();
    }
    function closeModal() { root.querySelectorAll('.sd-modal').forEach(m => m.remove()); }

    // ---------------- oyun ekranı
    function startLevel(L, fresh) {
      if (!L || !unlocked(L)) return;
      stopPlay();
      const lv = buildLevel(L);
      const resume = !fresh && save.cur && save.cur.id === L.id ? save.cur : null;
      play = {
        L, lv,
        values: resume ? resume.values.slice() : lv.puzzle.slice(),
        notes: resume ? resume.notes.slice() : new Array(81).fill(0),
        hinted: new Set(resume ? resume.hinted || [] : []),
        mistakes: resume ? resume.mistakes : 0,
        limit: resume ? resume.limit || MAX_MISTAKES : MAX_MISTAKES,
        hints: resume ? resume.hints : HINTS,
        time: resume ? resume.time : 0,
        sel: lv.puzzle.findIndex(v => !v),
        noteMode: false, paused: false, over: false,
        undo: [], last: performance.now(), timer: 0,
      };
      buildPlayDOM();
      render();
      saveCur();
      play.timer = setInterval(tick, 250);
    }

    function stopPlay() {
      if (play) { clearInterval(play.timer); if (play.ro) play.ro.disconnect(); }
      play = null;
    }

    function saveCur() {
      if (!play || play.over) return;
      const p = play;
      save.cur = { id: p.L.id, values: p.values, notes: p.notes, hinted: [...p.hinted], mistakes: p.mistakes, limit: p.limit, hints: p.hints, time: Math.floor(p.time) };
      persist();
    }

    function tick() {
      const p = play; if (!p) return;
      const now = performance.now();
      if (!p.paused && !p.over && !root.querySelector('.sd-modal') && document.visibilityState === 'visible') p.time += (now - p.last) / 1000;
      p.last = now;
      const t = root.querySelector('[data-hud="time"]');
      if (t) t.textContent = fmt(p.time);
      if (Math.floor(p.time) % 5 === 0) saveCur();
    }

    function buildPlayDOM() {
      const p = play;
      let boxes = '';
      for (let b = 0; b < 9; b++) {
        let cells = '';
        for (let k = 0; k < 9; k++) { const i = (Math.floor(b / 3) * 3 + Math.floor(k / 3)) * 9 + (b % 3) * 3 + (k % 3); cells += `<button class="sd-cell" data-i="${i}" aria-label="Satır ${ROW(i) + 1}, sütun ${COL(i) + 1}"></button>`; }
        boxes += `<div class="sd-box">${cells}</div>`;
      }
      root.innerHTML = `
        <div class="sd-play">
          <div class="sd-top">
            <button class="sd-iconbtn" data-act="map" aria-label="Bölüm listesi">☰</button>
            <span class="sd-title sd-display">${p.L.diff.name} · ${p.L.n + 1}</span>
            <div class="sd-stats">
              <span class="sd-stat" data-hud="mist" title="Hatalar"></span>
              <span class="sd-stat" title="Süre">⏱ <span data-hud="time">0:00</span></span>
              <button class="sd-iconbtn" data-act="pause" aria-label="Duraklat">⏸</button>
              <button class="sd-iconbtn sd-hide-xs" data-act="sound" aria-label="Sesi aç/kapat"></button>
            </div>
          </div>
          <div class="sd-main">
            <div class="sd-board" role="grid" aria-label="Sudoku tahtası">${boxes}</div>
            <div class="sd-pad">
              <div class="sd-tools">
                <button class="sd-tool" data-act="undo" aria-label="Geri al"><span>↶</span>Geri al</button>
                <button class="sd-tool" data-act="erase" aria-label="Sil"><span>⌫</span>Sil</button>
                <button class="sd-tool" data-act="notes" aria-pressed="false" aria-label="Not modu"><span>✏️</span>Not<em class="sd-onoff" data-hud="onoff">KAPALI</em></button>
                <button class="sd-tool" data-act="hint" aria-label="İpucu"><span>💡</span>İpucu<em class="sd-badge" data-hud="hints"></em></button>
              </div>
              <div class="sd-nums">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="sd-num" data-n="${n}" aria-label="${n}">${n}<small></small></button>`).join('')}</div>
            </div>
            <div class="sd-toast" role="status" aria-live="polite"></div>
          </div>
        </div>`;
      const main = root.querySelector('.sd-main');
      root.querySelector('.sd-board').addEventListener('pointerdown', e => {
        const c = e.target.closest('.sd-cell'); if (!c || p.paused || p.over) return;
        e.preventDefault(); p.sel = +c.dataset.i; render();
      });
      root.querySelector('.sd-nums').addEventListener('click', e => { const b = e.target.closest('[data-n]'); if (b) input(+b.dataset.n); });
      root.querySelector('.sd-play').addEventListener('click', e => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        act(b.dataset.act);
      });
      const layout = () => {
        const w = main.clientWidth - 20, h = main.clientHeight - 20;
        if (w <= 0 || h <= 0) return;
        const wide = w > h * 1.2;
        main.classList.toggle('wide', wide);
        let size;
        if (wide) size = Math.min(h, w - Math.min(260, w * 0.34) - 26);
        else { const padH = Math.min(w, h) / 9 * 1.33 + 70; size = Math.min(w, h - padH - 14); }
        size = Math.max(200, Math.floor(Math.min(size, 620)));
        root.style.setProperty('--sd-size', size + 'px');
      };
      play.ro = new ResizeObserver(layout); play.ro.observe(main); layout();
    }

    function act(a) {
      const p = play; if (!p) return;
      if (a === 'map') { saveCur(); showMap(); return; }
      if (a === 'sound') { save.sound = !save.sound; persist(); render(); return; }
      if (a === 'pause') { togglePause(); return; }
      if (p.paused || p.over) return;
      if (a === 'undo') undo();
      else if (a === 'erase') erase();
      else if (a === 'notes') { p.noteMode = !p.noteMode; render(); }
      else if (a === 'hint') hint();
    }

    function togglePause() {
      const p = play; if (!p || p.over) return;
      p.paused = !p.paused;
      if (p.paused) {
        modal(`<h3 class="sd-display">Mola</h3><p>Süre durdu. Hazır olduğunda devam et.</p>
          <div class="sd-actions"><button class="sd-btn alt" data-m="restart">Baştan başla</button><button class="sd-btn" data-m="go">▶ Devam et</button></div>`,
        { go() { closeModal(); p.paused = false; render(); }, restart() { closeModal(); startLevel(p.L, true); } });
      } else closeModal();
      render();
    }

    const peersOf = i => PEERS[i];
    function pushUndo(i) { const p = play; p.undo.push({ i, v: p.values[i], n: p.notes[i], peers: peersOf(i).map(j => p.notes[j]) }); if (p.undo.length > 300) p.undo.shift(); }

    function input(n) {
      const p = play; if (!p || p.paused || p.over || p.sel < 0) return;
      const i = p.sel;
      if (p.lv.puzzle[i] || p.hinted.has(i)) { flashToast('Bu rakam sabit'); return; }
      if (p.values[i] && p.values[i] === p.lv.solution[i] && !p.noteMode) return; // doğru rakam kilitli
      if (p.noteMode) {
        if (p.values[i]) return;
        pushUndo(i);
        p.notes[i] ^= 1 << n;
        sfx('note');
        render(); saveCur(); return;
      }
      if (p.values[i] === n) return;
      pushUndo(i);
      p.values[i] = n; p.notes[i] = 0;
      if (n !== p.lv.solution[i]) {
        p.mistakes++;
        sfx('miss');
        render([i]);
        if (p.mistakes >= p.limit) { setTimeout(gameOver, 450); }
        saveCur(); return;
      }
      sfx('place');
      if (save.autoNotes) for (const j of peersOf(i)) p.notes[j] &= ~(1 << n);
      const done = completedUnits(i);
      render([i], done);
      if (done.length) { sfx('unit'); flashToast(done.length > 1 ? 'Harika! ' + done.length + ' bölge tamam' : cap(done[0].kind) + ' tamam!'); }
      checkWin();
      saveCur();
    }
    const cap = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

    function completedUnits(i) {
      const p = play;
      return UNITS.filter(u => u.cells.includes(i) && u.cells.every(c => p.values[c] === p.lv.solution[c]));
    }

    function erase() {
      const p = play, i = p.sel; if (i < 0) return;
      if (p.lv.puzzle[i] || p.hinted.has(i)) return;
      if (p.values[i] && p.values[i] === p.lv.solution[i]) { flashToast('Doğru rakamlar silinmez'); return; }
      if (!p.values[i] && !p.notes[i]) return;
      pushUndo(i); p.values[i] = 0; p.notes[i] = 0; render(); saveCur();
    }

    function undo() {
      const p = play, u = p.undo.pop();
      if (!u) { flashToast('Geri alınacak hamle yok'); return; }
      p.values[u.i] = u.v; p.notes[u.i] = u.n;
      peersOf(u.i).forEach((j, k) => { p.notes[j] = u.peers[k]; });
      p.sel = u.i; render(); saveCur();
    }

    function hint() {
      const p = play;
      if (p.hints <= 0) { flashToast('İpucu hakkın bitti'); return; }
      const open = i => !p.lv.puzzle[i] && p.values[i] !== p.lv.solution[i];
      let i = p.sel >= 0 && open(p.sel) ? p.sel : -1;
      if (i < 0) {
        // en kolay hücre: doğru rakamlara göre en az adayı olan boş hücre
        const g = p.values.map((v, k) => (v === p.lv.solution[k] ? v : 0));
        let best = 10;
        for (let k = 0; k < 81; k++) if (open(k)) { const c = bits(candMask(g, k)); if (c < best) { best = c; i = k; } }
      }
      if (i < 0) return;
      pushUndo(i);
      p.undo.pop(); // ipucu geri alınamaz
      p.hints--;
      p.values[i] = p.lv.solution[i]; p.notes[i] = 0; p.hinted.add(i); p.sel = i;
      for (const j of peersOf(i)) p.notes[j] &= ~(1 << p.values[i]);
      sfx('hint');
      const done = completedUnits(i);
      render([i], done);
      flashToast('💡 Buraya ' + p.values[i] + ' gelir');
      checkWin(); saveCur();
    }

    function checkWin() {
      const p = play;
      if (!p.values.every((v, i) => v === p.lv.solution[i])) return;
      p.over = true;
      save.cur = null; persist();
      sfx('done');
      // tahta boyunca dalga
      root.querySelectorAll('.sd-cell').forEach(c => { const i = +c.dataset.i; c.style.animationDelay = ((ROW(i) + COL(i)) * 35) + 'ms'; c.classList.remove('wave'); void c.offsetWidth; c.classList.add('wave'); });
      setTimeout(showWin, 900);
    }

    function showWin() {
      const p = play; if (!p) return;
      const d = p.L.diff, t = Math.floor(p.time);
      const hintsUsed = HINTS - p.hints;
      const goals = [
        { ok: true, text: 'Bulmacayı çöz' },
        { ok: p.mistakes === 0, text: 'Hiç hata yapma' },
        { ok: t <= d.target && hintsUsed === 0, text: `İpucusuz, ${Math.round(d.target / 60)} dakikanın altında bitir` },
      ];
      const stars = goals.filter(g => g.ok).length;
      const score = Math.max(Math.round(d.base * 0.2), Math.round(d.base - p.mistakes * 150 - hintsUsed * 250 - Math.max(0, t - d.target) * 1.5 + Math.max(0, d.target - t) * 2));
      const r = rec(p.L), newBest = !r.best || score > r.best;
      save.levels[p.L.id] = { cleared: true, stars: Math.max(stars, r.stars || 0), best: Math.max(score, r.best || 0), bestTime: r.bestTime ? Math.min(r.bestTime, t) : t };
      persist();
      const next = LEVELS.find(x => x.di === p.L.di && x.n === p.L.n + 1) || LEVELS.find(x => x.di === p.L.di + 1 && x.n === 0);
      modal(`<h3 class="sd-display">Bulmaca çözüldü!</h3>
        <div class="sd-bigstars" aria-label="${stars} yıldız">${starsHTML(stars)}</div>
        <ul class="sd-goals">${goals.map(g => `<li class="${g.ok ? 'ok' : ''}">${g.ok ? '✔' : '○'} ${g.text}</li>`).join('')}</ul>
        <div class="sd-results"><div>Süre<b>${fmt(t)}</b></div><div>Hata<b>${p.mistakes}</b></div><div>Puan<b>${score}</b></div></div>
        ${newBest && r.best ? '<p class="sd-best">Yeni rekor puan!</p>' : ''}
        <div class="sd-actions">
          <button class="sd-btn alt" data-m="map">Bölümler</button>
          <button class="sd-btn alt" data-m="again">Tekrar</button>
          ${next ? `<button class="sd-btn" data-m="next">Sonraki ▶</button>` : ''}
        </div>`,
      { map() { showMap(); }, again() { startLevel(p.L, true); }, next() { if (next.di !== p.L.di) { save.tab = next.diff.id; persist(); } startLevel(next, true); } });
    }

    function gameOver() {
      const p = play; if (!p || p.over) return;
      p.over = true; sfx('fail');
      const canRetry = p.limit === MAX_MISTAKES;
      modal(`<h3 class="sd-display">${p.limit} hata yaptın</h3>
        <p>${canRetry ? 'Bir şans daha alıp yanlış rakamı silerek devam edebilir ya da bulmacaya baştan başlayabilirsin.' : 'Hata hakkın bitti. Bulmacaya baştan başla, bu sefer notları kullanmayı dene.'}</p>
        <div class="sd-actions">
          <button class="sd-btn alt" data-m="map">Bölümler</button>
          <button class="sd-btn ${canRetry ? 'alt' : ''}" data-m="restart">Baştan başla</button>
          ${canRetry ? '<button class="sd-btn" data-m="more">Bir şans daha</button>' : ''}
        </div>`,
      {
        map() { save.cur = null; persist(); showMap(); },
        restart() { startLevel(p.L, true); },
        more() { closeModal(); p.over = false; p.limit = MAX_MISTAKES + 1; const i = p.sel; if (i >= 0 && p.values[i] && p.values[i] !== p.lv.solution[i]) { p.values[i] = 0; } render(); saveCur(); },
      });
    }

    let toastT = 0;
    function flashToast(msg) {
      const t = root.querySelector('.sd-toast'); if (!t) return;
      t.textContent = msg; t.classList.add('show');
      clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1500);
    }

    // ---------------- çizim
    function render(popCells, units) {
      const p = play; if (!p) return;
      const sel = p.sel, selV = sel >= 0 ? p.values[sel] : 0;
      // çakışmalar: aynı satır/sütun/kutuda tekrar eden rakamlar
      const clash = new Set();
      for (let i = 0; i < 81; i++) if (p.values[i]) for (const j of PEERS[i]) if (p.values[j] === p.values[i]) { clash.add(i); clash.add(j); }
      const peerSet = new Set(sel >= 0 ? PEERS[sel] : []);
      root.querySelectorAll('.sd-cell').forEach(c => {
        const i = +c.dataset.i, v = p.values[i], given = !!p.lv.puzzle[i];
        c.className = 'sd-cell' + (given ? ' given' : '') + (p.hinted.has(i) ? ' hinted' : '') + (i === sel ? ' sel' : peerSet.has(i) ? ' peer' : '') +
          (selV && v === selV && i !== sel ? ' same' : '') + (v && !given && v !== p.lv.solution[i] ? ' err' : '') + (clash.has(i) && !given ? ' clash' : '');
        if (v) c.textContent = v;
        else if (p.notes[i]) { let h = '<span class="sd-notes" aria-hidden="true">'; for (let n = 1; n <= 9; n++) h += `<span class="${selV === n && p.notes[i] & (1 << n) ? 'hl' : ''}">${p.notes[i] & (1 << n) ? n : ''}</span>`; c.innerHTML = h + '</span>'; }
        else c.textContent = '';
        c.setAttribute('aria-label', `Satır ${ROW(i) + 1}, sütun ${COL(i) + 1}: ${v || 'boş'}`);
      });
      if (popCells) popCells.forEach(i => { const c = root.querySelector(`.sd-cell[data-i="${i}"]`); if (c) { void c.offsetWidth; c.classList.add('pop'); } });
      if (units) units.forEach(u => u.cells.forEach((i, k) => { const c = root.querySelector(`.sd-cell[data-i="${i}"]`); if (c) { c.style.animationDelay = k * 40 + 'ms'; void c.offsetWidth; c.classList.add('wave'); setTimeout(() => { c.classList.remove('wave'); c.style.animationDelay = ''; }, 1000); } }));
      // rakam düğmeleri: kalan sayı
      const correct = new Array(10).fill(0);
      p.values.forEach((v, i) => { if (v && v === p.lv.solution[i]) correct[v]++; });
      root.querySelectorAll('.sd-num').forEach(b => {
        const n = +b.dataset.n, left = 9 - correct[n];
        b.classList.toggle('done', left === 0); b.classList.toggle('notes', p.noteMode);
        b.querySelector('small').textContent = left ? left : '✓';
      });
      const nb = root.querySelector('[data-act="notes"]');
      nb.setAttribute('aria-pressed', p.noteMode); root.querySelector('[data-hud="onoff"]').textContent = p.noteMode ? 'AÇIK' : 'KAPALI';
      const hb = root.querySelector('[data-act="hint"]'); hb.disabled = p.hints <= 0; root.querySelector('[data-hud="hints"]').textContent = p.hints;
      root.querySelector('[data-act="undo"]').disabled = !p.undo.length;
      const ms = root.querySelector('[data-hud="mist"]');
      ms.innerHTML = `<span class="sd-hearts">${'❤️'.repeat(Math.max(0, p.limit - p.mistakes))}${'🖤'.repeat(Math.min(p.mistakes, p.limit))}</span>`;
      ms.setAttribute('aria-label', `Hata: ${p.mistakes} / ${p.limit}`);
      const snd = root.querySelector('[data-act="sound"]'); if (snd) snd.textContent = save.sound ? '🔊' : '🔇';
      root.querySelector('[data-act="pause"]').textContent = p.paused ? '▶' : '⏸';
      root.querySelector('.sd-play').classList.toggle('sd-paused', p.paused);
      const t = root.querySelector('[data-hud="time"]'); if (t) t.textContent = fmt(p.time);
    }

    // ---------------- klavye
    on(document, 'keydown', e => {
      const p = play;
      if (!p || e.defaultPrevented) return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if (e.metaKey || e.altKey) return;
      if (root.querySelector('.sd-modal')) { if (e.key === 'Escape' && p.paused) togglePause(); return; }
      const k = e.key;
      if ((e.ctrlKey && (k === 'z' || k === 'Z'))) { e.preventDefault(); act('undo'); return; }
      if (e.ctrlKey) return;
      let handled = true;
      if (/^[1-9]$/.test(k)) { if (e.shiftKey && !p.noteMode) { p.noteMode = true; input(+k); p.noteMode = false; render(); } else input(+k); }
      else if (/^Digit[1-9]$/.test(e.code) && e.shiftKey) { const n = +e.code.slice(5); const was = p.noteMode; p.noteMode = true; input(n); p.noteMode = was; render(); }
      else if (k === 'Backspace' || k === 'Delete' || k === '0') act('erase');
      else if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight') {
        if (p.sel < 0) p.sel = 0;
        const r = ROW(p.sel), c = COL(p.sel);
        const nr = k === 'ArrowUp' ? (r + 8) % 9 : k === 'ArrowDown' ? (r + 1) % 9 : r;
        const nc = k === 'ArrowLeft' ? (c + 8) % 9 : k === 'ArrowRight' ? (c + 1) % 9 : c;
        p.sel = nr * 9 + nc; render();
      }
      else if (k === 'n' || k === 'N') act('notes');
      else if (k === 'h' || k === 'H') act('hint');
      else if (k === 'p' || k === 'P' || k === 'Escape') togglePause();
      else handled = false;
      if (handled) e.preventDefault();
    });
    on(document, 'visibilitychange', () => { if (document.visibilityState === 'hidden') saveCur(); });

    showMap();
    return { destroy() { saveCur(); stopPlay(); cleanups.forEach(f => f()); root.remove(); } };
  }

  // ---------------------------------------------------------------- kayıt
  Portal.register({
    slug: 'sudoku',
    title: 'Sudoku',
    category: 'bulmaca',
    isNew: true,
    short: '48 bulmaca, 4 zorluk',
    tags: ['sudoku', 'rakam', 'mantık', 'bulmaca', 'zeka', 'tek oyunculu', 'mobil'],
    heroFacts: ['48 bulmaca', 'Kolaydan uzmana 4 zorluk', 'Not alma ve ipucu', 'Mobilde de oynanır'],
    description: 'Klasik 9×9 Sudoku. Her satıra, her sütuna ve her 3×3 kutuya 1\'den 9\'a kadar rakamları birer kez yerleştir. Kolay, Orta, Zor ve Uzman olmak üzere 4 zorlukta 48 bulmaca var ve her birinin tek bir çözümü bulunur. Kalem notları, ipucu, geri alma ve hata kontrolü yardımcın olur. Yarım bıraktığın bulmaca kaldığın yerden devam eder.',
    howTo: [
      'Bölüm listesinden bir zorluk ve açık bir bulmaca seç.',
      'Boş bir kareye dokun, sonra alttaki rakamlardan birini seç.',
      'Emin değilsen ✏️ Not modunu aç: rakamlar karenin içine küçük not olarak yazılır.',
      'Yanlış rakam kırmızı görünür ve bir can (❤️) gider. 3 hatada bulmaca biter, ama bir şans daha alabilirsin.',
      'Takılırsan 💡 ipucunu kullan. Her bulmacada 3 ipucu var.',
      'Çözmek 1 yıldız, hatasız çözmek 1 yıldız, ipucusuz ve süre hedefinin altında çözmek 1 yıldız daha kazandırır.',
      'Bir bulmacayı çözmek o zorluktaki sıradakini açar.',
    ],
    controls: [
      ['Dokunma / tıklama', 'Kare ve rakam seç'],
      ['<kbd>1</kbd>–<kbd>9</kbd>', 'Rakam yaz'],
      ['<kbd>Shift</kbd> + rakam', 'Not olarak yaz'],
      ['<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd>', 'Kareler arasında gez'],
      ['<kbd>Sil</kbd> / <kbd>0</kbd>', 'Kareyi temizle'],
      ['<kbd>N</kbd>', 'Not modunu aç/kapat'],
      ['<kbd>H</kbd>', 'İpucu'],
      ['<kbd>Ctrl</kbd> + <kbd>Z</kbd>', 'Geri al'],
      ['<kbd>P</kbd> / <kbd>Esc</kbd>', 'Duraklat'],
    ],
    drawCover,
    mount,
  });
  // test ve hata ayıklama için
  window.__sudoku = { LEVELS, buildLevel, countSolutions };
})();
