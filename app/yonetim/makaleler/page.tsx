import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db, getMe, isAdmin } from '@/lib/supabase/server';
import { makaleFarki, type PendingEdit } from '@/lib/articleDiff';
import { sanitizeArticleHtml } from '@/lib/articleSanitize';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Makale Yönetimi',
  robots: { index: false, follow: false },
};

export default async function MakaleYonetimPage() {
  const { me } = await getMe();
  if (!me) redirect('/login');
  if (!isAdmin(me as any)) redirect('/');

  // ⚠ users embed'inde !fkey ZORUNLU: user_articles'a ileride ikinci bir users
  // baglantisi eklenirse (or. onaylayan admin) bu embed PGRST201 ile sessizce
  // bos liste dondururdu.
  const yazar = 'users!user_articles_user_id_fkey(username, display_name)';

  // Iki ayri kuyruk TEK sorguda cekilemiyor (biri status'e, digeri pending_edit'e
  // bakiyor) — paralel iki sorgu, tek tur gidis geliste.
  const [yeniler, duzenlemeler] = await Promise.all([
    db.from('user_articles')
      .select(`id, slug, title, summary, status, created_at, ${yazar}`)
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    // Yayindaki makalelere onerilen duzenlemeler. Fark hesabi icin CANLI
    // alanlar da geliyor; pending_edit ile karsilastirilacaklar.
    db.from('user_articles')
      .select(`id, slug, title, summary, category, cover_url, doc, sources, pending_edit, pending_at, ${yazar}`)
      .not('pending_edit', 'is', null)
      .order('pending_at', { ascending: true }),
  ]);

  const ad = (a: any) => a.users?.display_name || a.users?.username || 'Kullanıcı';

  const items = (yeniler.data ?? []).map((a: any) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    created_at: a.created_at,
    author: ad(a),
    username: a.users?.username ?? '',
  }));

  // Fark SUNUCUDA hesaplaniyor: doc'un tamami istemciye hic inmiyor (kuyrukta
  // 20 makale varsa megabaytlarca jsonb olurdu) ve LCS maliyeti admin'in
  // cihazina yuklenmiyor.
  const edits = (duzenlemeler.data ?? []).map((a: any) => {
    const oneri = a.pending_edit as PendingEdit;
    const fark = makaleFarki(a, oneri);
    return {
      id: a.id,
      slug: a.slug,
      title: a.title,              // yayindaki baslik
      yeniTitle: oneri.title,      // onerilen baslik
      pending_at: a.pending_at,
      author: ad(a),
      username: a.users?.username ?? '',
      ...fark,
      // Bicim farki RENDER EDILEREK gosteriliyor (renk degisimini okumak degil
      // GORMEK gerekir), o yuzden makalenin kendisiyle ayni sanitize kapisindan
      // gecmeli — panel, onaylanmamis kullanici HTML'ini ham basmaz.
      bicim: fark.bicim.map((b) => ({
        ...b,
        eskiHtml: sanitizeArticleHtml(b.eskiHtml),
        yeniHtml: sanitizeArticleHtml(b.yeniHtml),
      })),
    };
  });

  return <AdminClient items={items} edits={edits} />;
}
