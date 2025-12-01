// backend/src/modules/example/example.controller.ts
import { prisma } from "../../libs/prisma.js";
import { applyPaginationPrisma } from "../../common/utils/pagination.helper.js";

export async function exampleList(req, res) {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;

  const { items, meta } = await applyPaginationPrisma(
    prisma.item,
    {},
    page,
    pageSize
  );

  return res.json({ items, meta });
}
