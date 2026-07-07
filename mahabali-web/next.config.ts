import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
  // @ts-expect-error - Some versions type this differently or strictly
  allowedDevOrigins: ["192.168.0.100", "localhost"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
