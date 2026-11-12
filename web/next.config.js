/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite compilar o levantar un segundo servidor sin pisar la carpeta .next del principal.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  eslint: {
    // El proyecto no tiene ESLint configurado; los tipos sí se validan en el build.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
