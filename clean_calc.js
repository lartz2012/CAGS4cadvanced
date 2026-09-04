const fs = require('fs');

let code = fs.readFileSync('calc_function_full.js', 'utf8');

// The function defines an object at the beginning with mappings like 'HsboW': "species", etc.
// Let's parse that object!
const objMatch = code.match(/const\s+(_0x[a-f0-9]+)\s*=\s*\{([\s\S]*?)\};/);
if (objMatch) {
  const objName = objMatch[1];
  const objBody = objMatch[2];
  
  // Extract key-values
  const map = {};
  // Match 'key': value or 'key': function(...)
  const entries = objBody.split(/,(?=\s*['"][a-zA-Z0-9]+['"]\s*:)/);
  for (const entry of entries) {
    const m = entry.match(/['"]([a-zA-Z0-9]+)['"]\s*:\s*([\s\S]*)$/);
    if (m) {
      const k = m[1].trim();
      const v = m[2].trim();
      map[k] = v;
    }
  }

  // Replace usages: obj[key](...) or obj[key]
  // First function calls
  for (const [k, v] of Object.entries(map)) {
    if (v.startsWith('function(')) {
      // e.g. function(_0x214137,_0x41065e){return _0x214137*_0x41065e;}
      const fnMatch = v.match(/function\(([^)]*)\)\{return\s+([^;]+);?\}/);
      if (fnMatch) {
        const params = fnMatch[1].split(',').map(s => s.trim());
        const body = fnMatch[2].trim();
        
        // replace occurrences like obj[k](a, b)
        const callRegex = new RegExp(objName + '\\[[\'"]' + k + '[\'"]\\]\\(([^,)]+)(?:,([^)]+))?\\)', 'g');
        code = code.replace(callRegex, (match, arg1, arg2) => {
          if (params.length === 1 && arg1) {
            return body.replace(new RegExp('\\b' + params[0] + '\\b', 'g'), arg1.trim());
          } else if (params.length === 2 && arg1 && arg2) {
            return body
              .replace(new RegExp('\\b' + params[0] + '\\b', 'g'), arg1.trim())
              .replace(new RegExp('\\b' + params[1] + '\\b', 'g'), arg2.trim());
          }
          return match;
        });
      }
    } else {
      // simple value replacement
      const valRegex = new RegExp(objName + '\\[[\'"]' + k + '[\'"]\\]', 'g');
      code = code.replace(valRegex, v);
    }
  }
}

// Clean up document["getElementById"]
code = code.replace(/document\[['"]getElementBy['"]\s*\+\s*['"]Id['"]\]/g, 'document.getElementById');
code = code.replace(/document\[['"]getElementById['"]\]/g, 'document.getElementById');

// Beautify basic formatting
code = code.replace(/;/g, ';\n');
code = code.replace(/\{/g, '{\n');
code = code.replace(/\}/g, '\n}\n');

fs.writeFileSync('calc_clean.js', code);
console.log('Saved calc_clean.js');
