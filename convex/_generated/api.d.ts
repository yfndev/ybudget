/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as functions_donationExpenseLinkMutations from "../functions/donors/createDonationExpenseLink.jsx";
import type * as functions_donorMutations from "../functions/donors/createDonor.jsx";
import type * as functions_organizationMutations from "../functions/organizationMutations.js";
import type * as functions_projectMutations from "../functions/projectMutations.js";
import type * as functions_transactionMutations from "../functions/transactionMutations.js";
import type * as http from "../http.js";
import type * as queries_budgets_getAllocatedBudget from "../queries/budgets/getAllocatedBudget.js";
import type * as queries_donations_getAvailableDonationsForProject from "../queries/donations/getAvailableDonationsForProject.js";
import type * as queries_donors_getDonorById from "../queries/donors/getDonorById.js";
import type * as queries_donors_getDonorTransactions from "../queries/donors/getDonorTransactions.js";
import type * as queries_donors_getDonors from "../queries/donors/getDonors.js";
import type * as queries_getAvailableBudget from "../queries/getAvailableBudget.js";
import type * as queries_getReceivedBudget from "../queries/getReceivedBudget.js";
import type * as queries_getSpentBudget from "../queries/getSpentBudget.js";
import type * as queries_organizationQueries from "../queries/organizationQueries.js";
import type * as queries_projectQueries from "../queries/projectQueries.js";
import type * as queries_transactionQueries from "../queries/transactions/getTransactionsByDateRange.js";
import type * as queries_userQueries from "../queries/users/getUserOrganizationId.ts/index.js";
import type * as utils_auth from "../utils/auth.js";
import type * as utils_categoryMapping from "../utils/categoryMapping.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "functions/donationExpenseLinkMutations": typeof functions_donationExpenseLinkMutations;
  "functions/donorMutations": typeof functions_donorMutations;
  "functions/organizationMutations": typeof functions_organizationMutations;
  "functions/projectMutations": typeof functions_projectMutations;
  "functions/transactionMutations": typeof functions_transactionMutations;
  http: typeof http;
  "queries/budgets/getAllocatedBudget": typeof queries_budgets_getAllocatedBudget;
  "queries/donations/getAvailableDonationsForProject": typeof queries_donations_getAvailableDonationsForProject;
  "queries/donors/getDonorById": typeof queries_donors_getDonorById;
  "queries/donors/getDonorTransactions": typeof queries_donors_getDonorTransactions;
  "queries/donors/getDonors": typeof queries_donors_getDonors;
  "queries/getAvailableBudget": typeof queries_getAvailableBudget;
  "queries/getReceivedBudget": typeof queries_getReceivedBudget;
  "queries/getSpentBudget": typeof queries_getSpentBudget;
  "queries/organizationQueries": typeof queries_organizationQueries;
  "queries/projectQueries": typeof queries_projectQueries;
  "queries/transactionQueries": typeof queries_transactionQueries;
  "queries/userQueries": typeof queries_userQueries;
  "utils/auth": typeof utils_auth;
  "utils/categoryMapping": typeof utils_categoryMapping;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
