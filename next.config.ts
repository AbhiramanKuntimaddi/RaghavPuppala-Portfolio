import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

// Design Lab (dev only): falls back to a no-op stub when .design-lab/lab isn't synced (Vercel).
const lab = "./.design-lab/lab/index.ts";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "design-lab": existsSync(join(process.cwd(), lab)) ? lab : "./.design-lab/stub.tsx",
    },
  },
};

export default nextConfig;
