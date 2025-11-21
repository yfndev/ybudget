import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

// is helper function used to validate if a donor can be used for a category when creating transactions

export async function validateDonorCategory(
  ctx: MutationCtx,
  donorId: Id<"donors"> | undefined,
  categoryId: Id<"categories"> | undefined,
  orgId: Id<"organizations">,
) {
  if (!donorId || !categoryId) return;

  const donor = await ctx.db.get(donorId);
  if (!donor) throw new Error("Donor not found");
  if (donor.organizationId !== orgId) throw new Error("Access denied");

  const category = await ctx.db.get(categoryId);
  if (!category) throw new Error("Category not found");

  if (!donor.allowedTaxSpheres.includes(category.taxsphere)) {
    throw new Error(
      `Donor "${donor.name}" cannot be used for category "${category.name}"`,
    );
  }
}
