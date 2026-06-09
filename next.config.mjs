/** @type {import('next').NextConfig} */

// Statyczny eksport (HTML/JS/CSS do katalogu `out/`) włączamy flagą:
//   NEXT_OUTPUT=export npm run build
// Domyślny build zostaje serwerowy (ISR + redirecty), żeby nie psuć deployu.
const isExport = process.env.NEXT_OUTPUT === "export";

const nextConfig = {
  transpilePackages: ["sanity", "@sanity/ui", "@sanity/vision"],
  images: {
    // Eksport statyczny nie ma optymalizatora obrazów - musi być unoptimized.
    unoptimized: isExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  // Foldery z index.html (/realizacje/ -> realizacje/index.html), żeby
  // statyczny eksport działał na dowolnym serwerze bez regul przepisywania.
  ...(isExport ? { trailingSlash: true } : {}),
  ...(isExport
    ? { output: "export" }
    : {
        async redirects() {
          return [
            { source: "/en/english-retailo", destination: "/", permanent: true },
            {
              source: "/en/english-retailo/:path*",
              destination: "/",
              permanent: true,
            },
          ];
        },
      }),
};

export default nextConfig;
