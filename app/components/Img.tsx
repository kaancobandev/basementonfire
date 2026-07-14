'use client';

import { cdnUrl, cdnSrcSet } from '@/lib/img';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
  quality?: number;
  /** Sabit boyutlu görseller (ör. avatar) için tek CDN genişliği; srcSet üretilmez. */
  fixedWidth?: number;
};

/**
 * <img> yerine kullan: src'yi Netlify Image CDN'e yönlendirir → otomatik
 * yeniden boyutlandırma + WebP + responsive srcSet. Üretimde aktif, geliştirmede
 * orijinali kullanır. Stil/sınıf/loading vb. aynen aktarılır.
 *
 * Tarayıcının doğru boyutu seçebilmesi için `sizes` vermek önemli
 * (ör. grid hücresi: sizes="(max-width:700px) 33vw, 240px").
 */
export default function Img({ src, quality, fixedWidth, ...rest }: Props) {
  // Not: fetchPriority="high" verildiğinde React 19 SSR'da <link rel=preload
  // as=image imagesrcset ...> etiketini KENDİSİ basar — ayrıca preload çağırmak gereksiz.
  if (fixedWidth) {
    // Sabit ölçülü (avatar gibi) — tek genişlik, responsive srcSet gereksiz
    return <img {...rest} src={cdnUrl(src, fixedWidth, quality)} />;
  }
  return (
    <img
      {...rest}
      src={cdnUrl(src, 1280, quality)}
      srcSet={cdnSrcSet(src, quality)}
    />
  );
}
