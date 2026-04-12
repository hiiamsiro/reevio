import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@reevio/types', '@reevio/config'],
  watchOptions: {
    pollIntervalMs: 1000,
  },
};

export default nextConfig;
