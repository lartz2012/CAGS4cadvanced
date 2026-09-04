const fs = require('fs');
const code = fs.readFileSync('app_deobfuscated.js', 'utf8');

const target = '"ppc"';
let pos = 0;
while ((pos = code.indexOf(target, pos)) !== -1) {
  console.log(`\n=== Found at index ${pos} ===`);
  console.log(code.slice(Math.max(0, pos - 400), Math.min(code.length, pos + 400)));
  pos += target.length;
}
