import { test, expect } from "@playwright/test";

test.describe("NPC-402 Console Smoke Suite", () => {
  test("should load the developer console dashboard overview", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/NPC-402/i);
    await expect(page.getByText("AI Dialogue Infrastructure Control Center")).toBeVisible();
    await expect(page.getByText("Total API Requests")).toBeVisible();
  });

  test("should navigate to NPC Profiles page", async ({ page }) => {
    await page.goto("/dashboard/npcs");
    await expect(page.getByText("NPC Personas & Fee Vaults")).toBeVisible();
  });

  test("should navigate to Dialogue Sandbox", async ({ page }) => {
    await page.goto("/dashboard/sandbox");
    await expect(page.getByText("Dialogue Sandbox & x402 Telemetry")).toBeVisible();
  });

  test("should load authentication sign-in page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
  });
});
