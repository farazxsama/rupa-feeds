/** @type {import('next').NextConfig} */
const isExport = process.env.STATIC_EXPORT === "1";

const nextConfig = {
  reactStrictMode: true,
  // `STATIC_EXPORT=1 npm run build` produces a fully static /out folder
  // (used for the shareable client preview). Normal builds stay SSR-capable.
  ...(isExport ? { output: "export", images: { unoptimized: true }, trailingSlash: true } : {}),
};

export default nextConfig;
