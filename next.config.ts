import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"

// import createNextIntlPlugin from "next-intl/plugin"

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})
// const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request")

let nextConfig: NextConfig = {}

nextConfig = withBundleAnalyzer(nextConfig)
// nextConfig = withNextIntl(nextConfig)

export default nextConfig
