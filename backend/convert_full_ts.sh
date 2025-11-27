#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SRC_DIR="src"
BACKUP_DIR="${SRC_DIR}/_legacy_full_backup_$(date +%Y%m%d%H%M%S)"
TOOLS_DIR="tools"

echo "📦 Starting FULL JS -> TS conversion pipeline"
echo "📁 Root: ${ROOT}"
echo "📁 Source dir: ${SRC_DIR}"
echo "📁 Backup dir: ${BACKUP_DIR}"

# 1) Backup existing src
mkdir -p "${BACKUP_DIR}"
echo "🔁 Moving original JS files to backup..."
# Move only .js files (keep directory structure)
find "${SRC_DIR}" -type f -name "*.js" -print0 | while IFS= read -r -d '' file; do
  rel="$(realpath --relative-to="${ROOT}" "${file}")"
  dest="${BACKUP_DIR}/${rel}"
  mkdir -p "$(dirname "${dest}")"
  mv "${file}" "${dest}"
done

# 2) Create tools folder and conversion utility (Node based for portability)
mkdir -p "${TOOLS_DIR}"
cat > "${TOOLS_DIR}/convert_file.js" <<'NODE'
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
NODE

echo "🛠 Tools written: ${TOOLS_DIR}/convert_file.js"

# 3) Walk backup tree and convert each .js -> .ts using convert_file.js
echo "🔁 Converting JS files in backup to TS..."
find "${BACKUP_DIR}" -type f -name "*.js" -print0 | while IFS= read -r -d '' file; do
  rel="$(realpath --relative-to="${BACKUP_DIR}" "${file}")"
  out="${SRC_DIR}/${rel%.js}.ts"
  node "${TOOLS_DIR}/convert_file.js" "${file}" "${out}"
done

# 4) Create server.ts that runs src/index.ts (safe entrypoint)
cat > src/server.ts <<'TS'
/**
 * Auto-generated server.ts — entrypoint for TS production/dev
 * It imports src/index.ts (your enterprise app).
 */
import http from "http";
import app from "./index";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server (TS) listening on port ${PORT}`);
});

export default server;
TS

# 5) Patch package.json scripts and set module type
if [ -f package.json ]; then
  node - <<'NODE'
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json','utf8'));
p.type = 'module';
p.scripts = p.scripts || {};
p.scripts['dev'] = 'ts-node-dev --respawn --transpile-only src/index.ts';
p.scripts['build'] = 'tsc';
p.scripts['start'] = 'node dist/server.js';
fs.writeFileSync('package.json', JSON.stringify(p,null,2));
console.log("package.json patched for TS (dev/build/start).");
NODE
fi

# 6) Create placeholder DTOs folder if missing
mkdir -p "${SRC_DIR}/common/dto"
cat > "${SRC_DIR}/common/dto/README.md" <<'MD'
This folder contains DTO and Zod schemas. Auto-conversion placed here as placeholder. 
Please implement domain-specific DTOs and validators.
MD

# 7) Create a convenience README describing manual tasks after conversion
cat > CONVERSION_README.md <<'MD'
FULL JS → TS automated conversion performed.

What to do next:
1) npm install -D typescript ts-node-dev @types/node @types/express @types/cors @types/compression @types/helmet
2) npm install express cors helmet compression express-rate-limit morgan @clerk/express
3) npm run build
4) Fix TypeScript errors (most will be missing types / any / import edge-cases)
5) Run tests and verify runtime behavior
Backup of original JS files: ${BACKUP_DIR}
MD

# 8) Git add & commit attempt
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git add -A
  git commit -m "chore: automated JS->TS conversion (full backend). Backup in ${BACKUP_DIR}" || echo "No changes to commit or commit failed."
fi

echo "✅ Conversion pipeline finished."
echo "— Backup dir: ${BACKUP_DIR}"
echo "— Run: npm install && npm run build"
echo "— Then fix any TS errors left by automated conversion."
