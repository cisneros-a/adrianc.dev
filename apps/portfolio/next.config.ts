import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export (D10): `next build` writes the whole site as plain files to out/.
  output: "export",
  // The built-in image optimizer needs a server, which static export doesn't have (R6).
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
