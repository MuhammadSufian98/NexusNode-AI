/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  /* config options here */
  reactCompiler: true,
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
