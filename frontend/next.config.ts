/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub
      },
    ],
  },

  allowedDevOrigins: ["192.168.1.130"],
};

module.exports = nextConfig;