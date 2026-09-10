// Kutlama modalını AÇAN olay — modalın KENDİSİNDEN ayrı bir dosyada.
//
// ⚠ NEDEN AYRI: `ArticleBlocks.tsx` bu fonksiyonu çağırıyor ve o dosyadan
// yapılan HER import 38 makale sayfasının paketine iner (aynı uyarı GSAP için
// de yazılı). `Kutlama.tsx` react-dom/createPortal ve konfeti kütüphanesini
// getiriyor; oysa tetikleyicinin ihtiyacı olan tek şey bir CustomEvent.
// Bu dosyanın hiçbir bağımlılığı yok.
//
// ⚠ ADI `celebrate` DEĞİL: `lib/confetti.ts` zaten `celebrate` export ediyor ve
// o KONFETİ atar, modal AÇMAZ. Aynı ad, import satırına bakmadan ayırt
// edilemez hale getirirdi.

export type KutlamaVerisi = {
  /** Üst satır: "Yeni rozet" / "Seviye atladın" */
  kicker: string;
  emoji: string;
  baslik: string;
  aciklama: string;
};

export const KUTLAMA_OLAYI = 'bof:kutlama';

export function kutlamaAc(v: KutlamaVerisi) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<KutlamaVerisi>(KUTLAMA_OLAYI, { detail: v }));
}
