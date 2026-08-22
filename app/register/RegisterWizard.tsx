'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import FloatingInput from '@/app/components/FloatingInput';
import { MIN_AGE, ageFromBirthdate } from '@/lib/age';
import { GENDERS } from '@/lib/types';

/**
 * KAYIT SİHİRBAZI — 5 adım. Tasarım kullanıcıdan geldi (Claude Design canvas),
 * buraya taşınırken üç şey KASITLI olarak değiştirildi:
 *
 *  1. NOCTURNE CSS'İ ALINMADI. Tasarım sistemi `#161826` mavi-gri zemin, Inter
 *     ve dış çizgili buton kullanıyor ve YALNIZ koyu tema. Site ise 2026-08-20'de
 *     kullanıcı isteğiyle nötr beyaz/siyaha çevrildi, Bricolage+DM Sans kullanıyor
 *     ve açık/koyu geçişi var. Düzen ve akış alındı, renk/tipografi mevcut
 *     tokenlara bağlandı. ⛔ Buraya ham hex yazma.
 *
 *  2. EŞLEŞME VAATLERİ SİLİNDİ. Tasarımın 3. adımı "Eşleşme şansın artıyor",
 *     2. adımın 4. kartı "eşleş, sohbete başla" diyordu. Eşleştirme
 *     `MATCHING_ENABLED` ile BTM bitene kadar KAPALI (lib/features.ts) — kayıtta
 *     vaat edip içeride bulduramazdık. Metinler bugün gerçekten var olan şeye
 *     göre yeniden yazıldı. ⛔ Eşleştirme açılmadan o metinleri geri getirme.
 *
 *  3. İLGİ SEÇİMİ SAKLANMIYOR (kullanıcı kararı, 22.08.2026). `users.interests`
 *     bugün yalnız /api/match/deck (gizli) ve profil etiketleri tarafından
 *     kullanılıyor ve KONU bekliyor; bu ekran ise NİYET topluyor. Niyeti oraya
 *     yazmak eşleştirmeyi bozardı. Ekran akışın ritmi için duruyor, veri
 *     yazılmıyor. Saklamaya karar verilirse önce ne toplandığı netleşmeli.
 *
 * DOĞRULAMA: istemci kuralları SUNUCUNUNKİNİ AYNALAR (api/auth/register).
 * Kullanıcı adı `^[a-z0-9_]{3,30}$` — tasarımın `[a-zA-Z0-9._-]{3,}` deseni
 * NOKTA ve TİRE kabul ediyordu; onu uygulasaydık kullanıcı yeşil onay görüp
 * sunucudan `ad_format` hatası yerdi. ⚠ Sunucu kuralı değişirse burayı da güncelle.
 */

const CINSIYET_ETIKET: Record<(typeof GENDERS)[number], string> = {
  kadin: 'Kadın',
  erkek: 'Erkek',
  // ⚠ "Diğer" — kullanıcı kararı (22.08.2026). Tasarımda "Belirtmek istemiyorum"
  // yazıyordu ama o, sözlükte `''` değerine denk geliyor ve KAYITTA REDDEDİLİYOR
  // (api/auth/register: `gender === ''` → gecersiz_cinsiyet). `diger` doğru değer.
  diger: 'Diğer',
};

/** Ekrandaki sıra tasarımdan; değerler GENDERS'tan. GENDERS'a üye eklenirse
 *  yukarıdaki etiket haritası DERLEME HATASI verir — sessizce eksik kalmaz. */
const CINSIYET_SIRA = ['kadin', 'erkek', 'diger'] as const;

/** 2. adım kartları. Saklanmıyor (yukarıdaki 3. nota bak) — yalnız akışın ritmi
 *  ve 3. adımın metni için. 4. kart eşleştirme vaat ediyordu, bugün gerçekten
 *  olan şeye çevrildi: keşfet + takip et. */
