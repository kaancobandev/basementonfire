import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { jsonLdScript } from '@/lib/seo';
import { VERI_SORUMLUSU } from '@/lib/legal';
import { ARTICLE_COUNT, CATEGORY_COUNT } from '@/lib/landing';
import { ARTICLES } from '@/lib/articles';

// ════════════════════════════════════════════════════════════════════════
// ENGLISH LANDING — /en
//
// BU TAM BİR ÇEVİRİ DEĞİL, BİLİNÇLİ OLARAK TEK SAYFA. Sitenin tamamı Türkçe;
// makaleleri çevirmeden "İngilizce site" iddia etmek ziyaretçiyi boş sayfaya
// düşürür ve arama motoruna yanlış sinyal verir. Bu sayfa tek bir işi yapıyor:
// İngilizce bir ziyaretçiye BURANIN NE OLDUĞUNU ve içeriğin Türkçe olduğunu
// dürüstçe anlatmak, sonra ilgiliyse iletişim kanalını vermek.
//
// hreflang: burada ve ana sayfada KARŞILIKLI tanımlı olmalı — tek taraflı
// bildirim Google tarafından yok sayılır. Ana sayfa tarafı app/page.tsx'te.
//
// Tam i18n'e geçilirse burası SİLİNMEZ, /en ana sayfası olur.
// ════════════════════════════════════════════════════════════════════════
export const dynamic = 'force-static';

