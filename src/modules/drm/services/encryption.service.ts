import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { KeyManagementService } from './key-management.service';
import { encryptContent, decryptContent } from '@common/utils/crypto.util';
import { ContentRepository } from '@modules/content/content.repository';
import { CloudinaryService } from '@common/cloudinary/cloudinary.service';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);

  constructor(
    private readonly keyManagement: KeyManagementService,
    private readonly configService: ConfigService,
    private readonly contentRepository: ContentRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async encryptContentFile(contentId: string, publicId: string): Promise<string> {
    try {
      // 1. Generate/Retrieve content key
      let key: Buffer;
      try {
        key = await this.keyManagement.retrieveKey(contentId);
      } catch {
        const generated = await this.keyManagement.generateContentKey();
        await this.keyManagement.storeKey(contentId, generated);
        key = generated;
      }

      // Fetch content record to determine resource type
      const content = await this.contentRepository.base.findOne({ where: { id: contentId } });

      let resourceType: 'image' | 'video' | 'raw' = 'raw';
      if (content) {
        if (content.contentType === 'video' || content.contentType === 'audio') {
          resourceType = 'video';
        } else if (content.contentType === 'image' || content.contentType === 'document' || content.contentType === 'ebook') {
          resourceType = 'image';
        }
      }

      // 2. Fetch raw file from Cloudinary via signed URL
      const signedUrl = this.cloudinaryService.generateSignedUrl(publicId, resourceType, 300);
      let fileData: Buffer;

      if (signedUrl.includes('res.cloudinary.com/mock-cloud')) {
        fileData = Buffer.from('Mock file content since we are in mock offline mode');
      } else {
        const downloadResponse = await axios.get(signedUrl, { responseType: 'arraybuffer' });
        fileData = Buffer.from(downloadResponse.data);
      }

      // 3. Encrypt file using AES-256-GCM
      const { encrypted, iv, authTag } = encryptContent(fileData, key);

      // We append iv and authTag to the file for self-contained decryption
      const encryptedPayload = Buffer.concat([iv, authTag, encrypted]);

      // 4. Upload encrypted file as raw private resource to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadFile(
        encryptedPayload,
        'encrypted',
        'raw',
        `${contentId}-encrypted.bin`,
      );

      this.logger.log(`Content ${contentId} successfully encrypted and uploaded to Cloudinary: ${uploadResult.publicId}`);
      return uploadResult.publicId;
    } catch (error) {
      this.logger.error(`Encryption failed for content ${contentId}`, error.stack);
      throw error;
    }
  }

  async decryptContentFile(contentId: string, encryptedPublicId: string): Promise<Buffer> {
    const key = await this.keyManagement.retrieveKey(contentId);

    // Generate signed URL for the encrypted payload on Cloudinary
    const signedUrl = this.cloudinaryService.generateSignedUrl(encryptedPublicId, 'raw', 300);

    let payload: Buffer;

    if (signedUrl.includes('res.cloudinary.com/mock-cloud')) {
      return Buffer.from('Mock decrypted file content');
    } else {
      const downloadResponse = await axios.get(signedUrl, { responseType: 'arraybuffer' });
      payload = Buffer.from(downloadResponse.data);
    }

    // IV is 12 bytes for AES-256-GCM
    const iv = payload.subarray(0, 12);
    // Auth tag is 16 bytes
    const authTag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);

    return decryptContent(encrypted, key, iv, authTag);
  }
}
