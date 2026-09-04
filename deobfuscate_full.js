const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('app_obfuscated.js', 'utf8');

// Load sandbox
const rotatorEnd = code.indexOf('(a0_0x415f,') + code.slice(code.indexOf('(a0_0x415f,')).indexOf('));') + 3;
const rotatorCode = code.slice(0, rotatorEnd);

const decStart = code.indexOf('function a0_0x20cc');
const decEnd = code.indexOf('function ', decStart + 20);
const decCode = code.slice(decStart, decEnd);

const arrStart = code.indexOf('function a0_0x415f');
const arrReturn = code.indexOf('return a0_0x415f();}', arrStart) + 'return a0_0x415f();}'.length;
const arrCode = code.slice(arrStart, arrReturn);

const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(arrCode, sandbox);
vm.runInContext(decCode, sandbox);
vm.runInContext(rotatorCode, sandbox);

console.log('Sandbox ready. Inlining strings...');

// Replace string calls
let deobfCode = code.replace(/(?:a0_0x20cc|a0_0x56c88c|_0x[a-f0-9]+)\((0x[0-9a-f]+),\s*['"]([^'"]+)['"]\)/g, (match, hex, key) => {
  try {
    const val = sandbox.a0_0x20cc(hex, key);
    return JSON.stringify(val);
  } catch (e) {
    return match;
  }
});

// Simplify concatenated strings like "foo" + "bar"
for (let i = 0; i < 5; i++) {
  deobfCode = deobfCode.replace(/"([^"]*)"\s*\+\s*"([^"]*)"/g, (m, s1, s2) => JSON.stringify(s1 + s2));
}

// Simplify hex numbers and basic math like -0x598+-0x1*0x13d5+0x196f
deobfCode = deobfCode.replace(/(?:-?0x[0-9a-f]+)(?:\s*[\+\-\*]\s*-?0x[0-9a-f]+)+/gi, (match) => {
  try {
    const res = eval(match);
    return String(res);
  } catch (e) {
    return match;
  }
});

fs.writeFileSync('app_deobfuscated.js', deobfCode);
console.log('Saved app_deobfuscated.js, length:', deobfCode.length);
