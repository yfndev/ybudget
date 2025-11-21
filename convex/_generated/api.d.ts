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
import type * as budgets_functions from "../budgets/functions.js";
import type * as budgets_queries from "../budgets/queries.js";
import type * as categories_functions from "../categories/functions.js";
import type * as categories_seed from "../categories/seed.js";
import type * as donors_functions from "../donors/functions.js";
import type * as donors_queries from "../donors/queries.js";
import type * as http from "../http.js";
import type * as organizations_functions from "../organizations/functions.js";
import type * as organizations_queries from "../organizations/queries.js";
import type * as payments_functions from "../payments/functions.js";
import type * as payments_queries from "../payments/queries.js";
import type * as projects_functions from "../projects/functions.js";
import type * as projects_queries from "../projects/queries.js";
import type * as stripe from "../stripe.js";
import type * as subscriptions_functions from "../subscriptions/functions.js";
import type * as subscriptions_queries from "../subscriptions/queries.js";
import type * as teams_functions from "../teams/functions.js";
import type * as teams_permissions from "../teams/permissions.js";
import type * as teams_queries from "../teams/queries.js";
import type * as transactions_functions from "../transactions/functions.js";
import type * as transactions_queries from "../transactions/queries.js";
import type * as transactions_validateDonorCategory from "../transactions/validateDonorCategory.js";
import type * as users_functions from "../users/functions.js";
import type * as users_getCurrentUser from "../users/getCurrentUser.js";
import type * as users_permissions from "../users/permissions.js";
import type * as users_queries from "../users/queries.js";
import type * as utils_addProjectNames from "../utils/addProjectNames.js";
import type * as utils_categoryMapping from "../utils/categoryMapping.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "budgets/functions": typeof budgets_functions;
  "budgets/queries": typeof budgets_queries;
  "categories/functions": typeof categories_functions;
  "categories/seed": typeof categories_seed;
  "donors/functions": typeof donors_functions;
  "donors/queries": typeof donors_queries;
  http: typeof http;
  "organizations/functions": typeof organizations_functions;
  "organizations/queries": typeof organizations_queries;
  "payments/functions": typeof payments_functions;
  "payments/queries": typeof payments_queries;
  "projects/functions": typeof projects_functions;
  "projects/queries": typeof projects_queries;
  stripe: typeof stripe;
  "subscriptions/functions": typeof subscriptions_functions;
  "subscriptions/queries": typeof subscriptions_queries;
  "teams/functions": typeof teams_functions;
  "teams/permissions": typeof teams_permissions;
  "teams/queries": typeof teams_queries;
  "transactions/functions": typeof transactions_functions;
  "transactions/queries": typeof transactions_queries;
  "transactions/validateDonorCategory": typeof transactions_validateDonorCategory;
  "users/functions": typeof users_functions;
  "users/getCurrentUser": typeof users_getCurrentUser;
  "users/permissions": typeof users_permissions;
  "users/queries": typeof users_queries;
  "utils/addProjectNames": typeof utils_addProjectNames;
  "utils/categoryMapping": typeof utils_categoryMapping;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
