import { expect, test } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const TEST_EMAIL = "transaction@test.com";

function getConvex() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

async function cleanup() {
  await getConvex().mutation(api.testing.functions.clearTestData, {
    email: TEST_EMAIL,
  });
}

function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
}

test.beforeEach(cleanup);
test.afterEach(cleanup);

test("create and delete transaction", async ({ page, context }) => {
  await context.clearCookies();
  await page.goto("/test-auth");
  await page.evaluate(() => localStorage.clear());
  await expect(
    page.getByRole("heading", { name: "Test Authentication" }),
  ).toBeVisible();
  await page.getByTestId("test-auth-email").fill(TEST_EMAIL);
  await page.getByTestId("test-auth-submit").click();
  await expect(page.getByText("Willkommen bei YBudget :)")).toBeVisible({
    timeout: 10000,
  });
  await page.getByRole("textbox", { name: "Wie heißt dein Verein?" }).click();
  await page
    .getByRole("textbox", { name: "Wie heißt dein Verein?" })
    .fill("Test Verein");
  await page.getByRole("button", { name: "Loslegen" }).click();
  await expect(page.getByText("Willkommen bei YBudget! 🥳")).toBeVisible();
  await page.getByRole("button", { name: "Projekt hinzufügen" }).click();
  await page
    .getByRole("textbox", { name: "Projektname*" })
    .fill("Test Projekt");
  await page.getByRole("button", { name: "Projekt erstellen" }).click();
  await expect(page.getByText("Projekt erstellt!")).toBeVisible();
  await page.getByRole("button", { name: "Hinzufügen", exact: true }).click();
  await page.getByRole("menuitem", { name: "Förderer hinzufügen ⇧⌘F" }).click();
  await page.getByRole("textbox", { name: "Name" }).fill("Test Förderer");
  await page.getByRole("button", { name: "Erstellen" }).click();
  await expect(page.getByText("Förderer erstellt!")).toBeVisible();
  await page.getByRole("button", { name: "Hinzufügen", exact: true }).click();
  await page.getByRole("menuitem", { name: "Ausgabe planen ⌘E" }).click();
  await page.getByRole("textbox", { name: "Wie viel?" }).fill("1");
  await page.getByRole("textbox", { name: "TT.MM.JJJJ" }).click();
  await page
    .getByRole("textbox", { name: "TT.MM.JJJJ" })
    .fill(getCurrentDate());
  await page.getByRole("textbox", { name: "Empfänger" }).click();
  await page.getByRole("textbox", { name: "Empfänger" }).fill("Test Empfänger");
  await page.getByRole("textbox", { name: "Empfänger" }).press("Tab");
  await page
    .getByRole("textbox", { name: "Beschreibung" })
    .fill("Test Beschreibung");
  await page.getByRole("textbox", { name: "Projekt suchen..." }).click();
  await page.getByRole("button", { name: "Test Projekt" }).click();
  await page
    .getByRole("textbox", { name: "Kategorie suchen..." })
    .fill("Spenden");
  await page
    .getByRole("textbox", { name: "Kategorie suchen..." })
    .press("Enter");
  await page.getByRole("textbox", { name: "Förderer suchen..." }).click();
  await page.getByRole("button", { name: "Test Fördererdonation" }).click();
  await page.getByRole("button", { name: "Ausgabe planen" }).click();
  await expect(page.getByText("Ausgabe gespeichert!")).toBeVisible();
  await page.getByRole("link", { name: "Transaktionen" }).click();
  await expect(
    page.locator("#tour-transactions-table").getByText("Test Projekt"),
  ).toBeVisible();
  await expect(
    page.locator("tbody").getByText("Test Beschreibung"),
  ).toBeVisible();
  await expect(
    page.locator("#tour-transactions-table").getByText("-1,00 €"),
  ).toBeVisible();
  await expect(
    page.locator("#tour-transactions-table").getByText("Geplant"),
  ).toBeVisible();
  await page
    .locator("#tour-transactions-table tbody tr")
    .first()
    .getByRole("button")
    .click();
  await page
    .locator("#tour-transactions-table tbody tr")
    .first()
    .getByRole("button")
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "Transaktion löschen?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Löschen" }).click();
  await expect(
    page.getByRole("cell", { name: "Keine Ergebnisse" }),
  ).toBeVisible();
});
