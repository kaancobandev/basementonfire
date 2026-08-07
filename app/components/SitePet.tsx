'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PET_ENGINE_SRC, PET_EVENT, PET_KEY, PET_VERSION, readPet } from '@/lib/pets';

/**
 * Site maskotunu (kızıl panda) sayfaya indiren ince yükleyici.
 *
 * Kendisi HİÇBİR ŞEY çizmez, null döner: bütün iş public/pets/pet-engine.js'te
 * (ana bundle'a sıfır bayt — gerekçesi o dosyanın başında). Buranın tek görevi
 * "ne zaman" sorusunu doğru cevaplamak.
 *
 * ── NE ZAMAN: geç, ama GARANTİLİ ──
 * İki istek çelişiyor: (a) "her şey yüklendikten sonra gelsin, siteyi
 * yavaşlatmasın", (b) "sonradan bozulan bir kod maskotun gelmesini
 * ENGELLEMESİN". Tek bir tetikleyiciye bağlanmak (b)'yi kırar:
 *   · yalnız `load` olayına bağlanmak → asılı kalan tek bir <img>/<iframe>
 *     `load`'u SONSUZA KADAR geciktirir, maskot hiç gelmez;
 *   · yalnız requestIdleCallback'e bağlanmak → ana iş parçacığı meşgul kaldığı
 *     sürece boşta zaman hiç oluşmaz, geri çağrı aç kalır.
 * Bu yüzden ÜÇ tetikleyici birbirinden BAĞIMSIZ kurulur ve hangisi önce
 * gelirse o kazanır (`calisti` bayrağı ile bir kez çalışır):
 *   1. sert tavan: setTimeout(3 sn) — `load` hiç gelmese de maskot gelir
 *   2. `load` sonrası requestIdleCallback (normalde kazanan yol)
 *   3. rIC yoksa (Safari) load sonrası kısa setTimeout
 *
 * TEK KURTARILAMAYAN DURUM: senkron sonsuz döngü (`while(true)`). JavaScript
 * tek iş parçacıklı olduğu için o sırada zamanlayıcı da, rIC de, React de,
 * hiçbir şey çalışmaz — maskota özel bir çare yok. Onun dışındaki tüm
 * "sonradan bozulma" biçimleri (asılı istek, ağır uzun görev, patlayan bir
 * efekt, motorun 404 olması) bu kurulumu durduramaz.
 *
 * Motor indirilemezse söz `false` çözülür ve kilit açılır → tercih değişimi
 * ya da sonraki gezinme yeniden dener; hiçbir hata sayfaya sızmaz.
 */

/** Maskotun görünmediği yollar. */
const GIZLI_YOLLAR = [
  // Odaklanmış auth akışı — AppShell de bu sayfalarda kabuğu çizmiyor.
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  // 100dvh tam ekran dikey video: maskot altyazının/aksiyonların üstüne biner.
  '/reels',
];

function gizliMi(path: string): boolean {
  return GIZLI_YOLLAR.some((p) => path === p || path.startsWith(p + '/'));
}

/** Sert tavan: `load` hiç gelmese bile maskot en geç bu kadar sonra başlar. */
const SERT_TAVAN_MS = 3000;

/** Ağ askıda kalırsa (ne load ne error) sözü sonsuza kadar bekletme. */
const AG_TAVAN_MS = 15000;

/** Motor sözü — sekme ömrü boyunca tek kez indirilir. */
let motorSozu: Promise<boolean> | null = null;

/** Şu an koşan maskotun id'si (yeniden başlatmayı engeller). */
let aktifPet: string | null = null;

