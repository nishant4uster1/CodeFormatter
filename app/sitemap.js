// Next.js App Router automatically serves this at /sitemap.xml
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codeformatter.online'
  const now = new Date()

  const routes = ['', '/privacy', '/cookies']

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'yearly',
    priority: route === '' ? 1.0 : 0.5,
  }))
}
