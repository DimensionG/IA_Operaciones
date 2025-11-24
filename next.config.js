/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deshabilitar características experimentales problemáticas
  experimental: {
    serverComponentsExternalPackages: ['@tensorflow/tfjs'],
  },
  
  // Configuración webpack para TensorFlow.js
  webpack: (config, { isServer, dev }) => {
    // TensorFlow.js solo debe ejecutarse en el cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
      };
    }

    // Optimizaciones para producción
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            tfjs: {
              test: /[\\/]node_modules[\\/]@tensorflow[\\/]/,
              name: 'tfjs',
              priority: 40,
              reuseExistingChunk: true,
            },
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 50,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
  
  // Compilador optimizado
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Headers para archivos de modelo
  async headers() {
    return [
      {
        source: '/modelo_(suma|resta)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig