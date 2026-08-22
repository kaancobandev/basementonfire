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

  const ayRef = useRef<HTMLInputElement>(null);
  const yilRef = useRef<HTMLInputElement>(null);

  const iki = (v: string) => v.padStart(2, '0');
  const dogumIso = gun && ay && yil.length === 4 ? `${yil}-${iki(ay)}-${iki(gun)}` : '';
  const yas = dogumIso ? ageFromBirthdate(dogumIso) : null;

  // Sunucu kuralının aynısı (api/auth/register:41). Küçük harfe çevirip bakıyoruz
  // çünkü sunucu da öyle yapıyor — kullanıcı "Kaan" yazsa da geçerli sayılmalı.
  const adGecerli = /^[a-z0-9_]{3,30}$/.test(kullaniciAdi.trim().toLowerCase());
  const epostaGecerli = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta.trim());
  const sifreGecerli = sifre.length >= 6;
  const tarihGecerli =
    !!dogumIso && yas !== null && yas >= MIN_AGE && Number(yil) >= 1900 &&
    (maxYil === 0 || Number(yil) <= maxYil) &&
    Number(ay) >= 1 && Number(ay) <= 12 && Number(gun) >= 1 && Number(gun) <= 31;

  const ilgiSec = (i: number) =>
    setIlgiler((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length >= EN_FAZLA_ILGI ? p : [...p, i]));

  const sayiYaz = (v: string, uzunluk: number) => v.replace(/[^0-9]/g, '').slice(0, uzunluk);

  return (
    <div>
      <IlerlemeCubugu adim={adim} />

      {adim === 1 && (
        <Ekran baslik="Cinsiyetini seç" alt="Profilini oluşturmak için ilk adım.">
          <div style={{ display: 'grid', gap: 10 }}>
            {CINSIYET_SIRA.map((deger) => (
              <SecimKarti
                key={deger}
                secili={cinsiyet === deger}
                onClick={() => setCinsiyet(deger)}
                baslik={CINSIYET_ETIKET[deger]}
              />
            ))}
          </div>
          <Devam disabled={!cinsiyet} onClick={() => setAdim(2)}>Devam et</Devam>
        </Ekran>
      )}

      {adim === 2 && (
        <Ekran baslik="Burada neler yapmak istersin?" alt={`En fazla ${EN_FAZLA_ILGI} tane seç. İstediğin zaman değiştirirsin.`}>
          <div style={{ display: 'grid', gap: 8 }}>
            {ILGILER.map((it, i) => {
              const secili = ilgiler.includes(i);
              const dolu = !secili && ilgiler.length >= EN_FAZLA_ILGI;
              return (
                <SecimKarti
                  key={it.baslik}
                  secili={secili}
                  soluk={dolu}
                  onClick={() => ilgiSec(i)}
                  baslik={it.baslik}
                  alt={it.alt}
                />
              );
            })}
          </div>
          <Devam disabled={ilgiler.length === 0} onClick={() => setAdim(3)}>Devam et</Devam>
          <Geri onClick={() => setAdim(1)} />
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
          <Devam onClick={() => setAdim(4)}>Devam et</Devam>
          <Geri onClick={() => setAdim(2)} />
        </Ekran>
      )}

      {adim === 4 && (
        <Ekran baslik="Ne zaman doğdun?" alt="Sadece yaşını doğrulamak için kullanıyoruz.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 10 }}>
            <TarihKutu deger={gun} etiket="Gün" enFazla={2} onDegis={(v) => {
              const t = sayiYaz(v, 2); setGun(t);
              if (t.length === 2) ayRef.current?.focus();
            }} />
            <TarihKutu deger={ay} etiket="Ay" enFazla={2} inputRef={ayRef} onDegis={(v) => {
              const t = sayiYaz(v, 2); setAy(t);
              if (t.length === 2) yilRef.current?.focus();
            }} />
            <TarihKutu deger={yil} etiket="Yıl" enFazla={4} inputRef={yilRef} onDegis={(v) => setYil(sayiYaz(v, 4))} />
          </div>

          {/* Yaş kapısı — sunucu yeniden hesaplıyor ama kullanıcı 5. adıma
              gidip orada reddedilmesin diye burada da söylüyoruz. */}
          {dogumIso && yas !== null && yas < MIN_AGE && (
            <p style={{ marginTop: 12, fontSize: '0.84rem', color: 'var(--color-danger)' }}>
              Basementonfire {MIN_AGE} yaş ve üzeri içindir.
            </p>
          )}

          <Devam disabled={!tarihGecerli} onClick={() => setAdim(5)}>Devam et</Devam>
          <Geri onClick={() => setAdim(3)} />
        </Ekran>
      )}

      {adim === 5 && (
        <Ekran baslik="Hesabını oluştur." alt="Son adım — birkaç bilgi yeterli.">
          {/* ⚠ GERÇEK FORM POST — fetch DEĞİL. Sunucu `formData()` okuyor ve
              hatada `/register?error=` ile 303 dönüyor; AuthErrorNotice o
              parametreyi basıyor. Bu akışı JSON'a çevirmek hata gösterimini
              ve JS'siz çalışmayı bozardı. */}
          <form action="/api/auth/register" method="post" onSubmit={() => setGonderiliyor(true)}>
            {/* Önceki adımların cevapları — sunucu bunları da doğruluyor. */}
            <input type="hidden" name="gender" value={cinsiyet} />
            <input type="hidden" name="birthdate" value={dogumIso} />

            <FloatingInput
              id="reg-username" type="text" name="username" label="Kullanıcı adı" required
              autoComplete="username" value={kullaniciAdi}
              onChange={(e) => setKullaniciAdi(e.target.value)}
            />
            {kullaniciAdi && !adGecerli && (
              <Uyari>3–30 karakter; yalnızca harf, rakam ve alt çizgi.</Uyari>
            )}

            <FloatingInput
              id="reg-email" type="email" name="email" label="E-posta" required
              autoComplete="email" value={eposta} onChange={(e) => setEposta(e.target.value)}
            />

            <FloatingInput
              id="reg-password" type="password" name="password" label="Şifre (en az 6 karakter)" required
              autoComplete="new-password" minLength={6} value={sifre}
              onChange={(e) => setSifre(e.target.value)}
            />

            {/* ⚠ YAŞ BEYANI BURADA KALMALI. Mevcut kayıt formunda vardı ve
                MIN_AGE hukuki metinlere bağlı (lib/age.ts). Tasarımın yasal
                metninde yoktu — düşseydi KVKK tarafında gerileme olurdu. */}
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 14,
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

            <button
              type="submit" className="auth-submit"
              disabled={gonderiliyor || !adGecerli || !epostaGecerli || !sifreGecerli || !onay}
              style={{ width: '100%', marginTop: 16, opacity: gonderiliyor ? 0.7 : 1 }}
            >
              {gonderiliyor ? 'Oluşturuluyor…' : 'Hesabımı oluştur'}
            </button>
          </form>
          <Geri onClick={() => setAdim(4)} />
        </Ekran>
      )}
    </div>
  );
}

