import type { MetadataRoute } from "next";

import { COMPANY } from "@/lib/branding";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: COMPANY.website,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${COMPANY.website}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${COMPANY.website}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },

    {
      url: `${COMPANY.website}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },

    {
      url: `${COMPANY.website}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },

    {
      url: `${COMPANY.website}/cookies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },

    {
      url: `${COMPANY.website}/security`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}