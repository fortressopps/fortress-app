#!/usr/bin/env bash
set -euo pipefail

# CONFIG ---------------------------------------------------------------------
# Rotas a reorganizar — ajuste se necessário
ROUTES=(accounts analytics auth battle bills budget investments supermarket transactions user)

SRC_DIR="src/routes"
TIMESTAMP="$(date +%Y%m%d%H%M%S)"
BACKUP_DIR="${SRC_DIR}/_legacy_backup_${TIMESTAMP}"

# Detect TypeScript project (prefer .ts outputs) — ajusta extensão dos arquivos gerados
if [ -f "tsconfig.json" ] || [ -d "src" ] && ls src/*.ts >/dev/null 2>&1; then
  EXT="ts"
else
  EXT="js"
fi

# Detect ESM vs CJS? We'll generate ESM (import/export). If you use CJS, convert manualy.
echo "Detected file extension: .${EXT}"
echo "Backup dir: ${BACKUP_DIR}"

mkdir -p "${BACKUP_DIR}"
mkdir -p "${SRC_DIR}"

# Helper: safe move preserving git history when possible
safe_move() {
  src="$1"
  dest="$2"
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git mv "$src" "$dest" 2>/dev/null || mv "$src" "$dest"
  else
    mv "$src" "$dest"
  fi
}

# Create per-route structure
for r in "${ROUTES[@]}"; do
  src_file="${SRC_DIR}/${r}.js"
  src_file_ts="${SRC_DIR}/${r}.ts"

  if [ -f "${src_file}" ] || [ -f "${src_file_ts}" ]; then
    echo "Processing route: ${r}"
    mkdir -p "${SRC_DIR}/${r}"

    # Move legacy file (prefer js then ts)
    if [ -f "${src_file}" ]; then
      safe_move "${src_file}" "${BACKUP_DIR}/${r}.legacy.js"
    else
      safe_move "${src_file_ts}" "${BACKUP_DIR}/${r}.legacy.ts"
    fi

    # Determine import extension for supabase
    SUPABASE_IMPORT_PATH="../../lib/supabase.${EXT}"

    # filenames for new files
    controller="${SRC_DIR}/${r}/controller.${EXT}"
    service="${SRC_DIR}/${r}/service.${EXT}"
    index="${SRC_DIR}/${r}/index.${EXT}"

    # create controller if missing
    if [ ! -f "${controller}" ]; then
      cat > "${controller}" <<EOF
/**
 * Controller - rota: ${r}
 * Handlers: list, getById, create, update, remove
 * NOTE: middleware auth should set req.user when applicable
 */
import * as Service from "./service.${EXT}";

export async function list(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    const result = await Service.list({ page, pageSize, userId: req.user?.id });
    res.json({ data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const item = await Service.getById(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const payload = req.body;
    const created = await Service.create(payload, { userId: req.user?.id });
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = await Service.update(id, payload);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await Service.remove(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
EOF
    fi

    # create service if missing
    if [ ! -f "${service}" ]; then
      # Map route -> table heuristic
      TABLE="${r}"
      case "${r}" in
        accounts) TABLE="accounts" ;;
        transactions) TABLE="transactions" ;;
        supermarket) TABLE="supermarket_lists" ;;
        budget) TABLE="budgets" ;;
        analytics) TABLE="transactions" ;;
        investments) TABLE="investments" ;;
        bills) TABLE="bills" ;;
        auth) TABLE="users" ;;
        user) TABLE="users" ;;
        *) TABLE="${r}s" ;;
      esac

      cat > "${service}" <<EOF
/**
 * Service - rota: ${r}
 * Usa o client centralizado do Supabase.
 */
import supabaseWrapper from "${SUPABASE_IMPORT_PATH}";
const { supabaseAdmin, dbQuery, applyPagination, buildMeta } = supabaseWrapper;

export async function list({ page = 1, pageSize = 20, userId = null } = {}) {
  const { from, to } = applyPagination(page, pageSize);
  const table = "${TABLE}";

  const res = await dbQuery(
    supabaseAdmin,
    (c) =>
      c
        .from(table)
        .select("*", { count: "exact" })
        .range(from, to)
        .order("date", { ascending: false }),
    { retry: 2, timeout: 9000, audit: true }
  );

  const total = (res && res.count) ? res.count : 0;
  const meta = buildMeta(total, page, pageSize);
  return { data: (res && res.data) ? res.data : [], meta };
}

export async function getById(id) {
  const table = "${TABLE}";
  const res = await dbQuery(supabaseAdmin, (c) => c.from(table).select("*").eq("id", id).single());
  return (res && res.data) ? res.data : null;
}

export async function create(payload, opts = {}) {
  const table = "${TABLE}";
  const res = await dbQuery(supabaseAdmin, (c) => c.from(table).insert([payload]).select().single());
  return (res && res.data) ? res.data : null;
}

export async function update(id, payload) {
  const table = "${TABLE}";
  const res = await dbQuery(supabaseAdmin, (c) => c.from(table).update(payload).eq("id", id).select().single());
  return (res && res.data) ? res.data : null;
}

export async function remove(id) {
  const table = "${TABLE}";
  await dbQuery(supabaseAdmin, (c) => c.from(table).delete().eq("id", id));
  return true;
}
EOF
    fi

    # create index if missing
    if [ ! -f "${index}" ]; then
      cat > "${index}" <<EOF
/**
 * Route index - ${r}
 * Wiring express Router with controller functions
 */
import { Router } from "express";
import * as Controller from "./controller.${EXT}";

const router = Router();

router.get("/", Controller.list);
router.post("/", Controller.create);
router.get("/:id", Controller.getById);
router.put("/:id", Controller.update);
router.delete("/:id", Controller.remove);

export default router;
EOF
    fi

    echo "Rota '${r}' reorganizada em: ${SRC_DIR}/${r}/"
  else
    echo "Arquivo original não encontrado: ${src_file} / ${src_file_ts} — pulando ${r}"
  fi
done

# Create aggregator (src/routes/index.<ext>) if missing
AGG="${SRC_DIR}/index.${EXT}"
if [ ! -f "${AGG}" ]; then
  cat > "${AGG}" <<EOF
/**
 * Aggregator de rotas - src/routes/index.${EXT}
 * Importe e use cada rota específica no express app
 */
import express from "express";
EOF

  for r in "${ROUTES[@]}"; do
    echo "import ${r}Router from './${r}/index.${EXT}';" >> "${AGG}"
  done

  cat >> "${AGG}" <<'EOF'

const router = express.Router();
EOF

  for r in "${ROUTES[@]}"; do
    echo "router.use('/${r}', ${r}Router);" >> "${AGG}"
  done

  cat >> "${AGG}" <<'EOF'

export default router;
EOF

  git add "${AGG}" >/dev/null 2>&1 || true
fi

# Git add and commit
git add "${SRC_DIR}" >/dev/null 2>&1 || true
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git commit -m "chore(routes): reorganize routes into per-route folders + controller/service boilerplate (fixed script)" >/dev/null 2>&1 || echo "No changes to commit or commit failed"
fi

echo "Reorganização completa. Backup em: ${BACKUP_DIR}"
