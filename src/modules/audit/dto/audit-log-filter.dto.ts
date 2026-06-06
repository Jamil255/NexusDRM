import { IsOptional, IsString, IsUUID } from 'class-validator';
import { BaseFilterDto } from '@common/dto/filter.dto';

export class AuditLogFilterDto extends BaseFilterDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
