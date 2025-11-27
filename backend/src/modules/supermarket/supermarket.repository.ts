// src/modules/supermarket/supermarket.repository.ts
/**
 * Supermarket Repository v7
 * Centraliza TODAS as operações Prisma.
 * Nenhuma lógica de negócio mora aqui.
 */

import { prisma } from "@/lib/db";
import AppError from "@/utils/appError";

/* -----------------------------------------------------
 * Ownership
 * --------------------------------------------------- */
export async function assertListOwnership(userId: string, listId: string) {
  const list = await prisma.supermarketList.findFirst({
    where: { id: listId, userId },
  });

  if (!list) {
    throw new AppError("Lista não encontrada ou não pertence ao usuário", 404);
  }
  return list;
}

/* -----------------------------------------------------
 * LISTS
 * --------------------------------------------------- */
export async function createList(userId: string, data: any) {
  return prisma.supermarketList.create({
    data: { ...data, userId },
  });
}

export async function getLists(userId: string, page: number, pageSize: number) {
  const [lists, total] = await Promise.all([
    prisma.supermarketList.findMany({
      where: { userId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.supermarketList.count({ where: { userId } }),
  ]);
  return { lists, total };
}

export async function getList(userId: string, listId: string) {
  await assertListOwnership(userId, listId);
  return prisma.supermarketList.findUnique({
    where: { id: listId },
    include: { items: true },
  });
}

export async function updateList(userId: string, listId: string, data: any) {
  await assertListOwnership(userId, listId);
  return prisma.supermarketList.update({
    where: { id: listId },
    data,
  });
}

export async function deleteList(userId: string, listId: string) {
  await assertListOwnership(userId, listId);
  return prisma.supermarketList.delete({
    where: { id: listId },
  });
}

/* -----------------------------------------------------
 * ITEMS
 * --------------------------------------------------- */
export async function createItem(listId: string, data: any) {
  return prisma.supermarketItem.create({
    data: { ...data, listId },
  });
}

export async function updateItem(userId: string, listId: string, itemId: string, data: any) {
  await assertListOwnership(userId, listId);
  return prisma.supermarketItem.update({
    where: { id: itemId },
    data,
  });
}

export async function deleteItem(userId: string, listId: string, itemId: string) {
  await assertListOwnership(userId, listId);
  return prisma.supermarketItem.delete({
    where: { id: itemId },
  });
}

export async function clearPurchasedItems(userId: string, listId: string) {
  await assertListOwnership(userId, listId);

  const result = await prisma.supermarketItem.deleteMany({
    where: { listId, purchased: true },
  });

  const list = await prisma.supermarketList.findUnique({ where: { id: listId } });

  return { count: result.count, list };
}

/* -----------------------------------------------------
 * BULK OPERATIONS
 * --------------------------------------------------- */
export async function bulkAdd(listId: string, items: any[]) {
  return prisma.$transaction(async (tx) => {
    const created = await Promise.all(
      items.map((item) =>
        tx.supermarketItem.create({
          data: { ...item, listId },
        })
      )
    );

    const list = await tx.supermarketList.findUnique({ where: { id: listId } });
    return { items: created, list };
  });
}

export async function bulkUpdate(userId: string, listId: string, updates: any[]) {
  await assertListOwnership(userId, listId);

  return prisma.$transaction(async (tx) => {
    const updated = await Promise.all(
      updates.map((u) =>
        tx.supermarketItem.update({
          where: { id: u.id },
          data: u.update,
        })
      )
    );

    const list = await tx.supermarketList.findUnique({ where: { id: listId } });
    return { items: updated, list };
  });
}

export async function bulkDelete(userId: string, listId: string, ids: string[]) {
  await assertListOwnership(userId, listId);

  return prisma.$transaction(async (tx) => {
    const deleted = await tx.supermarketItem.deleteMany({
      where: { id: { in: ids }, listId },
    });

    const list = await tx.supermarketList.findUnique({ where: { id: listId } });
    return { count: deleted.count, list };
  });
}
