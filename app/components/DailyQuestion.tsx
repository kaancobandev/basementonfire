'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import EnergyCard from '@/app/components/EnergyCard';
import { azHareket, merkez, ucanCip, bekle, maskotZipla } from '@/app/components/rewardMotion';
import { kutlamaAc } from '@/app/components/kutlamaOlay';
import { ligTazele } from '@/app/components/LigWidget';
import { ilerlemeGuncellendi } from '@/app/components/NavUserContext';

type Q = {
  id: number;
  question: string;
  options: string[];
  article_slug: string | null;
  article_title?: string | null;
  article_emoji?: string | null;
  correct_index?: number;
  explanation?: string | null;
};

// Sorunun geldigi makale. Kullanici bildirdi: baglam olmadan soru
// cevaplanamiyor ("Buradaki gozlem/olcum ne demektir?" — hangi konunun
// sozlugunde?). Yazi BASLIK SATIRINA KOYULMADI: 360px telefonda o satirda
// 🧠 + "Gunun Sorusu" + 🔥/⭐ rozetleri ~202px yiyor, ~112px kaliyor; en uzun
// baslik "Bagirsaklar — Ikinci Beyin" tek basina ~170px. Tasar, satir sarar,
// kartin yuksekligi degisir ve iskeletle uyusmayip CLS'i geri getirirdi.
// Burada tam kart genisligi (~314px) var.
//
// ⚠ LINK DEGIL, DUZ METIN: link olsaydi cevaplamadan makaleye gidip cevabi
// bulmak icin kisayol olurdu. Mevcut tasarim "Konuyu oku →" bagini bilerek
// cevap SONRASINA sakliyor; o desen korunuyor.
//
// ⚠ YUKSEKLIK SABIT (16 + 8 = 24px) ve iskelette birebir ayrilir. Degistirirsen
// asagidaki iskeleti de degistir, yoksa kart inince feed asagi kayar.
const KAYNAK_SATIR_YUKSEK = 16;
const KAYNAK_SATIR_BOSLUK = 8;

function KaynakSatiri({ q }: { q: Q }) {
  if (!q.article_title) return null;
  return (
    <p style={{
      margin: `0 0 ${KAYNAK_SATIR_BOSLUK}px`, display: 'flex', alignItems: 'center', gap: 5,
      fontSize: '0.75rem', lineHeight: `${KAYNAK_SATIR_YUKSEK}px`, fontWeight: 700,
      color: 'var(--color-text-muted)',
      // Beklenmedik uzunlukta bir baslik satiri sardirmasin: yukseklik sabit kalmali.
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    }}>
      {q.article_emoji && <span aria-hidden style={{ fontSize: '0.85rem', flexShrink: 0 }}>{q.article_emoji}</span>}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.article_title}</span>
    </p>
  );
}
type Progress = {
  xp: number; current_streak: number; longest_streak: number;
  total_correct: number; total_answered: number;
  level: number; intoLevel: number; perLevel: number;
};
type State =
  | { phase: 'loading' }
  | { phase: 'hidden' }
  | { phase: 'ready'; q: Q; loggedIn: boolean; progress: Progress | null }
  | { phase: 'answered'; q: Q; selectedIndex: number; correctIndex: number; explanation: string | null; articleSlug: string | null; progress: Progress | null };

/* Ödül anı üç perdeye yayılıyor: çip uçar → bar/küre/sayı dolar → şık oynar.
   Bunun için EKRANDAKİ ilerleme ile SUNUCUDAN GELEN ilerleme bir süre ayrı
   tutulur: kart önce ESKİ değerlerle çizilir (çipin uçacağı hedef o), çip
   varınca yeni değere geçilir. Aynı anda basılsaydı bar zaten dolu belirir,
   çip de boşluğa uçardı — nedensellik kaybolurdu. */

