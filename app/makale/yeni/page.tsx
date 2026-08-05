import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db, getMe } from '@/lib/supabase/server';
import ArticleEditor from './ArticleEditor';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Makale Yaz',
  robots: { index: false, follow: false },
};

// Duzenleme-onayi gocundan ONCEKI sutun listesi; yedek yolda kullanilir.
const TEMEL_KOLONLAR = 'id, slug, title, summary, cover_url, category, doc, sources, status, user_id';

export default async function MakaleYeniPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { me } = await getMe();
  if (!me) redirect('/login');

  const { id } = await searchParams;
  let initial: any = null;
  if (id && Number.isFinite(Number(id))) {
    const oku = (kolonlar: string) =>
      db.from('user_articles').select(kolonlar).eq('id', Number(id)).maybeSingle();

    let { data, error } = await oku(TEMEL_KOLONLAR + ', pending_edit, pending_reject_reason');
    // ⚠ DEPLOY SIRASI: duzenleme-onayi gocu henuz calismadiysa pending_*
    // sutunlari yoktur, sorgu 42703 ile duser ve `initial` null kalirdi —
    // yani editor DUZENLEME yerine "yeni makale" kipinde acilir, yazar da
    // farkinda olmadan makalesinin KOPYASINI olustururdu. Sutunsuz surumle
    // tekrar deneyip bunu engelliyoruz. Goc calistiktan sonra tetiklenmez.
    if (error) ({ data } = await oku(TEMEL_KOLONLAR));

    if (data && (data as any).user_id === me.id) {
      // pending_edit/pending_reject_reason ham hâlleriyle istemciye GITMEZ:
      // pending_edit koca `doc`u tasir, oldugu gibi gecirilirse editore inen
      // yuk iki katina cikardi. Asagida yalnizca gereken alanlar aktariliyor.
      const { pending_edit: oneri, pending_reject_reason: redNedeni, ...canli } = data as any;
      // ⚠ Bekleyen duzenleme VARSA editore o yuklenir, canli surum degil.
      // Aksi hâlde: yazar duzenler -> onaya duser -> sayfayi tekrar acar ->
      // ESKI canli metni gorur -> kaydeder -> bekleyen duzenlemesini kendi
      // eliyle, farkinda olmadan siler. Sessiz veri kaybi.
      initial = oneri
        ? { ...canli, ...oneri, id: canli.id, slug: canli.slug, status: canli.status, pendingEdit: true, pendingRejectReason: null }
        : { ...canli, pendingEdit: false, pendingRejectReason: redNedeni ?? null };
    }
  }

  return <ArticleEditor initial={initial} />;
}
