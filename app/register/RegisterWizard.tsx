'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AuthErrorNotice from '@/app/components/AuthErrorNotice';
import { MIN_AGE, ageFromBirthdate } from '@/lib/age';
import { GENDERS } from '@/lib/types';

/**
 * KAYIT SİHİRBAZI — 5 adım. Düzen ve görünüm KULLANICININ TASARIMI
 * (Claude Design canvas, 5 ekran). Tasarıma sadık kalınan noktalar:
 *
 *  · TAM EKRAN ZEMİN. Buzlu cam kart YOK, aurora/kuzey ışığı gradyanı YOK.
 *    Kullanıcı bunu iki kez istedi (22.08.2026); ilk uygulamada sitenin
 *    `.auth-card` + `AnimatedRays` kabuğunu korumuştum, o benim kararımdı ve
 *    yanlıştı. ⛔ Kartı/aurorayı geri getirme.
 *  · Ölçüler tasarımdan: ilerleme 4px + 999px yarıçap, başlık 26px/600,
 *    kart yarıçapı 16px, buton 52px yüksek + 12px yarıçap + DÜZ vurgu rengi,
 *    doğum tarihi ÜÇ DAİRE, geri oku 44x44 sol üstte.
 *  · Palet: tasarımın #5b2eef'i sitenin `--color-primary`'siyle BİREBİR aynı.
 *    Ham hex yazılmadı, tokenlara bağlandı — böylece koyu tema da çalışıyor.
 *    Stiller globals.css'te `.kw-*` altında (tasarım :hover ve
 *    prefers-reduced-motion'a dayanıyor, ikisi de inline yazılamaz).
 *
 * TASARIMDAN BİLEREK SAPILAN ÜÇ ŞEY:
 *  1. EŞLEŞME VAATLERİ SİLİNDİ. Tasarımın 3. adımı "Eşleşme şansın artıyor",
 *     2. adımın 4. kartı "eşleş, sohbete başla" diyordu. Eşleştirme
 *     `MATCHING_ENABLED` ile kapalı (lib/features.ts) — kayıtta vaat edip
 *     içeride bulduramazdık. ⛔ Eşleştirme açılmadan geri getirme.
 *  2. Üçüncü cinsiyet "Diğer"; tasarımın "Belirtmek istemiyorum" seçeneği
 *     sözlükte `''`e denk geliyor ve api/auth/register onu REDDEDİYOR.
 *  3. İLGİ SEÇİMİ SAKLANMIYOR (kullanıcı kararı). `users.interests` gizli
 *     /api/match/deck'i besliyor ve KONU bekliyor; bu ekran NİYET topluyor.
 *
 * Yazı tipi: tasarım Onest/Manrope istiyor, site next/font/local ile
 * Bricolage+DM Sans kullanıyor ve next/font/google bilinçli olarak terk
 * edildi — font sitenin kendi ailesinde bırakıldı.
 *
 * DOĞRULAMA: istemci kuralları SUNUCUNUNKİNİ AYNALAR (api/auth/register).
 * ⚠ Sunucu kuralı değişirse burayı da güncelle.
 */

const CINSIYET_ETIKET: Record<(typeof GENDERS)[number], string> = {
  kadin: 'Kadın',
  erkek: 'Erkek',
  diger: 'Diğer',
};

/** Ekrandaki sıra tasarımdan; değerler GENDERS'tan. GENDERS'a üye eklenirse
 *  etiket haritası DERLEME HATASI verir — sessizce eksik kalmaz. */
const CINSIYET_SIRA = ['kadin', 'erkek', 'diger'] as const;

const ILGILER = [
  { baslik: 'Yeni şeyler öğrenmek', alt: 'Bilim, tarih, kültür — Türkçe ve sıkmadan.', ikon: 'kitap' },
  { baslik: 'Oynayarak keşfetmek', alt: 'Doppler etkisini okuma, kendin oynayarak öğren.', ikon: 'kol' },
  { baslik: 'Kendi yazımı yayınlamak', alt: 'Yazını gönder, onaylansın, adınla yayına çıksın.', ikon: 'kalem' },
  { baslik: 'Aynı kafadan insanları bulmak', alt: 'Seninle aynı şeyleri merak edenleri keşfet, takip et.', ikon: 'kisiler' },
  { baslik: 'Ortamda bilgi satmak', alt: "Kısa Reels'lerle hızlı bilgi topla, sırası gelince sun.", ikon: 'film' },
  { baslik: 'Kendi alanımı oluşturmak', alt: 'Profilini kur, fotoğraflarını paylaş, kendi köşeni yap.', ikon: 'profil' },
] as const;

