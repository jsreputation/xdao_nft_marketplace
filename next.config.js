/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Compress output
  compress: true,
  
  // Optimize images
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud', 'gateway.lighthouse.storage'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'gateway.lighthouse.storage',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year for better caching
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
  
  // Configure security headers and performance optimizations
  async headers() {
    const cspValue = process.env.NODE_ENV === 'development'
      ? // Development: Allow eval for Next.js HMR/Fast Refresh
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.web3modal.org https://*.walletconnect.org; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https: blob:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https://*.web3modal.org https://*.walletconnect.org wss://*.walletconnect.org https://*.ipfs.io https://gateway.pinata.cloud https://gateway.lighthouse.storage https://api.thegraph.com wss://*.thegraph.com; " +
        "frame-src 'self' https://*.web3modal.org; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none'; " +
        "upgrade-insecure-requests;"
      : // Production: Strict CSP without eval
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://*.web3modal.org https://*.walletconnect.org; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https: blob:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https://*.web3modal.org https://*.walletconnect.org wss://*.walletconnect.org https://*.ipfs.io https://gateway.pinata.cloud https://gateway.lighthouse.storage https://api.thegraph.com wss://*.thegraph.com; " +
        "frame-src 'self' https://*.web3modal.org; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-ancestors 'none'; " +
        "upgrade-insecure-requests;";

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
          // Performance: Cache static assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  webpack: (config, { isServer, dev }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Prevent indexedDB from being accessed during SSR
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'idb-keyval': false,
      };
    }
    
    // Optimize bundle size in production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for large libraries
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Separate chunk for wagmi/viem (large libraries)
            wagmi: {
              name: 'wagmi',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](wagmi|viem|@wagmi|@tanstack)[\\/]/,
              priority: 30,
            },
            // Separate chunk for recharts (large chart library)
            recharts: {
              name: 'recharts',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              priority: 30,
            },
            // Apollo Client chunk
            apollo: {
              name: 'apollo',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@apollo[\\/]/,
              priority: 30,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;

