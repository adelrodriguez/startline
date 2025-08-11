import bundleAnalyzer from "@next/bundle-analyzer"
import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})
const withNextIntl = createNextIntlPlugin()

let nextConfig: NextConfig = {
  serverExternalPackages: ["@node-rs/argon2"],
}

nextConfig = withBundleAnalyzer(nextConfig)
nextConfig = withNextIntl(nextConfig)

export default nextConfig
