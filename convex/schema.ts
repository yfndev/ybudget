import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    ...authTables,
    organizations: defineTable({
        id: v.string(),
        name: v.string(),
    }),
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
        organizationId: v.optional(v.string()),
    })
        .index("email", ["email"])
        .index("phone", ["phone"])
        .index("by_organization", ["organizationId"]),
    projects: defineTable({
        id: v.string(),
        name: v.string(),
        parentId: v.string(),
        organizationId: v.string(),
        description: v.string(),
        isActive: v.boolean()
    }),
    transactions: defineTable({
        id: v.string(),
        projectId: v.string(),
        date: v.number(), //epoch timestamp
        amount: v.number(),
        reference: v.string(),
        categoryId: v.string(),
        donorId: v.string(),
        isExpense: v.boolean(),
        importedBy: v.string(),
        importSource: v.union(
            v.literal("sparkasse"),
            v.literal("volksbank"),
            v.literal("moss"),
        )
    }),
    expectedTransactions: defineTable({
        id: v.string(),
        projectId: v.string(),
        expectedDate: v.number(), //epoch timestamp
        amount: v.number(),
        reference: v.string(),
        categoryId: v.string(),
        donorId: v.string(),
        isExpense: v.boolean(),
        createdBy: v.string(),
        matchedTransactionId: v.string(),
        // -> could just take it if there is a matchedTransaction
        // status: v.union( 
        //     v.literal("open"),
        //     v.literal("matched"),
        // )
    }),

    categories: defineTable({
       id: v.string(),
       name: v.string(),
       description: v.string(),
       taxCostposition: v.number() // Kostenstelle 
    }),
    donors: defineTable({
        id: v.string(),
        name: v.string(),
        type: v.union(
            v.literal("donation"),
            v.literal("non-profit"),
            v.literal("sponsoring"),
            v.literal("government"),
        )
    }),
})