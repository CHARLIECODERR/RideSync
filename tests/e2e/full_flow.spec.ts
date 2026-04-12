import { test, expect } from '@playwright/test';

test.describe('RideSync Mission E2E', () => {
  test('complete flow: dashboard -> ride detail -> tactical hud', async ({ page }) => {
    // 1. Visit Dashboard
    await page.goto('/');
    await expect(page.locator('h1')).toContainText(/RIDE SYNC/i);

    // 2. Navigate to Rides
    await page.click('text=Mission Control'); // Assuming sidebar link
    await expect(page).toHaveURL(/.*rides/);

    // 3. View a ride
    await page.click('text=View Intel'); // Click on a ride card
    await expect(page.locator('h1')).toBeVisible();

    // 4. Start the ride
    const startBtn = page.locator('text=Start Ride');
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await expect(page.locator('text=Finish Ride')).toBeVisible();
    }

    // 5. Enter Tactical Mode
    await page.click('text=Enter Ride Mode');
    
    // Check HUD elements
    await expect(page.locator('text=Speed')).toBeVisible();
    await expect(page.locator('text=Abort Ride')).toBeVisible();
    
    // 6. Exit HUD
    await page.click('text=Exit HUD');
    await expect(page.locator('text=Enter Ride Mode')).toBeVisible();
  });

  test('community exploration', async ({ page }) => {
    await page.goto('/communities');
    await expect(page.locator('text=Vanguard Groups')).toBeVisible();
    
    // Click on a community
    await page.click('text=View Sector');
    await expect(page.locator('button:has-text("Join Community")')).toBeVisible();
  });
});
