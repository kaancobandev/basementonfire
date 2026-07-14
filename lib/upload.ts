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
  if (error) throw new Error('Dosya yüklenemedi.');

  return { path: sign.path as string, mediaType: sign.mediaType as 'image' | 'video' | 'audio' };
}
