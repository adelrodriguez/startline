import { buildBaseUrl } from "@/utils/url"
import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: buildBaseUrl(),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
  ]
}
