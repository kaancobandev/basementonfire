// Her medya dosyasının GERÇEKTEN gelip gelmediğini sınar ve eksikleri tamamlar.
//
// ⚠ NEDEN list() YETMİYOR: storage.objects META VERİSİ ile S3'teki BAYTLAR ayrı
// şeyler. Göç sırasında meta veri dökümden geri yüklendi ama baytlar Supabase'in
// yetim-nesne temizliği tarafından silinmişti — list() dosyayı görüyor, indirme
// "NoSuchKey" diyordu. 25 dosyanın 23'ü böyle "var görünüp yok"tu.
// Tek güvenilir sınama: NESNEYİ GERÇEKTEN İSTE.
//
// Herkese açık kovada HEAD ile herkese açık URL denenir — tarayıcının izlediği
// yolun birebir aynısı (kova public mi, yol doğru mu, bayt var mı: üçünü birden
// sınar). Özel kovada service-role ile indirilir.
import { createClient } from '@supabase/supabase-js';

const eski = createClient(process.env.ESKI_SUPABASE_URL, process.env.ESKI_SERVICE_KEY, { auth: { persistSession: false } });
const yeni = createClient(process.env.YENI_SUPABASE_URL, process.env.YENI_SERVICE_KEY, { auth: { persistSession: false } });
const YENI_URL = process.env.YENI_SUPABASE_URL;
const tamamla = process.argv.includes('--tamamla');

// Klasörleri gezerek TÜM dosya yollarını toplar (list() özyinelemeli değil).
async function yollar(sb, kova, on = '') {
  const cikti = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await sb.storage.from(kova).list(on, { limit: 100, offset });
    if (error) throw new Error(`${kova}/${on}: ${error.message}`);
    if (!data?.length) break;
    for (const g of data) {
      const yol = on ? `${on}/${g.name}` : g.name;
      // id === null → klasör, dosya değil
      if (g.id === null) cikti.push(...await yollar(sb, kova, yol));
      else cikti.push(yol);
    }
    if (data.length < 100) break;
  }
  return cikti;
}

async function geliyorMu(kova, yol, acik) {
  if (acik) {
    const u = `${YENI_URL}/storage/v1/object/public/${kova}/${yol.split('/').map(encodeURIComponent).join('/')}`;
    try {
      const r = await fetch(u, { method: 'HEAD' });
      return r.ok ? null : `HTTP ${r.status}`;
    } catch (e) { return `ağ: ${e.message}`; }
  }
  const { error } = await yeni.storage.from(kova).download(yol);
  return error ? error.message : null;
}

async function main() {
  const { data: kovalar } = await yeni.storage.listBuckets();
  let toplamEksik = 0;

  for (const k of kovalar) {
    const liste = await yollar(yeni, k.name);
    process.stdout.write(`\n── ${k.name} (${k.public ? 'herkese açık' : 'özel'}) — ${liste.length} dosya\n`);

    // Sınamalar paralel ama 8'erli — Supabase'i boğmasın.
    const eksikler = [];
    for (let i = 0; i < liste.length; i += 8) {
      const grup = liste.slice(i, i + 8);
      const sonuc = await Promise.all(grup.map((y) => geliyorMu(k.name, y, k.public)));
      grup.forEach((y, j) => { if (sonuc[j]) eksikler.push([y, sonuc[j]]); });
      process.stdout.write(`\r   sınandı ${Math.min(i + 8, liste.length)}/${liste.length}  eksik: ${eksikler.length}   `);
    }
    process.stdout.write('\n');

    if (!eksikler.length) { console.log('   ✓ hepsi geliyor'); continue; }
    toplamEksik += eksikler.length;
    console.log(`   ✗ ${eksikler.length} dosya GELMİYOR:`);
    for (const [y, n] of eksikler.slice(0, 10)) console.log(`      ${y}  → ${n}`);
    if (eksikler.length > 10) console.log(`      … ve ${eksikler.length - 10} tane daha`);

    if (!tamamla) continue;
    console.log(`   → eskiden çekilip yeniden yükleniyor…`);
    for (const [y] of eksikler) {
      try {
        const { data: blob, error: eHata } = await eski.storage.from(k.name).download(y);
        if (eHata) throw new Error(`indir: ${eHata.message}`);
        const { error: yHata } = await yeni.storage.from(k.name)
          .upload(y, blob, { contentType: blob.type || 'application/octet-stream', upsert: true });
        if (yHata) throw new Error(`yükle: ${yHata.message}`);
        console.log(`      ✓ ${y}  ${(blob.size / 1048576).toFixed(1)} MB`);
        toplamEksik--;
      } catch (e) { console.log(`      ✗ ${y}  → ${e.message}`); }
    }
  }

  console.log(toplamEksik === 0
    ? '\n✅ TAMAM — tüm dosyalar geliyor.'
    : `\n⚠ ${toplamEksik} dosya hâlâ eksik.${tamamla ? '' : ' Tamamlamak için: --tamamla'}`);
  process.exit(toplamEksik === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
