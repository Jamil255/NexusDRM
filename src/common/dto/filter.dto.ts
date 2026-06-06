import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Base filter DTO providing common filtering fields.
 *
 * Extend this class in domain-specific filter DTOs to inherit
 * search, date range, and status filtering capabilities.
 *
 * @example
 *   export class ContentFilterDto extends BaseFilterDto {
 *     @IsOptional()
 *     @IsEnum(ContentType)
 *     contentType?: ContentType;
 *   }
 */
export class BaseFilterDto {
  /**
   * Free-text search term applied across relevant fields.
   * The implementing service decides which columns to search.
   */
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Inclusive start date for filtering by creation / event date.
   * Expected as an ISO-8601 date string and transformed to a Date object.
   */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  /**
   * Inclusive end date for filtering by creation / event date.
   * Expected as an ISO-8601 date string and transformed to a Date object.
   */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;

  /**
   * Generic status filter value.
   * Concrete subclasses may override this with a specific enum validator.
   */
  @IsOptional()
  @IsString()
  status?: string;
}
