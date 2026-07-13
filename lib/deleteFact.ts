import { db } from './supabase/server';
import { factMediaList } from './types';
import { revalidateTag } from 'next/cache';

const PUBLIC_PREFIX = '/storage/v1/object/public/media/';

// Bir quick_facts gönderisini KALICI siler: her medya dosyasını gizli `deleted_media`
// arşivine kopyalar, satırı siler (fact_likes/yorum/bookmark CASCADE ile gider),
// dosyaları public `media` bucket'ından private `archive` bucket'ına taşır (public URL
// kalmaz). Hem SAHİBİNİN silme route'u hem ADMİN moderasyon silmesi bunu kullanır ki
// "silinen" içeriğin görseli dışarıdan erişilebilir kalmasın.
export async function archiveAndDeleteFact(fact: any): Promise<{ ok: boolean; error?: string }> {
  const files = factMediaList(fact).map((m, i) => {
    const srcPath = m.url?.includes(PUBLIC_PREFIX) ? m.url.split(PUBLIC_PREFIX)[1] : null;
    const archivePath = srcPath
      ? `${fact.user_id}/${Date.now()}-${i}-${srcPath.split('/').pop()}`
      : null;
    return { url: m.url, type: m.type, srcPath, archivePath };
  });

  // 1) Gizli arşiv tablosuna her dosya için bir satır kopyala
  const { error: arcErr } = await db.from('deleted_media').insert(
    files.map(f => ({
      original_id: fact.id,
      user_id: fact.user_id,
      caption: fact.caption,
      media_type: f.type,
      original_media_url: f.url,
      archive_path: f.archivePath,
      original_created_at: fact.created_at,
    })),
  );
  if (arcErr) return { ok: false, error: 'Arşivlenemedi — `deleted_media` tablosu kurulu mu?' };

  // 2) quick_facts'ten sil (bağımlılar CASCADE)
  const { error: delErr } = await db.from('quick_facts').delete().eq('id', fact.id);
  if (delErr) {
    await db.from('deleted_media').delete().eq('original_id', fact.id);
    return { ok: false, error: 'Silinemedi' };
  }

  // Silinen gönderi → paylaşılan feed önbelleğinden hemen kalksın.
  revalidateTag('feed');

  // 3) Dosyaları private 'archive' bucket'ına taşı (en son; içerik zaten kalktı)
  for (const f of files) {
    if (f.srcPath && f.archivePath) {
      const { error: mvErr } = await db.storage
        .from('media')
        .move(f.srcPath, f.archivePath, { destinationBucket: 'archive' });
      if (mvErr) {
        // Taşınamadıysa dosya hâlâ media'da — arşiv kaydında gerçek konumu işaretle
        await db.from('deleted_media')
          .update({ archive_path: f.srcPath })
          .eq('original_id', fact.id)
          .eq('original_media_url', f.url);
      }
    }
  }

  return { ok: true };
}
