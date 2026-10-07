import type { Metadata, Viewport } from "next";
import { Archivo, Newsreader } from "next/font/google";
import { Cuts } from "@/components/layout/Cuts";
import { Flourishes } from "@/components/layout/Flourishes";
import { OpticalAlign } from "@/components/layout/OpticalAlign";
import { Preloader } from "@/components/layout/Preloader";
import { PRELOADED_KEY } from "@/lib/preloader";
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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} · ${site.role} in ${site.city}`,
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5b82e",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: site.name,
  description: site.description,
  url: site.url,
  email: site.contact.email,
  telephone: site.contact.phones[0].href.replace("tel:", ""),
  areaServed: site.city,
  address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "IN" },
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${archivo.variable} ${newsreader.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Before first paint: "motion" hides intro elements so they can animate in without
            a flash, and "returning" skips the preloader after its first showing this session. */}
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
