import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentKey } from './entities/content-key.entity';
import { DrmService } from './drm.service';
import { DrmController } from './drm.controller';
import { EncryptionService } from './services/encryption.service';
import { SignedUrlService } from './services/signed-url.service';
import { WatermarkService } from './services/watermark.service';
import { KeyManagementService } from './services/key-management.service';
import { ContentEncryptionProcessor } from './processors/content-encryption.processor';
import { KeyRotationProcessor } from './processors/key-rotation.processor';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContentKey]),
    ContentModule,
  ],
  controllers: [DrmController],
  providers: [
    DrmService,
    EncryptionService,
    SignedUrlService,
    WatermarkService,
    KeyManagementService,
    ContentEncryptionProcessor,
    KeyRotationProcessor,
  ],
  exports: [
    DrmService,
    EncryptionService,
    SignedUrlService,
    WatermarkService,
    KeyManagementService,
  ],
})
export class DrmModule {}