const ILGILER = [
  { baslik: 'Yeni şeyler öğrenmek', alt: 'Bilim, tarih, kültür — Türkçe ve sıkmadan.' },
  { baslik: 'Oynayarak keşfetmek', alt: 'Doppler etkisini okuma, kendin oynayarak öğren.' },
  { baslik: 'Kendi yazımı yayınlamak', alt: 'Yazını gönder, onaylansın, adınla yayına çıksın.' },
  { baslik: 'Aynı kafadan insanları bulmak', alt: 'Seninle aynı şeyleri merak edenleri keşfet, takip et.' },
  { baslik: 'Ortamda bilgi satmak', alt: "Kısa Reels'lerle hızlı bilgi topla, sırası gelince sun." },
  { baslik: 'Kendi alanımı oluşturmak', alt: 'Profilini kur, fotoğraflarını paylaş, kendi köşeni yap.' },
];

const EN_FAZLA_ILGI = 3;
const TOPLAM_ADIM = 5;

/**
 * TASLAK SAKLAMA — sunucu hatasında 5 adımın silinmesini önler.
 *
 * SORUN: 5. adım gerçek form POST'u ve sunucu hatada `303 → /register?error=`
 * dönüyor. Bu TAM SAYFA yenilemesidir: bileşen yeniden mount olur, `useState(1)`
 * çalışır ve cinsiyet/ilgi/tarih/kullanıcı adı/e-posta hepsi silinir. Üstelik
 * istemci doğrulaması sunucuyu birebir aynaladığı için sunucudan dönebilen
 * hataların neredeyse hepsi istemcinin ÖNCEDEN BİLEMEYECEĞİ hatalar
 * (`ad_alinmis`, `kayitli`, `cok_deneme`) — yani bu yol istisna değil, OLAĞAN yol.
 * Kullanıcı tek kelimelik bir düzeltme için 5 ekranı baştan tıklıyordu.
 *
 * ⛔ ŞİFRE VE ONAY KUTUSU YAZILMAZ:
 *    · şifre hiçbir koşulda saklamaya gitmez,
 *    · onay her gönderimde YENİDEN verilmesi gereken bir irade beyanıdır (KVKK) —
 *      kutuyu işaretli geri getirmek beyanı kullanıcı adına tekrarlamak olurdu.
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
  const [onay, setOnay] = useState(false);
  const [gonderiliyor, setGonderiliyor] = useState(false);

  // ⚠ Yıl tavanı efektte hesaplanıyor, render'da DEĞİL: `new Date()` sunucu ve
  // istemcide farklı sonuç verip hidrasyon uyuşmazlığı üretebilir (eski
  // RegisterForm de maxDate'i tam bu sebeple efektte kuruyordu).
  const [maxYil, setMaxYil] = useState(0);
  useEffect(() => { setMaxYil(new Date().getFullYear()); }, []);

  // Taslağı geri yükle — YALNIZCA `?error=` ile dönüldüğünde. Okur okumaz
  // siliyoruz: başarılı kayıtta sekmede asılı kalmasın.
  useEffect(() => {
    let ham: string | null = null;
    try {
      ham = sessionStorage.getItem(TASLAK);
      sessionStorage.removeItem(TASLAK);
    } catch { /* özel mod / depolama kapalı — taslak yok sayılır */ }
    if (!ham) return;
    if (!new URLSearchParams(window.location.search).has('error')) return;
    try {
      const t = JSON.parse(ham) as Record<string, unknown>;
      // Depolama kurcalanabilir. Sunucu zaten her alanı yeniden doğruluyor ama
      // gizli input'a çöp koymayalım diye burada da süzüyoruz.
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
      // Hata mesajı (AuthErrorNotice, page.tsx'te kartın üstünde) 5. adımdaki bir
      // alanı işaret ediyor — kullanıcıyı 1. adımda değil orada karşılamalıyız.
      setAdim(TOPLAM_ADIM);
      // Geçmişi de kullanıcı adım adım yürümüş gibi kur; yoksa geri tuşu
      // 5. adımdan doğrudan siteyi terk ederdi.
      try {
        for (let n = 2; n <= TOPLAM_ADIM; n++) history.pushState({ bofAdim: n }, '');
        gecmisCalisiyor.current = true;
      } catch { /* geçmiş yazılamadı — geri tuşu setAdim'e düşer */ }
    } catch { /* bozuk taslak — yok say */ }
  }, []);

  // bfcache: kullanıcı gönderip GERİ tuşuna basarsa sayfa mount OLMADAN geri
  // gelir; `gonderiliyor` true kalır ve buton kalıcı olarak "Oluşturuluyor…"
  // halinde kilitlenirdi.
  useEffect(() => {
    const geriGeldi = (e: PageTransitionEvent) => { if (e.persisted) setGonderiliyor(false); };
    window.addEventListener('pageshow', geriGeldi);
    return () => window.removeEventListener('pageshow', geriGeldi);
  }, []);

  /**
   * ADIM GEÇMİŞİ — tarayıcı geri hareketi "önceki adım" olmalı.
   *
   * Adım salt React state olduğu için Android geri jesti / iOS kenar kaydırma /
   * masaüstü Geri tuşu kullanıcıyı SİTEDEN ATIYOR ve 5 adımın tamamı gidiyordu.
   * Mobilde bu, hata yoluna göre çok daha sık yaşanan bir kayıp.
   *
   * URL DEĞİŞTİRİLMİYOR (`pushState`e yol verilmiyor): `/register` Ads iniş
   * adresi ve statik prerender — adres satırına `?adim=3` yazmanın hiçbir
   * faydası yok, riski var.
   */
  const gecmisCalisiyor = useRef(false);
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
    try { history.pushState({ bofAdim: n }, ''); gecmisCalisiyor.current = true; } catch { /* geçmiş yazılamadı */ }
  };
  // Geçmiş yazılabiliyorsa geri gitmeyi TARAYICIYA bırak — yoksa iki yığın
  // (React state ile history) birbirinden ayrı düşer ve geri tuşu ileri atlar.
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

  // Sunucu kuralının aynısı (api/auth/register:41). Küçük harfe çevirip bakıyoruz
  // çünkü sunucu da öyle yapıyor — kullanıcı "Kaan" yazsa da geçerli sayılmalı.
  const adGecerli = /^[a-z0-9_]{3,30}$/.test(kullaniciAdi.trim().toLowerCase());
  const epostaGecerli = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta.trim());
  const sifreGecerli = sifre.length >= 6;

  // Üç kutu da dolduğunda tarihi YARGILAYABİLİRİZ. `tarihGecerli` false ise
  // kullanıcıya SEBEBİNİ söylemek şart: ageFromBirthdate takvimde olmayan gün
  // (31/02) ve gelecek tarih için `null` döner, o durumda yaş uyarısı basılamaz.
  const tarihDolu = !!gun && !!ay && yil.length === 4;
  const tarihGecerli =
    !!dogumIso && yas !== null && yas >= MIN_AGE && Number(yil) >= 1900 &&
    (maxYil === 0 || Number(yil) <= maxYil) &&
    Number(ay) >= 1 && Number(ay) <= 12 && Number(gun) >= 1 && Number(gun) <= 31;

  const ilgiSec = (i: number) =>
    setIlgiler((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length >= EN_FAZLA_ILGI ? p : [...p, i]));

  const sayiYaz = (v: string, uzunluk: number) => v.replace(/[^0-9]/g, '').slice(0, uzunluk);

  /** Boş kutuda Backspace → önceki kutuya dön. Otomatik ileri atlama tek yönlüydü;
   *  kullanıcı yılı silip aya dönemiyordu. */
  const geriAtla = (bos: boolean, onceki: React.RefObject<HTMLInputElement | null>) =>
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && bos && onceki.current) {
        e.preventDefault();
        onceki.current.focus();
      }
    };

  /** Cinsiyet bir radyo grubu: ok tuşlarıyla gezinilir, Tab grubu tek durak sayar. */
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
  // Devre dışı submit butonu odak sırasından çıkar ve tarayıcının kendi
  // doğrulama balonlarını da tetikleyemez — bu satır olmadan kullanıcı sebebini
  // hiç öğrenemiyordu.
  // ⚠ Alan BOŞ olan durumlar burada, alan DOLU ama geçersiz olanlar aşağıdaki
  // <Uyari>'da anlatılıyor. İkisi birden konuşursa aynı cümle ekranda iki kez
  // görünür — o yüzden geçersiz hâller burada bilerek boş geçiliyor.
  const eksikOlan =
    !kullaniciAdi ? 'Kullanıcı adını gir.'
    : !adGecerli ? ''
    : !eposta ? 'E-posta adresini gir.'
    : !epostaGecerli ? ''
    : !sifre ? 'Şifreni gir.'
    : !sifreGecerli ? ''
    : !onay ? 'Devam etmek için koşulları kabul etmelisin.'
    : '';

  return (
    <div>
      <IlerlemeCubugu adim={adim} />

      {adim === 1 && (
        <Ekran baslik="Cinsiyetini seç" alt="Profilini oluşturmak için ilk adım.">
          <div role="radiogroup" aria-label="Cinsiyet" style={{ display: 'grid', gap: 10 }}>
            {CINSIYET_SIRA.map((deger, i) => (
              <SecimKarti
                key={deger}
                radyo
                secili={cinsiyet === deger}
                onClick={() => setCinsiyet(deger)}
                onKeyDown={cinsiyetKlavye(i)}
                // Gezinen tabindex: grup Tab sırasında TEK durak olsun.
                tabIndex={cinsiyet ? (cinsiyet === deger ? 0 : -1) : i === 0 ? 0 : -1}
                dugmeRef={(el) => { cinsiyetRefs.current[i] = el; }}
                baslik={CINSIYET_ETIKET[deger]}
              />
            ))}
          </div>
          {/* ⚠ KVKK — TOPLAMA ANINDA BİLDİRİM. Eski formda cinsiyet select'inin
              hemen altında duruyordu (0fb78c2:60-62), sihirbaza taşınırken düştü.
              "Profilinde gösterilir" ifadesi ölçüldü ve gerçek: cinsiyet
              /u/<kullanıcı> sunucu HTML'inde ANONİM ziyaretçiye basılıyor
              (UserProfileClient.tsx). Gizlilik Politikası bağı 4 adım sonra
              geliyor, yani seçim anındaki tek bildirim bu. ⛔ Silme. */}
          <p style={{ margin: '10px 0 0', fontSize: '0.78rem', lineHeight: 1.45, color: 'var(--color-text-muted)' }}>
            Profilinde herkese açık gösterilir; ayarlardan istediğin zaman değiştirebilir ya da kaldırabilirsin.
          </p>
          <Devam disabled={!cinsiyet} onClick={() => ileriGit(2)}>Devam et</Devam>
        </Ekran>
      )}

      {adim === 2 && (
        // ⚠ ALT METİN "İstediğin zaman değiştirirsin." DEĞİL. Tasarımda öyleydi
        // ama bu seçimler HİÇBİR YERE yazılmıyor (dosya başındaki 3. nota bak) —
        // değiştirilecek bir kayıt yok, yani tutulamayacak bir söz olurdu.
        <Ekran baslik="Burada neler yapmak istersin?" alt={`En fazla ${EN_FAZLA_ILGI} tane seç. Sana neler sunduğumuzu görelim.`}>
          <div role="group" aria-label="İlgi alanları" style={{ display: 'grid', gap: 8 }}>
            {ILGILER.map((it, i) => {
              const secili = ilgiler.includes(i);
              const dolu = !secili && ilgiler.length >= EN_FAZLA_ILGI;
              return (
                <SecimKarti
                  key={it.baslik}
                  secili={secili}
                  // ⚠ `disabled` DEĞİL `aria-disabled`: gerçekten devre dışı bıraksaydık
                  // kartlar odak sırasından çıkardı ve ekran okuyucu kullanıcısı
                  // kalan seçenekleri hiç duyamazdı. Tıklama zaten `ilgiSec`te no-op.
                  soluk={dolu}
                  onClick={() => ilgiSec(i)}
                  baslik={it.baslik}
                  alt={it.alt}
                />
              );
            })}
          </div>
          {ilgiler.length >= EN_FAZLA_ILGI && (
            <p aria-live="polite" style={{ margin: '10px 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              En fazla {EN_FAZLA_ILGI} tane seçebilirsin. Değiştirmek için birini geri al.
            </p>
          )}
          <Devam disabled={ilgiler.length === 0} onClick={() => ileriGit(3)}>Devam et</Devam>
          <Geri onClick={() => geriGit(1)} />
        </Ekran>
      )}

      {adim === 3 && (
        // ⚠ METİN TASARIMDAKİNDEN FARKLI. Aslı "Eşleşme şansın artıyor" idi;
        // eşleştirme kapalı olduğu için işlevsel vaat vermeyen bir metne çevrildi.
        // Buradaki cümlelerin hepsi bugün DOĞRU: içerik gerçekten var ve seçim
        // sonradan değiştirilebilir.
        <Ekran baslik="Tam da doğru yerdesin." alt="Seçtiklerinin hepsi Basementonfire'da seni bekliyor. Birazdan içeridesin.">
          <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
            {ilgiler.map((i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.10)', fontSize: '0.92rem', fontWeight: 600,
              }}>
                <span aria-hidden style={{ color: 'var(--color-success)' }}>✓</span>
                {ILGILER[i].baslik}
              </div>
            ))}
          </div>
          <Devam onClick={() => ileriGit(4)}>Devam et</Devam>
          <Geri onClick={() => geriGit(2)} />
        </Ekran>
      )}

      {adim === 4 && (
        // ⚠ METİN "Sadece yaşını doğrulamak için kullanıyoruz." DEĞİLDİ ve olmamalı:
        // doğum tarihinden hesaplanan YAŞ, profilde anonim ziyaretçiye basılıyor
        // (u/[username] SSR HTML'inde "N yaş" olarak ölçüldü). "Sadece doğrulamak
        // için" demek yanlış beyan olurdu. Eski formun ifadesi daha doğruydu:
        // gösterilmeyen şey doğum TARİHİ, görünen şey yaş.
        <Ekran baslik="Ne zaman doğdun?" alt="Doğum tarihin profilinde gösterilmez; yalnızca yaşın görünür.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 10 }}>
            <TarihKutu
              deger={gun} etiket="Gün" enFazla={2} inputRef={gunRef} otomatik="bday-day"
              hatali={tarihDolu && !tarihGecerli} tanim="reg-dogum-hata"
              onDegis={(v) => {
                const t = sayiYaz(v, 2); setGun(t);
                if (t.length === 2) ayRef.current?.focus();
              }}
            />
            <TarihKutu
              deger={ay} etiket="Ay" enFazla={2} inputRef={ayRef} otomatik="bday-month"
              hatali={tarihDolu && !tarihGecerli} tanim="reg-dogum-hata"
              onKeyDown={geriAtla(ay === '', gunRef)}
              onDegis={(v) => {
                const t = sayiYaz(v, 2); setAy(t);
                if (t.length === 2) yilRef.current?.focus();
              }}
            />
            <TarihKutu
              deger={yil} etiket="Yıl" enFazla={4} inputRef={yilRef} otomatik="bday-year"
              hatali={tarihDolu && !tarihGecerli} tanim="reg-dogum-hata"
              onKeyDown={geriAtla(yil === '', ayRef)}
              onDegis={(v) => setYil(sayiYaz(v, 4))}
            />
          </div>

          {/* Yaş kapısı — sunucu yeniden hesaplıyor ama kullanıcı 5. adıma gidip
              orada reddedilmesin diye burada da söylüyoruz.
              ⚠ KOŞUL `yas < MIN_AGE` DEĞİL: takvimde olmayan gün (31/02) ve
              gelecek tarih `yas === null` üretir; eski koşulda o durumda HİÇBİR
              mesaj basılmıyordu ve "Devam et" sebepsiz kilitli kalıyordu. */}
          {tarihDolu && !tarihGecerli && (
            <p id="reg-dogum-hata" role="alert" style={{ marginTop: 12, fontSize: '0.84rem', color: 'var(--color-danger)' }}>
              {yas !== null && yas < MIN_AGE
                ? `Basementonfire ${MIN_AGE} yaş ve üzeri içindir.`
                : `Geçerli bir tarih gir — gün 1–31, ay 1–12, yıl 1900 ile ${maxYil || 'bu yıl'} arası.`}
            </p>
          )}

          <Devam disabled={!tarihGecerli} onClick={() => ileriGit(5)}>Devam et</Devam>
          <Geri onClick={() => geriGit(3)} />
        </Ekran>
      )}

      {adim === 5 && (
        <Ekran baslik="Hesabını oluştur." alt="Son adım — birkaç bilgi yeterli.">
          {/* ⚠ GERÇEK FORM POST — fetch DEĞİL. Sunucu `formData()` okuyor ve
              hatada `/register?error=` ile 303 dönüyor; AuthErrorNotice o
              parametreyi basıyor. Bu akışı JSON'a çevirmek hem hata gösterimini
              hem de oturum çerezinin taşınmasını riske atardı (bu tuzağa iki kez
              düşüldü). Veri kaybı yerine TASLAK ile çözüldü — yukarıya bak. */}
          <form
            action="/api/auth/register"
            method="post"
            // ⚠ ARALIK BURADAN GELİYOR. Eski kayıt formu ve LoginForm ikisi de
            // `gap:'22px'` kullanıyor; sihirbaza taşınırken düştüğü için alanlar
            // arasında yalnızca `.ls-field{margin-top:6px}` kalıyordu (ölçüldü:
            // computed row-gap "normal") ve yüzen etiket üstteki alana yaklaşıyordu.
            style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}
            onSubmit={() => {
              setGonderiliyor(true);
              // Şifre ve onay BİLEREK dışarıda; gerekçe TASLAK tanımında.
              try {
                sessionStorage.setItem(TASLAK, JSON.stringify({
                  c: cinsiyet, i: ilgiler, g: gun, a: ay, y: yil,
                  k: kullaniciAdi, e: eposta,
                }));
              } catch { /* depolama kapalı — taslaksız devam, akış bozulmaz */ }
            }}
          >
            {/* Önceki adımların cevapları — sunucu bunları da doğruluyor. */}
            <input type="hidden" name="gender" value={cinsiyet} />
            <input type="hidden" name="birthdate" value={dogumIso} />

            <div>
              <FloatingInput
                  id="reg-username" type="text" name="username" label="Kullanıcı adı" required
                  autoComplete="username" value={kullaniciAdi}
                  aria-invalid={!!kullaniciAdi && !adGecerli}
                  aria-describedby={kullaniciAdi && !adGecerli ? 'reg-username-hata' : undefined}
                  onChange={(e) => setKullaniciAdi(e.target.value)}
              />
              {kullaniciAdi && !adGecerli && (
                  <Uyari id="reg-username-hata">3–30 karakter; yalnızca harf, rakam ve alt çizgi.</Uyari>
              )}
            </div>

            <div>
              <FloatingInput
                  id="reg-email" type="email" name="email" label="E-posta" required
                  autoComplete="email" value={eposta}
                  aria-invalid={!!eposta && !epostaGecerli}
                  aria-describedby={eposta && !epostaGecerli ? 'reg-email-hata' : undefined}
                  onChange={(e) => setEposta(e.target.value)}
              />
              {eposta && !epostaGecerli && (
                  <Uyari id="reg-email-hata">Geçerli bir e-posta adresi gir (örn. ad@ornek.com).</Uyari>
              )}
            </div>

            <div>
              <FloatingInput
                  id="reg-password" type="password" name="password" label="Şifre (en az 6 karakter)" required
                  autoComplete="new-password" minLength={6} value={sifre}
                  aria-invalid={!!sifre && !sifreGecerli}
                  aria-describedby={sifre && !sifreGecerli ? 'reg-password-hata' : undefined}
                  onChange={(e) => setSifre(e.target.value)}
              />
              {sifre && !sifreGecerli && (
                  <Uyari id="reg-password-hata">Şifre en az 6 karakter olmalı.</Uyari>
              )}
            </div>

            {/* ⚠ YAŞ BEYANI BURADA KALMALI. Mevcut kayıt formunda vardı ve
                MIN_AGE hukuki metinlere bağlı (lib/age.ts). Tasarımın yasal
                metninde yoktu — düşseydi KVKK tarafında gerileme olurdu. */}
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: 9,
              fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--color-text)', cursor: 'pointer',
            }}>
              <input
                type="checkbox" name="terms" value="1" required
                checked={onay} onChange={(e) => setOnay(e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <span>
                <Link href="/kosullar" target="_blank" style={bagStil}>Kullanım Koşulları</Link>&apos;nı ve{' '}
                <Link href="/gizlilik" target="_blank" style={bagStil}>Gizlilik Politikası</Link>&apos;nı okudum, kabul ediyorum.
                {' '}({MIN_AGE} yaşından büyük olduğumu beyan ederim.)
              </span>
            </label>

            {/* ⚠ `opacity` SADECE `gonderiliyor`a bakıyordu: kapalı buton etkin
                butonla PİKSEL PİKSEL aynı görünüyordu (aynı gradyan, aynı gölge,
                aynı imleç) ve .auth-submit:hover onu parlatıyordu bile. Kullanıcı
                basıyor, hiçbir şey olmuyor, sebebini gösteren tek işaret yok. */}
            <div>
              <button
                type="submit" className="auth-submit" disabled={gonderKapali}
                style={{
                  width: '100%',
                  opacity: gonderiliyor ? 0.7 : gonderKapali ? 0.5 : 1,
                  cursor: gonderKapali ? 'default' : 'pointer',
                }}
              >
                {gonderiliyor ? 'Oluşturuluyor…' : 'Hesabımı oluştur'}
              </button>

              {eksikOlan && !gonderiliyor && (
                <p aria-live="polite" style={{
                  margin: '8px 0 0', fontSize: '0.8rem', textAlign: 'center',
                  color: 'var(--color-text-muted)',
                }}>
                  {eksikOlan}
                </p>
              )}
            </div>
          </form>
          <Geri onClick={() => geriGit(4)} />
        </Ekran>
      )}
    </div>
  );
}

