'use client';

import Img from '@/app/components/Img';
import MediaCarousel from '@/app/components/MediaCarousel';
import { factMediaList } from '@/lib/types';
import { avatarSrc } from '@/lib/avatar';
import { cdnUrl } from '@/lib/img';

import { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Caption from './Caption';
import Logo from './Logo';
import TimeAgo from './TimeAgo';
import DailyQuestion from './DailyQuestion';
import DidYouKnowCard from './DidYouKnowCard';
import PostPoll from './PostPoll';
import FeedComposer from './FeedComposer';
import ReportButton from './ReportButton';
import { toast } from 'sonner';
import { uploadToStorage } from '@/lib/upload';
import { useMediaDock } from './MediaDock';
import { normalizeStoryLink } from '@/lib/storyLink';
import { ARTICLES } from '@/lib/articles';
import { renderArticleStoryCard } from '@/lib/storyCard';

// Bağlantı alanının önerileri: 32 makale. Serbest yol da yazılabilir (datalist
// kısıtlamaz), ama en sık kullanılacak hedefler elle yazılmadan seçilebilsin.
const articleLinkOptions = ARTICLES.map(a => ({ path: `/articles/${a.slug}`, title: a.title }));
// Kırpıcı yalnız görsel seçilince insin — react-easy-crop akışın ilk yükünde yer almasın.
const ImageCropper = dynamic(() => import('./ImageCropper'), { ssr: false });
import { LazyMotion, m, AnimatePresence } from 'framer-motion';

// framer-motion'un animasyon çekirdeği (domAnimation) async chunk olarak iner:
// senkron bundle'da yalnız minik `m` + LazyMotion kalır (motion importu tüm
// çekirdeği ana sayfa first-load JS'ine gömüyordu). Davranış birebir aynı.
const loadMotionFeatures = () => import('./motionFeatures').then(mod => mod.default);

interface StoryMusic { title: string; artist: string | null; src: string; startSec: number }
// `music` OPSİYONEL: sql/features-story-music.sql çalıştırılana kadar sunucu bu
// alanı hiç göndermez ve görüntüleyici sessizce müziksiz oynatır.
interface StoryItem { id: number; mediaUrl: string; mediaType: string; createdAt: string; music?: StoryMusic | null; linkUrl?: string | null; linkLabel?: string | null; poll?: { question: string; options: string[] } | null; seen?: boolean; }
interface StoryUser { userId: number; username: string; displayName: string; avatar: string | null; stories: StoryItem[]; }
interface SuggestedUser { id: number; username: string; display_name: string; bio: string | null; avatar: string | null; mutual_count: number; }

interface Props {
  feedItems: any[];
  likedFactIds: number[];
  likedPostIds: number[];
  repostedFactIds: number[];
  likedDykIds?: number[];
  suggestedUsers: SuggestedUser[];
  currentUser: { id: number; username: string; display_name: string; avatar: string | null } | null;
  /** Eşleştirme 18+ — sunucuda hesaplanır (ham doğum tarihi istemciye sızmasın). */
  canMatch: boolean;
  ownStoryUser: StoryUser | null;
  otherStoryUsers: StoryUser[];
}

function storyAvatarBg(u: string): string {
  const gs = ['linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f093fb,#f5576c)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#a18cd1,#fbc2eb)','linear-gradient(135deg,#fda085,#f6d365)','linear-gradient(135deg,#96fbc4,#f9f586)'];
  let h = 0; for (const c of u) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return gs[Math.abs(h) % gs.length];
}

// timeAgo BURADAN KALDIRILDI: doğrudan render'a yazılınca sunucu ve istemci
// Date.now()'u farklı anlarda okuyup farklı METİN üretiyordu → hidrasyon
// hatası. Paylaşılan <TimeAgo> bileşeni bunu güvenli yapar.

const HeartFilled = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);
const HeartEmpty = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

