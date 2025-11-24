import { Injectable, PipeTransform } from '@nestjs/common';
import { getPaginationParams } from '../../../utils/pagination';

/**
 * Parse raw query object from Nest @Query() into normalized PaginationParams
 */
@Injectable()
export class ParsePaginationPipe implements PipeTransform {
  transform(value: Record<string, any>) {
    const params = new URLSearchParams();
    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        params.set(k, Array.isArray(v) ? String(v[0]) : String(v));
      });
    }
    return getPaginationParams(params);
  }
}
