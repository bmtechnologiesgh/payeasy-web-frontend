import type { NextConfig } from "next";
import path from "path";

function hostRewrite(
  host: string | undefined,
  segment: string,
): {
  source: string;
  has: { type: "host"; value: string }[];
  destination: string;
}[] {
  const h = host?.trim();
  if (!h) {
    return [];
  }
  return [
    {
      source: "/:path*",
      has: [{ type: "host" as const, value: h }],
      destination: `/${segment}/:path*`,
    },
  ];
}

const nextConfig: NextConfig = {
  // Keeps serverless file tracing scoped to this app when other lockfiles exist nearby.
  outputFileTracingRoot: path.join(process.cwd()),

  async rewrites() {
    const beforeFiles = [
      ...hostRewrite(process.env.MERCHANT_PORTAL_HOST, "merchant"),
      ...hostRewrite(process.env.EMPLOYER_PORTAL_HOST, "employer"),
      ...hostRewrite(process.env.OPS_PORTAL_HOST, "ops"),
    ];
    return { beforeFiles };
  },
};

export default nextConfig;
