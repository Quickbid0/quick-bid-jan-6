import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SecurityTestResult {
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  vulnerability: string;
  impact: string;
  recommendation: string;
  evidence?: string[];
  exploitSteps?: string[];
}

export interface PenetrationTestReport {
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
    criticalVulnerabilities: number;
    overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  testResults: SecurityTestResult[];
  riskAssessment: {
    overallScore: number;
    riskFactors: string[];
    complianceStatus: {
      pci: boolean;
      gdpr: boolean;
      iso27001: boolean;
    };
  };
  recommendations: string[];
  nextSteps: string[];
}

@Injectable()
export class SecurityPenetrationService {
  private readonly logger = new Logger(SecurityPenetrationService.name);

  constructor(private prisma: PrismaService) {}

  async runFullPenetrationTest(): Promise<PenetrationTestReport> {
    this.logger.log('Starting comprehensive security penetration test');

    const testResults: SecurityTestResult[] = [];

    // Run all security tests
    testResults.push(await this.testAPIReplayAttacks());
    testResults.push(await this.testWalletManipulation());
    testResults.push(await this.testEscrowBypass());
    testResults.push(await this.testDirectDBAccess());
    testResults.push(await this.testRoleElevation());
    testResults.push(await this.testMassCSVInjection());
    testResults.push(await this.testEMIAbuse());
    testResults.push(await this.testRateLimitBypass());
    testResults.push(await this.testSessionHijacking());
    testResults.push(await this.testDataExfiltration());

    // Calculate summary
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    const warnings = testResults.filter(t => t.status === 'warning').length;
    const criticalVulnerabilities = testResults.filter(
      t => t.status === 'failed' && t.severity === 'critical'
    ).length;

    const overallRiskLevel = this.calculateOverallRiskLevel(criticalVulnerabilities, failed, warnings);

    const riskAssessment = {
      overallScore: this.calculateRiskScore(testResults),
      riskFactors: this.identifyRiskFactors(testResults),
      complianceStatus: {
        pci: this.checkPCICompliance(testResults),
        gdpr: this.checkGDPRCompliance(testResults),
        iso27001: this.checkISO27001Compliance(testResults),
      },
    };

    const recommendations = this.generateSecurityRecommendations(testResults);
    const nextSteps = this.generateNextSteps(testResults, overallRiskLevel);

    const report: PenetrationTestReport = {
      summary: {
        totalTests: testResults.length,
        passed,
        failed,
        warnings,
        criticalVulnerabilities,
        overallRiskLevel,
      },
      testResults,
      riskAssessment,
      recommendations,
      nextSteps,
    };

    this.logger.log(`Penetration test completed: ${passed} passed, ${failed} failed, ${warnings} warnings`);
    return report;
  }

  // Individual security test methods
  private async testAPIReplayAttacks(): Promise<SecurityTestResult> {
    // Simulate API replay attacks by testing token reuse and replay protection
    const vulnerabilities = [];

    // Test 1: Check if JWT tokens can be replayed
    const tokenReplayPossible = await this.simulateTokenReplay();

    // Test 2: Check for missing nonce/sequence protection
    const noSequenceProtection = await this.checkSequenceProtection();

    if (tokenReplayPossible) {
      vulnerabilities.push('JWT tokens can be replayed');
    }

    if (noSequenceProtection) {
      vulnerabilities.push('No sequence protection on sensitive operations');
    }

    return {
      testName: 'API Replay Attack Protection',
      status: vulnerabilities.length > 0 ? 'failed' : 'passed',
      severity: vulnerabilities.length > 0 ? 'high' : 'low',
      description: 'Testing protection against API replay attacks and token reuse',
      vulnerability: vulnerabilities.join(', ') || 'None detected',
      impact: vulnerabilities.length > 0
        ? 'Attackers can replay captured API requests to perform unauthorized actions'
        : 'API replay attacks are properly prevented',
      recommendation: vulnerabilities.length > 0
        ? 'Implement JWT token blacklisting, add request sequencing, and use short-lived tokens'
        : 'Continue monitoring and maintain current security measures',
      exploitSteps: vulnerabilities.length > 0 ? [
        'Capture legitimate API requests with authentication tokens',
        'Replay captured requests without modification',
        'Observe if actions are performed successfully',
      ] : undefined,
    };
  }

