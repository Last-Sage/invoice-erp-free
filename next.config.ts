import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Don’t fail production builds on ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don’t fail production builds on type errors
    ignoreBuildErrors: true,
  },
}

export default nextConfig