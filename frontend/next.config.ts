import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Contact messaging is paused while its email forwarding function is disabled.
    return [{ source: "/contact", destination: "/", permanent: false }];
  },
};

export default nextConfig;
