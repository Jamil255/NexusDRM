import { Injectable } from '@nestjs/common';
import { SignedUrlService } from '../../drm/services/signed-url.service';
import { WatermarkService } from '../../drm/services/watermark.service';

@Injectable()
export class DocumentViewerService {
  constructor(
    private readonly signedUrlService: SignedUrlService,
    private readonly watermarkService: WatermarkService,
  ) {}

  async getDocumentViewerConfig(contentId: string, userId: string, email: string, ipAddress?: string) {
    const documentUrl = await this.signedUrlService.generateAccessUrl(contentId, userId, ipAddress, 1800);
    const watermarkText = this.watermarkService.getDocumentWatermarkText(userId, email);

    return {
      documentUrl,
      watermarkText,
      viewerOptions: {
        allowPrint: false,
        allowDownload: false,
        allowCopy: false,
        enableWatermarkOverlay: true,
        pageRenderingMode: 'canvas', // page-by-page rendering mode
      },
    };
  }
}
