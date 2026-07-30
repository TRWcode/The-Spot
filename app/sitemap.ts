import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { legal, work } from "@/lib/content";

/**
 * Derived from the content rather than hand-listed: the four case pages were
 * already live and missing from this file, and any case added later would have
 * been missing too.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...work.items.map((item) => ({
      url: `${SITE_URL}/werk/${item.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    ...legal.map((l) => ({
      url: `${SITE_URL}${l.href}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
