import { getPaginationMetaWithOptions, toSkipTake } from "../../utils/pagination";

/**
 * Apply pagination for a Prisma model.
 * - `prismaModel` should be a model delegate (e.g. `prisma.user`).
 * - `where` is an optional filter object.
 */
export async function applyPaginationPrisma(prismaModel: any, where: any = {}, page = 1, pageSize = 20, options?: { clampPage?: boolean }) {
  const { skip, take } = toSkipTake(page, pageSize);

  const [items, totalCount] = await Promise.all([
    prismaModel.findMany({ where, skip, take }),
    prismaModel.count({ where }),
  ]);

  const meta = getPaginationMetaWithOptions(totalCount, page, pageSize, options);
  return { items, totalCount, meta };
}
