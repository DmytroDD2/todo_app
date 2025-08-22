/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add explicit path resolution
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(__dirname),
        '@/lib': path.resolve(__dirname, 'lib'),
        '@/components': path.resolve(__dirname, 'components'),
        '@/hooks': path.resolve(__dirname, 'hooks'),
        '@/types': path.resolve(__dirname, 'types'),
        '@/app': path.resolve(__dirname, 'app'),
      },
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Add module resolution
    config.resolve.modules = [
      ...config.resolve.modules,
      path.resolve(__dirname, 'lib'),
      path.resolve(__dirname, 'components'),
      path.resolve(__dirname, 'hooks'),
      path.resolve(__dirname, 'types'),
      path.resolve(__dirname, 'app'),
    ]
    
    return config
  },
}

module.exports = nextConfig
