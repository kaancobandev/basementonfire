'use client';

import { useEffect, useRef } from 'react';
import { getSupa } from '@/lib/supabase/client';

interface Props {
  myId: number;
  convIds: number[];
  onNotif: (type: string) => void;
  onMsg: (convId: number) => void;
}

export default function RealtimeProvider({ myId, convIds, onNotif, onMsg }: Props) {
  const convIdsRef = useRef<number[]>(convIds);
  convIdsRef.current = convIds;

  useEffect(() => {
    const supa = getSupa();

    // ── Bildirim kanalı ───────────────────────────────────────────────────────
    const notifCh = supa
      .channel(`notif-user-${myId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${myId}`,
        },
        (payload: any) => {
          onNotif(payload.new?.type ?? '');
        }
      )
      .subscribe();

    // ── Mesaj kanalı — tüm konuşmalar ────────────────────────────────────────
    const msgCh = supa
      .channel(`msg-user-${myId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload: any) => {
          const msg = payload.new;
          // Kendi gönderdiğimiz mesajı say
          if (msg.sender_id === myId) return;
          // Sadece bizim konuşmalarımızdaki mesajları say
          if (!convIdsRef.current.includes(msg.conversation_id)) return;
          onMsg(msg.conversation_id);
        }
      )
      .subscribe();

    return () => {
      supa.removeChannel(notifCh);
      supa.removeChannel(msgCh);
    };
  }, [myId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
