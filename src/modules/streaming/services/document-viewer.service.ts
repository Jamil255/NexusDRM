import { Injectable } from '@nestjs/common';
import { SignedUrlService } from '../../drm/services/signed-url.service';
import { WatermarkService } from '../../drm/services/watermark.service';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';

@Injectable()
export class DocumentViewerService {
  constructor(
    private readonly signedUrlService: SignedUrlService,
    private readonly watermarkService: WatermarkService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getDocumentViewerConfig(
    contentId: string,
    s3Key: string,
    userId: string,
    email: string,
    ipAddress?: string,
  ) {
    const documentUrl = await this.signedUrlService.generateAccessUrl(contentId, userId, ipAddress, 1800);
    const watermarkText = this.watermarkService.getDocumentWatermarkText(userId, email);

    const resourceType = s3Key.startsWith('docs/') ? 'image' : 'raw';
    // Generate authenticated signed page URLs for pages 1 to 10
    const pages: string[] = [];
    for (let page = 1; page <= 10; page++) {
      pages.push(
        this.cloudinaryService.generateThumbnailUrl(s3Key, resourceType, 800, 1100, page)
      );
    }

    return {
      documentUrl,
      watermarkText,
      pages,
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
