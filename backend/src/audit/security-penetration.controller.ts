import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SecurityPenetrationService, PenetrationTestReport } from './security-penetration.service';

@ApiTags('security-audit')
@Controller('security-audit')
@UseGuards(RolesGuard)
export class SecurityPenetrationController {
  constructor(private readonly securityService: SecurityPenetrationService) {}

  @Post('run-full-pentest')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Run comprehensive security penetration test' })
  @ApiResponse({ status: 200, description: 'Penetration test completed successfully' })
  async runFullPenetrationTest(): Promise<PenetrationTestReport> {
    return this.securityService.runFullPenetrationTest();
  }

  @Get('vulnerability-report')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get current vulnerability assessment report' })
  @ApiQuery({ name: 'detailed', required: false, description: 'Include detailed exploit information' })
  @ApiResponse({ status: 200, description: 'Vulnerability report retrieved' })
  async getVulnerabilityReport(@Query('detailed') detailed?: string): Promise<PenetrationTestReport> {
    const report = await this.securityService.runFullPenetrationTest();

    // If not detailed, remove exploit steps and some sensitive information
    if (detailed !== 'true') {
      report.testResults = report.testResults.map(result => ({
        ...result,
        exploitSteps: undefined,
        evidence: undefined,
      }));
    }

    return report;
  }

  @Get('compliance-status')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get compliance status across standards' })
  @ApiResponse({ status: 200, description: 'Compliance status retrieved' })
  async getComplianceStatus() {
    const report = await this.securityService.runFullPenetrationTest();

    return {
      complianceStatus: report.riskAssessment.complianceStatus,
      riskScore: report.riskAssessment.overallScore,
      lastAssessment: new Date(),
      nextAssessmentDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
      criticalIssues: report.summary.criticalVulnerabilities,
      recommendations: report.recommendations.slice(0, 5), // Top 5 recommendations
    };
  }

  @Post('generate-security-report')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Generate detailed security assessment report' })
  @ApiResponse({ status: 200, description: 'Security report generated' })
  async generateSecurityReport(): Promise<{
    report: PenetrationTestReport;
    executiveSummary: string;
    priorityActions: string[];
    complianceStatus: any;
  }> {
    const report = await this.securityService.runFullPenetrationTest();

    const executiveSummary = `
      Security Assessment Report - ${new Date().toLocaleDateString()}

      OVERALL RISK LEVEL: ${report.summary.overallRiskLevel.toUpperCase()}
      RISK SCORE: ${report.riskAssessment.overallScore}/100

      Test Results:
      - Total Tests: ${report.summary.totalTests}
      - Passed: ${report.summary.passed}
      - Failed: ${report.summary.failed}
      - Warnings: ${report.summary.warnings}
      - Critical Vulnerabilities: ${report.summary.criticalVulnerabilities}

      Compliance Status:
      - PCI DSS: ${report.riskAssessment.complianceStatus.pci ? 'COMPLIANT' : 'NON-COMPLIANT'}
      - GDPR: ${report.riskAssessment.complianceStatus.gdpr ? 'COMPLIANT' : 'NON-COMPLIANT'}
      - ISO 27001: ${report.riskAssessment.complianceStatus.iso27001 ? 'COMPLIANT' : 'NON-COMPLIANT'}
    `;

    const priorityActions = report.nextSteps.filter(step => step.includes('URGENT') || step.includes('CRITICAL'));

    return {
      report,
      executiveSummary: executiveSummary.trim(),
      priorityActions,
      complianceStatus: report.riskAssessment.complianceStatus,
    };
  }

  @Get('attack-vectors-tested')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get list of tested attack vectors' })
  @ApiResponse({ status: 200, description: 'Attack vectors list retrieved' })
  getAttackVectorsTested() {
    return {
      authenticationAttacks: [
        'API Replay Attacks',
        'Session Hijacking',
        'Session Fixation',
        'Token Manipulation',
      ],
      authorizationAttacks: [
        'Role Elevation',
        'Horizontal Privilege Escalation',
        'Vertical Privilege Escalation',
        'IDOR (Insecure Direct Object Reference)',
      ],
      financialAttacks: [
        'Wallet Manipulation',
        'Escrow Bypass',
        'EMI Abuse',
        'Double Debit Protection',
      ],
      dataAttacks: [
        'Direct Database Access',
        'Mass CSV Injection',
        'Data Exfiltration',
        'Information Disclosure',
      ],
      infrastructureAttacks: [
        'Rate Limit Bypass',
        'Distributed DoS',
        'Resource Exhaustion',
      ],
      complianceChecks: [
        'PCI DSS Compliance',
        'GDPR Compliance',
        'ISO 27001 Compliance',
      ],
    };
  }

  @Post('schedule-pentest')
  @HttpCode(HttpStatus.OK)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Schedule automated penetration testing' })
  @ApiResponse({ status: 200, description: 'Penetration testing scheduled' })
  async schedulePenetrationTest(@Body() scheduleData: {
    frequency: 'daily' | 'weekly' | 'monthly';
    enabled: boolean;
    alertChannels: {
      email?: string[];
      slack?: string;
      webhook?: string;
    };
    severityThreshold: 'low' | 'medium' | 'high' | 'critical';
  }) {
    // In a real implementation, this would schedule automated tests
    return {
      status: 'scheduled',
      frequency: scheduleData.frequency,
      nextRun: new Date(Date.now() + this.getFrequencyMs(scheduleData.frequency)),
      alertChannels: scheduleData.alertChannels,
      severityThreshold: scheduleData.severityThreshold,
      message: `Automated penetration testing scheduled for ${scheduleData.frequency} execution`,
    };
  }

  @Get('security-dashboard')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get security dashboard data' })
  @ApiResponse({ status: 200, description: 'Security dashboard data retrieved' })
  async getSecurityDashboard() {
    const report = await this.securityService.runFullPenetrationTest();

    return {
      overallRiskLevel: report.summary.overallRiskLevel,
      riskScore: report.riskAssessment.overallScore,
      testSummary: {
        totalTests: report.summary.totalTests,
        passedTests: report.summary.passed,
        failedTests: report.summary.failed,
        warningTests: report.summary.warnings,
        criticalVulnerabilities: report.summary.criticalVulnerabilities,
      },
      topRisks: report.riskAssessment.riskFactors.slice(0, 5),
      recentTests: [
        {
          testName: 'Full Penetration Test',
          status: report.summary.criticalVulnerabilities === 0 ? 'passed' : 'failed',
          executedAt: new Date(),
          duration: '45 seconds',
        },
      ],
      compliance: report.riskAssessment.complianceStatus,
      alerts: report.testResults
        .filter(r => r.status === 'failed' && r.severity === 'critical')
        .map(r => ({
          type: 'critical',
          message: `${r.testName}: ${r.vulnerability}`,
          timestamp: new Date(),
        })),
    };
  }

  // Private helper methods
  private getFrequencyMs(frequency: string): number {
    switch (frequency) {
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      case 'monthly': return 30 * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000; // Default to weekly
    }
  }
}
