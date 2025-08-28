/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for Tauri desktop app
  trailingSlash: true,
  images: { 
    unoptimized: true 
  },
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
