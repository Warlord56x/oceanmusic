/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add GLSL file handling
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      exclude: /node_modules/,
      use: ["raw-loader", "glslify-loader"],
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
