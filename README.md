# Oyunluk — oyun sitesi

Tarayıcıda, indirmeden oynanan oyunlar: **Ada Dedektifi** (ada temalı saklı nesne oyunu, 10 bölüm, 380+ eşya) **Farkı Bul** (iki resim, 7 fark, 10 bölüm) ve **Sudoku** (4 zorluk, 48 bulmaca).

Sade HTML + CSS + JavaScript. Derleme aracı, framework veya sunucu kodu yok.

## Klasörler
- `index.html` — sitenin iskeleti (üst menü, arama, içerik alanı).
- `css/site.css` — sitenin tasarımı (açık/koyu tema renkleri en üstte).
- `js/portal.js` — ana sayfa, kategoriler, arama, oyun sayfası ve oyun kayıt sistemi.
- `games/<oyun>/` — her oyun kendi klasöründe (`game.js`, isterse `game.css`).
- `games/yakinda.js` — henüz yapılmamış oyunların "Yakında" kartları.

## Yeni oyun eklemek
1. `games/yeni-oyun/game.js` oluştur:
```js
Portal.register({
  slug: 'yeni-oyun',            // adres: #oyun-yeni-oyun
  title: 'Yeni Oyun',
  category: 'bulmaca',          // portal.js içindeki CATEGORIES listesinden
  short: 'Kısa alt başlık',
  tags: ['etiket1', 'etiket2'],
  description: 'Oyun sayfasındaki açıklama',
  howTo: ['Adım 1', 'Adım 2'],
  controls: [['Tıklama', 'Seç']],
  cover: { bg: 'linear-gradient(135deg,#7bd389,#2e9e5b)', emoji: '🧩' }, // ya da drawCover(canvas)
  mount(element, api) {
    // oyunu element içine kur. api.store.get/set ile ilerleme sakla (anahtar: api.gameStoreKey)
    return { destroy() { /* olay dinleyicilerini temizle */ } };
  },
});
```
2. `index.html` içine `<script src="games/yeni-oyun/game.js"></script>` satırını `Portal.init()` satırından önce ekle.
3. Oyun `yakinda.js` içinde yer tutucu olarak duruyorsa oradan sil.

## Ada Dedektifi'ne bölüm eklemek
`games/ada-dedektifi/game.js` içinde `LEVELS` dizisine yeni kayıt (ad, zorluk, boyut, aranacak eşyalar, şaşırtmaca eşyalar) ve `PAINTERS` içine sahneyi çizen bir fonksiyon ekle.

## Farkı Bul'a bölüm eklemek
`games/farki-bul/game.js` içinde `SCENES` nesnesine sahneyi kuran bir fonksiyon (arka plan + nesne listesi) ve `LEVELS` dizisine bir kayıt (ad, zorluk, sahne, seed, en küçük fark boyutu, 3 yıldız süresi) ekleyin. 7 fark sahnedeki nesnelerden otomatik seçilir; `seed` değiştirmek farklı farklar üretir.

## Sudoku'ya bulmaca eklemek
`games/sudoku/game.js` içinde `DIFFS` listesindeki bir zorluğun `count` değerini artırın. Bulmacalar sabit tohumdan tarayıcıda üretilir ve her birinin tek çözümü vardır; `clues` o zorluktaki hedef ipucu rakam sayısıdır.

## Yerelde çalıştırma
```
python3 -m http.server 8000
```
Sonra tarayıcıda http://localhost:8000 adresini aç.

## Yayınlama (GitHub Pages)
Depo ayarlarında Settings → Pages → Branch: `main` / `(root)` seçin. Site birkaç dakika içinde `https://<kullanıcı>.github.io/oyunluk/` adresinde açılır.
