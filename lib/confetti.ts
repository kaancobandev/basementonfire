// Lightweight wrapper around canvas-confetti for celebratory moments.
// The library is imported dynamically so it never executes during SSR.

type ConfettiFn = typeof import('canvas-confetti');
let confettiPromise: Promise<ConfettiFn> | null = null;
function load() {
  if (!confettiPromise) {
    confettiPromise = import('canvas-confetti').then((m) => (m as unknown as { default: ConfettiFn }).default);
  }
  return confettiPromise;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#d4a564'];

/**
 * Fire a celebratory confetti burst.
 * @param opts.intensity 'big' for major moments (e.g. sign-up), 'normal' otherwise.
 */
export async function celebrate(opts?: { intensity?: 'normal' | 'big' }) {
  if (typeof window === 'undefined') return;
  // Respect users who prefer reduced motion.
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const confetti = await load();
  const big = opts?.intensity === 'big';
  const z = 9999;

  // Center pop.
  confetti({
    particleCount: big ? 160 : 90,
    spread: big ? 110 : 75,
    startVelocity: big ? 55 : 45,
    origin: { y: 0.6 },
    colors: COLORS,
    zIndex: z,
  });

  // Side cannons for a little extra flair.
  const end = Date.now() + (big ? 900 : 550);
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: COLORS, zIndex: z });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: COLORS, zIndex: z });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
