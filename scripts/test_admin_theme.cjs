const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('Testing Admin Console Theme Toggle (Dark Mode & Light Mode)...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  // Step 1: Navigate to Admin Console
  console.log('1. Navigating to http://localhost:5173/admin ...');
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check initial theme (should be dark or stored)
  let initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('Initial data-theme:', initialTheme);

  // If initial theme is light for some reason, toggle it to dark first to test dark mode screenshot
  if (initialTheme === 'light') {
    await page.click('.theme-toggle-btn');
    await page.waitForTimeout(500);
    initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  }

  const ssDark = path.join(process.cwd(), 'screenshots', 'cags_admin_dark_mode.png');
  await page.screenshot({ path: ssDark, fullPage: false });
  console.log('✓ Captured Dark Mode screenshot:', ssDark);

  // Step 2: Click the Theme Toggle button to switch to Light Mode
  console.log('2. Clicking Theme Toggle button in Admin Console header...');
  await page.click('.theme-toggle-btn');
  await page.waitForTimeout(600);

  const lightTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('Theme after toggle:', lightTheme);
  if (lightTheme !== 'light') {
    throw new Error(`Expected theme to be 'light', but got: ${lightTheme}`);
  }

  // Capture Light Mode Sandbox
  const ssLightSandbox = path.join(process.cwd(), 'screenshots', 'cags_admin_light_sandbox.png');
  await page.screenshot({ path: ssLightSandbox, fullPage: false });
  console.log('✓ Captured Light Mode Sandbox screenshot:', ssLightSandbox);

  // Step 3: Test Light Mode on Species Base Prices
  console.log('3. Checking Species Base Prices in Light Mode...');
  await page.click('button:has-text("Species Base Prices")');
  await page.waitForTimeout(500);
  const ssLightPrices = path.join(process.cwd(), 'screenshots', 'cags_admin_light_base_prices.png');
  await page.screenshot({ path: ssLightPrices, fullPage: false });
  console.log('✓ Captured Light Mode Base Prices screenshot:', ssLightPrices);

  // Step 4: Test Light Mode on Origin Multipliers
  console.log('4. Checking Origin Multipliers in Light Mode...');
  await page.click('button:has-text("Origin Multipliers")');
  await page.waitForTimeout(500);
  const ssLightOrigins = path.join(process.cwd(), 'screenshots', 'cags_admin_light_origins.png');
  await page.screenshot({ path: ssLightOrigins, fullPage: false });
  console.log('✓ Captured Light Mode Origins screenshot:', ssLightOrigins);

  // Step 5: Test Light Mode on Treatment Factors
  console.log('5. Checking Treatment Factors in Light Mode...');
  await page.click('button:has-text("Treatment Factors")');
  await page.waitForTimeout(500);
  const ssLightTreatments = path.join(process.cwd(), 'screenshots', 'cags_admin_light_treatments.png');
  await page.screenshot({ path: ssLightTreatments, fullPage: false });
  console.log('✓ Captured Light Mode Treatments screenshot:', ssLightTreatments);

  // Step 6: Test Light Mode on Trade Color Terms
  console.log('6. Checking Trade Color Terms in Light Mode...');
  await page.click('button:has-text("Trade Color Terms")');
  await page.waitForTimeout(500);
  const ssLightColorTerms = path.join(process.cwd(), 'screenshots', 'cags_admin_light_color_terms.png');
  await page.screenshot({ path: ssLightColorTerms, fullPage: false });
  console.log('✓ Captured Light Mode Trade Color Terms screenshot:', ssLightColorTerms);

  // Step 7: Test Light Mode on System Settings
  console.log('7. Checking System Settings in Light Mode...');
  await page.click('button:has-text("System Settings")');
  await page.waitForTimeout(500);
  const ssLightSystem = path.join(process.cwd(), 'screenshots', 'cags_admin_light_system.png');
  await page.screenshot({ path: ssLightSystem, fullPage: false });
  console.log('✓ Captured Light Mode System Settings screenshot:', ssLightSystem);

  // Step 8: Return to Appraisal Suite and verify Light Mode persists
  console.log('8. Returning to Appraisal Suite...');
  await page.click('button:has-text("Back to Appraisal Suite")');
  await page.waitForTimeout(800);

  const appraisalTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('Appraisal Suite data-theme:', appraisalTheme);
  if (appraisalTheme !== 'light') {
    throw new Error(`Expected Appraisal Suite to retain 'light' theme, but got: ${appraisalTheme}`);
  }

  const ssAppraisalLight = path.join(process.cwd(), 'screenshots', 'cags_appraisal_suite_light_from_admin.png');
  await page.screenshot({ path: ssAppraisalLight, fullPage: false });
  console.log('✓ Captured Appraisal Suite Light Mode screenshot:', ssAppraisalLight);

  // Step 9: Toggle theme back to Dark Mode in Appraisal Suite header
  console.log('9. Toggling back to Dark Mode from Appraisal Suite header...');
  await page.click('.theme-toggle-btn');
  await page.waitForTimeout(600);

  const backToDarkTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('Appraisal Suite after toggle to dark:', backToDarkTheme);
  if (backToDarkTheme !== 'dark') {
    throw new Error(`Expected theme to toggle back to 'dark', but got: ${backToDarkTheme}`);
  }

  // Step 10: Re-enter Admin Console and verify Dark Mode persists
  console.log('10. Navigating back into Admin Console...');
  await page.click('.admin-nav-btn');
  await page.waitForTimeout(800);

  const adminDarkThemeAgain = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('Admin Console after returning:', adminDarkThemeAgain);
  if (adminDarkThemeAgain !== 'dark') {
    throw new Error(`Expected Admin Console to retain 'dark' theme, but got: ${adminDarkThemeAgain}`);
  }

  await browser.close();
  console.log('🎉 ALL ADMIN THEME TESTS PASSED PERFECTLY!');
})();
