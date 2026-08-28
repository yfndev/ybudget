import { beforeEach, expect, test, vi } from "vitest";

vi.mock("../users/email", () => ({ sendGettingToKnowDueEmail: vi.fn() }));

import { departments, teams, users } from "../../db/collections";
import { newId } from "../../db/ids";
import { setupTestDatabase } from "../../test/setupTestDatabase";
import { sendGettingToKnowDueEmail } from "../users/email";
import { processGettingToKnowPhases } from "./gettingToKnowJob";

setupTestDatabase();

const DAY = 24 * 60 * 60 * 1_000;
const NOW = Date.parse("2030-08-26T10:00:00Z");

let organizationId: string;
let teamId: string;
let memberId: string;

async function insertMember(endsIn: number): Promise<string> {
  const _id = newId();
  await (
    await users()
  ).insertOne({
    _id,
    _creationTime: NOW,
    organizationId,
    teamId,
    name: "Alex Example",
    role: "member",
    memberStatus: "getting_to_know",
    gettingToKnow: { startedAt: NOW - 21 * DAY, endsAt: NOW + endsIn },
    teamOnboardingStatus: "completed",
  });
  return _id;
}

beforeEach(async () => {
  vi.clearAllMocks();
  organizationId = newId();
  teamId = newId();
  memberId = newId();
  await (
    await users()
  ).insertOne({
    _id: memberId,
    _creationTime: Date.now(),
    organizationId,
    teamId,
    isTeamLead: true,
    name: "Lead Example",
    privateEmail: "lead@example.org",
    role: "member",
    memberStatus: "active",
    teamOnboardingStatus: "completed",
  });
});

test("reminds the team lead once exactly one week before the decision", async () => {
  await insertMember(7 * DAY);

  await expect(processGettingToKnowPhases(NOW)).resolves.toMatchObject({
    remindersSent: 1,
  });
  await expect(processGettingToKnowPhases(NOW)).resolves.toMatchObject({
    remindersSent: 0,
  });
  expect(vi.mocked(sendGettingToKnowDueEmail)).toHaveBeenCalledTimes(1);
});

test("notifies the people and culture lead of the same organization", async () => {
  const peopleDepartmentId = newId();
  const peopleTeamId = newId();
  await (
    await departments()
  ).insertOne({
    _id: peopleDepartmentId,
    _creationTime: Date.now(),
    organizationId,
    name: "People & Culture",
    isArchived: false,
    createdBy: memberId,
  });
  await (
    await teams()
  ).insertOne({
    _id: peopleTeamId,
    _creationTime: Date.now(),
    organizationId,
    departmentId: peopleDepartmentId,
    name: "People",
    isArchived: false,
    createdBy: memberId,
  });
  await (
    await users()
  ).insertOne({
    _id: newId(),
    _creationTime: Date.now(),
    organizationId,
    teamId: peopleTeamId,
    isTeamLead: true,
    name: "People Culture Lead",
    privateEmail: "people@example.org",
    role: "member",
    memberStatus: "active",
    teamOnboardingStatus: "completed",
  });
  await insertMember(3 * DAY);

  await processGettingToKnowPhases(NOW);

  const recipientNames = vi
    .mocked(sendGettingToKnowDueEmail)
    .mock.calls.map(([input]) => input.recipient.name);
  expect(recipientNames).toHaveLength(2);
  expect(recipientNames).toContain("Lead Example");
  expect(recipientNames).toContain("People Culture Lead");
});

test("keeps quiet until the phase ends within one week", async () => {
  await insertMember(7 * DAY + 1);

  await expect(processGettingToKnowPhases(NOW)).resolves.toMatchObject({
    remindersSent: 0,
  });
  expect(vi.mocked(sendGettingToKnowDueEmail)).not.toHaveBeenCalled();
});

test("replaces a legacy reminder that never had a configured template", async () => {
  const dueId = await insertMember(3 * DAY);
  await (
    await users()
  ).updateOne(
    { _id: dueId },
    { $set: { "gettingToKnow.reminderSentAt": NOW - DAY } },
  );

  await expect(processGettingToKnowPhases(NOW)).resolves.toMatchObject({
    remindersSent: 1,
  });
  expect(await (await users()).findOne({ _id: dueId })).toMatchObject({
    gettingToKnow: {
      reminderSentAt: NOW,
      reminderTemplateId: 189,
    },
  });
});

test("never ends the phase on its own", async () => {
  const overdueId = await insertMember(-5 * DAY);

  await processGettingToKnowPhases(NOW);

  expect(await (await users()).findOne({ _id: overdueId })).toMatchObject({
    memberStatus: "getting_to_know",
  });
});

test("retries the reminder after a delivery failure", async () => {
  const dueId = await insertMember(3 * DAY);
  vi.mocked(sendGettingToKnowDueEmail).mockRejectedValueOnce(
    new Error("Brevo unavailable"),
  );

  await expect(processGettingToKnowPhases(NOW)).resolves.toEqual({
    remindersSent: 0,
    failures: 1,
  });
  const failedMember = await (await users()).findOne({ _id: dueId });
  expect(failedMember?.gettingToKnow?.reminderSentAt).toBeUndefined();
  expect(failedMember?.gettingToKnow?.reminderTemplateId).toBeUndefined();

  await expect(processGettingToKnowPhases(NOW)).resolves.toEqual({
    remindersSent: 1,
    failures: 0,
  });
});
