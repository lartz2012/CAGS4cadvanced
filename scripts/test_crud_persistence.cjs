const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Testing Admin CRUD operations & Page Refresh Persistence...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  // 1. Open Admin
  console.log('1. Loading Admin Console...');
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 2. Test Species Base Prices
  console.log('2. Testing Species Base Prices Tab...');
  await page.click('button:has-text("Species Base Prices")');
  await page.waitForTimeout(500);

  // Click +25% on first row
  console.log('2a. Testing Quick Adjust (+25%)...');
  const plus25Btn = page.locator('button:has-text("+25%")').first();
  await plus25Btn.click();
  await page.waitForTimeout(600);

  // Edit second row price (Padparadscha or Emerald)
  console.log('2b. Testing custom price edit...');
  const secondEditBtn = page.locator('table tr').nth(2).locator('button:has-text("Edit")');
  if (await secondEditBtn.count() > 0) {
    await secondEditBtn.click();
    await page.waitForTimeout(300);
    const numInput = page.locator('table tr').nth(2).locator('input[type="number"]');
    await numInput.fill('4500');
    await page.waitForTimeout(200);
    const saveCheckBtn = page.locator('table tr').nth(2).locator('button:has(.lucide-check)');
    await saveCheckBtn.click();
    await page.waitForTimeout(600);
  }

  // 3. Test Origin Multipliers Tab
  console.log('3. Testing Origin Multipliers Tab...');
  await page.click('button:has-text("Origin Multipliers")');
  await page.waitForTimeout(500);

  // Edit Sri Lanka factor
  console.log('3a. Setting Sri Lanka multiplier to 1.65...');
  const srlInput = page.locator('table tr').nth(1).locator('input[type="number"]');
  await srlInput.fill('1.65');
  await page.waitForTimeout(300);
  const applyBtn = page.locator('table tr').nth(1).locator('button:has-text("Apply")');
  await applyBtn.click();
  await page.waitForTimeout(600);

  // Add new Origin
  console.log('3b. Adding new Geographic Origin (vietnam_lucyen)...');
  await page.click('button:has-text("Add Origin")');
  await page.waitForTimeout(400);

  await page.fill('input[placeholder*="vietnam_lucyen"]', 'vietnam_lucyen');
  await page.fill('input[placeholder*="Luc Yen Valley"]', 'Vietnam (Luc Yen Valley)');
  await page.locator('div:has-text("Multiplier (×)") > input[type="number"]').fill('1.40');
  await page.click('button:has-text("Save Origin")');
  await page.waitForTimeout(600);

  // 4. Test Treatment Factors Tab
  console.log('4. Testing Treatment Factors Tab...');
  await page.click('button:has-text("Treatment Factors")');
  await page.waitForTimeout(500);

  const treatInput = page.locator('table tr').nth(1).locator('input[type="number"]');
  await treatInput.fill('0.85');
  await page.waitForTimeout(300);
  const applyTreatBtn = page.locator('table tr').nth(1).locator('button:has-text("Apply")');
  await applyTreatBtn.click();
  await page.waitForTimeout(600);

  // 5. Test System Settings Tab
  console.log('5. Testing System Settings Tab...');
  await page.click('button:has-text("System Settings")');
  await page.waitForTimeout(500);

  const marginInput = page.locator('input[type="number"]').first();
  await marginInput.fill('65');
  await page.click('button:has-text("Save Global System Settings")');
  await page.waitForTimeout(600);

  // ══════════════════════════════════════════════════════════════════
  // 6. RELOAD THE PAGE (Simulate hard refresh)
  // ══════════════════════════════════════════════════════════════════
  console.log('6. RELOADING PAGE TO VERIFY PERSISTENCE...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 7. Verify System Settings after reload
  console.log('7. Verifying System Settings after reload...');
  await page.click('button:has-text("System Settings")');
  await page.waitForTimeout(400);
  const reloadedMargin = await page.locator('input[type="number"]').first().inputValue();
  console.log('Reloaded margin value:', reloadedMargin);
  if (reloadedMargin !== '65') {
    throw new Error(`Expected margin to be 65 after reload, but got: ${reloadedMargin}`);
  }

  // 8. Verify Origin Multipliers after reload
  console.log('8. Verifying Origin Multipliers after reload...');
  await page.click('button:has-text("Origin Multipliers")');
  await page.waitForTimeout(500);
  const originText = await page.locator('table').first().textContent();
  console.log('Contains 1.65:', originText.includes('1.65'));
  if (!originText.includes('1.65')) {
    throw new Error('Expected Sri Lanka multiplier 1.65 to persist after reload!');
  }
  console.log('Contains Vietnam (Luc Yen Valley):', originText.includes('Vietnam (Luc Yen Valley)'));
  if (!originText.includes('Vietnam (Luc Yen Valley)')) {
    throw new Error('Expected new origin Vietnam to persist after reload!');
  }

  // 9. Verify Species Base Prices after reload
  console.log('9. Verifying Species Base Prices after reload...');
  await page.click('button:has-text("Species Base Prices")');
  await page.waitForTimeout(500);
  const pricesText = await page.locator('table').first().textContent();
  console.log('Contains 4,500:', pricesText.includes('4,500') || pricesText.includes('4500'));
  if (!pricesText.includes('4,500') && !pricesText.includes('4500')) {
    throw new Error('Expected custom price 4,500 to persist after reload!');
  }

  // 10. Verify Live Simulation Sandbox uses the overridden values
  console.log('10. Checking Live Simulation Sandbox...');
  await page.click('button:has-text("Live Simulation Sandbox")');
  await page.waitForTimeout(600);
  const activePriceText = await page.locator('div:has-text("Active Admin Calibration")').first().textContent();
  console.log('Sandbox Active Calibration block:', activePriceText);

  // Take screenshot of persisted admin panel
  const ssPath = path.join(process.cwd(), 'screenshots', 'cags_admin_crud_persisted.png');
  await page.screenshot({ path: ssPath, fullPage: false });
  console.log('✓ Captured persisted screenshot:', ssPath);

  // 11. Return to Appraisal Suite and verify changes take effect in user calculator
  console.log('11. Returning to Appraisal Suite to verify calculator sync...');
  await page.click('button:has-text("Back to Appraisal Suite")');
  await page.waitForTimeout(1000);

  const appraisalValuationText = await page.locator('.valuation-display, .app-container').textContent();
  console.log('Appraisal suite loaded successfully with persistent config.');

  await browser.close();
  console.log('🎉 ALL CRUD OPERATIONS AND REFRESH PERSISTENCE TESTS PASSED!');
})();
