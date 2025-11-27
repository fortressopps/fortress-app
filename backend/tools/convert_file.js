/*
  convert_file.js
  Usage: node convert_file.js input_js_path output_ts_path
  Performs conservative JS->TS transformations:
   - converts require() -> import
   - converts const {a,b} = require('x') -> import {a,b} from 'x';
   - converts module.exports = X -> export default X
   - converts exports.name = ... -> export const name = ...
   - strips .js from import specifiers
   - adds header comment for manual typing
*/
const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error("Usage: node convert_file.js input.js output.ts");
  process.exit(2);
}

const inPath = process.argv[2];
const outPath = process.argv[3];

let src = fs.readFileSync(inPath, 'utf8');

// 1) convert commonjs destructured require -> import {a,b} from 'mod';
src = src.replace(/const\s+\{\s*([^}]+)\s*\}\s*=\s*require\(['"]([^'"]+)['"]\)\s*;?/g, (m, names, mod) => {
  return `import { ${names.trim()} } from '${mod}';`;
});

// 2) convert basic require -> import default
src = src.replace(/const\s+([A-Za-z0-9_$]+)\s*=\s*require\(['"]([^'"]+)['"]\)\s*;?/g, (m, name, mod) => {
  return `import ${name} from '${mod}';`;
});

// 3) convert module.exports = IDENT/EXPR -> export default IDENT/EXPR
src = src.replace(/module\.exports\s*=\s*/g, 'export default ');

// 4) convert exports.name = -> export const name =
src = src.replace(/exports\.([A-Za-z0-9_$]+)\s*=\s*/g, 'export const $1 = ');

// 5) replace "require('x')" that remain (rare dynamic cases) -> leave as-is but comment
src = src.replace(/require\(([^)]+)\)/g, (m, inner) => {
  return `/* require(${inner}) converted to dynamic import? review */ require(${inner})`;
});

// 6) strip .js extension in import statements
src = src.replace(/from\s+['"](.+?)\.js(['"])?/g, (m, p1) => {
  return `from '${p1}'`;
});

// 7) strip .js in import specifiers with double quotes
src = src.replace(/from\s+"(.+?)\.js"/g, (m, p1) => {
  return `from "${p1}"`;
});

// 8) ensure file header
const header = `/* AUTO-CONVERTED: JS -> TS
   Please run 'npm run build' and fix remaining TypeScript errors.
   This file was converted from: ${path.basename(inPath)}
*/\n\n`;
src = header + src;

// 9) write out
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, src, 'utf8');

console.log("converted:", inPath, "→", outPath);
