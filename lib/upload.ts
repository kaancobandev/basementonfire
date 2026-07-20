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
): Promise<{ path: string; mediaType: 'image' | 'video' | 'audio' }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  const signRes = await fetch('/api/storage/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, ext, contentType: file.type, size: file.size }),
  });
  const sign = await signRes.json();
  if (!signRes.ok) throw new Error(sign.error ?? 'Yükleme hazırlanamadı.');

  // supabase-js'i ancak gerçekten yükleme anında indir: statik import bu
  // kütüphaneyi ana sayfa/akış/profil first-load bundle'ına taşıyordu; yükleme
  // yapmayan (anonim dahil) hiçbir ziyaretçi artık bu maliyeti ödemez.
  const { getSupa } = await import('@/lib/supabase/client');
  const { error } = await getSupa()
    .storage.from('media')
    // Dosya adları benzersiz (üzerine yazılmaz) → 1 yıl önbellek güvenli;
    // tekrar ziyaretlerde medya tarayıcı/CDN önbelleğinden anında gelir.
    .uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type, cacheControl: '31536000' });
  // GERÇEK hatayı taşı: eskiden bucket bulunamadı, mime kısıtı, 413, süresi geçmiş
  // imza — hepsi aynı tek cümleye iniyordu ve hangi katmanın patladığı anlaşılmıyordu.
  if (error) throw new Error(error.message ? `Dosya yüklenemedi: ${error.message}` : 'Dosya yüklenemedi.');

  return { path: sign.path as string, mediaType: sign.mediaType as 'image' | 'video' | 'audio' };
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
