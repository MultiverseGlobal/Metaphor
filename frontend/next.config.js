/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // Root /dashboard → /overview (the new command deck)
      { source: "/dashboard", destination: "/overview", permanent: true },
      // All old sub-routes
      { source: "/dashboard/overview",     destination: "/overview",     permanent: true },
      { source: "/dashboard/explorer",     destination: "/explorer",     permanent: true },
      { source: "/dashboard/graph",        destination: "/graph",        permanent: true },
      { source: "/dashboard/inbox",        destination: "/inbox",        permanent: true },
      { source: "/dashboard/integrations", destination: "/integrations", permanent: true },
      { source: "/dashboard/pipeline",     destination: "/pipeline",     permanent: true },
      { source: "/dashboard/partitions",   destination: "/partitions",   permanent: true },
      { source: "/dashboard/api",          destination: "/api",          permanent: true },
      { source: "/dashboard/settings",     destination: "/settings",     permanent: true },
      { source: "/dashboard/profile",      destination: "/profile",      permanent: true },
      { source: "/dashboard/identity",     destination: "/identity",     permanent: true },
      { source: "/dashboard/projects",     destination: "/projects",     permanent: true },
      // Catch-all for any other /dashboard/* path
      { source: "/dashboard/:path*",       destination: "/:path*",       permanent: true },
    ];
  },
};

module.exports = nextConfig;
