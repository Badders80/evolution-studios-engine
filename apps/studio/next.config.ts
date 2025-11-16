import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@evolution/ui", "@evolution/brand"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.mistable.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
