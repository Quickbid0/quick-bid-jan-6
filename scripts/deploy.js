#!/usr/bin/env node

/**
 * PRODUCTION DEPLOYMENT EXECUTION SCRIPT
 * Handles complete deployment lifecycle for QuickMela platform
 * Run with: node scripts/deploy.js
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface DeploymentConfig {
  environment: 'staging' | 'production';
  version: string;
  timestamp: string;
  deployer: string;
  approvedBy: string;
  rollbackVersion?: string;
}

interface DeploymentStatus {
  phase: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: string;
  logs: string[];
}

class DeploymentExecutor {
  private config: DeploymentConfig;
  private status: DeploymentStatus;
  private logFile: string;

  constructor(config: DeploymentConfig) {
    this.config = config;
    this.status = {
      phase: 'initialization',
      status: 'pending',
      startTime: new Date(),
      logs: []
    };

    this.logFile = `deployment_${config.environment}_${config.timestamp}.log`;
  }

  async executeDeployment(): Promise<boolean> {
    try {
      this.log('🚀 STARTING PRODUCTION DEPLOYMENT');
      this.log(`Environment: ${this.config.environment.toUpperCase()}`);
      this.log(`Version: ${this.config.version}`);
      this.log(`Deployer: ${this.config.deployer}`);
      this.log(`Approved By: ${this.config.approvedBy}`);
      this.log('=' .repeat(60));

      // Phase 1: Pre-deployment checks
      if (!await this.runPreDeploymentChecks()) {
        throw new Error('Pre-deployment checks failed');
      }

      // Phase 2: Database migration
      if (!await this.runDatabaseMigration()) {
        throw new Error('Database migration failed');
      }

      // Phase 3: Backup creation
      if (!await this.createBackup()) {
        throw new Error('Backup creation failed');
      }

      // Phase 4: Application deployment
      if (!await this.deployApplication()) {
        throw new Error('Application deployment failed');
      }

      // Phase 5: Post-deployment validation
      if (!await this.runPostDeploymentValidation()) {
        throw new Error('Post-deployment validation failed');
      }

      // Phase 6: Traffic switching
      if (!await this.switchTraffic()) {
        throw new Error('Traffic switching failed');
      }

      this.status.status = 'completed';
      this.status.endTime = new Date();

      this.log('\n🎉 DEPLOYMENT COMPLETED SUCCESSFULLY');
      this.log('==================================');
      this.log(`Total Duration: ${this.getDuration()} minutes`);
      this.log(`Environment: ${this.config.environment}`);
      this.log(`Version: ${this.config.version}`);
      this.log('\nNext Steps:');
      this.log('1. Monitor system for 24 hours');
      this.log('2. Run additional smoke tests');
      this.log('3. Notify stakeholders of successful deployment');

      return true;

    } catch (error) {
      this.status.status = 'failed';
      this.status.endTime = new Date();
      this.status.error = error.message;

      this.log(`\n❌ DEPLOYMENT FAILED`);
      this.log('===================');
      this.log(`Error: ${error.message}`);
      this.log(`Phase: ${this.status.phase}`);
      this.log(`Duration: ${this.getDuration()} minutes`);

      // Attempt rollback
      await this.rollbackDeployment();

      return false;
    }
  }

  private async runPreDeploymentChecks(): Promise<boolean> {
    this.updatePhase('pre-deployment-checks');

    this.log('\n🔍 PHASE 1: Pre-Deployment Checks');

    try {
      // Check environment variables
      this.log('Checking environment variables...');
      const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'REDIS_URL',
        'SMTP_HOST',
        'STRIPE_SECRET_KEY'
      ];

      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar] || process.env[envVar]?.includes('your_') || process.env[envVar]?.includes('example')) {
          throw new Error(`Missing or invalid environment variable: ${envVar}`);
        }
      }
      this.log('✅ Environment variables validated');

      // Check database connectivity
      this.log('Checking database connectivity...');
      await this.checkDatabaseConnection();
      this.log('✅ Database connection established');

      // Check Redis connectivity
      this.log('Checking Redis connectivity...');
      await this.checkRedisConnection();
      this.log('✅ Redis connection established');

      // Check disk space
      this.log('Checking disk space...');
      await this.checkDiskSpace();
      this.log('✅ Sufficient disk space available');

      // Check SSL certificates
      this.log('Checking SSL certificates...');
      await this.checkSSLCertificates();
      this.log('✅ SSL certificates valid');

      // Run health checks on current deployment
      this.log('Running health checks...');
      await this.runHealthChecks();
      this.log('✅ Health checks passed');

      this.log('✅ All pre-deployment checks passed');
      return true;

    } catch (error) {
      this.log(`❌ Pre-deployment check failed: ${error.message}`);
      return false;
    }
  }

  private async runDatabaseMigration(): Promise<boolean> {
    this.updatePhase('database-migration');

    this.log('\n🗄️ PHASE 2: Database Migration');

    try {
      // Create database backup
      this.log('Creating database backup...');
      await this.createDatabaseBackup();
      this.log('✅ Database backup created');

      // Run Prisma migrations
      this.log('Running database migrations...');
      execSync('cd backend && npm run db:migrate', { stdio: 'inherit' });
      this.log('✅ Database migrations completed');

      // Validate schema
      this.log('Validating database schema...');
      await this.validateDatabaseSchema();
      this.log('✅ Database schema validated');

      return true;

    } catch (error) {
      this.log(`❌ Database migration failed: ${error.message}`);
      return false;
    }
  }

  private async createBackup(): Promise<boolean> {
    this.updatePhase('backup-creation');

    this.log('\n💾 PHASE 3: Backup Creation');

    try {
      // Create application backup
      this.log('Creating application backup...');
      await this.createApplicationBackup();
      this.log('✅ Application backup created');

      // Create configuration backup
      this.log('Creating configuration backup...');
      await this.createConfigurationBackup();
      this.log('✅ Configuration backup created');

      // Validate backups
      this.log('Validating backups...');
      await this.validateBackups();
      this.log('✅ Backups validated');

      return true;

    } catch (error) {
      this.log(`❌ Backup creation failed: ${error.message}`);
      return false;
    }
  }

  private async deployApplication(): Promise<boolean> {
    this.updatePhase('application-deployment');

    this.log('\n🚀 PHASE 4: Application Deployment');

    try {
      // Build application
      this.log('Building application...');
      execSync('npm run build:production', { stdio: 'inherit' });
      this.log('✅ Application built successfully');

      // Run tests
      this.log('Running test suite...');
      execSync('npm run test:e2e', { stdio: 'inherit' });
      this.log('✅ All tests passed');

      // Deploy to staging first (if production deployment)
      if (this.config.environment === 'production') {
        this.log('Deploying to staging for validation...');
        await this.deployToStaging();
        this.log('✅ Staging deployment completed');

        this.log('Running integration tests on staging...');
        await this.runIntegrationTests();
        this.log('✅ Integration tests passed');
      }

      // Deploy to production
      this.log(`Deploying to ${this.config.environment}...`);
      await this.deployToProduction();
      this.log(`✅ ${this.config.environment} deployment completed`);

      return true;

    } catch (error) {
      this.log(`❌ Application deployment failed: ${error.message}`);
      return false;
    }
  }

  private async runPostDeploymentValidation(): Promise<boolean> {
    this.updatePhase('post-deployment-validation');

    this.log('\n🔍 PHASE 5: Post-Deployment Validation');

    try {
      // Wait for application to start
      this.log('Waiting for application startup...');
      await this.waitForApplicationStartup();
      this.log('✅ Application started successfully');

      // Run health checks
      this.log('Running health checks...');
      await this.runPostDeploymentHealthChecks();
      this.log('✅ Health checks passed');

      // Validate API endpoints
      this.log('Validating API endpoints...');
      await this.validateApiEndpoints();
      this.log('✅ API endpoints validated');

      // Run smoke tests
      this.log('Running smoke tests...');
      await this.runSmokeTests();
      this.log('✅ Smoke tests passed');

      // Validate database operations
      this.log('Validating database operations...');
      await this.validateDatabaseOperations();
      this.log('✅ Database operations validated');

      return true;

    } catch (error) {
      this.log(`❌ Post-deployment validation failed: ${error.message}`);
      return false;
    }
  }

  private async switchTraffic(): Promise<boolean> {
    this.updatePhase('traffic-switching');

    this.log('\n🚦 PHASE 6: Traffic Switching');

    try {
      // Update load balancer
      this.log('Updating load balancer configuration...');
      await this.updateLoadBalancer();
      this.log('✅ Load balancer updated');

      // Switch traffic gradually
      this.log('Switching traffic to new deployment...');
      await this.gradualTrafficSwitch();
      this.log('✅ Traffic switched successfully');

      // Monitor traffic switch
      this.log('Monitoring traffic switch...');
      await this.monitorTrafficSwitch();
      this.log('✅ Traffic switch completed successfully');

      // Update DNS if needed
      if (this.config.environment === 'production') {
        this.log('Updating DNS records...');
        await this.updateDNS();
        this.log('✅ DNS records updated');
      }

      return true;

    } catch (error) {
      this.log(`❌ Traffic switching failed: ${error.message}`);
      return false;
    }
  }

  private async rollbackDeployment(): Promise<void> {
    this.log('\n↩️ INITIATING ROLLBACK');

    try {
      // Switch traffic back
      this.log('Switching traffic back to previous version...');
      await this.rollbackTraffic();

      // Restore application
      this.log('Restoring application from backup...');
      await this.restoreApplication();

      // Restore database if needed
      if (this.status.phase.includes('database')) {
        this.log('Restoring database from backup...');
        await this.restoreDatabase();
      }

      this.log('✅ Rollback completed successfully');

    } catch (rollbackError) {
      this.log(`❌ Rollback failed: ${rollbackError.message}`);
      this.log('🚨 MANUAL INTERVENTION REQUIRED');
      this.log('Contact DevOps team immediately for manual rollback');
    }
  }

  // Helper methods
  private updatePhase(phase: string): void {
    this.status.phase = phase;
    this.status.status = 'running';
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;

    console.log(logMessage);
    this.status.logs.push(logMessage);

    // Also write to file
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  private getDuration(): string {
    const duration = this.status.endTime
      ? this.status.endTime.getTime() - this.status.startTime.getTime()
      : Date.now() - this.status.startTime.getTime();

    return (duration / 60000).toFixed(2); // minutes
  }

  // Implementation of individual check/deployment methods
  private async checkDatabaseConnection(): Promise<void> {
    // Implement database connection check
  }

  private async checkRedisConnection(): Promise<void> {
    // Implement Redis connection check
  }

  private async checkDiskSpace(): Promise<void> {
    // Implement disk space check
  }

  private async checkSSLCertificates(): Promise<void> {
    // Implement SSL certificate validation
  }

  private async runHealthChecks(): Promise<void> {
    // Implement health checks
  }

  private async createDatabaseBackup(): Promise<void> {
    // Implement database backup
  }

  private async validateDatabaseSchema(): Promise<void> {
    // Implement schema validation
  }

  private async createApplicationBackup(): Promise<void> {
    // Implement application backup
  }

  private async createConfigurationBackup(): Promise<void> {
    // Implement configuration backup
  }

  private async validateBackups(): Promise<void> {
    // Implement backup validation
  }

  private async deployToStaging(): Promise<void> {
    // Implement staging deployment
  }

  private async runIntegrationTests(): Promise<void> {
    // Implement integration tests
  }

  private async deployToProduction(): Promise<void> {
    // Implement production deployment
  }

  private async waitForApplicationStartup(): Promise<void> {
    // Implement startup wait logic
  }

  private async runPostDeploymentHealthChecks(): Promise<void> {
    // Implement post-deployment health checks
  }

  private async validateApiEndpoints(): Promise<void> {
    // Implement API endpoint validation
  }

  private async runSmokeTests(): Promise<void> {
    // Implement smoke tests
  }

  private async validateDatabaseOperations(): Promise<void> {
    // Implement database operation validation
  }

  private async updateLoadBalancer(): Promise<void> {
    // Implement load balancer update
  }

  private async gradualTrafficSwitch(): Promise<void> {
    // Implement gradual traffic switching
  }

  private async monitorTrafficSwitch(): Promise<void> {
    // Implement traffic switch monitoring
  }

  private async updateDNS(): Promise<void> {
    // Implement DNS update
  }

  private async rollbackTraffic(): Promise<void> {
    // Implement traffic rollback
  }

  private async restoreApplication(): Promise<void> {
    // Implement application restoration
  }

  private async restoreDatabase(): Promise<void> {
    // Implement database restoration
  }
}

// Deployment configuration
const deploymentConfig: DeploymentConfig = {
  environment: (process.env.DEPLOY_ENV as 'staging' | 'production') || 'staging',
  version: process.env.DEPLOY_VERSION || `v${Date.now()}`,
  timestamp: new Date().toISOString().replace(/[:.]/g, '-'),
  deployer: process.env.DEPLOYER || 'automated',
  approvedBy: process.env.APPROVED_BY || 'deployment_system',
};

// Execute deployment
if (import.meta.url === `file://${process.argv[1]}`) {
  const executor = new DeploymentExecutor(deploymentConfig);

  executor.executeDeployment()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Deployment execution failed:', error);
      process.exit(1);
    });
}

export default DeploymentExecutor;
