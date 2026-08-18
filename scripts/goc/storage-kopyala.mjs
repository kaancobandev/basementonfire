// ════════════════════════════════════════════════════════════════════
// GÖÇ ADIMI 8 — Storage nesnelerini eski projeden yenisine kopyalar.
//
//   node scripts/goc/storage-kopyala.mjs           # kopyala
//   node scripts/goc/storage-kopyala.mjs --dogrula # sadece say, kopyalama
//
// NEDEN ELLE: Supabase'in ne yedeği ne de "Restore to a new project"
// akışı Storage nesnelerini taşır. Veritabanı dökümü yalnız META VERİYİ
// içerir; dosyaların kendisi ayrı taşınmak zorunda.
//
// ⚠ RESMÎ ÖRNEKTEN FARKI: Supabase'in doküman örneği klasör başına
// limit(1000) kullanıyor ve OFFSET DÖNGÜSÜ YOK — 1000'den fazla dosyalı
// bir klasörde gerisini sessizce atlar. Bu projede ölçüldü (15.08.2026):
// hiçbir klasörde 900+ dosya yok, yani bugün ısırmıyor. Yine de döngü
// eklendi: kesime kadar veri büyüyebilir ve arıza SESSİZ.
//
// ÖLÇÜLEN ENVANTER (15.08.2026, sql/goc/00-storage-envanteri.sql):
//   media    71 nesne   634 MB   en büyük 185 MB   4 üst klasör, 3 seviye
//   archive  48 nesne   3.8 MB   en büyük 526 kB   2 üst klasör, 2 seviye
//
// ⚠⚠ 185 MB'LIK DOSYA: yeni bucket VARSAYILAN limiti 50 MB'tır. Bucket
// yanlış limitle açılırsa o dosyanın yüklenmesi başarısız olur ve script
// bunu satır satır raporlar. Aşağıdaki createBucket fileSizeLimit'i
// eskisiyle eşleştiriyor (500 MB).
// ════════════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const ESKI_URL = process.env.ESKI_SUPABASE_URL;
const ESKI_KEY = process.env.ESKI_SERVICE_KEY;
const YENI_URL = process.env.YENI_SUPABASE_URL;
const YENI_KEY = process.env.YENI_SERVICE_KEY;

if (!ESKI_URL || !ESKI_KEY || !YENI_URL || !YENI_KEY) {
  console.error('Eksik ortam değişkeni. Gerekli: ESKI_SUPABASE_URL, ESKI_SERVICE_KEY, YENI_SUPABASE_URL, YENI_SERVICE_KEY');
  process.exit(1);
}

const eski = createClient(ESKI_URL, ESKI_KEY, { auth: { persistSession: false } });
const yeni = createClient(YENI_URL, YENI_KEY, { auth: { persistSession: false } });

// Ölçülen mevcut yapılandırma — yeni projede birebir aynısı kurulur.
const BUCKETLAR = [
  { id: 'media',   public: true,  fileSizeLimit: 524288000 },  // 500 MB
  { id: 'archive', public: false, fileSizeLimit: 524288000 },
];

const SAYFA = 1000;
const yalnizDogrula = process.argv.includes('--dogrula');

/** Bir klasörü ÖZYİNELEMELİ gezer, tüm dosya yollarını döndürür.
 *  Sayfalama: list() en fazla `limit` kadar döndürür; offset ile devam
 *  edilmezse gerisi SESSİZCE kaybolur. */
