import { db, getMe } from '@/lib/supabase/server';
import { getBlockedUserIds } from '@/lib/blocks';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q    = (searchParams.get('q') ?? '').trim();
  const type = searchParams.get('type') ?? 'all';

  if (!q) return NextResponse.json({ users: [], posts: [], hashtags: [] });

  const pattern = `%${q.slice(0, 60)}%`;
  const USER_COLS = 'id, username, display_name, avatar, bio';

  // GÜVENLİK — `.or()` KULLANMA. Eskiden şöyleydi:
  //   .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
  // supabase-js `.or()` içeriğini PostgREST'e HAM geçirir, değer olarak
  // kaçışlamaz. `?q=zz,birthdate.gte.2005-01-01,username.ilike.zz` gibi bir
  // sorgu users tablosunun HERHANGİ bir kolonuna (birthdate, is_admin, auth_id)
  // saldırganın kendi filtresini eklemesine izin veriyordu; dönen sonuç kümesi
  // boolean oracle'a dönüşüp ikili aramayla doğum tarihi çıkarılabiliyordu.
  // `.ilike()` değeri parametre olarak geçirir → iki ayrı sorgu + kodda birleştirme.
  const searchUsers = async () => {
    const [byUsername, byDisplay] = await Promise.all([
      db.from('users').select(USER_COLS).ilike('username', pattern).eq('is_deleted', false).limit(15),
      db.from('users').select(USER_COLS).ilike('display_name', pattern).eq('is_deleted', false).limit(15),
    ]);
    const seen = new Map<number, any>();
    for (const u of [...(byUsername.data ?? []), ...(byDisplay.data ?? [])]) {
      if (!seen.has(u.id)) seen.set(u.id, u);
    }
    return { data: [...seen.values()].slice(0, 15) };
  };

  // getMe arama sorgularına bağımlı değil → aynı Promise.all'da (eskiden arkadan
  // seri geliyordu; etkileşimli uçta 1-2 tur doğrudan hissedilir kazanç).
  const [usersRes, postsRes, hashtagsRes, { me }] = await Promise.all([
    type !== 'posts'
      // Silinmiş hesaplar (anonim künye) aramada ÇIKMAZ.
      ? searchUsers()
      : { data: [] },
    type !== 'users'
      ? db.from('quick_facts').select('id, caption, media_url, media_type, created_at, user:user_id(id, username, display_name, avatar, is_private)').ilike('caption', pattern).order('created_at', { ascending: false }).limit(40)
      : { data: [] },
    db.from('hashtags').select('id, tag').ilike('tag', `%${q.replace(/^#/, '').toLowerCase()}%`).limit(8),
    getMe(),
  ]);

  // Engel listesi ile takip durumu birbirinden bağımsız → paralel.
  const targetIds = me && (type === 'users' || type === 'all') ? (usersRes.data ?? []).map((u: any) => u.id) : [];
  const [blocked, followsRes] = await Promise.all([
    // Engellediğim + beni engelleyen kullanıcılar aramada (hem profil hem gönderi) görünmez.
    me ? getBlockedUserIds(me.id) : Promise.resolve(new Set<number>()),
    me && targetIds.length > 0
      ? db.from('follows').select('following_id').eq('follower_id', me.id).in('following_id', targetIds)
      : Promise.resolve({ data: [] as { following_id: number }[] }),
  ]);
  const followingIds = new Set<number>();
  (followsRes.data ?? []).forEach((f: any) => followingIds.add(f.following_id));

  const users = (usersRes.data ?? [])
    .filter((u: any) => !blocked.has(u.id))
    .map((u: any) => ({
      ...u,
      is_following: followingIds.has(u.id),
      is_me: u.id === me?.id,
    }));

  // Gizli hesapların ve engelli kullanıcıların gönderileri arama sonuçlarında gösterilmez.
  const posts = ((postsRes.data ?? []) as any[]).filter((p) => !p.user?.is_private && !blocked.has(p.user?.id)).slice(0, 20);

  return NextResponse.json({ users, posts, hashtags: hashtagsRes.data ?? [] });
}
