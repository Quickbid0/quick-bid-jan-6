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
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const fs_1 = require("fs");
let BackupService = BackupService_1 = class BackupService {
    constructor(prismaService, auditService) {
        this.prismaService = prismaService;
        this.auditService = auditService;
        this.logger = new common_1.Logger(BackupService_1.name);
        this.config = {
            enabled: true,
            frequency: 'daily',
            retentionDays: 30,
            includeDatabase: true,
            includeFiles: true,
            includeLogs: true,
            compressionEnabled: true,
            encryptionEnabled: false,
            backupPath: path.join(process.cwd(), 'backups'),
            maxBackupSize: 1024,
        };
        this.activeJobs = new Map();
        this.recoveryJobs = new Map();
        this.initializeBackupSystem();
    }
    initializeBackupSystem() {
        if (!fs.existsSync(this.config.backupPath)) {
            fs.mkdirSync(this.config.backupPath, { recursive: true });
        }
        this.scheduleAutomaticBackups();
        this.cleanupOldBackups();
        this.logger.log(`Backup system initialized. Backups stored at: ${this.config.backupPath}`);
    }
    async createBackup(options) {
        const jobId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = {
            id: jobId,
            type: options?.type || 'full',
            status: 'pending',
            metadata: {
                options: options || {},
                createdBy: 'system',
            },
        };
        this.activeJobs.set(jobId, job);
        this.performBackup(job).catch(error => {
            this.logger.error(`Backup job ${jobId} failed:`, error);
            job.status = 'failed';
            job.errorMessage = error.message;
        });
        await this.auditService.logSystemAction('backup_created', 'backup', jobId, { type: job.type, options });
        return job;
    }
    async restoreBackup(backupId, options) {
        const jobId = `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const job = {
            id: jobId,
            backupId,
            status: 'pending',
            recoveredItems: [],
            metadata: {
                options: options || {},
                createdBy: 'system',
            },
        };
        this.recoveryJobs.set(jobId, job);
        this.performRecovery(job).catch(error => {
            this.logger.error(`Recovery job ${jobId} failed:`, error);
            job.status = 'failed';
            job.errorMessage = error.message;
        });
        await this.auditService.logSystemAction('recovery_started', 'backup', backupId, { recoveryJobId: jobId, options });
        return job;
    }
    async getBackupJobs(limit = 50) {
        const jobs = Array.from(this.activeJobs.values());
        const completedJobs = await this.getCompletedBackupsFromFilesystem();
        return [...jobs, ...completedJobs]
            .sort((a, b) => (b.startedAt || new Date()).getTime() - (a.startedAt || new Date()).getTime())
            .slice(0, limit);
    }
    async getRecoveryJobs(limit = 50) {
        return Array.from(this.recoveryJobs.values())
            .sort((a, b) => (b.startedAt || new Date()).getTime() - (a.startedAt || new Date()).getTime())
            .slice(0, limit);
    }
    async getBackupStats() {
        const backups = await this.getCompletedBackupsFromFilesystem();
        const totalBackups = backups.length;
        const totalSize = backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
        const lastBackup = backups.length > 0
            ? backups.sort((a, b) => (b.completedAt || new Date(0)).getTime() - (a.completedAt || new Date(0)).getTime())[0].completedAt
            : undefined;
        const nextScheduledBackup = this.calculateNextBackupTime();
        const successfulBackups = backups.filter(b => b.status === 'completed').length;
        const backupSuccessRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0;
        const storageUsage = await this.calculateStorageUsage();
        const retentionCompliance = await this.checkRetentionCompliance();
        return {
            totalBackups,
            totalSize,
            lastBackup,
            nextScheduledBackup,
            backupSuccessRate,
            storageUsage,
            retentionCompliance,
        };
    }
    async deleteBackup(backupId) {
        try {
            const backupPath = path.join(this.config.backupPath, `${backupId}.zip`);
            if (fs.existsSync(backupPath)) {
                fs.unlinkSync(backupPath);
                await this.auditService.logSystemAction('backup_deleted', 'backup', backupId);
                return { success: true, message: 'Backup deleted successfully' };
            }
            else {
                return { success: false, message: 'Backup file not found' };
            }
        }
        catch (error) {
            return { success: false, message: `Failed to delete backup: ${error.message}` };
        }
    }
    async validateBackup(backupId) {
        try {
            const backupPath = path.join(this.config.backupPath, `${backupId}.zip`);
            if (!fs.existsSync(backupPath)) {
                return { valid: false, issues: ['Backup file not found'], metadata: {} };
            }
            const stats = fs.statSync(backupPath);
            const issues = [];
            if (stats.size === 0) {
                issues.push('Backup file is empty');
            }
            if (stats.size > this.config.maxBackupSize * 1024 * 1024) {
                issues.push('Backup file exceeds maximum size limit');
            }
            const retentionCutoff = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
            if (stats.mtime < retentionCutoff) {
                issues.push('Backup is older than retention period');
            }
            return {
                valid: issues.length === 0,
                issues,
                metadata: {
                    size: stats.size,
                    createdAt: stats.mtime,
                    modifiedAt: stats.mtime,
                },
            };
        }
        catch (error) {
            return {
                valid: false,
                issues: [`Validation failed: ${error.message}`],
                metadata: {},
            };
        }
    }
    async performBackup(job) {
        job.status = 'running';
        job.startedAt = new Date();
        try {
            const archive = archiver('zip', {
                zlib: { level: 9 },
            });
            const backupFilename = `${job.id}.zip`;
            const backupFilePath = path.join(this.config.backupPath, backupFilename);
            const output = (0, fs_1.createWriteStream)(backupFilePath);
            archive.pipe(output);
            if (this.config.includeDatabase) {
                await this.addDatabaseToBackup(archive, job);
            }
            if (this.config.includeFiles) {
                await this.addFilesToBackup(archive, job);
            }
            if (this.config.includeLogs) {
                await this.addLogsToBackup(archive, job);
            }
            const metadata = {
                jobId: job.id,
                type: job.type,
                createdAt: new Date(),
                version: '1.0',
                includes: {
                    database: this.config.includeDatabase,
                    files: this.config.includeFiles,
                    logs: this.config.includeLogs,
                },
            };
            archive.append(JSON.stringify(metadata, null, 2), { name: 'backup-metadata.json' });
            await archive.finalize();
            await new Promise((resolve, reject) => {
                output.on('close', () => resolve(undefined));
                output.on('error', reject);
            });
            job.status = 'completed';
            job.completedAt = new Date();
            job.filePath = backupFilePath;
            const stats = fs.statSync(backupFilePath);
            job.size = stats.size;
            this.logger.log(`Backup ${job.id} completed successfully. Size: ${stats.size} bytes`);
            await this.auditService.logSystemAction('backup_completed', 'backup', job.id, { size: stats.size, filePath: backupFilePath });
        }
        catch (error) {
            job.status = 'failed';
            job.errorMessage = error.message;
            throw error;
        }
    }
    async performRecovery(job) {
        job.status = 'running';
        job.startedAt = new Date();
        try {
            const backupPath = path.join(this.config.backupPath, `${job.backupId}.zip`);
            if (!fs.existsSync(backupPath)) {
                throw new Error('Backup file not found');
            }
            if (job.metadata.options?.includeDatabase !== false) {
                await this.restoreDatabaseFromBackup(backupPath, job);
            }
            if (job.metadata.options?.includeFiles !== false) {
                await this.restoreFilesFromBackup(backupPath, job);
            }
            job.status = 'completed';
            job.completedAt = new Date();
            await this.auditService.logSystemAction('recovery_completed', 'backup', job.backupId, { recoveryJobId: job.id, recoveredItems: job.recoveredItems });
        }
        catch (error) {
            job.status = 'failed';
            job.errorMessage = error.message;
            throw error;
        }
    }
    async addDatabaseToBackup(archive, job) {
        const dbDump = await this.createDatabaseDump();
        archive.append(dbDump, { name: 'database.sql' });
    }
    async addFilesToBackup(archive, job) {
        const uploadDirs = ['uploads/images', 'uploads/documents', 'uploads/temp'];
        for (const dir of uploadDirs) {
            const fullPath = path.join(process.cwd(), dir);
            if (fs.existsSync(fullPath)) {
                archive.directory(fullPath, dir);
            }
        }
    }
    async addLogsToBackup(archive, job) {
        const logFiles = ['logs/audit.log', 'logs/error.log', 'logs/combined.log'];
        for (const logFile of logFiles) {
            const fullPath = path.join(process.cwd(), logFile);
            if (fs.existsSync(fullPath)) {
                archive.file(fullPath, { name: logFile });
            }
        }
    }
    async createDatabaseDump() {
        return `-- Database dump for QuickMela
-- Generated on ${new Date().toISOString()}
-- This is a mock dump for demonstration purposes

-- Mock data export would go here
`;
    }
    async restoreDatabaseFromBackup(backupPath, job) {
        job.recoveredItems.push('database');
        this.logger.log('Database restoration completed (mock)');
    }
    async restoreFilesFromBackup(backupPath, job) {
        job.recoveredItems.push('uploaded_files');
        this.logger.log('File restoration completed (mock)');
    }
    async getCompletedBackupsFromFilesystem() {
        const backupFiles = fs.readdirSync(this.config.backupPath)
            .filter(file => file.endsWith('.zip'))
            .map(filename => {
            const filePath = path.join(this.config.backupPath, filename);
            const stats = fs.statSync(filePath);
            return {
                id: filename.replace('.zip', ''),
                type: 'full',
                status: 'completed',
                completedAt: stats.mtime,
                size: stats.size,
                filePath,
                metadata: {},
            };
        });
        return backupFiles;
    }
    calculateNextBackupTime() {
        const now = new Date();
        const nextBackup = new Date(now);
        switch (this.config.frequency) {
            case 'daily':
                nextBackup.setDate(now.getDate() + 1);
                nextBackup.setHours(2, 0, 0, 0);
                break;
            case 'weekly':
                nextBackup.setDate(now.getDate() + (7 - now.getDay()));
                nextBackup.setHours(2, 0, 0, 0);
                break;
            case 'monthly':
                nextBackup.setMonth(now.getMonth() + 1, 1);
                nextBackup.setHours(2, 0, 0, 0);
                break;
        }
        return nextBackup;
    }
    async calculateStorageUsage() {
        const backupFiles = await this.getCompletedBackupsFromFilesystem();
        return backupFiles.reduce((sum, backup) => sum + (backup.size || 0), 0);
    }
    async checkRetentionCompliance() {
        const backups = await this.getCompletedBackupsFromFilesystem();
        const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
        return backups.every(backup => !backup.completedAt || backup.completedAt >= cutoffDate);
    }
    scheduleAutomaticBackups() {
        const intervalMs = this.config.frequency === 'daily' ? 24 * 60 * 60 * 1000 :
            this.config.frequency === 'weekly' ? 7 * 24 * 60 * 60 * 1000 :
                30 * 24 * 60 * 60 * 1000;
        setInterval(async () => {
            try {
                await this.createBackup({ type: 'full' });
                this.logger.log('Automatic backup completed');
            }
            catch (error) {
                this.logger.error('Automatic backup failed:', error);
            }
        }, intervalMs);
    }
    async cleanupOldBackups() {
        const backups = await this.getCompletedBackupsFromFilesystem();
        const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
        let deletedCount = 0;
        for (const backup of backups) {
            if (backup.completedAt && backup.completedAt < cutoffDate) {
                try {
                    await this.deleteBackup(backup.id);
                    deletedCount++;
                }
                catch (error) {
                    this.logger.error(`Failed to delete old backup ${backup.id}:`, error);
                }
            }
        }
        if (deletedCount > 0) {
            this.logger.log(`Cleaned up ${deletedCount} old backups`);
        }
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.logger.log('Backup configuration updated');
    }
    getConfig() {
        return { ...this.config };
    }
    async createEmergencyBackup() {
        this.logger.warn('Creating emergency backup due to system alert');
        return await this.createBackup({
            type: 'full',
            includeDatabase: true,
            includeFiles: true,
            includeLogs: true,
        });
    }
    async getSystemHealthForBackup() {
        const issues = [];
        const recommendations = [];
        const stats = await this.calculateStorageUsage();
        const availableSpace = 10 * 1024 * 1024 * 1024;
        if (stats > availableSpace * 0.9) {
            issues.push('Low disk space for backups');
            recommendations.push('Free up disk space or increase storage capacity');
        }
        try {
            await this.prismaService.user.count({ take: 1 });
        }
        catch (error) {
            issues.push('Database connectivity issues');
            recommendations.push('Check database connection and restore connectivity');
        }
        return {
            canBackup: issues.length === 0,
            issues,
            recommendations,
        };
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], BackupService);
//# sourceMappingURL=backup.service.js.map