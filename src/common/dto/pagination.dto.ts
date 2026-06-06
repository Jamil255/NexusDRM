import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants/app.constant';

/**
 * Allowed sort directions.
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Query DTO for paginated list endpoints.
 *
 * Apply as a query parameter object; class-validator handles
 * defaults and constraints.
 *
 * @example
 *   @Query() pagination: PaginationQueryDto
 */
export class PaginationQueryDto {
  /** Page number (1-based). Defaults to 1. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  /** Number of items per page. Defaults to {@link DEFAULT_PAGE_SIZE}. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit: number = DEFAULT_PAGE_SIZE;

  /** Column name to sort by. */
  @IsOptional()
  @IsString()
  sortBy?: string;

  /** Sort direction (ASC or DESC). Defaults to DESC. */
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;
}

/**
 * Metadata describing the current pagination state.
 */
export class PaginationMeta {
  /** Current page number. */
  page: number;

  /** Number of items per page. */
  limit: number;

  /** Total number of items across all pages. */
  total: number;

  /** Total number of pages. */
  totalPages: number;

  /** Whether there is a next page. */
  hasNextPage: boolean;

  /** Whether there is a previous page. */
  hasPreviousPage: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

/**
 * Generic paginated response wrapper.
 *
 * @typeParam T - The type of each item in the `data` array.
 */
export class PaginatedResponseDto<T> {
  /** Array of items for the current page. */
  data: T[];

  /** Pagination metadata. */
  meta: PaginationMeta;

  constructor(data: T[], meta: PaginationMeta) {
    this.data = data;
    this.meta = meta;
  }
}
