import { Injectable } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { SignedUrlService } from './services/signed-url.service';
import { WatermarkService } from './services/watermark.service';
import { KeyManagementService } from './services/key-management.service';

@Injectable()
export class DrmService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly signedUrlService: SignedUrlService,
    private readonly watermarkService: WatermarkService,
    private readonly keyManagementService: KeyManagementService,
  ) {}

  async encryptContent(contentId: string, s3Key: string): Promise<string> {
    return this.encryptionService.encryptContentFile(contentId, s3Key);
  }

  async generateAccessSession(
    contentId: string,
    userId: string,
    email: string,
    ipAddress?: string,
    ttlSeconds?: number,
  ) {
    const streamUrl = await this.signedUrlService.generateAccessUrl(contentId, userId, ipAddress, ttlSeconds);
    const watermarkConfig = this.watermarkService.generateWatermarkConfig(contentId, userId, email);
    
    return {
      streamUrl,
      watermarkConfig,
      drmConfig: {
        requireWatermark: true,
        allowDownload: false,
        allowPrint: false,
        allowCopy: false,
      },
    };
  }

  async rotateContentKey(contentId: string): Promise<void> {
    await this.keyManagementService.rotateKey(contentId);
  }
}
