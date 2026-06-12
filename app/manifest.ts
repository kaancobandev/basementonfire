import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Basements — Bilim, Tarih ve Kültür',
    short_name: 'Basements',
    description: 'Bilim, tarih ve kültürü interaktif makaleler ve toplulukla keşfet.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0e0d',
    theme_color: '#0f0e0d',
    lang: 'tr',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
