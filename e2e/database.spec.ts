import { test, expect } from "@playwright/test";

function getTestParams(projectName: string, testIndex: number) {
  let P = 0;
  if (projectName === "firefox") P = 1;
  if (projectName === "webkit") P = 2;

  const dbNames = ["postgres", "db_dump_test", "template1"];
  const dbName = dbNames[(P + testIndex) % 3];

  const envOptions = ["development", "staging", "production"];
  const envDisplays = ["Development", "Staging", "Production"];
  
  const envOption = envOptions[P];
  const envDisplay = envDisplays[P];

  return { dbName, envOption, envDisplay };
}

test.describe("Database Connection CRUD E2E Tests", () => {
  
  test.beforeEach(async ({ page }) => {
    // Perform login before each test
    await page.goto("/login");
    await page.fill('input[name="email"]', "testuser@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard\/databases/);
  });

  test("should successfully verify and add a new database connection", async ({ page }) => {
    const { dbName, envOption, envDisplay } = getTestParams(test.info().project.name, 0);

    // Click "Add Database" button
    await page.click('button:has-text("Add Database")');
    await expect(page.locator("form span:has-text('Add Database')")).toBeVisible();

    // Fill in connection details pointing to our project-specific test db
    await page.fill('input[placeholder="Database Name"]', dbName);
    await page.fill('input[placeholder="Host"]', "localhost");
    await page.fill('input[placeholder="Port"]', "5433");
    await page.selectOption("select#dbEngine", "postgresql");
    await page.selectOption("select#environment", envOption);
    await page.fill('input[placeholder="Username"]', "postgres");
    await page.fill('input[placeholder="Password"]', "root");

    // Click "Verify Connection"
    await page.click('button:has-text("Verify Connection")');
    await expect(page.locator("text=Connection verified successfully")).toBeVisible({ timeout: 15000 });

    // Click "Add Database" (which becomes active now)
    await page.click('form button:has-text("Add Database")');
    await expect(page.locator("text=Database added successfully")).toBeVisible({ timeout: 15000 });

    // Check that the new database row is displayed on the dashboard (exact column match)
    const databaseRow = page.locator("tr")
      .filter({ has: page.locator("td").first().filter({ hasText: new RegExp(`^${dbName}$`) }) })
      .filter({ hasText: envDisplay });
    await expect(databaseRow.first()).toBeVisible({ timeout: 10000 });
  });

  test("should successfully edit an existing database connection", async ({ page }) => {
    const { dbName, envOption, envDisplay } = getTestParams(test.info().project.name, 1);

    // 1. Add a temporary database connection specifically for editing
    await page.click('button:has-text("Add Database")');
    await page.fill('input[placeholder="Database Name"]', dbName);
    await page.fill('input[placeholder="Host"]', "localhost");
    await page.fill('input[placeholder="Port"]', "5433");
    await page.selectOption("select#dbEngine", "postgresql");
    await page.selectOption("select#environment", envOption);
    await page.fill('input[placeholder="Username"]', "postgres");
    await page.fill('input[placeholder="Password"]', "root");
    await page.click('button:has-text("Verify Connection")');
    await expect(page.locator("text=Connection verified successfully")).toBeVisible({ timeout: 15000 });
    await page.click('form button:has-text("Add Database")');
    await expect(page.locator("text=Database added successfully")).toBeVisible({ timeout: 15000 });

    // 2. Locate the added connection and click edit (exact column match)
    const databaseRow = page.locator("tr")
      .filter({ has: page.locator("td").first().filter({ hasText: new RegExp(`^${dbName}$`) }) })
      .filter({ hasText: envDisplay })
      .first();
    await expect(databaseRow).toBeVisible();

    const menuButton = databaseRow.locator("button").last();
    await menuButton.click();

    // Click the Edit option
    await page.click('button:has-text("Edit"), button:has-text("Edit Connection")');
    await expect(page.locator("form span:has-text('Edit Database')")).toBeVisible();

    // Wait for the modal to load existing database details
    await expect(page.locator('input[placeholder="Host"]')).toHaveValue("localhost");

    // Change Host to another valid value (e.g. 127.0.0.1)
    await page.fill('input[placeholder="Host"]', "127.0.0.1");

    // Click "Verify Connection" since changing fields resets verification
    await page.click('button:has-text("Verify Connection")');
    await expect(page.locator("text=Connection verified successfully")).toBeVisible({ timeout: 15000 });

    // Save changes
    await page.click('button[type="submit"]');

    // Wait for update verification
    await expect(databaseRow).toBeVisible({ timeout: 10000 });
  });

  test("should successfully delete a database connection", async ({ page }) => {
    const { dbName, envOption, envDisplay } = getTestParams(test.info().project.name, 2);

    // 1. Add a temporary database connection specifically for deletion
    await page.click('button:has-text("Add Database")');
    await page.fill('input[placeholder="Database Name"]', dbName);
    await page.fill('input[placeholder="Host"]', "localhost");
    await page.fill('input[placeholder="Port"]', "5433");
    await page.selectOption("select#dbEngine", "postgresql");
    await page.selectOption("select#environment", envOption);
    await page.fill('input[placeholder="Username"]', "postgres");
    await page.fill('input[placeholder="Password"]', "root");
    await page.click('button:has-text("Verify Connection")');
    await expect(page.locator("text=Connection verified successfully")).toBeVisible({ timeout: 15000 });
    await page.click('form button:has-text("Add Database")');
    await expect(page.locator("text=Database added successfully")).toBeVisible({ timeout: 15000 });

    // 2. Locate the connection and delete it (exact column match)
    const databaseRow = page.locator("tr")
      .filter({ has: page.locator("td").first().filter({ hasText: new RegExp(`^${dbName}$`) }) })
      .filter({ hasText: envDisplay })
      .first();
    await expect(databaseRow).toBeVisible();

    const menuButton = databaseRow.locator("button").last();
    await menuButton.click();

    // Click Delete option
    await page.click('button:has-text("Delete"), button:has-text("Delete Connection")');

    // Verify Delete confirmation modal is shown
    await expect(page.locator("text=Do you really want to delete database")).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Confirm Delete")');

    // Confirm deletion success and that the row is removed from page (exact column match check)
    const exactDeletedRow = page.locator("tr")
      .filter({ has: page.locator("td").first().filter({ hasText: new RegExp(`^${dbName}$`) }) })
      .filter({ hasText: envDisplay });
    await expect(exactDeletedRow.first()).not.toBeVisible({ timeout: 10000 });
  });
});
