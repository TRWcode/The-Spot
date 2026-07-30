import type { Metadata, Viewport } from "next";
import { generalSans, switzer } from "@/app/fonts";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PlayCursor } from "@/components/ui/PlayCursor";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { site } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

/** Built by scripts/make-og.mjs at the 1.91:1 every platform re-crops to. */
const OG_IMAGE = { url: "/og.jpg", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` };

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description:
    "The SPOT maakt video en social media content die aandacht pakt en blijft plakken. Van particulier tot merk, uit Haarlem.",
  keywords: ["videoproductie", "social media content", "Haarlem", "aftermovie", "bedrijfsvideo", "reels"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: SITE_URL,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: "Video en content die aandacht pakt en blijft plakken. Van particulier tot merk.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: "Video en content die aandacht pakt en blijft plakken.",
    images: [OG_IMAGE.url],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F6F8FA",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl" className={`${generalSans.variable} ${switzer.variable}`}>
      <body className="antialiased">

        <MotionProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-paper focus:px-5 focus:py-3 focus:shadow-lg"
          >
            Naar hoofdinhoud
          </a>

          <PlayCursor />
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
