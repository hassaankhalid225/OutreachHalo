import type { MetadataRoute } from 'next'

import { SITE } from '@/lib/content/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The authenticated app and API surface have nothing to index and
        // would waste crawl budget on redirects.
        disallow: ['/app/', '/api/', '/onboarding'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
