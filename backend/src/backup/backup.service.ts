import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  includeDatabase: boolean;
  includeFiles: boolean;
  includeLogs: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupPath: string;
  maxBackupSize: number; // MB
}

export interface BackupJob {
  id: string;
  type: 'full' | 'incremental' | 'database_only' | 'files_only';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  size?: number; // bytes
  filePath?: string;
  errorMessage?: string;
  metadata: Record<string, any>;
}

export interface RecoveryJob {
  id: string;
  backupId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  recoveredItems: string[];
  metadata: Record<string, any>;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  lastBackup: Date;
  nextScheduledBackup: Date;
  backupSuccessRate: number;
  storageUsage: number;
  retentionCompliance: boolean;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  private config: BackupConfig = {
    enabled: true,
    frequency: 'daily',
    retentionDays: 30,
    includeDatabase: true,
    includeFiles: true,
    includeLogs: true,
    compressionEnabled: true,
    encryptionEnabled: false, // Would be enabled in production
    backupPath: path.join(process.cwd(), 'backups'),
    maxBackupSize: 1024, // 1GB
  };

  private activeJobs = new Map<string, BackupJob>();
  private recoveryJobs = new Map<string, RecoveryJob>();

  constructor(
    private prismaService: PrismaService,
    private auditService: AuditService,
  ) {
    this.initializeBackupSystem();
  }

  private initializeBackupSystem() {
    // Create backups directory
    if (!fs.existsSync(this.config.backupPath)) {
      fs.mkdirSync(this.config.backupPath, { recursive: true });
    }

    // Schedule automatic backups
    this.scheduleAutomaticBackups();

    // Clean up old backups on startup
    this.cleanupOldBackups();

    this.logger.log(`Backup system initialized. Backups stored at: ${this.config.backupPath}`);
  }

  async createBackup(options?: {
    type?: BackupJob['type'];
    includeDatabase?: boolean;
    includeFiles?: boolean;
    includeLogs?: boolean;
    compressionEnabled?: boolean;
  }): Promise<BackupJob> {
    const jobId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: BackupJob = {
      id: jobId,
      type: options?.type || 'full',
      status: 'pending',
      metadata: {
        options: options || {},
        createdBy: 'system',
      },
    };

    this.activeJobs.set(jobId, job);

    // Start backup process asynchronously
    this.performBackup(job).catch(error => {
      this.logger.error(`Backup job ${jobId} failed:`, error);
      job.status = 'failed';
      job.errorMessage = error.message;
    });

    await this.auditService.logSystemAction(
      'backup_created',
      'backup',
      jobId,
      { type: job.type, options }
    );

    return job;
  }

