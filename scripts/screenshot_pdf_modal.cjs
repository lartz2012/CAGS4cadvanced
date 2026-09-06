const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click Preview & Print
  await page.click('button:has-text("Preview")');
  await page.waitForTimeout(2500);

  const previewShot = path.join(process.cwd(), 'screenshots', 'cags_pdf_preview_modal.png');
  await page.screenshot({ path: previewShot });
  console.log('Saved PDF preview modal screenshot:', previewShot);

  await browser.close();
})();
