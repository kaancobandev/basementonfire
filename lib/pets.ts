/**
 * Site maskotu — kayıt defteri + tercih saklama.
 *
 * Motor public/pets/pet-engine.js'te (düz JS, bundle dışı — gerekçesi o dosyanın
 * başında). Burası TypeScript tarafı: hangi hayvanlar var, hangisi seçili,
 * kullanıcı kapatmış mı.
 *
 * ── YENİ HAYVAN EKLEME ──
 *  1. Sprite sayfalarını public/pets/<id>/ altına koy (idle/walk/sit/climb/
 *     swipe/drop; hepsi zorunlu değil, eksik olan davranış otomatik düşer).
 *  2. Aşağıdaki PETS listesine bir kayıt ekle. Kare boyutları pandadan farklıysa
 *     `sheets` ver, aynıysa hiç yazma.
 *  3. Ayarlarda seçici gerekiyorsa SettingsClient'taki anahtarı açık/kapalı
 *     düğmesinden liste seçicisine çevir — saklama biçimi (aşağıdaki `pet`
 *     anahtarı) bunu ZATEN destekliyor, değiştirmen gerekmez.
 *
 * ── TERCİH SAKLAMA ──
 * localStorage `pet` anahtarı, tema (`theme`) ile aynı desende — cihaz başına,
 * sunucuya tur atmadan, çıkış yapmış ziyaretçide de çalışır:
 *   · anahtar YOK  → varsayılan maskot AÇIK (kullanıcının istediği davranış)
 *   · 'off'        → kapalı
 *   · '<id>'       → o hayvan
 * Sunucuda okunmadığı için maskot hiçbir sayfanın statik/ISR olma durumunu
 * bozmaz (bkz. memory: performans-plani — root layout auth OKUMAZ).
 */

export interface PetSheet {
  file: string;
  w: number;
  h: number;
  frames: number;
}

export interface PetDef {
  id: string;
  /** Ayarlarda görünen ad */
  ad: string;
  /** Sprite klasörü — sonunda / OLMALI */
  path: string;
  /** Kare boyutları panda tablosundan farklıysa */
  sheets?: Record<string, PetSheet>;
  /** Motora geçirilecek ek ayar (hız, ölçek, zIndex…) */
  options?: Record<string, unknown>;
}

/** Motor + sprite önbellek kırıcı. netlify.toml /pets/* için 7 gün cache veriyor;
 *  motoru veya bir sprite'ı DEĞİŞTİRİRSEN bu sayıyı artır, yoksa geri dönen
 *  ziyaretçi bir hafta boyunca eski dosyayı görür. */
export const PET_VERSION = '4';   // 4: konuşma balonundaki marka adı "basements" → "basementonfire"
                                  // 3: sürüm 12 sanatı — pembe allık + büyük tırmanma karesi

export const PET_ENGINE_SRC = `/pets/pet-engine.js?v=${PET_VERSION}`;

export const PETS: PetDef[] = [
  {
    id: 'red-panda',
    ad: 'Kızıl panda',
    path: '/pets/red-panda/',
    // Varsayılan sayfa tablosu zaten panda — `sheets` gerekmiyor.
  },
];

export const DEFAULT_PET_ID = 'red-panda';

/** localStorage anahtarı — tema ile aynı yerde yaşar. */
export const PET_KEY = 'pet';

/** Ayarlardaki düğme bunu yayınlar; açık sekmedeki maskot anında açılır/kapanır
 *  (sayfa yenilemeye gerek yok). */
export const PET_EVENT = 'pet:change';

export function petById(id: string | null | undefined): PetDef | null {
  if (!id) return null;
  return PETS.find((p) => p.id === id) ?? null;
}

/** Seçili maskot, ya da kapalıysa null. Sunucuda her zaman null döner. */
export function readPet(): PetDef | null {
  if (typeof window === 'undefined') return null;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(PET_KEY);
  } catch {
    // Gizli sekme / storage kapalı → varsayılana düş, kırılma.
  }
  if (raw === 'off') return null;
  // Anahtar yoksa VARSAYILAN AÇIK. Bilinmeyen bir id (silinmiş hayvan) de
  // varsayılana düşer — maskot sessizce kaybolmasın.
  return petById(raw) ?? petById(DEFAULT_PET_ID);
}

export function isPetOn(): boolean {
  return readPet() !== null;
}

/** Ayarlardan aç/kapa. Aynı sekmeyi olayla, diğer sekmeleri `storage` olayıyla
 *  günceller (tarayıcı `storage`'ı yazan sekmeye göndermez, o yüzden ikisi de). */
export function setPetOn(on: boolean, id: string = DEFAULT_PET_ID): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PET_KEY, on ? id : 'off');
  } catch {
    // Yazamadıysak da olayı yayınla: bu sekmede tercih yine de uygulanır.
  }
  try {
    window.dispatchEvent(new CustomEvent(PET_EVENT));
  } catch {}
}

/* ── Motorun global yüzeyi (public/pets/pet-engine.js) ── */
export interface PetEngine {
  start(opts: Record<string, unknown>): unknown;
  stop(): void;
  remove(): void;
  current(): unknown;
}

declare global {
  interface Window {
    BasementPet?: PetEngine;
  }
}
