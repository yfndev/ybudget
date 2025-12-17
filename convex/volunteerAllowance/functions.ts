import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";
import { addLog } from "../logs/functions";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    amount: v.number(),
    iban: v.string(),
    bic: v.string(),
    accountHolder: v.string(),
    activityDescription: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    volunteerName: v.string(),
    volunteerStreet: v.string(),
    volunteerPlz: v.string(),
    volunteerCity: v.string(),
    signatureStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (args.amount > 840) {
      throw new Error("Volunteer allowance cannot exceed 840€");
    }

    const id = await ctx.db.insert("volunteerAllowance", {
      organizationId: user.organizationId,
      projectId: args.projectId,
      amount: args.amount,
      isApproved: false,
      iban: args.iban,
      bic: args.bic,
      accountHolder: args.accountHolder,
      createdBy: user._id,
      activityDescription: args.activityDescription,
      startDate: args.startDate,
      endDate: args.endDate,
      volunteerName: args.volunteerName,
      volunteerStreet: args.volunteerStreet,
      volunteerPlz: args.volunteerPlz,
      volunteerCity: args.volunteerCity,
      signatureStorageId: args.signatureStorageId,
    });

    await addLog(
      ctx,
      user.organizationId,
      user._id,
      "volunteerAllowance.create",
      id,
      `${args.amount}€`,
    );
  },
});

export const createLink = mutation({
  args: {
    projectId: v.id("projects"),
    activityDescription: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const id = await ctx.db.insert("volunteerAllowance", {
      organizationId: user.organizationId,
      projectId: args.projectId,
      amount: 0,
      isApproved: false,
      iban: "",
      bic: "",
      accountHolder: "",
      createdBy: user._id,
      activityDescription: args.activityDescription || "",
      startDate: args.startDate || "",
      endDate: args.endDate || "",
      volunteerName: "",
      volunteerStreet: "",
      volunteerPlz: "",
      volunteerCity: "",
    });

    return id;
  },
});

export const generatePublicUploadUrl = mutation({
  args: { id: v.id("volunteerAllowance") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Ungültiger Link");
    if (doc.signatureStorageId) throw new Error("Bereits ausgefüllt");
    return ctx.storage.generateUploadUrl();
  },
});

export const submitExternal = mutation({
  args: {
    id: v.id("volunteerAllowance"),
    amount: v.number(),
    iban: v.string(),
    bic: v.string(),
    accountHolder: v.string(),
    activityDescription: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    volunteerName: v.string(),
    volunteerStreet: v.string(),
    volunteerPlz: v.string(),
    volunteerCity: v.string(),
    signatureStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Ungültiger Link");
    if (doc.signatureStorageId) throw new Error("Bereits ausgefüllt");
    if (args.amount > 840) throw new Error("Maximal 840€ erlaubt");

    await ctx.db.patch(args.id, {
      amount: args.amount,
      iban: args.iban,
      bic: args.bic,
      accountHolder: args.accountHolder,
      activityDescription: args.activityDescription,
      startDate: args.startDate,
      endDate: args.endDate,
      volunteerName: args.volunteerName,
      volunteerStreet: args.volunteerStreet,
      volunteerPlz: args.volunteerPlz,
      volunteerCity: args.volunteerCity,
      signatureStorageId: args.signatureStorageId,
    });

    await addLog(
      ctx,
      doc.organizationId,
      doc.createdBy,
      "volunteerAllowance.create",
      args.id,
      `extern ${args.amount}€`,
    );
  },
});

export const approve = mutation({
  args: { id: v.id("volunteerAllowance") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Not found");

    await ctx.db.patch(args.id, { isApproved: true });

    await addLog(
      ctx,
      user.organizationId,
      user._id,
      "volunteerAllowance.approve",
      args.id,
      `${doc.amount}€`,
    );
  },
});

export const reject = mutation({
  args: { id: v.id("volunteerAllowance"), rejectionNote: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    await ctx.db.patch(args.id, {
      isApproved: false,
      rejectionNote: args.rejectionNote,
    });

    await addLog(
      ctx,
      user.organizationId,
      user._id,
      "volunteerAllowance.reject",
      args.id,
      args.rejectionNote,
    );
  },
});

export const remove = mutation({
  args: { id: v.id("volunteerAllowance") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const doc = await ctx.db.get(args.id);
    if (!doc) throw new Error("Not found");

    if (doc.signatureStorageId) {
      await ctx.storage.delete(doc.signatureStorageId);
    }

    await ctx.db.delete(args.id);

    await addLog(
      ctx,
      user.organizationId,
      user._id,
      "volunteerAllowance.delete",
      args.id,
      `${doc.amount}€`,
    );
  },
});

export const createSignatureToken = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const token = crypto.randomUUID();

    await ctx.db.insert("signatureTokens", {
      token,
      organizationId: user.organizationId,
      createdBy: user._id,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });

    return token;
  },
});

export const generateSignatureUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("signatureTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!doc) throw new Error("Invalid link");
    if (doc.expiresAt < Date.now()) throw new Error("Link expired");
    if (doc.usedAt) throw new Error("Link already used");

    return ctx.storage.generateUploadUrl();
  },
});

export const submitSignature = mutation({
  args: {
    token: v.string(),
    signatureStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("signatureTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!doc) throw new Error("Invalid link");
    if (doc.expiresAt < Date.now()) throw new Error("Link expired");
    if (doc.usedAt) throw new Error("Link already used");

    await ctx.db.patch(doc._id, {
      signatureStorageId: args.signatureStorageId,
      usedAt: Date.now(),
    });
  },
});
