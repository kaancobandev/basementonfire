/**
 * Özellik bayrakları — kodu SİLMEDEN bir özelliği tamamen görünmez yapmak için.
 *
 * MATCHING (/eslesme — ilgi alanı bazlı kart kaydırma + eşleşince DM):
 * Teknopark İstanbul BTM başvurusu değerlendirmede olduğu sürece KAPALI.
 * Kapalıyken hiçbir ziyaretçi özelliği göremez:
 *   - /eslesme            → 404 (giriş yapmış 18+ kullanıcı dahil)
 *   - /api/match/*        → 404 (rota doğrudan çağrılsa bile)
 *   - feed giriş kartları → hiç render edilmez (app/feed/page.tsx, canMatch)
 * Veritabanı, SQL ve bileşenlerin tamamı yerinde duruyor; bayrak açılınca
 * özellik olduğu gibi geri gelir.
 *
 * AÇMAK İÇİN (iki yoldan biri yeter):
 *   1. Netlify ortam değişkeni:  NEXT_PUBLIC_MATCHING_ENABLED = 1  → yeni deploy
 *   2. Ya da aşağıdaki satırı `export const MATCHING_ENABLED = true;` yap
 *
 * AÇARKEN AYRICA: app/eslesme/loading.tsx.off dosyasını loading.tsx yap.
 * O iskelet AÇIKKEN kalmalı ama KAPALIYKEN kalamaz: streaming başlatıp durum
 * kodunu 200e kilitliyor, notFound() gerçek 404 üretemiyor (soft-404). Ölçüldü:
 * dosya dururken /eslesme 200, kaldırılınca 404 (gövde iki durumda da doğru).
 *
 * NOT: NEXT_PUBLIC_* değerleri BUILD sırasında gömülür. Değişkeni eklemek/silmek
 * tek başına yetmez, sonrasında yeniden deploy şart.
 */
export const MATCHING_ENABLED = process.env.NEXT_PUBLIC_MATCHING_ENABLED === '1';
