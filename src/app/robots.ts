import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: [
          '/api/',
          '/reza-control/',
        ],
      },
    ],
    sitemap: 'https://rezarefka.web.id/sitemap.xml',
    host: 'https://rezarefka.web.id',
  }
}