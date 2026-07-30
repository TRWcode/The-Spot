import localFont from "next/font/local";

/**
 * Self-hosted from Fontshare so there is no FOIT/FOUT and no third-party
 * request on first paint. Geometric display + neutral UI companion, both
 * chosen to sit next to the S-mark.
 */

export const generalSans = localFont({
  src: [
    { path: "./fonts/general-sans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/general-sans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/general-sans-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/general-sans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
  fallback: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
  preload: true,
});

/**
 * Not preloaded, on purpose. The LCP element is display type (the header
 * wordmark), so preloading seven faces just made General Sans queue behind
 * body weights. Switzer swaps in from the fallback a moment later, which is
 * invisible in practice and measurably faster.
 */
export const switzer = localFont({
  src: [
    { path: "./fonts/switzer-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/switzer-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
  fallback: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
  preload: false,
  adjustFontFallback: "Arial",
});
