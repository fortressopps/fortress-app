// src/controllers/supermarketController.ts
/**
 * Fortress Enterprise — Supermarket Controller (v6)
 * - Thin controllers (delegam lógica ao services)
 * - Tipagem explícita mínima para evitar TS2304
 * - Validação via validateBody(schemaName, payload)
 * - Logging estruturado com fortressLogger
 * - Respostas padronizadas
 *
 * Dependências esperadas (aliases):
 *  - @services/supermarketService  -> funções de negócio
 *  - @validators/supermarketSchemas -> validateBody(schemaName, payload)
 *  - @utils/appError
 *  - @utils/catchAsync
 *  - @utils/logger (fortressLogger)
 *  - @common/utils/pagination.helper
 *
 * Observações:
 *  - Mantenha controllers finos: regras pesadas e transações ficam no service.
 *  - Garanta que a tipagem de `Request.user` exista em src/types/express.d.ts
 */

import { Request, Response, NextFunction } from "express";
import AppError from "@utils/appError";
import catchAsync from "@utils/catchAsync";
import { fortressLogger } from "@utils/logger";
import { getPaginationParams, getPaginationMetaWithOptions } from "@common/utils/pagination.helper";
import * as services from "@services/supermarketService";
import { validateBody } from "@validators/supermarketSchemas";

/* -------------------- Local Types -------------------- */

type AnyObj = Record<string, any>;

interface ReqWithUser extends Request {
  user?: {
    id?: string;
    email?: string;
    [k: string]: any;
  };
}

/* -------------------- Small Helpers -------------------- */

const isValidId = (v?: string): boolean => typeof v === "string" && v.trim().length > 0;

const parseNumberSafe = (v: unknown, fallback?: number): number | undefined => {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const escapeCell = (v: any) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return `"${JSON.stringify(v).replace(/"/g, '""')}"`;
  const s = String(v);
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const toCSV = (items: AnyObj[], headers?: string[]) => {
  if (!Array.isArray(items) || items.length === 0) return "";
  const keys = headers && headers.length ? headers : Object.keys(items[0]);
  const lines = [keys.join(",")];
  for (const row of items) {
    lines.push(keys.map((k) => escapeCell(row?.[k])).join(","));
  }
  return lines.join("\n");
};

const sendResponse = (res: Response, statusCode: number, message: string, data: AnyObj = {}) => {
  res.status(statusCode).json({
    status: statusCode >= 200 && statusCode < 300 ? "success" : "error",
    message,
    data,
  });
};

/* -------------------- Controllers -------------------- */

/**
 * Create a supermarket list
 * POST /api/supermarket/lists
 */
export const createList = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const payload = validateBody("createList", req.body);
  const result = await services.createListService({ userId: req.user.id, payload });
  fortressLogger.info({ event: "SM.CREATE_LIST", userId: req.user.id, listId: result?.id });
  sendResponse(res, 201, "Lista criada com sucesso", { list: result });
});

/**
 * GET lists (paginated)
 * GET /api/supermarket/lists
 */
export const getLists = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const { page, pageSize } = getPaginationParams(req.query);
  const { lists = [], count = 0 } = await services.getListsService({ userId: req.user.id, pagination: { page, pageSize } });
  const meta = getPaginationMetaWithOptions(count, page, pageSize);
  fortressLogger.info({ event: "SM.GET_LISTS", userId: req.user.id, page, pageSize, count });
  sendResponse(res, 200, "Listas obtidas", { lists, meta });
});

/**
 * GET single list
 * GET /api/supermarket/lists/:id
 */
export const getList = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const id = String(req.params.id || "");
  if (!isValidId(id)) return next(new AppError("ID inválido", 400));
  const list = await services.getListService({ userId: req.user.id, listId: id });
  if (!list) return next(new AppError("Lista não encontrada", 404));
  fortressLogger.info({ event: "SM.GET_LIST", userId: req.user.id, listId: id });
  sendResponse(res, 200, "Lista obtida", { list });
});

/**
 * Update list
 * PUT /api/supermarket/lists/:id
 */
export const updateList = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const id = String(req.params.id || "");
  if (!isValidId(id)) return next(new AppError("ID inválido", 400));
  const payload = validateBody("updateList", req.body);
  const updated = await services.updateListService({ userId: req.user.id, listId: id, payload });
  fortressLogger.info({ event: "SM.UPDATE_LIST", userId: req.user.id, listId: id });
  sendResponse(res, 200, "Lista atualizada", { list: updated });
});

