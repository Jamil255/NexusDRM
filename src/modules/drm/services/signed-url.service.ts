import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { generateSignedUrl, verifySignedUrl } from '@common/utils/signed-url.util';
import { ContentRepository } from '@modules/content/content.repository';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';

@Injectable()
export class SignedUrlService {
  private signingSecret: string;
  private cdnBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly contentRepository: ContentRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    this.signingSecret = this.configService.get<string>('JWT_ACCESS_SECRET', 'secret');
    this.cdnBaseUrl = this.configService.get<string>('CDN_BASE_URL', 'https://cdn.example.com');
  }

  async generateAccessUrl(
    contentId: string,
    userId: string,
    ipAddress?: string,
    ttlSeconds?: number,
  ): Promise<string> {
    const ttl = ttlSeconds || this.configService.get<number>('SIGNED_URL_DEFAULT_TTL', 900);

    try {
      const content = await this.contentRepository.base.findOne({ where: { id: contentId } });
      if (content) {
        let resourceType: 'image' | 'video' | 'raw' = 'raw';
        if (content.contentType === 'video' || content.contentType === 'audio') {
          resourceType = 'video';
        } else if (content.contentType === 'image' || content.contentType === 'document' || content.contentType === 'ebook') {
          resourceType = 'image';
        }
        return this.cloudinaryService.generateSignedUrl(content.s3Key, resourceType, ttl);
      }
    } catch (error) {
      // Fallback to local signed manifest path on error
    }

    const path = `/stream/video/${contentId}/manifest`;

    // Generate signed path
    const signedPath = generateSignedUrl({
      resourcePath: path,
      userId,
      ipAddress,
      expiresInSeconds: ttl,
      secret: this.signingSecret,
    });

    return `${this.cdnBaseUrl}${signedPath}`;
  }

  async verifyAccessUrl(url: string): Promise<{ valid: boolean; expired: boolean; params: any }> {
    return verifySignedUrl(url, this.signingSecret);
  }

  async generateCloudinarySignedUrl(publicId: string, ttlSeconds?: number): Promise<string> {
    const ttl = ttlSeconds || this.configService.get<number>('SIGNED_URL_DEFAULT_TTL', 900);

    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    const lowercaseKey = publicId.toLowerCase();
    if (lowercaseKey.endsWith('.mp4') || lowercaseKey.endsWith('.mp3') || lowercaseKey.endsWith('.m3u8')) {
      resourceType = 'video';
    } else if (
      lowercaseKey.endsWith('.jpg') ||
      lowercaseKey.endsWith('.jpeg') ||
      lowercaseKey.endsWith('.png') ||
      lowercaseKey.endsWith('.pdf') ||
      lowercaseKey.startsWith('docs/')
    ) {
      resourceType = 'image';
    }
    return this.cloudinaryService.generateSignedUrl(publicId, resourceType, ttl);
  }
}
