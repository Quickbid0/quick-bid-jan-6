"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FileUploadService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const uuid_1 = require("uuid");
let FileUploadService = FileUploadService_1 = class FileUploadService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(FileUploadService_1.name);
        this.config = {
            maxFileSize: 10 * 1024 * 1024,
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
        this.initializeUploadDirectories();
    }
    initializeUploadDirectories() {
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
    async uploadFiles(files, uploadedBy, category, entityId, options) {
        const result = {
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
            }
            catch (error) {
                result.errors.push(`Failed to upload ${file.originalname}: ${error.message}`);
                result.success = false;
            }
        }
        return result;
    }
    async processFile(file, uploadedBy, category, entityId, options) {
        this.validateFile(file);
        const fileId = (0, uuid_1.v4)();
        const extension = path.extname(file.originalname);
        const filename = `${fileId}${extension}`;
        let uploadPath;
        let urlBase;
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
        if (this.isImageFile(file.mimetype) && options?.generateThumbnails !== false) {
            return await this.processImageFile(file, filename, uploadPath, urlBase, uploadedBy, category, entityId);
        }
        await fs.promises.writeFile(fullPath, file.buffer);
        const uploadedFile = {
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
        await this.saveFileMetadata(uploadedFile);
        return uploadedFile;
    }
    async processImageFile(file, filename, uploadPath, urlBase, uploadedBy, category, entityId) {
        const fileId = filename.replace(path.extname(filename), '');
        const originalPath = path.join(uploadPath, filename);
        await sharp(file.buffer).jpeg({ quality: 90 }).toFile(originalPath);
        const thumbnailFilename = `${fileId}_thumb.jpg`;
        const thumbnailPath = path.join(this.config.uploadPath, 'thumbnails', thumbnailFilename);
        await sharp(file.buffer)
            .resize(this.config.imageSizes.thumbnail.width, this.config.imageSizes.thumbnail.height, {
            fit: 'cover',
            position: 'center',
        })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
        const mediumFilename = `${fileId}_medium.jpg`;
        const mediumPath = path.join(this.config.uploadPath, 'medium', mediumFilename);
        await sharp(file.buffer)
            .resize(this.config.imageSizes.medium.width, this.config.imageSizes.medium.height, {
            fit: 'inside',
            withoutEnlargement: true,
        })
            .jpeg({ quality: 85 })
            .toFile(mediumPath);
        const largeFilename = `${fileId}_large.jpg`;
        const largePath = path.join(this.config.uploadPath, 'large', largeFilename);
        await sharp(file.buffer)
            .resize(this.config.imageSizes.large.width, this.config.imageSizes.large.height, {
            fit: 'inside',
            withoutEnlargement: true,
        })
            .jpeg({ quality: 90 })
            .toFile(largePath);
        const uploadedFile = {
            id: fileId,
            originalName: file.originalname,
            filename,
            mimetype: 'image/jpeg',
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
    validateFile(file) {
        if (file.size > this.config.maxFileSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${this.config.maxFileSize / (1024 * 1024)}MB`);
        }
        const allowedTypes = [...this.config.allowedTypes, ...this.config.documentTypes];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        }
        if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
            throw new common_1.BadRequestException('Invalid filename');
        }
    }
    isImageFile(mimetype) {
        return this.config.allowedTypes.includes(mimetype);
    }
    async deleteFile(fileId, userId) {
        try {
            const fileMetadata = await this.getFileMetadata(fileId);
            if (!fileMetadata) {
                throw new common_1.BadRequestException('File not found');
            }
            if (fileMetadata.uploadedBy !== userId) {
                const user = await this.prismaService.user.findUnique({
                    where: { id: userId },
                    select: { role: true },
                });
                if (user?.role !== 'ADMIN') {
                    throw new common_1.BadRequestException('You can only delete your own files');
                }
            }
            const filesToDelete = [
                fileMetadata.path,
                fileMetadata.thumbnailUrl ? path.join(this.config.uploadPath, 'thumbnails', path.basename(fileMetadata.thumbnailUrl)) : null,
                fileMetadata.mediumUrl ? path.join(this.config.uploadPath, 'medium', path.basename(fileMetadata.mediumUrl)) : null,
                fileMetadata.largeUrl ? path.join(this.config.uploadPath, 'large', path.basename(fileMetadata.largeUrl)) : null,
            ].filter(Boolean);
            for (const filePath of filesToDelete) {
                try {
                    await fs.promises.unlink(filePath);
                }
                catch (error) {
                    this.logger.warn(`Failed to delete file ${filePath}: ${error.message}`);
                }
            }
            await this.deleteFileMetadata(fileId);
            return { success: true, message: 'File deleted successfully' };
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async getFilesByEntity(entityId, category) {
        const mockFiles = [
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
    async getUserFiles(userId, category) {
        const mockFiles = [
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
    async optimizeImage(filePath, options = {}) {
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
    async getFileStats() {
        return {
            totalFiles: 1250,
            totalSize: 2147483648,
            filesByType: [
                { type: 'image', count: 1100, size: 1879048192 },
                { type: 'document', count: 150, size: 268435456 },
            ],
            storageUsed: 2147483648,
            storageLimit: 10737418240,
        };
    }
    async cleanupOrphanedFiles() {
        return {
            deletedFiles: 15,
            freedSpace: 52428800,
        };
    }
    async saveFileMetadata(file) {
        console.log('Saving file metadata:', file.id);
    }
    async getFileMetadata(fileId) {
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
    async deleteFileMetadata(fileId) {
        console.log('Deleting file metadata:', fileId);
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = FileUploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map