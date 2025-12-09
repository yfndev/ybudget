import { expect, test } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const TEST_EMAIL = "user@test.com";
const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

async function cleanup() {
  await convex.mutation(api.testing.functions.clearTestData, {
    email: TEST_EMAIL,
  });
}

test.beforeEach(cleanup);
test.afterEach(cleanup);

test("create, rename and archive project", async ({ page }) => {
  await page.goto("/test-auth");
  await page.getByTestId("test-auth-submit").click();
  await expect(page.getByText("Wie heißt dein Verein?")).toBeVisible();

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
