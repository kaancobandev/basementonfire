/**
 * Tarayıcıdan doğrudan Supabase Storage'a yükler (Netlify serverless fonksiyon
 * gövde limitini atlar — büyük videolar için gerekli).
 *
 * 1) Sunucudan imzalı yükleme URL'i ister (küçük JSON isteği).
 * 2) Dosyayı doğrudan Supabase'e yükler.
 * Yüklenen storage path'ini ve medya tipini döner; çağıran taraf bunu ilgili
 * "commit" endpoint'ine göndererek DB kaydını oluşturur.
 */
export async function uploadToStorage(
  file: File,
  kind: 'media' | 'story' | 'avatar' | 'dm',
  /** Yükleme ilerlemesi (bayt). 250 MB'lık bir video dakikalar sürebiliyor —
   *  çağıran taraf bunu yüzdeye çevirip ekranda gösterir. */
  onProgress?: (loaded: number, total: number) => void,
): Promise<{ path: string; mediaType: 'image' | 'video' | 'audio' }> {
  // Video ise ÖNCE kodek/yapı denetimi — yüklemeden, hatta imza istemeden önce.
  if (file.type.startsWith('video/')) {
    const sorun = await videoSorunu(file);
    if (sorun) throw new Error(sorun);
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  const signRes = await fetch('/api/storage/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, ext, contentType: file.type, size: file.size }),
  });
  const sign = await signRes.json();
  if (!signRes.ok) throw new Error(sign.error ?? 'Yükleme hazırlanamadı.');

  // Eskiden supabase-js'in uploadToSignedUrl'i kullanılıyordu; o `fetch` üstünde
  // çalışır ve fetch YÜKLEME ilerlemesi yayınlamaz (upload stream'i standartta
  // hâlâ yok). İlerleme yüzdesi için tek yol XHR — imzalı URL'e düz PUT atıyoruz,
  // supabase-js'in yaptığının aynısı (bkz. storage-js: PUT /object/upload/sign/...
  // ?token=..., yetki tamamen token'da; ek başlık gerekmiyor).
  // Yan fayda: supabase-js artık yükleme yolunda hiç indirilmiyor.
  await putWithProgress(sign.signedUrl as string, file, onProgress);

  return { path: sign.path as string, mediaType: sign.mediaType as 'image' | 'video' | 'audio' };
}

// ── VİDEO ÖN DENETİMİ ────────────────────────────────────────────────────────
// 2026-08-01: akıştaki üç videonun da SESİ çalıp GÖRÜNTÜSÜ gelmiyordu. Sebep
// H.265/HEVC (hvc1) kodekti — ses AAC olduğu için çözülüyor, video izi Android
// Chrome'da hiç çözülemiyor. Üstüne `moov` kutusu dosyanın SONUNDAYDI: tarayıcı
// ilk kareyi boyayabilmek için 182 MB'ın tamamını indirmek zorunda kalıyordu,
// bu yüzden ızgarada kapak görselleri de hiç çıkmıyordu.
//
// Bu denetim olmadan aynı hata sessizce tekrarlanır: yükleme başarılı görünür,
// gönderi yayınlanır, kırık olduğu ancak başka bir cihazda fark edilir.
// Dosyanın yalnız iki ucu okunur (512 KB) — büyük videoda bile anlıktır.

const OKUMA = 256 * 1024;
/** Bunun altında `moov` sonda olsa da sorun değil; dosyanın tamamı zaten ucuz. */
const FASTSTART_ESIK = 25 * 1024 * 1024;

function fourcc(b: Uint8Array, i: number): string {
  return String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]);
}
function icerir(b: Uint8Array, ad: string): number {
  for (let i = 0; i + 3 < b.length; i++) if (fourcc(b, i) === ad) return i;
  return -1;
}

/** MP4 üst düzey kutularını yürür: `moov`, `mdat`'tan ÖNCE mi geliyor? */
function faststartVar(bas: Uint8Array): boolean {
  const dv = new DataView(bas.buffer, bas.byteOffset, bas.byteLength);
  let off = 0;
  while (off + 8 <= bas.length) {
    const boy = dv.getUint32(off);
    const tip = fourcc(bas, off + 4);
    if (tip === 'moov') return true;
    if (tip === 'mdat') return false; // moov'u görmeden mdat'a geldik → moov sonda
    // boy=1 → 64-bit largesize, boy=0 → dosya sonuna kadar (yani son kutu)
    if (boy === 0) return false;
    off += boy === 1 ? Number(dv.getBigUint64(off + 8)) : boy;
    if (boy < 8) return false; // bozuk kutu; karar veremiyoruz, engelleme
  }
  return false;
}

/**
 * Sorun varsa KULLANICIYA GÖSTERİLECEK cümleyi döner, yoksa null.
 * Emin olamadığımız her durumda null döner — yanlış yere engellemek,
 * kırık videoyu geçirmekten daha kötü bir kullanıcı deneyimi olurdu.
 */
