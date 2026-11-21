/** @type {import('next').NextConfig} */
// www.infinitydigitaldev.com → apex is a 301 in middleware.ts.
// A permanent redirect in this file is a 308, so the host rule lives there.
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

module.exports = nextConfig
