import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /*
        Server Actions refuse bodies over 1 MB by default, which would fail every
        résumé upload before the action even ran. 4 MB fits a generous résumé
        and stays under Vercel's 4.5 MB hard cap on function request bodies —
        the multipart framing costs ~10-20 KB on top of the file itself.
      */
      bodySizeLimit: "4mb",
    },
  },
  images: {
    /*
      WebP only, deliberately.

      Measured on the real hero stills (2400x1600): AVIF took 1145 ms to encode and
      produced 314 KB; WebP took 235 ms and produced 235 KB. AVIF was slower AND
      larger at equivalent quality here, and the loader gates on these eight images,
      so its encode cost lands directly on first paint. Nothing to gain, ~9s of
      first-visit encoding to lose.
    */
    formats: ["image/webp"],
  },
  async headers() {
    return [
      {
        // The hero loop encodes and poster never change — cache them hard so a
        // repeat visitor never re-downloads 9 MB of video.
        source: "/assets/hero/:file(.*\\.(?:mp4|webp|jpg))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
