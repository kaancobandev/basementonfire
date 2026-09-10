'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { useNavUser } from '@/app/components/NavUserContext';
import { azHareket } from '@/app/components/rewardMotion';
import type { LeagueRow } from '@/lib/lig';
/* FLIP ölçümü BOYAMADAN ÖNCE yapılmalı: useEffect boyamadan SONRA koşar ve
   satırlar bir kare yeni yerinde görünüp sonra geri sıçrar. useLayoutEffect
   doğru kanca ama sunucuda uyarı basar — bu bileşen zaten yalnız istemcide
   iş yapıyor (veri fetch ile geliyor), o yüzden ortama göre seçiliyor. */
const useYerlesimEtkisi = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Günün Sorusu cevaplandığında ligin tazelenmesini isteyen olay. */
export const LIG_TAZELE = 'bof:lig-tazele';
export function ligTazele() {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(LIG_TAZELE));
}

const MADALYA = ['🥇', '🥈', '🥉'];
const GOSTER = 6;

/**
 * Akışın sağ panelindeki haftalık lig — cevap verilince satırlar YENİDEN
 * SIRALANIR ve kayış animasyonla gösterilir (FLIP).
 *
 * ⚠ NEDEN AKIŞIN YANINDA: `/lig` ayrı bir rota ve oraya girildiğinde satırlar
 * zaten doğru sırada basılı olur — animasyonun anlatacağı bir şey olmaz.
 * Kayma ancak sıranın DEĞİŞTİĞİ anla aynı ekranda olunca bir şey söylüyor,
 * o an da Günün Sorusu'nu cevapladığın an.
 *
 * ⚠ Sağ panel 1100px altında gizli (site kuralı). Yani bu animasyon masaüstü
 * ekranına özel; mobilde lig `/lig` sayfasından okunuyor. Mock'ta da öyleydi.
 */
export default function LigWidget() {
  const [satirlar, setSatirlar] = useState<LeagueRow[] | null>(null);
  const [duyuru, setDuyuru] = useState('');
  const listeRef = useRef<HTMLDivElement>(null);
  const ben = useNavUser();
  const benRef = useRef<string | null>(null);
  benRef.current = ben?.username ?? null;

  /* ⚠ SIRA MUHAFIZI: cevap sonrası tazeleme ile ilk yükleme (ya da art arda
     iki cevap) yarışabilir. Numarası eskimiş yanıt ATILIR — yoksa uçuştaki
     eski liste yeninin ÜZERİNE yazar. Bu depoda akış sekmelerinde tam bu
     hata yaşandı ve akış tamamen boşalmıştı. */
  const istekSirasi = useRef(0);
  const oncekiSira = useRef<number | null>(null);

  const cek = useCallback(async () => {
    const no = ++istekSirasi.current;
    try {
      const r = await fetch('/api/lig', { cache: 'no-store' });
      const d = await r.json();
      if (no !== istekSirasi.current) return;   // daha yenisi yolda → bunu at
      setSatirlar(Array.isArray(d?.rows) ? d.rows.slice(0, GOSTER) : []);
    } catch {
      if (no === istekSirasi.current) setSatirlar([]);
    }
  }, []);

  useEffect(() => { cek(); }, [cek]);

  /* Cevaptan sonra: ödül koreografisi barı doldururken lig de kayar.
     Gecikme bilerek — çip uçarken sıra değişirse iki hareket üst üste biner. */
  useEffect(() => {
    const dinle = () => { setTimeout(cek, azHareket() ? 0 : 400); };
    window.addEventListener(LIG_TAZELE, dinle);
    return () => window.removeEventListener(LIG_TAZELE, dinle);
  }, [cek]);

  /* ── FLIP ──
     Satırlar React tarafından yeniden sıralanınca DOM düğümleri KORUNUR
     (key = username), yani eski ve yeni konumu ölçüp aradaki farkı tersten
     uygulayıp bırakmak yeterli. Ölçüm render'dan SONRA, boyamadan ÖNCE
     yapılmalı → useYerlesimEtkisi (istemcide useLayoutEffect). Konumlar her
     çalışmada yeniden ölçülüp bir sonraki karşılaştırma için saklanıyor. */
  const oncekiKonum = useRef<Map<string, number>>(new Map());
  useYerlesimEtkisi(() => {
    const liste = listeRef.current;
    if (!liste || !satirlar) return;

    const yeni = new Map<string, number>();
    const dugumler = [...liste.children] as HTMLElement[];
    for (const el of dugumler) {
      const ad = el.dataset.kullanici;
      if (ad) yeni.set(ad, el.getBoundingClientRect().top);
    }

    // Kendi sıranı duyur (sıra gerçekten değiştiyse).
    const benimAd = benRef.current;
    if (benimAd) {
      const sira = satirlar.findIndex((r) => r.username === benimAd) + 1;
      if (sira > 0 && oncekiSira.current !== null && sira !== oncekiSira.current) {
        setDuyuru(`Haftalık ligde ${oncekiSira.current}. sıradan ${sira}. sıraya geçtin.`);
      }
      if (sira > 0) oncekiSira.current = sira;
    }

    const eski = oncekiKonum.current;
    oncekiKonum.current = yeni;
    // İlk render'da karşılaştıracak konum yok; hareketi azaltanda hiç oynatma.
    if (!eski.size || azHareket()) return;

    for (const el of dugumler) {
      const ad = el.dataset.kullanici;
      if (!ad) continue;
      const once = eski.get(ad);
      if (once === undefined) continue;
      const fark = once - yeni.get(ad)!;
      if (!fark) continue;
      el.style.transition = 'none';
      el.style.transform = `translateY(${fark}px)`;
      void el.offsetHeight;                                   // INVERT
      el.style.transition = 'transform var(--bof-t-flip) var(--bof-ease-expo), box-shadow 600ms var(--bof-ease-expo)';
      el.style.transform = '';                                // PLAY
      if (ad === benimAd) el.classList.add('bof-lig-kayan');
      setTimeout(() => {
        el.classList.remove('bof-lig-kayan');
        el.style.transition = '';
      }, 900);
    }
  }, [satirlar]);

  // Boş lig ya da henüz yüklenmedi → widget hiç çizilmez (yer tutmaz).
  if (!satirlar || !satirlar.length) return null;

  return (
    <div className="widget-card">
      <h3>🏆 Haftalık Lig</h3>
      <div ref={listeRef} className="bof-lig">
        {satirlar.map((r) => {
          const benMi = !!ben && ben.username === r.username;
          return (
            <Link
              key={r.username}
              href={`/u/${r.username}`}
              data-kullanici={r.username}
              className={benMi ? 'bof-lig-satir ben' : 'bof-lig-satir'}
            >
              <span className="rk">{MADALYA[r.rank - 1] ?? r.rank}</span>
              <span className="ad">{r.display_name}</span>
              {/* ⚠ Kendi satırında zemin primary-soft ve success-ink orada
                  4,27:1'e düşüyor (ölçüldü) — o satırda metin rengine dönülüyor. */}
              <span className="pt tnum">{r.correct}</span>
            </Link>
          );
        })}
      </div>
      <Link href="/lig" prefetch={false} style={{ display: 'block', marginTop: 8, fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
        Tüm tabloyu gör →
      </Link>
      {/* Hareketi azaltanda satır kaymaz ama sıra değişimi yine duyurulur. */}
      <p aria-live="polite" className="bof-gizli">{duyuru}</p>
    </div>
  );
}
