import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    // Allow loading images from the project's S3 bucket and common CDNs
    domains: [
      'chihili-bucket.s3.ap-south-1.amazonaws.com',
      'cdn.example.com'
    ],
  },
};

export default nextConfig;
