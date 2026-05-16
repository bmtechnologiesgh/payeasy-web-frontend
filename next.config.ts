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

type ImageRemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

function storagePattern(
  hostname: string,
  protocol: "http" | "https" = "http",
  port?: string,
): ImageRemotePattern {
  return {
    protocol,
    hostname,
    ...(port ? { port } : {}),
    pathname: "/storage/**",
  };
}

/** Allow Laravel public disk URLs in dev (localhost vs 127.0.0.1, with/without :8000). */
function productImageRemotePatterns(): ImageRemotePattern[] {
  const patterns: ImageRemotePattern[] = [];
  const seen = new Set<string>();

  function add(hostname: string, protocol: "http" | "https" = "http", port?: string): void {
    const key = `${protocol}://${hostname}${port ? `:${port}` : ""}/storage`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    patterns.push(storagePattern(hostname, protocol, port));
  }

  function addAliasPair(hostname: string, protocol: "http" | "https", port?: string): void {
    add(hostname, protocol, port);
    if (hostname === "127.0.0.1") {
      add("localhost", protocol, port);
    } else if (hostname === "localhost") {
      add("127.0.0.1", protocol, port);
    }
  }

  const apiBase =
    process.env.NEXT_PUBLIC_PAYEASY_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    "http://127.0.0.1:8000/api";

  try {
    const origin = apiBase.replace(/\/api\/?$/, "");
    const parsed = new URL(origin);
    const protocol = parsed.protocol.replace(":", "") as "http" | "https";
    addAliasPair(parsed.hostname, protocol, parsed.port || undefined);
  } catch {
    // fall through to dev defaults
  }

  addAliasPair("127.0.0.1", "http", "8000");
  addAliasPair("127.0.0.1", "http");
  addAliasPair("localhost", "http", "8000");
  addAliasPair("localhost", "http");

  return patterns;
}

const nextConfig: NextConfig = {
  // Keeps serverless file tracing scoped to this app when other lockfiles exist nearby.
  outputFileTracingRoot: path.join(process.cwd()),

  images: {
    remotePatterns: productImageRemotePatterns(),
  },

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
