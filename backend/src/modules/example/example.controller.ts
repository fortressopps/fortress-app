import { Controller, Get, Query } from '@nestjs/common';
import { ParsePaginationPipe } from '../../common/pipes/pagination.pipe';
import { PaginationParams } from '../../../../utils/pagination';
import { applyPaginationPrisma } from '../../common/utils/pagination.helper';
// Import your prisma client - adjust path if different in your repo
import prisma from '../../../../lib/db';

@Controller('example')
export class ExampleController {
  @Get()
  async list(@Query(new ParsePaginationPipe()) pagination: PaginationParams) {
    const { page, pageSize } = pagination;
    // replace `prisma.item` with your model name
    const { items, meta } = await applyPaginationPrisma(prisma.item, {}, page, pageSize);
    return { data: items, meta };
  }
}
