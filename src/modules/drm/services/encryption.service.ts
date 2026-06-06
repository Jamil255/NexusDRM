import { Injectable, Logger } from '@nestjs/common';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

import { KeyManagementService } from './key-management.service';
import { encryptContent, decryptContent } from '@common/utils/crypto.util';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private s3Client: S3Client;
  private rawBucket: string;
  private encryptedBucket: string;

  constructor(
    private readonly keyManagement: KeyManagementService,
    private readonly configService: ConfigService,
  ) {
    this.rawBucket = this.configService.get<string>('S3_BUCKET_RAW', 'drms-raw-content');
    this.encryptedBucket = this.configService.get<string>('S3_BUCKET_ENCRYPTED', 'drms-encrypted-content');
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

  async encryptContentFile(contentId: string, s3Key: string): Promise<string> {
    try {
      // 1. Generate/Retrieve content key
      let key: Buffer;
      try {
        key = await this.keyManagement.retrieveKey(contentId);
      } catch {
        const generated = await this.keyManagement.generateContentKey();
        const stored = await this.keyManagement.storeKey(contentId, generated);
        key = generated;
      }

      // 2. Fetch raw file from S3
      const getCommand = new GetObjectCommand({
        Bucket: this.rawBucket,
        Key: s3Key,
      });
      const response = await this.s3Client.send(getCommand);
      const fileData = await this.streamToBuffer(response.Body);

      // 3. Encrypt file using AES-256-GCM
      const { encrypted, iv, authTag } = encryptContent(fileData, key);

      // We append iv and authTag to the file for self-contained decryption
      const encryptedPayload = Buffer.concat([iv, authTag, encrypted]);
      const encryptedKey = s3Key.replace('raw/', 'encrypted/');

      // 4. Upload encrypted file
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.encryptedBucket,
          Key: encryptedKey,
          Body: encryptedPayload,
        }),
      );

      this.logger.log(`Content ${contentId} successfully encrypted and uploaded to ${encryptedKey}`);
      return encryptedKey;
    } catch (error) {
      this.logger.error(`Encryption failed for content ${contentId}`, error.stack);
      throw error;
    }
  }

  async decryptContentFile(contentId: string, encryptedKey: string): Promise<Buffer> {
    const key = await this.keyManagement.retrieveKey(contentId);

    const getCommand = new GetObjectCommand({
      Bucket: this.encryptedBucket,
      Key: encryptedKey,
    });
    const response = await this.s3Client.send(getCommand);
    const payload = await this.streamToBuffer(response.Body);

    // IV is 12 bytes for AES-256-GCM
    const iv = payload.subarray(0, 12);
    // Auth tag is 16 bytes
    const authTag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);

    return decryptContent(encrypted, key, iv, authTag);
  }

  private async streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err: Error) => reject(err));
    });
  }
}