/* ────────────────────────── parçalar ────────────────────────── */

const bagStil = { color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' } as const;

function IlerlemeCubugu({ adim }: { adim: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 22 }} aria-label={`Adım ${adim} / ${TOPLAM_ADIM}`}>
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

function SecimKarti({ secili, soluk, onClick, baslik, alt }: {
  secili: boolean; soluk?: boolean; onClick: () => void; baslik: string; alt?: string;
}) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={secili} disabled={soluk}
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

function TarihKutu({ deger, etiket, enFazla, onDegis, inputRef }: {
  deger: string; etiket: string; enFazla: number;
  onDegis: (v: string) => void; inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', marginBottom: 6, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{etiket}</span>
      <input
        ref={inputRef} value={deger} onChange={(e) => onDegis(e.target.value)}
        // inputMode="numeric": mobilde sayı klavyesi açar. type="number" DEĞİL —
        // o, artırma okları ve tekerlek kaydırmayla değer değiştirme getiriyor.
        inputMode="numeric" maxLength={enFazla} placeholder={'0'.repeat(enFazla)}
        style={{
          width: '100%', padding: '12px 10px', textAlign: 'center',
          fontSize: '1.05rem', fontWeight: 700, fontFamily: 'inherit',
          color: 'var(--color-text)', background: 'rgba(255,255,255,.06)',
          border: '1px solid rgba(255,255,255,.14)', borderRadius: 'var(--radius-md)',
        }}
      />
    </label>
  );
}

function Uyari({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '-4px 0 10px', fontSize: '0.8rem', color: 'var(--color-danger)' }}>{children}</p>;
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
        touchAction: 'manipulation', display: 'block', margin: '12px auto 0',
        background: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit',
        fontSize: '0.85rem', color: 'var(--color-text-muted)',
      }}
    >
      ← Geri
    </button>
  );
}
