// src/modules/supermarket/supermarket.utils.ts
/**
 * Fortress Supermarket — Utilities (v7)
 * - CSV <-> JSON helpers (robustos, com escaping RFC4180)
 * - Parsing helpers (detect format, safe number parsing)
 * - Pagination helpers (para controllers e testes)
 * - Sanitizers & normalizers (strings, currency)
 * - Small domain helpers (price math, savings)
 *
 * Observações:
 *  - Não traz dependência pesada (sem streams/external libs).
 *  - Lança AppError em casos de payload inválido (consistência).
 */

import AppError from "../../../libs/appError";
import { Logger } from "../../../libs/logger";
import type { PaginationMeta } from "./supermarket.types";

type Format = "json" | "csv" | "unknown";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

/* =========================
   CSV / TEXT UTILITIES
   ========================= */

/**
 * Escape a single CSV cell using RFC4180 rules.
 * - wrap in quotes if contains comma, quote or newline
 * - double any internal quotes
 */
export const escapeCell = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    try {
      const s = JSON.stringify(v);
      return `"${s.replace(/"/g, '""')}"`;
    } catch {
      return '""';
    }
  }
  const s = String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

/**
 * Convert array of objects to CSV string.
 * - headers: optional array of keys to force column order
 */
export const toCSV = (items: Record<string, any>[], headers?: string[]): string => {
  if (!Array.isArray(items) || items.length === 0) return "";

  const keys = headers && headers.length ? headers : Object.keys(items[0] ?? {});
  const lines = [keys.join(",")];

  for (const row of items) {
    const line = keys.map((k) => escapeCell(row?.[k])).join(",");
    lines.push(line);
  }

  return lines.join("\r\n");
};

/**
 * Very small CSV parser (RFC4180-aware for common cases)
 * - returns array of objects using first row as header
 * - throws AppError if parsing fails
 */
export const parseCSV = (text: string): Record<string, string>[] => {
  if (typeof text !== "string") throw new AppError("CSV content must be a string", 400);

  // Normalize newlines
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const next = normalized[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      // escaped quote -> append one quote and skip next
      cur += '"';
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "\n" && !inQuotes) {
      rows.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }
  if (cur.length > 0) rows.push(cur);

  if (rows.length === 0) return [];

  const header = rows[0].split(",").map((h) => h.trim());
  const out: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    if (!rows[r].trim()) continue; // skip empty
    const cols: string[] = [];
    let cell = "";
    let quoted = false;
    const rowStr = rows[r];

    for (let i = 0; i < rowStr.length; i++) {
      const ch = rowStr[i];
      const next = rowStr[i + 1];

      if (ch === '"' && quoted && next === '"') {
        cell += '"';
        i += 1;
        continue;
      }
      if (ch === '"' && !quoted) {
        quoted = true;
        continue;
      }
      if (ch === '"' && quoted) {
        quoted = false;
        continue;
      }
      if (ch === "," && !quoted) {
        cols.push(cell);
        cell = "";
        continue;
      }
      cell += ch;
    }
    cols.push(cell);

    const obj: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = cols[j] !== undefined ? cols[j] : "";
    }
    out.push(obj);
  }

  return out;
};

/* =========================
   FORMAT DETECTION
   ========================= */

export const detectFormat = (content: string): Format => {
  if (!content || typeof content !== "string") return "unknown";
  const trimmed = content.trim();

  // JSON array or object
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // fallthrough
    }
  }

  // CSV heuristics: contains commas and newlines, first line has multiple columns
  const lines = trimmed.split(/\r\n|\n|\r/);
  if (lines.length >= 1 && lines[0].includes(",") && lines.length > 1) {
    return "csv";
  }

  return "unknown";
};

/* =========================
   SAFE PARSERS & NORMALIZERS
   ========================= */

/**
 * parseNumberSafe - converte valores para number ou undefined
 * - aceita string com vírgula (BRL), percent, currency symbols
 */
