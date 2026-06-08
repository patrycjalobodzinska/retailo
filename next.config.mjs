/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sanity v5 używa `useEffectEvent` (React 19.2). W warstwie App Routera
  // Next podstawia paczkom swojego wkompilowanego Reacta — dopiero Next 16
  // wendoruje React 19.2 z tym hookiem (linia 15.5 go nie miała). Transpilacja
  // sanity przez pipeline Next dodatkowo wygładza rozwiązywanie importów.
  transpilePackages: ["sanity", "@sanity/ui", "@sanity/vision"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/en/english-retailo",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en/english-retailo/:path*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
