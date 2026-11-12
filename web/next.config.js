/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // El proyecto no tiene ESLint configurado; los tipos sí se validan en el build.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