/**
 * Delete list
 * DELETE /api/supermarket/lists/:id
 */
export const deleteList = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const id = String(req.params.id || "");
  if (!isValidId(id)) return next(new AppError("ID inválido", 400));
  await services.deleteListService({ userId: req.user.id, listId: id });
  fortressLogger.info({ event: "SM.DELETE_LIST", userId: req.user.id, listId: id });
  sendResponse(res, 200, "Lista excluída");
});

/* ---------------- Items ---------------- */

/**
 * Add an item to a list
 * POST /api/supermarket/lists/:id/items
 */
export const addItem = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.id || "");
  if (!isValidId(listId)) return next(new AppError("ID da lista inválido", 400));
  const payload = validateBody("addItem", req.body);
  const out = await services.addItemService({ userId: req.user.id, listId, payload });
  fortressLogger.info({ event: "SM.ADD_ITEM", userId: req.user.id, listId, itemId: out?.item?.id });
  sendResponse(res, 201, "Item adicionado", { item: out?.item, list: out?.list });
});

/**
 * Update item
 * PUT /api/supermarket/lists/:listId/items/:itemId
 */
export const updateItem = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.listId || req.params.id || "");
  const itemId = String(req.params.itemId || req.params.idItem || "");
  if (!isValidId(listId) || !isValidId(itemId)) return next(new AppError("IDs inválidos", 400));
  const payload = validateBody("updateItem", req.body);
  const out = await services.updateItemService({ userId: req.user.id, listId, itemId, payload });
  fortressLogger.info({ event: "SM.UPDATE_ITEM", userId: req.user.id, listId, itemId });
  sendResponse(res, 200, "Item atualizado", { item: out?.item, list: out?.list });
});

/**
 * Delete item
 * DELETE /api/supermarket/lists/:listId/items/:itemId
 */
export const deleteItem = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.listId || req.params.id || "");
  const itemId = String(req.params.itemId || "");
  if (!isValidId(listId) || !isValidId(itemId)) return next(new AppError("IDs inválidos", 400));
  const out = await services.deleteItemService({ userId: req.user.id, listId, itemId });
  fortressLogger.info({ event: "SM.DELETE_ITEM", userId: req.user.id, listId, itemId });
  sendResponse(res, 200, "Item removido", { list: out?.list });
});

/**
 * Mark item as purchased
 * POST /api/supermarket/lists/:listId/items/:itemId/purchased
 */
export const markItemPurchased = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.listId || req.params.id || "");
  const itemId = String(req.params.itemId || "");
  if (!isValidId(listId) || !isValidId(itemId)) return next(new AppError("IDs inválidos", 400));
  const payload = validateBody("markItemPurchased", req.body);
  const out = await services.markItemPurchasedService({ userId: req.user.id, listId, itemId, payload });
  fortressLogger.info({ event: "SM.MARK_ITEM_PURCHASED", userId: req.user.id, listId, itemId });
  sendResponse(res, 200, "Item marcado como comprado", { item: out?.item, list: out?.list, savings: out?.savings });
});

/**
 * Clear purchased items
 * POST /api/supermarket/lists/:id/clear-purchased
 */
export const clearPurchasedItems = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.id || "");
  if (!isValidId(listId)) return next(new AppError("ID inválido", 400));
  const out = await services.clearPurchasedItemsService({ userId: req.user.id, listId });
  fortressLogger.info({ event: "SM.CLEAR_PURCHASED", userId: req.user.id, listId, clearedCount: out?.clearedCount ?? 0 });
  sendResponse(res, 200, "Itens comprados removidos", { clearedCount: out?.clearedCount, list: out?.list });
});

/* ---------------- Bulk / Batch ---------------- */

/**
 * Bulk add items
 * POST /api/supermarket/lists/:id/items/bulk
 */
export const bulkAddItems = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.id || "");
  if (!isValidId(listId)) return next(new AppError("ID inválido", 400));
  const payload = validateBody("bulkAddItems", req.body);
  const out = await services.bulkAddItemsService({ userId: req.user.id, listId, items: payload.items || [] });
  fortressLogger.info({ event: "SM.BULK_ADD", userId: req.user.id, listId, count: out?.items?.length ?? 0 });
  sendResponse(res, 201, "Itens adicionados em lote", { items: out?.items, list: out?.list });
});

