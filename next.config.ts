import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Keeps serverless file tracing scoped to this app when other lockfiles exist nearby.
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