const EN_FAZLA_ILGI = 3;
const TOPLAM_ADIM = 5;

/** Adım başına kolon genişliği — tasarımda ekranlar farklı genişlikte. */
const GENISLIK: Record<number, number> = { 1: 440, 2: 560, 3: 480, 4: 480, 5: 480 };

/**
 * TASLAK SAKLAMA — sunucu hatasında 5 adımın silinmesini önler.
 *
 * Adım 5 gerçek form POST'u; sunucu hatada `303 → /register?error=` dönüyor,
 * yani TAM SAYFA yenilemesi ve `useState(1)` sıfırlanması. İstemci sunucuyu
 * birebir aynaladığı için dönebilen hatalar yalnızca istemcinin ÖNCEDEN
 * BİLEMEYECEKLERİ (`ad_alinmis`, `kayitli`, `cok_deneme`) — olağan yol.
 *
 * ⛔ ŞİFRE VE ONAY KUTUSU YAZILMAZ: şifre hiçbir yere; onay her gönderimde
 *    YENİDEN verilmesi gereken bir irade beyanı (KVKK).
 */
const TASLAK = 'bof_kayit_taslak';

export default function RegisterWizard() {
  const [adim, setAdim] = useState(1);
  const [cinsiyet, setCinsiyet] = useState<string>('');
  const [ilgiler, setIlgiler] = useState<number[]>([]);
  const [gun, setGun] = useState('');
  const [ay, setAy] = useState('');
  const [yil, setYil] = useState('');
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [eposta, setEposta] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreGorunur, setSifreGorunur] = useState(false);
  const [onay, setOnay] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  // ⚠ Yıl tavanı efektte, render'da DEĞİL: `new Date()` sunucu ve istemcide
  // farklı sonuç verip hidrasyon uyuşmazlığı üretir.
  const [maxYil, setMaxYil] = useState(0);
  useEffect(() => { setMaxYil(new Date().getFullYear()); }, []);

  const gecmisCalisiyor = useRef(false);

  // Taslağı geri yükle — YALNIZCA `?error=` ile dönüldüğünde. Okur okumaz sil.
  useEffect(() => {
    let ham: string | null = null;
    try {
      ham = sessionStorage.getItem(TASLAK);
      sessionStorage.removeItem(TASLAK);
    } catch { /* özel mod / depolama kapalı */ }
    if (!ham) return;
    if (!new URLSearchParams(window.location.search).has('error')) return;
    try {
      const t = JSON.parse(ham) as Record<string, unknown>;
      // Depolama kurcalanabilir; sunucu zaten doğruluyor ama gizli input'a
      // çöp koymayalım.
      if (typeof t.c === 'string' && (GENDERS as readonly string[]).includes(t.c)) setCinsiyet(t.c);
      if (Array.isArray(t.i)) {
        setIlgiler(
          t.i.filter((x): x is number => Number.isInteger(x) && x >= 0 && x < ILGILER.length)
            .slice(0, EN_FAZLA_ILGI),
        );
      }
      if (typeof t.g === 'string') setGun(t.g.replace(/\D/g, '').slice(0, 2));
      if (typeof t.a === 'string') setAy(t.a.replace(/\D/g, '').slice(0, 2));
      if (typeof t.y === 'string') setYil(t.y.replace(/\D/g, '').slice(0, 4));
      if (typeof t.k === 'string') setKullaniciAdi(t.k.slice(0, 30));
      if (typeof t.e === 'string') setEposta(t.e.slice(0, 254));
      // Hata mesajı 5. adımdaki bir alanı işaret ediyor — orada karşılamalıyız.
      setAdim(TOPLAM_ADIM);
      try {
        for (let n = 2; n <= TOPLAM_ADIM; n++) history.pushState({ bofAdim: n }, '');
        gecmisCalisiyor.current = true;
      } catch { /* geçmiş yazılamadı */ }
    } catch { /* bozuk taslak */ }
  }, []);

  // bfcache: gönderip GERİ tuşuna basınca sayfa mount OLMADAN döner ve buton
  // kalıcı "Oluşturuluyor…" halinde kilitli kalırdı.
  useEffect(() => {
    const geriGeldi = (e: PageTransitionEvent) => { if (e.persisted) setGonderiliyor(false); };
    window.addEventListener('pageshow', geriGeldi);
    return () => window.removeEventListener('pageshow', geriGeldi);
  }, []);

  /**
   * ADIM GEÇMİŞİ — tarayıcı geri hareketi "önceki adım" olmalı. Adım salt
   * React state olduğu için Android geri jesti kullanıcıyı SİTEDEN atıyordu.
   * URL'e parametre YAZILMIYOR: `/register` Ads iniş adresi ve statik prerender.
   */
  useEffect(() => {
    const gerileme = (e: PopStateEvent) => {
      const n = (e.state as { bofAdim?: number } | null)?.bofAdim;
      setAdim(typeof n === 'number' && n >= 1 && n <= TOPLAM_ADIM ? n : 1);
    };
    window.addEventListener('popstate', gerileme);
    return () => window.removeEventListener('popstate', gerileme);
  }, []);

  const ileriGit = (n: number) => {
    setAdim(n);
    try { history.pushState({ bofAdim: n }, ''); gecmisCalisiyor.current = true; } catch { /* yazılamadı */ }
  };
  // Geçmiş yazılabiliyorsa geri gitmeyi TARAYICIYA bırak — yoksa React state
  // ile history yığını ayrı düşer ve geri tuşu ileri atlar.
  const geriGit = (n: number) => {
    if (gecmisCalisiyor.current) history.back();
    else setAdim(n);
  };

  const gunRef = useRef<HTMLInputElement>(null);
  const ayRef = useRef<HTMLInputElement>(null);
  const yilRef = useRef<HTMLInputElement>(null);
  const cinsiyetRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const iki = (v: string) => v.padStart(2, '0');
  const dogumIso = gun && ay && yil.length === 4 ? `${yil}-${iki(ay)}-${iki(gun)}` : '';
  const yas = dogumIso ? ageFromBirthdate(dogumIso) : null;

  // Sunucu kuralının aynısı (api/auth/register). Küçük harfe çevirip bakıyoruz
  // çünkü sunucu da öyle yapıyor — "Kaan" da geçerli sayılmalı.
  const adGecerli = /^[a-z0-9_]{3,30}$/.test(kullaniciAdi.trim().toLowerCase());
  const epostaGecerli = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta.trim());
  const sifreGecerli = sifre.length >= 6;

  // Üç kutu da dolduğunda tarihi yargılayabiliriz. `ageFromBirthdate` takvimde
  // olmayan gün (31/02) ve gelecek tarih için `null` döner — o durumda yaş
  // uyarısı basılamaz, ayrı bir mesaj gerekir.
  const tarihDolu = !!gun && !!ay && yil.length === 4;
  const tarihGecerli =
    !!dogumIso && yas !== null && yas >= MIN_AGE && Number(yil) >= 1900 &&
    (maxYil === 0 || Number(yil) <= maxYil) &&
    Number(ay) >= 1 && Number(ay) <= 12 && Number(gun) >= 1 && Number(gun) <= 31;

  const ilgiSec = (i: number) =>
    setIlgiler((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length >= EN_FAZLA_ILGI ? p : [...p, i]));

  const sayiYaz = (v: string, uzunluk: number) => v.replace(/[^0-9]/g, '').slice(0, uzunluk);

  /** Boş kutuda Backspace → önceki daireye dön (otomatik ileri atlama tek yönlüydü). */
  const geriAtla = (bos: boolean, onceki: React.RefObject<HTMLInputElement | null>) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && bos && onceki.current) {
        e.preventDefault();
        onceki.current.focus();
      }
    };

  /** Cinsiyet bir radyo grubu: ok tuşlarıyla gezinilir, Tab tek durak sayar. */
  const cinsiyetKlavye = (i: number) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const ileri = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    const geri = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    if (!ileri && !geri) return;
    e.preventDefault();
    const n = CINSIYET_SIRA.length;
    const j = (i + (ileri ? 1 : -1) + n) % n;
    setCinsiyet(CINSIYET_SIRA[j]);
    cinsiyetRefs.current[j]?.focus();
  };

  const gonderKapali = gonderiliyor || !adGecerli || !epostaGecerli || !sifreGecerli || !onay;
  // Kapalı submit odak sırasından çıkar ve tarayıcının doğrulama balonlarını da
  // tetikleyemez. Alan BOŞ olan hâller burada, alan DOLU ama geçersiz olanlar
  // alanın kendi hata satırında — ikisi birden konuşursa cümle iki kez görünür.
  const eksikOlan =
    !kullaniciAdi ? 'Kullanıcı adını gir.'
    : !adGecerli ? ''
    : !eposta ? 'E-posta adresini gir.'
    : !epostaGecerli ? ''
    : !sifre ? 'Şifreni gir.'
    : !sifreGecerli ? ''
    : !onay ? 'Devam etmek için koşulları kabul etmelisin.'
    : '';

  const sifreGucu = !sifre ? 0 : sifre.length < 6 ? 1 : sifre.length >= 12 || (/\d/.test(sifre) && /[^a-z0-9]/i.test(sifre)) ? 3 : 2;
  const gucRengi = ['transparent', 'var(--color-danger)', 'var(--color-accent)', 'var(--color-success)'][sifreGucu];

  // Son adımın ödül anı — kullanıcı kararı (23.08.2026):
  //   · 5. adıma gelindiğinde çubuk DİĞER ADIMLARLA AYNI durur: 5 ayrı mavi
  //     çentik, 6px aralık. Kademeli dolma YOK.
  //   · Dört koşulun DÖRDÜ birden sağlandığı anda çentikler tek çubuğa
  //     birleşir ve amber + parlama aynı anda ateşlenir.
  // Bir koşul geri alınırsa hareket geri sarar; "her bilgi doğru" durumunun
  // görsel karşılığı olmalı, bir kez yanıp kalan bir rozet değil.
  const sonAdim = adim === TOPLAM_ADIM;
  const hepsiTamam = sonAdim && adGecerli && epostaGecerli && sifreGecerli && onay;

  return (
    <div className="kw-sutun" style={{ maxWidth: GENISLIK[adim] }}>
      <AuthErrorNotice />

      <div className="kw-ilerleme-kap">
        {/* Parlama barın ARKASINDA; yalnızca hepsi tamamken yanar.
            aria-hidden: tamamlanma zaten butonun altındaki canlı bölgede
            sözle duyuruluyor, ikinci kez ilan etmeyelim. */}
        <div className="kw-parlama" aria-hidden data-yanik={hepsiTamam ? '1' : undefined} />
        <div
          className="kw-ilerleme"
          // ⚠ BİRLEŞME KOŞULU `sonAdim` DEĞİL `hepsiTamam`. 5. adıma gelmek
          // tek başına çubuğu değiştirmez — diğer adımlarla aynı 5 çentik
          // durur. Birleşme, dört koşulun tamamlandığı anın ödülüdür.
          data-birlesik={hepsiTamam ? '1' : undefined}
          // ⚠ aria-valuenow ADIM sayısıdır. Amber şerit görsel bir tamamlanma
          // sinyali; ekran okuyucuya iki farklı "ilerleme" anlatmak karıştırır.
          role="progressbar" aria-valuenow={adim} aria-valuemin={1} aria-valuemax={TOPLAM_ADIM}
          aria-label={`Adım ${adim} / ${TOPLAM_ADIM}`}
        >
          {Array.from({ length: TOPLAM_ADIM }, (_, i) => (
            <span key={i} className={i < adim ? 'kw-seg kw-seg-dolu' : 'kw-seg'} />
          ))}
          {/* Son adımda hep basılır ama genişliği 0'dır; tamamlanınca soldan
              sağa süpürerek açılır (mount anında sıçramasın diye önceden var). */}
          {sonAdim && <span className="kw-amber" aria-hidden data-yanik={hepsiTamam ? '1' : undefined} />}
        </div>
      </div>

      {/* Geri oku tasarımda SOL ÜSTTE (alttaki "← Geri" bağlantısı değil). */}
      {adim > 1 && <GeriOku onClick={() => geriGit(adim - 1)} />}

      {adim === 1 && (
        <>
          <h1 className="kw-baslik" style={{ marginTop: 36 }}>Cinsiyetini seç</h1>
          <p className="kw-alt">Profilini oluşturmak için ilk adım.</p>

          <div
            role="radiogroup" aria-label="Cinsiyet" className="kw-izgara-2"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 28 }}
          >
            {CINSIYET_SIRA.map((deger, i) => (
              <button
                key={deger}
                type="button"
                role="radio"
                aria-checked={cinsiyet === deger}
                // Gezinen tabindex: grup Tab sırasında TEK durak olsun.
                tabIndex={cinsiyet ? (cinsiyet === deger ? 0 : -1) : i === 0 ? 0 : -1}
                ref={(el) => { cinsiyetRefs.current[i] = el; }}
                onClick={() => setCinsiyet(deger)}
                onKeyDown={cinsiyetKlavye(i)}
                className="kw-kart kw-kart-orta"
                // "Diğer" tasarımda tam genişlik.
                style={deger === 'diger' ? { gridColumn: '1 / -1', flexDirection: 'row', padding: '16px 20px' } : undefined}
              >
                <span className="kw-kart-ikon"><CinsiyetIkon tur={deger} /></span>
                <span className="kw-kart-baslik" style={{ fontSize: 15 }}>{CINSIYET_ETIKET[deger]}</span>
                <Rozet />
              </button>
            ))}
          </div>

          {/* ⚠ KVKK — TOPLAMA ANINDA BİLDİRİM. Eski formda cinsiyet alanının
              altında duruyordu, sihirbaza taşınırken düşmüştü. Cinsiyet
              /u/<kullanıcı> sunucu HTML'inde ANONİM ziyaretçiye basılıyor
              (ölçüldü). Gizlilik bağı 4 adım sonra geliyor, seçim anındaki
              tek bildirim bu. ⛔ Silme. */}
          <p className="kw-not">
            Profilinde herkese açık gösterilir; ayarlardan istediğin zaman değiştirebilir ya da kaldırabilirsin.
          </p>

          <button type="button" className="kw-buton" disabled={!cinsiyet} onClick={() => ileriGit(2)}>
            Devam et
          </button>
        </>
      )}

      {adim === 2 && (
        <>
          <h1 className="kw-baslik">Burada neler yapmak istersin?</h1>
          {/* ⚠ "İstediğin zaman değiştirirsin." DEĞİL: bu seçimler hiçbir yere
              yazılmıyor, değiştirilecek bir kayıt yok (dosya başındaki 3. not). */}
          <p className="kw-alt">En fazla {EN_FAZLA_ILGI} tane seç. Sana neler sunduğumuzu görelim.</p>

          <div
            role="group" aria-label="İlgi alanları"
            style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))', gap: 12 }}
          >
            {ILGILER.map((it, i) => {
              const secili = ilgiler.includes(i);
              const dolu = !secili && ilgiler.length >= EN_FAZLA_ILGI;
              return (
                <button
                  key={it.baslik}
                  type="button"
                  className="kw-kart"
                  aria-pressed={secili}
                  // ⚠ `disabled` DEĞİL `aria-disabled`: gerçekten kapatsaydık
                  // kartlar odak sırasından çıkardı ve ekran okuyucu kullanıcısı
                  // kalan seçenekleri duyamazdı. Tıklama `ilgiSec`te zaten no-op.
                  aria-disabled={dolu || undefined}
                  onClick={() => ilgiSec(i)}
                >
                  <span className="kw-kart-ikon"><IlgiIkon tur={it.ikon} /></span>
                  <span className="kw-kart-baslik" style={{ marginTop: 8 }}>{it.baslik}</span>
                  <span className="kw-kart-alt">{it.alt}</span>
                  <Rozet />
                </button>
              );
            })}
          </div>

          {ilgiler.length >= EN_FAZLA_ILGI && (
            <p className="kw-not" aria-live="polite">
              En fazla {EN_FAZLA_ILGI} tane seçebilirsin. Değiştirmek için birini geri al.
            </p>
          )}

          <button type="button" className="kw-buton" disabled={ilgiler.length === 0} onClick={() => ileriGit(3)}>
            Devam et
          </button>
        </>
      )}

      {adim === 3 && (
        <>
          {/* Tasarımın tek kartı BURADA: düz açık kart, buzlu cam DEĞİL. */}
          <div
            style={{
              marginTop: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 20, padding: 40, boxShadow: '0 8px 32px rgba(17,17,17,0.06)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary-soft)',
              color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlevIkon />
            </div>
            {/* ⚠ Aslı "Eşleşme şansın artıyor" idi; eşleştirme kapalı olduğu
                için işlevsel vaat vermeyen bir metne çevrildi. */}
            <h1 className="kw-baslik" style={{ marginTop: 24 }}>Tam da doğru yerdesin.</h1>
            <p className="kw-alt" style={{ marginTop: 10 }}>
              Seçtiklerinin hepsi Basementonfire&apos;da seni bekliyor. Birazdan içeridesin.
            </p>

            {ilgiler.length > 0 && (
              <div style={{ display: 'grid', gap: 8, marginTop: 24, width: '100%' }}>
                {ilgiler.map((i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                    borderRadius: 12, border: '1px solid var(--color-border)',
                    fontSize: 14, fontWeight: 600, color: 'var(--color-text)', textAlign: 'left',
                  }}>
                    <span aria-hidden style={{ display: 'flex', color: 'var(--color-primary)' }}><TikIkon /></span>
                    {ILGILER[i].baslik}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="kw-buton" onClick={() => ileriGit(4)}>Devam et</button>
        </>
      )}

      {adim === 4 && (
        <>
          <h1 className="kw-baslik kw-orta" style={{ marginTop: 16 }}>Ne zaman doğdun?</h1>
          {/* ⚠ BU METİN İKİ KEZ DEĞİŞTİ, ÜÇÜNCÜSÜNÜ YAPMADAN ÖNCE OKU.
              Önce "Sadece yaşını doğrulamak için kullanıyoruz." yazıyordu; ölçüldü
              ki hesaplanan YAŞ profilde anonim ziyaretçiye basılıyor, yani cümle
              yanlış beyandı → "yalnızca yaşın görünür" diye düzeltildi.
              23.08.2026'da yaş rozeti profilden KALDIRILDI (etik gerekçe, kullanıcı
              kararı) → artık ne tarih ne yaş gösteriliyor, cümle tekrar gerçeğe
              uyduruldu. ⚠ Profilde yaş yeniden gösterilmeye karar verilirse BURASI
              ve app/gizlilik/page.tsx BİRLİKTE güncellenmeli. */}
          <p className="kw-alt kw-orta">Yalnızca yaş sınırını doğrulamak için; profilinde gösterilmez.</p>

          <div className="kw-daireler">
            <Daire
              deger={gun} etiket="Gün" enFazla={2} inputRef={gunRef} otomatik="bday-day" yerTutucu="01"
              hatali={tarihDolu && !tarihGecerli}
              onDegis={(v) => { const t = sayiYaz(v, 2); setGun(t); if (t.length === 2) ayRef.current?.focus(); }}
            />
            <Daire
              deger={ay} etiket="Ay" enFazla={2} inputRef={ayRef} otomatik="bday-month" yerTutucu="01"
              hatali={tarihDolu && !tarihGecerli}
              onKeyDown={geriAtla(ay === '', gunRef)}
              onDegis={(v) => { const t = sayiYaz(v, 2); setAy(t); if (t.length === 2) yilRef.current?.focus(); }}
            />
            <Daire
              deger={yil} etiket="Yıl" enFazla={4} inputRef={yilRef} otomatik="bday-year" yerTutucu="2000" genis
              hatali={tarihDolu && !tarihGecerli}
              onKeyDown={geriAtla(yil === '', ayRef)}
              onDegis={(v) => setYil(sayiYaz(v, 4))}
            />
          </div>

          {tarihDolu && !tarihGecerli && (
            <p id="reg-dogum-hata" role="alert" className="kw-hata" style={{ marginTop: 16, textAlign: 'center' }}>
              {yas !== null && yas < MIN_AGE
                ? `Basementonfire ${MIN_AGE} yaş ve üzeri içindir.`
                : `Geçerli bir tarih gir — gün 1–31, ay 1–12, yıl 1900 ile ${maxYil || 'bu yıl'} arası.`}
            </p>
          )}

          <button type="button" className="kw-buton" disabled={!tarihGecerli} onClick={() => ileriGit(5)}>
            Devam et
          </button>
        </>
      )}

      {adim === 5 && (
        <>
          <h1 className="kw-baslik">Hesabını oluştur.</h1>
          <p className="kw-alt">Son adım — birkaç bilgi yeterli.</p>

          {/* ⚠ GERÇEK FORM POST — fetch DEĞİL. Sunucu `formData()` okuyor ve
              hatada `/register?error=` ile 303 dönüyor. JSON'a çevirmek hem
              hata gösterimini hem oturum çerezinin taşınmasını riske atardı
              (bu tuzağa iki kez düşüldü). Veri kaybı TASLAK ile çözüldü. */}
          <form
            action="/api/auth/register"
            method="post"
            style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}
            onSubmit={() => {
              setGonderiliyor(true);
              // Şifre ve onay BİLEREK dışarıda; gerekçe TASLAK tanımında.
              try {
                sessionStorage.setItem(TASLAK, JSON.stringify({
                  c: cinsiyet, i: ilgiler, g: gun, a: ay, y: yil, k: kullaniciAdi, e: eposta,
                }));
              } catch { /* depolama kapalı — taslaksız devam */ }
            }}
          >
            {/* Önceki adımların cevapları — sunucu bunları da doğruluyor. */}
            <input type="hidden" name="gender" value={cinsiyet} />
            <input type="hidden" name="birthdate" value={dogumIso} />

            <div>
              <label className="kw-etiket" htmlFor="reg-username">Kullanıcı adı</label>
              <div className="kw-kutu" data-hatali={kullaniciAdi && !adGecerli ? '1' : undefined}>
                <span className="kw-onek" aria-hidden>@</span>
                <input
                  id="reg-username" className="kw-girdi" type="text" name="username" required
                  placeholder="kullaniciadi" autoComplete="username" autoCapitalize="none" spellCheck={false}
                  value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)}
                  aria-invalid={!!kullaniciAdi && !adGecerli}
                  aria-describedby={kullaniciAdi && !adGecerli ? 'reg-username-hata' : undefined}
                />
                {adGecerli && <TikRozeti />}
              </div>
              {kullaniciAdi && !adGecerli && (
                <p id="reg-username-hata" role="alert" className="kw-hata">3–30 karakter; yalnızca harf, rakam ve alt çizgi.</p>
              )}
            </div>

            <div>
              <label className="kw-etiket" htmlFor="reg-email">E-posta</label>
              <div className="kw-kutu" data-hatali={eposta && !epostaGecerli ? '1' : undefined}>
                <input
                  id="reg-email" className="kw-girdi" type="email" name="email" required
                  placeholder="ornek@eposta.com" autoComplete="email" autoCapitalize="none" spellCheck={false}
                  value={eposta} onChange={(e) => setEposta(e.target.value)}
                  aria-invalid={!!eposta && !epostaGecerli}
                  aria-describedby={eposta && !epostaGecerli ? 'reg-email-hata' : undefined}
                />
                {epostaGecerli && <TikRozeti />}
              </div>
              {eposta && !epostaGecerli && (
                <p id="reg-email-hata" role="alert" className="kw-hata">Geçerli bir e-posta adresi gir (örn. ad@ornek.com).</p>
              )}
            </div>

            <div>
              <label className="kw-etiket" htmlFor="reg-password">Şifre</label>
              <div className="kw-kutu" data-hatali={sifre && !sifreGecerli ? '1' : undefined}>
                <input
                  id="reg-password" className="kw-girdi" type={sifreGorunur ? 'text' : 'password'}
                  name="password" required minLength={6} placeholder="En az 6 karakter"
                  autoComplete="new-password"
                  value={sifre} onChange={(e) => setSifre(e.target.value)}
                  aria-invalid={!!sifre && !sifreGecerli}
                  aria-describedby={sifre && !sifreGecerli ? 'reg-password-hata' : undefined}
                />
                <button
                  type="button" className="kw-goz"
                  aria-label={sifreGorunur ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  aria-pressed={sifreGorunur}
                  onClick={() => setSifreGorunur((v) => !v)}
                >
                  <GozIkon kapali={sifreGorunur} />
                </button>
              </div>
              {sifre && <div className="kw-guc" style={{ background: gucRengi }} />}
              {sifre && !sifreGecerli && (
                <p id="reg-password-hata" role="alert" className="kw-hata">Şifre en az 6 karakter olmalı.</p>
              )}
            </div>

            {/* ⚠ YAŞ BEYANI BURADA KALMALI: eski formda vardı ve MIN_AGE hukuki
                metinlere bağlı (lib/age.ts). Tasarımın metninde yoktu —
                düşseydi KVKK tarafında gerileme olurdu. */}
            <label className="kw-onay-satir">
              <input
                type="checkbox" name="terms" value="1" required className="kw-onay"
                checked={onay} onChange={(e) => setOnay(e.target.checked)}
              />
              <span>
                <Link href="/kosullar" target="_blank">Kullanım Koşulları</Link>&apos;nı ve{' '}
                <Link href="/gizlilik" target="_blank">Gizlilik Politikası</Link>&apos;nı okudum, kabul ediyorum.
                {' '}({MIN_AGE} yaşından büyük olduğumu beyan ederim.)
              </span>
            </label>

            <div>
              <button type="submit" className="kw-buton" disabled={gonderKapali} style={{ marginTop: 4 }}>
                {gonderiliyor ? 'Oluşturuluyor…' : 'Hesabımı oluştur'}
              </button>
              {eksikOlan && !gonderiliyor && <p className="kw-ipucu" aria-live="polite">{eksikOlan}</p>}
            </div>
          </form>
        </>
      )}

      {/* Tasarımda yok ama işlevsel olarak şart: dönen kullanıcı yoksa sıkışır. */}
      <p className="kw-alt-bag">
        Zaten hesabın var mı? <a href="/login">Giriş yap</a>
      </p>
    </div>
  );
}

/* ────────────────────────── parçalar ────────────────────────── */

function GeriOku({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="kw-geri" aria-label="Önceki adım" onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14.5 5 7.5 12l7 7" />
      </svg>
    </button>
  );
}

/** Seçili kartın sağ üstündeki onay rozeti (görünürlüğü CSS'te aria durumundan). */
function Rozet() {
  return (
    <span className="kw-rozet" aria-hidden>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path d="M4.5 12.5l5 5 10-11" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function TikIkon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4.5 12.5l5 5 10-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Alanın doğrulandığını gösteren yeşil tik (tasarımda adım 5'te var). */
function TikRozeti() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ flex: 'none', marginLeft: 10 }} aria-hidden>
      <circle cx="8" cy="8" r="8" fill="var(--color-success)" />
      <path d="M4.6 8.3 7 10.6l4.4-4.7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GozIkon({ kapali }: { kapali: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 10C4.7 5.7 7.3 4 10 4s5.3 1.7 8 6c-2.7 4.3-5.3 6-8 6s-5.3-1.7-8-6Z" />
      <circle cx="10" cy="10" r="2.6" />
      {kapali && <path d="M3.5 17 16.5 3" />}
    </svg>
  );
}

