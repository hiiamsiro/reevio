import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@reevio/types', '@reevio/config'],
  watchOptions: {
    pollIntervalMs: 3000,
  },
};

export default nextConfig;
