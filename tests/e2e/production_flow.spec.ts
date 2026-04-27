import { test, expect } from '@playwright/test';

// Helper to generate unique identifiers for test isolation
const uniqueId = () => Math.random().toString(36).substring(2, 7);

test.describe('RideSync Production Flow', () => {
  const testUser = {
    name: `Test Rider ${uniqueId()}`,
    email: `rider_${uniqueId()}@example.com`,
    password: 'Password123!',
  };

  const communityName = `Sector ${uniqueId().toUpperCase()}`;
  const rideName = `Expedition ${uniqueId().toUpperCase()}`;

  test('Full Life Cycle: Auth -> Community -> Ride -> HUD', async ({ page }) => {
    // 1. SIGNUP
    await page.goto('/signup');
    await page.fill('input[placeholder*="Full Name"]', testUser.name);
    await page.fill('input[placeholder*="Email"]', testUser.email);
    await page.fill('input[placeholder*="Password"]', testUser.password);
    await page.click('button:has-text("Join the Brotherhood")');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText(testUser.name.split(' ')[0]);

    // 2. CREATE COMMUNITY
    await page.goto('/communities');
    // Assuming there's a create button or a form
    const createCommBtn = page.locator('button:has-text("Found a Club")');
    if (await createCommBtn.isVisible()) {
        await createCommBtn.click();
    } else {
        await page.click('text=Found a Club');
    }
    
    await page.fill('input[placeholder*="Community Name"]', communityName);
    await page.fill('textarea[placeholder*="Description"]', 'Testing end-to-end production readiness.');
    await page.click('button:has-text("Establish Community")');

    // Verify community creation
    await expect(page.locator('h1')).toContainText(communityName);
    const joinCode = await page.locator('text=Join Code:').textContent();
    console.log(`Created community with code: ${joinCode}`);

    // 3. CREATE RIDE
    await page.click('button:has-text("Start Expedition")'); // Button inside community page
    await page.fill('input[placeholder*="Mission Name"]', rideName);
    await page.fill('textarea[placeholder*="Objective"]', 'Reaching the final waypoint.');
    
    // Fill Route (Simulated or valid locations)
    await page.fill('input[placeholder*="Start Location"]', 'Bangalore, India');
    await page.fill('input[placeholder*="End Location"]', 'Mysore, India');
    
    await page.click('button:has-text("Deploy Mission")');

    // 4. ENTER TACTICAL HUD
    await expect(page.locator('h1')).toContainText(rideName);
    await page.click('button:has-text("Start Ride")');
    await page.click('button:has-text("Enter Ride Mode")');

    // 5. VALIDATE HUD (NON-DUMMY CHECK)
    await expect(page.locator('text=SPEED')).toBeVisible();
    await expect(page.locator('text=KM/H')).toBeVisible();
    await expect(page.locator('text=REMAINING')).toBeVisible();

    // 6. FINISH RIDE
    await page.click('button:has-text("Exit HUD")');
    await page.click('button:has-text("Finish Ride")');
    await expect(page.locator('text=COMPLETED')).toBeVisible();
  });

  test('Joining via Tactical Code', async ({ page }) => {
    // This requires another user, but we can verify the Join page UI
    await page.goto('/join');
    await expect(page.locator('h1')).toContainText(/Enter Tactical Code/i);
    
    const input = page.locator('input[placeholder*="XXXXXX"]');
    await expect(input).toBeVisible();
    
    await input.fill('INVALID');
    await page.click('button:has-text("Request Induction")');
    await expect(page.locator('text=/not found/i')).toBeVisible();
  });
});
