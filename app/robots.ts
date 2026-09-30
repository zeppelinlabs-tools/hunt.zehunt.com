import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://hunt.zehunt.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/solutions', '/problems/', '/topics/', '/stacks/', '/agents'],
        disallow: ['/admin', '/api/', '/settings/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/api/', '/settings/'],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/admin', '/api/', '/settings/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
