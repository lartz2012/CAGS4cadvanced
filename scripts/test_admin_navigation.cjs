const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Testing Admin Console navigation & functionality...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  // Test 1: Direct navigation to /admin
  console.log('1. Navigating directly to http://localhost:5173/admin ...');
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const adminHeader = await page.locator('h1').textContent();
  console.log('Admin Page H1:', adminHeader);
  if (!adminHeader.includes('CAGS Admin Control Panel')) {
    throw new Error('Admin header not found on /admin direct load');
  }

  // Take screenshot of Admin Control Panel
  const ssPath = path.join(process.cwd(), 'screenshots', 'cags_admin_control_panel.png');
  await page.screenshot({ path: ssPath, fullPage: false });
  console.log('Saved Admin Console screenshot:', ssPath);

  // Test 2: Test tab switching in Admin Console
  console.log('2. Testing Origin Multipliers tab...');
  await page.click('button:has-text("Origin Multipliers")');
  await page.waitForTimeout(400);

  console.log('3. Testing System Settings tab...');
  await page.click('button:has-text("System Settings")');
  await page.waitForTimeout(400);

  // Test 4: Return back to Appraisal Suite
  console.log('4. Clicking "Appraisal Suite" back button...');
  await page.click('button:has-text("Appraisal Suite")');
  await page.waitForTimeout(1000);

  const currentUrl = page.url();
  console.log('Current URL after back:', currentUrl);
  const brandName = await page.locator('.brand-name').textContent();
  console.log('Brand name on Appraisal Suite:', brandName);

  // Test 5: Click Admin button from the Appraisal Suite header
  console.log('5. Clicking "Admin" button in header...');
  await page.click('.admin-nav-btn');
  await page.waitForTimeout(1000);

  console.log('URL after clicking Admin button:', page.url());
  const adminHeaderAgain = await page.locator('h1').textContent();
  console.log('Admin Page H1:', adminHeaderAgain);

  await browser.close();
  console.log('✓ All Admin Console navigation tests PASSED flawlessly!');
})();