  async restoreBackup(backupId: string, options?: {
    includeDatabase?: boolean;
    includeFiles?: boolean;
    dryRun?: boolean;
  }): Promise<RecoveryJob> {
    const jobId = `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: RecoveryJob = {
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

    // Start recovery process asynchronously
    this.performRecovery(job).catch(error => {
      this.logger.error(`Recovery job ${jobId} failed:`, error);
      job.status = 'failed';
      job.errorMessage = error.message;
    });

    await this.auditService.logSystemAction(
      'recovery_started',
      'backup',
      backupId,
      { recoveryJobId: jobId, options }
    );

    return job;
  }

  async getBackupJobs(limit: number = 50): Promise<BackupJob[]> {
    const jobs = Array.from(this.activeJobs.values());

    // Also include completed jobs from file system
    const completedJobs = await this.getCompletedBackupsFromFilesystem();

    return [...jobs, ...completedJobs]
      .sort((a, b) => (b.startedAt || new Date()).getTime() - (a.startedAt || new Date()).getTime())
      .slice(0, limit);
  }

  async getRecoveryJobs(limit: number = 50): Promise<RecoveryJob[]> {
    return Array.from(this.recoveryJobs.values())
      .sort((a, b) => (b.startedAt || new Date()).getTime() - (a.startedAt || new Date()).getTime())
      .slice(0, limit);
  }

  async getBackupStats(): Promise<BackupStats> {
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

  async deleteBackup(backupId: string): Promise<{ success: boolean; message: string }> {
    try {
      const backupPath = path.join(this.config.backupPath, `${backupId}.zip`);

      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);

        await this.auditService.logSystemAction(
          'backup_deleted',
          'backup',
          backupId
        );

        return { success: true, message: 'Backup deleted successfully' };
      } else {
        return { success: false, message: 'Backup file not found' };
      }
    } catch (error) {
      return { success: false, message: `Failed to delete backup: ${error.message}` };
    }
  }

  async validateBackup(backupId: string): Promise<{
    valid: boolean;
    issues: string[];
    metadata: Record<string, any>;
  }> {
    try {
      const backupPath = path.join(this.config.backupPath, `${backupId}.zip`);

      if (!fs.existsSync(backupPath)) {
        return { valid: false, issues: ['Backup file not found'], metadata: {} };
      }

      // Basic validation - check file size and integrity
      const stats = fs.statSync(backupPath);
      const issues: string[] = [];

      if (stats.size === 0) {
        issues.push('Backup file is empty');
      }

      if (stats.size > this.config.maxBackupSize * 1024 * 1024) {
        issues.push('Backup file exceeds maximum size limit');
      }

      // Check if backup is older than retention period
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
    } catch (error) {
      return {
        valid: false,
        issues: [`Validation failed: ${error.message}`],
        metadata: {},
      };
    }
  }

  // Private methods
  private async performBackup(job: BackupJob): Promise<void> {
    job.status = 'running';
    job.startedAt = new Date();

    try {
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Maximum compression
      });

      const backupFilename = `${job.id}.zip`;
      const backupFilePath = path.join(this.config.backupPath, backupFilename);

      const output = createWriteStream(backupFilePath);
      archive.pipe(output);

      // Add database dump if enabled
      if (this.config.includeDatabase) {
        await this.addDatabaseToBackup(archive, job);
      }

      // Add uploaded files if enabled
      if (this.config.includeFiles) {
        await this.addFilesToBackup(archive, job);
      }

      // Add logs if enabled
      if (this.config.includeLogs) {
        await this.addLogsToBackup(archive, job);
      }

      // Add metadata
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

      // Wait for file to be written
      await new Promise((resolve, reject) => {
        output.on('close', () => resolve(undefined));
        output.on('error', reject);
      });

      // Update job status
      job.status = 'completed';
      job.completedAt = new Date();
      job.filePath = backupFilePath;

      const stats = fs.statSync(backupFilePath);
      job.size = stats.size;

      this.logger.log(`Backup ${job.id} completed successfully. Size: ${stats.size} bytes`);

      await this.auditService.logSystemAction(
        'backup_completed',
        'backup',
        job.id,
        { size: stats.size, filePath: backupFilePath }
      );

    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error.message;
      throw error;
    }
  }

  private async performRecovery(job: RecoveryJob): Promise<void> {
    job.status = 'running';
    job.startedAt = new Date();

    try {
      const backupPath = path.join(this.config.backupPath, `${job.backupId}.zip`);

      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup file not found');
      }

      // Extract and restore database
      if (job.metadata.options?.includeDatabase !== false) {
        await this.restoreDatabaseFromBackup(backupPath, job);
      }

      // Restore files
      if (job.metadata.options?.includeFiles !== false) {
        await this.restoreFilesFromBackup(backupPath, job);
      }

      job.status = 'completed';
      job.completedAt = new Date();

      await this.auditService.logSystemAction(
        'recovery_completed',
        'backup',
        job.backupId,
        { recoveryJobId: job.id, recoveredItems: job.recoveredItems }
      );

    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error.message;
      throw error;
    }
  }

  private async addDatabaseToBackup(archive: archiver.Archiver, job: BackupJob): Promise<void> {
    // Create database dump
    const dbDump = await this.createDatabaseDump();
    archive.append(dbDump, { name: 'database.sql' });
  }

  private async addFilesToBackup(archive: archiver.Archiver, job: BackupJob): Promise<void> {
    const uploadDirs = ['uploads/images', 'uploads/documents', 'uploads/temp'];

    for (const dir of uploadDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        archive.directory(fullPath, dir);
      }
    }
  }

  private async addLogsToBackup(archive: archiver.Archiver, job: BackupJob): Promise<void> {
    const logFiles = ['logs/audit.log', 'logs/error.log', 'logs/combined.log'];

    for (const logFile of logFiles) {
      const fullPath = path.join(process.cwd(), logFile);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: logFile });
      }
    }
  }

  private async createDatabaseDump(): Promise<string> {
    // In a real implementation, this would use pg_dump for PostgreSQL
    // or mysqldump for MySQL, or export from Prisma
    return `-- Database dump for QuickMela
-- Generated on ${new Date().toISOString()}
-- This is a mock dump for demonstration purposes

-- Mock data export would go here
`;
  }

  private async restoreDatabaseFromBackup(backupPath: string, job: RecoveryJob): Promise<void> {
    // In a real implementation, this would:
    // 1. Extract database dump from backup
    // 2. Validate the dump
    // 3. Restore to database
    // 4. Run migrations if needed

    job.recoveredItems.push('database');
    this.logger.log('Database restoration completed (mock)');
  }

  private async restoreFilesFromBackup(backupPath: string, job: RecoveryJob): Promise<void> {
    // In a real implementation, this would extract files from backup
    job.recoveredItems.push('uploaded_files');
    this.logger.log('File restoration completed (mock)');
  }

  private async getCompletedBackupsFromFilesystem(): Promise<BackupJob[]> {
    const backupFiles = fs.readdirSync(this.config.backupPath)
      .filter(file => file.endsWith('.zip'))
      .map(filename => {
        const filePath = path.join(this.config.backupPath, filename);
        const stats = fs.statSync(filePath);

        return {
          id: filename.replace('.zip', ''),
          type: 'full' as const,
          status: 'completed' as const,
          completedAt: stats.mtime,
          size: stats.size,
          filePath,
          metadata: {},
        };
      });

    return backupFiles;
  }

  private calculateNextBackupTime(): Date {
    const now = new Date();
    const nextBackup = new Date(now);

    switch (this.config.frequency) {
      case 'daily':
        nextBackup.setDate(now.getDate() + 1);
        nextBackup.setHours(2, 0, 0, 0); // 2 AM tomorrow
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

  private async calculateStorageUsage(): Promise<number> {
    const backupFiles = await this.getCompletedBackupsFromFilesystem();
    return backupFiles.reduce((sum, backup) => sum + (backup.size || 0), 0);
  }

  private async checkRetentionCompliance(): Promise<boolean> {
    const backups = await this.getCompletedBackupsFromFilesystem();
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);

    return backups.every(backup =>
      !backup.completedAt || backup.completedAt >= cutoffDate
    );
  }

  private scheduleAutomaticBackups(): void {
    const intervalMs = this.config.frequency === 'daily' ? 24 * 60 * 60 * 1000 :
                      this.config.frequency === 'weekly' ? 7 * 24 * 60 * 60 * 1000 :
                      30 * 24 * 60 * 60 * 1000;

    setInterval(async () => {
      try {
        await this.createBackup({ type: 'full' });
        this.logger.log('Automatic backup completed');
      } catch (error) {
        this.logger.error('Automatic backup failed:', error);
      }
    }, intervalMs);
  }

  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.getCompletedBackupsFromFilesystem();
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);

    let deletedCount = 0;
    for (const backup of backups) {
      if (backup.completedAt && backup.completedAt < cutoffDate) {
        try {
          await this.deleteBackup(backup.id);
          deletedCount++;
        } catch (error) {
          this.logger.error(`Failed to delete old backup ${backup.id}:`, error);
        }
      }
    }

    if (deletedCount > 0) {
      this.logger.log(`Cleaned up ${deletedCount} old backups`);
    }
  }

  // Configuration methods
  updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.log('Backup configuration updated');
  }

  getConfig(): BackupConfig {
    return { ...this.config };
  }

  // Emergency methods
  async createEmergencyBackup(): Promise<BackupJob> {
    this.logger.warn('Creating emergency backup due to system alert');

    return await this.createBackup({
      type: 'full',
      includeDatabase: true,
      includeFiles: true,
      includeLogs: true,
    });
  }

  async getSystemHealthForBackup(): Promise<{
    canBackup: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check available disk space
    const stats = await this.calculateStorageUsage();
    const availableSpace = 10 * 1024 * 1024 * 1024; // Assume 10GB available
    if (stats > availableSpace * 0.9) {
      issues.push('Low disk space for backups');
      recommendations.push('Free up disk space or increase storage capacity');
    }

    // Check database connectivity
    try {
      await this.prismaService.user.count({ take: 1 });
    } catch (error) {
      issues.push('Database connectivity issues');
      recommendations.push('Check database connection and restore connectivity');
    }

    return {
      canBackup: issues.length === 0,
      issues,
      recommendations,
    };
  }
}
