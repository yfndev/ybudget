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
    role: v.optional(
      v.union(v.literal("admin"), v.literal("lead"), v.literal("member")),
    ),
    iban: v.optional(v.string()),
    bic: v.optional(v.string()),
    accountHolder: v.optional(v.string()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_organization", ["organizationId"]),

  projects: defineTable({
    name: v.string(),
    parentId: v.optional(v.id("projects")),
    organizationId: v.id("organizations"),
    description: v.optional(v.string()),
    isArchived: v.boolean(),
    createdBy: v.string(),
  }).index("by_organization", ["organizationId"]),

  transactions: defineTable({
    projectId: v.optional(v.id("projects")),
    organizationId: v.id("organizations"),
    date: v.number(), //epoch timestamp
    amount: v.number(), // negative for expenses, positive for income
    description: v.string(),
    counterparty: v.string(),
    categoryId: v.optional(v.id("categories")),
    donorId: v.optional(v.id("donors")),
    importedBy: v.id("users"),
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
    isSplitIncome: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    splitFromTransactionId: v.optional(v.id("transactions")),
    transferId: v.optional(v.string()),
  })
    .index("by_organization_project", ["organizationId", "projectId"])
    .index("by_date", ["date"])
    .index("by_organization", ["organizationId"])
    .index("by_organization_donor", ["organizationId", "donorId"])
    .index("by_organization_project_donor", [
      "organizationId",
      "projectId",
      "donorId",
    ])
    .index("by_importedTransactionId", [
      "organizationId",
      "importedTransactionId",
    ])
    .index("by_splitFrom", ["splitFromTransactionId"])
    .index("by_archived", ["isArchived"])
    .index("by_transferId", ["transferId"]),

  budgets: defineTable({
    projectId: v.id("projects"),
    amount: v.number(),
    allocatedBy: v.id("users"),
    sourceTransactionId: v.optional(v.id("transactions")),
    note: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_source_transaction", ["sourceTransactionId"]),

  categories: defineTable({
    name: v.string(),
    description: v.string(),
    taxsphere: v.union(
      v.literal("non-profit"), // Ideeller Bereich
      v.literal("asset-management"), // Vermögensverwaltung
      v.literal("purpose-operations"), // Zweckbetrieb
      v.literal("commercial-operations"), // Wirtschaftlicher Geschäftsbetrieb
    ),
    approved: v.boolean(),
    createdBy: v.optional(v.id("users")),
    parentId: v.optional(v.id("categories")),
  }).index("by_parent", ["parentId"]),

  donors: defineTable({
    name: v.string(),
    type: v.union(v.literal("donation"), v.literal("sponsoring")),
    allowedTaxSpheres: v.array(
      v.union(
        v.literal("non-profit"),
        v.literal("asset-management"),
        v.literal("purpose-operations"),
        v.literal("commercial-operations"),
      ),
    ),
    organizationId: v.id("organizations"),
    createdBy: v.id("users"),
  }).index("by_organization", ["organizationId"]),

  payments: defineTable({
    tier: v.union(v.literal("monthly"), v.literal("yearly")),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("canceled"),
    ),
    organizationId: v.id("organizations"),
    stripeSessionId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  })
    .index("by_stripeSessionId", ["stripeSessionId"])
    .index("by_organization", ["organizationId"])
    .index("by_stripeCustomerId", ["stripeCustomerId"])
    .index("by_stripeSubscriptionId", ["stripeSubscriptionId"]),

  teams: defineTable({
    name: v.string(),
    organizationId: v.id("organizations"),
    projectIds: v.array(v.id("projects")),
    memberIds: v.array(v.id("users")),
    createdBy: v.id("users"),
  }).index("by_organization", ["organizationId"]),

  reimbursements: defineTable({
    organizationId: v.id("organizations"),
    projectId: v.id("projects"),
    amount: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("paid"),
    ),
    iban: v.string(),
    bic: v.string(),
    accountHolder: v.string(),
    adminNote: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_organization", ["organizationId"])
    .index("by_organization_and_createdBy", ["organizationId", "createdBy"]),

  // multiple receipts make one reimbursement
  receipts: defineTable({
    reimbursementId: v.id("reimbursements"),
    receiptNumber: v.string(),
    receiptDate: v.string(),
    companyName: v.string(),
    description: v.string(),
    netAmount: v.number(),
    taxRate: v.number(),
    grossAmount: v.number(),
    fileStorageId: v.id("_storage"),
  }).index("by_reimbursement", ["reimbursementId"]),
});
