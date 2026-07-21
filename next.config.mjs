/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer', 'canvas'],
};

export default nextConfig;
