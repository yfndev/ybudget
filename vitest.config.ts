import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    server: { deps: { inline: ["convex-test"] } },
    projects: [
      {
        test: {
          include: ["convex/**"],
          environment: "edge-runtime",
        },
      },
    ],
  },
});