import type { MetadataRoute } from 'next'

const BASE_URL = 'https://airanko.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Hide unlisted pages from all crawlers — still accessible via direct link.
        disallow: ['/tools-list'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
