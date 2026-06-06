import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { generateSignedUrl, verifySignedUrl } from '@common/utils/signed-url.util';

@Injectable()
export class SignedUrlService {
  private s3Client: S3Client;
  private signingSecret: string;
  private cdnBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.signingSecret = this.configService.get<string>('JWT_ACCESS_SECRET', 'secret');
    this.cdnBaseUrl = this.configService.get<string>('CDN_BASE_URL', 'https://cdn.example.com');
    this.s3Client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT', 'http://localhost:9000'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY', 'minioadmin'),
      },
      region: this.configService.get<string>('S3_REGION', 'us-east-1'),
      forcePathStyle: this.configService.get<boolean>('S3_FORCE_PATH_STYLE', true),
    });
  }

  async generateAccessUrl(
    contentId: string,
    userId: string,
    ipAddress?: string,
    ttlSeconds?: number,
  ): Promise<string> {
    const ttl = ttlSeconds || this.configService.get<number>('SIGNED_URL_DEFAULT_TTL', 900);
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

  async generateS3PresignedUrl(s3Key: string, bucket: string, ttlSeconds?: number): Promise<string> {
    const ttl = ttlSeconds || this.configService.get<number>('SIGNED_URL_DEFAULT_TTL', 900);
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: ttl });
  }
}
