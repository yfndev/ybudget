import { departments, teams } from "../db/collections";
import type { User } from "../db/types";
import type { FunctionalArea, OrganizationalAccess } from "./roles";

const FUNCTIONAL_AREA_NAMES: Record<FunctionalArea, string> = {
  finance_legal: "finance legal",
  people_culture: "people culture",
};

function normalizeOrganizationUnitName(name: string): string {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isFunctionalAreaName(name: string, area: FunctionalArea): boolean {
  return normalizeOrganizationUnitName(name) === FUNCTIONAL_AREA_NAMES[area];
}

export async function getFunctionalAreaTeamIds(
  organizationId: string,
  area: FunctionalArea,
): Promise<string[]> {
  const [activeDepartments, activeTeams] = await Promise.all([
    (await departments()).find({ organizationId, isArchived: false }).toArray(),
    (await teams()).find({ organizationId, isArchived: false }).toArray(),
  ]);
  const matchingDepartmentIds = new Set(
    activeDepartments
      .filter(({ name }) => isFunctionalAreaName(name, area))
      .map(({ _id }) => _id),
  );
  return activeTeams.flatMap((team) =>
    isFunctionalAreaName(team.name, area) ||
    matchingDepartmentIds.has(team.departmentId)
      ? [team._id]
      : [],
  );
}

export async function resolveOrganizationalAccess(
  user: Pick<
    User,
    | "organizationId"
    | "teamId"
    | "secondaryTeamId"
    | "isTeamLead"
    | "isSecondaryTeamLead"
  >,
): Promise<OrganizationalAccess> {
  const requestedTeamIds = [
    user.isTeamLead ? user.teamId : undefined,
    user.isSecondaryTeamLead ? user.secondaryTeamId : undefined,
  ].filter((teamId): teamId is string => Boolean(teamId));
  const ledTeamIds = [...new Set(requestedTeamIds)];
  if (!user.organizationId || ledTeamIds.length === 0) {
    return { functionalAreas: [], ledTeamIds: [] };
  }

  const ledTeams = await (
    await teams()
  )
    .find({
      _id: { $in: ledTeamIds },
      organizationId: user.organizationId,
      isArchived: false,
    })
    .toArray();
  const activeLedTeamIdSet = new Set(ledTeams.map(({ _id }) => _id));
  const activeLedTeamIds = ledTeamIds.filter((teamId) =>
    activeLedTeamIdSet.has(teamId),
  );
  const departmentIds = Array.from(
    new Set(ledTeams.map(({ departmentId }) => departmentId)),
  );
  const ledDepartments = await (
    await departments()
  )
    .find({
      _id: { $in: departmentIds },
      organizationId: user.organizationId,
      isArchived: false,
    })
    .toArray();
  const unitNames = [...ledTeams, ...ledDepartments].map(({ name }) => name);
  const functionalAreas = (
    Object.keys(FUNCTIONAL_AREA_NAMES) as FunctionalArea[]
  ).flatMap((area) =>
    unitNames.some((name) => isFunctionalAreaName(name, area)) ? [area] : [],
  );

  return { functionalAreas, ledTeamIds: activeLedTeamIds };
}
