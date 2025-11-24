/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración mínima para evitar errores
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig