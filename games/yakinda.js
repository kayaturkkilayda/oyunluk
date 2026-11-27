/* Henüz yapılmamış oyunlar için yer tutucu kartlar. Oyun hazır olunca buradan silip kendi klasörüne taşıyın. */
[
  { slug: 'hafiza-kartlari', title: 'Hafıza Kartları', category: 'zeka', short: 'Eşleri bul', tags: ['hafıza', 'kart'], cover: { bg: 'linear-gradient(135deg,#7bd389,#2e9e5b)', emoji: '🃏' } },
  { slug: 'kelime-avi', title: 'Kelime Avı', category: 'bulmaca', short: 'Harflerden kelime', tags: ['kelime', 'türkçe'], cover: { bg: 'linear-gradient(135deg,#ffd166,#ff9f1c)', emoji: '🔤' } },
  { slug: 'balon-patlat', title: 'Balon Patlat', category: 'beceri', short: 'Renkleri eşle', tags: ['balon', 'refleks'], cover: { bg: 'linear-gradient(135deg,#ff9a8b,#ff6b4a)', emoji: '🎈' } },
].forEach(g => Portal.register(Object.assign({ status: 'yakinda' }, g)));
