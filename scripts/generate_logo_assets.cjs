const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const b64 = fs.readFileSync(path.join(process.cwd(), 'public', 'cags-logo.png')).toString('base64');
  const src = 'data:image/png;base64,' + b64;

  const resultBase64 = await page.evaluate(async (imgSrc) => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 465;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = imgSrc;
    });

    ctx.drawImage(img, 0, 0, 300, 465);
    return canvas.toDataURL('image/png', 0.9);
  }, src);

  const buffer = Buffer.from(resultBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
  fs.writeFileSync(path.join(process.cwd(), 'public', 'cags-logo-sm.png'), buffer);
  
  // Ensure src/assets exists
  fs.mkdirSync(path.join(process.cwd(), 'src', 'assets'), { recursive: true });
  const tsContent = 'export const CAGS_LOGO_BASE64 = ' + JSON.stringify(resultBase64) + ';\n';
  fs.writeFileSync(path.join(process.cwd(), 'src', 'assets', 'cagsLogoBase64.ts'), tsContent);
  console.log('Saved small logo and cagsLogoBase64.ts, size:', buffer.length);
  await browser.close();
})();
