const fs = require('fs');
const code = fs.readFileSync('app_deobfuscated.js', 'utf8');

// Print 2500 characters before and 4000 characters after index 64697
const start = Math.max(0, 64697 - 2500);
const end = Math.min(code.length, 64697 + 4000);
fs.writeFileSync('calc_snippet.js', code.slice(start, end));
console.log('Saved calc_snippet.js');
