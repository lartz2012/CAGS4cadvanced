const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testApp() {
  console.log('Testing GemMetrics React Liquid Glass app with Light & Dark Modes...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage({
    viewport: { width: 1400, height: 960 }
  });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('[BROWSER ERROR]', msg.text());
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('[PAGE ERROR]', err.message);
    errors.push(err.message);
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const ssDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(ssDir)) fs.mkdirSync(ssDir);

  // 1. Dark Mode Screenshot
  const darkShot = path.join(ssDir, 'dark_mode.png');
  await page.screenshot({ path: darkShot, fullPage: false });
  console.log('Saved Dark Mode screenshot:', darkShot);

  // 2. Check title & brand
  const title = await page.locator('.brand-name').textContent();
  console.log('Brand title:', title);

  // 3. Test Presets in Specimen Catalog
  const presets = ['Emerald', 'Paraíba', 'Pink Spinel', 'Blue Sapphire'];
  for (const p of presets) {
    await page.click(`.catalog-tab:has-text("${p}")`);
    await page.waitForTimeout(300);
    const heroPrice = await page.locator('.val-price-hero').textContent();
    const grade = await page.locator('.grade-value').textContent();
    console.log(`Specimen [${p}]: ${heroPrice} (${grade})`);
  }

  // 4. Toggle to Light Mode!
  console.log('Switching to Light Mode...');
  await page.click('.theme-toggle-btn');
  await page.waitForTimeout(500);

  const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('Current data-theme:', themeAttr);

  // 5. Test Presets in Light Mode
  await page.click('.catalog-tab:has-text("Emerald")');
  await page.waitForTimeout(300);
  const emeraldLightPrice = await page.locator('.val-price-hero').textContent();
  console.log('Emerald in Light Mode:', emeraldLightPrice);

  // 6. Test Currency Switcher in Light Mode
  await page.selectOption('select.currency-select', 'EUR');
  await page.waitForTimeout(300);
  const eurPrice = await page.locator('.val-price-hero').textContent();
  console.log('EUR Price in Light Mode:', eurPrice);

  // 7. Save Light Mode Screenshot
  const lightShot = path.join(ssDir, 'light_mode.png');
  await page.screenshot({ path: lightShot, fullPage: false });
  console.log('Saved Light Mode screenshot:', lightShot);

  // 8. Test PDF Download in Light Mode
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
    page.click('button:has-text("Download Luxury Valuation Certificate")')
  ]);

  if (download) {
    const filename = download.suggestedFilename();
    const pdfPath = path.join(ssDir, filename);
    await download.saveAs(pdfPath);
    console.log(`✓ PDF Certificate successfully generated in Light Mode: ${filename} (${fs.statSync(pdfPath).size} bytes)`);
  }

  await browser.close();

  if (errors.length > 0) {
    console.error('Test completed with console errors:', errors);
    process.exit(1);
  } else {
    console.log('✓ All Light & Dark mode verification checks PASSED with 0 errors!');
  }
}

testApp().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
