import type { NextConfig } from 'next'

function cloudFromUrl(url?: string) {
  if (!url) return ''
  const m = url.match(/@([^/?#]+)/)
  return m ? m[1] : ''
}

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  cloudFromUrl(process.env.CLOUDINARY_URL)

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  poweredByHeader: false,
  env: { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: cloudName },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  serverExternalPackages: ['mongoose'],
  async headers() {
    return [
      {
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default nextConfig
