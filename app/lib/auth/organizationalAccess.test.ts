import { beforeEach, expect, test } from "vitest";
import { departments, teams } from "../db/collections";
import { newId } from "../db/ids";
import { setupTestDatabase } from "../test/setupTestDatabase";
import { resolveOrganizationalAccess } from "./organizationalAccess";

const organizationId = "organization-1";
const otherOrganizationId = "organization-2";
let operationsDepartmentId: string;
let peopleDepartmentId: string;
let ventureCapitalTeamId: string;
let peopleTeamId: string;
let financeTeamId: string;

setupTestDatabase();

beforeEach(async () => {
  operationsDepartmentId = newId();
  peopleDepartmentId = newId();
  ventureCapitalTeamId = newId();
  peopleTeamId = newId();
  financeTeamId = newId();

  await (await departments()).insertMany([
    {
      _id: operationsDepartmentId,
      _creationTime: Date.now(),
      name: "Operations",
      organizationId,
      isArchived: false,
      createdBy: "admin",
    },
    {
      _id: peopleDepartmentId,
      _creationTime: Date.now(),
      name: "People & Culture",
      organizationId,
      isArchived: false,
      createdBy: "admin",
    },
  ]);
  await (await teams()).insertMany([
    {
      _id: ventureCapitalTeamId,
      _creationTime: Date.now(),
      name: "Venture Capital",
      departmentId: operationsDepartmentId,
      organizationId,
      isArchived: false,
      createdBy: "admin",
    },
    {
      _id: peopleTeamId,
      _creationTime: Date.now(),
      name: "Community",
      departmentId: peopleDepartmentId,
      organizationId,
      isArchived: false,
      createdBy: "admin",
    },
    {
      _id: financeTeamId,
      _creationTime: Date.now(),
      name: "Finance & Legal",
      departmentId: operationsDepartmentId,
      organizationId,
      isArchived: false,
      createdBy: "admin",
    },
  ]);
});

test("derives recruiting access from the primary organigram lead flag", async () => {
  await expect(
    resolveOrganizationalAccess({
      organizationId,
      teamId: ventureCapitalTeamId,
      isTeamLead: true,
    }),
  ).resolves.toEqual({
    functionalAreas: [],
    ledTeamIds: [ventureCapitalTeamId],
  });
});

test("only includes team assignments where the member is a lead", async () => {
  await expect(
    resolveOrganizationalAccess({
      organizationId,
      teamId: ventureCapitalTeamId,
      isTeamLead: false,
      secondaryTeamId: financeTeamId,
      isSecondaryTeamLead: true,
    }),
  ).resolves.toEqual({
    functionalAreas: ["finance_legal"],
    ledTeamIds: [financeTeamId],
  });
});

test("recognizes functional areas by team or parent department name", async () => {
  await expect(
    resolveOrganizationalAccess({
      organizationId,
      teamId: peopleTeamId,
      isTeamLead: true,
      secondaryTeamId: financeTeamId,
      isSecondaryTeamLead: true,
    }),
  ).resolves.toEqual({
    functionalAreas: ["finance_legal", "people_culture"],
    ledTeamIds: [peopleTeamId, financeTeamId],
  });
});

test("ignores teams from another organization", async () => {
  await expect(
    resolveOrganizationalAccess({
      organizationId: otherOrganizationId,
      teamId: financeTeamId,
      isTeamLead: true,
    }),
  ).resolves.toEqual({ functionalAreas: [], ledTeamIds: [] });
});
