/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
  },
  webpack: (config) => {
    // Add support for importing from 'client' directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@client': require('path').resolve(__dirname, './client/src'),
      '@shared': require('path').resolve(__dirname, './shared'),
      '@assets': require('path').resolve(__dirname, './attached_assets'),
    };
    return config;
  },
  // Configure redirects to maintain compatibility with the current structure
  async redirects() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
        permanent: true,
      },
    ];
  },
  // Add image domains for DALL-E generated images
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net', 'placehold.co'],
  },
};

module.exports = nextConfig;