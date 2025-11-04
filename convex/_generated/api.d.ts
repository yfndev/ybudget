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
import type * as categories_mutations from "../categories/mutations.js";
import type * as categories_queries from "../categories/queries.js";
import type * as donations_queries from "../donations/queries.js";
import type * as donors_functions from "../donors/functions.js";
import type * as donors_queries from "../donors/queries.js";
import type * as helpers_addProjectNames from "../helpers/addProjectNames.js";
import type * as http from "../http.js";
import type * as organizations_functions from "../organizations/functions.js";
import type * as organizations_queries from "../organizations/queries.js";
import type * as projects_functions from "../projects/functions.js";
import type * as projects_queries from "../projects/queries.js";
import type * as transactions_functions from "../transactions/functions.js";
import type * as transactions_queries from "../transactions/queries.js";
import type * as users_functions from "../users/functions.js";
import type * as users_getCurrentUser from "../users/getCurrentUser.js";
import type * as users_queries from "../users/queries.js";
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
  "categories/mutations": typeof categories_mutations;
  "categories/queries": typeof categories_queries;
  "donations/queries": typeof donations_queries;
  "donors/functions": typeof donors_functions;
  "donors/queries": typeof donors_queries;
  "helpers/addProjectNames": typeof helpers_addProjectNames;
  http: typeof http;
  "organizations/functions": typeof organizations_functions;
  "organizations/queries": typeof organizations_queries;
  "projects/functions": typeof projects_functions;
  "projects/queries": typeof projects_queries;
  "transactions/functions": typeof transactions_functions;
  "transactions/queries": typeof transactions_queries;
  "users/functions": typeof users_functions;
  "users/getCurrentUser": typeof users_getCurrentUser;
  "users/queries": typeof users_queries;
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
