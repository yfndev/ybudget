import { expect, test } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const TEST_EMAIL = "user@test.com";
const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

test.afterEach(async () => {
  await convex.mutation(api.testing.functions.clearTestData, {
    email: TEST_EMAIL,
  });
});

test("create and delete transaction", async ({ page }) => {
  await page.goto("/test-auth");
  await page.getByTestId("test-auth-submit").click();
  await expect(page.getByText("Wie heißt dein Verein?")).toBeVisible();

  await page
    .getByRole("textbox", { name: "Wie heißt dein Verein?" })
    .fill("Test Verein");
  await page.getByRole("button", { name: "Loslegen" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "Hinzufügen", exact: true }).click();
  await page.getByText("Ausgabe planen").click();
  await page.getByRole("textbox", { name: "Wie viel?" }).fill("1");
  await page.getByRole("textbox", { name: "TT.MM.JJJJ" }).fill("01.01.2050");
  await page.getByRole("textbox", { name: "Empfänger" }).fill("Empfänger");
  await page.getByRole("textbox", { name: "Beschreibung" }).fill("Beschreibung");

  await page.getByRole("textbox", { name: "Projekt suchen..." }).click();
  await page.getByRole("button", { name: "Neues Projekt erstellen" }).click();
  await page.getByRole("textbox", { name: "Projektname*" }).fill("Test Projekt");
  await page.getByRole("button", { name: "Projekt erstellen" }).click();

  await page.getByRole("button", { name: "Spenden" }).click();
  await page.getByRole("button", { name: "Ausgabe planen" }).click();

  await page.getByRole("link", { name: "Transaktionen" }).click();
  await page.getByRole("button", { name: "Datumsbereich wählen" }).click();
  await page.getByRole("button", { name: "Alles" }).click();

  await expect(
    page.locator("#tour-transactions-table").getByText("Test Projekt"),
  ).toBeVisible();
  await expect(page.locator("tbody").getByText("Beschreibung")).toBeVisible();
  await expect(page.getByText("Spenden")).toBeVisible();
  await expect(page.getByText("-1,00 €")).toBeVisible();

  await page
    .locator("#tour-transactions-table")
    .getByRole("button")
    .filter({ hasText: /^$/ })
    .click();
  await page
    .getByRole("button")
    .filter({ hasText: /^$/ })
    .nth(1)
    .click();
  await page.getByRole("button", { name: "Löschen" }).click();
  await expect(page.getByText("Transaktion gelöscht")).toBeVisible();
});
