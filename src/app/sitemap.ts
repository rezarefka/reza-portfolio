import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rezarefka.web.id'

  const staticPages = [
    '',
    '/about',
    '/work',
    '/blog',
    '/gallery',
    '/contact',
    '/project-demo-unavailable',
  ]

  return staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/blog' ? 'daily' : 'weekly',
    priority:
      route === ''
        ? 1
        : route === '/work'
        ? 0.95
        : route === '/blog'
        ? 0.9
        : 0.8,
  }))
}