function motoruYukle(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.BasementPet) return Promise.resolve(true);
  if (motorSozu) return motorSozu;

  motorSozu = new Promise<boolean>((resolve) => {
    let bitti = false;
    let agTimer = 0;
    const bitir = (ok: boolean) => {
      if (bitti) return;
      bitti = true;
      window.clearTimeout(agTimer);
      // Başarısızlıkta kilidi aç: bir sonraki tetikleyici yeniden denesin.
      if (!ok || !window.BasementPet) motorSozu = null;
      resolve(!!window.BasementPet);
    };

    const s = document.createElement('script');
    s.src = PET_ENGINE_SRC;
    s.async = true;
    // İndirmeyi kritik kaynakların ARKASINA koy (destekleyen tarayıcıda).
    (s as HTMLScriptElement & { fetchPriority?: string }).fetchPriority = 'low';
    s.onload = () => bitir(true);
    s.onerror = () => { s.remove(); bitir(false); };
    agTimer = window.setTimeout(() => bitir(false), AG_TAVAN_MS);
    document.head.appendChild(s);
  });

  return motorSozu;
}

/** Üç bağımsız tetikleyiciyi kurar, ilk geleni kazanır. Temizleyici döner. */
function bostaZamanla(fn: () => void): () => void {
  const timerlar: number[] = [];
  let idleId = 0;
  let calisti = false;

  const temizle = () => {
    timerlar.forEach((t) => window.clearTimeout(t));
    timerlar.length = 0;
    const iptalEt = (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
    if (idleId && typeof iptalEt === 'function') iptalEt(idleId);
    idleId = 0;
    window.removeEventListener('load', onLoad);
  };

  const calistir = () => {
    if (calisti) return;
    calisti = true;
    temizle();
    fn();
  };

  function bostaSor() {
    const bosta = (window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    }).requestIdleCallback;
    if (typeof bosta === 'function') idleId = bosta(calistir, { timeout: 800 });
    else timerlar.push(window.setTimeout(calistir, 150));
  }

  function onLoad() { bostaSor(); }

  // 1) sert tavan — `load` olayından ve boşta zamandan BAĞIMSIZ
  timerlar.push(window.setTimeout(calistir, SERT_TAVAN_MS));
  // 2/3) sayfa yüklendiyse hemen boşta zaman iste, değilse load'u bekle
  if (document.readyState === 'complete') bostaSor();
  else window.addEventListener('load', onLoad, { once: true });

  return temizle;
}

function petiKapat() {
  try { window.BasementPet?.remove(); } catch {}
  aktifPet = null;
}

export default function SitePet() {
  const pathname = usePathname();
  const gizli = gizliMi(pathname ?? '');

  // Bağımlılık PATHNAME DEĞİL `gizli`: her gezinmede zamanlayıcıyı yeniden
  // kurmanın anlamı yok, yalnızca "görünür ↔ gizli" geçişinde iş var.
  useEffect(() => {
    if (gizli) { petiKapat(); return; }

    let iptal = false;

    const uygula = () => {
      if (iptal) return;
      const pet = readPet();
      if (!pet) { petiKapat(); return; }
      if (aktifPet === pet.id) return;            // zaten o maskot koşuyor
      motoruYukle().then((hazir) => {
        if (iptal || !hazir) return;
        // Motor inerken kullanıcı ayarlardan kapatmış olabilir → yeniden oku.
        const guncel = readPet();
        if (!guncel) { petiKapat(); return; }
        if (aktifPet === guncel.id) return;
        try {
          window.BasementPet!.start({
            path: guncel.path,
            bust: PET_VERSION,
            sheets: guncel.sheets,
            ...guncel.options,
          });
          aktifPet = guncel.id;
        } catch {
          aktifPet = null;   // motor patlarsa sayfayı etkileme, sessizce vazgeç
        }
      });
    };

    const zamanlamayiIptalEt = bostaZamanla(uygula);

    // Ayarlardaki düğme (aynı sekme) + diğer sekmeler (storage olayı).
    const onDegis = () => uygula();
    const onStorage = (e: StorageEvent) => { if (e.key === PET_KEY) uygula(); };
    window.addEventListener(PET_EVENT, onDegis);
    window.addEventListener('storage', onStorage);

    return () => {
      iptal = true;
      zamanlamayiIptalEt();
      window.removeEventListener(PET_EVENT, onDegis);
      window.removeEventListener('storage', onStorage);
    };
  }, [gizli]);

  return null;
}
