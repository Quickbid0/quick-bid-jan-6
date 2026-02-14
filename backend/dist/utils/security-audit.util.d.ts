export declare class SecurityAuditUtil {
    private auditResults;
    static runSecurityAudit(): Promise<{
        vulnerabilities: Array<{
            severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
            category: string;
            description: string;
            recommendation: string;
        }>;
        score: number;
        totalChecks: number;
    }>;
    private checkEnvironmentVariables;
    private checkDependencies;
    private checkCodeSecurity;
    private checkApiSecurity;
    private checkDatabaseSecurity;
    private checkAuthenticationSecurity;
    private checkFilePermissions;
    private checkNetworkSecurity;
    private calculateSecurityScore;
    static generateSecurityReport(auditResults: any): string;
    private static getSecurityGrade;
}
