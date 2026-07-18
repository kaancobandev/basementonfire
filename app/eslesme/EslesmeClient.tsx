'use client';

import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Img from '@/app/components/Img';
import { celebrate } from '@/lib/confetti';
import { avatarSrc } from '@/lib/avatar';

type Candidate = {
  id: number;
  username: string;
  display_name: string;
  avatar: string;
  bio: string | null;
  interests: string[] | null;
  location: string | null;
  shared: string[];
  age: number | null;
  /** İkinizin de okuduğu/kaydettiği makale başlıkları (en fazla 3). */
  commonArticles?: string[];
};
type MatchUser = { id: number; username: string; display_name: string; avatar: string };
type MatchRow = { id: number | string; conversationId: number | null; user: MatchUser };
type Me = { id: number; username: string; display_name: string; avatar: string; interests: string[] };

// Kart icerigi — hem ust (suruklenebilir) hem arka plan kartlari ayni gorseli kullanir.
function CardInner({ user, myInterests }: { user: Candidate; myInterests: string[] }) {
  const interests = Array.isArray(user.interests) ? user.interests : [];
  return (
    <>
      <div className="match-card-photo">
        <Img src={avatarSrc(user.username, user.avatar)} alt="" fixedWidth={640} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
        <div className="match-card-gradient" />
        <div className="match-card-meta">
          <h3>{user.display_name}{user.age ? <span className="match-card-age">, {user.age}</span> : null}</h3>
          <p className="match-card-username">@{user.username}{user.location ? ` · ${user.location}` : ''}</p>
        </div>
      </div>
      <div className="match-card-body">
        {user.bio ? <p className="match-card-bio">{user.bio}</p> : null}
        {/* Ortak merak — okumak eşleşme kalitesini artıran bir eyleme dönüşür
            ve konuşma açacak somut bir zemin verir. */}
        {(user.commonArticles?.length ?? 0) > 0 && (
          <p className="match-card-common">
            📚 İkiniz de okudunuz: <strong>{user.commonArticles!.join(', ')}</strong>
          </p>
        )}
        {interests.length > 0 && (
          <div className="match-card-tags">
            {interests.map((t) => (
              <span key={t} className={`match-tag${myInterests.includes(t) ? ' shared' : ''}`}>
                {myInterests.includes(t) ? '★ ' : ''}{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

type TopHandle = { swipe: (dir: 'like' | 'pass') => void };

// Ust kart — suruklenebilir. Her aday icin yeniden mount edilir (key=user.id),
// boylece motion degerleri ve "decided" kilidi her kartta sifirdan baslar.
const TopCard = forwardRef<TopHandle, { user: Candidate; myInterests: string[]; onDecide: (dir: 'like' | 'pass', u: Candidate) => void }>(
  function TopCard({ user, myInterests, onDecide }, ref) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-220, 220], [-16, 16]);
    const likeOpacity = useTransform(x, [30, 130], [0, 1]);
    const passOpacity = useTransform(x, [-130, -30], [1, 0]);
    const decided = useRef(false);

    const doSwipe = useCallback((dir: 'like' | 'pass') => {
      if (decided.current) return;          // kart basina tek karar
      decided.current = true;
      animate(x, dir === 'like' ? 720 : -720, {
        duration: 0.32, ease: 'easeOut', onComplete: () => onDecide(dir, user),
      });
    }, [x, onDecide, user]);

    useImperativeHandle(ref, () => ({ swipe: doSwipe }), [doSwipe]);

    return (
      <motion.div
        className="match-card match-card-top"
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        whileTap={{ cursor: 'grabbing' }}
        onDragEnd={(_, info) => {
          const o = info.offset.x, v = info.velocity.x;
          if (o > 110 || v > 600) doSwipe('like');
          else if (o < -110 || v < -600) doSwipe('pass');
          else animate(x, 0, { type: 'spring', stiffness: 320, damping: 32 });
        }}
      >
        <CardInner user={user} myInterests={myInterests} />
        <motion.div className="match-stamp match-stamp-like" style={{ opacity: likeOpacity }}>BEĞEN</motion.div>
        <motion.div className="match-stamp match-stamp-nope" style={{ opacity: passOpacity }}>GEÇ</motion.div>
      </motion.div>
    );
  },
);

export default function EslesmeClient({ me }: { me: Me }) {
  const router = useRouter();
  const [deck, setDeck] = useState<Candidate[]>([]);
  const [pointer, setPointer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [matched, setMatched] = useState<{ user: MatchUser; conversationId: number | null } | null>(null);
  const topRef = useRef<TopHandle>(null);

  const loadDeck = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/match/deck', { cache: 'no-store' });
      const d = await r.json();
      setDeck(Array.isArray(d.deck) ? d.deck : []);
      setPointer(0);
    } catch {
      setDeck([]);
    }
    setLoading(false);
  }, []);

  const loadMatches = useCallback(async () => {
    try {
      const r = await fetch('/api/match/matches', { cache: 'no-store' });
      const d = await r.json();
      setMatches(Array.isArray(d.matches) ? d.matches : []);
    } catch { /* sessiz */ }
  }, []);

  useEffect(() => { loadDeck(); loadMatches(); }, [loadDeck, loadMatches]);

  const recordSwipe = useCallback(async (user: Candidate, dir: 'like' | 'pass') => {
    try {
      const r = await fetch('/api/match/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: user.id, direction: dir }),
      });
      const d = await r.json();
      if (d.match) {
        celebrate({ intensity: 'big' });
        const mu: MatchUser = d.user ?? { id: user.id, username: user.username, display_name: user.display_name, avatar: user.avatar };
        setMatched({ user: mu, conversationId: d.conversationId ?? null });
        setMatches((prev) => prev.some((m) => m.user.id === mu.id) ? prev : [{ id: mu.id, conversationId: d.conversationId ?? null, user: mu }, ...prev]);
      }
    } catch { /* sessiz — kaydirma deneyimi bozulmasin */ }
  }, []);

  const onDecide = useCallback((dir: 'like' | 'pass', user: Candidate) => {
    setPointer((p) => p + 1);
    recordSwipe(user, dir);
  }, [recordSwipe]);

  // Klavye: sol ok = geç, sağ ok = beğen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (matched) return;
      if (e.key === 'ArrowLeft') topRef.current?.swipe('pass');
      else if (e.key === 'ArrowRight') topRef.current?.swipe('like');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [matched]);

  const remaining = deck.slice(pointer);
  const top = remaining[0];
  const exhausted = !loading && !top;

  return (
    <main className="match-page">
      <header className="page-header match-header">
        <span>Eşleştir</span>
        <Link href="/profile" className="match-header-link">İlgi alanların</Link>
      </header>

      {matches.length > 0 && (
        <div className="match-strip" aria-label="Eşleşmelerin">
          {matches.map((m) => (
            <button key={m.user.id} className="match-strip-item" onClick={() => router.push('/messages')} title={m.user.display_name}>
              <span className="match-strip-avatar">
                <Img src={avatarSrc(m.user.username, m.user.avatar)} alt="" fixedWidth={96} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </span>
              <span className="match-strip-name">{m.user.display_name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      )}

      {me.interests.length === 0 && (
        <div className="match-hint">
          Daha isabetli eşleşmeler için <Link href="/profile">ilgi alanlarını ekle</Link> — kartlar ortak ilgilere göre sıralanır.
        </div>
      )}

      <div className="match-stage-wrap">
        {loading ? (
          <div className="match-empty"><div className="match-spinner" /></div>
        ) : exhausted ? (
          <div className="match-empty">
            <div className="match-empty-emoji">🎉</div>
            <h3>Şimdilik bu kadar</h3>
            <p>Yeni insanlar katıldıkça burada görünecek. Daha sonra tekrar uğra.</p>
            <button className="match-btn-refresh" onClick={loadDeck}>Yenile</button>
          </div>
        ) : (
          <>
            <div className="match-stage">
              {/* Arka plan kartlari (statik, hafif kuculmus) */}
              {remaining.slice(1, 3).map((u, i) => {
                const depth = i + 1;
                return (
                  <div
                    key={u.id}
                    className="match-card match-card-bg"
                    style={{ transform: `scale(${1 - depth * 0.045}) translateY(${depth * 14}px)`, zIndex: 10 - depth }}
                    aria-hidden
                  >
                    <CardInner user={u} myInterests={me.interests} />
                  </div>
                );
              })}
              {/* Ust kart */}
              {top && <TopCard key={top.id} ref={topRef} user={top} myInterests={me.interests} onDecide={onDecide} />}
            </div>

            <div className="match-actions">
              <button className="match-action match-action-pass" onClick={() => topRef.current?.swipe('pass')} aria-label="Geç">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
              <button className="match-action match-action-like" onClick={() => topRef.current?.swipe('like')} aria-label="Beğen">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.9-10-9.3C.3 8.4 1.7 5 5 5c2 0 3.2 1.1 4 2.3C9.8 6.1 11 5 13 5c3.3 0 4.7 3.4 3 6.7C19.5 16.1 12 21 12 21z" /></svg>
              </button>
            </div>
          </>
        )}
      </div>

      {matched && (
        <div className="match-modal-overlay" onClick={() => setMatched(null)}>
          <div className="match-modal" onClick={(e) => e.stopPropagation()}>
            <div className="match-modal-title">Eşleştiniz!</div>
            <div className="match-modal-avatars">
              <span className="match-modal-avatar">
                <Img src={avatarSrc(me.username, me.avatar)} alt="" fixedWidth={160} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </span>
              <span className="match-modal-heart">♥</span>
              <span className="match-modal-avatar">
                <Img src={avatarSrc(matched.user.username, matched.user.avatar)} alt="" fixedWidth={160} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </span>
            </div>
            <p className="match-modal-sub">Sen ve <b>{matched.user.display_name}</b> birbirinizi beğendiniz.</p>
            <div className="match-modal-actions">
              <button className="match-modal-btn primary" onClick={() => router.push('/messages')}>Mesaj gönder</button>
              <button className="match-modal-btn" onClick={() => setMatched(null)}>Kaydırmaya devam</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
