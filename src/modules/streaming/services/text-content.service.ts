import { Injectable } from '@nestjs/common';
import { WatermarkService } from '../../drm/services/watermark.service';

@Injectable()
export class TextContentService {
  constructor(private readonly watermarkService: WatermarkService) {}

  async getProtectedText(
    contentId: string,
    rawText: string,
    userId: string,
    email: string,
  ) {
    const watermarkText = this.watermarkService.getDocumentWatermarkText(userId, email);

    // Apply zero-width space/character watermarking to the text for fingerprinting
    const fingerprintText = this.applyZeroWidthFingerprint(rawText, userId);

    return {
      contentId,
      text: fingerprintText,
      watermarkText,
      protectionSettings: {
        disableContextMenu: true,
        disableSelection: true,
        disableCopy: true,
        injectHiddenCopyright: true,
        hiddenCopyrightText: `\n\n[Protected Content - Licensed to ${email}]`,
      },
    };
  }

  private applyZeroWidthFingerprint(text: string, userId: string): string {
    // Standard zero-width characters for binary encoding:
    // 0 -> Zero-width space (\u200B)
    // 1 -> Zero-width non-joiner (\u200C)
    const binaryUserId = userId
      .split('')
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');

    const zeroWidthFingerprint = binaryUserId
      .split('')
      .map((bit) => (bit === '0' ? '\u200B' : '\u200C'))
      .join('');

    // Inject the fingerprint after the first word
    const firstSpaceIndex = text.indexOf(' ');
    if (firstSpaceIndex === -1) {
      return text + zeroWidthFingerprint;
    }
    return (
      text.substring(0, firstSpaceIndex) +
      zeroWidthFingerprint +
      text.substring(firstSpaceIndex)
    );
  }
}
