// src/modules/supermarket/supermarket.types.ts
/**
 * Fortress Supermarket — Types v7 (Enterprise Edition)
 * Toda tipagem centralizada, padronizada e reutilizável em service, validator, controller e testes.
 */

import { SupermarketCategory } from "@prisma/client";

/* -----------------------------------------------------
 * BASE
 * --------------------------------------------------- */
export interface PaginationInput {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/* -----------------------------------------------------
 * LISTS
 * --------------------------------------------------- */
export interface CreateListInput {
  name: string;
  budget?: number;
}

export interface UpdateListInput {
  name?: string;
  budget?: number;
}

export interface DuplicateListResult {
  newListId: string;
}

export interface ArchiveResult {
  id: string;
  archived: boolean;
}

/* -----------------------------------------------------
 * ITEMS
 * --------------------------------------------------- */
export interface CreateItemInput {
  name: string;
  category: SupermarketCategory;
  estimatedPrice: number;
  quantity?: number;
}

export interface UpdateItemInput {
  name?: string;
  category?: SupermarketCategory;
  estimatedPrice?: number;
  actualPrice?: number;
  purchased?: boolean;
}

export interface BulkAddItemsInput {
  items: CreateItemInput[];
}

export interface BulkUpdateItem {
  id: string;
  update: UpdateItemInput;
}

export interface BulkUpdateItemsInput {
  items: BulkUpdateItem[];
}

export interface BulkDeleteItemsInput {
  itemIds: string[];
}

/* -----------------------------------------------------
 * COLLABORATORS
 * --------------------------------------------------- */
export interface AddCollaboratorInput {
  collaboratorEmail: string;
  role: string;
}

export interface UpdateCollaboratorRoleInput {
  role: string;
}

/* -----------------------------------------------------
 * IMPORT / EXPORT
 * --------------------------------------------------- */
export interface ExportListOptions {
  format: "json" | "csv";
}

export interface ImportListInput {
  format: "json" | "csv";
  fileContent: string;
}

/* -----------------------------------------------------
 * ANALYTICS
 * --------------------------------------------------- */
export interface MonthlyStatsInput {
  month?: number;
  year?: number;
}

export interface YearlyStatsInput {
  year?: number;
}

export interface TopCategoriesInput {
  limit: number;
}
