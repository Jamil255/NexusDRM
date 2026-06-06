import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { ContentKey } from '../entities/content-key.entity';
import { generateEncryptionKey, encryptKey, decryptKey } from '@common/utils/crypto.util';

@Injectable()
export class KeyManagementService {
  private masterKey: string;

  constructor(
    @InjectRepository(ContentKey)
    private readonly keyRepo: Repository<ContentKey>,
    private readonly configService: ConfigService,
  ) {
    this.masterKey = this.configService.get<string>(
      'MASTER_ENCRYPTION_KEY',
      'your-256-bit-master-key-change-in-production',
    );
  }

  async generateContentKey(): Promise<Buffer> {
    return generateEncryptionKey();
  }

  async storeKey(contentId: string, key: Buffer): Promise<ContentKey> {
    // Invalidate existing active keys
    await this.keyRepo.update(
      { contentId, isActive: true },
      { isActive: false, rotatedAt: new Date() },
    );

    const latestKey = await this.keyRepo.findOne({
      where: { contentId },
      order: { keyVersion: 'DESC' },
    });

    const nextVersion = latestKey ? latestKey.keyVersion + 1 : 1;
    const encrypted = encryptKey(key, this.masterKey);

    const contentKey = this.keyRepo.create({
      contentId,
      encryptedKey: encrypted,
      iv: encrypted.subarray(0, 16), // IV is stored prefix-style or in a column
      keyVersion: nextVersion,
      isActive: true,
    });

    return this.keyRepo.save(contentKey);
  }

  async retrieveKey(contentId: string): Promise<Buffer> {
    const contentKey = await this.keyRepo.findOne({
      where: { contentId, isActive: true },
    });

    if (!contentKey) {
      throw new NotFoundException(`Active encryption key not found for content ${contentId}`);
    }

    return decryptKey(contentKey.encryptedKey, this.masterKey);
  }

  async rotateKey(contentId: string): Promise<ContentKey> {
    const newKey = await this.generateContentKey();
    return this.storeKey(contentId, newKey);
  }

  async getActiveKeyVersion(contentId: string): Promise<number> {
    const contentKey = await this.keyRepo.findOne({
      where: { contentId, isActive: true },
    });
    return contentKey ? contentKey.keyVersion : 0;
  }
}
