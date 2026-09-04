const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('app_obfuscated.js', 'utf8');

// Let's find the parts needed to decode strings:
// 1. function a0_0x415f
// 2. IIFE rotation: (function(_0x611af9,_0x1aa6e5)...(a0_0x415f,...))
// 3. function a0_0x20cc

const matchArray = code.match(/function a0_0x415f\(\)[\s\S]*?return _0x[a-f0-9]+;\s*}/);
const matchRotator = code.match(/\(function\(_0x[a-f0-9]+,_0x[a-f0-9]+\)\{[\s\S]*?\}\(a0_0x415f,[^\)]+\)\);/);
const matchDecoder = code.match(/function a0_0x20cc\(_0x[a-f0-9]+,_0x[a-f0-9]+\)[\s\S]*?return _0x[a-f0-9]+;\s*}/);

if (matchArray && matchRotator && matchDecoder) {
  const sandbox = {};
  vm.createContext(sandbox);
  const setupCode = matchArray[0] + '\n' + matchDecoder[0] + '\n' + matchRotator[0];
  try {
    vm.runInContext(setupCode, sandbox);
    console.log('Successfully initialized deobfuscator string table and decoder in VM sandbox!');

    // Now find all calls like a0_0x20cc(...) or a0_0x56c88c(...) in code
    const callRegex = /(?:a0_0x20cc|a0_0x56c88c|_0x[a-f0-9]+)\((0x[0-9a-f]+),\s*['"]([^'"]+)['"]\)/g;
    let m;
    const decodedStrings = new Set();
    while ((m = callRegex.exec(code)) !== null) {
      try {
        const decoded = sandbox.a0_0x20cc(m[1], m[2]);
        if (decoded && typeof decoded === 'string') {
          decodedStrings.add(decoded);
        }
      } catch (e) {}
    }
    console.log(`Decoded ${decodedStrings.size} unique strings from the obfuscated script.`);

    const stringsList = Array.from(decodedStrings);
    fs.writeFileSync('decoded_strings.json', JSON.stringify(stringsList, null, 2));

    // Check for network/API related terms
    const apiTerms = stringsList.filter(s => 
      /api|http|fetch|xmlhttp|post|get|url|endpoint|request|response|json|ws:|wss:|query|server|cloud/i.test(s)
    );
    console.log('\nStrings potentially related to API/Network:');
    console.log(JSON.stringify(apiTerms, null, 2));
  } catch (err) {
    console.error('VM error:', err);
  }
} else {
  console.log('Could not find all deobfuscation components');
}
