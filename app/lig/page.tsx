import type { Metadata } from 'next';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { haftalikLig, weekStartTR, type LeagueRow } from '@/lib/lig';
import LigListesi from './LigListesi';

// Haftalık XP Ligi — günün sorusunu tek kişilik alışkanlıktan rekabete çevirir.
// Kişiye özel veri YOK (herkese aynı sıralama) → ISR; SQL gerekmez
// (daily_answers + user_progress zaten canlı). Pazartesi 00:00 TR'de sıfırlanır.
export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Haftalık Lig',
  description: 'Bu hafta günün sorusunda en çok doğru cevabı verenler — Basementonfire haftalık bilgi ligi.',
  alternates: { canonical: '/lig' },
};

/* ⚠ SIRALAMA MANTIĞI BURADA DEĞİL, lib/lig.ts'te. Akıştaki widget da
   (/api/lig) aynı fonksiyonu çağırıyor; ayrı ayrı yazılsalardı biri
   güncellenip öteki unutulur ve iki yüzey AYNI kullanıcıya FARKLI sıra
   gösterirdi. Bu depoda tam o tipte bir hata yaşandı (anket embed'i).

   Önbellek BURADA kalıyor: sayfa ISR ve kişiye özel veri taşımıyor.
   Widget ise önbelleksiz — cevaptan hemen sonra taze sıra lazım. */
const getWeeklyLeague = unstable_cache(
  async (weekStart: string): Promise<LeagueRow[]> => haftalikLig(weekStart),
  ['weekly-league-v1'],
  { revalidate: 300 },
);

export default async function LigPage() {
  const weekStart = weekStartTR();
  const rows = await getWeeklyLeague(weekStart);

  return (
    <main className="main-content" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="feed-header">🏆 Haftalık Lig</div>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '18px 16px 64px' }}>
        <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          Bu hafta <strong style={{ color: 'var(--color-text)' }}>günün sorusunda</strong> en çok doğru cevabı verenler.
          Lig her pazartesi sıfırlanır — <Link href="/" style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}>bugünün sorusunu çöz</Link> ve tabloya gir.
        </p>

        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: 14 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🧠</div>
            <p style={{ fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text)' }}>Bu hafta henüz kimse soru çözmedi</p>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>İlk sen ol — günün sorusu akışta seni bekliyor.</p>
          </div>
        ) : (
          /* Satırlar istemci bileşeninde: TEK sebebi kullanıcının kendi satırını
             vurgulamak. Sayfa SUNUCU bileşeni kalıyor — revalidate=300 ve
             unstable_cache aynen duruyor, kimlik sunucuda OKUNMUYOR. */
          <LigListesi rows={rows} />
        )}
      </div>
    </main>
  );
}
