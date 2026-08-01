/**
 * The canonical origin, in one place.
 *
 * It fed metadataBase, the sitemap and robots.txt as three separate literals,
 * which is exactly the kind of thing that goes out of sync on launch day and
 * points half the site's canonicals at the wrong host.
 *
 * Vercel sets VERCEL_PROJECT_PRODUCTION_URL on every deployment, so preview
 * builds stop advertising themselves as production without anyone remembering
 * to change a constant.
 *
 * The literal is the real domain, so a build without either env var still
 * advertises the right host rather than one nobody owns.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ??
  "https://thespotproducties.nl";
