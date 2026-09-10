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

// ── Kenar çubuğu enerji kartının verisi ──
// AppShell `/api/nav-state`ten alıp buraya koyar. AYRI bir context, çünkü
// `NavUser` "sen kimsin" sorusunun cevabı; ilerleme ise durum. Aynı nesneye
// tıkıştırılsaydı kimliği tüketen her yüzeyin tipi de değişirdi.
//
// ⚠ Bu veri nav-state'in MEVCUT paralel dalgasından geliyor — ayrı bir istek
// YOK. Ölçüldü: 4 sorgu paralel 87 ms, 3 sorgu + ardışık 1 tane 148 ms.
export type NavIlerleme = {
  xp: number; current_streak: number; longest_streak: number; total_correct: number;
  level: number; intoLevel: number; perLevel: number;
} | null | undefined;

const NavIlerlemeContext = createContext<NavIlerleme>(undefined);

export const NavIlerlemeProvider = NavIlerlemeContext.Provider;

export function useNavIlerleme(): NavIlerleme {
  return useContext(NavIlerlemeContext);
}

/* Günün Sorusu cevaplanınca kenar çubuğundaki kart da dolsun: cevap yanıtı
   yeni ilerlemeyi ZATEN taşıyor, ikinci bir istek atmaya gerek yok. */
export const ILERLEME_OLAYI = 'bof:ilerleme';
export function ilerlemeGuncellendi(p: NonNullable<NavIlerleme>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ILERLEME_OLAYI, { detail: p }));
  }
}
