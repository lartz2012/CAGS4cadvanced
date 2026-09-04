const fs = require('fs');
const code = fs.readFileSync('app_deobfuscated.js', 'utf8');

const pos = 64697;
const funcStart = code.lastIndexOf('function ', pos);
let depth = 0;
let funcEnd = -1;
for (let i = funcStart; i < code.length; i++) {
  if (code[i] === '{') depth++;
  else if (code[i] === '}') {
    depth--;
    if (depth === 0) {
      funcEnd = i + 1;
      break;
    }
  }
}

const funcCode = code.slice(funcStart, funcEnd);
fs.writeFileSync('calc_function_full.js', funcCode);
console.log('Saved calc_function_full.js, length:', funcCode.length);
