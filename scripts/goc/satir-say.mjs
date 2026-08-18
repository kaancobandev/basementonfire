// ════════════════════════════════════════════════════════════════════
// GÖÇ ADIMI 14 — İki proje arasında SATIR SAYISI karşılaştırması.
//
//   node scripts/goc/satir-say.mjs
//
// NEDEN: restore "başarılı" görünüp bir tabloyu yarım bırakabilir.
// pg_restore hataları uzun çıktının içinde kaybolur; bu script iki
// tarafı tablo tablo sayıp farkı tek ekranda gösterir.
//
// Tablo listesi kod tabanından çıkarıldı: uygulamanın FİİLEN kullandığı
// 48 tablo (grep ile .from('...') çağrıları). Şemada olup kod kullanmayan
// tablo varsa bu liste onu görmez — ama kullanılmayan tablo göç açısından
// da önemsizdir.
// ════════════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const { ESKI_SUPABASE_URL, ESKI_SERVICE_KEY, YENI_SUPABASE_URL, YENI_SERVICE_KEY } = process.env;
if (!ESKI_SUPABASE_URL || !ESKI_SERVICE_KEY || !YENI_SUPABASE_URL || !YENI_SERVICE_KEY) {
  console.error('Eksik ortam degiskeni: ESKI_SUPABASE_URL, ESKI_SERVICE_KEY, YENI_SUPABASE_URL, YENI_SERVICE_KEY');
  process.exit(1);
}

const eski = createClient(ESKI_SUPABASE_URL, ESKI_SERVICE_KEY, { auth: { persistSession: false } });
const yeni = createClient(YENI_SUPABASE_URL, YENI_SERVICE_KEY, { auth: { persistSession: false } });

const TABLOLAR = [
  'article_comments','article_poll_votes','article_quiz_answers','article_reads','article_saves',
  'blocks','bookmarks','close_friends','collections','comment_likes','comments','conversations',
  'daily_answers','deleted_media','did_you_know','dyk_likes','fact_likes','fact_reposts',
  'follow_requests','follows','game_scores','hashtags','login_events','matches','messages',
  'music_tracks','notifications','page_views','perf_samples','polls','post_hashtags','post_likes',
  'post_polls','posts','quick_facts','quiz_questions','reports','spotify_playlists','stories',
  'story_highlight_items','story_highlights','story_views','swipes','user_articles','user_badges',
  'user_progress','users','youtube_items',
];

const say = async (istemci, tablo) => {
  const { count, error } = await istemci.from(tablo).select('*', { count: 'exact', head: true });
  return error ? { hata: error.message } : { n: count ?? 0 };
};

const sonuc = await Promise.all(TABLOLAR.map(async (t) => {
  const [e, y] = await Promise.all([say(eski, t), say(yeni, t)]);
  return { tablo: t, e, y };
}));

let fark = 0, hata = 0;
console.log('tablo'.padEnd(24) + 'eski'.padStart(8) + 'yeni'.padStart(8) + '   durum');
console.log('─'.repeat(52));
for (const { tablo, e, y } of sonuc) {
  if (e.hata || y.hata) {
    hata++;
    console.log(tablo.padEnd(24) + String(e.hata ? 'HATA' : e.n).padStart(8) + String(y.hata ? 'HATA' : y.n).padStart(8) + '   ✗ ' + (e.hata || y.hata).slice(0, 40));
    continue;
  }
  const esit = e.n === y.n;
  if (!esit) fark++;
  // Sifir-sifir da esittir ama dikkat cekmesi icin isaretlenir.
  const isaret = !esit ? '✗ FARK' : (e.n === 0 ? '· ikisi de bos' : '✓');
  console.log(tablo.padEnd(24) + String(e.n).padStart(8) + String(y.n).padStart(8) + '   ' + isaret);
}
console.log('─'.repeat(52));
console.log(fark === 0 && hata === 0
  ? `TAMAM — ${TABLOLAR.length} tablonun hepsi esit`
  : `⚠ ${fark} tabloda FARK, ${hata} tabloda HATA. Restore eksik.`);
process.exit(fark === 0 && hata === 0 ? 0 : 1);
