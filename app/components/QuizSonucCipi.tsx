'use client';

import Link from 'next/link';
import { ARTICLE_MAP } from '@/lib/articles';

/**
 * Bir gönderiye bağlı makale rozeti: quiz skoru çipi + "Ben de deneyeyim".
 *
 * ⚠ Skor İSTEMCİ HESABI DEĞİL: `/api/posts` gönderiyi yazmadan önce
 * `article_quiz_answers`tan kendi hesaplıyor ve satıra yazıyor. Buradaki iş
 * sadece göstermek.
 *
 * Skor yoksa (article_slug var, quiz_* null) gönderi "makaleyi paylaştım"
 * gönderisidir — çip yerine sade bir makale bağlantısı çizilir.
 */
export default function QuizSonucCipi({
  slug, correct, total,
}: {
  slug: string;
  correct?: number | null;
  total?: number | null;
}) {
  const makale = ARTICLE_MAP[slug];
  // Makale kayıttan düşmüşse hiçbir şey çizme — kırık bağlantı gösterme.
  if (!makale) return null;

  const skorVar = typeof correct === 'number' && typeof total === 'number' && total > 0;
  const tamam = skorVar && correct === total;

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, margin: '10px 0 2px' }}>
      {skorVar && (
        <span
          className="tnum"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', borderRadius: 9999,
            fontSize: '0.8rem', fontWeight: 800,
            background: tamam ? 'var(--color-success-soft)' : 'var(--color-accent-soft)',
            color: tamam ? 'var(--color-success-ink)' : 'var(--color-accent-ink)',
            border: `1.5px solid ${tamam ? 'var(--color-success)' : 'var(--color-accent)'}`,
          }}
        >
          {/* MAKALENİN KENDİ emojisi (ArticleMeta.emoji) — genel bir ikon
              değil. Kusursuz skorun işareti çipin RENGİ (yeşil), ayrı bir
              onay simgesi değil: iki simge yan yana kalabalık ediyordu. */}
          <span aria-hidden>{makale.emoji}</span>
          {correct}/{total} · {makale.title} quizi
        </span>
      )}

      {/* Gördüğü kişiyi makaleye çağıran bağ — döngünün kapandığı yer. */}
      <Link
        href={`/articles/${makale.slug}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none',
          color: 'var(--color-primary)',
        }}
      >
        <span aria-hidden>{skorVar ? '🎯' : makale.emoji}</span>
        {skorVar ? 'Ben de deneyeyim' : makale.title}
      </Link>
    </div>
  );
}
