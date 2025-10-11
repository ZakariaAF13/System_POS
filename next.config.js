/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config) => {
    // Alias server-only deps to false so browser bundle doesn't try to polyfill them
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ws: false,
      'faye-websocket': false,
    };

    // Ignore noisy dynamic require warning from @supabase/realtime-js
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { message: /Critical dependency: the request of a dependency is an expression/ },
    ];

    return config;
  },
};

module.exports = nextConfig;
