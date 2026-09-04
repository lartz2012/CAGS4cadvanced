const fs = require('fs');

const html = fs.readFileSync('site.html', 'utf8');

// Find the large script
const match = html.match(/<script>\s*(const a0_0x56c88c[\s\S]*?)<\/script>/);
if (!match) {
  console.log('Script not found');
  process.exit(1);
}

const scriptContent = match[1];
fs.writeFileSync('app_obfuscated.js', scriptContent);
console.log('Saved app_obfuscated.js, length:', scriptContent.length);

// Let's inspect the string array definition and decoder
// Find function a0_0x415f and a0_0x20cc
const funcDefMatch = scriptContent.match(/function a0_0x415f\(\)[\s\S]*?return[\s\S]*?}/);
console.log('Has string array func:', !!funcDefMatch);
