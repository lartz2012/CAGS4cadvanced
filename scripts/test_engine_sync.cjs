const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runTests() {
  console.log('=== Step 1: Testing Backend Valuation Sync & Config APIs ===');
  const BASE_URL = 'http://localhost:3001';

  // 1. Get initial config and ensure clean baseline
  await fetch(`${BASE_URL}/api/admin/config`, { method: 'DELETE' });
  await fetch(`${BASE_URL}/api/admin/clear-override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ speciesId: 'blue_sapphire' })
  });

  const configRes = await fetch(`${BASE_URL}/api/admin/config`);
  if (!configRes.ok) throw new Error(`Failed to fetch /api/admin/config: ${configRes.statusText}`);
  const config = await configRes.json();
  console.log('✓ Fetched config: found', Object.keys(config.origins).length, 'origin categories,', Object.keys(config.treatments).length, 'treatment categories,', Object.keys(config.species).length, 'species');

  // 2. Calculate baseline valuation for 3.0ct Blue Sapphire
  const valPayload = {
    speciesId: 'blue_sapphire',
    carat: 3.0,
    tone: 68,
    saturation: 85,
    clarityGrade: 'LI',
    eyeClean: true,
    transparency: 0.95,
    colorZoning: 'minimal',
    brilliance: 85,
    windowing: 5,
    extinction: 8,
    symmetry: 'very_good',
    polish: 'very_good',
    origin: 'srilanka',
    treatment: 'heated_standard',
    certification: 'major'
  };

  const valRes1 = await fetch(`${BASE_URL}/api/valuation/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(valPayload)
  });
  const baselineVal = await valRes1.json();
  console.log(`✓ Baseline 3.0ct Blue Sapphire Wholesale Total: $${baselineVal.wholesaleTotalMidpoint.toLocaleString()} ($${baselineVal.wholesaleMidpointPerCarat.toLocaleString()}/ct)`);

  // 3. Test Base Price Override: Blue Sapphire to $750/ct (Catalog default is $500/ct -> +50% scale factor)
  console.log('Setting Blue Sapphire base price to $750/ct (+50% scale)...');
  await fetch(`${BASE_URL}/api/admin/override-price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      speciesId: 'blue_sapphire',
      priceData: {
        basePrice: 750,
        lowIqr: 660,
        highIqr: 860,
        trend30d: '+0.0%',
        clearedTransactionsCount: 50,
        source: 'Admin Test'
      }
    })
  });

  const valRes2 = await fetch(`${BASE_URL}/api/valuation/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(valPayload)
  });
  const scaledVal = await valRes2.json();
  console.log(`✓ Scaled 3.0ct Blue Sapphire Wholesale Total: $${scaledVal.wholesaleTotalMidpoint.toLocaleString()} ($${scaledVal.wholesaleMidpointPerCarat.toLocaleString()}/ct)`);

  const scaleRatio = scaledVal.wholesaleMidpointPerCarat / baselineVal.wholesaleMidpointPerCarat;
  console.log(`Observed Scale Ratio: ${scaleRatio.toFixed(3)} (Expected ~1.500)`);
  if (Math.abs(scaleRatio - 1.5) > 0.05) {
    throw new Error(`Scale ratio ${scaleRatio} did not match expected 1.50!`);
  }
  console.log('✓ Grid scaling proportional math VERIFIED!');

  // 4. Test Origin Override
  console.log('Setting Sri Lanka origin factor to 1.30...');
  await fetch(`${BASE_URL}/api/admin/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'origin',
      category: 'corundum',
      key: 'srilanka',
      value: { factor: 1.30 }
    })
  });

  const valRes3 = await fetch(`${BASE_URL}/api/valuation/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(valPayload)
  });
  const originVal = await valRes3.json();
  console.log(`✓ Valuation with 1.30x Origin: $${originVal.wholesaleTotalMidpoint.toLocaleString()}`);
  const originRatio = originVal.wholesaleTotalMidpoint / scaledVal.wholesaleTotalMidpoint;
  console.log(`Observed Origin Ratio: ${originRatio.toFixed(3)} (Expected ~1.300)`);
  if (Math.abs(originRatio - 1.3) > 0.05) {
    throw new Error(`Origin ratio ${originRatio} did not match expected 1.30!`);
  }
  console.log('✓ Origin override engine integration VERIFIED!');

  // 5. Clear overrides to restore baseline
  console.log('Cleaning up test overrides...');
  await fetch(`${BASE_URL}/api/admin/clear-override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ speciesId: 'blue_sapphire' })
  });
  await fetch(`${BASE_URL}/api/admin/config`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'origins' })
  });

  console.log('\n=== Step 2: Testing UI & Playwright End-to-End ===');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });

  console.log('Navigating to http://localhost:5173/admin ...');
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Verify Live Simulation Sandbox is present
  const sandboxTitle = await page.locator('h2:has-text("Valuation Simulation Sandbox")').textContent();
  console.log('Found Sandbox title:', sandboxTitle);

  // Take screenshot of Sandbox
  const ssDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir, { recursive: true });
  const ssSandbox = path.join(ssDir, 'cags_admin_sandbox.png');
  await page.screenshot({ path: ssSandbox, fullPage: false });
  console.log('Saved Sandbox screenshot:', ssSandbox);

  // Switch to Species Base Prices tab
  console.log('Switching to Species Base Prices tab...');
  await page.click('button:has-text("Species Base Prices")');
  await page.waitForTimeout(600);

  // Search for "Sapphire"
  await page.fill('input[placeholder*="Search species"]', 'Sapphire');
  await page.waitForTimeout(400);

  const ssPrices = path.join(ssDir, 'cags_admin_base_prices.png');
  await page.screenshot({ path: ssPrices, fullPage: false });
  console.log('Saved Base Prices screenshot:', ssPrices);

  // Switch to Origin Multipliers tab
  console.log('Switching to Origin Multipliers tab...');
  await page.click('button:has-text("Origin Multipliers")');
  await page.waitForTimeout(600);

  const ssOrigins = path.join(ssDir, 'cags_admin_origins.png');
  await page.screenshot({ path: ssOrigins, fullPage: false });
  console.log('Saved Origins screenshot:', ssOrigins);

  // Switch to Treatment Factors tab
  console.log('Switching to Treatment Factors tab...');
  await page.click('button:has-text("Treatment Factors")');
  await page.waitForTimeout(600);

  // Click Back to Appraisal Suite
  console.log('Clicking "Back to Appraisal Suite"...');
  await page.click('button:has-text("Back to Appraisal Suite")');
  await page.waitForTimeout(1200);

  const appTitle = await page.locator('.brand-name').textContent();
  console.log('Loaded Appraisal Suite successfully, Brand:', appTitle);

  const ssApp = path.join(ssDir, 'cags_appraisal_suite_synced.png');
  await page.screenshot({ path: ssApp, fullPage: false });
  console.log('Saved Appraisal Suite screenshot:', ssApp);

  await browser.close();
  console.log('\n🌟 ALL ENGINE SYNC & ADMIN UI TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
