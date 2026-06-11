import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow Supabase storage images
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // Increase body size limit for photo uploads (default is 4.5MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

export default nextConfig
