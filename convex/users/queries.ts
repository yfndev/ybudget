import { query } from "../_generated/server";
import { getCurrentUser } from "./getCurrentUser";


  export const getUserOrganizationId = query({
    args: {},
    handler: async (ctx) => {
  const user = await getCurrentUser(ctx);
  if (!user) return console.error("User not found");

  return user.organizationId;
    },
  });