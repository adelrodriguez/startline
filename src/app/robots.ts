import type { MetadataRoute } from "next"
import { buildUrl } from "~/shared/utils/url"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/",
    },
    sitemap: buildUrl("/sitemap.xml"),
  }
}
