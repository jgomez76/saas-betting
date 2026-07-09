import type { MetadataRoute } from "next";

import { COMPANY } from "@/lib/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: COMPANY.name,

    short_name: COMPANY.name,

    description: COMPANY.slogan,

    start_url: "/",

    display: "standalone",

    background_color: "#FFFFFF",

    theme_color: "#2563EB",

    orientation: "portrait",

    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}