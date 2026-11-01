import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// One page. Bump `lastModified` when the content changes.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, lastModified: "2026-11-01", changeFrequency: "monthly", priority: 1 }];
}
