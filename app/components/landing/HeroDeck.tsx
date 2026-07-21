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
import { gradientFor } from '@/lib/article-gradients';
import { HERO_DECK } from '@/lib/landing';
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
      <div className={s.glow} aria-hidden style={{ background: gradientFor(card.slug), opacity: fading ? 0 : 0.5 }} />
      <div className={s.heroInner}>
        {/* Girişli ziyaretçi: tek satır. CSS ile ayrılır (globals.css:349-351),
            ilk boyamadan önce çerezden → flash yok. Metin MİNİMUM: bu HTML
            statik, Googlebot ikisini de görür; uzun tutulursa snippet'e sızar.
            DİKKAT: `.auth-in { display: contents }` (globals.css:349) → sarmalayıcı
            ŞEFFAFTIR, ona stil verilmez. Stil daima İÇ elemanda. */}
        <div className="auth-in">
          <div className={s.authbar}>
            <Link href="/feed">Akışına git →</Link>
          </div>
        </div>

        {/* Semantik H1 ≠ en büyük metin. Soru H1 OLSAYDI Google ana sayfanın
            konusunu Fatih sanır ve ana sayfa /articles/fatih ile yarışırdı. */}
        <h1 className={s.h1}>Basementonfire — bilim, tarih ve kültür</h1>

        <div className={s.meta} style={{ color: card.accent }}>{meta}</div>
        <p className={s.q}>{card.q}</p>

        <div className={s.ctas}>
          <Link className={s.ctaPrimary} href={`/articles/${card.slug}`}>Cevabı oku →</Link>
          <button type="button" className={s.ctaGhost} onClick={next}>↻ Başka bir soru</button>
        </div>

        <p className={s.heroSub}>{subline}</p>
      </div>
    </header>
  );
}
