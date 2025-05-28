/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig);

export default config; 