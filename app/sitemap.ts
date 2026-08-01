import type { MetadataRoute } from 'next';
import { db } from '@/lib/supabase/server';
import { ARTICLES, kategoriSayfalari } from '@/lib/articles';
import { MAKALE_TARIH, SAYFA_TARIH, URETIM_TARIHI } from '@/lib/sitemap-dates';

const SITE_URL = 'https://basementonfire.com';

// Harita 1 saat önbelleklenir (ISR) — her arama motoru ziyaretinde DB'ye gitmez.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── lastModified GERÇEK TARİHTEN (2026-07-31) ───────────────────────────
  // Önceden her URL `now` alıyordu; harita saatte bir yenilendiği için tüm
  // sayfalar sürekli "az önce değişti" diyordu. Google, lastmod her zaman
  // güncelse alanı öğrenip YOK SAYAR — gerçek bir önceliklendirme sinyali
  // boşa gidiyordu. Tarihler artık git geçmişinden geliyor.
  // Yenilemek için: node scripts/sitemap-tarihleri.mjs
  const tarih = (v?: string) => new Date(v ?? URETIM_TARIHI);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: tarih(SAYFA_TARIH['/']), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/akis`, lastModified: tarih(SAYFA_TARIH['/akis']), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${SITE_URL}/discover`, lastModified: tarih(SAYFA_TARIH['/discover']), changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/reels`, lastModified: tarih(SAYFA_TARIH['/reels']), changeFrequency: 'daily', priority: 0.5 },
    { url: `${SITE_URL}/muzik`, lastModified: tarih(SAYFA_TARIH['/muzik']), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/lig`, lastModified: tarih(SAYFA_TARIH['/lig']), changeFrequency: 'daily', priority: 0.4 },
    // Kurumsal sayfalar — hepsi force-static, anonim istekte 200, kendi metadata'sı
    // index. E-E-A-T'nin (kim yazıyor, nasıl ulaşılır) doğrudan karşılığı.
    { url: `${SITE_URL}/hakkimizda`, lastModified: tarih(SAYFA_TARIH['/hakkimizda']), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/teknoloji`, lastModified: tarih(SAYFA_TARIH['/teknoloji']), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/yol-haritasi`, lastModified: tarih(SAYFA_TARIH['/yol-haritasi']), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/iletisim`, lastModified: tarih(SAYFA_TARIH['/iletisim']), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/basin`, lastModified: tarih(SAYFA_TARIH['/basin']), changeFrequency: 'yearly', priority: 0.4 },
    // İngilizce genel bakış (tam çeviri değil, tek sayfa — bkz. app/en/page.tsx).
    { url: `${SITE_URL}/en`, lastModified: tarih(SAYFA_TARIH['/en']), changeFrequency: 'monthly', priority: 0.4 },
    // Hukuki metinler — herkese açık, güven/E-E-A-T sinyali için indekslensin.
    { url: `${SITE_URL}/gizlilik`, lastModified: tarih(SAYFA_TARIH['/gizlilik']), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/kosullar`, lastModified: tarih(SAYFA_TARIH['/kosullar']), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/aydinlatma`, lastModified: tarih(SAYFA_TARIH['/aydinlatma']), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/acik-riza`, lastModified: tarih(SAYFA_TARIH['/acik-riza']), changeFrequency: 'yearly', priority: 0.3 },
    // ⚠ BİLEREK EKLENMEYENLER — buraya bir URL eklemeden önce iki soruyu sor:
    // "anonim istekte 200 dönüyor mu?" ve "sayfanın kendi metadata'sı index diyor mu?"
    // Search Console sitemap'teki her çelişkiyi HATA olarak raporlar ve haritanın
    // tümüne olan güveni düşürür (2026-07-24 denetiminde 6 URL bu yüzden hatalıydı).
    //  · /bilgi-karti  → middleware PROTECTED listesinde; anonim istek 307 ile
    //                    /login'e gider ("Page with redirect").
    //  · /paylasim     → sayfanın kendi metadata'sı robots:{index:false} (yönetim
    //                    aracı) → "Submitted URL marked noindex".
    //  · /rastgele     → rastgele makaleye YÖNLENDİRİR ("Page with redirect").
    //  · /eslesme      → giriş + 18 yaş gerektirir, herkese açık değil.
    //  · /login,/register ve korumalı yollar → robots.txt'te zaten Disallow.
  ];

  // ── KATEGORİ SAYFALARI (2026-08-01) ─────────────────────────────────────
  // Sağlık kuralı işletildi: hepsi force-static, anonim istekte 200, kendi
  // metadata'sı index. Liste kategoriSayfalari()'nden geliyor → 3 makale
  // eşiğinin altındaki kategori (bugün Kimya, Ekonomi, Sanat) haritaya
  // GİRMEZ; zaten sayfası da yok, dynamicParams=false ile 404 döner.
  // Eşiği geçen kategori kendiliğinden hem sayfa hem harita kaydı kazanır.
  const kategoriRoutes: MetadataRoute.Sitemap = kategoriSayfalari().map(k => ({
    url: `${SITE_URL}/discover/${k.slug}`,
    lastModified: tarih(SAYFA_TARIH['/discover']),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Makale listesi TEK kaynaktan (lib/articles.ts) — yeni makale eklenince
  // sitemap otomatik güncellenir (elle senkron riski yok).
  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map(a => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: tarih(MAKALE_TARIH[a.slug]),
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  // ── PROFİLLER (/u/*) ve GÖNDERİLER (/p/*) BİLEREK DIŞARIDA (2026-07-24) ──
  // Bozuk değiller (200 + index,follow) ve Google onları iç linklerden bulmaya
  // devam eder — yalnızca "şunu indeksle" diye GÖNDERMİYORUZ. Gerekçe: içerik
  // olarak zayıf sayfalar sitemap'in sinyalini seyreltiyor ve klasik
  // "Tarandı - şu anda dizine eklenmedi" adayları; harita 32 kürate makaleye
  // yoğunlaşsın diye çıkarıldılar.
  // GERİ EKLEMEK İSTERSEN: `users` (username, created_at → /u/, priority 0.5) ve
  // `quick_facts` (id, created_at → /p/, priority 0.6) sorgularını aşağıdaki
  // Promise.all'a geri koy; tam hâli git geçmişinde (4a8e904'ten önceki sürüm).
  // NOT: IndexNow tarafı DEĞİŞMEDİ — yeni gönderi hâlâ /p/ ve /u/ URL'lerini
  // ping'liyor (app/api/upload, app/api/quick-facts/[id]). Orası ayrı bir kanal;
  // tutarlılık istersen onu da ayrıca kararlaştır.
  // ── HASHTAG EŞİĞİ (2026-07-30) ──────────────────────────────────────────
  // Etiket sayfaları, /u ve /p ile AYNI zayıflık sınıfında ve daha kötüsü:
  // birbirlerinin neredeyse kopyası oluyorlar. Ölçüldü — on etiket sayfasının
  // her biri 1034 kelime döndürüyordu ve dördü de AYNI tek gönderiyi
  // (/p/14) listeliyordu; benzersiz içerik yalnızca başlıktaki kelime.
  // Sitemap'in %17'si bu sayfalardan oluşuyordu.
  //
  // Sayfalar çalışmaya devam ediyor (kullanıcı ve iç link için gerekli),
  // yalnızca "bunu indeksle" diye GÖNDERMİYORUZ. Etiket yeterince gönderi
  // toplayınca kendiliğinden haritaya giriyor.
  const HASHTAG_MIN_GONDERI = 3;

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [{ data: tags }, { data: userArticles }] = await Promise.all([
      db.from('hashtags').select('tag, post_hashtags(hashtag_id)').limit(2000),
      // Onaylı (yayındaki) kullanıcı makaleleri — /makale/[slug] herkese açık yayınlanmış içerik.
      db.from('user_articles')
        .select('slug, published_at, updated_at')
        .eq('status', 'approved')
        .order('published_at', { ascending: false })
        .limit(5000),
    ]);
    const tagRoutes: MetadataRoute.Sitemap = (tags ?? [])
      .filter((t: any) => t.tag && (t.post_hashtags?.length ?? 0) >= HASHTAG_MIN_GONDERI)
      .map((t: any) => ({
        // encodeURIComponent ŞART (Türkçe etiketler) — rota tarafı bunu
        // lib/caption.ts → tagFromParam() ile çözer, ikisi birlikte çalışır.
        url: `${SITE_URL}/hashtag/${encodeURIComponent(t.tag)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.4,
      }));
    const uaRoutes: MetadataRoute.Sitemap = (userArticles ?? [])
      .filter((a: any) => a.slug)
      .map((a: any) => ({
        url: `${SITE_URL}/makale/${encodeURIComponent(a.slug)}`,
        lastModified: a.updated_at ? new Date(a.updated_at) : (a.published_at ? new Date(a.published_at) : now),
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
    dynamicRoutes = [...tagRoutes, ...uaRoutes];
  } catch {
    // DB erişilemezse statik + makale haritası yine de döner
  }

  return [...staticRoutes, ...kategoriRoutes, ...articleRoutes, ...dynamicRoutes];
}
