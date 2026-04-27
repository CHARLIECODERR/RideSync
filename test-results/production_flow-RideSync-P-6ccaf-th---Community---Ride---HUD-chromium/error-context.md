# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: production_flow.spec.ts >> RideSync Production Flow >> Full Life Cycle: Auth -> Community -> Ride -> HUD
- Location: tests\e2e\production_flow.spec.ts:16:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="Full Name"]')
    - waiting for" http://localhost:5173/signup" navigation to finish...
    - navigated to "http://localhost:5173/signup"

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
  3  | // Helper to generate unique identifiers for test isolation
  4  | const uniqueId = () => Math.random().toString(36).substring(2, 7);
  5  | 
  6  | test.describe('RideSync Production Flow', () => {
  7  |   const testUser = {
  8  |     name: `Test Rider ${uniqueId()}`,
  9  |     email: `rider_${uniqueId()}@example.com`,
  10 |     password: 'Password123!',
  11 |   };
  12 | 
  13 |   const communityName = `Sector ${uniqueId().toUpperCase()}`;
  14 |   const rideName = `Expedition ${uniqueId().toUpperCase()}`;
  15 | 
  16 |   test('Full Life Cycle: Auth -> Community -> Ride -> HUD', async ({ page }) => {
  17 |     // 1. SIGNUP
  18 |     await page.goto('/signup');
> 19 |     await page.fill('input[placeholder*="Full Name"]', testUser.name);
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  20 |     await page.fill('input[placeholder*="Email"]', testUser.email);
  21 |     await page.fill('input[placeholder*="Password"]', testUser.password);
  22 |     await page.click('button:has-text("Join the Brotherhood")');
  23 | 
  24 |     // Wait for redirect to dashboard
  25 |     await expect(page).toHaveURL(/.*dashboard/);
  26 |     await expect(page.locator('h1')).toContainText(testUser.name.split(' ')[0]);
  27 | 
  28 |     // 2. CREATE COMMUNITY
  29 |     await page.goto('/communities');
  30 |     // Assuming there's a create button or a form
  31 |     const createCommBtn = page.locator('button:has-text("Found a Club")');
  32 |     if (await createCommBtn.isVisible()) {
  33 |         await createCommBtn.click();
  34 |     } else {
  35 |         await page.click('text=Found a Club');
  36 |     }
  37 |     
  38 |     await page.fill('input[placeholder*="Community Name"]', communityName);
  39 |     await page.fill('textarea[placeholder*="Description"]', 'Testing end-to-end production readiness.');
  40 |     await page.click('button:has-text("Establish Community")');
  41 | 
  42 |     // Verify community creation
  43 |     await expect(page.locator('h1')).toContainText(communityName);
  44 |     const joinCode = await page.locator('text=Join Code:').textContent();
  45 |     console.log(`Created community with code: ${joinCode}`);
  46 | 
  47 |     // 3. CREATE RIDE
  48 |     await page.click('button:has-text("Start Expedition")'); // Button inside community page
  49 |     await page.fill('input[placeholder*="Mission Name"]', rideName);
  50 |     await page.fill('textarea[placeholder*="Objective"]', 'Reaching the final waypoint.');
  51 |     
  52 |     // Fill Route (Simulated or valid locations)
  53 |     await page.fill('input[placeholder*="Start Location"]', 'Bangalore, India');
  54 |     await page.fill('input[placeholder*="End Location"]', 'Mysore, India');
  55 |     
  56 |     await page.click('button:has-text("Deploy Mission")');
  57 | 
  58 |     // 4. ENTER TACTICAL HUD
  59 |     await expect(page.locator('h1')).toContainText(rideName);
  60 |     await page.click('button:has-text("Start Ride")');
  61 |     await page.click('button:has-text("Enter Ride Mode")');
  62 | 
  63 |     // 5. VALIDATE HUD (NON-DUMMY CHECK)
  64 |     await expect(page.locator('text=SPEED')).toBeVisible();
  65 |     await expect(page.locator('text=KM/H')).toBeVisible();
  66 |     await expect(page.locator('text=REMAINING')).toBeVisible();
  67 | 
  68 |     // 6. FINISH RIDE
  69 |     await page.click('button:has-text("Exit HUD")');
  70 |     await page.click('button:has-text("Finish Ride")');
  71 |     await expect(page.locator('text=COMPLETED')).toBeVisible();
  72 |   });
  73 | 
  74 |   test('Joining via Tactical Code', async ({ page }) => {
  75 |     // This requires another user, but we can verify the Join page UI
  76 |     await page.goto('/join');
  77 |     await expect(page.locator('h1')).toContainText(/Enter Tactical Code/i);
  78 |     
  79 |     const input = page.locator('input[placeholder*="XXXXXX"]');
  80 |     await expect(input).toBeVisible();
  81 |     
  82 |     await input.fill('INVALID');
  83 |     await page.click('button:has-text("Request Induction")');
  84 |     await expect(page.locator('text=/not found/i')).toBeVisible();
  85 |   });
  86 | });
  87 | 
```