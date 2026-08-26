import { oturumParcalari } from './supabase/cookieOptions';

/**
 * Oturum çerezinden auth kimliğini ÇÖZER — istemci tarafı, sıfır ağ turu.
 *
 * `lib/supabase/server.ts` içindeki `cerezdenAuthId()` ile AYNI işi yapar;
 * ikisi de `oturumParcalari()` TEK KAYNAĞINI kullanır. Fark yalnızca çerezi
 * nereden okuduğu (orada `cookies()`, burada `document.cookie`) ve base64
 * çözücü (orada `Buffer`, burada `atob` + `TextDecoder`).
 *
 * ⚠ BU DEĞER YETKİ VERMEZ. İmzası doğrulanmamış bir çerezden okunuyor; yalnızca
 *   "bu sekmedeki kimlik DEĞİŞTİ Mİ?" sorusuna cevap için kullanılır. Sunucu
 *   tarafında her istek `auth.getUser()` ile ayrıca doğrulanır.
 *
 * Dönüş: `'yok'` = oturum çerezi yok · `null` = OKUNAMADI (karar verme) ·
 *        aksi hâlde auth id (uuid).
 */
export function cerezdenKimlik(cerezDizesi?: string): string | null | 'yok' {
  try {
    const ham0 = cerezDizesi ?? (typeof document === 'undefined' ? '' : document.cookie);
    const liste = ham0
      .split('; ')
      .filter(Boolean)
      .map((c) => {
        const i = c.indexOf('=');
        return { name: i < 0 ? c : c.slice(0, i), value: i < 0 ? '' : c.slice(i + 1) };
      });
    const parcalar = oturumParcalari(liste);
    if (!parcalar.length) return 'yok';

    const ham = parcalar.map((c) => c.value).join('');
    let metin: string;
    if (ham.startsWith('base64-')) {
      const b64 = ham.slice(7).replace(/-/g, '+').replace(/_/g, '/');
      const ikili = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
      // ⚠ atob İKİLİ dize döner. Doğrudan JSON.parse edilirse Türkçe karakter
      //   taşıyan her oturum (display_name auth metadata'sında) bozulur ve parse
      //   patlar → bekçi sessizce ölürdü. UTF-8 çözümü ŞART, ölçüldü.
      metin = new TextDecoder().decode(Uint8Array.from(ikili, (ch) => ch.charCodeAt(0)));
    } else {
      try { metin = decodeURIComponent(ham); } catch { metin = ham; }
    }
    const id = (JSON.parse(metin) as { user?: { id?: string } })?.user?.id;
    return typeof id === 'string' && id ? id : null;
  } catch {
    // Çerez yazılırken yakalandıysa (parçalar yarım) çözülemez. `null` = "bilmiyorum":
    // bu turda hiçbir şey yapma, bir sonraki odakta tekrar bak.
    return null;
  }
}