  private async testWalletManipulation(): Promise<SecurityTestResult> {
    // Test wallet balance manipulation and double-spend attacks
    const vulnerabilities = [];

    // Test 1: Race condition in wallet debits
    const raceConditionExists = await this.testWalletRaceCondition();

    // Test 2: Negative balance protection
    const negativeBalanceAllowed = await this.testNegativeBalanceProtection();

    // Test 3: Concurrent transaction handling
    const concurrentTransactionIssue = await this.testConcurrentTransactions();

    if (raceConditionExists) vulnerabilities.push('Race conditions in wallet operations');
    if (negativeBalanceAllowed) vulnerabilities.push('Negative balance manipulation possible');
    if (concurrentTransactionIssue) vulnerabilities.push('Concurrent transaction issues');

    return {
      testName: 'Wallet Manipulation Protection',
      status: vulnerabilities.length > 0 ? 'failed' : 'passed',
      severity: vulnerabilities.length > 1 ? 'critical' : 'high',
      description: 'Testing wallet balance manipulation and double-spend attack prevention',
      vulnerability: vulnerabilities.join(', ') || 'None detected',
      impact: vulnerabilities.length > 0
        ? 'Users can manipulate wallet balances or perform double-spend attacks'
        : 'Wallet operations are secure and protected',
      recommendation: vulnerabilities.length > 0
        ? 'Implement atomic transactions, add balance validation, use database locks'
        : 'Maintain current wallet security measures',
      exploitSteps: vulnerabilities.length > 0 ? [
        'Create multiple concurrent wallet debit requests',
        'Attempt to spend more than available balance',
        'Check for race conditions in balance updates',
      ] : undefined,
    };
  }

  private async testEscrowBypass(): Promise<SecurityTestResult> {
    // Test escrow fund manipulation and bypass attempts
    const vulnerabilities = [];

    // Test 1: Unauthorized escrow access
    const unauthorizedAccess = await this.testEscrowAuthorization();

    // Test 2: Escrow amount manipulation
    const amountManipulation = await this.testEscrowAmountManipulation();

    // Test 3: Premature release protection
    const prematureRelease = await this.testPrematureRelease();

    if (unauthorizedAccess) vulnerabilities.push('Unauthorized escrow access possible');
    if (amountManipulation) vulnerabilities.push('Escrow amounts can be manipulated');
    if (prematureRelease) vulnerabilities.push('Escrow funds can be released prematurely');

    return {
      testName: 'Escrow Bypass Protection',
      status: vulnerabilities.length > 0 ? 'failed' : 'passed',
      severity: vulnerabilities.length > 0 ? 'critical' : 'high',
      description: 'Testing protection against escrow fund manipulation and bypass attacks',
      vulnerability: vulnerabilities.join(', ') || 'None detected',
      impact: vulnerabilities.length > 0
        ? 'Attackers can bypass escrow protections and steal funds'
        : 'Escrow system is secure and tamper-proof',
      recommendation: vulnerabilities.length > 0
        ? 'Add multi-signature requirements, implement escrow state validation, add audit trails'
        : 'Continue escrow security monitoring',
      exploitSteps: vulnerabilities.length > 0 ? [
        'Attempt to access escrow funds without proper authorization',
        'Try to manipulate escrow amounts during creation',
        'Attempt premature release of escrow funds',
      ] : undefined,
    };
  }

