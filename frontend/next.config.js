/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/hooks': path.resolve(__dirname, 'hooks'),
      '@/types': path.resolve(__dirname, 'types'),
      '@/app': path.resolve(__dirname, 'app'),
    }
    return config
  },
}

module.exports = nextConfig
