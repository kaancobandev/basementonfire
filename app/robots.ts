import type { MetadataRoute } from 'next';

const SITE_URL = 'https://basementonfire.com';

// Arama motorlarına: herkese açık içeriği tara, özel/uygulama sayfalarını tarama.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/settings',
          '/messages',
          '/notifications',
          '/bookmarks',
          '/gonderi-olustur',
          '/profile',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
