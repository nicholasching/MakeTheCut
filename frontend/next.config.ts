import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    // @ts-ignore
    return process.env.NODE_ENV == 'development'
        ? [{ source: '/api/:path*', destination: 'http://localhost:3000/:path*' }]
        : [];
  },

};

export default nextConfig;
