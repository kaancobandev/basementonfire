// Realtime'in RLS'i UYGULAYIP uygulamadigini olcer.
// ANON anahtariyla (hicbir politika anon'a verilmedi) messages INSERT dinler,
// sonra service_role ile TEK bir test mesaji atar ve HEMEN siler.
// Olay gelirse: realtime RLS'i uygulamiyor demektir.
import { createClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = createClient(URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const admin = createClient(URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

const alinan = [];
const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

const kanal = anon.channel('rls-testi')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (p) => {
    alinan.push(p.new);
    console.log('  🔴 ANON OLAY ALDI:', JSON.stringify({ conv: p.new?.conversation_id, icerik: p.new?.content }));
  });

await new Promise((cozum) => {
  kanal.subscribe((durum, err) => {
    console.log('  abonelik:', durum, err ? '| ' + err.message : '');
    if (durum === 'SUBSCRIBED') cozum();
    if (durum === 'CHANNEL_ERROR' || durum === 'TIMED_OUT') cozum();
  });
});
await bekle(2000);

const { data: konusma } = await admin.from('conversations').select('id, user1_id, user2_id').limit(1).single();
if (!konusma) { console.log('  konusma yok, test yapilamadi'); process.exit(1); }
console.log('  test konusmasi:', konusma.id);

const { data: eklenen, error: hata } = await admin.from('messages')
  .insert({ conversation_id: konusma.id, sender_id: konusma.user1_id, content: 'RLS-TESTI-SILINECEK' })
  .select('id').single();
if (hata) { console.log('  ekleme hatasi:', hata.message); process.exit(1); }
console.log('  test mesaji eklendi, id:', eklenen.id);

await bekle(6000);

const { error: silHata } = await admin.from('messages').delete().eq('id', eklenen.id);
console.log('  test mesaji silindi:', silHata ? 'HATA ' + silHata.message : 'evet');
const { data: kalan } = await admin.from('messages').select('id').eq('id', eklenen.id);
console.log('  silme dogrulandi:', (kalan || []).length === 0 ? 'EVET, kalmadi' : 'HAYIR HALA DURUYOR');

console.log('');
console.log(alinan.length === 0
  ? '  ✅ SONUC: anon HICBIR olay almadi → realtime RLS UYGULUYOR, sizinti kapandi'
  : `  🔴 SONUC: anon ${alinan.length} olay aldi → realtime RLS UYGULAMIYOR, kod tarafinda duzeltme sart`);
process.exit(0);
