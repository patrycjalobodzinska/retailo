/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sanity studio imports `useEffectEvent` from React. The hook IS in
  // React 19.2+ (verified locally), but webpack's static CJS-to-ESM
  // analysis chokes on react's nested require chain and reports the
  // export as missing. Forcing Next.js to transpile sanity through its
  // own pipeline makes the import resolve correctly.
  transpilePackages: ["sanity", "@sanity/ui", "@sanity/vision"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
