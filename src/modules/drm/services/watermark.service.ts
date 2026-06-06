import { Injectable } from '@nestjs/common';

@Injectable()
export class WatermarkService {
  generateWatermarkConfig(
    contentId: string,
    userId: string,
    email: string,
  ): { text: string; opacity: number; fontSize: number; position: string } {
    const text = `DRMS - User: ${email} (${userId.substring(0, 8)}) - Timestamp: ${new Date().toISOString()}`;
    return {
      text,
      opacity: 0.15,
      fontSize: 16,
      position: 'bottom-right',
    };
  }

  getVideoWatermarkParams(userId: string, email: string): string {
    const cleanEmail = email.replace(/:/g, '\\:');
    const text = `User\\: ${cleanEmail} (${userId.substring(0, 8)})`;
    // FFmpeg drawtext filter parameters
    return `drawtext=fontfile=/fonts/Inter.ttf:text='${text}':x=w-tw-10:y=h-th-10:fontsize=18:fontcolor=white@0.2:box=1:boxcolor=black@0.1`;
  }

  getDocumentWatermarkText(userId: string, email: string): string {
    return `CONFIDENTIAL | View by ${email} | Session: ${userId.substring(0, 8)}`;
  }
}
