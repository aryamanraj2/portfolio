import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Add mini-css-extract-plugin
    config.plugins.push(new MiniCssExtractPlugin());

    // Important: return the modified config
    return config;
  },
}

export default nextConfig
