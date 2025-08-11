import type { MetadataRoute } from "next"
import { buildBaseUrl } from "~/shared/utils/url"

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
