import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
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
    maxBackupSize: number;
}
export interface BackupJob {
    id: string;
    type: 'full' | 'incremental' | 'database_only' | 'files_only';
    status: 'pending' | 'running' | 'completed' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
    size?: number;
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
export declare class BackupService {
    private prismaService;
    private auditService;
    private readonly logger;
    private config;
    private activeJobs;
    private recoveryJobs;
    constructor(prismaService: PrismaService, auditService: AuditService);
    private initializeBackupSystem;
    createBackup(options?: {
        type?: BackupJob['type'];
        includeDatabase?: boolean;
        includeFiles?: boolean;
        includeLogs?: boolean;
        compressionEnabled?: boolean;
    }): Promise<BackupJob>;
    restoreBackup(backupId: string, options?: {
        includeDatabase?: boolean;
        includeFiles?: boolean;
        dryRun?: boolean;
    }): Promise<RecoveryJob>;
    getBackupJobs(limit?: number): Promise<BackupJob[]>;
    getRecoveryJobs(limit?: number): Promise<RecoveryJob[]>;
    getBackupStats(): Promise<BackupStats>;
    deleteBackup(backupId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    validateBackup(backupId: string): Promise<{
        valid: boolean;
        issues: string[];
        metadata: Record<string, any>;
    }>;
    private performBackup;
    private performRecovery;
    private addDatabaseToBackup;
    private addFilesToBackup;
    private addLogsToBackup;
    private createDatabaseDump;
    private restoreDatabaseFromBackup;
    private restoreFilesFromBackup;
    private getCompletedBackupsFromFilesystem;
    private calculateNextBackupTime;
    private calculateStorageUsage;
    private checkRetentionCompliance;
    private scheduleAutomaticBackups;
    private cleanupOldBackups;
    updateConfig(newConfig: Partial<BackupConfig>): void;
    getConfig(): BackupConfig;
    createEmergencyBackup(): Promise<BackupJob>;
    getSystemHealthForBackup(): Promise<{
        canBackup: boolean;
        issues: string[];
        recommendations: string[];
    }>;
}
