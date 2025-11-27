export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MAX_PAGE = 10000;
/**
 * Parse and normalize pagination params from a URLSearchParams.
 *
 * Rules:
 * - Accepts only integer values for `page` and `pageSize`.
 * - If the value is missing or invalid, falls back to defaults.
 * - `page` is clamped to [1, MAX_PAGE].
 * - `pageSize` is clamped to [1, MAX_PAGE_SIZE].
 */
export function getPaginationParams(query) {
    if (!query)
        return { page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE };
    const pageRaw = query.get('page');
    const pageSizeRaw = query.get('pageSize');
    let page = DEFAULT_PAGE;
    let pageSize = DEFAULT_PAGE_SIZE;
    if (pageRaw !== null) {
        const parsed = Number(pageRaw);
        if (!Number.isNaN(parsed) && Number.isInteger(parsed) && parsed > 0) {
            page = Math.min(parsed, MAX_PAGE);
        }
    }
    if (pageSizeRaw !== null) {
        const parsed = Number(pageSizeRaw);
        if (!Number.isNaN(parsed) && Number.isInteger(parsed) && parsed > 0) {
            pageSize = Math.min(Math.max(parsed, 1), MAX_PAGE_SIZE);
        }
    }
    return { page, pageSize };
}
/**
 * Build pagination metadata from totals and requested page/pageSize.
 *
 * - Ensures `totalCount` is a non-negative integer (truncates floats).
 * - Ensures `pageSize` is within allowed bounds and not zero to avoid division by zero.
 * - `page` is adjusted to fall within available pages when possible (1..totalPages).
 */
export function getPaginationMeta(totalCount, page, pageSize) {
    const safeTotal = Number.isFinite(totalCount) ? Math.max(0, Math.trunc(totalCount)) : 0;
    const rawPageSize = Number.isFinite(pageSize) ? Math.trunc(pageSize) : DEFAULT_PAGE_SIZE;
    const safePageSize = Math.max(1, Math.min(rawPageSize || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE));
    const totalPages = safePageSize > 0 ? Math.ceil(safeTotal / safePageSize) : 0;
    const rawPage = Number.isFinite(page) ? Math.trunc(page) : DEFAULT_PAGE;
    const safePage = totalPages > 0 ? Math.min(Math.max(rawPage || DEFAULT_PAGE, 1), totalPages) : DEFAULT_PAGE;
    return { totalCount: safeTotal, page: safePage, pageSize: safePageSize, totalPages };
}
/**
 * Convert page/pageSize into skip/take values for DB queries.
 */
export function toSkipTake(page, pageSize) {
    const p = Number.isFinite(page) ? Math.max(1, Math.trunc(page)) : DEFAULT_PAGE;
    const ps = Number.isFinite(pageSize) ? Math.max(1, Math.trunc(pageSize)) : DEFAULT_PAGE_SIZE;
    const skip = (p - 1) * ps;
    const take = ps;
    return { skip, take };
}
/**
 * Same as `getPaginationMeta` but with an option to disable clamping of the requested page.
 *
 * @param totalCount total number of items
 * @param page requested page (will be truncated)
 * @param pageSize requested page size (will be truncated and clamped)
 * @param options.clampPage when true (default) the returned `page` will be clamped to available pages (1..totalPages).
 */
export function getPaginationMetaWithOptions(totalCount, page, pageSize, options) {
    const safeTotal = Number.isFinite(totalCount) ? Math.max(0, Math.trunc(totalCount)) : 0;
    const rawPageSize = Number.isFinite(pageSize) ? Math.trunc(pageSize) : DEFAULT_PAGE_SIZE;
    const safePageSize = Math.max(1, Math.min(rawPageSize || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE));
    const totalPages = safePageSize > 0 ? Math.ceil(safeTotal / safePageSize) : 0;
    const rawPage = Number.isFinite(page) ? Math.trunc(page) : DEFAULT_PAGE;
    const clampPage = options?.clampPage !== false;
    let outPage;
    if (clampPage) {
        outPage = totalPages > 0 ? Math.min(Math.max(rawPage || DEFAULT_PAGE, 1), totalPages) : DEFAULT_PAGE;
    }
    else {
        outPage = Math.max(rawPage || DEFAULT_PAGE, 1);
    }
    return { totalCount: safeTotal, page: outPage, pageSize: safePageSize, totalPages };
}
