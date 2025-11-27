const fs = require('fs');
const path = require('path');
const { log } = require('../utils/logger.cjs');

if (process.argv.length < 4) {
  log("ERROR", "Uso: node convert_file.cjs <input.js> <output.ts>");
  process.exit(2);
}

const inFile = process.argv[2];
const outFile = process.argv[3];

log("INFO", `Convertendo arquivo: ${inFile} → ${outFile}`);

let src = fs.readFileSync(inFile, 'utf8');

// Enterprise Transformations
src = src.replace(
  /const\s+\{\s*([^}]+)\s*\}\s*=\s*require\(['"]([^'"]+)['"]\)/g,
  (_, names, mod) => `import { ${names.trim()} } from '${mod}';`
);

src = src.replace(
  /const\s+([A-Za-z0-9_$]+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
  (_, name, mod) => `import ${name} from '${mod}';`
);

src = src.replace(/module\.exports\s*=\s*/g, 'export default ');

src = src.replace(/exports\.([A-Za-z0-9_$]+)\s*=\s*/g, 'export const $1 = ');

src = src.replace(/from\s+['"](.+?)\.js["']/g, (_, p1) => `from '${p1}'`);

src =
  `/* FORTRESS ENTERPRISE AUTO-CONVERTED: ${path.basename(inFile)} */\n\n` + src;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, src, 'utf8');

log("SUCCESS", `Arquivo convertido: ${path.basename(inFile)}`);
