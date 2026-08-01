'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { kategoriYolu, type ArticleCategory, type ArticleMeta } from '@/lib/articles';
import { questionFor } from '@/lib/questions';

/* ══════════════════════════════════════════════════════════════════════════
   Makale dizini — /discover'daki "Makaleler" bölümünün listesi.
   Ayrı bir bileşen olmasının sebebi: liste ileride başka bir yüzeyde de
   (ör. tam arşiv sayfası) gerekirse kopyalanmasın, tek yerden gelsin.

   TASARIM KISITI — YAPIŞKAN KULLANILMADI (bilerek):
   .main-content'te `overflow-x: hidden` var; CSS bunu `overflow-y: auto`ya
   çevirir ve orayı bir kaydırma kabı yapar. Kabın kendisi hiç kaymadığı için
   (içerikle birlikte büyüyor) İÇİNDEKİ her `position: sticky` ölüdür. Canlıda
   ölçüldü: .feed-header sticky yazılı ama kaydırınca içerikle birlikte 800px
   kayıyor — yani mevcut sitede de çalışmıyor. Bu yüzden çipleri ve bölüm
   başlıklarını yapışkan YAPMADIM; olmayan bir davranışa yaslanmasınlar.
   (Kök çözüm `overflow-x: clip` — ayrı ve bilinçli bir karar, bkz. yanıt.)
   ══════════════════════════════════════════════════════════════════════════ */

/* lib/questions.ts'te karşılığı olmayan 4 makale. O dosyaya EKLENMEDİ: onu
   lib/og.tsx de okuyor → eklemek bu 4 makalenin paylaşım kartını da değiştirir.
   Hepsi dosyanın kuralına uyularak makalenin içinden çıkarıldı, uydurma yok. */
const YEREL_KANCA: Record<string, string> = {
  // KANIT DunyaClient.tsx:54 «Sıvı demir çekirdeği manyetik kalkanı üretir»
  dunya: 'Gezegenin çekirdeği seni neden koruyor?',
  // KANIT KuantumClient.tsx:69 «Dışarıdan ölürsün, içeriden asla.»
  'kuantum-olumsuzlugu': 'Dışarıdan ölürsün — içeriden neden asla?',
  // KANIT fizik-101/widgets.tsx:92 «Uzayda ağırlığın 0, ama kütlen aynı.»
  'fizik-101': 'Uzayda ağırlığın sıfır — peki kütlen?',
  // KANIT AugustusClient.tsx:61 «Bu, tacı reddederek nasıl kral olunacağının hikâyesi.»
  augustus: 'Tacı reddederek nasıl kral olunur?',
};

export const kancaFor = (a: ArticleMeta) => questionFor(a.slug) ?? YEREL_KANCA[a.slug] ?? a.desc;

/* Kategori mürekkepleri TEMAYA DUYARLI (ölçüldü). Tek sabit ton iki temada
   birden AA'yı geçmiyordu (koyuda Fizik 3.40'ta kalıyordu) → iki ayrı set.
   En düşük kontrast: açık 5.18 / koyu 6.55. Değiştirir ya da EKLERSEN ÖLÇ —
   göz kararı yeterli değil, iki zemin de (beyaz ve #16202a) hesaplanmalı. */
// Sıra SAYIYA GÖRE DEĞİL alan grubuna göre: doğa bilimleri → uygulamalı →
// beşerî. Sayıya göre olsaydı her yeni makalede bölümler yer değiştirirdi.
const SIRA: ArticleCategory[] = ['Fizik', 'Astronomi', 'Kimya', 'Biyoloji', 'Tıp', 'Teknoloji', 'Tarih', 'Sanat', 'Ekonomi'];
const RENK: Record<ArticleCategory, string> = {
  Fizik: 'var(--ink-fizik)',
  Astronomi: 'var(--ink-astronomi)',
  Kimya: 'var(--ink-kimya)',
  Biyoloji: 'var(--ink-biyoloji)',
  Tıp: 'var(--ink-tip)',
  Teknoloji: 'var(--ink-teknoloji)',
  Tarih: 'var(--ink-tarih)',
  Sanat: 'var(--ink-sanat)',
  Ekonomi: 'var(--ink-ekonomi)',
};

