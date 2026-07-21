import type { Metadata } from 'next';
import Link from 'next/link';
import { jsonLdScript } from '@/lib/seo';
import { ARTICLES, ARTICLE_MAP } from '@/lib/articles';
import { gradientFor } from '@/lib/article-gradients';
import {
  HERO_DECK, WALL, GATES, VERBS, RULES,
  ARTICLE_COUNT, CATEGORY_COUNT, categoryCounts, cardFor,
} from '@/lib/landing';
import HeroDeck from './components/landing/HeroDeck';
import RadioMeter from './components/landing/RadioMeter';
import RandomArticle from './components/landing/RandomArticle';
import s from './landing.module.css';

// ════════════════════════════════════════════════════════════════════════
// ANA SAYFA — çıkışlı ziyaretçinin landing'i ("Merak Kapısı" tasarımı).
//
// 2026-07-16: Burası ESKİDEN zengin sosyal akıştı; akış app/feed/page.tsx'e
// TAŞINDI (hiçbir özellik kaybı yok, /akis'e de dokunulmadı). Sebep: ana sayfa
// force-dynamic'ti → her ziyaretçi soğuk fonksiyona düşüyordu (2,4-3,7s) ve
// sitenin en yetkili sayfası 32 makalenin HİÇBİRİNE link vermiyordu.
//
// STATİK: getMe/cookies/db YOK → build'de ön-üretilir, Netlify edge'inden gelir,
// soğuk start yok. Girişli/çıkışlı ayrımı SUNUCU okuması olmadan, aynı statik
// HTML'de CSS ile yapılır (.auth-in/.auth-out, globals.css:349-351 — ilk
// boyamadan önce çerezden, flash yok). data-auth hiç yoksa çıkışlı varsayılır:
// soğuk ziyaretçi için doğru taraf.
// ════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-static';

const title = `Basementonfire — ${ARTICLE_COUNT} interaktif bilim, tarih ve kültür makalesi`;
const description = `Bilim, tarih ve kültürde ${ARTICLE_COUNT} interaktif Türkçe makale. Simülasyonu çalıştır, kararı sen ver, kaynağı gör. Ücretsiz, üyeliksiz.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/' },
  openGraph: { title, description, url: '/' },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Basementonfire',
  url: 'https://basementonfire.com',
  inLanguage: 'tr-TR',
  description: 'Bilim, tarih ve kültürü interaktif makaleler ve toplulukla keşfet.',
  // Sitelinks arama kutusu: Google sonuçlarında doğrudan site içi arama sunabilir.
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://basementonfire.com/discover?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// Ana sayfa artık 32 makaleye derinlik-1 link veriyor → ItemList ile bunu
// Google'a açıkça bildir.
const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Basementonfire makaleleri',
  numberOfItems: ARTICLES.length,
  itemListElement: ARTICLES.map((a, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `https://basementonfire.com/articles/${a.slug}`,
    name: a.title,
  })),
};

