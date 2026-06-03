'use client';

import { ReactLenis } from 'lenis/react';
import type { ReactNode } from 'react';

/**
 * Global Lenis smooth-scroll provider.
 *
 * - `root` binds Lenis to the window (this app scrolls on body/window, the
 *   sidebar is position:sticky), and renders children with no extra wrapper.
 * - `allowNestedScroll` keeps independently-scrollable areas (modals, the
 *   messages thread, comment lists with overflow:auto) scrolling natively
 *   instead of being hijacked by the page scroll.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        smoothWheel: true,
        allowNestedScroll: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