export default function HomeFeed({ feedItems: initialItems, likedFactIds, likedPostIds, repostedFactIds, likedDykIds = [], suggestedUsers, currentUser, canMatch, ownStoryUser, otherStoryUsers }: Props) {
  // Feed items + infinite scroll
  const [feedItems, setFeedItems] = useState<any[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialItems.length > 0 ? initialItems[initialItems.length - 1].created_at : null
  );
  const [hasMore, setHasMore] = useState(initialItems.length >= 10);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [likedFacts, setLikedFacts] = useState<Set<number>>(new Set(likedFactIds));
  const [factLikes, setFactLikes] = useState<Record<number, number>>({});
  const [repostedFacts, setRepostedFacts] = useState<Set<number>>(new Set(repostedFactIds));
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set(likedPostIds));
  const [postLikes, setPostLikes] = useState<Record<number, number>>({});
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // Sonsuz kaydırma — birleşik feed
  // ── Akış sekmesi: Herkes | Takip Ettiklerin.
  // follows tablosu baştan beri vardı ama akışta hiç kullanılmıyordu → "takip et"
  // butonunun akışa etkisi yoktu. SSR ilk içerik HER ZAMAN küresel (paylaşımlı
  // önbellek bozulmasın); 'following' seçiliyse istemci mount'ta değiştirir.
  const [tab, setTab] = useState<'all' | 'following'>('all');
  const [tabEmpty, setTabEmpty] = useState<string | null>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const allSnapshot = useRef<{ items: any[]; cursor: string | null; hasMore: boolean } | null>(null);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/feed?type=${tab === 'following' ? 'following' : 'mixed'}&cursor=${encodeURIComponent(nextCursor)}&limit=10`);
      const data = await res.json();
      if (data.posts?.length) {
        setFeedItems(prev => {
          // Tekrar eklemeyi önle
          const existingKeys = new Set(prev.map((i: any) => `${i.kind}-${i.id}`));
          const newItems = data.posts.filter((i: any) => !existingKeys.has(`${i.kind}-${i.id}`));
          return [...prev, ...newItems];
        });
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch {
      // sessiz hata — kullanıcı tekrar scroll edince yeniden dener
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, nextCursor, tab]);

  // Sekme değişimi: 'all' anlık geri döner (SSR anlık görüntüsü saklanır),
  // 'following' ilk açılışta API'den çekilir. Boş sonuçta ŞEFFAF davranış:
  // küresel akışa sessizce düşmek yerine durumu söyleyip seçenek sunuyoruz.
  const switchTab = useCallback(async (next: 'all' | 'following') => {
    if (next === tab) return;
    if (next === 'all') {
      const snap = allSnapshot.current;
      setTab('all'); setTabEmpty(null);
      if (snap) { setFeedItems(snap.items); setNextCursor(snap.cursor); setHasMore(snap.hasMore); }
      try { localStorage.setItem('feedTab', 'all'); } catch {}
      return;
    }
    allSnapshot.current = { items: feedItems, cursor: nextCursor, hasMore };
    setTab('following'); setTabLoading(true); setTabEmpty(null);
    try { localStorage.setItem('feedTab', 'following'); } catch {}
    try {
      const res = await fetch('/api/feed?type=following&limit=10');
      const data = await res.json();
      setFeedItems(data.posts ?? []);
      setNextCursor(data.nextCursor ?? null);
      setHasMore(!!data.hasMore);
      setTabEmpty((data.posts ?? []).length === 0 ? (data.empty ?? 'none') : null);
    } catch {
      setTabEmpty('none');
    } finally {
      setTabLoading(false);
    }
  }, [tab, feedItems, nextCursor, hasMore]);

  // Son seçilen sekmeyi hatırla (girişli kullanıcı için).
  useEffect(() => {
    if (!currentUser) return;
    try { if (localStorage.getItem('feedTab') === 'following') switchTab('following'); } catch {}
    // yalnız mount'ta: switchTab bağımlılığı kasten dışarıda (tek seferlik geri yükleme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '300px' }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  // Story viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [svUserIdx, setSvUserIdx] = useState(0);
  const [svStoryIdx, setSvStoryIdx] = useState(0);
  const svTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const svAudioRef = useRef<HTMLAudioElement | null>(null);
  // Geçerli hikayenin efektif süresi (sn). Foto = 5. Video = metadata gelene kadar
  // geçici 15, sonra Math.min(gerçekSüre, 15). Hem timer'ı hem ilerleme çubuğunu sürer.
  const [svDuration, setSvDuration] = useState(5);
  // Timer ile video 'ended' olayının aynı hikayede iki kez ilerletmesini engeller (her hikayede sıfırlanır).
  const svAdvancedRef = useRef(false);

  // Story create modal
  const [createOpen, setCreateOpen] = useState(false);
  const router = useRouter();
  const dock = useMediaDock();
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyCropFile, setStoryCropFile] = useState<File | null>(null);
  // Hikâye müziği: yalnız `story_approved` işaretli parçalar (telif kapısı,
  // bkz. sql/features-story-music.sql). Liste boşsa seçici hiç görünmez.
  const [storyTracks, setStoryTracks] = useState<{ id: number; title: string; artist: string | null; src: string }[]>([]);
  const [storyMusicId, setStoryMusicId] = useState<number | null>(null);
  const [storyLink, setStoryLink] = useState('');
  const [storyLinkLabel, setStoryLinkLabel] = useState('');
  const [artPicker, setArtPicker] = useState(false); // "makale paylaş" listesi açık mı
  const [artBusy, setArtBusy] = useState('');         // kartı üretilen makale slug'ı
  const [pollOpen, setPollOpen] = useState(false);
  const [pollQ, setPollQ] = useState('');
  const [pollOpts, setPollOpts] = useState<string[]>(['', '']); // 2-4 seçenek

  // Makaleyi hikayeye paylaş: 9:16 kart client'ta üretilir (reel kapağıyla aynı
  // kompozisyon, lib/storyCard.ts) → mevcut hikaye yükleme+POST akışına girer,
  // link otomatik /articles/<slug>'a ayarlanır. Ayrı boru hattı YOK.
  async function shareArticleToStory(slug: string) {
    if (artBusy) return;
    setArtBusy(slug);
    try {
      const blob = await renderArticleStoryCard(slug);
      if (!blob) { toast('Kart oluşturulamadı'); return; }
      applyStoryFile(new File([blob], `makale-${slug}.png`, { type: 'image/png' }));
      setStoryLink(`/articles/${slug}`);
      setStoryLinkLabel('Makaleyi oku');
      setArtPicker(false);
    } catch { toast('Kart oluşturulamadı'); }
    finally { setArtBusy(''); }
  }
  // Aynı doğrulayıcı sunucuda da çalışır; buradaki yalnız anında geri bildirim.
  const linkGecerli = normalizeStoryLink(storyLink) !== null;
  const storyPreviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [storyPreviewUrl, setStoryPreviewUrl] = useState('');
  const [storyError, setStoryError] = useState('');
  const [storySubmitting, setStorySubmitting] = useState(false);

  // Paylaş menüsünden "Hikaye" ile gelince (/?story=1) hikaye oluşturucuyu aç.
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('story') === '1') {
        setCreateOpen(true);
        sp.delete('story');
        const qs = sp.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
      }
    } catch {}
  }, []);

  const allStoryUsers: StoryUser[] = [
    ...(ownStoryUser ? [ownStoryUser] : []),
    ...otherStoryUsers,
  ];

  // Story viewer helpers
  function clearSvTimer() { if (svTimerRef.current) { clearTimeout(svTimerRef.current); svTimerRef.current = null; } }

  function openViewer(userIdx: number) {
    setSvUserIdx(userIdx);
    setSvStoryIdx(0);
    setViewerOpen(true);
    document.body.style.overflow = 'hidden';
  }

  function closeViewer() {
    clearSvTimer();
    setViewerOpen(false);
    document.body.style.overflow = '';
  }

  function advanceStory(dir: 1 | -1) {
    const u = allStoryUsers[svUserIdx];
    const nextStory = svStoryIdx + dir;
    if (nextStory >= 0 && nextStory < u.stories.length) { setSvStoryIdx(nextStory); return; }
    const nextUser = svUserIdx + dir;
    if (nextUser >= 0 && nextUser < allStoryUsers.length) { setSvUserIdx(nextUser); setSvStoryIdx(dir === 1 ? 0 : allStoryUsers[nextUser].stories.length - 1); return; }
    closeViewer();
  }

  // HİKÂYE MÜZİĞİ. Viewer KENDİ <audio>'sunu kullanır; MediaDock'a devretmiyoruz:
  // dock gezinmede yaşar, repeat 'all' varsayılan ve kullanıcının dinlediği listeyi
  // yok ederdi — viewer kapandıktan sonra 5 saniyelik hikâye klibi çalmaya devam
  // ederdi. Dock yalnızca susturulur; viewer kapanınca kullanıcı kaldığı yerden
  // devam ettirebilir (biz onun adına yeniden başlatmıyoruz — istemediği bir sesi
  // aniden açmak, sustuğunu fark etmemesinden daha kötü).
  useEffect(() => {
    const a = svAudioRef.current;
    if (!a) return;
    const müzik = viewerOpen ? allStoryUsers[svUserIdx]?.stories[svStoryIdx]?.music : null;
    if (!müzik) { a.pause(); a.removeAttribute('src'); return; }
    if (dock?.playing) dock.toggle();         // dock çalıyorsa sustur (sağlayıcı yoksa null)
    a.src = müzik.src;
    a.currentTime = müzik.startSec || 0;
    // Otomatik oynatma engeli normaldir (kullanıcı henüz sayfayla etkileşmediyse):
    // hikâye sessiz oynar, hata göstermeyiz.
    a.play().catch(() => {});
    return () => { a.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen, svUserIdx, svStoryIdx]);

  // Otomatik ilerleme (cap timer + video 'ended'): aynı hikayede yalnızca bir kez çalışır.
  function autoAdvance() {
    if (svAdvancedRef.current) return;
    svAdvancedRef.current = true;
    advanceStory(1);
  }

  // Hikaye değişince: çifte-ilerleme kilidini aç ve süreyi sıfırla
  // (foto 5s; video, metadata gelene kadar geçici 15s).
  useEffect(() => {
    if (!viewerOpen) return;
    const s = allStoryUsers[svUserIdx]?.stories[svStoryIdx];
    if (!s) return;
    svAdvancedRef.current = false;
    setSvDuration(s.mediaType === 'video' ? 15 : 5);
  }, [viewerOpen, svUserIdx, svStoryIdx]);

  // ── Hikaye görüntülenme + tepki (2026-07-19) ────────────────────────────
  // Hikaye atan kullanıcı şimdiye kadar hiç geri bildirim almıyordu.
  const [storyViews, setStoryViews] = useState<{ count: number; viewers: { username: string; display_name: string; avatar: string | null }[] } | null>(null);
  const [viewersOpen, setViewersOpen] = useState(false);
  const [reactionSent, setReactionSent] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyFocused, setReplyFocused] = useState(false); // yazarken hikaye ilerlemesin
  const [replySending, setReplySending] = useState(false);
  // Hikaye anketi sonuçları (mevcut çerezsiz oy altyapısı, key='story-<id>').
  const [storyPoll, setStoryPoll] = useState<{ counts: Record<string, number>; total: number; mine: string | null } | null>(null);
  const isOwnStory = !!ownStoryUser && allStoryUsers[svUserIdx]?.userId === ownStoryUser.userId;

  // Hikaye değişince: izleyiciyse görüntülenme beacon'ı, sahibiyse liste çekilir.
  useEffect(() => {
    if (!viewerOpen) return;
    const s = allStoryUsers[svUserIdx]?.stories[svStoryIdx];
    if (!s) return;
    setReactionSent(null);
    setViewersOpen(false);
    setStoryViews(null);
    setReplyText(''); setReplyFocused(false);
    setStoryPoll(null);
    // Anket varsa mevcut dağılımı + kendi oyumu çek (çerezsiz, girişsiz de çalışır).
    if (s.poll) {
      let alive = true;
      fetch(`/api/article-poll/story-${s.id}`)
        .then(r => r.json())
        .then(d => { if (alive && d?.available) setStoryPoll({ counts: d.counts ?? {}, total: d.total ?? 0, mine: d.mine ?? null }); })
        .catch(() => {});
    }
    if (!currentUser) return;
    if (isOwnStory) {
      let alive = true;
      fetch(`/api/stories/${s.id}/view`)
        .then(r => r.json())
        .then(d => { if (alive && d?.available) setStoryViews({ count: d.count ?? 0, viewers: d.viewers ?? [] }); })
        .catch(() => {});
      return () => { alive = false; };
    }
    // Fire-and-forget: sayım hikayeyi izlemeyi bekletmez.
    fetch(`/api/stories/${s.id}/view`, { method: 'POST', keepalive: true }).catch(() => {});
  }, [viewerOpen, svUserIdx, svStoryIdx, currentUser, isOwnStory]);

  async function sendStoryReaction(storyId: number, emoji: string) {
    if (reactionSent) return;
    if (!currentUser) { window.location.href = '/login'; return; }
    setReactionSent(emoji); // optimistik
    try {
      const r = await fetch(`/api/stories/${storyId}/view`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) { setReactionSent(null); toast(d.error ?? 'Tepki gönderilemedi'); return; }
      toast(`${emoji} gönderildi`, { description: 'Tepkin mesaj olarak iletildi.' });
    } catch {
      setReactionSent(null);
    }
  }

  // Serbest metin yanıtı → sahibine DM (tepkiyle AYNI kapıdan: engel + dm_privacy).
  async function sendStoryReply(storyId: number) {
    const text = replyText.trim();
    if (!text || replySending) return;
    if (!currentUser) { window.location.href = '/login'; return; }
    setReplySending(true);
    try {
      const r = await fetch(`/api/stories/${storyId}/view`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) { toast(d.error ?? 'Gönderilemedi'); return; }
      setReplyText('');
      toast('Yanıtın gönderildi', { description: 'Mesaj olarak iletildi.' });
    } catch { toast('Gönderilemedi'); }
    finally { setReplySending(false); }
  }

  // Hikaye anketine oy → mevcut çerezsiz oy ucu (giriş GEREKMEZ). Oy indeks olarak
  // yazılır; sunucu tek-oy'u DB PK'siyle garantiler, dağılımı geri döner.
  async function voteStoryPoll(storyId: number, idx: number) {
    if (storyPoll?.mine != null) return; // zaten oy verdi
    try {
      const r = await fetch(`/api/article-poll/story-${storyId}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: String(idx) }),
      });
      const d = await r.json();
      if (d?.available) setStoryPoll({ counts: d.counts ?? {}, total: d.total ?? 0, mine: d.mine ?? String(idx) });
    } catch { /* sessiz — anket kritik değil */ }
  }

  // svDuration hem ilerleme çubuğunu hem bu timer'ı sürer; metadata süreyi
  // güncelleyince (video) timer yeniden kurulur.
  useEffect(() => {
    if (!viewerOpen || replyFocused) return; // yanıt yazarken hikaye İLERLEMEZ
    const s = allStoryUsers[svUserIdx]?.stories[svStoryIdx];
    if (!s) return;
    clearSvTimer();
    svTimerRef.current = setTimeout(autoAdvance, svDuration * 1000);
    return clearSvTimer;
  }, [viewerOpen, svUserIdx, svStoryIdx, svDuration, replyFocused]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!viewerOpen) return;
      if (e.key === 'ArrowRight') advanceStory(1);
      if (e.key === 'ArrowLeft') advanceStory(-1);
      if (e.key === 'Escape') closeViewer();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewerOpen, svUserIdx, svStoryIdx]);

  // Like handlers
  async function likePost(id: number, kind: 'fact' | 'post') {
    const endpoint = kind === 'fact' ? `/api/quick-facts/${id}/like` : `/api/posts/${id}/like`;
    const res = await fetch(endpoint, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (!res.ok) return;
    const data = await res.json();
    if (kind === 'fact') {
      setLikedFacts(prev => { const n = new Set(prev); data.liked ? n.add(id) : n.delete(id); return n; });
      setFactLikes(prev => ({ ...prev, [id]: data.likes }));
    } else {
      setLikedPosts(prev => { const n = new Set(prev); data.liked ? n.add(id) : n.delete(id); return n; });
      setPostLikes(prev => ({ ...prev, [id]: data.likes }));
    }
  }

  // Repost (yalnızca quick_facts) — optimistik, hata/401'de geri alır
  async function toggleRepost(id: number) {
    if (!currentUser) { window.location.href = '/login'; return; }
    const was = repostedFacts.has(id);
    setRepostedFacts(prev => { const n = new Set(prev); was ? n.delete(id) : n.add(id); return n; });
    const revert = () => setRepostedFacts(prev => { const n = new Set(prev); was ? n.add(id) : n.delete(id); return n; });
    try {
      const res = await fetch(`/api/quick-facts/${id}/repost`, { method: 'POST' });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      if (!res.ok || typeof data.reposted === 'undefined') { revert(); return; }
      setRepostedFacts(prev => { const n = new Set(prev); data.reposted ? n.add(id) : n.delete(id); return n; });
    } catch { revert(); }
  }

  async function followUser(username: string) {
    const res = await fetch(`/api/users/${username}/follow`, { method: 'POST' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (!res.ok) return;
    const data = await res.json();
    setFollowedUsers(prev => { const n = new Set(prev); data.following ? n.add(username) : n.delete(username); return n; });
  }

  // Modal açılınca onaylı parça listesini çek (kapalıyken istek yok).
  useEffect(() => {
    if (!createOpen) return;
    let alive = true;
    fetch('/api/stories/music')
      .then(r => r.json())
      .then(d => { if (alive) setStoryTracks(d.tracks ?? []); })
      .catch(() => { if (alive) setStoryTracks([]); });
    return () => { alive = false; };
  }, [createOpen]);

  // Story create
  function applyStoryFile(file: File) {
    setStoryFile(file);
    setStoryPreviewUrl(URL.createObjectURL(file));
    // Eski hatayı TEMİZLE. Yoksa bir kez "Giriş gerekli" yazdıktan sonra kullanıcı
    // yeniden giriş yapıp modalı tekrar açsa bile o satır ekranda asılı kalıyor ve
    // hâlâ oturum sorunu varmış gibi görünüyordu.
    setStoryError('');
  }

  // Görsel seçilince ÖNCE kırpıcıya uğrar (video doğrudan geçer — bu kırpıcı
  // yalnız görsel işler). 9:16 TEK oran: hikâye zaten dikey tam ekran gösteriliyor,
  // oran seçtirmek kullanıcıyı kadrajı bozacak bir karara sokardı.
  function chooseStoryFile(file: File) {
    if (file.type.startsWith('image/')) setStoryCropFile(file);
    else applyStoryFile(file);
  }

  async function submitStory() {
    if (!storyFile) return;
    setStorySubmitting(true);
    setStoryError('');
    try {
      const { path, mediaType } = await uploadToStorage(storyFile, 'story');
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path, mediaType, musicTrackId: storyMusicId, linkUrl: storyLink, linkLabel: storyLinkLabel,
          // Anket: soru + ≥2 dolu seçenek varsa gönder (sunucu ayrıca doğrular).
          ...(pollQ.trim() && pollOpts.filter(o => o.trim()).length >= 2
            ? { pollQuestion: pollQ.trim(), pollOptions: pollOpts.map(o => o.trim()).filter(Boolean) } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Hata');
      setCreateOpen(false);
      setStoryFile(null);
      setStoryPreviewUrl('');
      setStoryMusicId(null);
      setStoryLink(''); setStoryLinkLabel('');
      setPollOpen(false); setPollQ(''); setPollOpts(['', '']);
      // ŞERİDİ TAZELE. Bu satır olmadan kayıt 201 dönse bile ekranda hiçbir şey
      // değişmiyordu: modal kapanır, şerit aynı kalır, "Ekle" hâlâ kesikli çember
      // olarak durur → kullanıcı yüklemenin başarısız olduğunu sanır. Hikâyeler
      // sunucudan (app/feed/page.tsx) prop olarak geldiği için tazeleme sunucu
      // bileşenini yeniden çalıştırmak demek.
      router.refresh();
    } catch (e: any) {
      // 401'i sessiz bir çıkmaz olarak bırakma: feed'deki diğer tüm işlemler
      // (beğeni, takip) 401'de /login'e yönlendiriyor, yalnız bu akış kırmızı bir
      // satır yazıp bırakıyordu — kullanıcı "giriş yap" görüp ne yapacağını bilemiyordu.
      if (/giriş gerekli/i.test(e?.message ?? '')) { window.location.href = '/login'; return; }
      // Mesajsız istisnada ekranda HİÇBİR ŞEY yazmıyordu (yalnız "Yükleniyor…" sönüyordu).
      setStoryError(e?.message || 'Hikâye paylaşılamadı, tekrar dene.');
    } finally {
      setStorySubmitting(false);
    }
  }

  const currentSvUser = allStoryUsers[svUserIdx];
  const currentSvStory = currentSvUser?.stories[svStoryIdx];

  // "Günün Sorusu" artık en üstte değil, feed'in içinde (4. kartın ardında) —
  // sayfanın daha altında + tembel yüklenir. Feed 4'ten kısaysa son karta düşer.
  const dqSlot = Math.min(3, feedItems.length - 1);

  function svTimeAgo(iso: string) {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return `${s}sn`; if (s < 3600) return `${Math.floor(s / 60)}dk`; return `${Math.floor(s / 3600)}sa`;
  }

  return (
    // strict: motion.* kaçağı derlemede değil çalışmada hata verir — hepsi m.* olmalı
    <LazyMotion features={loadMotionFeatures} strict>
      <main className="main-content">
        {/* Hero banner — yalnızca giriş yapmamış ziyaretçiye (onboarding/tanıtım).
            Giriş yapmış kullanıcı için gereksiz dikey alan işgali → gizli. */}
        {!currentUser && (
          <div style={{ position: 'relative', minHeight: 200, overflow: 'hidden', borderBottom: '1px solid var(--color-border)', background: 'var(--gradient-hero)' }}>
            <div style={{ position: 'absolute', inset: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Logo size={54} />
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>Basements</div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.78)', marginTop: 8, maxWidth: 340 }}>Bilim, tarih ve kültürü interaktif makaleler ve toplulukla keşfet.</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <Link href="/register" style={{ background: '#fff', color: '#1e1b4b', fontWeight: 700, fontSize: '0.85rem', padding: '9px 18px', borderRadius: 'var(--radius-pill)', textDecoration: 'none' }}>Hemen katıl</Link>
                <Link href="/login" style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', padding: '9px 18px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>Giriş yap</Link>
              </div>
              <Link href="/discover" style={{ marginTop: 12, color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', alignSelf: 'flex-start' }}>İçerikleri keşfet — kayıt gerekmez →</Link>
            </div>
          </div>
        )}
        {/* Hero giriş-yapmamışta zaten markayı taşıyor → çift başlık olmasın.
            Giriş yapmışta hero yok, standart sayfa başlığı görünür. */}
        {currentUser && <div className="feed-header">Ana Sayfa</div>}

        {/* Akış sekmeleri — yalnız girişli kullanıcıya (takip grafiği olmayanda anlamsız) */}
        {currentUser && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
            {([['all', 'Herkes'], ['following', 'Takip Ettiklerin']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => switchTab(key)}
                style={{
                  flex: 1, padding: '11px 8px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: '0.88rem',
                  fontWeight: tab === key ? 800 : 600,
                  color: tab === key ? 'var(--color-text)' : 'var(--color-text-muted)',
                  borderBottom: tab === key ? '2px solid var(--color-primary)' : '2px solid transparent',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Story bar */}
        <div className="story-bar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', scrollbarWidth: 'none' }}>
          {currentUser && (
            <button
              className="story-item"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '2px' }}
              onClick={() => {
                if (ownStoryUser) openViewer(0);
                else setCreateOpen(true);
              }}
            >
              <div style={{ width: 60, height: 60, borderRadius: '50%', padding: '2.5px', background: ownStoryUser ? 'var(--gradient-story)' : 'rgba(0,0,0,0.08)', border: ownStoryUser ? 'none' : '2px dashed #ccc', position: 'relative', transition: 'transform 0.15s' }}>
                {currentUser.avatar
                  ? <Img src={currentUser.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
                  : <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem', color: '#fff', background: storyAvatarBg(currentUser.username), border: '2px solid white' }}>
                  {currentUser.display_name[0].toUpperCase()}
                </div>}
                {!ownStoryUser && (
                  <span style={{ position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', lineHeight: 1 }}>+</span>
                )}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', maxWidth: 64, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                {ownStoryUser ? 'Hikayem' : 'Ekle'}
              </span>
            </button>
          )}

          {otherStoryUsers.map((u, i) => (
            <button
              key={u.userId}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '2px' }}
              onClick={() => openViewer(ownStoryUser ? i + 1 : i)}
            >
              <div style={{ width: 60, height: 60, borderRadius: '50%', padding: '2.5px', background: u.stories.every(st => st.seen) ? 'var(--color-border)' : 'var(--gradient-story)', transition: 'transform 0.15s' }}>
                {u.avatar
                  ? <Img src={u.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
                  : <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem', color: '#fff', background: storyAvatarBg(u.username), border: '2px solid white' }}>{u.displayName[0].toUpperCase()}</div>
                }
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', maxWidth: 64, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{u.username}</span>
            </button>
          ))}
        </div>

        {/* Eşleştir — mobil/tablet girişi (masaüstünde sağ panel kartı var; sağ panel <1200px gizli).
            18+ özelliği → yaşı tutmayana hiç gösterilmez (sayfa + API'ler de ayrıca korunuyor). */}
        {canMatch && (
        <Link href="/eslesme" className="match-feed-card">
          <span className="match-feed-card-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.9-10-9.3C.3 8.4 1.7 5 5 5c2 0 3.2 1.1 4 2.3C9.8 6.1 11 5 13 5c3.3 0 4.7 3.4 3 6.7C19.5 16.1 12 21 12 21z"/></svg>
          </span>
          <span className="match-feed-card-text">
            <strong>Eşleştir</strong>
            <span>İlgi alanlarına göre yeni insanlarla tanış</span>
          </span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, opacity: 0.85 }}><path d="m9 18 6-6-6-6"/></svg>
        </Link>
        )}

        {/* Hızlı besteci — metin + isteğe bağlı anket (medyalı gönderi /gonderi-olustur'da) */}
        {currentUser && (
          <FeedComposer
            currentUser={currentUser}
            onPosted={(post) => {
              setFeedItems(prev => [post, ...prev]);
              setTabEmpty(null);
            }}
          />
        )}

        {/* Feed */}
        {tabLoading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--color-text-muted)' }}>Yükleniyor…</div>
        ) : tabEmpty ? (
          // Takip akışı boş — ŞEFFAF geri düşüş: küresel akışa sessizce dönmek
          // yerine durumu söyleyip seçeneği kullanıcıya bırakıyoruz.
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '56px 24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <span style={{ fontSize: '2.2rem' }}>👋</span>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text)' }}>
              {tabEmpty === 'no-follows' ? 'Henüz kimseyi takip etmiyorsun' : 'Takip ettiklerinden yeni içerik yok'}
            </p>
            <p style={{ margin: 0, fontSize: '0.86rem', maxWidth: 320, lineHeight: 1.5 }}>
              {tabEmpty === 'no-follows'
                ? 'Birilerini takip et, akışın onların paylaşımlarıyla dolsun.'
                : 'Takip ettiklerin bir süredir paylaşmamış. Herkes sekmesinde yeni içerikler var.'}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button type="button" onClick={() => switchTab('all')} style={{ padding: '8px 16px', borderRadius: 9999, border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                Herkes akışına dön
              </button>
              <Link href="/discover" style={{ padding: '8px 16px', borderRadius: 9999, border: '1px solid var(--color-border)', color: 'var(--color-text)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
                Kullanıcı keşfet
              </Link>
            </div>
          </div>
        ) : feedItems.length === 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '64px 0', color: 'var(--color-text-muted)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <p>Henüz paylaşım yok.</p>
            </div>
            {/* Feed boşsa da Günün Sorusu kaybolmasın */}
            <DailyQuestion />
          </>
        ) : (
          <div style={{ maxWidth: 470, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40, paddingTop: 16 }}>
            {feedItems.map((item: any, index: number) => {
              const node = (() => {
              // İlk medyalı kart = LCP adayı → eager + fetchpriority=high; gerisi lazy.
              const isFirstMedia = index === feedItems.findIndex((it: any) => it.kind === 'fact');
              if (item.kind === 'dyk') {
                return (
                  <m.div
                    key={`dyk-${item.id}`}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.5), ease: 'easeOut' }}
                  >
                    <DidYouKnowCard item={item} initialLiked={likedDykIds.includes(item.id)} loggedIn={!!currentUser} />
                  </m.div>
                );
              }
              if (item.kind === 'fact') {
                const liked = likedFacts.has(item.id);
                const likes = factLikes[item.id] ?? item.likes;
                const reposted = repostedFacts.has(item.id);
                return (
                  <m.article
                    key={`fact-${item.id}`}
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.5), ease: 'easeOut' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                      <Link href={`/u/${item.username}`} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
                        <Img src={avatarSrc(item.username, item.avatar)} alt="" fixedWidth={76} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Link>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/u/${item.username}`} style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.display_name}</Link>
                        <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>@{item.username} · <TimeAgo iso={item.created_at} /></span>
                      </div>
                      <ReportButton targetType="post" targetId={item.id} subtitle={`@${item.username} gönderisi`} size={32} canReport={!!currentUser && currentUser.id !== item.user_id} />
                    </div>
                    <div style={{ width: '100%', background: '#000', lineHeight: 0 }}>
                      <MediaCarousel media={factMediaList(item)} variant="feed" caption={item.caption ?? ''} sizes="(max-width:620px) 100vw, 600px" priority={isFirstMedia} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px 4px' }}>
                      <m.button
                        onClick={() => likePost(item.id, 'fact')}
                        whileTap={{ scale: 0.80 }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: '9999px', color: liked ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: 600, fontFamily: 'inherit', transition: 'color 0.15s', fontSize: '0.9rem' }}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <m.span key={liked ? 'f' : 'e'} initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} style={{ display: 'flex' }}>
                            {liked ? <HeartFilled /> : <HeartEmpty />}
                          </m.span>
                        </AnimatePresence>
                        <m.span className="tnum" key={likes} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}>{likes}</m.span>
                      </m.button>
                      {/* Yorum butonu YER TUTUCUYDU: /akis'e gidiyordu, yani
                          tıklayan kişi yorumlara değil akış sayfasına düşüyordu.
                          Yorum altyapısının tamamı (ekleme/listeleme/silme +
                          gizlilik kuralları + bildirim) ZATEN vardı; eksik olan
                          yalnızca bu bağlantıydı. /p/[id] akıştan tıklanınca
                          modal olarak açılır (paralel rota) ve yorumları gösterir.
                          aria-label/title: ikon-only buton erişilebilir isimsizdi. */}
                      <Link href={`/p/${item.id}`} aria-label={`Yorumlar${typeof item.comments_count === 'number' ? ` (${item.comments_count})` : ''}`} title="Yorumlar" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: '9999px', color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'background 0.12s' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        {/* Sorguda comments(count) seçilmeyen yüzeylerde undefined
                            gelir → sayaç hiç basılmaz, kart bozulmaz. */}
                        {typeof item.comments_count === 'number' && (
                          <span className="tnum">{item.comments_count}</span>
                        )}
                      </Link>
                      <m.button
                        onClick={() => toggleRepost(item.id)}
                        whileTap={{ scale: 0.80 }}
                        aria-label="Repost"
                        title={reposted ? 'Repost geri al' : 'Repost'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '6px 8px', borderRadius: '9999px', color: reposted ? 'var(--color-success)' : 'var(--color-text)', transition: 'color 0.15s' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 1 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 23-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                      </m.button>
                    </div>
                    <div style={{ padding: '2px 14px 4px' }}>
                      <span className="tnum" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>{likes} beğeni</span>
                    </div>
                    {item.caption && (
                      <div style={{ padding: '2px 14px 14px', fontSize: '0.87rem', lineHeight: 1.5, color: 'var(--color-text)' }}>
                        <Caption
                          text={item.caption}
                          clamp
                          prefix={<Link href={`/u/${item.username}`} style={{ fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none' }}>{item.display_name}</Link>}
                        />
                      </div>
                    )}
                  </m.article>
                );
              }

              // Text post
              const liked = likedPosts.has(item.id);
              const likes = postLikes[item.id] ?? item.likes;
              const catLabel = item.category === 'science' ? 'Bilim' : item.category === 'history' ? 'Tarih' : 'Genel';
              return (
                <m.article
                  key={`post-${item.id}`}
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.5), ease: 'easeOut' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px 0' }}>
                    <Link href={`/u/${item.username}`} style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
                      <Img src={avatarSrc(item.username, item.avatar)} alt="" fixedWidth={76} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/u/${item.username}`} style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none' }}>{item.display_name}</Link>
                      <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>@{item.username} · <TimeAgo iso={item.created_at} /></span>
                    </div>
                    <span style={{ flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px', marginLeft: 'auto', background: item.category === 'science' ? 'rgba(59,130,246,.15)' : item.category === 'history' ? 'rgba(245,158,11,.15)' : 'rgba(100,116,139,.15)', color: item.category === 'science' ? '#3b82f6' : item.category === 'history' ? '#b45309' : '#475569' }}>
                      {catLabel}
                    </span>
                    <ReportButton targetType="post" targetId={item.id} subtitle={`@${item.username} gönderisi`} size={32} canReport={!!currentUser && currentUser.id !== item.user_id} />
                  </div>
                  <div style={{ padding: '12px 16px 4px', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {item.content && <Caption text={item.content} clamp />}
                    {/* Anket (post_polls) — sayımlar istemciden çekilir, feed'in
                        paylaşılan önbelleği kişiselleşmez. */}
                    {Array.isArray(item.poll) && item.poll.length >= 2 && (
                      <PostPoll postId={item.id} options={item.poll} />
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px 12px' }}>
                    <m.button
                      onClick={() => likePost(item.id, 'post')}
                      whileTap={{ scale: 0.80 }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: '9999px', color: liked ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.9rem', transition: 'color 0.15s' }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <m.span key={liked ? 'f' : 'e'} initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.5 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} style={{ display: 'flex' }}>
                          {liked ? <HeartFilled /> : <HeartEmpty />}
                        </m.span>
                      </AnimatePresence>
                      <m.span className="tnum" key={likes} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}>{likes}</m.span>
                    </m.button>
                  </div>
                </m.article>
              );
              })();
              return (
                <Fragment key={`${item.kind}-${item.id}`}>
                  {node}
                  {/* Günün Sorusu feed'in içinde (4. kartın ardında) — tembel yüklenir */}
                  {index === dqSlot && <DailyQuestion />}
                </Fragment>
              );
            })}
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />

        {/* Yükleniyor spinner */}
        {loadingMore && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 40px' }}>
            <div style={{ width: 28, height: 28, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'hf-spin 0.7s linear infinite' }} />
          </div>
        )}

        {/* Bitti mesajı */}
        {!hasMore && feedItems.length > 0 && (
          <p style={{ textAlign: 'center', padding: '20px 0 60px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Tüm gönderiler görüntülendi
          </p>
        )}

        <style>{`@keyframes hf-spin { to { transform: rotate(360deg); } }`}</style>
      </main>

      {/* Right panel */}
      <aside className="right-panel">
        {/* Arama — /discover?q=... (masaüstü sağ panelde; sidebar arama ikonuna ek giriş) */}
        <form action="/discover" method="get" role="search" style={{ position: 'relative' }}>
          <svg aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input name="q" type="search" placeholder="İçeriklerde ara" aria-label="İçeriklerde ara" style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
        </form>
        {/* Eşleştir — ilgi alanı bazlı kart kaydırma girişi (navbar yerine burada). 18+ */}
        {canMatch && (
        <div className="widget-card">
          <h3>Eşleştir</h3>
          <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
            İlgi alanlarına göre yeni insanlarla tanış. Kaydır, beğen, eşleş.
          </p>
          <Link href="/eslesme" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 14px', borderRadius: 12, textDecoration: 'none', color: '#fff', fontWeight: 800, fontSize: '0.9rem', background: 'var(--gradient-match)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.9-10-9.3C.3 8.4 1.7 5 5 5c2 0 3.2 1.1 4 2.3C9.8 6.1 11 5 13 5c3.3 0 4.7 3.4 3 6.7C19.5 16.1 12 21 12 21z"/></svg>
            Eşleşmeye başla
          </Link>
        </div>
        )}
        {currentUser && suggestedUsers.length > 0 && (
          <div className="widget-card">
            <h3>Tanıyor olabilirsin</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {suggestedUsers.map(u => (
                <div key={u.id} className="rp-link" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderRadius: 12 }}>
                  <Link href={`/u/${u.username}`} style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, textDecoration: 'none', overflow: 'hidden' }}>
                    <Img src={avatarSrc(u.username, u.avatar)} alt="" fixedWidth={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/u/${u.username}`} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.display_name}</Link>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>@{u.username}</div>
                    {u.mutual_count > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 1 }}>{u.mutual_count} ortak takipçi</div>}
                  </div>
                  <button
                    onClick={() => followUser(u.username)}
                    style={{ flexShrink: 0, padding: '5px 14px', borderRadius: '9999px', border: '1.5px solid var(--color-text)', background: followedUsers.has(u.username) ? 'var(--color-text)' : 'transparent', color: followedUsers.has(u.username) ? '#fff' : 'var(--color-text)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  >
                    {followedUsers.has(u.username) ? 'Takip Ediliyor' : 'Takip Et'}
                  </button>
                </div>
              ))}
            </div>
            <Link href="/discover" style={{ display: 'block', marginTop: 8, fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none' }}>Daha fazla göster →</Link>
          </div>
        )}
        <div className="widget-card">
          <h3>Keşfet</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/articles/black-hole" className="rp-link" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 12, textDecoration: 'none', color: 'inherit' }}>
              <span style={{ fontSize: '1.5rem' }}>🕳️</span><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kara Delikler</span>
            </Link>
            <Link href="/articles/carthage" className="rp-link" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 12, textDecoration: 'none', color: 'inherit' }}>
              <span style={{ fontSize: '1.5rem' }}>🏛️</span><span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kartaca</span>
            </Link>
          </div>
          {currentUser && (
            <Link href="/bilgi-karti" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, padding: '9px 10px', borderRadius: 12, textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.84rem', border: '1px dashed var(--color-border)' }}>
              💡 Bilgi kartı paylaş
            </Link>
          )}
        </div>
      </aside>

      {/* Story Viewer Modal */}
      {viewerOpen && currentSvUser && currentSvStory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) closeViewer(); }}>
          {/* Bulanık arka plan: blur(30px) altında ezildiğinden ham orijinal yerine
              küçük CDN türevi yeter — aynı görselin tam boy kopyası ikinci kez inmez. */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: currentSvStory.mediaType === 'image' ? `url(${cdnUrl(currentSvStory.mediaUrl, 320, 45)})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px) brightness(0.3)', transform: 'scale(1.1)', transition: 'background-image 0.3s' }} />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 'min(440px, calc(96vh * 9 / 16))', maxHeight: '96vh', aspectRatio: '9 / 16', display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
            {/* Top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '10px 12px 8px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {currentSvUser.stories.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '2.5px', borderRadius: '9999px', background: i < svStoryIdx ? '#fff' : 'rgba(255,255,255,0.3)', overflow: 'hidden', position: 'relative' }}>
                    {i === svStoryIdx && (
                      <div key={svDuration} style={{ position: 'absolute', inset: 0, background: '#fff', transformOrigin: 'left', animation: `sv-progress ${svDuration}s linear forwards`, animationPlayState: replyFocused ? 'paused' : 'running' }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#fff', overflow: 'hidden' }}>
                  {currentSvUser.avatar ? <Img src={currentSvUser.avatar} alt="" fixedWidth={128} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : currentSvUser.displayName[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{currentSvUser.displayName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{svTimeAgo(currentSvStory.createdAt)}</div>
                </div>
                <button onClick={closeViewer} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: '50%', color: 'white' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            {/* Media */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', overflow: 'hidden' }}>
              {currentSvStory.mediaType === 'video'
                ? <video
                    key={currentSvStory.mediaUrl}
                    src={currentSvStory.mediaUrl}
                    autoPlay muted playsInline
                    onLoadedMetadata={e => { const d = e.currentTarget.duration; if (Number.isFinite(d) && d > 0) setSvDuration(Math.min(d, 15)); }}
                    onEnded={autoAdvance}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                : <Img key={currentSvStory.mediaUrl} src={currentSvStory.mediaUrl} alt="" sizes="(max-width:520px) 100vw, 460px" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              }
            </div>
            {/* Touch zones — klavye/ekran-okuyucu için <button> + aria-label.
                Alt şerit (tepki/görüntülenme) dokunma alanının DIŞINDA kalsın
                diye bottom değeri şerit yüksekliği kadar yukarıdan başlar. */}
            <button type="button" aria-label="Önceki hikaye" onClick={() => advanceStory(-1)} style={{ position: 'absolute', top: 60, bottom: 56, left: 0, width: '40%', cursor: 'pointer', zIndex: 5, background: 'none', border: 'none', padding: 0 }} />
            <button type="button" aria-label="Sonraki hikaye" onClick={() => advanceStory(1)} style={{ position: 'absolute', top: 60, bottom: 56, right: 0, width: '40%', cursor: 'pointer', zIndex: 5, background: 'none', border: 'none', padding: 0 }} />

            {/* Alt şerit: SAHİBİ görüntülenme sayısını görür, İZLEYİCİ tepki verir.
                Hikaye atan kullanıcı şimdiye kadar sıfır geri bildirim alıyordu. */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 8, padding: '10px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', minHeight: 56 }}>
              {isOwnStory ? (
                <button
                  type="button"
                  onClick={() => setViewersOpen(v => !v)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.14)', border: 'none', borderRadius: 9999, padding: '7px 14px', color: '#fff', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  👁 {storyViews?.count ?? 0} kişi gördü
                </button>
              ) : (
                // İZLEYİCİ: emoji tepkisi + serbest metin yanıtı. İkisi de aynı DM
                // kapısından geçer (PUT /view). Yazarken hikaye duraklar (replyFocused).
                <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {['❤️', '🔥', '😮', '👏', '😂'].map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => sendStoryReaction(currentSvStory.id, em)}
                        disabled={reactionSent !== null}
                        aria-label={`${em} tepkisi gönder`}
                        style={{ background: reactionSent === em ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: '1.15rem', cursor: reactionSent ? 'default' : 'pointer', lineHeight: 1 }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                  <form
                    onSubmit={e => { e.preventDefault(); sendStoryReply(currentSvStory.id); }}
                    style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                  >
                    <input
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onFocus={() => setReplyFocused(true)}
                      onBlur={() => setReplyFocused(false)}
                      placeholder="Yanıt gönder…"
                      maxLength={1000}
                      style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 9999, padding: '10px 16px', color: '#fff', fontFamily: 'inherit', fontSize: '0.86rem', outline: 'none' }}
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || replySending}
                      style={{ flexShrink: 0, background: replyText.trim() ? '#fff' : 'rgba(255,255,255,0.25)', color: '#111', border: 'none', borderRadius: 9999, padding: '10px 16px', fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 700, cursor: replyText.trim() && !replySending ? 'pointer' : 'default' }}
                    >
                      {replySending ? '…' : 'Gönder'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Görüntüleyen listesi (yalnız sahibine) */}
            {isOwnStory && viewersOpen && (
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, zIndex: 9, maxHeight: '45%', overflowY: 'auto', background: 'rgba(0,0,0,0.85)', padding: '10px 14px' }}>
                {(storyViews?.viewers ?? []).length === 0 ? (
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', textAlign: 'center' }}>Henüz kimse görmedi.</p>
                ) : (
                  (storyViews?.viewers ?? []).map(v => (
                    <div key={v.username} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0' }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        <Img src={avatarSrc(v.username, v.avatar)} alt="" fixedWidth={56} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </span>
                      <span style={{ color: '#fff', fontSize: '0.84rem', fontWeight: 600 }}>{v.display_name}</span>
                      <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>@{v.username}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* ANKET STICKER'I — dokunma bölgelerinin (ileri/geri) ÜSTÜNDE (zIndex 7),
              yoksa seçeneğe basınca hikâye ilerler, oy hiç gitmezdi. Oy verilene
              kadar buton, sonrası dolan çubuk + yüzde. */}
          {currentSvStory?.poll && (
            <div style={{ position: 'absolute', left: '50%', top: '26%', transform: 'translateX(-50%)', width: '82%', maxWidth: 360, zIndex: 7,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', borderRadius: 16, padding: '14px 14px 12px', boxShadow: '0 6px 24px rgba(0,0,0,0.4)' }}>
              <p style={{ margin: '0 0 10px', color: '#fff', fontWeight: 700, fontSize: '0.92rem', textAlign: 'center' }}>{currentSvStory.poll.question}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {currentSvStory.poll.options.map((opt, i) => {
                  const voted = storyPoll?.mine != null;
                  const count = storyPoll?.counts?.[String(i)] ?? 0;
                  const pct = storyPoll && storyPoll.total > 0 ? Math.round((count / storyPoll.total) * 100) : 0;
                  const mine = storyPoll?.mine === String(i);
                  return (
                    <button key={i} type="button" disabled={voted}
                      onClick={() => voteStoryPoll(currentSvStory.id, i)}
                      style={{ position: 'relative', overflow: 'hidden', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10,
                        border: mine ? '2px solid #fff' : '1px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.12)', color: '#fff',
                        fontFamily: 'inherit', fontSize: '0.86rem', fontWeight: 600, cursor: voted ? 'default' : 'pointer' }}>
                      {voted && <span style={{ position: 'absolute', inset: 0, background: mine ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.16)', width: `${pct}%`, transition: 'width 0.4s' }} />}
                      <span style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt}</span>
                        {voted && <span style={{ flexShrink: 0, fontWeight: 800 }}>%{pct}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
              {storyPoll?.mine != null && <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', textAlign: 'center' }}>{storyPoll.total} oy</p>}
            </div>
          )}
          {/* BAĞLANTI ROZETİ — hikâyenin tek ölçülebilir çıkışı. Alt ortada,
              dokunma bölgelerinin (ileri/geri) ÜSTÜNDE bir katmanda duruyor;
              yoksa üstüne basınca hikâye ilerler, bağlantı hiç açılmazdı. */}
          {currentSvStory?.linkUrl && (
            <Link
              href={currentSvStory.linkUrl}
              onClick={() => closeViewer()}
              style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: currentSvStory?.music ? 100 : 62,
                zIndex: 7, display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
                background: 'rgba(255,255,255,0.94)', color: '#111', borderRadius: 9999, padding: '9px 16px',
                fontSize: '0.82rem', fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.35)', whiteSpace: 'nowrap', maxWidth: '80%' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSvStory.linkLabel || 'Görüntüle'}</span>
            </Link>
          )}
          {/* Hikâye müziği. Viewer'a ait, dock'tan bağımsız (bkz. yukarıdaki efekt). */}
          <audio ref={svAudioRef} hidden />
          {currentSvStory?.music && (
            <div style={{ position: 'absolute', left: 12, right: 12, bottom: 62, display: 'flex', alignItems: 'center', gap: 7, zIndex: 6,
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', borderRadius: 9999, padding: '6px 12px', pointerEvents: 'none' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              <span style={{ color: '#fff', fontSize: '0.74rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentSvStory.music.title}{currentSvStory.music.artist ? ` · ${currentSvStory.music.artist}` : ''}
              </span>
            </div>
          )}
          <style>{`@keyframes sv-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
        </div>
      )}

      {/* Hikâye kırpıcısı — zIndex 600: oluşturma modalı ve görüntüleyici 500'de.
          Varsayılan 300 ile açsaydık modalın ALTINDA kalır, kullanıcı "dosya
          seçtim ama bir şey olmadı" derdi (bu, bildirilen şikâyetin tarifiyle
          birebir aynı görünürdü). Tek oran 9:16 — hikâye dikey tam ekran. */}
      {storyCropFile && (
        <ImageCropper
          file={storyCropFile}
          aspects={[{ label: 'Hikâye 9:16', value: 9 / 16 }]}
          defaultAspect={9 / 16}
          zIndex={600}
          onCancel={() => setStoryCropFile(null)}
          onCropped={f => { setStoryCropFile(null); applyStoryFile(f); }}
        />
      )}

      {/* Story Create Modal */}
      {createOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) { setCreateOpen(false); setStoryFile(null); setStoryPreviewUrl(''); setStoryError(''); setArtPicker(false); storyPreviewAudioRef.current?.pause(); } }}>
          <div style={{ background: '#1a1510', borderRadius: 20, width: '100%', maxWidth: 400, padding: 20, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontWeight: 700, fontSize: '1rem', color: '#e8e0d8' }}>
              <span>Yeni Hikaye</span>
              <button onClick={() => { setCreateOpen(false); setStoryFile(null); setStoryPreviewUrl(''); setStoryError(''); setArtPicker(false); storyPreviewAudioRef.current?.pause(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: '#aaa' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div
              role="button"
              tabIndex={0}
              aria-label="Fotoğraf veya video seç"
              style={{ border: '2px dashed rgba(255,255,255,0.15)', borderRadius: 16, width: '100%', maxWidth: 'calc(50vh * 9 / 16)', aspectRatio: '9 / 16', maxHeight: '50vh', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', overflow: 'hidden', position: 'relative', color: '#ccc', transition: 'border-color 0.2s' }}
              onClick={() => document.getElementById('story-file-input')?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById('story-file-input')?.click(); } }}
            >
              {storyPreviewUrl ? (
                storyFile?.type.startsWith('video/') ? <video src={storyPreviewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls /> : <img src={storyPreviewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>Fotoğraf veya video seç</p>
                  <p style={{ fontSize: '0.8rem', color: '#888' }}>Tıkla · Max 50MB</p>
                </div>
              )}
            </div>
            <input id="story-file-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,video/mp4,video/webm,video/quicktime" hidden onChange={e => { const f = e.target.files?.[0]; if (f) chooseStoryFile(f); e.target.value = ''; }} />

            {/* MAKALEYİ HİKAYENE PAYLAŞ — dosya seçilmemişken. Bir makale seçince
                9:16 kartı üretilir (reel kapağıyla aynı), dosya olarak yüklenir ve
                link otomatik makaleye ayarlanır → hikayen makaleye trafik çeker. */}
            {!storyFile && (
              <div style={{ marginTop: 12 }}>
                {!artPicker ? (
                  <button type="button" onClick={() => setArtPicker(true)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#cfe3f2', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    veya bir makaleyi paylaş
                  </button>
                ) : (
                  <div style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ color: '#b9ada0', fontSize: '0.8rem', fontWeight: 700 }}>Makale seç</span>
                      <button type="button" onClick={() => setArtPicker(false)} style={{ background: 'none', border: 'none', color: '#8a7f74', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>vazgeç</button>
                    </div>
                    <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                      {ARTICLES.map(a => (
                        <button key={a.slug} type="button" onClick={() => shareArticleToStory(a.slug)} disabled={!!artBusy}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e8e0d8', cursor: artBusy ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                          <span style={{ fontSize: '1.1rem', width: 22, flexShrink: 0 }}>{a.emoji}</span>
                          <span style={{ flex: 1, minWidth: 0, fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</span>
                          {artBusy === a.slug && <span style={{ fontSize: '0.75rem', color: '#8a7f74' }}>hazırlanıyor…</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* MÜZİK SEÇİCİ — yalnız onaylı parçalar. Liste boşsa (SQL çalışmadıysa
                ya da hiçbir parça onaylanmadıysa) bölüm hiç görünmez, hikâye
                paylaşımı müziksiz aynen çalışır. */}
            {storyTracks.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b9ada0" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  <span style={{ color: '#b9ada0', fontSize: '0.8rem', fontWeight: 700 }}>Müzik ekle</span>
                  {storyMusicId !== null && (
                    <button type="button" onClick={() => { setStoryMusicId(null); storyPreviewAudioRef.current?.pause(); }}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#8a7f74', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
                      Kaldır
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {storyTracks.map(t => {
                    const secili = storyMusicId === t.id;
                    return (
                      <button key={t.id} type="button"
                        onClick={() => {
                          // Seçince kısa bir ön dinleme çal — hangi parça olduğunu
                          // duymadan seçmek kör bir karar olurdu.
                          const a = storyPreviewAudioRef.current;
                          if (secili) { setStoryMusicId(null); a?.pause(); return; }
                          setStoryMusicId(t.id);
                          if (a) { a.src = t.src; a.currentTime = 0; a.play().catch(() => {}); }
                        }}
                        style={{ flex: '0 0 auto', maxWidth: 150, textAlign: 'left', padding: '8px 10px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                          border: secili ? '2px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.14)',
                          background: secili ? 'rgba(255,255,255,0.08)' : 'transparent', color: '#e8e0d8' }}>
                        <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                        {t.artist && <span style={{ display: 'block', fontSize: '0.7rem', color: '#9d9086', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.artist}</span>}
                      </button>
                    );
                  })}
                </div>
                {/* Ön dinleme yalnız bu modalda yaşar; kapanınca durur. */}
                <audio ref={storyPreviewAudioRef} hidden />
              </div>
            )}
            {/* BAĞLANTI STICKER'I — hikâye şu ana kadar kapalı devreydi: izlenir,
                biter, siteye hiçbir yere götürmezdi. Yalnız SİTE İÇİ yol kabul
                edilir (lib/storyLink.ts); dışarı açık yönlendirme riski sıfır. */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b9ada0" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span style={{ color: '#b9ada0', fontSize: '0.8rem', fontWeight: 700 }}>Bağlantı ekle</span>
                <span style={{ color: '#7d7268', fontSize: '0.7rem' }}>site içi</span>
              </div>
              <input
                list="story-link-suggestions"
                value={storyLink}
                onChange={e => setStoryLink(e.target.value)}
                placeholder="/articles/rome"
                inputMode="url"
                style={{ width: '100%', padding: '9px 11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: '#e8e0d8', fontFamily: 'inherit', fontSize: '0.85rem' }}
              />
              <datalist id="story-link-suggestions">
                {articleLinkOptions.map(a => <option key={a.path} value={a.path}>{a.title}</option>)}
              </datalist>
              {storyLink.trim() !== '' && !linkGecerli && (
                <p style={{ color: '#f59e0b', fontSize: '0.75rem', margin: '6px 0 0' }}>
                  Yalnızca site içi bir yol olabilir; “/” ile başlamalı (ör. /articles/rome).
                </p>
              )}
              {linkGecerli && (
                <input
                  value={storyLinkLabel}
                  onChange={e => setStoryLinkLabel(e.target.value)}
                  placeholder="Düğme yazısı (ör. Makaleyi oku)"
                  maxLength={40}
                  style={{ width: '100%', marginTop: 8, padding: '9px 11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: '#e8e0d8', fontFamily: 'inherit', fontSize: '0.85rem' }}
                />
              )}
            </div>

            {/* ANKET STICKER'I — soru + 2-4 seçenek. İzleyen hikayede dokunup oy
                verir, sonucu görür. Oylar mevcut çerezsiz altyapıdan (article_poll_votes,
                key='story-<id>'). SQL çalışmadıysa sunucu anketi sessizce düşürür. */}
            <div style={{ marginTop: 14 }}>
              {!pollOpen ? (
                <button type="button" onClick={() => setPollOpen(true)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#cfe3f2', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="14" y="6" width="3" height="11"/></svg>
                  Anket ekle
                </button>
              ) : (
                <div style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#b9ada0', fontSize: '0.8rem', fontWeight: 700 }}>Anket</span>
                    <button type="button" onClick={() => { setPollOpen(false); setPollQ(''); setPollOpts(['', '']); }} style={{ background: 'none', border: 'none', color: '#8a7f74', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>kaldır</button>
                  </div>
                  <input value={pollQ} onChange={e => setPollQ(e.target.value)} placeholder="Soru (ör. Sence hangisi doğru?)" maxLength={100}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: '#e8e0d8', fontFamily: 'inherit', fontSize: '0.85rem' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {pollOpts.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input value={opt} onChange={e => setPollOpts(prev => prev.map((o, j) => j === i ? e.target.value : o))} placeholder={`Seçenek ${i + 1}`} maxLength={60}
                          style={{ flex: 1, minWidth: 0, padding: '8px 11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', background: 'transparent', color: '#e8e0d8', fontFamily: 'inherit', fontSize: '0.84rem' }} />
                        {pollOpts.length > 2 && (
                          <button type="button" onClick={() => setPollOpts(prev => prev.filter((_, j) => j !== i))} aria-label="Seçeneği kaldır"
                            style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#c88', cursor: 'pointer' }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pollOpts.length < 4 && (
                    <button type="button" onClick={() => setPollOpts(prev => [...prev, ''])}
                      style={{ marginTop: 8, background: 'none', border: 'none', color: '#8fa9ff', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>+ seçenek ekle</button>
                  )}
                </div>
              )}
            </div>

            {storyError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '8px 0 0' }}>{storyError}</p>}
            <button disabled={!storyFile || storySubmitting} onClick={submitStory} style={{ width: '100%', marginTop: 14, padding: 12, border: 'none', borderRadius: '9999px', background: 'var(--color-accent)', color: '#0f0e0d', fontWeight: 700, fontSize: '0.95rem', cursor: storyFile ? 'pointer' : 'not-allowed', opacity: storyFile ? 1 : 0.4 }}>
              {storySubmitting ? 'Yükleniyor…' : 'Hikayeyi Paylaş'}
            </button>
          </div>
        </div>
      )}
    </LazyMotion>
  );
}
