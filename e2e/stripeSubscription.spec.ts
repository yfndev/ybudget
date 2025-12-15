import { expect, test, type Page } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const TEST_EMAIL = "stripe@test.com";
const FREE_TIER_LIMIT = 10;

function getConvex() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}

async function cleanup() {
  const convex = getConvex();
  await convex.action(api.testing.stripe.cancelTestSubscription, {
    email: TEST_EMAIL,
  });
  await convex.mutation(api.testing.functions.clearTestData, {
    email: TEST_EMAIL,
  });
}

test.describe.serial("stripe subscription flow", () => {
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
  });

  test.afterAll(async () => {
    await cleanup();
    await page.close();
  });

  test("1. Free user sees project limit counter", async () => {
    await expect(page.getByText(`/${FREE_TIER_LIMIT})`)).toBeVisible({
      timeout: 10000,
    });
  });

  test("2. Free user gets paywall when limit is reached", async () => {
    const convex = getConvex();
    await convex.mutation(api.testing.functions.createMockProjects, {
      email: TEST_EMAIL,
      count: FREE_TIER_LIMIT,
    });

    await page.reload();
    await page.getByRole("button", { name: "Projekt hinzufügen" }).click();

    await expect(page.getByText("Ich hoffe YBudget gefällt dir")).toBeVisible();
    await expect(page.getByText("Unbegrenzt Projekte")).toBeVisible();

    await page.keyboard.press("Escape");
  });

  test("3. Upgrade button redirects to Stripe checkout", async () => {
    await page.getByRole("button", { name: "T Test User" }).click();
    await page.getByRole("menuitem", { name: "YBudget Premium" }).click();

    await expect(page.getByText("Ich hoffe YBudget gefällt dir")).toBeVisible();
    await page
      .getByRole("button", { name: "Auf YBudget Yearly upgraden" })
      .click();

    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15000 });
    expect(page.url()).toContain("checkout.stripe.com");
  });

  test("4. User with subscription (premium user) can create unlimited projects", async () => {
    await page.goto("/test-auth");
    await page.getByTestId("test-auth-email").fill(TEST_EMAIL);
    await page.getByTestId("test-auth-submit").click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
      timeout: 10000,
    });

    const convex = getConvex();
    await convex.mutation(api.testing.functions.createMockPayment, {
      email: TEST_EMAIL,
    });

    await page.reload();

    await expect(page.getByText(`/${FREE_TIER_LIMIT})`)).not.toBeVisible();

    await page.getByRole("button", { name: "Projekt hinzufügen" }).click();
    await expect(
      page.getByRole("heading", { name: "Neues Projekt/Department erstellen" }),
    ).toBeVisible();
    await page.getByLabel("Projektname*").fill("Premium Project");
    await page.getByRole("button", { name: "Projekt erstellen" }).click();

    await expect(page.getByText("Projekt erstellt")).toBeVisible();
  });

  test("5. Premium user sees billing menu", async () => {
    await page.getByRole("button", { name: "T Test User" }).click();
    await expect(page.getByRole("group")).toContainText("Abrechnung");
  });
});
