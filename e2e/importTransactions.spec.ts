import { expect, test, type Page } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const TEST_EMAIL = "import@test.com";

function getConvex() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

async function cleanup() {
  await getConvex().mutation(api.testing.functions.clearTestData, {
    email: TEST_EMAIL,
  });
}

test.describe
  .serial("import transactions flow (without csv import logic)", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    await cleanup();
    page = await browser.newPage();
    await page.context().clearCookies();
    await page.goto("/test-auth");
    await page.evaluate(() => localStorage.clear());
    await page.getByTestId("test-auth-email").fill(TEST_EMAIL);
    await page.getByTestId("test-auth-submit").click();

    await expect(page.getByText("Wie heißt dein Verein?")).toBeVisible({
      timeout: 10000,
    });
    await page
      .getByRole("textbox", { name: "Wie heißt dein Verein?" })
      .fill("Test Verein");
    await page.getByRole("button", { name: "Loslegen" }).click();
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    await getConvex().mutation(api.testing.seed.seedTestTransactions, {
      email: TEST_EMAIL,
    });
    await page.goto("/import");
    await expect(page.locator(".cursor-pointer")).toBeVisible({
      timeout: 10000,
    });
  });

  test.afterAll(async () => {
    await cleanup();
    await page.close();
  });

  test("1. Process first expense transaction", async () => {
    await expect(
      page.getByRole("textbox", { name: "Projekt suchen..." }),
    ).toBeVisible();
    await expect(page.getByText("1 / 3")).toBeVisible();

    await page.getByRole("textbox", { name: "Projekt suchen..." }).click();
    await page.getByRole("button", { name: "Test Projekt" }).click();
    await page
      .getByRole("textbox", { name: "Kategorie suchen..." })
      .fill("Spende");
    await page.locator("body > div").last().getByText("Spenden").click();
    await page
      .getByRole("textbox", { name: "Förderer suchen..." })
      .press("ControlOrMeta+Enter");
    await expect(page.getByText("Transaktion gespeichert")).toBeVisible();
  });

  test("2. Process second expense transaction", async () => {
    await page.goto("/import");
    await expect(
      page.getByRole("textbox", { name: "Projekt suchen..." }),
    ).toBeVisible();
    await expect(page.getByText("1 / 2")).toBeVisible();
    await expect(page.getByText("Processed 2")).toBeVisible();

    await page.getByRole("textbox", { name: "Projekt suchen..." }).click();
    await page.getByRole("button", { name: "Test Projekt" }).click();
    await page
      .getByRole("textbox", { name: "Kategorie suchen..." })
      .fill("Spende");
    await page.locator("body > div").last().getByText("Spenden").click();
    await page
      .getByRole("textbox", { name: "Förderer suchen..." })
      .press("ControlOrMeta+Enter");
    await expect(page.getByText("Transaktion gespeichert")).toBeVisible();
  });

  test("3. Split income transaction across projects", async () => {
    await page.goto("/import");
    await expect(
      page.getByRole("checkbox", {
        name: "Einnahme auf Departments aufteilen",
      }),
    ).toBeVisible({ timeout: 5000 });

    await page
      .getByRole("checkbox", { name: "Einnahme auf Departments aufteilen" })
      .click();

    await page.getByRole("button", { name: "Projekt hinzufügen" }).click();
    await page.getByRole("textbox", { name: "Projektname*" }).fill("Rücklagen");
    await page.getByRole("button", { name: "Projekt erstellen" }).click();
    await expect(page.getByText("Projekt erstellt!")).toBeVisible();

    await page.getByRole("textbox", { name: "0,00" }).first().fill("100");
    await page.getByRole("textbox", { name: "0,00" }).nth(1).fill("100");

    await expect(page.getByText("Verbleibend: 0,00 €")).toBeVisible();

    await page.getByRole("textbox", { name: "Kategorie suchen..." }).click();
    await page.getByRole("button", { name: "Spenden" }).click();
    await page
      .getByRole("textbox", { name: "Förderer suchen..." })
      .press("ControlOrMeta+Enter");
    await expect(page.getByText("Transaktion gespeichert")).toBeVisible();
  });

  test("4. Verify split transactions in table", async () => {
    await page.getByRole("link", { name: "Transaktionen" }).click();
    await expect(page.getByText("Processed 3 (Split)").first()).toBeVisible();

    await page
      .locator("#tour-transactions-table")
      .getByText("Rücklagen")
      .click();
    await page.getByText("Test Projekt").nth(1).click();
    await page.getByText("Processed 3 (Split)").nth(1).click();
    await expect(page.getByText("Rücklagen").nth(1)).toBeVisible();
  });
});
