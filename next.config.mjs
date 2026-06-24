const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' blob: https://*.supabase.co wss://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
].join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  async redirects() {
    return [
      // Redirect www → non-www (permanent 301)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.rezarefka.web.id' }],
        destination: 'https://rezarefka.web.id/:path*',
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
        ],
      },
      // Sub-pages: noindex + noimageindex via X-Robots-Tag
      // noimageindex → Google Images tidak akan mengindeks gambar dari halaman ini
      {
        source: '/project/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noimageindex' }],
      },
      {
        source: '/blog/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noimageindex' }],
      },
      {
        source: '/certificate/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noimageindex' }],
      },
      {
        source: '/work/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noimageindex' }],
      },
      {
        source: '/gallery/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noimageindex' }],
      },
      {
        source: '/about',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noimageindex' }],
      },
      {
        source: '/contact',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noimageindex' }],
      },
      {
        source: '/jurnal/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noimageindex' }],
      },
    ]
  },

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},
}

export default nextConfig
