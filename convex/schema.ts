import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  organizations: defineTable({
    name: v.string(),
    domain: v.string(),
    createdBy: v.string(),
  })
    .index("by_name", ["name"])
    .index("by_domain", ["domain"]),
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    organizationId: v.optional(v.id("organizations")),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_organization", ["organizationId"]),

  projects: defineTable({
    name: v.string(),
    parentId: v.optional(v.id("projects")),
    organizationId: v.id("organizations"),
    description: v.string(),
    isActive: v.boolean(),
    createdBy: v.string(),
  }).index("by_organization", ["organizationId"]),

  transactions: defineTable({
    projectId: v.optional(v.id("projects")),
    organizationId: v.id("organizations"),
    date: v.number(), //epoch timestamp
    amount: v.number(), // negative for expenses, positive for income
    description: v.string(),
    counterparty: v.string(),
    categoryId: v.string(),
    donorId: v.string(),
    importedBy: v.string(),
    importedTransactionId: v.optional(v.string()),
    importSource: v.optional(
      v.union(
        v.literal("sparkasse"),
        v.literal("volksbank"),
        v.literal("moss"),
      ),
    ),
    status: v.union(v.literal("expected"), v.literal("processed")),
    matchedTransactionId: v.optional(v.string()),
    accountName: v.optional(v.string()),
  })
    .index("by_organization_project", ["organizationId", "projectId"])
    .index("by_date", ["date"])
    .index("by_organization", ["organizationId"])
    .index("by_organization_donor", ["organizationId", "donorId"])
    .index("by_importedTransactionId", [
      "organizationId",
      "importedTransactionId",
    ]),

  categories: defineTable({
    name: v.string(),
    description: v.string(),
    taxCostposition: v.number(), // Kostenstelle
  }),

  donors: defineTable({
    name: v.string(),
    type: v.union(v.literal("donation"), v.literal("sponsoring")),
    organizationId: v.id("organizations"),
    createdBy: v.id("users"),
  }).index("by_organization", ["organizationId"]),
});
