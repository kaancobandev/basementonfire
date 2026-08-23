'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * GÖNDERİ MODALI — YÜKLENME İSKELETİ
 *
 * NEDEN VAR: `/p/[id]` `force-dynamic`, yani CDN önbelleği yok ve her tık
 * sunucuya gidiyor. Ölçüldü (anonim, prod, RSC yükü TTFB): /p/13 0,38 sn ·
 * /p/20 0,84 sn · /p/8 1,29 sn · /p/11 1,43–2,87 sn. `time_connect` her
 * ölçümde 0,08–0,10 sn, yani süre el sıkışmada değil GERÇEKTEN sunucuda.
 * Bu segmentte `loading.tsx` yokken App Router yumuşak gezinmeyi BLOKLUYOR:
 * kullanıcı tıklıyor, eski sayfa ekranda kalıyor, 0,4–2,9 saniye boyunca
 * hiçbir geri bildirim olmuyor, sonra modal aniden beliriyor. Projede başka
 * bir bekleme göstergesi de yok (useTransition/useLinkStatus taraması: sıfır).
 * ⚠ Bu sunucuyu HIZLANDIRMAZ — sadece boşluğu görünür kılar.
 *
 * ⛔ ÜÇ KURAL — bozarsan bu iskelet gerilemeye döner:
 *
 *  1. 'use client' VE KAPATILABİLİR OLMALI. İskelet 0,4–2,9 sn boyunca ekranı
 *     kaplayan opak bir perde; kullanıcı vazgeçemezse bugünden DAHA KÖTÜ olur
 *     (bugün hiç değilse eski sayfa tıklanabilir durumda). Backdrop tıklaması
 *     ve Escape `router.back()` çağırır — PostModal.tsx ile aynı davranış.
 *  2. KAYDIRMA KİLİTLENMEZ. PostModal `body.overflow='hidden'` yazıyor; iskelet
 *     de yazarsa iskelet→modal geçişindeki unmount/mount sırası kilidi
 *     kullanıcının üstünde bırakabilir.
 *  3. framer-motion İMPORT EDİLMEZ. Paketi iskelet yoluna sokmak, hafif olsun
 *     diye eklenen şeyi ağırlaştırır.
 *
 * Yerleşim PostModal'dan KOPYALANDI (yeniden tasarlanmadı): aynı backdrop,
 * `.pm-shell` + `.pm-panel`. Böylece mobil/masaüstü yönü globals.css'ten
 * bedava geliyor ve iskelet→modal geçişinde zıplama olmuyor.
 */
export default function ModalYukleniyor() {
  const router = useRouter();

  // Escape ile vazgeç. (Kaydırma kilidi BİLEREK yok — yukarıdaki 2. kural.)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') router.back(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <div
      role="status" aria-live="polite" aria-label="Gönderi yükleniyor"
      onClick={(e) => { if (e.target === e.currentTarget) router.back(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        className="pm-shell"
        style={{
          background: 'var(--color-surface)', borderRadius: 16, display: 'flex',
          width: '100%', maxWidth: 860, height: '90vh', overflow: 'hidden', position: 'relative',
        }}
      >
        {/* Medya alanı — gerçek modalde de siyah zemin */}
        <div style={{ flex: 1, minWidth: 0, background: '#000' }} />

        {/* Yan panel — avatar + 2 satır künye + yorum yer tutucuları */}
        <div className="pm-panel" style={{ display: 'flex', flexDirection: 'column', padding: 16, gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pmload-blok" style={{ width: 38, height: 38, borderRadius: '50%', flex: 'none' }} />
            <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 6 }}>
              <div className="pmload-blok" style={{ width: '55%', height: 11, borderRadius: 4 }} />
              <div className="pmload-blok" style={{ width: '35%', height: 9, borderRadius: 4 }} />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <div className="pmload-blok" style={{ width: '100%', height: 10, borderRadius: 4 }} />
            <div className="pmload-blok" style={{ width: '80%', height: 10, borderRadius: 4 }} />
          </div>

          {[68, 52, 74, 44].map((g, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div className="pmload-blok" style={{ width: 28, height: 28, borderRadius: '50%', flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 5 }}>
                <div className="pmload-blok" style={{ width: '40%', height: 9, borderRadius: 4 }} />
                <div className="pmload-blok" style={{ width: `${g}%`, height: 9, borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
