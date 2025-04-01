/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net', 'placehold.co'],
    unoptimized: true,
  },
  experimental: {
    esmExternals: true,
  },
  webpack: (config) => {
    // Add support for importing from directories
    config.resolve.alias = {
      ...config.resolve.alias,
      '@client': require('path').resolve(__dirname, './client/src'),
      '@shared': require('path').resolve(__dirname, './shared'),
      '@assets': require('path').resolve(__dirname, './attached_assets'),
    };
    return config;
  },
  trailingSlash: true,
  output: 'export',
}

export default nextConfig;