import { site } from "@/content/site";

// Structured data for search engines and AI assistants. Only facts that are on the page.
const id = (hash: string) => `${site.url}/#${hash}`;

export const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": id("website"),
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "en-IN",
      publisher: { "@id": id("person") },
    },
    {
      "@type": "Person",
      "@id": id("person"),
      name: site.name,
      url: site.url,
      image: `${site.url}/opengraph-image`,
      jobTitle: site.role,
      description: site.description,
      email: site.contact.email,
      telephone: site.contact.phones.map((p) => p.href.replace("tel:", "")),
      address: {
        "@type": "PostalAddress",
        addressLocality: site.city,
        addressCountry: "IN",
      },
      knowsAbout: [
        "Mutual funds",
        "SIP investing",
        "Insurance",
        "Retirement planning",
        "Child education planning",
      ],
      hasCredential: [
        "MDRT",
        "IRDAI-licensed advisor",
        "AMFI-registered mutual fund distributor",
      ].map((name) => ({
        "@type": "EducationalOccupationalCredential",
        name,
      })),
      sameAs: site.socials.map((s) => s.href),
    },
    {
      "@type": "FinancialService",
      "@id": id("business"),
      name: `${site.name}, ${site.role}`,
      url: site.url,
      image: `${site.url}/opengraph-image`,
      description: site.description,
      founder: { "@id": id("person") },
      email: site.contact.email,
      telephone: site.contact.phones[0].href.replace("tel:", ""),
      address: {
        "@type": "PostalAddress",
        addressLocality: site.city,
        addressRegion: "Telangana",
        addressCountry: "IN",
      },
      geo: { "@type": "GeoCoordinates", ...site.seo.geo },
      areaServed: { "@type": "City", name: site.city },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
      sameAs: site.socials.map((s) => s.href),
      potentialAction: {
        "@type": "ReserveAction",
        name: site.contact.booking.label,
        target: site.contact.booking.href,
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Financial planning",
        itemListElement: [
          ...site.practice.map((p) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: p.title,
              description: p.body,
            },
          })),
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: site.session.name,
              description: `A free, no-obligation 30-minute online session covering ${site.session.covers
                .map((c) => c.title.toLowerCase())
                .join(", ")}.`,
            },
            price: "0",
            priceCurrency: "INR",
          },
        ],
      },
    },
  ],
};
