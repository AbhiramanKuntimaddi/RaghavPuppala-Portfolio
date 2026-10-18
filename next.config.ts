import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

// The shared Design Lab (dev only) is synced into .design-lab/lab from ../DesignLab by
// `npm run lab:sync` and predev. When it's absent (Vercel, a fresh clone) "design-lab"
// resolves to the committed no-op stub instead, so nothing Lab-related ever ships.
const lab = "./.design-lab/lab/index.ts";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "design-lab": existsSync(join(process.cwd(), lab)) ? lab : "./.design-lab/stub.tsx",
    },
  },
};

export default nextConfig;
