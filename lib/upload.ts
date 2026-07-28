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
  kind: 'media' | 'story' | 'avatar',
  /** Yükleme ilerlemesi (bayt). 250 MB'lık bir video dakikalar sürebiliyor —
   *  çağıran taraf bunu yüzdeye çevirip ekranda gösterir. */
  onProgress?: (loaded: number, total: number) => void,
): Promise<{ path: string; mediaType: 'image' | 'video' | 'audio' }> {
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
