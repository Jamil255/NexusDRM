import { Module } from '@nestjs/common';
import { StreamingService } from './streaming.service';
import { StreamingController } from './streaming.controller';
import { VideoStreamingService } from './services/video-streaming.service';
import { AudioStreamingService } from './services/audio-streaming.service';
import { DocumentViewerService } from './services/document-viewer.service';
import { TextContentService } from './services/text-content.service';
import { DrmModule } from '../drm/drm.module';
import { ContentModule } from '../content/content.module';
import { LicenseModule } from '../license/license.module';

@Module({
  imports: [DrmModule, ContentModule, LicenseModule],
  controllers: [StreamingController],
  providers: [
    StreamingService,
    VideoStreamingService,
    AudioStreamingService,
    DocumentViewerService,
    TextContentService,
  ],
  exports: [
    StreamingService,
    VideoStreamingService,
    AudioStreamingService,
    DocumentViewerService,
    TextContentService,
  ],
})
export class StreamingModule {}
