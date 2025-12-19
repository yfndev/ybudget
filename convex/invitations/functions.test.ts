import { convexTest } from "convex-test";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { expect, test } from "vitest";
import { api } from "../_generated/api";
import schema from "../schema";
import { modules, setupTestData } from "../test.setup";

const resendModules = import.meta.glob(
  "../../node_modules/@convex-dev/resend/src/component/**/*.ts",
);

const vStatus = v.union(
  v.literal("waiting"),
  v.literal("queued"),
  v.literal("cancelled"),
  v.literal("sent"),
  v.literal("bounced"),
  v.literal("delivered"),
  v.literal("delivery_delayed"),
  v.literal("failed"),
);

const vOptions = v.object({
  apiKey: v.string(),
  testMode: v.boolean(),
  initialBackoffMs: v.number(),
  retryAttempts: v.number(),
  onEmailEvent: v.optional(v.object({ fnHandle: v.string() })),
});

const resendSchema = defineSchema({
  content: defineTable({
    content: v.bytes(),
    mimeType: v.string(),
    filename: v.optional(v.string()),
    path: v.optional(v.string()),
  }),
  nextBatchRun: defineTable({
    runId: v.id("_scheduled_functions"),
  }),
  lastOptions: defineTable({
    options: vOptions,
  }),
  emails: defineTable({
    from: v.string(),
    to: v.string(),
    subject: v.string(),
    replyTo: v.array(v.string()),
    html: v.optional(v.id("content")),
    text: v.optional(v.id("content")),
    headers: v.optional(v.array(v.object({ name: v.string(), value: v.string() }))),
    status: vStatus,
    errorMessage: v.optional(v.string()),
    complained: v.boolean(),
    opened: v.boolean(),
    resendId: v.optional(v.string()),
    segment: v.number(),
    finalizedAt: v.number(),
  })
    .index("by_status_segment", ["status", "segment"])
    .index("by_resendId", ["resendId"])
    .index("by_finalizedAt", ["finalizedAt"]),
});

test("sendInvitation sends email", async () => {
  const t = convexTest(schema, modules);
  t.registerComponent("resend", resendSchema, resendModules);
  const { userId } = await setupTestData(t);

  await t.run((ctx) =>
    // @ts-expect-error component table
    ctx.db.insert("lastOptions", {
      options: {
        apiKey: "test-api-key",
        testMode: true,
        initialBackoffMs: 1000,
        retryAttempts: 3,
      },
    }),
  );

  await t
    .withIdentity({ subject: userId })
    .mutation(api.invitations.functions.sendInvitation, {
      name: "Max Mustermann",
      email: "delivered@resend.dev",
    });
});
