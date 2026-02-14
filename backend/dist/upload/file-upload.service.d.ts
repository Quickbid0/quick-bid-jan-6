import { PrismaService } from '../prisma/prisma.service';
export interface FileUploadConfig {
    maxFileSize: number;
    allowedTypes: string[];
    uploadPath: string;
    imageSizes: {
        thumbnail: {
            width: number;
            height: number;
        };
        medium: {
            width: number;
            height: number;
        };
        large: {
            width: number;
            height: number;
        };
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
    entityId?: string;
}
export interface UploadResult {
    success: boolean;
    files: UploadedFile[];
    errors: string[];
}
export declare class FileUploadService {
    private prismaService;
    private readonly logger;
    private config;
    constructor(prismaService: PrismaService);
    private initializeUploadDirectories;
    uploadFiles(files: Express.Multer.File[], uploadedBy: string, category: UploadedFile['category'], entityId?: string, options?: {
        generateThumbnails?: boolean;
        resizeImages?: boolean;
    }): Promise<UploadResult>;
    private processFile;
    private processImageFile;
    private validateFile;
    private isImageFile;
    deleteFile(fileId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getFilesByEntity(entityId: string, category?: UploadedFile['category']): Promise<UploadedFile[]>;
    getUserFiles(userId: string, category?: UploadedFile['category']): Promise<UploadedFile[]>;
    optimizeImage(filePath: string, options?: {
        quality?: number;
        format?: 'jpeg' | 'png' | 'webp';
        maxWidth?: number;
        maxHeight?: number;
    }): Promise<string>;
    getFileStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        filesByType: {
            type: string;
            count: number;
            size: number;
        }[];
        storageUsed: number;
        storageLimit: number;
    }>;
    cleanupOrphanedFiles(): Promise<{
        deletedFiles: number;
        freedSpace: number;
    }>;
    private saveFileMetadata;
    private getFileMetadata;
    private deleteFileMetadata;
}