const title = 'Basementonfire — interactive science, history and culture, in Turkish';
const description =
  `A Turkish-language publishing and community platform that turns science, history and culture into ` +
  `simulations you can run in your browser. ${ARTICLE_COUNT} long-form interactive articles across ${CATEGORY_COUNT} subjects. Free, no account needed.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: '/en',
    languages: { 'tr-TR': '/', 'en-US': '/en', 'x-default': '/' },
  },
  openGraph: { title, description, url: '/en', locale: 'en_US' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Basementonfire — English overview',
  url: 'https://basementonfire.com/en',
  inLanguage: 'en',
  description,
  about: {
    '@type': 'Organization',
    name: 'Basementonfire',
    url: 'https://basementonfire.com',
    email: VERI_SORUMLUSU.eposta,
  },
};

const wrap: CSSProperties = { maxWidth: 820, margin: '0 auto', padding: '26px 18px 72px', color: 'var(--color-text)', lineHeight: 1.7 };
const h2: CSSProperties = { fontSize: '1.25rem', fontWeight: 800, margin: '34px 0 8px', letterSpacing: '-0.01em' };
const p: CSSProperties = { margin: '0 0 12px', fontSize: '0.97rem' };
const ul: CSSProperties = { margin: '0 0 12px', paddingLeft: 20, fontSize: '0.97rem' };
const a: CSSProperties = { color: 'var(--color-primary)', fontWeight: 700 };

/** Öne çıkan üç makale — İngilizce bir ziyaretçiye "ne tür şeyler" sorusunun cevabı. */
const SHOWCASE: { slug: string; en: string }[] = [
  { slug: 'cift-yarik', en: 'The double-slit experiment — run the interference simulator yourself' },
  { slug: 'fatih', en: 'The 1453 siege of Constantinople — command the siege and see if you can breach the walls' },
  { slug: 'radyoaktivite', en: 'Radioactivity — half-life simulator, an audible Geiger counter, and "how radioactive are you?"' },
];

export default function EnglishPage() {
  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <div style={wrap}>
        <Link href="/" style={{ ...a, fontSize: '0.85rem', textDecoration: 'none' }} hrefLang="tr">
          ← Türkçe ana sayfa
        </Link>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '14px 0 6px', letterSpacing: '-0.02em' }}>
          Basementonfire
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', margin: '0 0 18px', lineHeight: 1.6 }}>
          Science, history and culture you can <em>run</em>, not just read.
        </p>

        {/* Dürüstlük kutusu — ilk ekranda, gizlenmeden. */}
        <div
          style={{
            border: '1px solid var(--color-primary)', background: 'var(--color-primary-soft)',
            borderRadius: 12, padding: '13px 15px', margin: '0 0 22px', fontSize: '0.93rem',
          }}
        >
          <strong>Please note:</strong> all articles are written in Turkish. This page is an English
          overview of what the platform is and how it works. Automatic browser translation works well
          on the text, and the interactive simulations are language-independent — you can run them
          without reading a word.
        </div>

        <h2 style={h2}>What it is</h2>
        <p style={p}>
          Turkish-language material on science and history is usually either a wall of text or a
          video. In both cases the reader is a spectator: nothing can be <em>tried</em>.
          Basementonfire exists to change that. Every article turns the mechanism it describes into
          something that runs in your browser — you start the simulation, you change the variable,
          you see the result. No install, no plugin, no powerful computer required.
        </p>

        <div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 10, margin: '0 0 18px',
          }}
        >
          {[
            { n: String(ARTICLE_COUNT), l: 'long-form interactive articles' },
            { n: String(CATEGORY_COUNT), l: 'subject areas' },
            { n: 'Free', l: 'no paywall, ever' },
            { n: 'No account', l: 'needed to read' },
          ].map((s) => (
            <div key={s.l} style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{s.n}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <h2 style={h2}>Three editorial rules</h2>
        <ul style={ul}>
          <li><strong>Numbers, not adjectives.</strong> We don&apos;t write &ldquo;magnificent&rdquo;. We write how many people, how many days, how many cannons.</li>
          <li><strong>Sources are cited.</strong> Every article ends with a bibliography. If a claim is contested, we say whose claim it is.</li>
          <li><strong>We say when we aren&apos;t sure.</strong> Where sources disagree, we put the versions side by side and leave the judgement to you.</li>
        </ul>

        <h2 style={h2}>Try one — no Turkish required</h2>
        <p style={p}>The simulations run the same in any language. Open one and press something.</p>
        <ul style={ul}>
          {SHOWCASE.map((s) => {
            const meta = ARTICLES.find((x) => x.slug === s.slug);
            return (
              <li key={s.slug} style={{ marginBottom: 6 }}>
                <Link href={`/articles/${s.slug}`} style={a} hrefLang="tr">
                  {meta?.emoji} {s.en}
                </Link>
              </li>
            );
          })}
        </ul>

        <h2 style={h2}>How it works</h2>
        <p style={p}>
          The interactive modules are built directly on WebGL rather than a packaged game engine,
          so each article downloads only the code it needs. The part we are most proud of is the
          adaptive performance layer: instead of guessing whether a scene will stutter on a weak
          phone, we <strong>measure the device&apos;s own frame time</strong> while the scene runs.
          If frames get slow the renderer drops resolution; if they stay slow the animation freezes
          on its last frame, leaving a still image rather than a stuttering one. The decision is made
          by that device&apos;s measurement, not by a hardcoded list of phone models.
        </p>
        <p style={p}>
          <Link href="/teknoloji" style={a} hrefLang="tr">Full technical write-up (Turkish) →</Link>
        </p>

        <h2 style={h2}>Privacy</h2>
        <p style={p}>
          Our visitor counter sets <strong>no cookies and stores no raw IP addresses</strong>. We
          place no advertising trackers. Analytics runs in a cookieless, restricted mode until you
          consent. You can export your data and delete your account from within the product. The
          platform is built to comply with Turkey&apos;s KVKK and the EU GDPR.
        </p>

        <h2 style={h2}>Contact</h2>
        <p style={p}>
          Press, partnerships, institutional licensing or just a question:{' '}
          <a href={`mailto:${VERI_SORUMLUSU.eposta}`} style={a}>{VERI_SORUMLUSU.eposta}</a>
          <br />
          Founded and built by {VERI_SORUMLUSU.unvan}.
        </p>
        <p style={p}>
          <Link href="/basin" style={a} hrefLang="tr">Press kit — logo, colours, boilerplate (Turkish) →</Link>
        </p>

        <p style={{ ...p, marginTop: 30, paddingTop: 12, borderTop: '1px solid var(--color-border)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          <Link href="/" style={a} hrefLang="tr">Türkçe ana sayfaya dön →</Link>
        </p>
      </div>
    </main>
  );
}
