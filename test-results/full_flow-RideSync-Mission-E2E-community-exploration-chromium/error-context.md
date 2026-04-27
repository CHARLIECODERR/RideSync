# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full_flow.spec.ts >> RideSync Mission E2E >> community exploration
- Location: tests\e2e\full_flow.spec.ts:36:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Vanguard Groups')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Vanguard Groups')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Switch to Daylight mode" [ref=e4]:
    - img [ref=e5]
  - generic [ref=e14]:
    - generic [ref=e15]:
      - img "RideSync Logo" [ref=e17]
      - generic [ref=e18]:
        - generic [ref=e19]: RIDESYNC
        - generic [ref=e20]: EST. 2023 • MC hub
    - heading "The ultimate coordination hub for motorcyclists." [level=1] [ref=e21]
    - generic [ref=e22]:
      - generic [ref=e23]:
        - img [ref=e25]
        - generic [ref=e27]:
          - heading "Real-time Coordination" [level=3] [ref=e28]
          - paragraph [ref=e29]: Synced locations and real-time alerts across your entire group.
      - generic [ref=e30]:
        - img [ref=e32]
        - generic [ref=e37]:
          - heading "Community Driven" [level=3] [ref=e38]
          - paragraph [ref=e39]: Join thousands of riders in specialized clubs and regional groups.
    - generic [ref=e40]:
      - img "user" [ref=e42]
      - img "user" [ref=e44]
      - img "user" [ref=e46]
      - img "user" [ref=e48]
      - img "user" [ref=e50]
      - generic [ref=e51]: Join the pack
  - generic [ref=e53]:
    - generic [ref=e54]:
      - heading "Welcome back" [level=2] [ref=e55]
      - paragraph [ref=e56]: Sign in to access your ride dashboard.
    - generic [ref=e57]:
      - generic [ref=e58]:
        - text: Email Address
        - generic [ref=e59]:
          - img [ref=e60]
          - textbox "name@example.com" [ref=e63]
      - generic [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]: Password
          - button "Forgot password?" [ref=e67]
        - generic [ref=e68]:
          - img [ref=e69]
          - textbox "••••••••" [ref=e72]
      - button "Sign In" [ref=e73]:
        - text: Sign In
        - img [ref=e74]
    - generic [ref=e80]: Or continue with
    - button "Google Sign in with Google" [ref=e81]:
      - img "Google" [ref=e82]
      - text: Sign in with Google
    - paragraph [ref=e84]:
      - text: New to RideSync?
      - button "Create one here" [ref=e85]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('RideSync Mission E2E', () => {
  4  |   test('complete flow: dashboard -> ride detail -> tactical hud', async ({ page }) => {
  5  |     // 1. Visit Dashboard
  6  |     await page.goto('/');
  7  |     await expect(page.locator('h1')).toContainText(/RIDE SYNC/i);
  8  | 
  9  |     // 2. Navigate to Rides
  10 |     await page.click('text=Mission Control'); // Assuming sidebar link
  11 |     await expect(page).toHaveURL(/.*rides/);
  12 | 
  13 |     // 3. View a ride
  14 |     await page.click('text=View Intel'); // Click on a ride card
  15 |     await expect(page.locator('h1')).toBeVisible();
  16 | 
  17 |     // 4. Start the ride
  18 |     const startBtn = page.locator('text=Start Ride');
  19 |     if (await startBtn.isVisible()) {
  20 |       await startBtn.click();
  21 |       await expect(page.locator('text=Finish Ride')).toBeVisible();
  22 |     }
  23 | 
  24 |     // 5. Enter Tactical Mode
  25 |     await page.click('text=Enter Ride Mode');
  26 |     
  27 |     // Check HUD elements
  28 |     await expect(page.locator('text=Speed')).toBeVisible();
  29 |     await expect(page.locator('text=Abort Ride')).toBeVisible();
  30 |     
  31 |     // 6. Exit HUD
  32 |     await page.click('text=Exit HUD');
  33 |     await expect(page.locator('text=Enter Ride Mode')).toBeVisible();
  34 |   });
  35 | 
  36 |   test('community exploration', async ({ page }) => {
  37 |     await page.goto('/communities');
> 38 |     await expect(page.locator('text=Vanguard Groups')).toBeVisible();
     |                                                        ^ Error: expect(locator).toBeVisible() failed
  39 |     
  40 |     // Click on a community
  41 |     await page.click('text=View Sector');
  42 |     await expect(page.locator('button:has-text("Join Community")')).toBeVisible();
  43 |   });
  44 | });
  45 | 
```