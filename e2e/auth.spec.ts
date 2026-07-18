import { test, expect } from "@playwright/test";

test.describe("Authentication and Route Protection E2E Tests", () => {
  
  test("should redirect unauthenticated users away from private routes", async ({ page }) => {
    // Attempt to access databases dashboard
    await page.goto("/dashboard/databases");
    // Verify redirection to login page
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    await expect(page.locator("h1")).toHaveText("Login", { timeout: 15000 });
  });

  test("should show validation errors on registration form", async ({ page }) => {
    await page.goto("/register");

    // Click submit with empty fields
    await page.click('button[type="submit"]');

    // HTML5 validation or form-level validations should trigger.
    // Let's test custom validation by filling invalid inputs
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'abc');
    await page.fill('input[name="confirmPassword"]', 'xyz');

    await page.click('button[type="submit"]');

    // The passwords do not match and email is invalid. Let's make sure it doesn't log in
    await expect(page).toHaveURL(/\/register/);
  });

  test("should successfully login with seeded test user credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill login credentials (from our seeding script)
    await page.fill('input[name="email"]', "testuser@example.com");
    await page.fill('input[name="password"]', "Password123!");

    // Click submit
    await page.click('button[type="submit"]');

    // Should redirect to databases page
    await expect(page).toHaveURL(/\/dashboard\/databases/, { timeout: 15000 });

    // Should display the seeded database connection
    // Fix: use a specific table row locator to avoid strict mode violations
    await expect(page.locator("tr", { hasText: "test_db" })).toBeVisible({ timeout: 10000 });
  });

  test("should successfully log out", async ({ page }) => {
    // Perform login first
    await page.goto("/login");
    await page.fill('input[name="email"]', "testuser@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard\/databases/);

    // Let's locate the logout button in sidebar
    const logoutButton = page.locator('button:has-text("Log Out"), button:has-text("Logout"), a:has-text("Logout"), a:has-text("Log Out")').first();
    await logoutButton.click();

    // Confirm logout in modal
    const confirmLogoutButton = page.locator('button:has-text("Logout")').last();
    await confirmLogoutButton.click();

    // Verify redirected back to login page
    await expect(page).toHaveURL(/\/login/);
  });
});
