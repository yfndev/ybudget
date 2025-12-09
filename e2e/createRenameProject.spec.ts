import { expect, test } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const TEST_EMAIL = "user@test.com";
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function cleanup() {
  await convex.mutation(api.testing.functions.clearTestData, {
    email: TEST_EMAIL,
  });
}

test.beforeEach(cleanup);
test.afterEach(cleanup);

test("create, rename and archive project", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/test-auth");
  await page.evaluate(() => localStorage.clear());
  await page.getByTestId("test-auth-submit").click();
  await expect(page.getByText("Wie heißt dein Verein?")).toBeVisible({ timeout: 10000 });

  await page
    .getByRole("textbox", { name: "Wie heißt dein Verein?" })
    .fill("Test Verein");
  await page.getByRole("button", { name: "Loslegen" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "Projekt hinzufügen" }).click();
  await page.getByRole("textbox", { name: "Projektname*" }).fill("Projekt1");
  await page.getByRole("button", { name: "Projekt erstellen" }).click();
  await expect(page.getByText("Projekt erstellt!")).toBeVisible();

  await page.getByRole("link", { name: "Projekt1" }).click({ button: "right" });
  await page.getByRole("menuitem", { name: "Umbenennen" }).click();
  await page.getByRole("textbox").fill("Projekt2");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByText("Projekt umbenannt")).toBeVisible();
  await expect(page.locator("#tour-project-nav")).toContainText("Projekt2");

  await page.getByRole("link", { name: "Projekt2" }).click({ button: "right" });
  await page.getByRole("menuitem", { name: "Archivieren" }).click();
  await expect(page.getByText("Projekt archiviert")).toBeVisible();
});