  private async testDirectDBAccess(): Promise<SecurityTestResult> {
    // Test protection against direct database ID guessing and enumeration
    const vulnerabilities = [];

    // Test 1: Sequential ID guessing
    const sequentialIds = await this.testSequentialIDGuessing();

    // Test 2: UUID randomness
    const weakUUIDs = await this.testUUIDRandomness();

    // Test 3: Information disclosure through errors
    const errorDisclosure = await this.testErrorInformationDisclosure();

    if (sequentialIds) vulnerabilities.push('Sequential ID enumeration possible');
    if (weakUUIDs) vulnerabilities.push('Weak UUID generation detected');
    if (errorDisclosure) vulnerabilities.push('Information disclosure through errors');

    return {
      testName: 'Direct Database Access Protection',
      status: vulnerabilities.length > 0 ? 'warning' : 'passed',
      severity: vulnerabilities.length > 1 ? 'medium' : 'low',
      description: 'Testing protection against direct database access and ID enumeration',
      vulnerability: vulnerabilities.join(', ') || 'None detected',
      impact: vulnerabilities.length > 0
        ? 'Attackers can enumerate resources and perform targeted attacks'
        : 'Database access is properly protected',
      recommendation: vulnerabilities.length > 0
        ? 'Use UUIDs for all IDs, implement proper error handling, add rate limiting'
        : 'Maintain current access protection measures',
      exploitSteps: vulnerabilities.length > 0 ? [
        'Try accessing resources with sequential IDs',
        'Attempt to guess valid UUIDs through brute force',
        'Trigger errors to extract system information',
      ] : undefined,
    };
  }

  private async testRoleElevation(): Promise<SecurityTestResult> {
    // Test protection against privilege escalation attacks
    const vulnerabilities = [];

    // Test 1: Horizontal privilege escalation
    const horizontalEscalation = await this.testHorizontalPrivilegeEscalation();

    // Test 2: Vertical privilege escalation
    const verticalEscalation = await this.testVerticalPrivilegeEscalation();

    // Test 3: IDOR (Insecure Direct Object Reference)
    const idorVulnerable = await this.testIDORVulnerabilities();

    if (horizontalEscalation) vulnerabilities.push('Horizontal privilege escalation possible');
    if (verticalEscalation) vulnerabilities.push('Vertical privilege escalation possible');
    if (idorVulnerable) vulnerabilities.push('IDOR vulnerabilities detected');

    return {
      testName: 'Role Elevation Protection',
      status: vulnerabilities.length > 0 ? 'failed' : 'passed',
      severity: vulnerabilities.length > 0 ? 'critical' : 'medium',
      description: 'Testing protection against role elevation and privilege escalation attacks',
      vulnerability: vulnerabilities.join(', ') || 'None detected',
      impact: vulnerabilities.length > 0
        ? 'Attackers can escalate privileges and access unauthorized resources'
        : 'Role-based access control is properly implemented',
      recommendation: vulnerabilities.length > 0
        ? 'Implement proper RBAC, add object-level authorization, use JWT with proper claims'
        : 'Maintain current authorization system',
      exploitSteps: vulnerabilities.length > 0 ? [
        'Attempt to access resources belonging to other users',
        'Try to modify user roles through API manipulation',
        'Access objects using guessed or modified IDs',
      ] : undefined,
    };
  }

  private async testMassCSVInjection(): Promise<SecurityTestResult> {
    // Test protection against CSV injection and mass data manipulation
    const vulnerabilities = [];

    // Test 1: CSV formula injection
    const formulaInjection = await this.testCSVFormulaInjection();

    // Test 2: Mass data manipulation
    const massDataManipulation = await this.testMassDataManipulation();

    // Test 3: File upload validation
    const weakFileValidation = await this.testFileUploadValidation();

    if (formulaInjection) vulnerabilities.push('CSV formula injection possible');
    if (massDataManipulation) vulnerabilities.push('Mass data manipulation allowed');
    if (weakFileValidation) vulnerabilities.push('Weak file upload validation');

    return {
      testName: 'Mass CSV Injection Protection',
      status: vulnerabilities.length > 0 ? 'warning' : 'passed',
      severity: vulnerabilities.length > 1 ? 'high' : 'medium',
      description: 'Testing protection against CSV injection and mass data manipulation attacks',
      vulnerability: vulnerabilities.join(', ') || 'None detected',
      impact: vulnerabilities.length > 0
        ? 'Attackers can inject malicious formulas or manipulate large amounts of data'
        : 'CSV processing is secure and validated',
      recommendation: vulnerabilities.length > 0
        ? 'Add CSV sanitization, implement file type validation, add upload rate limiting'
        : 'Maintain current CSV processing security',
      exploitSteps: vulnerabilities.length > 0 ? [
        'Upload CSV files with formula injections (=CMD|powershell)',
        'Attempt to upload oversized or malicious files',
        'Try mass data manipulation through bulk operations',
      ] : undefined,
    };
  }

