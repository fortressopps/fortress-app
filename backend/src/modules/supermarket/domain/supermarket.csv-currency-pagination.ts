/**
 * Fortress Supermarket — CSV, moeda e paginação (v7)
 * Method: supermarket.csv-currency-pagination.ts (responsabilidade = csv-currency-pagination)
 * - CSV <-> JSON (RFC4180), detect format, safe number parsing
 * - Pagination helpers
 * - Sanitizers, normalizers, formatCurrency, normalizePrice
 * - Import/export, computeSavings, chunkArray, safeExec
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

export const parseCSV = (text: string): Record<string, string>[] => {
  if (typeof text !== "string") throw new AppError("CSV content must be a string", 400);
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rows: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const next = normalized[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
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
    if (!rows[r].trim()) continue;
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

export const detectFormat = (content: string): Format => {
  if (!content || typeof content !== "string") return "unknown";
  const trimmed = content.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // fallthrough
    }
  }
  const lines = trimmed.split(/\r\n|\n|\r/);
  if (lines.length >= 1 && lines[0].includes(",") && lines.length > 1) return "csv";
  return "unknown";
};

/* =========================
   SAFE PARSERS & NORMALIZERS
   ========================= */

export const parseNumberSafe = (v: unknown, fallback?: number): number | undefined => {
  if (v === undefined || v === null || v === "") return fallback;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(/,/, ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
};

export const normalizeString = (s: unknown, maxLen = 1000): string => {
  if (s === undefined || s === null) return "";
  let out = String(s);
  out = out.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, "");
  out = out.trim();
  if (out.length > maxLen) out = out.slice(0, maxLen);
  return out;
};

export const formatCurrency = (value: number | null | undefined, currency = "BRL"): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "0.00";
  try {
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

export const normalizePrice = (v: unknown, fallback = 0): number => {
  const n = parseNumberSafe(v, fallback ?? 0) ?? 0;
  return Math.round(n * 100) / 100;
};

/* =========================
   PAGINATION HELPERS
   ========================= */

export const parsePaginationParams = (q: Record<string, any> | undefined) => {
  const page = Math.max(1, Number(q?.page ? Number(q.page) : DEFAULT_PAGE) || DEFAULT_PAGE);
  const pageSize = Math.max(1, Number(q?.pageSize ? Number(q.pageSize) : DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE);
  return { page, pageSize };
};

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
      return parseCSV(content);
    } catch (err: any) {
      Logger.warn({ event: "IMPORT_PARSE_CSV_FAIL", message: err?.message });
      throw new AppError("CSV inválido no arquivo importado", 400);
    }
  }
  throw new AppError("Formato de import não suportado (esperado csv ou json)", 400);
};

export const buildExportPayload = (items: Record<string, any>[]) => {
  if (!Array.isArray(items)) throw new AppError("items deve ser um array para export", 400);
  if (items.length === 0) return { items: [], headers: [] };
  const keySet = new Set<string>();
  for (const it of items) {
    if (it && typeof it === "object") Object.keys(it).forEach((k) => keySet.add(k));
  }
  const keys = Array.from(keySet).sort();
  const rows = items.map((it) => {
    const row: Record<string, any> = {};
    for (const k of keys) row[k] = it[k] ?? "";
    return row;
  });
  return { items: rows, headers: keys };
};

export const computeSavings = (estimated: number | null | undefined, actual: number | null | undefined) => {
  const e = normalizePrice(estimated ?? 0, 0);
  const a = normalizePrice(actual ?? 0, 0);
  const diff = e - a;
  const percent = e === 0 ? 0 : Math.round((diff / e) * 10000) / 100;
  return { savings: Math.round(diff * 100) / 100, percent };
};

export const chunkArray = <T>(arr: T[], size = 50): T[][] => {
  if (!Array.isArray(arr)) return [];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export const safeExec = async <T>(fn: () => Promise<T> | T, fallbackMessage = "Erro interno") => {
  try {
    return await fn();
  } catch (err: any) {
    Logger.error({ event: "UTIL_SAFE_EXEC_ERROR", message: err?.message, stack: err?.stack });
    if (err instanceof AppError) throw err;
    throw new AppError(fallbackMessage, 500);
  }
};

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
