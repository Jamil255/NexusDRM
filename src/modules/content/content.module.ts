import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { ContentVersion } from './entities/content-version.entity';
import { ContentMetadata } from './entities/content-metadata.entity';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { ContentRepository } from './content.repository';
import { ContentUploadProcessor } from './processors/content-upload.processor';
import { VideoTranscodeProcessor } from './processors/video-transcode.processor';
import { ThumbnailGeneratorProcessor } from './processors/thumbnail-generator.processor';

@Module({
  imports: [TypeOrmModule.forFeature([Content, ContentVersion, ContentMetadata])],
  controllers: [ContentController],
  providers: [
    ContentService,
    ContentRepository,
    ContentUploadProcessor,
    VideoTranscodeProcessor,
    ThumbnailGeneratorProcessor,
  ],
  exports: [ContentService, ContentRepository],
})
export class ContentModule {}
