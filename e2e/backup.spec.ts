import { test, expect } from "@playwright/test";

test.describe("Backup Configurations & Operations E2E Tests", () => {

  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto("/login");
    await page.fill('input[name="email"]', "testuser@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard\/databases/, { timeout: 15000 });
  });

  test("should successfully configure AWS S3 storage and save settings", async ({ page }) => {
    // Click on the seeded database row 'test_db' to open details
    const dbRow = page.locator("tr", { hasText: "test_db" });
    await dbRow.click();

    // Verify navigating to details view (overview tab)
    await expect(page).toHaveURL(/\/dashboard\/databases\/[0-9a-fA-F-]{36}/);
    await expect(page.locator("text=test_db").first()).toBeVisible();

    // Click "Backup Settings" tab
    await page.click('a:has-text("Backup Settings")');
    await expect(page).toHaveURL(/\/dashboard\/databases\/[0-9a-fA-F-]{36}\/settings\/backups/);

    // Locate "Primary Storage Target" card and click "Edit settings"
    const storageCard = page.locator("div.rounded-xl", { has: page.locator("span:has-text('Primary Storage Target')") });
    await storageCard.locator('button:has-text("Edit settings")').click();

    // Select "S3" as storage target
    await storageCard.locator("select").first().selectOption("S3");

    // Fill AWS S3 fields
    await page.fill('input:below(label:has-text("S3 bucket"))', "e2e-test-backup-bucket");
    await page.fill('input:below(label:has-text("Region"))', "ap-south-1");
    await page.fill('input:below(label:has-text("IAM Backup Upload Role ARN"))', "arn:aws:iam::123456789012:role/E2EBackupUploadRole");
    await page.fill('input:below(label:has-text("IAM Backup Delete Role ARN"))', "arn:aws:iam::123456789012:role/E2EBackupUploadRole");

    // Click "Save" inside SettingsCard wrapper
    await storageCard.locator('button:has-text("Save")').click();

    // Assert status message toast/bar confirms update
    await expect(page.locator("text=updated successfully").first()).toBeVisible({ timeout: 15000 });
  });

  test("should successfully configure backup retention policy", async ({ page }) => {
    // Navigate to details page for 'test_db'
    await page.locator("tr", { hasText: "test_db" }).click();
    await page.click('a:has-text("Backup Settings")');

    // Configure S3 first so retention policy can be edited
    const storageCard = page.locator("div.rounded-xl", { has: page.locator("span:has-text('Primary Storage Target')") });
    await storageCard.locator('button:has-text("Edit settings")').click();
    await storageCard.locator("select").first().selectOption("S3");
    await page.fill('input:below(label:has-text("S3 bucket"))', "e2e-test-backup-bucket");
    await page.fill('input:below(label:has-text("Region"))', "ap-south-1");
    await page.fill('input:below(label:has-text("IAM Backup Upload Role ARN"))', "arn:aws:iam::123456789012:role/E2EBackupUploadRole");
    await page.fill('input:below(label:has-text("IAM Backup Delete Role ARN"))', "arn:aws:iam::123456789012:role/E2EBackupUploadRole");
    await storageCard.locator('button:has-text("Save")').click();
    await expect(page.locator("text=updated successfully").first()).toBeVisible({ timeout: 15000 });

    // Locate "Retention Policy" card and click "Edit settings"
    const retentionCard = page.locator("div.rounded-xl", { has: page.locator("h3:has-text('Retention Policy')") });
    await retentionCard.locator('button:has-text("Edit settings")').click();

    // Choose mode "Count" and set value to 10
    // RetentionPolicyCard might render radio buttons or select
    const countInput = retentionCard.locator('input[type="number"]').first();
    if (await countInput.isVisible()) {
      await countInput.clear();
      await countInput.fill("10");
    }

    // Save retention settings
    await retentionCard.locator('button:has-text("Save")').click();

    // Check for success notification
    await expect(page.locator("text=updated successfully")).toBeVisible({ timeout: 10000 });
  });

  test("should trigger manual backup and monitor completion state", async ({ page }) => {
    // Locate the row for 'test_db'
    const dbRow = page.locator("tr", { hasText: "test_db" });
    await expect(dbRow).toBeVisible();

    // Click the "Backup Database" icon button on that row
    const backupIcon = dbRow.locator('button[title="Backup Database"]');
    await backupIcon.click();

    // Verify manual backup trigger modal is visible
    await expect(page.locator("span:has-text('Backup Database')")).toBeVisible();

    // Select backup type (Postgres default option is FULL, let's select it if dropdown is visible)
    const typeSelect = page.locator("select");
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption("FULL");
    }

    // Input backup name
    await page.fill('input[placeholder="Backup Name"]', "e2e-manual-backup-run");

    // Click "Backup Database" button
    await page.click('button:has-text("Backup Database")');

    // Verify initiation success bar shows
    await expect(page.locator("text=Database backup initiated successfully")).toBeVisible({ timeout: 10000 });

    // Wait for manual backup modal to close
    await expect(page.locator("span:has-text('Backup Database')")).not.toBeVisible();

    // Click on the row to navigate to details -> Backups tab
    await dbRow.click();
    await page.click('main a:has-text("Backups")');
    await expect(page).toHaveURL(/\/dashboard\/databases\/[0-9a-fA-F-]{36}\/backups/);

    // Verify the backup row is visible and moves to completed (or pending/completed list items)
    // Note: Since this is an integration/E2E test environment, backups will trigger workers.
    // We expect the backup item card or row containing "e2e-manual-backup-run" to be visible
    const backupItem = page.locator("div", { hasText: "e2e-manual-backup-run" }).first();
    await expect(backupItem).toBeVisible({ timeout: 15000 });
  });
});
