/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**", // 🔥 ESTA ES LA CLAVE
      },
      {
        protocol: "http",
        hostname: "192.168.1.137",
        port: "8000",
        pathname: "/uploads/**", // 🔥 TAMBIÉN AQUÍ
      },
    ],
  },
};

module.exports = nextConfig;