/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@lens-blog/core", "@lens-blog/adapter-lens", "@lens-blog/theme-default"],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
