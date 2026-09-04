const fs = require('fs');

const code = fs.readFileSync('app_deobfuscated.js', 'utf8');

// Find the function start containing species, carat, tone
const startIdx = code.indexOf('a0_0x24b3ab[document["getElementById"]("species")["value"]]');
// Go back to the enclosing function
const funcStart = code.lastIndexOf('function', startIdx);
// Find the end of this function
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
fs.writeFileSync('raw_calc_func.js', funcCode);
console.log('Saved raw_calc_func.js, length:', funcCode.length);