async function dosyalariTopla(istemci, bucket, yol = '') {
  const cikti = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await istemci.storage.from(bucket)
      .list(yol, { limit: SAYFA, offset, sortBy: { column: 'name', order: 'asc' } });
    if (error) throw new Error(`list(${bucket}/${yol}) hata: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const g of data) {
      const tam = yol ? `${yol}/${g.name}` : g.name;
      // Klasörlerin id'si null gelir; dosyaların id'si dolu.
      if (g.id === null) cikti.push(...await dosyalariTopla(istemci, bucket, tam));
      else cikti.push({ yol: tam, boyut: g.metadata?.size ?? 0, tip: g.metadata?.mimetype });
    }
    if (data.length < SAYFA) break;
    offset += SAYFA;
  }
  return cikti;
}

const mb = (b) => (b / 1024 / 1024).toFixed(1);

async function main() {
  // ── Doğrulama modu: iki tarafı say ve karşılaştır, hiçbir şey yazma.
  if (yalnizDogrula) {
    console.log('DOĞRULAMA — kopyalama yapılmıyor\n');
    let hepsiTamam = true;
    for (const { id } of BUCKETLAR) {
      const [e, y] = await Promise.all([
        dosyalariTopla(eski, id).catch(() => null),
        dosyalariTopla(yeni, id).catch(() => null),
      ]);
      const es = e?.length ?? '—', ys = y?.length ?? '—';
      const tamam = e && y && e.length === y.length;
      if (!tamam) hepsiTamam = false;
      console.log(`  ${id.padEnd(9)} eski ${String(es).padStart(5)}  yeni ${String(ys).padStart(5)}  ${tamam ? '✓' : '✗ EŞLEŞMİYOR'}`);
      if (e && y) {
        const yeniKume = new Set(y.map((f) => f.yol));
        const eksik = e.filter((f) => !yeniKume.has(f.yol));
        if (eksik.length) {
          console.log(`     eksik ${eksik.length} dosya, ilk 10:`);
          eksik.slice(0, 10).forEach((f) => console.log(`       ${f.yol}`));
        }
      }
    }
    console.log(hepsiTamam ? '\nSonuç: TAMAM' : '\nSonuç: EKSİK VAR — kopyalamayı tekrar çalıştır');
    process.exit(hepsiTamam ? 0 : 1);
  }

  // ── Bucket'ları yeni projede hazırla (yoksa oluştur, limiti eşle).
  const { data: mevcut } = await yeni.storage.listBuckets();
  const mevcutIdler = new Set((mevcut ?? []).map((b) => b.id));
  for (const b of BUCKETLAR) {
    if (mevcutIdler.has(b.id)) {
      console.log(`· ${b.id} zaten var — limitini ELLE doğrula (185 MB'lık dosya için ≥500 MB olmalı)`);
      continue;
    }
    const { error } = await yeni.storage.createBucket(b.id, { public: b.public, fileSizeLimit: b.fileSizeLimit });
    if (error) throw new Error(`createBucket(${b.id}): ${error.message}`);
    console.log(`✓ ${b.id} oluşturuldu (public=${b.public}, limit=${mb(b.fileSizeLimit)} MB)`);
  }

  // ── Kopyala.
  let toplamHata = 0;
  for (const { id } of BUCKETLAR) {
    const dosyalar = await dosyalariTopla(eski, id);
    const toplamBayt = dosyalar.reduce((s, f) => s + f.boyut, 0);
    console.log(`\n── ${id}: ${dosyalar.length} dosya, ${mb(toplamBayt)} MB`);

    let i = 0;
    for (const f of dosyalar) {
      i++;
      const etiket = `[${String(i).padStart(3)}/${dosyalar.length}] ${f.yol}`;
      try {
        const { data: blob, error: indirHata } = await eski.storage.from(id).download(f.yol);
        if (indirHata) throw new Error(`indir: ${indirHata.message}`);
        const buf = Buffer.from(await blob.arrayBuffer());

        const { error: yukleHata } = await yeni.storage.from(id).upload(f.yol, buf, {
          contentType: f.tip || blob.type || 'application/octet-stream',
          upsert: true,   // tekrar çalıştırılabilir olsun
        });
        if (yukleHata) throw new Error(`yükle: ${yukleHata.message}`);
        console.log(`  ✓ ${etiket}  ${mb(f.boyut)} MB`);
      } catch (e) {
        toplamHata++;
        console.error(`  ✗ ${etiket}  → ${e.message}`);
      }
    }
  }

  console.log(toplamHata === 0
    ? '\nKopyalama bitti, hata yok. Şimdi: node scripts/goc/storage-kopyala.mjs --dogrula'
    : `\n⚠ ${toplamHata} dosya kopyalanamadı. Yukarıdaki ✗ satırlarına bak, düzelt, TEKRAR çalıştır (upsert açık, güvenli).`);
  process.exit(toplamHata === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
