import { SelectQueryBuilder } from 'typeorm';
import { PaginationQueryDto, PaginatedResponseDto } from '../dto/pagination.dto';

export async function paginate<T>(
  queryBuilder: SelectQueryBuilder<T>,
  paginationQuery: PaginationQueryDto,
): Promise<PaginatedResponseDto<T>> {
  const page = paginationQuery.page || 1;
  const limit = paginationQuery.limit || 20;
  const skip = (page - 1) * limit;

  if (paginationQuery.sortBy) {
    const order = paginationQuery.sortOrder || 'DESC';
    queryBuilder.orderBy(`${queryBuilder.alias}.${paginationQuery.sortBy}`, order);
  }

  const [data, total] = await queryBuilder
    .skip(skip)
    .take(limit)
    .getManyAndCount();

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponseDto<T> {
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
