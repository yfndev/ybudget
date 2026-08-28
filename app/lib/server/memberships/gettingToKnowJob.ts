import { getFunctionalAreaTeamIds } from "../../auth/organizationalAccess";
import { users } from "../../db/collections";
import type { User } from "../../db/types";
import { BREVO_TEMPLATE_IDS } from "../../email/templates";
import { UNAVAILABLE_MEMBER_STATUSES } from "../../members/status";
import { sendGettingToKnowDueEmail } from "../users/email";

const REMINDER_LEAD_TIME = 7 * 24 * 60 * 60 * 1_000;
const REMINDER_TEMPLATE_ID = BREVO_TEMPLATE_IDS.GETTING_TO_KNOW_DUE;

export interface GettingToKnowJobResult {
  remindersSent: number;
  failures: number;
}

export async function processGettingToKnowPhases(
  now = Date.now(),
): Promise<GettingToKnowJobResult> {
  const result: GettingToKnowJobResult = { remindersSent: 0, failures: 0 };
  const collection = await users();
  const due = await collection
    .find({
      memberStatus: "getting_to_know",
      "gettingToKnow.endsAt": { $lte: now + REMINDER_LEAD_TIME },
      "gettingToKnow.reminderTemplateId": { $ne: REMINDER_TEMPLATE_ID },
    })
    .toArray();

  for (const member of due) {
    try {
      const reserved = await collection.updateOne(
        {
          _id: member._id,
          memberStatus: "getting_to_know",
          "gettingToKnow.reminderTemplateId": { $ne: REMINDER_TEMPLATE_ID },
        },
        {
          $set: {
            "gettingToKnow.reminderSentAt": now,
            "gettingToKnow.reminderTemplateId": REMINDER_TEMPLATE_ID,
          },
        },
      );
      if (reserved.modifiedCount !== 1) continue;
      await notifyDecisionMakers(member);
      result.remindersSent += 1;
    } catch {
      await collection.updateOne(
        {
          _id: member._id,
          "gettingToKnow.reminderTemplateId": REMINDER_TEMPLATE_ID,
        },
        {
          $unset: {
            "gettingToKnow.reminderSentAt": "",
            "gettingToKnow.reminderTemplateId": "",
          },
        },
      );
      result.failures += 1;
    }
  }
  return result;
}

async function notifyDecisionMakers(member: User): Promise<void> {
  if (!member.organizationId) return;
  const peopleTeamIds = await getFunctionalAreaTeamIds(
    member.organizationId,
    "people_culture",
  );
  const recipients = await (
    await users()
  )
    .find({
      organizationId: member.organizationId,
      memberStatus: { $nin: [...UNAVAILABLE_MEMBER_STATUSES] },
      $or: [
        { teamId: member.teamId, isTeamLead: true },
        { teamId: { $in: peopleTeamIds }, isTeamLead: true },
        {
          secondaryTeamId: { $in: peopleTeamIds },
          isSecondaryTeamLead: true,
        },
      ],
    })
    .toArray();
  for (const recipient of recipients) {
    await sendGettingToKnowDueEmail({
      recipient,
      member,
      endsAt: member.gettingToKnow?.endsAt ?? Date.now(),
    });
  }
}