const azalt = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ArticleIndex({
  articles,
  baslangicAdet,
  tekKategori = false,
}: {
  articles: ArticleMeta[];
  /** "Tümü" görünümünde ilk kaç satır açık gelsin. Verilmezse hepsi. */
  baslangicAdet?: number;
  /**
   * Kategori sayfasında (/discover/tarih) true. Çipleri gizler — tek kategorili
   * listede sekiz çipin "0" göstermesi anlamsız — ve bölüm başlığını linke
   * ÇEVİRMEZ: sayfa zaten o kategorinin sayfası, kendine link vermek gereksiz.
   */
  tekKategori?: boolean;
}) {
  const [kategori, setKategori] = useState<ArticleCategory | 'Tümü'>('Tümü');
  const [hepsiAcik, setHepsiAcik] = useState(false);
  const kokRef = useRef<HTMLDivElement>(null);

  const sayilar = useMemo(() => {
    const m = {} as Record<ArticleCategory, number>;
    for (const c of SIRA) m[c] = articles.filter((a) => a.category === c).length;
    return m;
  }, [articles]);

  const gruplar = useMemo(
    () =>
      SIRA.map((c) => ({ cat: c, list: articles.filter((a) => a.category === c) }))
        .filter((g) => g.list.length > 0)
        .filter((g) => kategori === 'Tümü' || g.cat === kategori),
    [articles, kategori],
  );

  // Kırpma yalnız "Tümü" görünümünde ve yalnız açılmamışken. Kırpılan satırlar
  // DOM'DAN SİLİNMEZ, sadece gizlenir → tüm makale linkleri HTML'de kalır (SEO
  // yüzeyi korunur; bu sayfada o linkler bilinçli olarak prerender ediliyor).
  const kirp = baslangicAdet != null && kategori === 'Tümü' && !hepsiAcik;
  const gizliSayi = kirp ? Math.max(0, articles.length - baslangicAdet!) : 0;

  /* Kademeli giriş. İKİ ÖNEMLİ NOKTA:
     1. Satırlar CSS'te GÖRÜNÜR başlar; gizleme yalnız JS çalışıyorsa eklenir →
        betik yüklenmezse içerik kaybolmaz.
     2. Sadece EKRAN ALTINDAKİ satırlar gizlenir. İlk ekrandakileri gizleyip
        açsaydık, useEffect boyamadan sonra koştuğu için görünür→gizli→görünür
        titremesi olurdu. Böylece ilk ekran anında hazır, animasyon kaydırdıkça
        devreye giriyor. */
  useEffect(() => {
    const kok = kokRef.current;
    if (!kok || azalt()) return;
    const satirlar = [...kok.querySelectorAll<HTMLElement>('[data-satir]')];
    if (!satirlar.length) return;

    const vh = window.innerHeight;
    const altta = satirlar.filter((s) => s.getBoundingClientRect().top > vh * 0.9);
    satirlar.forEach((s) => s.classList.remove('ai-gizli', 'ai-acik'));
    altta.forEach((s) => s.classList.add('ai-gizli'));
    if (!altta.length) return;

    let n = 0;
    const io = new IntersectionObserver(
      (girisler) => {
        for (const g of girisler) {
          if (!g.isIntersecting) continue;
          const el = g.target as HTMLElement;
          el.style.transitionDelay = `${(n++ % 8) * 40}ms`;
          el.classList.add('ai-acik');
          io.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    );
    altta.forEach((s) => io.observe(s));

    // EMNİYET AĞI: IntersectionObserver teslimi "render adımı"na bağlıdır ve
    // arka plan/donuk sekmede hiç gelmeyebilir (ölçüldü). setTimeout arka planda
    // da koşar → 1,4 sn sonra kalan her satırı koşulsuz aç.
    const emniyet = setTimeout(() => altta.forEach((s) => s.classList.add('ai-acik')), 1400);
    return () => { io.disconnect(); clearTimeout(emniyet); };
  }, [kategori, hepsiAcik, gruplar.length]);

  /* Kırpma dağılımı: bölümleri sırayla doldurup her birinde KAÇ satırın açık
     kalacağını önceden hesapla. Akan tek bir sayaç yetmiyordu — tamamı kırpılan
     bölümün BAŞLIĞI boş listeyle görünüyordu (12 satır açıkken "KİMYA" başlığı
     altında hiç satır yoktu). Bölüm de `hidden` alıyor ama DOM'DAN SİLİNMİYOR,
     böylece tüm makale linkleri HTML'de kalıyor.

     ÖNCE HER BÖLÜME BİR SATIR (2026-08-01). Kategori 6→9 olunca düz "sırayla
     doldur" bozuldu: ilk dört bölüm 12 satırlık bütçeyi bitiriyor ve en büyük
     kategori (Tarih, 9 makale) varsayılan görünümde HİÇ görünmüyordu. Artık
     önce her bölüm birer satır alıyor, ARTAN bütçe sırayla dağıtılıyor — katalog
     ilk bakışta kaç raftan oluştuğunu gösteriyor. Kırpma yalnız GÖRÜNÜRLÜK;
     satırların tamamı yine DOM'da, Googlebot hepsini görüyor. */
  const bolumler = (() => {
    if (!kirp) return gruplar.map((g) => ({ ...g, acik: g.list.length }));
    const acik = gruplar.map((g) => Math.min(1, g.list.length));
    let kalan = baslangicAdet! - acik.reduce((t, n) => t + n, 0);
    for (let i = 0; i < gruplar.length && kalan > 0; i++) {
      const ek = Math.min(gruplar[i].list.length - acik[i], kalan);
      acik[i] += ek;
      kalan -= ek;
    }
    return gruplar.map((g, i) => ({ ...g, acik: acik[i] }));
  })();

  return (
    <div ref={kokRef} className="ai-kok">
      {/* Kategori çipleri — kategori sayfasında gizli (bkz. tekKategori) */}
      {!tekKategori && (
        <div className="ai-cipler">
          <Cip aktif={kategori === 'Tümü'} sayi={articles.length} onClick={() => setKategori('Tümü')}>
            Tümü
          </Cip>
          {SIRA.map((c) => (
            <Cip key={c} aktif={kategori === c} sayi={sayilar[c]} renk={RENK[c]} onClick={() => setKategori(c)}>
              {c}
            </Cip>
          ))}
        </div>
      )}

      {bolumler.map((g) => {
        // Bölüm başlığı, o kategorinin sayfasına GİDEN LİNK olur. Çipler istemci
        // state'i olduğu için taranamıyordu; başlık linki kategori sayfalarına
        // taranabilir tek iç bağlantıyı veriyor (eşiğin altındaki kategoride
        // kategoriYolu null döner → düz başlık kalır).
        const yol = tekKategori ? null : kategoriYolu(g.cat);
        const baslikIci = (
          <>
            <span className="ai-nokta" style={{ background: RENK[g.cat] }} aria-hidden />
            {g.cat}
            <span className="ai-raf-sayi">{g.list.length} makale</span>
          </>
        );
        return (
        <section key={g.cat} className="ai-bolum" hidden={g.acik === 0}>
          {/* Kategori sayfasında bölüm başlığı YOK: sayfanın h1'i zaten
              "Tarih Makaleleri" diyor, hemen altına "TARİH · 9 makale"
              koymak aynı şeyi iki kez söylemek olurdu. */}
          {!tekKategori && (
            <h3 className="ai-raf" style={{ color: RENK[g.cat] }}>
              {yol ? <Link href={yol} className="ai-raf-link">{baslikIci}</Link> : baslikIci}
            </h3>
          )}

          <ul className="ai-liste">
            {g.list.map((a, i) => {
              const gizli = i >= g.acik;
              return (
                <li key={a.slug} hidden={gizli}>
                  <Link
                    href={`/articles/${a.slug}`}
                    data-satir
                    className="ai-satir"
                    style={{ ['--ink' as string]: RENK[a.category] }}
                  >
                    <span className="ai-ray" aria-hidden />
                    <span className="ai-govde">
                      {/* Kategori sayfasında "TARİH ·" öneki düşer — dokuz
                          satırın dokuzunda aynı kelimeyi tekrarlamanın anlamı yok. */}
                      <span className="ai-etiket">{tekKategori ? a.title : `${a.category} · ${a.title}`}</span>
                      <span className="ai-soru">{kancaFor(a)}</span>
                    </span>
                    <span className="ai-ok" aria-hidden>→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
        );
      })}

      {gizliSayi > 0 && (
        <button className="ai-tumu" onClick={() => setHepsiAcik(true)}>
          Tümünü gör · {articles.length} makale
        </button>
      )}

      <style>{`
        .ai-kok {
          /* Açık tema mürekkepleri — beyaz üstünde 5.18–7.80 (AA) */
          --ink-fizik:#5433c9; --ink-tarih:#b4471f; --ink-biyoloji:#1c7a51;
          --ink-teknoloji:#1d6699; --ink-kimya:#0d7a74;
          /* 2026-08-01 eklenenler — beyaz üstünde 5.70/6.32/6.92/5.84 (AA).
             --ink-sanat, kaldırılan --ink-kultur'un altın tonunu devraldı. */
          --ink-astronomi:#8e2f9c; --ink-tip:#b81d4e;
          --ink-sanat:#8a5e08; --ink-ekonomi:#5f6b12;
          --on-ink:#fff;
        }
        /* Koyu tema mürekkepleri — #16202a üstünde 6.55–7.88 (AA) */
        [data-theme="dark"] .ai-kok {
          --ink-fizik:#a595ff; --ink-tarih:#f0906a; --ink-biyoloji:#4cc98d;
          --ink-teknoloji:#63b0e0; --ink-kimya:#3fc4b8;
          /* eklenenler — #16202a üstünde 8.85/8.43/7.60/9.66 (AA) */
          --ink-astronomi:#e2a8ff; --ink-tip:#ff9db5;
          --ink-sanat:#e0a63c; --ink-ekonomi:#c3ce5c;
          --on-ink:#16202a;
        }

        .ai-cipler { display:flex; flex-wrap:wrap; gap:7px; margin:0 0 16px; }
        .ai-cip {
          border-radius:9999px; border:1px solid var(--color-border);
          background:transparent; color:var(--color-text-muted);
          padding:6px 13px; font-size:.8rem; font-weight:700;
          font-family:inherit; cursor:pointer; white-space:nowrap;
          transition:border-color .15s, background-color .15s, color .15s;
        }
        .ai-cip:hover { border-color:var(--color-text-muted); color:var(--color-text); }
        .ai-cip-sayi { margin-left:6px; opacity:.6; font-weight:600; }

        .ai-bolum { margin:0 0 22px; }
        .ai-raf {
          display:flex; align-items:baseline; gap:8px;
          margin:0 0 4px; font-size:.76rem; font-weight:800;
          letter-spacing:.1em; text-transform:uppercase;
        }
        .ai-nokta { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
        /* Başlık linki rengi/dizilimi başlıktan MİRAS ALIR — kategori mürekkebi
           h3'te tanımlı, link onu ezmemeli (yoksa dokuz renk de mavi olur). */
        .ai-raf-link {
          display:flex; align-items:baseline; gap:8px;
          color:inherit; text-decoration:none;
        }
        .ai-raf-link:hover { text-decoration:underline; text-underline-offset:3px; }
        .ai-raf-sayi {
          color:var(--color-text-muted); font-weight:600;
          letter-spacing:normal; text-transform:none; font-size:.74rem;
        }

        .ai-liste { list-style:none; margin:0; padding:0; }

        .ai-satir {
          position:relative; display:flex; align-items:flex-start; gap:14px;
          padding:13px 10px 13px 15px; border-radius:10px;
          text-decoration:none; color:inherit;
          transition:opacity .5s ease, transform .5s cubic-bezier(.22,.61,.36,1),
                     background-color .18s ease;
        }
        /* Gizleme SADECE JS'in eklediği sınıfla — betik çalışmazsa satır görünür kalır. */
        .ai-satir.ai-gizli { opacity:0; transform:translateY(12px); }
        .ai-satir.ai-gizli.ai-acik { opacity:1; transform:none; }

        .ai-govde { min-width:0; flex:1; }
        .ai-etiket {
          display:block; font-size:.68rem; font-weight:700; letter-spacing:.05em;
          text-transform:uppercase; color:var(--color-text-muted); margin-bottom:4px;
        }
        .ai-soru {
          display:block; font-size:1.02rem; font-weight:700; line-height:1.35;
          color:var(--color-text); transition:color .18s ease;
        }

        .ai-ray {
          position:absolute; left:0; top:9px; bottom:9px; width:3px;
          border-radius:99px; background:var(--ink); opacity:.9;
          transform:scaleY(0); transition:transform .26s cubic-bezier(.22,.61,.36,1);
        }
        .ai-ok {
          flex-shrink:0; margin-top:14px; color:var(--color-text-muted);
          transition:transform .26s ease, color .18s ease;
        }

        /* :hover'ın YANINDA :active — mobilde hover yok, dokununca da tepki versin
           (mevcut .dc-article-link'te renk yalnız hover'daydı → mobilde ölüydü). */
        .ai-satir:hover, .ai-satir:active { background:color-mix(in srgb, var(--ink) 8%, transparent); }
        .ai-satir:hover .ai-ray, .ai-satir:active .ai-ray, .ai-satir:focus-visible .ai-ray { transform:scaleY(1); }
        .ai-satir:hover .ai-soru, .ai-satir:active .ai-soru { color:var(--ink); }
        .ai-satir:hover .ai-ok, .ai-satir:active .ai-ok { transform:translateX(4px); color:var(--ink); }
        .ai-satir:focus-visible { outline:2px solid var(--ink); outline-offset:2px; }

        .ai-tumu {
          display:block; width:100%; margin:4px 0 16px;
          border:1px solid var(--color-border); border-radius:9999px;
          background:transparent; color:var(--color-text);
          padding:11px 18px; font-size:.85rem; font-weight:700;
          font-family:inherit; cursor:pointer;
          transition:border-color .15s, color .15s;
        }
        .ai-tumu:hover { border-color:var(--color-primary); color:var(--color-primary); }

        @media (max-width:480px) {
          .ai-satir { padding:12px 6px 12px 13px; gap:10px; }
          .ai-soru { font-size:.97rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ai-satir, .ai-ray, .ai-ok { transition:none !important; }
          .ai-satir { opacity:1 !important; transform:none !important; }
        }
      `}</style>
    </div>
  );
}

function Cip({
  children, aktif, sayi, renk, onClick,
}: {
  children: React.ReactNode; aktif: boolean; sayi: number; renk?: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktif}
      className="ai-cip"
      style={
        aktif
          ? {
              background: renk ?? 'var(--color-text)',
              borderColor: renk ?? 'var(--color-text)',
              // Dolu çipin yazısı: kategori çipinde --on-ink (temaya göre),
              // "Tümü" çipinde zemin --color-text olduğu için yüzey rengi.
              color: renk ? 'var(--on-ink)' : 'var(--color-surface)',
            }
          : undefined
      }
    >
      {children}
      <span className="ai-cip-sayi">{sayi}</span>
    </button>
  );
}
