import { SecurityAuditUtil } from './utils/security-audit.util';

async function runSecurityAudit() {
  console.log('🔒 Running QuickBid Security Audit...');
  
  try {
    const auditResults = await SecurityAuditUtil.runSecurityAudit();
    
    console.log('\n📊 Security Audit Results:');
    console.log(`Security Score: ${auditResults.score}/100`);
    console.log(`Total Checks: ${auditResults.totalChecks}`);
    console.log(`Vulnerabilities Found: ${auditResults.vulnerabilities.length}`);
    
    if (auditResults.vulnerabilities.length > 0) {
      console.log('\n🚨 Vulnerabilities by Severity:');
      const critical = auditResults.vulnerabilities.filter(v => v.severity === 'CRITICAL');
      const high = auditResults.vulnerabilities.filter(v => v.severity === 'HIGH');
      const medium = auditResults.vulnerabilities.filter(v => v.severity === 'MEDIUM');
      const low = auditResults.vulnerabilities.filter(v => v.severity === 'LOW');
      
      if (critical.length > 0) {
        console.log(`\n🔴 Critical (${critical.length}):`);
        critical.forEach(v => console.log(`  - ${v.description}`));
      }
      
      if (high.length > 0) {
        console.log(`\n🟠 High (${high.length}):`);
        high.forEach(v => console.log(`  - ${v.description}`));
      }
      
      if (medium.length > 0) {
        console.log(`\n🟡 Medium (${medium.length}):`);
        medium.forEach(v => console.log(`  - ${v.description}`));
      }
      
      if (low.length > 0) {
        console.log(`\n🟢 Low (${low.length}):`);
        low.forEach(v => console.log(`  - ${v.description}`));
      }
    }
    
    // Generate full report
    const report = SecurityAuditUtil.generateSecurityReport(auditResults);
    console.log('\n📄 Full Security Report Generated');
    
    return auditResults;
  } catch (error) {
    console.error('❌ Security audit failed:', error);
    throw error;
  }
}

// Run the audit
runSecurityAudit().catch(console.error);