/* ────────────────────────── parçalar ────────────────────────── */

const bagStil = { color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' } as const;

function IlerlemeCubugu({ adim }: { adim: number }) {
  return (
    // role="progressbar" olmadan aria-label düz bir <div>'de duruyordu ve hiçbir
    // ekran okuyucu "Adım 3 / 5"i duyurmuyordu.
    <div
      role="progressbar" aria-valuenow={adim} aria-valuemin={1} aria-valuemax={TOPLAM_ADIM}
      aria-label={`Adım ${adim} / ${TOPLAM_ADIM}`}
      style={{ display: 'flex', gap: 6, marginBottom: 22 }}
    >
      {Array.from({ length: TOPLAM_ADIM }, (_, i) => (
        <span key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < adim ? 'var(--color-primary)' : 'rgba(255,255,255,.16)',
          transition: 'background .25s',
        }} />
      ))}
    </div>
  );
}

function Ekran({ baslik, alt, children }: { baslik: string; alt: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.25, color: 'var(--color-text)' }}>{baslik}</h1>
      <p style={{ margin: '8px 0 18px', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>{alt}</p>
      {children}
    </div>
  );
}

function SecimKarti({ secili, soluk, radyo, onClick, onKeyDown, tabIndex, dugmeRef, baslik, alt }: {
  secili: boolean; soluk?: boolean; radyo?: boolean;
  onClick: () => void; onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  tabIndex?: number; dugmeRef?: (el: HTMLButtonElement | null) => void;
  baslik: string; alt?: string;
}) {
  return (
    <button
      type="button" onClick={onClick} onKeyDown={onKeyDown} tabIndex={tabIndex} ref={dugmeRef}
      // Tek seçimli grupta radyo, çok seçimlide basılı-düğme semantiği.
      role={radyo ? 'radio' : undefined}
      aria-checked={radyo ? secili : undefined}
      aria-pressed={radyo ? undefined : secili}
      aria-disabled={soluk || undefined}
      style={{
        // touch-action: mobilde çift dokunma gerekiyordu (19.08.2026 kullanıcı
        // bildirimi); .auth-submit'te de aynı düzeltme var.
        touchAction: 'manipulation',
        textAlign: 'left', width: '100%', padding: alt ? '13px 14px' : '15px 14px',
        borderRadius: 'var(--radius-md)', cursor: soluk ? 'default' : 'pointer',
        fontFamily: 'inherit', color: 'var(--color-text)',
        opacity: soluk ? 0.45 : 1,
        background: secili ? 'rgba(122,75,255,.18)' : 'rgba(255,255,255,.06)',
        border: `1px solid ${secili ? 'var(--color-primary)' : 'rgba(255,255,255,.12)'}`,
        transition: 'background .15s, border-color .15s',
      }}
    >
      <span style={{ display: 'block', fontSize: '0.98rem', fontWeight: 700 }}>{baslik}</span>
      {alt && <span style={{ display: 'block', marginTop: 3, fontSize: '0.82rem', lineHeight: 1.45, color: 'var(--color-text-muted)' }}>{alt}</span>}
    </button>
  );
}

