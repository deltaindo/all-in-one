import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@delta/database', '@delta/api-lib', '@delta/types'],
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Delta Unified',
  },
};

export default config;
