#!/usr/bin/env bash
set -e

################################################################################
# Fortress Enterprise Migration Pipeline
# JS → TS Automated Conversion / Orchestration Layer
################################################################################

ROOT=$(pwd)
SRC="$ROOT/src"
TOOLS="$ROOT/tools/fortress"

LOG="$TOOLS/migrate/logs"
mkdir -p "$LOG"

timestamp() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }

log() {
  echo "[FORTRESS:MIGRATION][$(timestamp)][$1] $2" | tee -a "$LOG/pipeline.log"
}

stage() {
  log "STAGE" "──────────────────────────────────────────────"
  log "STAGE" "$1"
  log "STAGE" "──────────────────────────────────────────────"
}

################################################################################
# 1. Validar ambiente
################################################################################
stage "Environment Validation"

if [ ! -d "$SRC" ]; then
  log "ERROR" "src/ não encontrado. Abortando."
  exit 1
fi

BACKUP_DIR=$(ls -dt "$SRC"/_legacy_full_backup_* 2>/dev/null | head -n1)
if [ -z "$BACKUP_DIR" ]; then
  log "ERROR" "Backup não encontrado em src/_legacy_full_backup_*"
  exit 1
fi

log "INFO" "Backup detectado: $BACKUP_DIR"

################################################################################
# 2. Preparar estrutura enterprise de ferramentas
################################################################################
stage "Preparing Fortress Tooling Structure"

mkdir -p "$TOOLS/migrate" "$TOOLS/utils" "$TOOLS/migrate/logs"

cat > "$TOOLS/utils/logger.cjs" <<'CJS'
exports.log = function(level, message) {
  const ts = new Date().toISOString();
  console.log(`[FORTRESS:TOOL][${ts}][${level}] ${message}`);
};
CJS

log "INFO" "Tooling preparado"

################################################################################
# 3. Criar conversor enterprise JS → TS
################################################################################
stage "Installing JS→TS Converter (Enterprise Grade)"

cat > "$TOOLS/migrate/convert_file.cjs" <<'CJS'
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
CJS

log "INFO" "Conversor criado com sucesso"

################################################################################
# 4. Executar conversão JS → TS
################################################################################
stage "Converting All JS → TS (Enterprise)"

find "$BACKUP_DIR" -type f -name "*.js" | while read file; do
  rel="${file#$BACKUP_DIR/}"
  out="$SRC/${rel%.js}.ts"
  log "INFO" "Convertendo módulo: $rel"
  node "$TOOLS/migrate/convert_file.cjs" "$file" "$out"
done

################################################################################
# 5. Criar server.ts enterprise
################################################################################
stage "Ensuring TS Server Entry Point"

if [ ! -f "$SRC/server.ts" ]; then
cat > "$SRC/server.ts" <<'TS'
import http from "http";
import app from "./index";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log("[FORTRESS ENTERPRISE] Server TS rodando na porta " + PORT);
});

export default server;
TS
log "INFO" "server.ts criado"
else
log "INFO" "server.ts já existe, mantendo"
fi

################################################################################
# 6. Atualizar package.json
################################################################################
stage "Updating package.json for Enterprise TS Runtime"

node - <<'JS'
const fs=require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));

pkg.type = "module";
pkg.scripts = pkg.scripts || {};
pkg.scripts.dev   = "ts-node-dev --respawn --transpile-only src/index.ts";
pkg.scripts.build = "tsc --project tsconfig.json";
pkg.scripts.start = "node dist/server.js";

fs.writeFileSync("package.json", JSON.stringify(pkg,null,2));
console.log("[FORTRESS ENTERPRISE] package.json atualizado.");
JS

################################################################################
# 7. Finalização
################################################################################
stage "Migration Complete"

log "SUCCESS" "JS → TS Enterprise Conversion Finalizada."
log "SUCCESS" "Execute agora: npm run build"
