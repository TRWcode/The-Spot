/**
 * Where a nav item actually points from where you are standing.
 *
 * The nav mixes homepage sections (`#werk`) with real pages (`/contact`), and
 * a bare hash is only meaningful on the homepage — from a case page "#werk"
 * resolves to nothing and the click does nothing at all, which is exactly the
 * bug this replaced. Paths are already absolute and pass through untouched.
 */
export function navHref(href: string, onHome: boolean) {
  if (!href.startsWith("#")) return href;
  return onHome ? href : `/${href}`;
}
