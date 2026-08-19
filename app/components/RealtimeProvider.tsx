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
    //
    // 🔒 FİLTRE YOK, BİLEREK: "benim tüm konuşmalarım" tek bir postgres_changes
    // filtresiyle ifade edilemiyor. GÜVENLİK BURADAKİ if'LERDE DEĞİL, RLS'TE.
    //
    // 19.08.2026'ya kadar öyle DEĞİLDİ ve bu bir gizlilik açığıydı: public
    // şemadaki tabloların hepsinde RLS açık ama POLİTİKA SIFIRDI, ve o durumda
    // realtime satırları süzmeden gönderiyordu. Yani giriş yapmış her kullanıcının
    // tarayıcısı platformdaki TÜM DM'leri alıyordu (content + media_url dâhil);
    // aşağıdaki `convIdsRef` kontrolü onları yalnızca ARAYÜZDE gizliyordu — veri
    // o kontrole gelene kadar çoktan inmiş oluyordu. DevTools yeterliydi.
    //
    // `sql/realtime-rls-sizinti.sql` iki politika ekledi (messages: yalnız
    // konuşma katılımcısı, notifications: yalnız sahibi) ve ölçüldü:
    //   · anon dinleyici test mesajını ARTIK ALMIYOR
    //   · yabancı kullanıcı konuşma 2'nin 2 mesajının 0'ını görüyor, katılımcı 2'sini de
    //
    // ⚠ Aşağıdaki iki `return` artık yalnızca gürültü elemesi. Politikaları
    // kaldırırsan açık GERİ GELİR ve bu satırlar seni korumaz.
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
