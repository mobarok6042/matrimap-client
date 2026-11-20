import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "s10.ibb.co" },
      { protocol: "https", hostname: "api.imgbb.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async rewrites() {
    const upstream = process.env.AUTH_UPSTREAM_URL ?? "http://localhost:4000";
    return [
      {
        source: "/api/services/:path*",
        destination: `${upstream}/api/services/:path*`,
      },
      {
        source: "/api/services",
        destination: `${upstream}/api/services`,
      },
      {
        source: "/api/profiles/:path*",
        destination: `${upstream}/api/profiles/:path*`,
      },
      {
        source: "/api/profiles",
        destination: `${upstream}/api/profiles`,
      },
      {
        source: "/api/upload/:path*",
        destination: `${upstream}/api/upload/:path*`,
      },
      {
        source: "/api/upload",
        destination: `${upstream}/api/upload`,
      },
      {
        source: "/api/me",
        destination: `${upstream}/api/me`,
      },
      {
        source: "/api/payments/:path*",
        destination: `${upstream}/api/payments/:path*`,
      },
    ];
  },
};

export default nextConfig;
