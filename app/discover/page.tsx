import type { Metadata } from 'next';
import { db, getMe, logIfError } from '@/lib/supabase/server';
import DiscoverClient from './DiscoverClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Keşfet',
  description: 'Basements\'te kullanıcıları, gönderileri ve konuları keşfet; yeni insanlar ve içerikler bul.',
  alternates: { canonical: '/discover' },
  openGraph: {
    title: 'Keşfet · Basements',
    description: 'Kullanıcıları, gönderileri ve konuları keşfet.',
    url: '/discover',
    images: ['/opengraph-image'],
  },
};

function avatarBg(u: string) {
  const gs = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#ec4899,#8b5cf6)','linear-gradient(135deg,#f97316,#ef4444)','linear-gradient(135deg,#10b981,#3b82f6)','linear-gradient(135deg,#f59e0b,#f97316)','linear-gradient(135deg,#14b8a6,#06b6d4)','linear-gradient(135deg,#3b82f6,#6366f1)','linear-gradient(135deg,#ef4444,#f97316)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { me } = await getMe();
  const sp = await searchParams;
  const initialQuery = typeof sp.q === 'string' ? sp.q : '';

  // Recent users
  const { data: users, error: usersErr } = await db.from('users').select('id, username, display_name, bio, avatar').order('created_at', { ascending: false }).limit(20);
  logIfError('discover users', usersErr);

  // Recent media posts
  const { data: mediaRaw, error: mediaErr } = await db.from('quick_facts').select('id, media_url, media_type, caption, likes, users!quick_facts_user_id_fkey(username, display_name)').order('created_at', { ascending: false }).limit(12);
  logIfError('discover quick_facts', mediaErr);

  const media = (mediaRaw ?? []).map((m: any) => ({ ...m, username: m.users?.username ?? '', display_name: m.users?.display_name ?? '' }));

  const articles = [
    { slug: 'black-hole', title: 'Kara Delikler', emoji: '🕳️', desc: 'Evrenin en gizemli yapıları' },
    { slug: 'turkler', title: 'Türklerin Tarihi', emoji: '🏹', desc: 'Orta Asya\'dan Anadolu\'ya' },
    { slug: 'rome', title: 'Roma İmparatorluğu', emoji: '🏛️', desc: 'Bin yıllık medeniyet' },
    { slug: 'greece', title: 'Antik Yunan', emoji: '⚡', desc: 'Demokrasinin beşiği' },
    { slug: 'carthage', title: 'Kartaca', emoji: '⚓', desc: 'Akdeniz\'in efendileri' },
    { slug: 'ekonomi', title: 'Ekonominin Dili', emoji: '📈', desc: 'Faiz, parite, borsa — interaktif sözlük' },
    { slug: 'einstein-rosen', title: 'Einstein–Rosen Köprüsü', emoji: '🌀', desc: 'İnteraktif solucan deliği rehberi' },
    { slug: 'arcade', title: 'Arcade', emoji: '🕹️', desc: 'Oyun salonu tarihi + oynanabilir klasikler' },
    { slug: 'tibbi', title: '15 Tuhaf Tıbbi Olgu', emoji: '🧬', desc: 'Doğrulanmış akıl almaz tıp gerçekleri' },
    { slug: 'internet', title: 'İnternet Nasıl Çalışır?', emoji: '🌐', desc: 'OSI, TCP/IP, DNS, paketler — diyagramlarla' },
    { slug: 'pirus', title: 'Kral Pirus', emoji: '🐘', desc: 'Filler, Pirus zaferi ve destansı savaşlar' },
    { slug: 'takyon', title: 'Takyonlar', emoji: '⚡', desc: 'Işıktan hızlı parçacıklar — benzetmelerle' },
    { slug: 'tardigrad', title: 'Tardigradlar (Su Ayıları)', emoji: '🐻', desc: 'Yok edilemez minik canavar + mini 2B oyun' },
  ];

  return (
    <DiscoverClient
      users={(users ?? []).map((u: any) => ({ ...u, avatarBg: avatarBg(u.username) }))}
      media={media}
      articles={articles}
      isLoggedIn={!!me}
      initialQuery={initialQuery}
    />
  );
}
