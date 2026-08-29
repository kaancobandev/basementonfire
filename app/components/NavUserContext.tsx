'use client';

import { createContext, useContext } from 'react';

// AppShell'in /api/nav-state'ten çektiği kullanıcıyı sayfa istemcilerine dağıtır.
// Amaç: ISR/statik sayfaların (akis, muzik, hashtag) kimlik için sunucuda getMe()
// çağırmak zorunda kalmaması — kimlik zaten istemcide nav için çekiliyor.
// undefined = henüz bilinmiyor (nav-state cevabı gelmedi), null = çıkışlı.
// `isAdmin` yalnız arayüz affordansı (silme düğmesini göster) — yetki değil,
// her yönetici işlemi sunucuda ayrıca doğrulanır. Eski cevaplarda yok → opsiyonel.
export type NavUser = { id: number; username: string; display_name: string; isAdmin?: boolean } | null | undefined;

const NavUserContext = createContext<NavUser>(undefined);

export const NavUserProvider = NavUserContext.Provider;

export function useNavUser(): NavUser {
  return useContext(NavUserContext);
}

// ── Akışın kişisel katı ──
// AppShell `/api/nav-state?feed=1` ile kimlikle AYNI turda çekerse buraya koyar;
// HomeFeed onu görürse kendi isteğini HİÇ atmaz. Görmezse (ör. istemci tarafı
// gezinmeyle /feed'e gelindi, AppShell yeniden fetch etmedi) kendisi çeker.
// undefined = "bu turda gelmedi, sen çek", null = çıkışlı.
const FeedPersonalContext = createContext<any>(undefined);

export const FeedPersonalProvider = FeedPersonalContext.Provider;

export function useFeedPersonal(): any {
  return useContext(FeedPersonalContext);
}
