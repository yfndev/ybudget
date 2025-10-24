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
        isActive: v.boolean()
    }),
    transactions: defineTable({
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

        projectId: v.string(),
        expectedDate: v.number(), //epoch timestamp
        amount: v.number(),
        reference: v.string(),
        categoryId: v.string(),
        donorId: v.optional(v.string()),
        isExpense: v.boolean(),
        createdBy: v.string(),
        matchedTransactionId: v.optional(v.string()),
        // -> could just take it if there is a matchedTransaction
        // status: v.union( 
        //     v.literal("open"),
        //     v.literal("matched"),
        // )
    }),

    categories: defineTable({
       name: v.string(),
       description: v.string(),
       taxCostposition: v.number() // Kostenstelle 
    }),
    donors: defineTable({
        name: v.string(),
        type: v.union(
            v.literal("donation"),
            v.literal("non-profit"),
            v.literal("sponsoring"),
            v.literal("government"),
        )
    }),
})