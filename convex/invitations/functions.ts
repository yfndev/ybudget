import { Resend } from "@convex-dev/resend";
import { v } from "convex/values";
import { components } from "../_generated/api";
import { mutation } from "../_generated/server";
import { getCurrentUser } from "../users/getCurrentUser";

export const resend: Resend = new Resend(components.resend, {});

export const createInvitation = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    await ctx.db.insert("invitations", {
      email: args.email,
      name: args.name,
      organizationId: user.organizationId,
      createdBy: user._id,
    });
  },
});

export const sendInvitation = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    await resend.sendEmail(ctx, {
      from: "YBudget <team@ybudget.de>",
      to: args.email,
      subject: "Einladung zu YBudget",
      html: `
      <p>Hallo ${args.name},</p>
      <p>Du wurdest von ${user.name} zu YBudget eingeladen.</p>
      <p>Klicke auf den folgenden Link, um dich einzuloggen:</p>
      <a href="https://ybudget.de/login">Login</a>
      `,
    });
  },
});
