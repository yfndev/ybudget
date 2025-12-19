import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    server: { deps: { inline: ["convex-test"] } },
    env: {
      RESEND_API_KEY: "test-api-key",
    },
    projects: [
      {
        test: {
          include: ["convex/**/*.test.ts"],
          environment: "edge-runtime",
        },
      },
      {
        test: {
          include: ["app/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
