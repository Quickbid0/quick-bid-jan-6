import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auction } from '../auctions/auction.entity';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export interface FileUploadConfig {
  maxFileSize: number; // bytes
  allowedTypes: string[];
  uploadPath: string;
  imageSizes: {
    thumbnail: { width: number; height: number };
    medium: { width: number; height: number };
    large: { width: number; height: number };
  };
  documentTypes: string[];
  maxFilesPerUpload: number;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: 'auction_image' | 'user_document' | 'profile_image' | 'other';
  entityId?: string; // auction ID, user ID, etc.
}

export interface UploadResult {
  success: boolean;
  files: UploadedFile[];
  errors: string[];
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  private config: FileUploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    uploadPath: path.join(process.cwd(), 'uploads'),
    imageSizes: {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 500, height: 500 },
      large: { width: 1200, height: 1200 },
    },
    documentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFilesPerUpload: 10,
  };

  constructor(
    private prismaService: PrismaService,
  ) {
    this.initializeUploadDirectories();
  }

  private initializeUploadDirectories(): void {
    const dirs = [
      this.config.uploadPath,
      path.join(this.config.uploadPath, 'images'),
      path.join(this.config.uploadPath, 'documents'),
      path.join(this.config.uploadPath, 'temp'),
      path.join(this.config.uploadPath, 'thumbnails'),
      path.join(this.config.uploadPath, 'medium'),
      path.join(this.config.uploadPath, 'large'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    this.logger.log(`Upload directories initialized at ${this.config.uploadPath}`);
  }

  async uploadFiles(
    files: Express.Multer.File[],
    uploadedBy: string,
    category: UploadedFile['category'],
    entityId?: string,
    options?: {
      generateThumbnails?: boolean;
      resizeImages?: boolean;
    }
  ): Promise<UploadResult> {
    const result: UploadResult = {
      success: true,
      files: [],
      errors: [],
    };

    if (files.length > this.config.maxFilesPerUpload) {
      result.success = false;
      result.errors.push(`Maximum ${this.config.maxFilesPerUpload} files allowed per upload`);
      return result;
    }

    for (const file of files) {
      try {
        const uploadResult = await this.processFile(file, uploadedBy, category, entityId, options);
        result.files.push(uploadResult);
      } catch (error) {
        result.errors.push(`Failed to upload ${file.originalname}: ${error.message}`);
        result.success = false;
      }
    }

    return result;
  }

  private async processFile(
    file: Express.Multer.File,
    uploadedBy: string,
    category: UploadedFile['category'],
    entityId?: string,
    options?: { generateThumbnails?: boolean; resizeImages?: boolean }
  ): Promise<UploadedFile> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${fileId}${extension}`;

    // Determine upload path based on category
    let uploadPath: string;
    let urlBase: string;

    switch (category) {
      case 'auction_image':
        uploadPath = path.join(this.config.uploadPath, 'images');
        urlBase = '/uploads/images/';
        break;
      case 'user_document':
        uploadPath = path.join(this.config.uploadPath, 'documents');
        urlBase = '/uploads/documents/';
        break;
      case 'profile_image':
        uploadPath = path.join(this.config.uploadPath, 'images');
        urlBase = '/uploads/images/';
        break;
      default:
        uploadPath = path.join(this.config.uploadPath, 'other');
        urlBase = '/uploads/other/';
    }

    const fullPath = path.join(uploadPath, filename);

    // Process image files
    if (this.isImageFile(file.mimetype) && options?.generateThumbnails !== false) {
      return await this.processImageFile(file, filename, uploadPath, urlBase, uploadedBy, category, entityId);
    }

    // Process other files
    await fs.promises.writeFile(fullPath, file.buffer);

    const uploadedFile: UploadedFile = {
      id: fileId,
      originalName: file.originalname,
      filename,
      mimetype: file.mimetype,
      size: file.size,
      path: fullPath,
      url: `${urlBase}${filename}`,
      uploadedBy,
      uploadedAt: new Date(),
      category,
      entityId,
    };

    // Save to database (mock implementation)
    await this.saveFileMetadata(uploadedFile);

    return uploadedFile;
  }

  private async processImageFile(
    file: Express.Multer.File,
    filename: string,
    uploadPath: string,
    urlBase: string,
    uploadedBy: string,
    category: UploadedFile['category'],
    entityId?: string
  ): Promise<UploadedFile> {
    const fileId = filename.replace(path.extname(filename), '');

    // Process original image
    const originalPath = path.join(uploadPath, filename);
    await sharp(file.buffer).jpeg({ quality: 90 }).toFile(originalPath);

    // Generate thumbnail
    const thumbnailFilename = `${fileId}_thumb.jpg`;
    const thumbnailPath = path.join(this.config.uploadPath, 'thumbnails', thumbnailFilename);
    await sharp(file.buffer)
      .resize(this.config.imageSizes.thumbnail.width, this.config.imageSizes.thumbnail.height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Generate medium size
    const mediumFilename = `${fileId}_medium.jpg`;
    const mediumPath = path.join(this.config.uploadPath, 'medium', mediumFilename);
    await sharp(file.buffer)
      .resize(this.config.imageSizes.medium.width, this.config.imageSizes.medium.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(mediumPath);

    // Generate large size
    const largeFilename = `${fileId}_large.jpg`;
    const largePath = path.join(this.config.uploadPath, 'large', largeFilename);
    await sharp(file.buffer)
      .resize(this.config.imageSizes.large.width, this.config.imageSizes.large.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toFile(largePath);

    const uploadedFile: UploadedFile = {
      id: fileId,
      originalName: file.originalname,
      filename,
      mimetype: 'image/jpeg', // Converted to JPEG
      size: file.size,
      path: originalPath,
      url: `${urlBase}${filename}`,
      thumbnailUrl: `/uploads/thumbnails/${thumbnailFilename}`,
      mediumUrl: `/uploads/medium/${mediumFilename}`,
      largeUrl: `/uploads/large/${largeFilename}`,
      uploadedBy,
      uploadedAt: new Date(),
      category,
      entityId,
    };

    await this.saveFileMetadata(uploadedFile);

    return uploadedFile;
  }

  private validateFile(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${this.config.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check file type
    const allowedTypes = [...this.config.allowedTypes, ...this.config.documentTypes];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Additional security checks
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      throw new BadRequestException('Invalid filename');
    }
  }

  private isImageFile(mimetype: string): boolean {
    return this.config.allowedTypes.includes(mimetype);
  }

  async deleteFile(fileId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Get file metadata
      const fileMetadata = await this.getFileMetadata(fileId);
      if (!fileMetadata) {
        throw new BadRequestException('File not found');
      }

      // Check permissions (user can only delete their own files, or admin can delete any)
      if (fileMetadata.uploadedBy !== userId) {
        // Check if user is admin
        const user = await this.prismaService.user.findUnique({
          where: { id: userId },
          select: { role: true },
        });

        if (user?.role !== 'ADMIN') {
          throw new BadRequestException('You can only delete your own files');
        }
      }

      // Delete physical files
      const filesToDelete = [
        fileMetadata.path,
        fileMetadata.thumbnailUrl ? path.join(this.config.uploadPath, 'thumbnails', path.basename(fileMetadata.thumbnailUrl)) : null,
        fileMetadata.mediumUrl ? path.join(this.config.uploadPath, 'medium', path.basename(fileMetadata.mediumUrl)) : null,
        fileMetadata.largeUrl ? path.join(this.config.uploadPath, 'large', path.basename(fileMetadata.largeUrl)) : null,
      ].filter(Boolean);

      for (const filePath of filesToDelete) {
        try {
          await fs.promises.unlink(filePath);
        } catch (error) {
          this.logger.warn(`Failed to delete file ${filePath}: ${error.message}`);
        }
      }

      // Delete from database
      await this.deleteFileMetadata(fileId);

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async getFilesByEntity(entityId: string, category?: UploadedFile['category']): Promise<UploadedFile[]> {
    // Mock implementation - in real app, query files table
    const mockFiles: UploadedFile[] = [
      {
        id: 'file_001',
        originalName: 'product_image.jpg',
        filename: 'file_001.jpg',
        mimetype: 'image/jpeg',
        size: 2048576,
        path: '/uploads/images/file_001.jpg',
        url: '/uploads/images/file_001.jpg',
        thumbnailUrl: '/uploads/thumbnails/file_001_thumb.jpg',
        mediumUrl: '/uploads/medium/file_001_medium.jpg',
        largeUrl: '/uploads/large/file_001_large.jpg',
        uploadedBy: 'user_123',
        uploadedAt: new Date(),
        category: 'auction_image',
        entityId,
      },
    ];

    return category ? mockFiles.filter(f => f.category === category) : mockFiles;
  }

  async getUserFiles(userId: string, category?: UploadedFile['category']): Promise<UploadedFile[]> {
    // Mock implementation
    const mockFiles: UploadedFile[] = [
      {
        id: 'file_002',
        originalName: 'profile_picture.jpg',
        filename: 'file_002.jpg',
        mimetype: 'image/jpeg',
        size: 1048576,
        path: '/uploads/images/file_002.jpg',
        url: '/uploads/images/file_002.jpg',
        uploadedBy: userId,
        uploadedAt: new Date(),
        category: 'profile_image',
      },
    ];

    return category ? mockFiles.filter(f => f.category === category) : mockFiles;
  }

  async optimizeImage(filePath: string, options: {
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    maxWidth?: number;
    maxHeight?: number;
  } = {}): Promise<string> {
    const { quality = 80, format = 'jpeg', maxWidth, maxHeight } = options;

    const optimizedPath = filePath.replace(path.extname(filePath), `_optimized.${format}`);

    let sharpInstance = sharp(filePath);

    if (maxWidth || maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    switch (format) {
      case 'jpeg':
        await sharpInstance.jpeg({ quality }).toFile(optimizedPath);
        break;
      case 'png':
        await sharpInstance.png({ quality: Math.round(quality / 10) }).toFile(optimizedPath);
        break;
      case 'webp':
        await sharpInstance.webp({ quality }).toFile(optimizedPath);
        break;
    }

    return optimizedPath;
  }

  async getFileStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: { type: string; count: number; size: number }[];
    storageUsed: number;
    storageLimit: number;
  }> {
    // Mock implementation
    return {
      totalFiles: 1250,
      totalSize: 2147483648, // 2GB
      filesByType: [
        { type: 'image', count: 1100, size: 1879048192 },
        { type: 'document', count: 150, size: 268435456 },
      ],
      storageUsed: 2147483648,
      storageLimit: 10737418240, // 10GB
    };
  }

  async cleanupOrphanedFiles(): Promise<{ deletedFiles: number; freedSpace: number }> {
    // Mock implementation - in real app, find files not referenced in database
    return {
      deletedFiles: 15,
      freedSpace: 52428800, // 50MB
    };
  }

  // Private helper methods
  private async saveFileMetadata(file: UploadedFile): Promise<void> {
    // Mock implementation - in real app, save to files table
    console.log('Saving file metadata:', file.id);
  }

  private async getFileMetadata(fileId: string): Promise<UploadedFile | null> {
    // Mock implementation
    return {
      id: fileId,
      originalName: 'mock_file.jpg',
      filename: 'mock_file.jpg',
      mimetype: 'image/jpeg',
      size: 1048576,
      path: '/uploads/images/mock_file.jpg',
      url: '/uploads/images/mock_file.jpg',
      uploadedBy: 'user_123',
      uploadedAt: new Date(),
      category: 'auction_image',
    };
  }

  private async deleteFileMetadata(fileId: string): Promise<void> {
    // Mock implementation
    console.log('Deleting file metadata:', fileId);
  }
}