export default function HomePage() {
  const counts = categoryCounts();
  const heroSub = `${ARTICLE_COUNT} uzun makale, ${CATEGORY_COUNT} konu. Oynanabilir simülasyonlar ve kaynakça. Okumak için üye olmana gerek yok.`;

  return (
    <div className={s.lp}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(itemListJsonLd) }} />

      {/* ══════════ 1 · HERO — Soru Kapısı ══════════ */}
      <HeroDeck subline={heroSub} />

      {/* ══════════ 2 · ÜÇ KAPI — konuya göre değil, niyete göre ══════════ */}
      <section className={s.sec}>
        <div className={s.inner}>
          <div className={s.kicker}>Nereden başlamalı</div>
          <h2 className={s.h2}>Üç kapı.</h2>
          <p className={s.sub}>{ARTICLE_COUNT} makaleyi önüne yığmayalım. Ne istediğine göre seç.</p>
          <div className={s.gates}>
            {GATES.map((g) => {
              const a = ARTICLE_MAP[g.slug];
              if (!a) return null;
              return (
                <Link key={g.slug} className={s.gate} href={`/articles/${g.slug}`} style={{ background: gradientFor(g.slug) }}>
                  <span className={s.gateLabel}>{g.label}</span>
                  <span className={s.gateTitle}>{a.emoji} {a.title}</span>
                  <span className={s.gateBlurb}>{g.blurb}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ 3 · SORU DUVARI — 6 kategorinin tamamı ══════════ */}
      <section className={`${s.sec} ${s.secAlt}`}>
        <div className={s.inner}>
          <h2 className={s.h2}>Cevabı olan sorular</h2>
          <p className={s.sub}>Her kart bir makale. Kısa değiller.</p>
          <div className={s.wall}>
            {WALL.map((w) => {
              const c = cardFor(w.slug);
              if (!c) return null;
              return (
                <Link key={w.slug} className={s.wcard} href={`/articles/${w.slug}`}>
                  <span className={s.wtop}>
                    {/* Gradyan karo HER ZAMAN açık — hover'da değil: dokunmatikte
                        hover yok, mobilde kartlar gri açılırdı. */}
                    <span className={s.tile} style={{ background: gradientFor(w.slug) }} aria-hidden>{c.emoji}</span>
                    <span className={s.chev} aria-hidden>→</span>
                  </span>
                  {/* SEO: makale başlığı h3'te (link metni). Göz ise soruya gider. */}
                  <h3 className={s.wcat}>{c.category} · {c.title}</h3>
                  <p className={s.wq}>{w.q}</p>
                </Link>
              );
            })}
          </div>
          <div style={{ marginTop: 16 }}>
            <a className={s.ctaQuiet} href="#arsiv">↓ Tüm arşiv</a>
          </div>
        </div>
      </section>

      {/* ══════════ 4 · DÖRT FİİL — vaat değil, meydan okuma ══════════ */}
      <section className={s.sec}>
        <div className={s.inner}>
          <h2 className={s.h2}>Makalede ne var?</h2>
          <p className={s.sub}>Yazı var. Ama sadece yazı değil.</p>
          <div className={s.verbs}>
            {VERBS.map((v) => {
              const a = ARTICLE_MAP[v.slug];
              if (!a) return null;
              return (
                <div key={v.label} className={s.verb} style={{ background: gradientFor(v.slug) }}>
                  <div className={s.vLabel}>── {v.label} ──</div>
                  <div className={s.vTitle}>{v.title}</div>
                  {v.live === 'radio' ? <RadioMeter /> : <p className={s.vDesc}>{v.desc}</p>}
                  <Link className={s.vLink} href={`/articles/${v.slug}`}>→ {a.title}</Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ 5 · KURAL — sessiz manifesto ══════════ */}
      {/* "Apolitik" kelimesi BİLİNÇLİ yazılmaz: o kelime kendisi bir iddia ve
          tartışma davetiyesidir. Yerine apolitikliği ÜRETEN mekanizma yazılır.
          Üçü de sitede doğrulanabilir → kontrol edilebilir söz, reklam değil. */}
      <section className={s.kural}>
        <div className={s.narrow}>
          <div className={s.kicker}>Kural</div>
          {RULES.map((r) => (
            <div key={r.claim} className={s.rule}>
              <b className={s.ruleClaim}>{r.claim}</b>
              <span className={s.ruleProof}>{r.proof}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ 6 · TOPLULUK — boş odayı saklamak yerine adını koymak ══════════ */}
      {/* Sahte kalabalık (5 avatar) hem işe yaramaz hem 5. bölümdeki kuralı ilk
          paragrafta çürütür. SAYI YOK: "5 üye" kaçırır, "binlerce" yalan olur. */}
      <section className={`${s.sec} ${s.secAlt}`}>
        <div className={s.narrow}>
          <h2 className={s.h2}>Bir de topluluk var</h2>
          <p className={s.sub} style={{ color: 'var(--color-text)' }}>
            Makalelerin altında yorum, akışta gönderi, günün sorusu, okuma listesi.
          </p>
          <p className={s.sub}>
            Basementonfire yeni: şu an topluluk küçük. Sayfayı doldurmak için sahte kalabalık koymuyoruz. Erken gelen burayı şekillendirir.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <Link className={s.ctaQuiet} href="/akis">Akışa göz at →</Link>
            <div className="auth-out">
              <Link className={s.ctaQuiet} href="/register">Üye ol</Link>
            </div>
            {/* .auth-in display:contents → stil İÇ elemanda (globals.css:349) */}
            <div className="auth-in">
              <Link className={s.ctaQuiet} href="/okuma-listesi">Okuma listene git →</Link>
            </div>
          </div>
          <p className={s.sub} style={{ marginTop: 14, marginBottom: 0 }}>
            Okumak için üyelik gerekmez. Üye olursan: okuma listesi, yorum, karar noktalarında oy.
          </p>
        </div>
      </section>

      {/* ══════════ 7 · RASTGELE — çıkış rampası ══════════ */}
      <section className={s.sec} style={{ textAlign: 'center' }}>
        <div className={s.narrow}>
          <p className={s.sub}>Karar veremedin mi?</p>
          <RandomArticle fallbackSlug={HERO_DECK[0].slug} />
        </div>
      </section>

      {/* ══════════ 8 · ARŞİV — 32 makale, kategoriye gruplu, sıfır JS ══════════ */}
      {/* FİLTRE DEĞİL, GRUP (pazarlıksız): istemci filtresi koşullu render ile
          iç linkleri DOM'dan siler → crawler göremez. Gruplama + çapa: sıfır JS,
          tüm linkler her zaman DOM'da, no-JS'te çalışır. */}
      <section id="arsiv" className={`${s.sec} ${s.secAlt} ${s.anchor}`}>
        <div className={s.inner}>
          <h2 className={s.h2}>{ARTICLE_COUNT} makale, {CATEGORY_COUNT} konu</h2>
          <p className={s.sub}>Kategoriye göre.</p>

          <nav className={s.strip} aria-label="Kategoriler">
            {counts.map((c) => (
              <a key={c.cat} className={s.pill} href={`#raf-${c.cat.toLocaleLowerCase('tr-TR')}`}>
                {c.cat}<span>{c.n}</span>
              </a>
            ))}
          </nav>

          {counts.map((c) => (
            <div key={c.cat} id={`raf-${c.cat.toLocaleLowerCase('tr-TR')}`} className={s.anchor}>
              <div className={s.shelfHead}>
                <h3>{c.cat}</h3>
                <em>{c.n}</em>
                <hr />
              </div>
              <div className={s.rows}>
                {ARTICLES.filter((a) => a.category === c.cat).map((a) => (
                  // prefetch={false}: arşiv 32 makalenin TAMAMINI listeler; viewport
                  // prefetch'i arşive kaydıran her ziyaretçiye ~815KB RSC indirtiyor
                  // ve her deploy sonrası 32'ye kadar fonksiyon çağrısı patlatıyordu
                  // (warmer yalnız HTML varyantını ısıtır, RSC ayrı cache girdisi).
                  // Kürate gruplar (kapılar/duvar/fiiller, ~17 link) prefetch'li kalır.
                  <Link key={a.slug} prefetch={false} className={s.row} href={`/articles/${a.slug}`}>
                    <span className={s.rowTile} style={{ background: gradientFor(a.slug) }} aria-hidden>{a.emoji}</span>
                    <span className={s.rowBody}>
                      <span className={s.rowTitle}>{a.title}</span>
                      {/* Açıklama registry'den birebir — landing'de yeniden
                          yazılmaz, içerik büyüdükçe kendini günceller. */}
                      <p className={s.rowDesc}>{a.desc}</p>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {counts.some((c) => c.n === 1) && (
            <p className={s.sub} style={{ marginTop: 16, marginBottom: 0 }}>
              Bazı raflarda şimdilik tek makale var. Doluyor.
            </p>
          )}
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      {/* .sidebar-legal mobilde display:none → hedef kitlenin tamamı hukuki
          linkleri hiçbir yerden göremiyordu. Bu satır o boşluğu kapatıyor. */}
      <footer className={s.foot}>
        <div className={s.inner}>
          Basementonfire — bilim, tarih ve kültür.
          <div className={s.footRow}>
            <Link href="/discover">İçerikler</Link>
            <Link href="/akis">Akış</Link>
            <Link href="/rastgele">Rastgele makale</Link>
          </div>
          <div className={s.footRow}>
            <Link href="/gizlilik">Gizlilik</Link>
            <Link href="/aydinlatma">KVKK Aydınlatma</Link>
            <Link href="/acik-riza">Açık Rıza</Link>
            <Link href="/kosullar">Koşullar</Link>
          </div>
          <div style={{ marginTop: 12 }}>© 2026 Basementonfire · basementonfire.com</div>
        </div>
      </footer>
    </div>
  );
}
