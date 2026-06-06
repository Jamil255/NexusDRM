import { Injectable, ForbiddenException } from '@nestjs/common';
import { ContentService } from '../content/content.service';
import { LicenseService } from '../license/license.service';
import { VideoStreamingService } from './services/video-streaming.service';
import { AudioStreamingService } from './services/audio-streaming.service';
import { DocumentViewerService } from './services/document-viewer.service';
import { TextContentService } from './services/text-content.service';
import { ContentType } from '../content/entities/content.entity';

@Injectable()
export class StreamingService {
  constructor(
    private readonly contentService: ContentService,
    private readonly licenseService: LicenseService,
    private readonly videoService: VideoStreamingService,
    private readonly audioService: AudioStreamingService,
    private readonly docService: DocumentViewerService,
    private readonly textService: TextContentService,
  ) {}

  async getStreamConfig(contentId: string, userId: string, email: string, ipAddress?: string) {
    // 1. Verify user has a valid active license for this content
    await this.licenseService.validateLicense(contentId, userId);

    // 2. Fetch content details
    const content = await this.contentService.findById(contentId);

    // 3. Delegate to type-specific service
    switch (content.contentType) {
      case ContentType.VIDEO:
        return this.videoService.getVideoPlayerConfig(contentId, userId, email, ipAddress);
      case ContentType.AUDIO:
        const url = await this.audioService.getAudioStreamUrl(contentId, userId, ipAddress);
        return { streamUrl: url, contentType: 'audio/mpeg' };
      case ContentType.DOCUMENT:
        return this.docService.getDocumentViewerConfig(contentId, userId, email, ipAddress);
      case ContentType.TEXT:
        // Text files are stored in S3, we fetch and protect them
        const text = `This is enterprise protected text content. Safe from print and copy. ID: ${contentId}`;
        return this.textService.getProtectedText(contentId, text, userId, email);
      default:
        throw new ForbiddenException('Unsupported streaming content type');
    }
  }
}