export const parseNumberSafe = (v: unknown, fallback?: number): number | undefined => {
  if (v === undefined || v === null || v === "") return fallback;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    // normalizar vírgula brasileira para ponto
    const cleaned = v.replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(/,/, ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

/**
 * normalizeString - trim + remove control chars + limit length
 */
export const normalizeString = (s: unknown, maxLen = 1000): string => {
  if (s === undefined || s === null) return "";
  let out = String(s);
  // replace control chars except newline/tab
  out = out.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, "");
  out = out.trim();
  if (out.length > maxLen) out = out.slice(0, maxLen);
  return out;
};

/**
 * formatCurrency - basic currency formatter
 * - supports "BRL" and generic fallback
 */
export const formatCurrency = (value: number | null | undefined, currency = "BRL"): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "0.00";
  try {
    // Use Intl when available (node >= 14)
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
};

/**
 * normalizePrice - force number, round to 2 decimals
 */
export const normalizePrice = (v: unknown, fallback = 0): number => {
  const n = parseNumberSafe(v, fallback ?? 0) ?? 0;
  return Math.round(n * 100) / 100;
};

/* =========================
   PAGINATION HELPERS
   ========================= */

/**
 * parse pagination params coming from query-like objects
 */
export const parsePaginationParams = (q: Record<string, any> | undefined) => {
  const page = Math.max(1, Number(q?.page ? Number(q.page) : DEFAULT_PAGE) || DEFAULT_PAGE);
  const pageSize = Math.max(1, Number(q?.pageSize ? Number(q.pageSize) : DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE);
  return { page, pageSize };
};

/**
 * build meta object from total count
 */
export const buildPaginationMeta = (total: number, page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE): PaginationMeta => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    total,
    totalPages,
    page,
    pageSize,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/* =========================
   IMPORT / EXPORT HELPERS
   ========================= */

/**
 * parseImportContent - smart parse based on detectFormat
 * - returns array of objects for lists/items import
 */
export const parseImportContent = (content: string): Record<string, any>[] => {
  if (typeof content !== "string") throw new AppError("fileContent must be a string", 400);
  const fmt = detectFormat(content);

  if (fmt === "json") {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) return parsed.items;
      throw new AppError("JSON não possui array de items", 400);
    } catch (err: any) {
      Logger.warn({ event: "IMPORT_PARSE_JSON_FAIL", message: err?.message });
      throw new AppError("JSON inválido no arquivo importado", 400);
    }
  }

  if (fmt === "csv") {
    try {
      const rows = parseCSV(content);
      return rows;
    } catch (err: any) {
      Logger.warn({ event: "IMPORT_PARSE_CSV_FAIL", message: err?.message });
      throw new AppError("CSV inválido no arquivo importado", 400);
    }
  }

  throw new AppError("Formato de import não suportado (esperado csv ou json)", 400);
};

/**
 * buildExportPayload - normalize export payload (items + headers)
 */
export const buildExportPayload = (items: Record<string, any>[]) => {
  if (!Array.isArray(items)) throw new AppError("items deve ser um array para export", 400);
  if (items.length === 0) return { items: [], headers: [] };

  // compute natural headers (union of keys, deterministic order: alphabetical)
  const keySet = new Set<string>();
  for (const it of items) {
    if (it && typeof it === "object") Object.keys(it).forEach((k) => keySet.add(k));
  }
  const keys = Array.from(keySet);

  keys.sort();
  const rows = items.map((it) => {
    const row: Record<string, any> = {};
    for (const k of keys) row[k] = it[k] ?? "";
    return row;
  });

  return { items: rows, headers: keys };
};

/* =========================
   DOMAIN HELPERS
   ========================= */

/**
 * computeSavings - calcula economia entre estimated vs actual
 */
export const computeSavings = (estimated: number | null | undefined, actual: number | null | undefined) => {
  const e = normalizePrice(estimated ?? 0, 0);
  const a = normalizePrice(actual ?? 0, 0);
  const diff = e - a;
  const percent = e === 0 ? 0 : Math.round((diff / e) * 10000) / 100;
  return { savings: Math.round(diff * 100) / 100, percent };
};

/* =========================
   UTILITY: CHUNK / ARRAY
   ========================= */

export const chunkArray = <T>(arr: T[], size = 50): T[][] => {
  if (!Array.isArray(arr)) return [];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/* =========================
   SAFE EXEC WRAPPER
   ========================= */

/**
 * safeExec - executa função e captura erros convertendo para AppError
 * - útil quando você chama parsers/normalizers a partir do service/controller
 */
export const safeExec = async <T>(fn: () => Promise<T> | T, fallbackMessage = "Erro interno") => {
  try {
    return await fn();
  } catch (err: any) {
    Logger.error({ event: "UTIL_SAFE_EXEC_ERROR", message: err?.message, stack: err?.stack });
    if (err instanceof AppError) throw err;
    throw new AppError(fallbackMessage, 500);
  }
};

/* =========================
   EXPORTS
   ========================= */

export default {
  escapeCell,
  toCSV,
  parseCSV,
  detectFormat,
  parseNumberSafe,
  normalizeString,
  formatCurrency,
  normalizePrice,
  parsePaginationParams,
  buildPaginationMeta,
  parseImportContent,
  buildExportPayload,
  computeSavings,
  chunkArray,
  safeExec,
};
