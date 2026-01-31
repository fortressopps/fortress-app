/**
 * Utilitários de paginação — getPaginationParams, toSkipTake, getPaginationMetaWithOptions
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export function getPaginationParams(
  source?: URLSearchParams | Record<string, unknown>,
  defaults = { page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE }
): PaginationParams {
  if (!source) {
    return { page: defaults.page, pageSize: defaults.pageSize };
  }
  const get = (key: string): string | null => {
    if (source instanceof URLSearchParams) {
      return source.get(key);
    }
    const v = (source as Record<string, unknown>)[key];
    return v != null ? String(v) : null;
  };
  const pageRaw = get("page");
  const pageSizeRaw = get("pageSize");
  let page = defaults.page;
  let pageSize = defaults.pageSize;
  if (pageRaw != null) {
    const n = Number(pageRaw);
    if (Number.isInteger(n) && n >= 1) page = n;
  }
  if (pageSizeRaw != null) {
    const n = Number(pageSizeRaw);
    if (Number.isInteger(n) && n >= 1) pageSize = Math.min(n, MAX_PAGE_SIZE);
  }
  return { page, pageSize };
}

export function toSkipTake(page: number, pageSize: number): { skip: number; take: number } {
  const p = Math.max(1, page);
  const ps = Math.max(1, pageSize);
  return { skip: (p - 1) * ps, take: ps };
}

export interface PaginationMetaOptions {
  clampPage?: boolean;
}

export function getPaginationMetaWithOptions(
  totalCount: number,
  page: number,
  pageSize: number,
  options?: PaginationMetaOptions
): { total: number; totalPages: number; page: number; pageSize: number; hasNext: boolean; hasPrev: boolean } {
  const total = Math.max(0, totalCount);
  const ps = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / ps));
  let p = Math.max(1, page);
  if (options?.clampPage !== false) {
    p = Math.min(p, totalPages);
  }
  return {
    total,
    totalPages,
    page: p,
    pageSize: ps,
    hasNext: p < totalPages,
    hasPrev: p > 1,
  };
}
