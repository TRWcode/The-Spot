import { site } from "@/lib/content";

/**
 * The social links that actually go somewhere.
 *
 * The three entries in `site.socials` started as placeholders pointing at
 * linkedin.com, instagram.com and tiktok.com — the platforms' own front pages.
 * Shipping those is worse than shipping nothing: an icon promises a profile,
 * and a visitor who taps it lands on a login screen having learned nothing
 * about this studio.
 *
 * So a link is only rendered once it has a path. Fill in the real profile URLs
 * in lib/content and all three appear, in the footer, the menu and on /contact
 * at once — no other change needed.
 */
export const socialProfiles = site.socials.filter((s) => {
  try {
    return new URL(s.href).pathname.replace(/\/+$/, "").length > 0;
  } catch {
    return false;
  }
});