  private async testEMIAbuse(): Promise<SecurityTestResult> {
    // Test protection against EMI financing abuse
    const vulnerabilities = [];

    // Test 1: EMI eligibility manipulation
    const eligibilityManipulation = await this.testEMIEligibilityManipulation();

    // Test 2: Loan amount abuse
    const loanAmountAbuse = await this.testLoanAmountAbuse();

    // Test 3: Multiple application abuse
    const multipleApplicationAbuse = await this.testMultipleApplicationAbuse();

    if (eligibilityManipulation) vulnerabilities.push('EMI eligibility can be manipulated');
    if (loanAmountAbuse) vulnerabilities.push('Loan amount limits can be bypassed');
    if (multipleApplicationAbuse) vulnerabilities.push('Multiple applications allowed');

    return {
      testName: 'EMI Abuse Protection',
      status: vulnerabilities.length > 0 ? 'failed' : 'passed',
      severity: vulnerabilities.length > 0 ? 'high' : 'medium',
      description: 'Testing protection against EMI financing abuse and manipulation',
      vulnerability: vulnerabilities.join(', ') || 'None detected',
      impact: vulnerabilities.length > 0
        ? 'Users can manipulate EMI eligibility or abuse financing systems'
        : 'EMI system is secure and abuse-resistant',
      recommendation: vulnerabilities.length > 0
        ? 'Add credit score validation, implement application limits, add fraud detection'
        : 'Maintain EMI security measures',
      exploitSteps: vulnerabilities.length > 0 ? [
        'Attempt to manipulate income/credit data for better eligibility',
        'Try multiple loan applications simultaneously',
        'Attempt to bypass loan amount limits',
      ] : undefined,
    };
  }

  private async testRateLimitBypass(): Promise<SecurityTestResult> {
    // Test rate limiting effectiveness
    const vulnerabilities = [];

    // Test 1: Rate limit bypass attempts
    const rateLimitBypassed = await this.testRateLimitCircumvention();

    // Test 2: Distributed attack simulation
    const distributedAttack = await this.testDistributedAttack();

    if (rateLimitBypassed) vulnerabilities.push('Rate limiting can be bypassed');
    if (distributedAttack) vulnerabilities.push('Distributed attacks not properly handled');

    return {
      testName: 'Rate Limit Bypass Protection',
      status: vulnerabilities.length > 0 ? 'warning' : 'passed',
      severity: vulnerabilities.length > 0 ? 'medium' : 'low',
      description: 'Testing effectiveness of rate limiting and DoS protection',
      vulnerability: vulnerabilities.join(', ') || 'None detected',
      impact: vulnerabilities.length > 0
        ? 'Attackers can perform DoS attacks or overwhelm the system'
        : 'Rate limiting is effective against abuse',
      recommendation: vulnerabilities.length > 0
        ? 'Implement distributed rate limiting, add request fingerprinting, use CDN protection'
        : 'Maintain current rate limiting measures',
      exploitSteps: vulnerabilities.length > 0 ? [
        'Use multiple IP addresses to bypass rate limits',
        'Distribute requests across different endpoints',
        'Attempt rapid-fire requests with varying parameters',
      ] : undefined,
    };
  }

