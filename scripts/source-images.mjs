// Wikimedia Commons'tan DOĞRULANMIŞ + LİSANSLI makale görseli indirir.
//
//   node scripts/source-images.mjs <slug>          # indir
//   node scripts/source-images.mjs <slug> --dry    # sadece doğrula, indirme
//
// Girdi : scripts/image-specs/<slug>.json
// Çıktı : public/articles/<slug>/*.webp + README.md (manifest) + <slug>.snippets.txt
//
// NEDEN BU SCRIPT VAR (fatih'ten alınan ders):
//   fatih görselleri elle, Google Görseller'den indirilmişti (.jfif izleri) →
//   kaynağı ve lisansı kayıtsız, çözünürlük düşük (rumeli-hisari 550×364).
//   Bu boru hattı üç şeyi garanti eder:
//     1. Dosya GERÇEKTEN var (API doğrular; uydurma başlık sessizce geçemez).
//     2. Lisans ticari kullanıma açık (NC/ND REDDEDİLİR — reklam/sponsorluk planı var).
//     3. ratio prop'u indirilen dosyanın GERÇEK boyutundan üretilir → CLS yok.

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const API = 'https://commons.wikimedia.org/w/api.php';
// Wikimedia UA politikası: iletişim bilgisi ZORUNLU, yoksa 403.
const UA = 'basementonfire-image-sourcing/1.0 (https://basementonfire.com; kaaan3452@gmail.com)';

const MAX_W = 1600;       // Netlify Image CDN zaten responsive üretir; kaynağı şişirme.
const WEBP_QUALITY = 82;

// Ticari kullanıma açık olanlar. Reklam/sponsorluk hedefi var → NC ve ND YASAK.
const OK_LICENSE = /^(cc0|cc[ -]by([ -]sa)?[ -]\d|public domain|pd[ -]|no restrictions|attribution)/i;
const BAD_LICENSE = /(\bnc\b|noncommercial|non-commercial|\bnd\b|noderiv|fair use|non-free)/i;

