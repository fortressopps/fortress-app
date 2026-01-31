// backend/src/modules/supermarket/supermarket.repository.ts
import { prisma } from "../../../libs/prisma.js";
import type {
  SupermarketList,
  SupermarketItem,
} from "@prisma/client";

// ───────────────────────────────────────────
// LISTA DO SUPERMERCADO
// ───────────────────────────────────────────

export async function getUserSupermarketList(userId: string) {
  return prisma.supermarketList.findFirst({
    where: { userId },
    select: {
      id: true,
      name: true,
      budget: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          name: true,
          category: true,
          estimatedPrice: true,
          actualPrice: true,
          quantity: true,
          purchased: true,
        }
      }
    }
  });
}

export async function createSupermarketList(userId: string, name: string) {
  return prisma.supermarketList.create({
    data: {
      userId,
      name,
    },
  });
}

export async function getUserSupermarketLists(userId: string, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.supermarketList.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.supermarketList.count({ where: { userId } }),
  ]);

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getSupermarketListById(id: string) {
  return prisma.supermarketList.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      budget: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          name: true,
          category: true,
          estimatedPrice: true,
          actualPrice: true,
          quantity: true,
          purchased: true,
        }
      }
    }
  });
}

export async function updateSupermarketList(id: string, data: Partial<SupermarketList>) {
  return prisma.supermarketList.update({
    where: { id },
    data,
  });
}

export async function deleteSupermarketList(id: string) {
  return prisma.supermarketList.delete({
    where: { id },
  });
}

// ───────────────────────────────────────────
// ITENS DO SUPERMERCADO
// ───────────────────────────────────────────

export async function addSupermarketItem(
  listId: string,
  data: Omit<SupermarketItem, "id" | "createdAt" | "updatedAt" | "listId">
) {
  return prisma.supermarketItem.create({
    data: {
      ...data,
      listId,
    },
  });
}

export async function updateSupermarketItem(
  itemId: string,
  data: Partial<SupermarketItem>
) {
  return prisma.supermarketItem.update({
    where: { id: itemId },
    data,
  });
}

export async function deleteSupermarketItem(itemId: string) {
  return prisma.supermarketItem.delete({
    where: { id: itemId },
  });
}

export async function deleteAllItemsFromList(listId: string) {
  return prisma.supermarketItem.deleteMany({
    where: { listId },
  });
}

// ───────────────────────────────────────────
// TRANSAÇÕES COMPLEXAS
// ───────────────────────────────────────────

export async function addMultipleItems(listId: string, items: Array<Omit<SupermarketItem, "id" | "createdAt" | "updatedAt" | "listId">>) {
  return prisma.$transaction(async (tx) => {
    const list = await tx.supermarketList.findUnique({ where: { id: listId } });
    if (!list) return null;

    const createdItems = await Promise.all(
      items.map(item =>
        tx.supermarketItem.create({
          data: { ...item, listId },
        })
      )
    );

    return createdItems;
  });
}

export async function updateMultipleItems(listId: string, items: Array<Partial<SupermarketItem>>) {
  return prisma.$transaction(async (tx) => {
    const list = await tx.supermarketList.findUnique({ where: { id: listId } });
    if (!list) return null;

    const updatedItems = await Promise.all(
      items.map(item =>
        tx.supermarketItem.update({
          where: { id: item.id },
          data: item,
        })
      )
    );

    return updatedItems;
  });
}

export async function deleteMultipleItems(ids: string[]) {
  return prisma.$transaction(async (tx) => {
    await tx.supermarketItem.deleteMany({
      where: { id: { in: ids } },
    });
    return true;
  });
}
