/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: { 
    unoptimized: true 
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : undefined,
  webpack: (config) => {
    // Exclude docs folder from build
    config.module.rules.push({
      test: /\.(tsx|ts)$/,
      exclude: [/node_modules/, /app\/docs/],
    });
    return config;
  },
};

module.exports = nextConfig;