// Etiketleri BOŞLUKLA değiştir, boşlukla değil: `Rama<br>Own work` → "Rama Own work"
// ("RamaOwn work" değil). `<a>Name</a>` → " Name " → trim → "Name", güvenli.
const strip = (html) => (html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

async function api(params) {
  const url = `${API}?${new URLSearchParams({ ...params, format: 'json', origin: '*' })}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

async function lookup(titles) {
  const data = await api({
    action: 'query',
    titles: titles.join('|'),
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiextmetadatafilter: 'LicenseShortName|Artist|Credit|Attribution|AttributionRequired|LicenseUrl|UsageTerms|DateTimeOriginal',
  });
  const pages = data?.query?.pages ?? {};
  // normalized: API başlığı düzeltirse (alt çizgi/boşluk) eşleşmeyi koru.
  const norm = Object.fromEntries((data?.query?.normalized ?? []).map((n) => [n.to, n.from]));
  const out = new Map();
  for (const p of Object.values(pages)) {
    const key = norm[p.title] ?? p.title;
    if (p.missing !== undefined || !p.imageinfo?.length) { out.set(key, null); continue; }
    const ii = p.imageinfo[0];
    const em = ii.extmetadata ?? {};
    out.set(key, {
      title: p.title,
      url: ii.url,
      descUrl: ii.descriptionurl,
      width: ii.width,
      height: ii.height,
      license: strip(em.LicenseShortName?.value) || '?',
      licenseUrl: strip(em.LicenseUrl?.value),
      artist: strip(em.Artist?.value) || '',
      credit: strip(em.Credit?.value) || '',
      // Attribution = Commons'ın "böyle atıf ver" kanonik metni (varsa yazar+lisans içinde).
      // AttributionRequired='true' → PD etiketli olsa bile foto telifi atıf ister.
      attribution: strip(em.Attribution?.value) || '',
      attribReq: /^true$/i.test(strip(em.AttributionRequired?.value)),
      date: strip(em.DateTimeOriginal?.value) || '',
    });
  }
  return out;
}

function judge(info) {
  const l = info.license;
  if (BAD_LICENSE.test(l)) return { ok: false, why: `ticari kullanıma kapalı (${l})` };
  if (!OK_LICENSE.test(l)) return { ok: false, why: `tanınmayan lisans (${l}) — elle bak` };
  return { ok: true };
}

/** Atıf sahibi. artist BOŞ OLABİLİR — Commons'ta atıf bazen yalnızca Credit'te durur.
 *
 *  Ölçüldü: Marcus Agrippa Louvre Ma3554.jpg → Artist YOK, AttributionRequired=true,
 *  Credit="Marie-Lan Nguyen (User:Jastrow), 2009". Fallback olmadan bu dosya çıplak
 *  "CC BY 2.5" üretiyordu = lisansın BY şartının İHLALİ (reklam/sponsorluk planı var,
 *  yani teorik risk değil). SIRA ÖNEMLİ, ters çevirme: Credit çoğu dosyada atıf değil
 *  çöp taşır — Castro'da kaynak URL'si, Kalkriese'de dosya adı. Bu yüzden yalnızca
 *  artist boşken devreye girer. */
const attrib = (info) => info.artist || info.credit;

/** ArticleImage `credit` prop'u için atıf satırı. CC BY/BY-SA'da ZORUNLU.
 *  Attribution alanı varsa onu kullan — foto-vs-eser lisans karmaşasını atlar
 *  (doğru yazar+lisans zaten o metnin içinde). */
function creditLine(info) {
  if (info.attribution) return info.attribution.slice(0, 90);
  const l = info.license;
  const who = attrib(info).slice(0, 60);
  if (/^cc0/i.test(l)) return who ? `${who} · CC0` : 'CC0';
  if (/public domain|^pd/i.test(l)) return who ? `${who} · kamu malı` : 'Kamu malı';
  return who ? `${who} · ${l}` : l;
}

async function main() {
  const slug = process.argv[2];
  const dry = process.argv.includes('--dry');
  if (!slug) { console.error('kullanım: node scripts/source-images.mjs <slug> [--dry]'); process.exit(1); }

  const specPath = path.join('scripts', 'image-specs', `${slug}.json`);
  const spec = JSON.parse(await readFile(specPath, 'utf8'));
  const outDir = path.join('public', 'articles', slug);

  const infos = await lookup(spec.files.map((f) => f.title));
  const rows = [];
  const snippets = [];
  let failed = 0;

  for (const f of spec.files) {
    const info = infos.get(f.title);
    if (!info) { console.log(`✗ ${f.as}: DOSYA YOK → ${f.title}`); failed++; continue; }

    const verdict = judge(info);
    if (!verdict.ok) { console.log(`✗ ${f.as}: ${verdict.why}`); failed++; continue; }

    // MAYIN: PD etiketli ama atıf zorunlu → foto telifi eserinkinden AYRI (Commons
    // LicenseShortName en müsamahakâr etiketi verir). creditLine Attribution'a düşer.
    if (info.attribReq && /public domain|^pd/i.test(info.license)) {
      console.log(`  ⚠ ${f.as}: lisans "${info.license}" ama ATIF ZORUNLU → ${creditLine(info)}`);
    }

    const name = `${f.as}.webp`;
    let w = info.width, h = info.height;

    if (!dry) {
      await mkdir(outDir, { recursive: true });
      const buf = Buffer.from(await (await fetch(info.url, { headers: { 'User-Agent': UA } })).arrayBuffer());
      const img = sharp(buf).rotate();                       // rotate() = EXIF yönünü uygula
      const meta = await img.metadata();
      const resized = meta.width > MAX_W ? img.resize({ width: MAX_W }) : img;
      const out = await resized.webp({ quality: WEBP_QUALITY }).toBuffer();
      ({ width: w, height: h } = await sharp(out).metadata());
      await writeFile(path.join(outDir, name), out);
      console.log(`✓ ${name}  ${w}×${h}  ${(out.length / 1024).toFixed(0)}KB  ${info.license}`);
    } else {
      // --dry, YAZILACAK credit'i göster (creditLine) — ham artist'i değil; dalga
      // sırasında her görselin atıf satırını indirmeden doğrulayabilmek için.
      console.log(`· ${name}  ${w}×${h}  [${info.license}]  → ${creditLine(info)}`);
    }

    rows.push(`| \`${name}\` | ${f.note ?? '—'} | ${info.license} | ${attrib(info).slice(0, 40) || '—'} | [Commons](${info.descUrl}) |`);
    snippets.push(
      `<ArticleImage\n` +
      `  src="/articles/${slug}/${name}"\n` +
      `  ratio="${w} / ${h}"\n` +
      `  alt="TODO — görseli gören biri için betimle"\n` +
      `  caption="TODO — anlatıya bağla"\n` +
      `  credit="${creditLine(info)}"\n` +
      `/>`
    );
  }

  if (dry) { console.log(`\n${rows.length} uygun / ${failed} elendi`); return; }

  await writeFile(path.join(outDir, 'README.md'),
    `# /articles/${slug} görselleri\n\n` +
    `\`ArticleImage\` ile Netlify Image CDN üzerinden servis edilir (otomatik WebP + responsive).\n` +
    `Tümü \`scripts/source-images.mjs\` ile Wikimedia Commons'tan indirildi: lisans doğrulandı,\n` +
    `ticari kullanıma açık (NC/ND yok), en fazla ${MAX_W}px genişliğe indirildi.\n\n` +
    `Yeniden üretmek için: \`node scripts/source-images.mjs ${slug}\`\n\n` +
    `## Manifest\n\n` +
    `| Dosya | Yerleşim | Lisans | Kaynak/Yazar | Commons |\n|---|---|---|---|---|\n${rows.join('\n')}\n`
  );
  await writeFile(path.join('scripts', 'image-specs', `${slug}.snippets.txt`), snippets.join('\n\n'));
  console.log(`\n${rows.length} görsel · ${failed} elendi → ${outDir}/README.md + snippets`);
}

main().catch((e) => { console.error(e); process.exit(1); });
