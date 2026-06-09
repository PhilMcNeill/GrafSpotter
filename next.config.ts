import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow Supabase storage images
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
}

export default nextConfig
