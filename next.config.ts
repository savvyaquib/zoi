import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /*
        Server Actions refuse bodies over 1 MB by default, which would fail every
        resume upload before the action even ran. The file itself is capped at
        10 MB in lib/careers; this sits just above it, leaving the multipart
        framing (~10-20 KB) room over the file cap. (Vercel would ignore this
        above its own 4.5 MB ceiling — see the note beside RESUME_MAX_BYTES.)
      */
      bodySizeLimit: "10.5mb",
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
    /*
      75 is the site's default. 55 exists for the menu's drawings only: they
      are spot illustrations at 96–176px, watercolour grain that lossy WebP
      spends bytes on at 75 for no visible return at that size.
    */
    qualities: [55, 75],
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