function ProgressChips({ p }: { p: Progress | null }) {
  if (!p) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexShrink: 0 }}>
      <span title="Seri" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', fontWeight: 800, color: p.current_streak > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>🔥 {p.current_streak}</span>
      <span title="Seviye" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-primary)' }}>⭐ Lv{p.level}</span>
    </div>
  );
}

export default function DailyQuestion() {
  const [st, setSt] = useState<State>({ phase: 'loading' });
  const [submitting, setSubmitting] = useState(false);
  const [duyuru, setDuyuru] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const enerjiRef = useRef<HTMLDivElement>(null);
  const sikRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [inView, setInView] = useState(false);

  // Tembel yukleme: widget gorunure yaklasana kadar /api/daily-question'a
  // GIDILMEZ. Boylece ilk sayfa yuku + feed, arkada auth+DB isi olan bu istekle
  // yarismaz. Iskelet yerini tuttugundan (asagida) kart inince kayma olmaz (CLS).
  // rootMargin ile viewport'a ~300px kala cekilir → kullanici ulastiginda kart
  // cogu zaman hazir (iskelet flas'i olmaz).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { setInView(true); io.disconnect(); } },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/daily-question');
        const d = await res.json();
        if (!alive) return;
        if (!d.available) { setSt({ phase: 'hidden' }); return; }
        if (d.answered) {
          setSt({
            phase: 'answered', q: d.question,
            selectedIndex: d.result?.selectedIndex ?? -1,
            correctIndex: d.question.correct_index ?? -1,
            explanation: d.question.explanation ?? null,
            articleSlug: d.question.article_slug ?? null,
            progress: d.progress ?? null,
          });
        } else {
          setSt({ phase: 'ready', q: d.question, loggedIn: !!d.loggedIn, progress: d.progress ?? null });
        }
      } catch {
        if (alive) setSt({ phase: 'hidden' });
      }
    })();
    return () => { alive = false; };
  }, [inView]);

  async function answer(idx: number) {
    if (st.phase !== 'ready' || submitting) return;
    if (!st.loggedIn) { window.location.href = '/login'; return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/daily-question', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIndex: idx }),
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const d = await res.json();
      if (!res.ok && !d.alreadyAnswered) { toast.error(d.error ?? 'Bir hata oluştu'); setSubmitting(false); return; }
      const correctIndex = d.correctIndex ?? -1;
      const yeniIlerleme: Progress | null = d.progress ?? st.progress;
      // Seviye atlama, cevaptan ÖNCEKİ seviyeyle karşılaştırılarak bulunur.
      // `st` bu render'ın kendi değeri (yukarıda phase 'ready' diye doğrulandı),
      // yani bayat bir closure değeri değil.
      const eskiSeviye = st.progress?.level ?? 1;
      // Kart ESKİ ilerlemeyle çiziliyor; yenisi çip varınca uygulanacak.
      setSt({
        phase: 'answered', q: st.q, selectedIndex: idx, correctIndex,
        explanation: d.explanation ?? null,
        articleSlug: d.article_slug ?? st.q.article_slug,
        progress: st.progress,
      });

      if (d.alreadyAnswered) {
        // Zaten cevaplanmış: ödül yok, koreografi de yok — yalnız durumu göster.
        setSt((o) => (o.phase === 'answered' ? { ...o, progress: yeniIlerleme } : o));
      } else {
        const kazanilan: number = d.xpGained ?? 0;
        /* Seri bonusu AYRI bir alan olarak dönmüyor; rota kuralının birebir
           tersi ile çıkarılıyor (route.ts:142-144): bonus = min(seri, 7) ve
           yalnız doğru cevapta verilir. Böylece API'ye yeni alan eklemeden
           iki çipi ayırabiliyoruz. */
        const seri = yeniIlerleme?.current_streak ?? 0;
        const bonus = d.isCorrect ? Math.min(seri, 7) : 0;
        const taban = Math.max(0, kazanilan - bonus);

        setDuyuru(d.isCorrect
          ? `Doğru! ${taban} XP${bonus ? ` ve ${bonus} seri bonusu` : ''} kazandın.`
          : `Yanlış. Deneme için ${kazanilan} XP senin.`);

        await odulKoreografisi({ sikIndex: idx, taban, bonus, yeniIlerleme });

        /* ⚠ BÜYÜK KUTLAMA YALNIZ BURADA: sıradan doğru cevapta ekran KESİLMEZ.
           Perde ancak SEVİYE ATLAMA ya da YENİ ROZET varsa iner. Bekleme,
           kutladığı şeyin animasyonunun üstünü örtmemek için. */
        const yeniSeviye = yeniIlerleme?.level ?? eskiSeviye;
        const rozetler = (d.newBadges ?? []) as { key: string; name: string; emoji: string }[];
        if (yeniSeviye > eskiSeviye || rozetler.length) {
          await bekle(azHareket() ? 0 : 900);
          if (yeniSeviye > eskiSeviye) {
            kutlamaAc({
              kicker: 'Seviye atladın', emoji: '⬆️',
              baslik: `Seviye ${yeniSeviye}`,
              aciklama: 'Enerjin doldu ve bir üst seviyeye geçtin.',
            });
          }
          // Aynı anda ikisi de olabilir; modal kuyruklu, üst üste yazmaz.
          for (const b of rozetler) {
            kutlamaAc({ kicker: 'Yeni rozet', emoji: b.emoji, baslik: b.name, aciklama: 'Rozet rafına eklendi.' });
          }
        }
      }
    } catch {
      toast.error('Bağlantı hatası');
    } finally {
      setSubmitting(false);
    }
  }

  /* Çip(ler) uçar, hedefe varınca ilerleme uygulanır. Toast KALDIRILDI: ödül
     artık kartın kendi üzerinde anlatılıyor, ekran okuyucuya da aşağıdaki
     `aria-live` satırından gidiyor. */
  async function odulKoreografisi(
    { sikIndex, taban, bonus, yeniIlerleme }:
    { sikIndex: number; taban: number; bonus: number; yeniIlerleme: Progress | null },
  ) {
    const uygula = () => {
      setSt((o) => (o.phase === 'answered' ? { ...o, progress: yeniIlerleme } : o));
      maskotZipla();   // bar dolarken maskot da sevinsin
      /* Kenar çubuğundaki enerji kartı da dolsun. Yeni ilerleme ZATEN elimizde
         (cevap yanıtından geldi) → ikinci bir istek atmaya gerek yok. */
      if (yeniIlerleme) ilerlemeGuncellendi(yeniIlerleme);
      /* Sağ paneldeki lig de tazelensin: doğru cevap haftalık sayıyı artırır,
         yani sıra DEĞİŞMİŞ olabilir. Widget kendi içinde 400 ms bekliyor —
         çip uçarken satır kayarsa iki hareket üst üste biner. */
      ligTazele();
    };

    // Hedef enerji kartı DOM'a YENİ giriyor — bir kare bekleyip ölç.
    await bekle(azHareket() ? 0 : 40);
    /* ⚠ İKİ NOKTA DA BURADA, AYNI ANDA ölçülüyor. Cevap beklenirken kullanıcı
       kaydırmış olabilir; çip `position: fixed` yani koordinatlar viewport'a
       göre. Şıkkı istek ÖNCESİNDE ölçseydik çip yanlış yerden kalkardı. */
    const bas = merkez(sikRefs.current[sikIndex]);
    /* HEDEF EKRANA GÖRE DEĞİŞİR: masaüstünde sol kenar çubuğundaki enerji
       kartı, telefonda sorunun altındaki.
       ⚠ Seçim `display:none` üzerinden KENDİLİĞİNDEN oluyor: gizli öğenin
       ölçüsü sıfır, `merkez()` de sıfır ölçülü öğeye null döndürüyor. Yani
       burada ayrıca bir medya sorgusu okumaya gerek yok — tek kaynak CSS. */
    const hedef = merkez(document.querySelector('[data-bof-enerji-kenar]')) ?? merkez(enerjiRef.current);
    if (!bas || !hedef || azHareket()) { uygula(); return; }
    const basNoktasi = bas;

    const ucuslar = [ucanCip(`+${taban} XP`, basNoktasi, hedef, 'xp')];
    if (bonus > 0) {
      await bekle(120);   // ikinci çip biraz sonra kalksın, üst üste binmesin
      ucuslar.push(ucanCip(`🔥 +${bonus} seri`, { x: basNoktasi.x + 78, y: basNoktasi.y }, hedef, 'seri'));
    }
    await Promise.all(ucuslar);
    uygula();
  }

  if (st.phase === 'hidden') return null;

  // CLS onlemi: yuklenirken kartla ayni olculerde iskelet render edilir (SSR
  // dahil) — kart fetch sonrasi YERINE oturur, feed kolonunu asagi ITMEZ.
  // (Onceden null donuyordu; kart belirince tum feed kayiyordu — home CLS 0.236
  // olcumunun kaynagi buydu.) 'hidden' nadir (soru yoksa/hata) — o durumda
  // iskeletin kapanmasi kabul edilen kucuk kayma.
  if (st.phase === 'loading') {
    return (
      <div ref={rootRef} style={{ maxWidth: 470, margin: '16px auto 0', padding: '0 8px' }} aria-hidden>
        <article style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 15px', background: 'linear-gradient(90deg, rgba(16,185,129,0.14), rgba(79,70,229,0.10))', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🧠</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)' }}>Günün Sorusu</span>
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            {/* Kaynak satirinin yeri — KaynakSatiri ile birebir ayni yukseklik.
                307 aktif sorunun 307'sinde de article_slug dolu (olculdu), yani
                bu satir pratikte HER ZAMAN cizilir; yeri kosulsuz ayrilir. */}
            <div style={{ height: KAYNAK_SATIR_YUKSEK, width: '45%', borderRadius: 5, background: 'var(--color-border)', opacity: 0.4, marginBottom: KAYNAK_SATIR_BOSLUK }} />
            <div style={{ height: 21, width: '75%', borderRadius: 6, background: 'var(--color-border)', opacity: 0.5, marginBottom: 14 }} />
            {/* İskelet gerçek şıkla BİREBİR: aynı gap (12) ve aynı 4px kenar.
                Ayrışırsa kart yerine oturunca akış kayar — home CLS 0,236
                ölçümünün kaynağı tam olarak buydu. */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ height: 48, borderRadius: 11, border: '1px solid var(--color-border)', boxShadow: '0 4px 0 var(--bof-edge-neutral)' }} />
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  const answered = st.phase === 'answered';
  const q = st.q;
  const progress = st.progress;

  return (
    <div style={{ maxWidth: 470, margin: '16px auto 0', padding: '0 8px' }}>
      <article style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
        {/* Baslik */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 15px', background: 'linear-gradient(90deg, rgba(16,185,129,0.14), rgba(79,70,229,0.10))', borderBottom: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🧠</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-text)' }}>Günün Sorusu</span>
          <ProgressChips p={progress} />
        </div>

        <div style={{ padding: '14px 16px 16px' }}>
          <KaynakSatiri q={q} />
          <p style={{ margin: '0 0 14px', fontSize: '0.96rem', fontWeight: 700, lineHeight: 1.45, color: 'var(--color-text)' }}>{q.question}</p>

          {/* gap 8 değil 12: her şıkkın 4px'lik basılabilir kenarı yerleşimde
              yer kaplamıyor, boşluğun içine biniyor. 12 = 4 kenar + 8 görünen.
              ⚠ Aşağıdaki İSKELET de aynı değeri kullanmalı. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {q.options.map((opt, i) => {
              const isCorrect = answered && i === st.correctIndex;
              const isWrongPick = answered && i === st.selectedIndex && i !== st.correctIndex;
              let border = '1px solid var(--color-border)';
              let bg = 'transparent';
              let color = 'var(--color-text)';
              if (isCorrect) { border = '1.5px solid var(--color-success)'; bg = 'rgba(16,185,129,0.12)'; }
              else if (isWrongPick) { border = '1.5px solid var(--color-danger)'; bg = 'rgba(239,68,68,0.10)'; }
              else if (answered) { color = 'var(--color-text-muted)'; }
              return (
                <button
                  key={i}
                  ref={(el) => { sikRefs.current[i] = el; }}
                  onClick={() => answer(i)}
                  disabled={answered || submitting}
                  className="bof-sik"
                  /* Geri bildirim CSS'te, `data-s` üzerinden: satır içi stille
                     çakışmasın diye animasyon attribute'a bağlı. */
                  data-s={isCorrect ? 'ok' : isWrongPick ? 'no' : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left',
                    padding: '11px 13px', borderRadius: 11, border, background: bg, color,
                    fontSize: '0.88rem', fontFamily: 'inherit', fontWeight: 500,
                    /* ⚠ `transition` BURADA YOK: .bof-sik kuralı sahibi. Satır içi
                       yazılsaydı basma geçişini ezerdi (inline > stylesheet). */
                    cursor: answered ? 'default' : 'pointer', width: '100%',
                  }}
                >
                  <span style={{
                    display: 'grid', placeItems: 'center', width: 24, height: 24, flexShrink: 0, borderRadius: 7,
                    fontSize: '0.74rem', fontWeight: 800,
                    background: isCorrect ? 'var(--color-success)' : isWrongPick ? 'var(--color-danger)' : 'var(--color-primary-soft)',
                    color: (isCorrect || isWrongPick) ? '#fff' : 'var(--color-primary)',
                  }}>{String.fromCharCode(65 + i)}</span>
                  {opt}
                  {isCorrect && (
                    <span className="bof-cikartma" style={{ marginLeft: 'auto', flexShrink: 0 }} aria-hidden>✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {st.phase === 'ready' && !st.loggedIn && (
            <p style={{ margin: '12px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Cevaplamak, XP ve seri biriktirmek için <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>giriş yap</Link>.
            </p>
          )}

          {answered && (
            <div style={{ marginTop: 13 }}>
              {st.explanation && (
                <p style={{ margin: '0 0 10px', fontSize: '0.84rem', lineHeight: 1.55, color: 'var(--color-text-muted)' }}>{st.explanation}</p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                {st.articleSlug && (
                  <Link href={`/articles/${st.articleSlug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
                    Konuyu oku →
                  </Link>
                )}
                <Link href="/lig" prefetch={false} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none' }}>
                  🏆 Ligde yerini gör →
                </Link>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>Yarın yeni bir soru 🔁</span>
              </div>

              {progress && (
                /* ⚠ Masaüstünde GİZLİ (.bof-enerji-kart, globals.css): orada XP
                   sol kenar çubuğundaki bara gidiyor ve ikinci bir bar
                   istenmiyor. Telefonda kenar çubuğu olmadığı için burada
                   kalıyor — uçan çipin hedefi de o zaman burası oluyor. */
                <div ref={enerjiRef} className="bof-enerji-kart">
                  <EnergyCard
                    level={progress.level}
                    into={progress.intoLevel}
                    perLevel={progress.perLevel}
                    streak={progress.current_streak}
                  />
                </div>
              )}
            </div>
          )}
          {/* Ödül artık toast ile DEĞİL kartın üzerinde anlatılıyor; ekran
              okuyucunun tek kanalı bu satır. Görsel olarak gizli. */}
          <p
            aria-live="polite"
            style={{ position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 }}
          >
            {duyuru}
          </p>
        </div>
      </article>
    </div>
  );
}