export async function videoSorunu(file: File): Promise<string | null> {
  try {
    const bas = new Uint8Array(await file.slice(0, OKUMA).arrayBuffer());
    const son = file.size > OKUMA
      ? new Uint8Array(await file.slice(Math.max(0, file.size - OKUMA)).arrayBuffer())
      : new Uint8Array(0);

    // MP4 değilse (webm/ogg) bu denetim geçerli değil — dokunma.
    if (icerir(bas.subarray(0, 64), 'ftyp') < 0) return null;

    // moov faststart'ta başta, değilse sonda → kodek kutuları iki uçtan birinde.
    const kodekAlani = faststartVar(bas) ? bas : son;

    for (const kod of ['hvc1', 'hev1', 'hvcC']) {
      if (icerir(kodekAlani, kod) >= 0) {
        return 'Bu video H.265 (HEVC) kodekli. Android telefonlarda görüntü hiç açılmaz, yalnızca ses duyulur. '
          + 'Videoyu H.264 olarak yeniden dışa aktarıp tekrar dene — dışa aktarma ayarlarında "H.264" ya da "En uyumlu" seçeneği.';
      }
    }

    // H.264 ama 10-bit (High 10, profil 110) → mobil donanım çözücüler 8-bit.
    const a = icerir(kodekAlani, 'avcC');
    if (a >= 0 && kodekAlani[a + 5] === 110) {
      return 'Bu video 10-bit H.264 (High 10) kodekli. Telefonların donanım çözücüsü 10-bit desteklemez, görüntü açılmaz. '
        + 'Videoyu 8-bit H.264 olarak yeniden dışa aktar.';
    }

    if (file.size > FASTSTART_ESIK && !faststartVar(bas)) {
      const mb = Math.round(file.size / 1048576);
      return `Bu videonun oynatma bilgisi (moov) dosyanın sonunda. Tarayıcı ilk kareyi gösterebilmek için ${mb} MB'ın `
        + 'tamamını indirmek zorunda kalır; kapak görseli çıkmaz ve mobil veride çok yavaş açılır. '
        + 'Dışa aktarırken "web için optimize et" / "faststart" seçeneğini aç.';
    }

    return null;
  } catch {
    // Dosya okunamadıysa engelleme — asıl yükleme zaten kendi hatasını verir.
    return null;
  }
}

/** İmzalı URL'e PUT — ilerleme olayları yayınlar, hatayı okunur mesaja çevirir. */
function putWithProgress(url: string, file: File, onProgress?: (loaded: number, total: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('content-type', file.type || 'application/octet-stream');
    // Dosya adları benzersiz (üzerine yazılmaz) → 1 yıl önbellek güvenli;
    // tekrar ziyaretlerde medya tarayıcı/CDN önbelleğinden anında gelir.
    xhr.setRequestHeader('cache-control', 'max-age=31536000');
    if (onProgress) {
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded, e.total); };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Son olay %100'ün biraz altında kalabiliyor → çubuğu kapat.
        onProgress?.(file.size, file.size);
        resolve();
        return;
      }
      // GERÇEK hatayı taşı: bucket yok, mime kısıtı, 413 (Storage'ın kendi boyut
      // tavanı), süresi geçmiş imza — hepsi aynı tek cümleye inmesin.
      let msg = '';
      try { msg = JSON.parse(xhr.responseText)?.message ?? ''; } catch { /* JSON değilse boş kalsın */ }
      reject(new Error(msg ? `Dosya yüklenemedi: ${msg}` : `Dosya yüklenemedi (HTTP ${xhr.status}).`));
    };
    xhr.onerror = () => reject(new Error('Dosya yüklenemedi: bağlantı koptu.'));
    xhr.onabort = () => reject(new Error('Yükleme iptal edildi.'));
    xhr.send(file);
  });
}

/**
 * Görsel/videonun piksel boyutlarını YÜKLEME ÖNCESİ tarayıcıda ölçer (CLS önlemi:
 * w/h medya kaydına yazılır, feed oranı SSR'da hesaplanır — kutu zıplamaz).
 * Ölçülemezse (ses, bozuk dosya, desteklenmeyen tür) null döner; kayıt w/h'siz
 * devam eder (istemcide ölçen eski fallback devrede kalır).
 */
export function measureMediaDims(file: File): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const done = (r: { w: number; h: number } | null) => { URL.revokeObjectURL(url); resolve(r); };
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => done(img.naturalWidth && img.naturalHeight ? { w: img.naturalWidth, h: img.naturalHeight } : null);
      img.onerror = () => done(null);
      img.src = url;
    } else if (file.type.startsWith('video/')) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => done(v.videoWidth && v.videoHeight ? { w: v.videoWidth, h: v.videoHeight } : null);
      v.onerror = () => done(null);
      v.src = url;
    } else {
      done(null);
    }
  });
}
