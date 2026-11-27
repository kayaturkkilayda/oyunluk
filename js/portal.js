/*
 * Oyunluk portal çekirdeği.
 * Yeni oyun eklemek için: games/<oyun-adi>/game.js dosyası oluşturup içinde
 * Portal.register({...}) çağırın ve index.html'e <script> etiketini ekleyin.
 * Ayrıntılar: README.md
 */
(function () {
  'use strict';

  const CATEGORIES = [
    { id: 'sakli-nesne', name: 'Saklı Nesne', icon: '🔍' },
    { id: 'bulmaca', name: 'Bulmaca', icon: '🧩' },
    { id: 'zeka', name: 'Zeka', icon: '🧠' },
    { id: 'beceri', name: 'Beceri', icon: '🎯' },
    { id: 'aksiyon', name: 'Aksiyon', icon: '⚡' },
  ];

  const games = [];
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* depolama kapalı olabilir */ } },
  };

  const Portal = {
    categories: CATEGORIES,
    games,
    store,
    /**
     * Oyun kaydı. Alanlar:
     *  slug, title, category, tags[], short, description, howTo[], controls[[tuş, açıklama]],
     *  cover: { bg, emoji } veya drawCover(canvas) fonksiyonu,
     *  mount(element, api) -> { destroy() }   (oynanabilir oyunlar için)
     *  status: 'yakinda' -> kart gösterilir ama oynanamaz
     */
    register(game) {
      if (!game || !game.slug) throw new Error('Oyun kaydı için slug gerekli');
      if (games.some(g => g.slug === game.slug)) return;
      games.push(game);
    },
  };
  window.Portal = Portal;

  // ---------- yardımcılar ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const catName = id => (CATEGORIES.find(c => c.id === id) || { name: id }).name;
  const playable = g => typeof g.mount === 'function' && g.status !== 'yakinda';

  function coverHTML(g) {
    if (g.drawCover) return `<div class="card-cover" data-cover="${esc(g.slug)}"><canvas width="360" height="240" aria-hidden="true"></canvas></div>`;
    const c = g.cover || {};
    return `<div class="card-cover" style="background:${esc(c.bg || 'var(--surface-2)')}" aria-hidden="true">${esc(c.emoji || '🎮')}</div>`;
  }
  function paintCovers(root) {
    root.querySelectorAll('[data-cover]').forEach(el => {
      const g = games.find(x => x.slug === el.dataset.cover);
      const cv = el.querySelector('canvas');
      if (g && cv && !cv.dataset.done) { cv.dataset.done = '1'; try { g.drawCover(cv); } catch (e) { console.warn(e); } }
    });
  }
  function cardHTML(g) {
    const soon = !playable(g);
    const tag = soon ? 'div' : 'a';
    const href = soon ? '' : ` href="#oyun-${esc(g.slug)}"`;
    const badge = soon ? '<span class="badge soon">Yakında</span>' : (g.isNew ? '<span class="badge">Yeni</span>' : '');
    return `<${tag} class="card${soon ? ' soon' : ''}"${href}${soon ? ' aria-disabled="true"' : ''}>
      ${coverHTML(g)}${badge}
      <div class="card-body"><span class="card-title">${esc(g.title)}</span><span class="card-sub">${esc(catName(g.category))} · ${esc(g.short || '')}</span></div>
    </${tag}>`;
  }

  // ---------- görünümler ----------
  const app = () => $('#app');
  let current = null; // açık oyun örneği

  function setNav(id) {
    document.querySelectorAll('.nav a').forEach(a => a.setAttribute('aria-current', a.dataset.nav === id ? 'page' : 'false'));
  }

  function viewHome(filter = 'tum', query = '') {
    setNav('home');
    const featured = games.find(g => g.featured && playable(g)) || games.find(playable);
    const list = games.filter(g => (filter === 'tum' || g.category === filter) && matches(g, query));
    const recentSlugs = store.get('oyunluk.recent', []).filter(s => games.some(g => g.slug === s && playable(g)));
    app().innerHTML = `
      ${featured && !query ? `
      <section class="hero" aria-label="Öne çıkan oyun">
        <div class="hero-text">
          <span class="eyebrow">Öne çıkan oyun</span>
          <h1>${esc(featured.title)}</h1>
          <p>${esc(featured.description)}</p>
          <div class="hero-meta">${(featured.heroFacts || []).map(f => `<span class="pill">${esc(f)}</span>`).join('')}</div>
          <a class="btn" href="#oyun-${esc(featured.slug)}">▶ Hemen oyna</a>
        </div>
        <div class="hero-cover" ${featured.drawCover ? `data-cover="${esc(featured.slug)}"` : ''}><canvas width="720" height="480" aria-hidden="true"></canvas></div>
      </section>` : ''}
      ${recentSlugs.length && !query ? `
      <section class="section"><div class="section-head"><h2>Son oynadıkların</h2></div>
        <div class="grid">${recentSlugs.slice(0, 4).map(s => cardHTML(games.find(g => g.slug === s))).join('')}</div>
      </section>` : ''}
      <section class="section">
        <div class="section-head"><h2>${query ? `“${esc(query)}” için sonuçlar` : 'Tüm oyunlar'}</h2><span class="count">${list.length} oyun</span></div>
        <div class="chips" role="group" aria-label="Kategori filtresi">
          <button class="chip" data-filter="tum" aria-pressed="${filter === 'tum'}">Tümü</button>
          ${CATEGORIES.map(c => `<button class="chip" data-filter="${c.id}" aria-pressed="${filter === c.id}">${c.icon} ${esc(c.name)}</button>`).join('')}
        </div>
        ${list.length ? `<div class="grid">${list.map(cardHTML).join('')}</div>` : `<div class="empty">Bu filtreye uyan oyun yok. Başka bir kategori dene.</div>`}
      </section>`;
    paintCovers(app());
    app().querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => viewHome(b.dataset.filter, query)));
  }

  function matches(g, q) {
    if (!q) return true;
    const hay = (g.title + ' ' + (g.tags || []).join(' ') + ' ' + catName(g.category)).toLocaleLowerCase('tr');
    return hay.includes(q.toLocaleLowerCase('tr'));
  }

  function viewGame(slug) {
    setNav('');
    const g = games.find(x => x.slug === slug);
    if (!g || !playable(g)) { viewHome(); return; }
    const recent = [slug, ...store.get('oyunluk.recent', []).filter(s => s !== slug)].slice(0, 8);
    store.set('oyunluk.recent', recent);
    const similar = games.filter(x => x.slug !== slug && (x.category === g.category || (x.tags || []).some(t => (g.tags || []).includes(t)))).slice(0, 4);
    document.title = g.title + ' · Oyunluk';
    app().innerHTML = `
      <nav class="crumbs" aria-label="Konum"><a href="#ana-sayfa">Ana sayfa</a><span>›</span><a href="#kategori-${esc(g.category)}">${esc(catName(g.category))}</a><span>›</span><span>${esc(g.title)}</span></nav>
      <div class="game-head">
        <h1>${esc(g.title)}</h1>
        <div class="game-actions">
          <button class="btn ghost small" id="btn-fullscreen" type="button">⛶ Tam ekran</button>
        </div>
      </div>
      <div class="stage-frame" id="stage"></div>
      <div class="game-info">
        <div class="panel">
          <h2>Oyun hakkında</h2>
          <p>${esc(g.description)}</p>
          ${g.howTo ? `<h2>Nasıl oynanır?</h2><ol class="steps">${g.howTo.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
          <div class="tags">${(g.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        </div>
        <div class="panel">
          <h2>Kontroller</h2>
          <table class="keys"><tbody>${(g.controls || []).map(([k, v]) => `<tr><td>${k}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table>
        </div>
      </div>
      ${similar.length ? `<section class="section"><div class="section-head"><h2>Benzer oyunlar</h2></div><div class="grid">${similar.map(cardHTML).join('')}</div></section>` : ''}`;
    paintCovers(app());
    const stage = $('#stage');
    $('#btn-fullscreen').addEventListener('click', () => {
      const el = stage;
      if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); return; }
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    });
    current = g.mount(stage, { store, gameStoreKey: 'oyunluk.game.' + g.slug });
    window.scrollTo(0, 0);
    if (window.innerWidth < 640) setTimeout(() => stage.scrollIntoView({ block: 'start' }), 50);
  }

  function route() {
    if (current && current.destroy) { try { current.destroy(); } catch (e) { console.warn(e); } }
    current = null;
    document.title = 'Oyunluk';
    const h = location.hash.replace(/^#/, '');
    const q = ($('#search') || {}).value || '';
    if (h.startsWith('oyun-')) return viewGame(h.slice(5));
    if (h.startsWith('kategori-')) { setNav(''); return viewHome(h.slice(9)); }
    if (h === 'tum-oyunlar') { viewHome('tum', q); setNav('all'); return; }
    viewHome('tum', q);
  }

  function init() {
    games.sort((a, b) => (playable(b) - playable(a)) || (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    const search = $('#search');
    let t;
    search.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (location.hash.startsWith('#oyun-')) { location.hash = 'tum-oyunlar'; return; }
        viewHome('tum', search.value.trim());
      }, 150);
    });
    window.addEventListener('hashchange', route);
    route();
  }
  Portal.init = init;
})();
