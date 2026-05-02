import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  basePath: isProd ? "/beshirr.github.io" : "",
  assetPrefix: isProd ? "/beshirr.github.io/" : ""
};

export default nextConfig;