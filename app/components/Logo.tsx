'use client';

import Img from './Img';

// Basements işareti — sekiz köşeli ateş yıldızı.
//
// 2026-07-16: elle çizilmiş SVG (iki kırmızı daire + 3 camgöbeği octagram) yerine
// kullanıcının ürettiği gerçek logo geldi. Eskisi orijinalin koddaki taklidiydi
// ("recreated as a scalable SVG") ve app/icon.svg'de ikinci bir kopyası daha vardı;
// ikisi de silindi → tek kaynak artık public/brand/.
//
// ⚠ KAYNAK 512, 2048 DEĞİL: lib/img.ts:27 `if (!isProd() || !eligible(src)) return src`
// → GELİŞTİRMEDE Netlify CDN devre dışı ve orijinal servis edilir. 2048 master
// verilseydi dev'de HER sayfa 1,46 MB indirirdi. Üretimde CDN 72px'e ~2,8 KB'a indirir.
//
// ⚠ width/height NİTELİK olarak veriliyor, CSS'e bırakılmıyor: globals.css:236
// `.sidebar-logo-img` yalnız AppShell'i kapsıyor; HomeFeed.tsx:308 `<Logo size={54} />`
// className'SİZ çağırıyor → ölçü nitelikte olmazsa orada CLS patlar.
//
// ⚠ fixedWidth={size*2}: 2x DPR. srcSet üretmeye gerek yok, ölçü sabit.
//
// BİLİNEN KUSUR (kabul edildi, ölçüldü): işaretin gövdesi koyu kırmızı (rgb(95,11,16));
// kontrastı parlak turuncu UÇLAR taşıyor. Koyu temada (--color-bg #0f1419) 36px'te
// ≥3:1 geçen mürekkep piksel oranı %5,9 (eski işaret %27,9 idi) → gerçek bir gerileme.
// WCAG 1.4.11 logotype'ları kontrast şartından MUAF tutar → uyum ihlali değil, estetik.
// Sidebar'da yanında `<span>Basements</span>` var (AppShell.tsx:140) → kimliği metin
// taşıyor, logo refakatçi. Glow/halo ÖNERİLMEZ: %25 mürekkep kaplamasında 36px'te
// bulanık leke yapar. Gerekirse çözüm ayrı bir koyu-tema varyantıdır.
export default function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <Img
      src="/brand/logo-512.png"
      fixedWidth={size * 2}
      width={size}
      height={size}
      className={className}
      alt="Basements"
      style={{ objectFit: 'contain' }}
    />
  );
}