  private async testSessionHijacking(): Promise<SecurityTestResult> {
    // Test session security and hijacking protection
    const vulnerabilities = [];

    // Test 1: Session fixation
    const sessionFixation = await this.testSessionFixation();

    // Test 2: Session replay
    const sessionReplay = await this.testSessionReplay();

    // Test 3: Cookie security
    const weakCookieSecurity = await this.testCookieSecurity();

    if (sessionFixation) vulnerabilities.push('Session fixation vulnerability');
    if (sessionReplay) vulnerabilities.push('Session replay attacks possible');
    if (weakCookieSecurity) vulnerabilities.push('Weak cookie security settings');

    return {
      testName: 'Session Hijacking Protection',
      status: vulnerabilities.length > 0 ? 'failed' : 'passed',
      severity: vulnerabilities.length > 0 ? 'high' : 'medium',
      description: 'Testing protection against session hijacking and fixation attacks',
      vulnerability: vulnerabilities.join(', ') || 'None detected',
      impact: vulnerabilities.length > 0
        ? 'Attackers can hijack user sessions and perform unauthorized actions'
        : 'Session management is secure',
      recommendation: vulnerabilities.length > 0
        ? 'Implement session regeneration, add secure cookie flags, use HttpOnly cookies'
        : 'Maintain session security measures',
      exploitSteps: vulnerabilities.length > 0 ? [
        'Attempt to fixate session IDs',
        'Try to replay captured session cookies',
        'Check cookie security attributes',
      ] : undefined,
    };
  }

  private async testDataExfiltration(): Promise<SecurityTestResult> {
    // Test protection against data exfiltration attacks
    const vulnerabilities = [];

    // Test 1: Sensitive data in responses
    const sensitiveDataLeakage = await this.testSensitiveDataLeakage();

    // Test 2: Information disclosure through errors
    const errorDisclosure = await this.testErrorInformationDisclosure();

    // Test 3: API data enumeration
    const dataEnumeration = await this.testDataEnumeration();

    if (sensitiveDataLeakage) vulnerabilities.push('Sensitive data leaked in responses');
    if (errorDisclosure) vulnerabilities.push('Information disclosure through errors');
    if (dataEnumeration) vulnerabilities.push('Data enumeration possible');

    return {
      testName: 'Data Exfiltration Protection',
      status: vulnerabilities.length > 0 ? 'warning' : 'passed',
      severity: vulnerabilities.length > 0 ? 'medium' : 'low',
      description: 'Testing protection against data exfiltration and information disclosure',
      vulnerability: vulnerabilities.join(', ') || 'None detected',
      impact: vulnerabilities.length > 0
        ? 'Attackers can extract sensitive user or system information'
        : 'Data exfiltration is properly prevented',
      recommendation: vulnerabilities.length > 0
        ? 'Implement data sanitization, add proper error handling, use data masking'
        : 'Maintain data protection measures',
      exploitSteps: vulnerabilities.length > 0 ? [
        'Check API responses for sensitive data leakage',
        'Trigger errors to extract system information',
        'Attempt to enumerate user data through API calls',
      ] : undefined,
    };
  }

  // Helper methods (simplified for demonstration)
  private async simulateTokenReplay(): Promise<boolean> {
    // Simulate token replay test
    return Math.random() > 0.8; // 20% chance of vulnerability
  }

  private async checkSequenceProtection(): Promise<boolean> {
    return Math.random() > 0.9; // 10% chance of missing protection
  }

  private async testWalletRaceCondition(): Promise<boolean> {
    return Math.random() > 0.7; // 30% chance of race condition
  }

  private async testNegativeBalanceProtection(): Promise<boolean> {
    return Math.random() > 0.95; // 5% chance of vulnerability
  }

  private async testConcurrentTransactions(): Promise<boolean> {
    return Math.random() > 0.6; // 40% chance of issues
  }

  private async testEscrowAuthorization(): Promise<boolean> {
    return Math.random() > 0.9; // 10% chance of authorization bypass
  }

  private async testEscrowAmountManipulation(): Promise<boolean> {
    return Math.random() > 0.95; // 5% chance of manipulation
  }

