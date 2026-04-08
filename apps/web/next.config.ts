import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@reevio/types', '@reevio/config'],
};

export default nextConfig;
