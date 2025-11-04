"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <ConvexQueryCacheProvider
        expiration={1800000}
        maxIdleEntries={1000}
        debug={false}
      >
        {children}
      </ConvexQueryCacheProvider>
    </ConvexAuthNextjsProvider>
  );
}
