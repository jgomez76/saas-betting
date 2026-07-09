import type { Metadata } from "next";
import { COMPANY } from "./company";

export const BASE_METADATA: Metadata = {
  applicationName: COMPANY.name,

  authors: [
    {
      name: COMPANY.name,
      url: COMPANY.website,
    },
  ],

  creator: COMPANY.name,

  publisher: COMPANY.name,

  metadataBase: new URL(COMPANY.website),

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    siteName: COMPANY.name,
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
  },
};