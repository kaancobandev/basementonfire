// app/messages/page.tsx'teki sorgunun AYNISINI kosar.
// Bos konusma olusturur → listede GORUNMEMELI → siler.
import { createClient } from '@supabase/supabase-js';
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

const liste = (meId) => db.from('conversations')
  .select('id, last_message_at, u1:user1_id(id, username), u2:user2_id(id, username), messages!messages_conversation_id_fkey!inner(conversation_id, content, sender_id, created_at)')
  .or(`user1_id.eq.${meId},user2_id.eq.${meId}`)
  .order('last_message_at', { ascending: false })
  .order('created_at', { foreignTable: 'messages', ascending: false })
  .limit(1, { foreignTable: 'messages' });

const { data: ular } = await db.from('users').select('id, username').order('id').limit(30);
const { data: mevcut } = await db.from('conversations').select('user1_id, user2_id');
const cift = new Set((mevcut||[]).map(c => `${c.user1_id}-${c.user2_id}`));

let a = null, b = null;
for (const x of ular) for (const y of ular) {
  if (x.id >= y.id) continue;
  if (!cift.has(`${x.id}-${y.id}`)) { a = x; b = y; break; }
  if (a) break;
}
if (!a) { console.log('bos cift bulunamadi'); process.exit(1); }

const { data: once } = await liste(a.id);
console.log(`  ONCE  — ${a.username} listesinde ${(once||[]).length} konusma`);

const { data: yeni, error: eh } = await db.from('conversations')
  .insert({ user1_id: a.id, user2_id: b.id }).select('id').single();
if (eh) { console.log('  ekleme hatasi:', eh.message); process.exit(1); }
console.log(`  BOS konusma olusturuldu: #${yeni.id}  (${a.username} ↔ ${b.username}, hic mesaj yok)`);

const { data: sonra, error: sh } = await liste(a.id);
if (sh) { console.log('  SORGU HATASI:', sh.message, sh.hint || ''); }
console.log(`  SONRA — ${a.username} listesinde ${(sonra||[]).length} konusma`);
const gorunuyor = (sonra||[]).some(c => c.id === yeni.id);
console.log(`  bos konusma listede gorunuyor mu: ${gorunuyor ? '🔴 EVET (duzeltme CALISMIYOR)' : '✅ HAYIR (gizlendi)'}`);

// karsi tarafta da gorunmemeli — asil mahremiyet noktasi
const { data: karsi } = await liste(b.id);
console.log(`  KARSI TARAF (${b.username}) listesinde gorunuyor mu: ${(karsi||[]).some(c => c.id === yeni.id) ? '🔴 EVET' : '✅ HAYIR'}`);

await db.from('conversations').delete().eq('id', yeni.id);
const { data: kalan } = await db.from('conversations').select('id').eq('id', yeni.id);
console.log(`  test konusmasi silindi: ${(kalan||[]).length === 0 ? 'evet' : '🔴 HAYIR HALA DURUYOR'}`);
console.log(`  mevcut dolu konusmalar korundu mu: ${(sonra||[]).length === (once||[]).length ? 'EVET' : 'FARK VAR (' + (once||[]).length + ' → ' + (sonra||[]).length + ')'}`);
