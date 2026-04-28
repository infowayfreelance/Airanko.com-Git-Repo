import type { MetadataRoute } from 'next'

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
  }
}
