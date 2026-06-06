import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { StreamingService } from './streaming.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Streaming')
@Controller('stream')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('video/:id')
  @ApiOperation({ summary: 'Get secure video playback configuration with DRM support' })
  async getVideoConfig(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.streamingService.getStreamConfig(id, user.id, user.email, ip);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('audio/:id')
  @ApiOperation({ summary: 'Get secure audio playback configuration' })
  async getAudioConfig(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.streamingService.getStreamConfig(id, user.id, user.email, ip);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('document/:id')
  @ApiOperation({ summary: 'Get secure document viewer configuration' })
  async getDocConfig(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.streamingService.getStreamConfig(id, user.id, user.email, ip);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('text/:id')
  @ApiOperation({ summary: 'Get protected text content' })
  async getTextConfig(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.streamingService.getStreamConfig(id, user.id, user.email, ip);
  }

  @Get('video/:id/manifest')
  @ApiOperation({ summary: 'Access video stream HLS manifest via signed URLs' })
  async getManifest(@Param('id') id: string) {
    // Verified by signed URL guard at routing / filter level
    return { manifest: `#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=1280x720\nsegment/1.ts` };
  }

  @Get('video/:id/segment/:seg')
  @ApiOperation({ summary: 'Access encrypted HLS video segment file' })
  async getSegment(@Param('id') id: string, @Param('seg') seg: string) {
    // In production, would return encrypted Buffer stream of segment file
    return { segment: `Encrypted binary data for segment ${seg}` };
  }
}