/**
 * Bulk update items
 * PUT /api/supermarket/lists/:id/items/bulk
 */
export const bulkUpdateItems = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.id || "");
  if (!isValidId(listId)) return next(new AppError("ID inválido", 400));
  const payload = validateBody("bulkUpdateItems", req.body);
  const out = await services.bulkUpdateItemsService({ userId: req.user.id, listId, items: payload.items || [] });
  fortressLogger.info({ event: "SM.BULK_UPDATE", userId: req.user.id, listId, count: out?.items?.length ?? 0 });
  sendResponse(res, 200, "Itens atualizados em lote", { items: out?.items, list: out?.list });
});

/**
 * Bulk delete items
 * DELETE /api/supermarket/lists/:id/items/bulk
 */
export const bulkDeleteItems = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.id || "");
  if (!isValidId(listId)) return next(new AppError("ID inválido", 400));
  const payload = validateBody("bulkDeleteItems", req.body);
  const out = await services.bulkDeleteItemsService({ userId: req.user.id, listId, itemIds: payload.itemIds || [] });
  fortressLogger.info({ event: "SM.BULK_DELETE", userId: req.user.id, listId, deletedCount: out?.deletedCount ?? 0 });
  sendResponse(res, 200, "Itens removidos em lote", { deletedCount: out?.deletedCount, list: out?.list });
});

/* ---------------- Misc: duplicate / archive / restore ---------------- */

export const duplicateList = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const id = String(req.params.id || "");
  if (!isValidId(id)) return next(new AppError("ID inválido", 400));
  const newList = await services.duplicateListService({ userId: req.user.id, listId: id });
  fortressLogger.info({ event: "SM.DUPLICATE_LIST", userId: req.user.id, sourceListId: id, newListId: newList?.id });
  sendResponse(res, 201, "Lista duplicada", { list: newList });
});

export const archiveList = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const id = String(req.params.id || "");
  if (!isValidId(id)) return next(new AppError("ID inválido", 400));
  const out = await services.archiveListService({ userId: req.user.id, listId: id });
  fortressLogger.info({ event: "SM.ARCHIVE_LIST", userId: req.user.id, listId: id });
  sendResponse(res, 200, "Lista arquivada", { list: out });
});

export const unarchiveList = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const id = String(req.params.id || "");
  if (!isValidId(id)) return next(new AppError("ID inválido", 400));
  const out = await services.unarchiveListService({ userId: req.user.id, listId: id });
  fortressLogger.info({ event: "SM.UNARCHIVE_LIST", userId: req.user.id, listId: id });
  sendResponse(res, 200, "Lista desarquivada", { list: out });
});

/* ---------------- Export / Import ---------------- */

/**
 * Export list (JSON or CSV)
 * GET /api/supermarket/lists/:id/export?format=csv|json
 */
