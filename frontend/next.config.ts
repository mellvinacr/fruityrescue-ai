import type { NextConfig } from "next";

const isCloudflarePages = process.env.CF_PAGES === "1" || process.env.CF_PAGES === "true";

const nextConfig: NextConfig = {
  // Gunakan 'export' untuk Cloudflare Pages agar menghasilkan folder /out statis
  // Gunakan 'standalone' untuk AWS Docker EC2
  output: isCloudflarePages ? "export" : "standalone",
  // Cloudflare Pages butuh unoptimized images jika menggunakan static export
  images: isCloudflarePages ? { unoptimized: true } : undefined,
};

export default nextConfig;
