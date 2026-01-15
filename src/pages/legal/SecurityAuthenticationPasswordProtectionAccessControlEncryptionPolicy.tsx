import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const SecurityAuthenticationPasswordProtectionAccessControlEncryptionPolicy: React.FC = () => {
  usePageSEO({
    title:
      'Security, Authentication, Password Protection, Access Control & Encryption Policy | QuickMela',
    description:
      'Defines how security, authentication, password protection, access control, and encryption must be implemented across the QuickMela platform.',
    canonicalPath:
      '/legal/security-authentication-passwordprotection-accesscontrol-encryption-policy',
    robots: 'index,follow',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-primary-600">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link to="/legal" className="hover:text-primary-600">
              Legal
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 dark:text-gray-200">
            Security, Authentication, Password Protection, Access Control &amp; Encryption Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Security, Authentication, Password Protection, Access Control &amp; Encryption Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy defines how security must be implemented across the entire platform, covering authentication,
          access rules, encryption, password requirements, admin privileges, API protection, data transmission,
          monitoring, and security compliance.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>Protection from hacking</li>
          <li>Protection from unauthorized access</li>
          <li>Strong authentication</li>
          <li>Secure data handling</li>
          <li>Prevention of data breaches</li>
          <li>Secure admin operations</li>
          <li>Safe user accounts</li>
          <li>Protection of sensitive information</li>
          <li>Legal compliance (IT Act, DPDP Act, CERT-In Rules)</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>All users</li>
          <li>Sellers</li>
          <li>Buyers</li>
          <li>Delivery partners</li>
          <li>Agents</li>
          <li>Admins</li>
          <li>Moderators</li>
          <li>Developers</li>
          <li>Vendors</li>
          <li>Third-party integrations</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>Authentication</li>
          <li>Passwords</li>
          <li>Multi-factor security</li>
          <li>Admin access</li>
          <li>Encryption</li>
          <li>Data security</li>
          <li>Session management</li>
          <li>API keys</li>
          <li>Backups</li>
          <li>Audit logs</li>
        </ul>

        <h2>3. Authentication Requirements</h2>
        <h3>A. Mandatory Verification</h3>
        <p>Every user must complete:</p>
        <ul>
          <li>Mobile OTP verification</li>
          <li>Email verification (optional but recommended)</li>
        </ul>
        <h3>B. High-Risk Actions Require Re-Verification</h3>
        <p>Required for:</p>
        <ul>
          <li>High-value bids</li>
          <li>KYC updates</li>
          <li>Adding bank account</li>
          <li>Adding large wallet amounts</li>
          <li>Changing password</li>
          <li>Account recovery</li>
        </ul>
        <h3>C. Admins MUST Use Two-Factor Authentication (2FA)</h3>
        <p>Required for:</p>
        <ul>
          <li>Logging in</li>
          <li>Accessing dashboards</li>
          <li>Accessing sensitive records</li>
          <li>Manual payout approvals</li>
        </ul>
        <p>2FA may use:</p>
        <ul>
          <li>Auth app</li>
          <li>SMS OTP</li>
          <li>Hardware token (recommended)</li>
        </ul>

        <h2>4. Password Policy</h2>
        <h3>A. User Password Requirements</h3>
        <ul>
          <li>Minimum 8 characters</li>
          <li>At least 1 uppercase</li>
          <li>At least 1 lowercase</li>
          <li>At least 1 number</li>
          <li>No personal info inside password</li>
          <li>No simple sequences (e.g., 12345)</li>
        </ul>
        <h3>B. Admin Password Requirements</h3>
        <ul>
          <li>Minimum 12 characters</li>
          <li>Uppercase, lowercase, number, special character</li>
          <li>Cannot reuse past 5 passwords</li>
          <li>Must rotate every 90 days</li>
        </ul>
        <h3>C. Password Storage Rules</h3>
        <ul>
          <li>NEVER stored in plain text</li>
          <li>MUST use bcrypt/argon2 hashing</li>
          <li>Salt required</li>
          <li>No reversible encryption</li>
        </ul>
        <h3>D. Password Sharing Rules</h3>
        <ul>
          <li>Forbidden</li>
          <li>Admins cannot share with anyone</li>
          <li>Developers cannot ask for passwords</li>
          <li>Support cannot request passwords</li>
        </ul>

        <h2>5. Access Control Policy</h2>
        <p>Role-Based Access Control (RBAC) Required</p>
        <p>Each role has limited permissions:</p>
        <ul>
          <li>Buyer</li>
          <li>Seller</li>
          <li>Delivery partner</li>
          <li>Agent</li>
          <li>Moderator</li>
          <li>Admin</li>
          <li>Super Admin</li>
          <li>Compliance Officer</li>
          <li>Finance Officer</li>
        </ul>
        <p>Key Rules</p>
        <ul>
          <li>Users may only access what they need</li>
          <li>Admins have restricted views</li>
          <li>No employee may view full KYC unless in compliance team</li>
          <li>No one can modify critical logs</li>
          <li>No unauthorized access to backend databases</li>
        </ul>
        <p>Access Approval Flow</p>
        <ul>
          <li>Employee requests access</li>
          <li>Manager approves</li>
          <li>Security validates</li>
          <li>Access granted with audit trail</li>
        </ul>

        <h2>6. Admin Panel Security</h2>
        <p>Admin panel must have:</p>
        <ul>
          <li>IP whitelisting</li>
          <li>2FA</li>
          <li>Session timeout (max 10 mins idle)</li>
          <li>Device fingerprinting</li>
          <li>Login attempt rate-limiting</li>
          <li>Encrypted cookies</li>
          <li>Separate admin login URL</li>
          <li>Full audit logs</li>
        </ul>
        <p>Admins CANNOT:</p>
        <ul>
          <li>Export sensitive data</li>
          <li>Download user lists</li>
          <li>Access raw KYC photos (only compliance)</li>
          <li>Change auction winners</li>
          <li>Change wallet balances</li>
          <li>Modify logs</li>
        </ul>
        <p>Unauthorized access → immediate suspension.</p>

        <h2>7. Encryption Standards</h2>
        <p>Data in Transit</p>
        <ul>
          <li>TLS 1.2 or higher</li>
          <li>HTTPS only</li>
          <li>HSTS enabled</li>
          <li>No insecure HTTP endpoints</li>
        </ul>
        <p>Data at Rest</p>
        <ul>
          <li>AES-256 encryption</li>
          <li>Separate encryption keys for:</li>
        </ul>
        <ul>
          <li>KYC documents</li>
          <li>Payment tokens</li>
          <li>Sensitive logs</li>
        </ul>
        <p>API Secrets</p>
        <ul>
          <li>Must be stored in vault (e.g., AWS Secrets Manager)</li>
          <li>Must NOT be hardcoded</li>
          <li>Must NOT be shared in chat, email, Slack</li>
        </ul>

        <h2>8. Session Management Rules</h2>
        <ul>
          <li>Session auto-expiry after inactivity</li>
          <li>Sessions invalidated after password changes</li>
          <li>No multi-device login for admins</li>
          <li>Secure cookies only</li>
          <li>No token reuse</li>
          <li>All sessions logged</li>
          <li>Suspicious sessions auto-terminated</li>
        </ul>

        <h2>9. Anti-Bot &amp; Anti-Automation Security</h2>
        <p>Protection includes:</p>
        <ul>
          <li>Bot detection</li>
          <li>Device fingerprinting</li>
          <li>IP risk scoring</li>
          <li>Captcha for suspicious behaviour</li>
          <li>Behavioural analysis</li>
          <li>Rate-limiting</li>
          <li>Anti-scraping</li>
        </ul>
        <p>Bots blocked for:</p>
        <ul>
          <li>Auto-bidding</li>
          <li>Auto-listing</li>
          <li>Auto-login attempts</li>
        </ul>

        <h2>10. API Security Rules</h2>
        <ul>
          <li>API keys must be rotated</li>
          <li>API calls rate-limited</li>
          <li>Internal APIs must require auth</li>
          <li>No public exposure of sensitive endpoints</li>
          <li>Webhooks must be verified</li>
          <li>Use signed tokens (JWT) with expiry</li>
          <li>Unauthorized usage → blocked.</li>
        </ul>

        <h2>11. Security Monitoring Requirements</h2>
        <p>Monitored continuously:</p>
        <ul>
          <li>Login attempts</li>
          <li>Payment/API failures</li>
          <li>Suspicious device changes</li>
          <li>Data access patterns</li>
          <li>Admin actions</li>
          <li>Moderation actions</li>
          <li>Failed OTP attempts</li>
          <li>Wallet activity spikes</li>
        </ul>
        <p>Security alerts go to:</p>
        <ul>
          <li>Security Team</li>
          <li>Compliance Team</li>
          <li>CTO</li>
        </ul>
        <p>Critical alerts → auto-lockdown.</p>

        <h2>12. Data Breach Prevention</h2>
        <p>Includes:</p>
        <ul>
          <li>Vulnerability scans</li>
          <li>Penetration testing</li>
          <li>Secure code review</li>
          <li>Firewall rules</li>
          <li>Antivirus for servers</li>
          <li>Real-time intrusion detection</li>
          <li>Patch management</li>
          <li>Zero trust architecture</li>
        </ul>

        <h2>13. Backup Security</h2>
        <p>Backups must:</p>
        <ul>
          <li>Be encrypted</li>
          <li>Stored separately</li>
          <li>Access restricted</li>
          <li>Tested monthly</li>
          <li>Not contain unnecessary personal data</li>
          <li>Deleted users must be removed from future backups (where possible).</li>
        </ul>

        <h2>14. Physical Security</h2>
        <p>For office, yard, warehouse:</p>
        <ul>
          <li>CCTV mandatory</li>
          <li>Authorized entry only</li>
          <li>Visitor log maintenance</li>
          <li>No USB devices allowed</li>
          <li>No unsecured laptop access</li>
          <li>WiFi secured with WPA3</li>
        </ul>

        <h2>15. Employee Security Rules</h2>
        <p>Employees MUST:</p>
        <ul>
          <li>Lock devices</li>
          <li>Use company accounts (not personal)</li>
          <li>Not store data locally</li>
          <li>Not share screenshots of admin panels</li>
          <li>Not email sensitive data</li>
          <li>Attend mandatory security training</li>
        </ul>

        <h2>16. Incident Response &amp; Reporting</h2>
        <p>When suspicious activity occurs:</p>
        <ul>
          <li>System auto-detects &amp; flags</li>
          <li>Security team notified</li>
          <li>Threat investigated</li>
          <li>Affected systems isolated</li>
          <li>Impact assessed</li>
          <li>Users notified (if required)</li>
          <li>Patch deployed</li>
          <li>Full report created</li>
        </ul>
        <p>Must comply with CERT-In 6-hour reporting rule for major breaches.</p>

        <h2>17. Penalties for Security Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Data breach</td>
              <td>Legal action + termination</td>
            </tr>
            <tr>
              <td>Password sharing</td>
              <td>Suspension</td>
            </tr>
            <tr>
              <td>Hacking attempts</td>
              <td>FIR + permanent ban</td>
            </tr>
            <tr>
              <td>Unauthorized access</td>
              <td>Immediate termination</td>
            </tr>
            <tr>
              <td>Misusing admin tools</td>
              <td>Legal + job loss</td>
            </tr>
            <tr>
              <td>Exporting sensitive data</td>
              <td>Criminal charges</td>
            </tr>
            <tr>
              <td>Weak password usage</td>
              <td>Mandatory reset</td>
            </tr>
          </tbody>
        </table>

        <h2>18. Responsibilities</h2>
        <h3>Platform</h3>
        <ul>
          <li>Provide secure systems</li>
          <li>Implement encryption</li>
          <li>Fix vulnerabilities</li>
        </ul>
        <h3>Users</h3>
        <ul>
          <li>Protect their account</li>
          <li>Use strong passwords</li>
          <li>Not share OTP/password</li>
        </ul>
        <h3>Developers</h3>
        <ul>
          <li>Write secure code</li>
          <li>Follow best practices</li>
          <li>Avoid hardcoded keys</li>
        </ul>
        <h3>Admins</h3>
        <ul>
          <li>Use 2FA</li>
          <li>Follow access control rules</li>
        </ul>
        <h3>Security Team</h3>
        <ul>
          <li>Monitor risks</li>
          <li>Respond to incidents</li>
        </ul>
        <h3>Compliance</h3>
        <ul>
          <li>Enforce DPDP Act guidelines</li>
        </ul>

        <h2>19. Policy Updates</h2>
        <p>This security policy may be updated anytime for compliance or technology changes.</p>
      </article>
    </div>
  );
};

export default SecurityAuthenticationPasswordProtectionAccessControlEncryptionPolicy;
