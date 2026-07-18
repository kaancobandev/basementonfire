'use client';

import { createContext, useContext } from 'react';

// AppShell'in /api/nav-state'ten çektiği kullanıcıyı sayfa istemcilerine dağıtır.
// Amaç: ISR/statik sayfaların (akis, muzik, hashtag) kimlik için sunucuda getMe()
// çağırmak zorunda kalmaması — kimlik zaten istemcide nav için çekiliyor.
// undefined = henüz bilinmiyor (nav-state cevabı gelmedi), null = çıkışlı.
export type NavUser = { id: number; username: string; display_name: string } | null | undefined;

const NavUserContext = createContext<NavUser>(undefined);

export const NavUserProvider = NavUserContext.Provider;

export function useNavUser(): NavUser {
  return useContext(NavUserContext);
}
