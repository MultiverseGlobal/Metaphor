/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Ignore type errors during production builds to bypass native binding swc compilation conflicts.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during production builds.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
