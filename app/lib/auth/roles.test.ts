import { describe, expect, test } from "vitest";
import {
  hasPermission,
  hasRoleAccess,
  normalizeOptionalUserRole,
  normalizeUserRole,
  recruitingTeamIds,
  USER_PERMISSIONS,
} from "./roles";

const member = { role: "member" };
const teamLead = {
  role: "member",
  access: { functionalAreas: [], ledTeamIds: ["team-1"] },
};
const financeLead = {
  role: "member",
  access: {
    functionalAreas: ["finance_legal" as const],
    ledTeamIds: ["finance-team"],
  },
};
const peopleLead = {
  role: "member",
  access: {
    functionalAreas: ["people_culture" as const],
    ledTeamIds: ["people-team"],
  },
};
const admin = { role: "admin" };

test.each(["member", "finance", "team_lead", "people_culture"])(
  "normalizes the persisted %s role to member",
  (role) => {
    expect(normalizeUserRole(role)).toBe("member");
  },
);

test("keeps the admin role", () => {
  expect(normalizeUserRole("admin")).toBe("admin");
});

test.each(["unknown", "ADMIN", "", 1, null, undefined])(
  "normalizes invalid role %j to member",
  (role) => {
    expect(normalizeUserRole(role)).toBe("member");
  },
);

test("keeps an absent optional role absent", () => {
  expect(normalizeOptionalUserRole(undefined)).toBeUndefined();
  expect(normalizeOptionalUserRole(null)).toBeUndefined();
  expect(normalizeOptionalUserRole("finance")).toBe("member");
});

test("only admins pass the admin role guard", () => {
  expect(hasRoleAccess("admin", "admin")).toBe(true);
  expect(hasRoleAccess("member", "admin")).toBe(false);
  expect(hasRoleAccess("finance", "admin")).toBe(false);
  expect(hasRoleAccess("unknown", "member")).toBe(true);
});

describe("organigram permissions", () => {
  test("members have no elevated permissions", () => {
    for (const permission of Object.values(USER_PERMISSIONS)) {
      expect(hasPermission(member, permission)).toBe(false);
    }
  });

  test("team leads recruit only for their led teams", () => {
    expect(hasPermission(teamLead, USER_PERMISSIONS.recruiting)).toBe(true);
    expect(hasPermission(teamLead, USER_PERMISSIONS.finance)).toBe(false);
    expect(recruitingTeamIds(teamLead)).toEqual(["team-1"]);
  });

  test("Finance & Legal leads manage finance", () => {
    expect(hasPermission(financeLead, USER_PERMISSIONS.finance)).toBe(true);
    expect(hasPermission(financeLead, USER_PERMISSIONS.recruiting)).toBe(true);
    expect(hasPermission(financeLead, USER_PERMISSIONS.members)).toBe(false);
    expect(recruitingTeamIds(financeLead)).toEqual(["finance-team"]);
  });

  test("People & Culture leads receive the People permissions", () => {
    expect(hasPermission(peopleLead, USER_PERMISSIONS.recruiting)).toBe(true);
    expect(hasPermission(peopleLead, USER_PERMISSIONS.publishJobPostings)).toBe(
      true,
    );
    expect(hasPermission(peopleLead, USER_PERMISSIONS.members)).toBe(true);
    expect(
      hasPermission(peopleLead, USER_PERMISSIONS.organizationStructure),
    ).toBe(true);
    expect(hasPermission(peopleLead, USER_PERMISSIONS.finance)).toBe(false);
    expect(hasPermission(peopleLead, USER_PERMISSIONS.roles)).toBe(false);
    expect(recruitingTeamIds(peopleLead)).toBeNull();
  });

  test("admins retain every permission and global recruiting scope", () => {
    for (const permission of Object.values(USER_PERMISSIONS)) {
      expect(hasPermission(admin, permission)).toBe(true);
    }
    expect(recruitingTeamIds(admin)).toBeNull();
  });
});
