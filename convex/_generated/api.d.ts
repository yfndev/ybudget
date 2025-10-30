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
import type * as functions_donation_deleteDonationExpenseLink from "../functions/donation/deleteDonationExpenseLink.js";
import type * as functions_donors_createDonationExpenseLink from "../functions/donors/createDonationExpenseLink.js";
import type * as functions_donors_createDonor from "../functions/donors/createDonor.js";
import type * as functions_organizations_addUserToOrganization from "../functions/organizations/addUserToOrganization.js";
import type * as functions_organizations_createOrganization from "../functions/organizations/createOrganization.js";
import type * as functions_projects_createProject from "../functions/projects/createProject.js";
import type * as functions_transactions_createExpectedTransaction from "../functions/transactions/createExpectedTransaction.js";
import type * as functions_transactions_createImportedTransaction from "../functions/transactions/createImportedTransaction.js";
import type * as functions_transactions_patchProcessedTransaction from "../functions/transactions/patchProcessedTransaction.js";
import type * as http from "../http.js";
import type * as queries_budgets_getAllocatedBudget from "../queries/budgets/getAllocatedBudget.js";
import type * as queries_budgets_getAvailableBudget from "../queries/budgets/getAvailableBudget.js";
import type * as queries_budgets_getReceivedBudget from "../queries/budgets/getReceivedBudget.js";
import type * as queries_budgets_getSpentBudget from "../queries/budgets/getSpentBudget.js";
import type * as queries_donations_getAvailableDonationsForProject from "../queries/donations/getAvailableDonationsForProject.js";
import type * as queries_donors_getAllDonors from "../queries/donors/getAllDonors.js";
import type * as queries_donors_getDonorById from "../queries/donors/getDonorById.js";
import type * as queries_donors_getDonorTransactions from "../queries/donors/getDonorTransactions.js";
import type * as queries_organizations_getOrganizationByDomain from "../queries/organizations/getOrganizationByDomain.js";
import type * as queries_organizations_getOrganizationName from "../queries/organizations/getOrganizationName.js";
import type * as queries_projects_getAllProjects from "../queries/projects/getAllProjects.js";
import type * as queries_projects_getChildProjects from "../queries/projects/getChildProjects.js";
import type * as queries_projects_getProjectById from "../queries/projects/getProjectById.js";
import type * as queries_transactions_getAllTransactions from "../queries/transactions/getAllTransactions.js";
import type * as queries_transactions_getImportedTransactionIds from "../queries/transactions/getImportedTransactionIds.js";
import type * as queries_transactions_getTransactionById from "../queries/transactions/getTransactionById.js";
import type * as queries_transactions_getTransactionRecommendations from "../queries/transactions/getTransactionRecommendations.js";
import type * as queries_transactions_getTransactionsByDateRange from "../queries/transactions/getTransactionsByDateRange.js";
import type * as queries_transactions_getUnassignedProcessedTransactions from "../queries/transactions/getUnassignedProcessedTransactions.js";
import type * as queries_users_getCurrentUser from "../queries/users/getCurrentUser.js";
import type * as queries_users_getUserOrganizationId from "../queries/users/getUserOrganizationId.js";
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
  "functions/donation/deleteDonationExpenseLink": typeof functions_donation_deleteDonationExpenseLink;
  "functions/donors/createDonationExpenseLink": typeof functions_donors_createDonationExpenseLink;
  "functions/donors/createDonor": typeof functions_donors_createDonor;
  "functions/organizations/addUserToOrganization": typeof functions_organizations_addUserToOrganization;
  "functions/organizations/createOrganization": typeof functions_organizations_createOrganization;
  "functions/projects/createProject": typeof functions_projects_createProject;
  "functions/transactions/createExpectedTransaction": typeof functions_transactions_createExpectedTransaction;
  "functions/transactions/createImportedTransaction": typeof functions_transactions_createImportedTransaction;
  "functions/transactions/patchProcessedTransaction": typeof functions_transactions_patchProcessedTransaction;
  http: typeof http;
  "queries/budgets/getAllocatedBudget": typeof queries_budgets_getAllocatedBudget;
  "queries/budgets/getAvailableBudget": typeof queries_budgets_getAvailableBudget;
  "queries/budgets/getReceivedBudget": typeof queries_budgets_getReceivedBudget;
  "queries/budgets/getSpentBudget": typeof queries_budgets_getSpentBudget;
  "queries/donations/getAvailableDonationsForProject": typeof queries_donations_getAvailableDonationsForProject;
  "queries/donors/getAllDonors": typeof queries_donors_getAllDonors;
  "queries/donors/getDonorById": typeof queries_donors_getDonorById;
  "queries/donors/getDonorTransactions": typeof queries_donors_getDonorTransactions;
  "queries/organizations/getOrganizationByDomain": typeof queries_organizations_getOrganizationByDomain;
  "queries/organizations/getOrganizationName": typeof queries_organizations_getOrganizationName;
  "queries/projects/getAllProjects": typeof queries_projects_getAllProjects;
  "queries/projects/getChildProjects": typeof queries_projects_getChildProjects;
  "queries/projects/getProjectById": typeof queries_projects_getProjectById;
  "queries/transactions/getAllTransactions": typeof queries_transactions_getAllTransactions;
  "queries/transactions/getImportedTransactionIds": typeof queries_transactions_getImportedTransactionIds;
  "queries/transactions/getTransactionById": typeof queries_transactions_getTransactionById;
  "queries/transactions/getTransactionRecommendations": typeof queries_transactions_getTransactionRecommendations;
  "queries/transactions/getTransactionsByDateRange": typeof queries_transactions_getTransactionsByDateRange;
  "queries/transactions/getUnassignedProcessedTransactions": typeof queries_transactions_getUnassignedProcessedTransactions;
  "queries/users/getCurrentUser": typeof queries_users_getCurrentUser;
  "queries/users/getUserOrganizationId": typeof queries_users_getUserOrganizationId;
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
