/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  ...(isDev
    ? {
        logging: {
          fetches: {
            fullUrl: true,
          },
        },
      }
    : {}),
};

export default nextConfig;
