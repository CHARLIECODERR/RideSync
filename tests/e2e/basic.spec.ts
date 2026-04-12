import { test, expect } from '@playwright/test';

test('basic navigation and ride sync check', async ({ page }) => {
  await page.goto('/');

  // Check if we are on the dashboard
  await expect(page).toHaveTitle(/RideSync/);
  
  // Navigate to Rides
  await page.click('text=Rides');
  await expect(page).toHaveURL(/.*rides/);

  // Check if rides are listed
  const rideCards = page.locator('.group.rounded-\\[2\\.5rem\\]');
  await expect(rideCards).toBeVisible();
});

test('check community detail view', async ({ page }) => {
  await page.goto('/communities');
  
  // Click on a community if any
  const firstCommunity = page.locator('h3').first();
  if (await firstCommunity.isVisible()) {
      await firstCommunity.click();
      await expect(page.locator('h1')).toBeVisible();
  }
});
