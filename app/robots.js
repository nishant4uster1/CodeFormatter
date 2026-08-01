// Next.js App Router automatically serves this at /robots.txt
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

export default function robots() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://codeformatter.online'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
