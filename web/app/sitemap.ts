import type { MetadataRoute } from 'next'

import { SITE } from '@/lib/content/site'
import {
  ALTERNATIVE_PAGES,
  BLOG_POSTS,
  COMPARE_PAGES,
  FEATURE_PAGES,
  SOLUTION_PAGES,
  TOOL_PAGES,
  USE_CASE_PAGES,
} from '@/lib/content/pages'

/** Generated from the same registries the pages render from, so it never drifts. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'monthly',
    lastModified: Date = now
  ) => ({ url: `${SITE.url}${path}`, lastModified, changeFrequency, priority })

  return [
    entry('', 1, 'weekly'),
    entry('/pricing', 0.9, 'weekly'),
    entry('/features', 0.8),
    ...FEATURE_PAGES.map((p) => entry(`/features/${p.slug}`, 0.7)),
    entry('/solutions', 0.7),
    ...SOLUTION_PAGES.map((p) => entry(`/solutions/${p.slug}`, 0.6)),
    entry('/use-cases', 0.7),
    ...USE_CASE_PAGES.map((p) => entry(`/use-cases/${p.slug}`, 0.6)),
    entry('/industries', 0.6),
    entry('/integrations', 0.7),
    entry('/mcp-server', 0.6),
    entry('/for-agents', 0.5),
    entry('/compare', 0.7),
    ...COMPARE_PAGES.map((p) => entry(`/compare/${p.slug}`, 0.6)),
    entry('/alternatives', 0.7),
    ...ALTERNATIVE_PAGES.map((p) => entry(`/alternatives/${p.slug}`, 0.6)),
    entry('/tools', 0.8, 'weekly'),
    ...TOOL_PAGES.map((p) => entry(`/tools/${p.slug}`, 0.7, 'weekly')),
    entry('/blog', 0.7, 'weekly'),
    ...BLOG_POSTS.map((p) => entry(`/blog/${p.slug}`, 0.6, 'yearly', new Date(p.date))),
    entry('/about', 0.5),
    entry('/sign-up', 0.5),
    entry('/sign-in', 0.3),
    entry('/privacy', 0.3, 'yearly'),
    entry('/terms', 0.3, 'yearly'),
    entry('/refund', 0.3, 'yearly'),
  ]
}