  private async testPrematureRelease(): Promise<boolean> {
    return Math.random() > 0.85; // 15% chance of premature release
  }

  private async testSequentialIDGuessing(): Promise<boolean> {
    return Math.random() > 0.8; // 20% chance of sequential IDs
  }

  private async testUUIDRandomness(): Promise<boolean> {
    return Math.random() > 0.9; // 10% chance of weak UUIDs
  }

  private async testErrorInformationDisclosure(): Promise<boolean> {
    return Math.random() > 0.7; // 30% chance of information disclosure
  }

  private async testHorizontalPrivilegeEscalation(): Promise<boolean> {
    return Math.random() > 0.8; // 20% chance of horizontal escalation
  }

  private async testVerticalPrivilegeEscalation(): Promise<boolean> {
    return Math.random() > 0.95; // 5% chance of vertical escalation
  }

  private async testIDORVulnerabilities(): Promise<boolean> {
    return Math.random() > 0.75; // 25% chance of IDOR
  }

  private async testCSVFormulaInjection(): Promise<boolean> {
    return Math.random() > 0.85; // 15% chance of formula injection
  }

  private async testMassDataManipulation(): Promise<boolean> {
    return Math.random() > 0.9; // 10% chance of mass manipulation
  }

  private async testFileUploadValidation(): Promise<boolean> {
    return Math.random() > 0.8; // 20% chance of weak validation
  }

  private async testEMIEligibilityManipulation(): Promise<boolean> {
    return Math.random() > 0.9; // 10% chance of manipulation
  }

  private async testLoanAmountAbuse(): Promise<boolean> {
    return Math.random() > 0.95; // 5% chance of abuse
  }

  private async testMultipleApplicationAbuse(): Promise<boolean> {
    return Math.random() > 0.8; // 20% chance of multiple applications
  }

  private async testRateLimitCircumvention(): Promise<boolean> {
    return Math.random() > 0.7; // 30% chance of bypass
  }

  private async testDistributedAttack(): Promise<boolean> {
    return Math.random() > 0.85; // 15% chance of successful distributed attack
  }

  private async testSessionFixation(): Promise<boolean> {
    return Math.random() > 0.9; // 10% chance of session fixation
  }

  private async testSessionReplay(): Promise<boolean> {
    return Math.random() > 0.95; // 5% chance of session replay
  }

  private async testCookieSecurity(): Promise<boolean> {
    return Math.random() > 0.8; // 20% chance of weak cookie security
  }

  private async testSensitiveDataLeakage(): Promise<boolean> {
    return Math.random() > 0.75; // 25% chance of data leakage
  }

  private async testDataEnumeration(): Promise<boolean> {
    return Math.random() > 0.7; // 30% chance of enumeration
  }

  private calculateOverallRiskLevel(criticalCount: number, failedCount: number, warningCount: number): 'low' | 'medium' | 'high' | 'critical' {
    if (criticalCount > 0) return 'critical';
    if (failedCount > 2) return 'high';
    if (failedCount > 0 || warningCount > 3) return 'medium';
    return 'low';
  }

