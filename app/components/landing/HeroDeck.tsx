'use client';

// HERO — Soru Kapısı. Sayfanın tezi: landing bir vitrin değil, bir SORU.
// ↻ "Başka bir soru" = uyumsuzluk emicisi (Instagram'dan tardigrad reel'iyle
// gelip Fatih gören ziyaretçi tek dokunuşla kendi konusuna geçer) VE ürünün
// tezinin 1 saniyelik kanıtı: düğmeye basınca bir şey oluyor.
//
// SSR: useState(0) → build'de 0. kart basılır, hidrasyon eşleşir.
// Math.random() render'da ASLA yok — deste sırayla döner (sondan başa).

import { useState } from 'react';
import Link from 'next/link';
import { ARTICLE_MAP } from '@/lib/articles';
import { HERO_DECK } from '@/lib/landing';
import Logo from '../Logo';
import s from '../../landing.module.css';

export default function HeroDeck({ subline }: { subline: string }) {
  const [i, setI] = useState(0);
  const [fading, setFading] = useState(false);

  const card = HERO_DECK[i];
  const a = ARTICLE_MAP[card.slug];
  const meta = a ? `${a.category} · ${a.title}`.toLocaleUpperCase('tr-TR') : '';

  function next() {
    // Gradyan interpolasyonu tarayıcıda animasyonlanmaz → opacity ile geç:
    // söndür, kartı değiştir, yeni gradyanla yak.
    setFading(true);
    setTimeout(() => {
      setI((v) => (v + 1) % HERO_DECK.length);
      setFading(false);
    }, 180);
  }

  return (
    <header className={s.hero}>
      {/* LCP PRELOAD (2026-07-23 denetimi): hero <picture> HTML'in ~17. KB'ında
          keşfediliyordu ve head'de 4 font + logo preload'ları ondan ÖNCE bant
          genişliği alıyordu. React bu <link>'leri head'e taşır (hoist) → LCP
          isteği kuyruğun başına geçer. type=image/avif: AVIF bilmeyen nadir
          tarayıcı preload'u atlar, <picture> yine webp'ye düşer (zarar yok). */}
      <link rel="preload" as="image" type="image/avif" media="(min-width: 700px)" href="/landing/hero-desktop.avif" fetchPriority="high" />
      <link rel="preload" as="image" type="image/avif" media="(max-width: 699px)" href="/landing/hero-mobile.avif" fetchPriority="high" />
      {/* TAM GENİŞLİK ARKA PLAN GÖRSELİ — masaüstü yatay / mobil dikey (art
          direction: ayrı 700px kırılımı). AVIF→WebP; hero LCP olduğundan eager +
          yüksek öncelik yüklenir. Görsel dekoratif (alt=""), okunurluğu scrim sağlar. */}
      <picture className={s.heroBg}>
        <source media="(min-width: 700px)" type="image/avif" srcSet="/landing/hero-desktop.avif" />
        <source media="(min-width: 700px)" type="image/webp" srcSet="/landing/hero-desktop.webp" />
        <source media="(max-width: 699px)" type="image/avif" srcSet="/landing/hero-mobile.avif" />
        <source media="(max-width: 699px)" type="image/webp" srcSet="/landing/hero-mobile.webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/landing/hero-desktop.webp" alt="" aria-hidden="true" fetchPriority="high" decoding="async" />
      </picture>
      {/* Beyaz metin okunurluğu için koyu scrim (AA hedefi). */}
      <div className={s.heroScrim} aria-hidden />

      {/* ÜST ÇUBUK — marka solda, kimlik eylemleri sağda (tepeye sabit).
          Çıkışlı ziyaretçi: Giriş yap + Üye ol (auth-out). Girişli: "Akışına git →"
          (auth-in). globals.css .auth-in/.auth-out ilk boyamadan ÖNCE çerezle
          ayrışır → flash yok. `.auth-in { display: contents }` şeffaftır; stil
          daima İÇ elemanda. auth-out'un display kuralı yok → module .authGroup
          flex'i geçerli olur, girişte :root[data-auth=in] .auth-out onu ezip gizler. */}
      <div className={s.heroTop}>
        <span className={s.brand}>
          <Logo size={30} />
          <span className={s.brandWord}>Basementonfire</span>
        </span>
        <span className={s.heroTopActions}>
          <span className={`${s.authGroup} auth-out`}>
            <Link className={s.authGhost} href="/login">Giriş yap</Link>
            <Link className={s.authSolid} href="/register">Üye ol</Link>
          </span>
          <span className="auth-in">
            <Link className={s.authGhost} href="/feed">Akışına git →</Link>
          </span>
        </span>
      </div>

      <div className={s.heroInner}>
        {/* Semantik H1 ≠ en büyük metin. Soru H1 OLSAYDI Google ana sayfanın
            konusunu Fatih sanır ve ana sayfa /articles/fatih ile yarışırdı. */}
        <h1 className={s.h1}>Basementonfire — bilim, tarih ve kültür</h1>

        {/* Kart değişince değişen kısım: yumuşak geçiş için opacity ile söner/yanar
            (glow kaldırıldı, bu fade onun yerini tutar). reduced-motion global kural
            transition'ı zaten keser. */}
        <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.18s ease' }}>
          <div className={s.meta} style={{ color: card.accent }}>{meta}</div>
          <p className={s.q}>{card.q}</p>
        </div>

        <div className={s.ctas}>
          <Link className={s.ctaPrimary} href={`/articles/${card.slug}`}>Cevabı oku →</Link>
          <button type="button" className={s.ctaGhost} onClick={next}>↻ Başka bir soru</button>
        </div>

        <p className={s.heroSub}>{subline}</p>
      </div>
    </header>
  );
}
