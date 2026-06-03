'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { celebrate } from '@/lib/confetti';

/**
 * Fires confetti when the URL carries a celebration flag, then strips the flag
 * so a refresh/back-navigation doesn't replay it. Mounted once in the root layout.
 *
 *  - ?welcome=1  → right after registration (big burst)
 *  - ?shared=1   → right after sharing a post
 */
export default function CelebrateOnParam() {
  const params = useSearchParams();

  useEffect(() => {
    const welcome = params.get('welcome');
    const shared = params.get('shared');
    if (!welcome && !shared) return;

    celebrate({ intensity: welcome ? 'big' : 'normal' });

    // Remove the flag from the URL without a full navigation.
    const url = new URL(window.location.href);
    url.searchParams.delete('welcome');
    url.searchParams.delete('shared');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }, [params]);

  return null;
}
