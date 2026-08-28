import type { OrganizationalAccess } from "../../auth/roles";
import { hasPermission, USER_PERMISSIONS } from "../../auth/roles";
import { reimbursements } from "../../db/collections";
import type { Reimbursement, UserRole } from "../../db/types";

export type ReimbursementActor = {
  _id: string;
  organizationId: string;
  role: UserRole;
  access?: OrganizationalAccess;
};

export async function findAccessibleReimbursement(
  reimbursementId: string,
  actor: ReimbursementActor,
): Promise<Reimbursement | null> {
  const canManage = hasPermission(actor, USER_PERMISSIONS.finance);
  return (await reimbursements()).findOne({
    _id: reimbursementId,
    organizationId: actor.organizationId,
    ...(canManage ? {} : { createdBy: actor._id }),
  });
}

export async function requireAccessibleReimbursement(
  reimbursementId: string,
  actor: ReimbursementActor,
): Promise<Reimbursement> {
  const reimbursement = await findAccessibleReimbursement(
    reimbursementId,
    actor,
  );
  if (!reimbursement) throw new Error("Reimbursement not found");
  return reimbursement;
}

export async function requirePendingReimbursement(
  reimbursementId: string,
  organizationId: string,
): Promise<Reimbursement> {
  const reimbursement = await (
    await reimbursements()
  ).findOne({
    _id: reimbursementId,
    organizationId,
  });
  if (!reimbursement) throw new Error("Reimbursement not found");
  if (reimbursement.status !== "pending") {
    throw new Error("Reimbursement already processed");
  }
  return reimbursement;
}
