import { Injectable } from '@nestjs/common';
import { SignedUrlService } from '../../drm/services/signed-url.service';

@Injectable()
export class AudioStreamingService {
  constructor(private readonly signedUrlService: SignedUrlService) {}

  async getAudioStreamUrl(contentId: string, userId: string, ipAddress?: string): Promise<string> {
    return this.signedUrlService.generateAccessUrl(contentId, userId, ipAddress, 3600);
  }
}
