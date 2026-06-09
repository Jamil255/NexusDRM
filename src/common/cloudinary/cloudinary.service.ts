import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly isConfigured: boolean;
  private readonly cloudName: string;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    const secure = this.configService.get<boolean>('CLOUDINARY_SECURE', true);

    this.cloudName = cloudName || 'mock-cloud';
    this.isConfigured = !!(cloudName && apiKey && apiSecret);

    if (this.isConfigured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure,
      });
      this.logger.log('Cloudinary SDK configured successfully');
    } else {
      this.logger.warn('Cloudinary credentials are not fully configured. Using mock mode.');
    }
  }

  /**
   * Upload a buffer to Cloudinary.
   */
  async uploadFile(
    fileBuffer: Buffer,
    folder: string,
    resourceType: 'image' | 'video' | 'raw',
    originalName: string,
  ): Promise<{ publicId: string; secureUrl: string }> {
    if (!this.isConfigured) {
      const mockPublicId = `${folder}/${Date.now()}-${originalName.replace(/\.[^/.]+$/, '')}`;
      const mockUrl = `https://res.cloudinary.com/mock-cloud/${resourceType}/upload/${mockPublicId}`;
      this.logger.log(`[MOCK UPLOAD] File uploaded to: ${mockUrl}`);
      return { publicId: mockPublicId, secureUrl: mockUrl };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          type: 'authenticated',
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Cloudinary upload error', error);
            return reject(error || new Error('Cloudinary upload returned empty result'));
          }
          resolve({
            publicId: result.public_id,
            secureUrl: result.secure_url,
          });
        },
      );

      const readable = new Readable();
      readable.push(fileBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Upload a video with eager transformations for adaptive bitrate streaming (HLS).
   * Cloudinary automatically transcodes to multiple resolutions and generates HLS manifests.
   */
  async uploadVideoWithTranscoding(
    fileBuffer: Buffer,
    folder: string,
    originalName: string,
  ): Promise<{
    publicId: string;
    secureUrl: string;
    hlsUrl: string;
    thumbnailUrl: string;
    duration: number;
  }> {
    if (!this.isConfigured) {
      const mockPublicId = `${folder}/${Date.now()}-${originalName.replace(/\.[^/.]+$/, '')}`;
      const mockBase = `https://res.cloudinary.com/mock-cloud/video/upload`;
      this.logger.log(`[MOCK UPLOAD+TRANSCODE] Video uploaded with eager transformations: ${mockPublicId}`);
      return {
        publicId: mockPublicId,
        secureUrl: `${mockBase}/${mockPublicId}`,
        hlsUrl: `${mockBase}/sp_hd/v1/${mockPublicId}.m3u8`,
        thumbnailUrl: `https://res.cloudinary.com/mock-cloud/video/upload/w_400,h_300,c_fill,so_auto/${mockPublicId}.jpg`,
        duration: 0,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'video',
          type: 'authenticated',
          eager: [
            // HLS adaptive bitrate streaming profile
            { streaming_profile: 'hd', format: 'm3u8' },
            // Thumbnail extraction at best frame
            { width: 400, height: 300, crop: 'fill', format: 'jpg', start_offset: 'auto' },
            // Low-res preview for thumbnails
            { width: 160, height: 120, crop: 'fill', format: 'jpg', start_offset: 'auto' },
          ],
          eager_async: true, // Process transformations asynchronously
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Cloudinary video upload error', error);
            return reject(error || new Error('Cloudinary video upload returned empty result'));
          }

          const publicId = result.public_id;

          // Build HLS streaming URL from Cloudinary's streaming profile
          const hlsUrl = cloudinary.url(publicId, {
            resource_type: 'video',
            type: 'authenticated',
            streaming_profile: 'hd',
            format: 'm3u8',
            sign_url: true,
          });

          // Build thumbnail URL with auto frame selection
          const thumbnailUrl = cloudinary.url(publicId, {
            resource_type: 'video',
            type: 'authenticated',
            transformation: [
              { width: 400, height: 300, crop: 'fill', start_offset: 'auto' },
            ],
            format: 'jpg',
            sign_url: true,
          });

          this.logger.log(`Video transcoded successfully. HLS: ${hlsUrl}`);

          resolve({
            publicId,
            secureUrl: result.secure_url,
            hlsUrl,
            thumbnailUrl,
            duration: result.duration || 0,
          });
        },
      );

      const readable = new Readable();
      readable.push(fileBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Generate a thumbnail URL for any content using Cloudinary URL transformations.
   * Works for video (auto-frame), image (resize), and documents (first page render).
   */
  generateThumbnailUrl(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw',
    width: number = 400,
    height: number = 300,
    page: number = 1,
  ): string {
    if (!this.isConfigured) {
      return `https://res.cloudinary.com/mock-cloud/${resourceType}/upload/w_${width},h_${height},c_fill,pg_${page}/${publicId}.jpg`;
    }

    if (resourceType === 'video') {
      // For video: extract a frame at auto-detected best position
      return cloudinary.url(publicId, {
        resource_type: 'video',
        type: 'authenticated',
        transformation: [
          { width, height, crop: 'fill', start_offset: 'auto', format: 'jpg' },
        ],
        sign_url: true,
      });
    }

    // Check if it is a document (starts with docs/ or was passed as raw/legacy document)
    const isDocument = publicId.toLowerCase().startsWith('docs/') || resourceType === 'raw';

    if (isDocument) {
      // For documents (PDFs): render page X as image
      return cloudinary.url(publicId, {
        resource_type: 'image',
        type: 'authenticated',
        transformation: [{ page, width, height, crop: 'limit' }],
        format: 'jpg',
        sign_url: true,
      });
    }

    if (resourceType === 'image') {
      // For image: simple resize
      return cloudinary.url(publicId, {
        resource_type: 'image',
        type: 'authenticated',
        transformation: [{ width, height, crop: 'fill' }],
        sign_url: true,
      });
    }

    // Fallback
    return cloudinary.url(publicId, {
      resource_type: 'image',
      type: 'authenticated',
      transformation: [{ page, width, height, crop: 'limit' }],
      format: 'jpg',
      sign_url: true,
    });
  }

  /**
   * Get the HLS streaming URL for a video asset.
   */
  getHlsStreamingUrl(publicId: string, ttlSeconds: number = 3600): string {
    if (!this.isConfigured) {
      return `https://res.cloudinary.com/mock-cloud/video/upload/sp_hd/${publicId}.m3u8`;
    }

    return cloudinary.url(publicId, {
      resource_type: 'video',
      type: 'authenticated',
      streaming_profile: 'hd',
      format: 'm3u8',
      sign_url: true,
    });
  }

  /**
   * Generate a signed URL for authenticated assets.
   */
  generateSignedUrl(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw',
    ttlSeconds: number = 900,
  ): string {
    if (!this.isConfigured) {
      return `https://res.cloudinary.com/mock-cloud/${resourceType}/upload/authenticated/${publicId}?sig=mock_signature&expires=${Math.floor(Date.now() / 1000) + ttlSeconds}`;
    }

    // File extensions must be stripped from public_id for private_download_url
    const hasExtension = publicId.includes('.') && publicId.lastIndexOf('.') > publicId.lastIndexOf('/');
    const fileExtension = hasExtension ? publicId.split('.').pop() || '' : '';
    const cleanPublicId = hasExtension ? publicId.slice(0, publicId.lastIndexOf('.')) : publicId;

    return cloudinary.utils.private_download_url(cleanPublicId, fileExtension, {
      resource_type: resourceType,
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
    });
  }
}
