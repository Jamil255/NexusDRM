import { PartialType } from '@nestjs/swagger';
import { UploadContentDto } from './upload-content.dto';

/**
 * DTO for updating content metadata.
 * All fields are optional — only supplied fields are updated.
 */
export class UpdateContentDto extends PartialType(UploadContentDto) {}
