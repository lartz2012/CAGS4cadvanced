const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('app_obfuscated.js', 'utf8');

// 1. rotator is from start up to (a0_0x415f,...));
const rotatorEnd = code.indexOf('(a0_0x415f,') + code.slice(code.indexOf('(a0_0x415f,')).indexOf('));') + 3;
const rotatorCode = code.slice(0, rotatorEnd);

// 2. a0_0x20cc is from 'function a0_0x20cc'
const decStart = code.indexOf('function a0_0x20cc');
// find end of function a0_0x20cc
const decEnd = code.indexOf('function ', decStart + 20);
const decCode = code.slice(decStart, decEnd);

// 3. a0_0x415f is from 'function a0_0x415f'
const arrStart = code.indexOf('function a0_0x415f');
const arrReturn = code.indexOf('return a0_0x415f();}', arrStart) + 'return a0_0x415f();}'.length;
const arrCode = code.slice(arrStart, arrReturn);

console.log('Rotator code length:', rotatorCode.length);
console.log('Decoder code length:', decCode.length);
console.log('Array code length:', arrCode.length);

const sandbox = {};
vm.createContext(sandbox);

// Define array and decoder first, then rotator
vm.runInContext(arrCode, sandbox);
vm.runInContext(decCode, sandbox);
vm.runInContext(rotatorCode, sandbox);

console.log('Rotator executed successfully!');

// Test decoding
const testDecoded = sandbox.a0_0x20cc(0x9fe, 'S3&5');
console.log('Test decode:', testDecoded);

// Now decode all calls in the entire code
const regex = /(?:a0_0x20cc|a0_0x56c88c|_0x[a-f0-9]+)\((0x[0-9a-f]+),\s*['"]([^'"]+)['"]\)/g;
let m;
const uniqueStrings = new Set();
while ((m = regex.exec(code)) !== null) {
  try {
    const val = sandbox.a0_0x20cc(m[1], m[2]);
    if (val && typeof val === 'string') uniqueStrings.add(val);
  } catch (e) {}
}

console.log(`Total unique decoded strings: ${uniqueStrings.size}`);
const list = Array.from(uniqueStrings).sort();
fs.writeFileSync('decoded_strings_clean.json', JSON.stringify(list, null, 2));

// Filter potential network/API calls
const networkKeywords = ['http', 'https', 'fetch', 'api', 'xhr', 'request', 'post', 'get', 'put', 'delete', 'ws', 'wss', 'endpoint', 'ajax', 'json', 'url', 'socket', 'beacon'];
const matches = list.filter(s => {
  const lower = s.toLowerCase();
  return networkKeywords.some(k => lower.includes(k));
});

console.log('\nDecoded strings matching network/API keywords:');
console.log(JSON.stringify(matches, null, 2));
