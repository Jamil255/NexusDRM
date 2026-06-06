import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { ContentService } from './content.service';
import { UploadContentDto } from './dto/upload-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard } from '@common/guards/rbac.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ContentStatus, ContentType } from './entities/content.entity';

@ApiTags('Content')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @Permissions('content:write')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload new digital content' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadContentDto,
    @CurrentUser() user: any,
  ) {
    return this.contentService.uploadContent(file, dto, user.id, user.organizationId);
  }

  @Get()
  @Permissions('content:read')
  @ApiOperation({ summary: 'List all organization content' })
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ContentStatus,
    @Query('contentType') contentType?: ContentType,
    @Query('search') search?: string,
  ) {
    return this.contentService.findAll(user.organizationId, page || 1, limit || 20, {
      status,
      contentType,
      search,
    });
  }

  @Get(':id')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Get details of a content item' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contentService.findById(id, user.organizationId);
  }

  @Put(':id')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Update content metadata' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContentDto,
    @CurrentUser() user: any,
  ) {
    return this.contentService.updateMetadata(id, dto, user.organizationId);
  }

  @Delete(':id')
  @Permissions('content:delete')
  @ApiOperation({ summary: 'Soft-delete content' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    await this.contentService.deleteContent(id, user.organizationId);
    return { message: 'Content archived successfully' };
  }

  @Post(':id/publish')
  @Permissions('content:publish')
  @ApiOperation({ summary: 'Publish content' })
  async publish(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contentService.publishContent(id, user.organizationId);
  }

  @Post(':id/archive')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Archive content' })
  async archive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contentService.archiveContent(id, user.organizationId);
  }

  @Get(':id/versions')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Get version history of a content item' })
  async getVersions(@Param('id') id: string, @CurrentUser() user: any) {
    return this.contentService.getVersions(id, user.organizationId);
  }

  @Post(':id/versions')
  @Permissions('content:write')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new version of content' })
  async uploadVersion(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('changeNote') changeNote: string,
    @CurrentUser() user: any,
  ) {
    return this.contentService.createVersion(id, file, changeNote, user.id, user.organizationId);
  }
}