function AlevIkon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3c.6 3 2.2 4 3.6 5.6A6.9 6.9 0 0 1 17.5 13a5.5 5.5 0 0 1-11 0c0-1.6.7-2.9 1.6-3.9.3 1 .9 1.7 1.7 2 .2-2.9 1-5.6 2.2-8.1Z" />
    </svg>
  );
}

function CinsiyetIkon({ tur }: { tur: (typeof CINSIYET_SIRA)[number] }) {
  const ortak = { width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, 'aria-hidden': true };
  if (tur === 'kadin') {
    return (
      <svg {...ortak}>
        <circle cx="12" cy="8" r="5" /><path d="M12 13v8" /><path d="M8.8 17.5h6.4" />
      </svg>
    );
  }
  if (tur === 'erkek') {
    return (
      <svg {...ortak} strokeLinejoin="round">
        <circle cx="10" cy="14" r="5" /><path d="M13.7 10.3 20 4" /><path d="M15 4h5v5" />
      </svg>
    );
  }
  // "Diğer" tasarımda üç nokta — tam genişlik satırda küçük duruyor.
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5.5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="18.5" cy="12" r="1.7" />
    </svg>
  );
}

function IlgiIkon({ tur }: { tur: (typeof ILGILER)[number]['ikon'] }) {
  const o = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (tur) {
    case 'kitap':
      return <svg {...o}><path d="M12 6C10.5 4.7 8.4 4 6 4H4v14h2c2.4 0 4.5.7 6 2 1.5-1.3 3.6-2 6-2h2V4h-2c-2.4 0-4.5.7-6 2Z" /><path d="M12 6v14" /></svg>;
    case 'kol':
      return <svg {...o}><rect x="3" y="7.5" width="18" height="10" rx="5" /><path d="M8 10.5v4" /><path d="M6 12.5h4" /><circle cx="15.5" cy="14" r=".4" /><circle cx="18" cy="11.5" r=".4" /></svg>;
    case 'kalem':
      return <svg {...o}><path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" /><path d="M13.5 6.5l4 4" /></svg>;
    case 'kisiler':
      return <svg {...o}><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" /><path d="M16 5.7a3 3 0 0 1 0 5.6" /><path d="M17.5 14.8c1.9.7 3.1 2.1 3.5 4.2" /></svg>;
    case 'film':
      return <svg {...o}><rect x="4" y="3.5" width="16" height="17" rx="4" /><path d="M4.4 8.5h15.2" /><path d="M9.5 3.8l2.6 4.7" /><path d="M14.5 3.8l2.6 4.7" /><path d="M10.8 12.4l3.9 2.4-3.9 2.4v-4.8Z" /></svg>;
    default:
      return <svg {...o}><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="10" r="2.5" /><path d="M7.5 17.6c.8-2 2.5-3.1 4.5-3.1s3.7 1.1 4.5 3.1" /></svg>;
  }
}

function Daire({ deger, etiket, enFazla, onDegis, onKeyDown, inputRef, otomatik, yerTutucu, hatali, genis }: {
  deger: string; etiket: string; enFazla: number;
  onDegis: (v: string) => void; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  otomatik: string; yerTutucu: string; hatali?: boolean; genis?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <input
        ref={inputRef} value={deger} onChange={(e) => onDegis(e.target.value)} onKeyDown={onKeyDown}
        // inputMode="numeric": mobilde sayı klavyesi. type="number" DEĞİL — o,
        // artırma okları ve tekerlekle değer değiştirme getirir.
        // ⚠ font-size 16px altına DÜŞÜRME: iOS Safari odaklanınca zoomlar.
        inputMode="numeric" maxLength={enFazla} placeholder={yerTutucu}
        autoComplete={otomatik} aria-label={etiket}
        aria-invalid={hatali || undefined}
        aria-describedby={hatali ? 'reg-dogum-hata' : undefined}
        className={genis ? 'kw-daire kw-daire-yil' : 'kw-daire'}
      />
      <span className="kw-daire-etiket">{etiket}</span>
    </div>
  );
}