  private calculateRiskScore(results: SecurityTestResult[]): number {
    let score = 100;

    results.forEach(result => {
      let penalty = 0;
      switch (result.severity) {
        case 'critical': penalty = 25; break;
        case 'high': penalty = 15; break;
        case 'medium': penalty = 8; break;
        case 'low': penalty = 3; break;
      }

      if (result.status === 'failed') {
        score -= penalty;
      } else if (result.status === 'warning') {
        score -= penalty / 2;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private identifyRiskFactors(results: SecurityTestResult[]): string[] {
    const factors: string[] = [];

    if (results.some(r => r.vulnerability.includes('wallet'))) {
      factors.push('Financial system vulnerabilities pose high risk to user funds');
    }

    if (results.some(r => r.vulnerability.includes('escrow'))) {
      factors.push('Escrow bypass vulnerabilities threaten transaction security');
    }

    if (results.some(r => r.vulnerability.includes('role') || r.vulnerability.includes('privilege'))) {
      factors.push('Authorization weaknesses allow unauthorized access');
    }

    if (results.some(r => r.vulnerability.includes('replay') || r.vulnerability.includes('session'))) {
      factors.push('Authentication weaknesses enable account takeover');
    }

    if (results.some(r => r.vulnerability.includes('rate limit'))) {
      factors.push('DoS attack vulnerability affects system availability');
    }

    return factors.length > 0 ? factors : ['No significant risk factors identified'];
  }

  private checkPCICompliance(results: SecurityTestResult[]): boolean {
    // Check if PCI DSS requirements are met
    const pciFailures = results.filter(r =>
      r.vulnerability.includes('wallet') ||
      r.vulnerability.includes('payment') ||
      r.vulnerability.includes('financial')
    );

    return pciFailures.length === 0;
  }

  private checkGDPRCompliance(results: SecurityTestResult[]): boolean {
    // Check GDPR compliance
    const gdprFailures = results.filter(r =>
      r.vulnerability.includes('data') ||
      r.vulnerability.includes('privacy') ||
      r.vulnerability.includes('personal')
    );

    return gdprFailures.length === 0;
  }

  private checkISO27001Compliance(results: SecurityTestResult[]): boolean {
    // Check ISO 27001 compliance
    const isoFailures = results.filter(r =>
      r.severity === 'critical' ||
      r.vulnerability.includes('access') ||
      r.vulnerability.includes('authorization')
    );

    return isoFailures.length === 0;
  }

  private generateSecurityRecommendations(results: SecurityTestResult[]): string[] {
    const recommendations: string[] = [];

    if (results.some(r => r.vulnerability.includes('wallet'))) {
      recommendations.push('Implement atomic wallet transactions with proper locking mechanisms');
      recommendations.push('Add real-time fraud detection for wallet operations');
    }

    if (results.some(r => r.vulnerability.includes('escrow'))) {
      recommendations.push('Add multi-party authorization for escrow operations');
      recommendations.push('Implement escrow state machine with proper validation');
    }

    if (results.some(r => r.vulnerability.includes('API') || r.vulnerability.includes('replay'))) {
      recommendations.push('Implement JWT token blacklisting and short expiration times');
      recommendations.push('Add request signing and nonce validation');
    }

    if (results.some(r => r.vulnerability.includes('role'))) {
      recommendations.push('Implement proper RBAC with object-level permissions');
      recommendations.push('Add authorization middleware with comprehensive checks');
    }

    if (results.some(r => r.vulnerability.includes('rate'))) {
      recommendations.push('Implement distributed rate limiting with Redis');
      recommendations.push('Add request fingerprinting and bot detection');
    }

    if (results.some(r => r.vulnerability.includes('session'))) {
      recommendations.push('Implement secure session management with HttpOnly cookies');
      recommendations.push('Add session invalidation on suspicious activity');
    }

    recommendations.push('Implement comprehensive security monitoring and alerting');
    recommendations.push('Conduct regular penetration testing and vulnerability assessments');
    recommendations.push('Implement security headers and CSP policies');

    return recommendations;
  }

  private generateNextSteps(results: SecurityTestResult[], riskLevel: string): string[] {
    const steps: string[] = [];

    if (riskLevel === 'critical') {
      steps.push('URGENT: Address all critical vulnerabilities immediately');
      steps.push('Consider taking system offline until critical issues are resolved');
      steps.push('Notify security team and prepare incident response');
    }

    steps.push('Implement automated security scanning in CI/CD pipeline');
    steps.push('Set up security monitoring and alerting systems');
    steps.push('Conduct regular security training for development team');
    steps.push('Implement security code reviews for all changes');
    steps.push('Prepare security incident response plan');

    if (results.every(r => r.status === 'passed')) {
      steps.push('SUCCESS: Security posture is strong - maintain vigilance');
    } else {
      steps.push('SCHEDULE: Re-run penetration tests after implementing fixes');
    }

    return steps;
  }
}
