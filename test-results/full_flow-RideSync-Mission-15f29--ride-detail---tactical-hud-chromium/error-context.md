# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: full_flow.spec.ts >> RideSync Mission E2E >> complete flow: dashboard -> ride detail -> tactical hud
- Location: tests\e2e\full_flow.spec.ts:4:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected pattern: /RIDE SYNC/i
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    3 × locator resolved to <h1 class="text-5xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.85] uppercase italic select-none">…</h1>
      - unexpected value "SYNC THE RIDE. "

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]:
      - link "RideSync Logo RIDESYNC EST. 2023 • MC hub" [ref=e6] [cursor=pointer]:
        - /url: /
        - img "RideSync Logo" [ref=e8]
        - generic [ref=e9]:
          - generic [ref=e10]: RIDESYNC
          - generic [ref=e11]: EST. 2023 • MC hub
      - generic [ref=e12]:
        - link "The Hub" [ref=e13] [cursor=pointer]:
          - /url: "#the hub"
        - link "The Tribe" [ref=e14] [cursor=pointer]:
          - /url: "#the tribe"
        - link "Routes" [ref=e15] [cursor=pointer]:
          - /url: "#routes"
        - link "Support" [ref=e16] [cursor=pointer]:
          - /url: "#support"
      - generic [ref=e17]:
        - button "Switch to Daylight mode" [ref=e18]:
          - img [ref=e19]
        - link "Sign In" [ref=e25] [cursor=pointer]:
          - /url: /login
        - button "Join the Brotherhood" [ref=e26]:
          - generic [ref=e27]:
            - img [ref=e28]
            - text: Join the Brotherhood
  - generic [ref=e33]:
    - generic [ref=e34]:
      - generic [ref=e35]:
        - img [ref=e36]
        - text: Asphalt Brotherhood
      - heading "SYNC THE RIDE." [level=1] [ref=e39]:
        - text: SYNC
        - text: THE RIDE.
    - generic [ref=e40]:
      - paragraph [ref=e41]: The ultimate community hub for the Indian rider. No GPS tracking, just sheer coordination, safety, and the spirit of the long road.
      - button "Claim Your Patch" [ref=e43]:
        - generic [ref=e44]:
          - text: Claim Your Patch
          - img [ref=e45]
  - generic [ref=e52]:
    - generic [ref=e53]:
      - generic [ref=e54]: "01."
      - heading "No Lone Wolves" [level=3] [ref=e55]
      - paragraph [ref=e56]: We ride together or not at all. Sync with groups that match your bike and your pace.
    - generic [ref=e57]:
      - generic [ref=e58]: "02."
      - heading "Respect the Build" [level=3] [ref=e59]
      - paragraph [ref=e60]: From vintage restaurations to modern beasts, every rider finds their place in the RideSync hierarchy.
    - generic [ref=e61]:
      - generic [ref=e62]: "03."
      - heading "Asphalt Ethics" [level=3] [ref=e63]
      - paragraph [ref=e64]: Safety isn't an option. It's the law of the road. Mechanical support and SOS are built into our DNA.
  - generic [ref=e66]:
    - generic [ref=e67]:
      - heading "The Tribe Arsenal." [level=2] [ref=e68]
      - paragraph [ref=e69]: Built for the mechanical soul. Tools that don't get in the way of the wind.
    - generic [ref=e70]:
      - button "Community Sync Found a club. Join a crew. Rise through the ranks from Rider to Founder. 1" [ref=e71]:
        - generic [ref=e72]:
          - img [ref=e74]
          - heading "Community Sync" [level=3] [ref=e79]
          - paragraph [ref=e80]: Found a club. Join a crew. Rise through the ranks from Rider to Founder.
        - generic [ref=e82]: "1"
      - button "Route Planning No more messy WhatsApp pins. Dedicated waypoints for fuel and fuel for the soul. 2" [ref=e83]:
        - generic [ref=e84]:
          - img [ref=e86]
          - heading "Route Planning" [level=3] [ref=e89]
          - paragraph [ref=e90]: No more messy WhatsApp pins. Dedicated waypoints for fuel and fuel for the soul.
        - generic [ref=e92]: "2"
      - button "Mechanical SOS Breakdown in the middle of nowhere? Signal the nearby brotherhood for back-up. 3" [ref=e93]:
        - generic [ref=e94]:
          - img [ref=e96]
          - heading "Mechanical SOS" [level=3] [ref=e98]
          - paragraph [ref=e99]: Breakdown in the middle of nowhere? Signal the nearby brotherhood for back-up.
        - generic [ref=e101]: "3"
      - button "Ride Vetting Know who you're riding with. Verified profiles and safety ratings for every member. 4" [ref=e102]:
        - generic [ref=e103]:
          - img [ref=e105]
          - heading "Ride Vetting" [level=3] [ref=e107]
          - paragraph [ref=e108]: Know who you're riding with. Verified profiles and safety ratings for every member.
        - generic [ref=e110]: "4"
      - button "Real-time Pings Instant alerts for road hazards, police checkpoints, and hidden gems. 5" [ref=e111]:
        - generic [ref=e112]:
          - img [ref=e114]
          - heading "Real-time Pings" [level=3] [ref=e116]
          - paragraph [ref=e117]: Instant alerts for road hazards, police checkpoints, and hidden gems.
        - generic [ref=e119]: "5"
      - button "Club Events Coordinate meetups, anniversary rides, and long-haul expeditions with ease. 6" [ref=e120]:
        - generic [ref=e121]:
          - img [ref=e123]
          - heading "Club Events" [level=3] [ref=e125]
          - paragraph [ref=e126]: Coordinate meetups, anniversary rides, and long-haul expeditions with ease.
        - generic [ref=e128]: "6"
  - generic [ref=e131]:
    - heading "THE ASPHALT IS CALLING." [level=2] [ref=e132]:
      - text: THE ASPHALT
      - text: IS CALLING.
    - button "Join the Brotherhood" [ref=e133]:
      - generic [ref=e134]:
        - text: Join the Brotherhood
        - img [ref=e135]
  - contentinfo [ref=e137]:
    - generic [ref=e138]:
      - generic [ref=e139]:
        - generic [ref=e140]:
          - img "RideSync" [ref=e142]
          - generic [ref=e143]: RIDESYNC
        - paragraph [ref=e144]: Dedicated to the riders of Bharat. Built on asphalt, fueled by brotherhood. EST 2023.
      - generic [ref=e145]:
        - heading "The Hub" [level=4] [ref=e146]
        - list [ref=e147]:
          - listitem [ref=e148]:
            - button "Active Rides" [ref=e149]
          - listitem [ref=e150]:
            - button "Find a Club" [ref=e151]
          - listitem [ref=e152]:
            - button "The Garage" [ref=e153]
      - generic [ref=e154]:
        - heading "Base Ops" [level=4] [ref=e155]
        - list [ref=e156]:
          - listitem [ref=e157]:
            - button "Join Mission" [ref=e158]
          - listitem [ref=e159]:
            - button "Profile Intel" [ref=e160]
          - listitem [ref=e161]:
            - button "Start Expedition" [ref=e162]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('RideSync Mission E2E', () => {
  4  |   test('complete flow: dashboard -> ride detail -> tactical hud', async ({ page }) => {
  5  |     // 1. Visit Dashboard
  6  |     await page.goto('/');
> 7  |     await expect(page.locator('h1')).toContainText(/RIDE SYNC/i);
     |                                      ^ Error: expect(locator).toContainText(expected) failed
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
  38 |     await expect(page.locator('text=Vanguard Groups')).toBeVisible();
  39 |     
  40 |     // Click on a community
  41 |     await page.click('text=View Sector');
  42 |     await expect(page.locator('button:has-text("Join Community")')).toBeVisible();
  43 |   });
  44 | });
  45 | 
```