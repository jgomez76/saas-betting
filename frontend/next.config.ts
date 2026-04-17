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
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "192.168.1.137", // 🔥 tu IP local
        port: "8000",
      },
    ],
  },

  allowedDevOrigins: ["192.168.1.137"],
};

module.exports = nextConfig;