function TarihKutu({ deger, etiket, enFazla, onDegis, onKeyDown, inputRef, otomatik, hatali, tanim }: {
  deger: string; etiket: string; enFazla: number;
  onDegis: (v: string) => void; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  otomatik?: string; hatali?: boolean; tanim?: string;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{etiket}</span>
      <input
        ref={inputRef} value={deger} onChange={(e) => onDegis(e.target.value)} onKeyDown={onKeyDown}
        // inputMode="numeric": mobilde sayı klavyesi açar. type="number" DEĞİL —
        // o, artırma okları ve tekerlek kaydırmayla değer değiştirme getiriyor.
        // autoComplete: eski form <input type="date"> kullandığı için tarayıcı
        // doğum tarihini dolduruyordu; üç kutuya bölününce o destek kaybolmuştu.
        inputMode="numeric" maxLength={enFazla} placeholder={'0'.repeat(enFazla)}
        autoComplete={otomatik}
        aria-invalid={hatali || undefined}
        aria-describedby={hatali ? tanim : undefined}
        style={{
          width: '100%', padding: '12px 10px', textAlign: 'center',
          // ⚠ 16px altına DÜŞÜRME: iOS Safari odaklanınca sayfayı zoomlar.
          fontSize: '1.05rem', fontWeight: 700, fontFamily: 'inherit',
          color: 'var(--color-text)', background: 'rgba(255,255,255,.06)',
          border: `1px solid ${hatali ? 'var(--color-danger)' : 'rgba(255,255,255,.14)'}`,
          borderRadius: 'var(--radius-md)',
        }}
      />
    </label>
  );
}

function Uyari({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--color-danger)' }}>
      {children}
    </p>
  );
}

function Devam({ disabled, onClick, children }: { disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} className="auth-submit"
      style={{ width: '100%', marginTop: 18, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'default' : 'pointer' }}
    >
      {children}
    </button>
  );
}

function Geri({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        // padding: dokunma hedefi WCAG 2.5.8'in 24x24 alt sınırının altındaydı
        // (~20px yükseklik). Görsel olarak aynı, hedef büyüdü.
        touchAction: 'manipulation', display: 'block', margin: '6px auto 0',
        padding: '8px 16px',
        background: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit',
        fontSize: '0.85rem', color: 'var(--color-text-muted)',
      }}
    >
      ← Geri
    </button>
  );
}
