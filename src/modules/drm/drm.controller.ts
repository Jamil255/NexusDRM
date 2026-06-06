import { Controller, Post, Get, Param, UseGuards, Query, Req, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { DrmService } from './drm.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard } from '@common/guards/rbac.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('DRM')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('drm')
export class DrmController {
  constructor(private readonly drmService: DrmService) {}

  @Post('encrypt/:contentId')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Encrypt content file at rest' })
  async encrypt(@Param('contentId') contentId: string, @Body('s3Key') s3Key: string) {
    const encryptedKey = await this.drmService.encryptContent(contentId, s3Key);
    return { success: true, encryptedKey };
  }

  @Get('signed-url/:contentId')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Generate a signed path for secure streaming' })
  async getSignedUrl(
    @Param('contentId') contentId: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.drmService.generateAccessSession(contentId, user.id, user.email, ip);
  }

  @Post('rotate-key/:contentId')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Rotate encryption key for content' })
  async rotateKey(@Param('contentId') contentId: string) {
    await this.drmService.rotateContentKey(contentId);
    return { success: true, message: 'Encryption key rotated successfully' };
  }
}
