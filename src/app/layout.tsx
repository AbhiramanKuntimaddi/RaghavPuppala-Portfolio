import type { Metadata, Viewport } from "next";
import { Archivo, Newsreader } from "next/font/google";
import { DesignLab, type DesignLabConfig } from "design-lab";
import { Cuts } from "@/components/layout/Cuts";
import { Flourishes } from "@/components/layout/Flourishes";
import { OpticalAlign } from "@/components/layout/OpticalAlign";
import { Preloader } from "@/components/layout/Preloader";
import { PRELOADED_KEY } from "@/lib/preloader";
import { schema } from "@/lib/schema";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { site } from "@/content/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic"],
});

// The shared Design Lab (dev only).
const labConfig: DesignLabConfig = {
  fonts: ["sans", "display"],
  labels: { palette: "Colours", sans: "Text", display: "Display type" },
  current: { sans: "Archivo", display: "Archivo (condensed)" },
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.title, template: `%s · ${site.name}` },
  description: site.description,
  keywords: [...site.seo.keywords],
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  category: "finance",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: true, email: true },
  openGraph: {
    title: site.seo.title,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.description },
};

export const viewport: Viewport = {
  themeColor: "#f5b82e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${newsreader.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Before first paint: "motion" hides intro elements; "returning" skips the preloader. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("motion");try{if(sessionStorage.getItem("${PRELOADED_KEY}"))document.documentElement.classList.add("returning")}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Preloader />
        <SmoothScroll>
          {children}
          <Flourishes />
          <OpticalAlign />
          <Cuts />
        </SmoothScroll>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        {process.env.NODE_ENV === "development" && <DesignLab config={labConfig} />}
      </body>
    </html>
  );
}
