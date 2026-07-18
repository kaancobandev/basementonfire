/**
 * Kimlik doğrulama hata mesajları — KOD tabanlı.
 *
 * İKİ SORUNU BİRDEN ÇÖZER:
 *
 * 1. DİL: Supabase hataları İngilizce döner ("Email not confirmed",
 *    "Invalid login credentials"). Eskiden `?error=${error.message}` ile ham
 *    geçiriliyordu, yani kullanıcı Türkçe bir sitede İngilizce hata okuyordu.
 *
 * 2. İÇERİK ENJEKSİYONU: /login sayfası `?error=` içeriğini olduğu gibi
 *    basıyordu. Saldırgan `/login?error=Hesabınız+askıya+alındı,+doğrulamak+
 *    için+...` gibi bir bağlantı paylaşıp kendi metnini SİTENİN kendi hata
 *    kutusunda gösterebiliyordu (kimlik avı için ikna edici bir zemin).
 *    Artık URL'de yalnızca KOD taşınıyor; metin buradan geliyor. Bilinmeyen
 *    kod → genel mesaj. Saldırganın yazdırabileceği serbest metin kalmadı.
 */

import { MIN_AGE } from './age';

export const AUTH_MESSAGES: Record<string, string> = {
  // Giriş
  eksik:        'E-posta ve şifre gerekli.',
  hatali:       'E-posta veya şifre hatalı.',
  onaysiz:      'E-postanı henüz onaylamadın. Kutunu (ve spam klasörünü) kontrol et.',
  cok_deneme:   'Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.',

  // Kayıt
  kayitli:         'Bu e-posta zaten kayıtlı. Giriş yapmayı dene.',
  zayif_sifre:     'Şifre en az 6 karakter olmalı.',
  gecersiz_eposta: 'Geçerli bir e-posta adresi gir.',
  eksik_alan:      'Tüm alanları doldurun.',
  ad_format:       'Kullanıcı adı 3-30 karakter olmalı; sadece küçük harf, rakam ve alt çizgi (_) içerebilir.',
  ad_alinmis:      'Bu kullanıcı adı zaten alınmış. Başka birini dene.',
  kosullar:        'Devam etmek için Kullanım Koşulları ve Gizlilik Politikasını kabul etmelisin.',
  gecersiz_dogum:  'Geçerli bir doğum tarihi gir.',
  yas_kucuk:       `Kayıt için en az ${MIN_AGE} yaşında olmalısın.`,

  // Şifre sıfırlama
  eposta_gerekli:  'E-posta gerekli.',
  sifirlama_gonderildi: 'Şifre sıfırlama bağlantısı gönderildi. E-postanı kontrol et.',

  // Genel
  bilinmeyen:   'Bir şeyler ters gitti. Lütfen tekrar dene.',
};

/** Kod → Türkçe metin. Bilinmeyen/uydurma kod genel mesaja düşer. */
export function authMessage(code: string | undefined): string | null {
  if (!code) return null;
  return AUTH_MESSAGES[code] ?? AUTH_MESSAGES.bilinmeyen;
}

/**
 * Supabase'in İngilizce hata metnini bizim kodumuza çevirir.
 * Eşleşme bulunamazsa 'bilinmeyen' — ham metin ASLA kullanıcıya gitmez
 * (hem dil hem yukarıdaki enjeksiyon sebebiyle).
 */
export function authCodeFromError(message: string | undefined): string {
  const m = (message ?? '').toLowerCase();
  if (m.includes('email not confirmed'))       return 'onaysiz';
  if (m.includes('invalid login credentials')) return 'hatali';
  if (m.includes('already registered') || m.includes('already been registered')) return 'kayitli';
  if (m.includes('password should be') || m.includes('password is too short'))   return 'zayif_sifre';
  if (m.includes('invalid email') || m.includes('unable to validate email'))     return 'gecersiz_eposta';
  if (m.includes('rate limit') || m.includes('too many'))                        return 'cok_deneme';
  return 'bilinmeyen';
}