export const exportList = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const id = String(req.params.id || "");
  if (!isValidId(id)) return next(new AppError("ID inválido", 400));
  const format = (typeof req.query.format === "string" ? req.query.format.toLowerCase() : "json");
  const out = await services.exportListService({ userId: req.user.id, listId: id, format });
  fortressLogger.info({ event: "SM.EXPORT_LIST", userId: req.user.id, listId: id, format });

  if (format === "csv") {
    const csv = toCSV(out.items || [], out.headers);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="supermarket-list-${id}.csv"`);
    return res.status(200).send(csv);
  }

  sendResponse(res, 200, "Export realizado", { export: out });
});

/**
 * Import list (JSON or CSV payload) - POST /api/supermarket/lists/import
 */
export const importList = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const payload = validateBody("importList", req.body); // { format, fileContent }
  if (!payload?.fileContent) return next(new AppError("fileContent é obrigatório", 400));
  const format = (payload.format || "json").toLowerCase();

  // delegate parsing & validation to service (service has better error messages)
  const newList = await services.importListService({ userId: req.user.id, fileContent: payload.fileContent, format });
  fortressLogger.info({ event: "SM.IMPORT_LIST", userId: req.user.id, newListId: newList?.id, format });
  sendResponse(res, 201, "Import realizado", { list: newList });
});

/* ---------------- Analytics / Insights (thin wrappers) ---------------- */

export const getAnalytics = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const analytics = await services.getAnalyticsService({ userId: req.user.id });
  fortressLogger.info({ event: "SM.GET_ANALYTICS", userId: req.user.id });
  sendResponse(res, 200, "Analytics", { analytics });
});

export const getMonthlyStatistics = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const month = parseNumberSafe(req.query.month, undefined);
  const year = parseNumberSafe(req.query.year, undefined);
  const stats = await services.getMonthlyStatisticsService({ userId: req.user.id, month, year });
  fortressLogger.info({ event: "SM.MONTHLY_STATS", userId: req.user.id, month, year });
  sendResponse(res, 200, "Estatísticas mensais", { statistics: stats });
});

export const getYearlyStatistics = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const year = parseNumberSafe(req.query.year, undefined);
  const stats = await services.getYearlyStatisticsService({ userId: req.user.id, year });
  fortressLogger.info({ event: "SM.YEARLY_STATS", userId: req.user.id, year });
  sendResponse(res, 200, "Estatísticas anuais", { statistics: stats });
});

export const getTopSpendingCategories = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const limit = parseNumberSafe(req.query.limit, 5) ?? 5;
  const categories = await services.getTopSpendingCategoriesService({ userId: req.user.id, limit });
  fortressLogger.info({ event: "SM.TOP_CATEGORIES", userId: req.user.id, limit });
  sendResponse(res, 200, "Top categories", { categories });
});

/* ---------------- Item-level analytics & suggestions ---------------- */

export const getItemPriceHistory = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const itemId = String(req.params.itemId || req.params.id || "");
  if (!isValidId(itemId)) return next(new AppError("itemId inválido", 400));
  const history = await services.getItemPriceHistoryService({ userId: req.user.id, itemId });
  fortressLogger.info({ event: "SM.ITEM_PRICE_HISTORY", userId: req.user.id, itemId, count: history?.length ?? 0 });
  sendResponse(res, 200, "Histórico de preços", { history });
});

/* ---------------- Collaborators (share) ---------------- */

export const getCollaborators = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.id || "");
  const collaborators = await services.getCollaboratorsService({ userId: req.user.id, listId });
  fortressLogger.info({ event: "SM.GET_COLLABORATORS", userId: req.user.id, listId, count: collaborators?.length ?? 0 });
  sendResponse(res, 200, "Colaboradores", { collaborators });
});

export const addCollaborator = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.id || "");
  const payload = validateBody("addCollaborator", req.body);
  const collaborator = await services.addCollaboratorService({ userId: req.user.id, listId, collaboratorEmail: payload.collaboratorEmail, role: payload.role });
  fortressLogger.info({ event: "SM.ADD_COLLABORATOR", userId: req.user.id, listId, collaboratorEmail: payload.collaboratorEmail });
  sendResponse(res, 201, "Colaborador adicionado", { collaborator });
});

export const removeCollaborator = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.id || "");
  const collaboratorId = String(req.params.collaboratorId || "");
  if (!isValidId(collaboratorId)) return next(new AppError("collaboratorId inválido", 400));
  await services.removeCollaboratorService({ userId: req.user.id, listId, collaboratorId });
  fortressLogger.info({ event: "SM.REMOVE_COLLABORATOR", userId: req.user.id, listId, collaboratorId });
  sendResponse(res, 200, "Colaborador removido");
});

export const updateCollaboratorRole = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const listId = String(req.params.id || "");
  const collaboratorId = String(req.params.collaboratorId || "");
  const payload = validateBody("updateCollaboratorRole", req.body);
  if (!isValidId(collaboratorId)) return next(new AppError("collaboratorId inválido", 400));
  const updated = await services.updateCollaboratorRoleService({ userId: req.user.id, listId, collaboratorId, role: payload.role });
  fortressLogger.info({ event: "SM.UPDATE_COLLAB_ROLE", userId: req.user.id, listId, collaboratorId, role: payload.role });
  sendResponse(res, 200, "Papel do colaborador atualizado", { collaborator: updated });
});

/* ---------------- Admin utilities (gated by router / middleware) ---------------- */

export const exportAllListsForUser = catchAsync(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  // Make sure router/middleware restricts this to admin if needed
  if (!req.user?.id) return next(new AppError("Usuário não autenticado", 401));
  const out = await services.exportAllListsForUserService({ userId: req.user.id });
  fortressLogger.info({ event: "SM.EXPORT_ALL", userId: req.user.id, count: out?.lists?.length ?? 0 });
  sendResponse(res, 200, "Export completo", { lists: out?.lists || [] });
});

/* ---------------- End of file -------------------- */
