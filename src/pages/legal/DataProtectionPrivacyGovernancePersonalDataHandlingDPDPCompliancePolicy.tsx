import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const DataProtectionPrivacyGovernancePersonalDataHandlingDPDPCompliancePolicy: React.FC = () => {
  usePageSEO({
    title:
      'Data Protection, Privacy Governance, Personal Data Handling & DPDP Act Compliance Policy | QuickMela',
    description:
      'Ensures full compliance with India’s DPDP Act 2023 and global best practices for personal data protection, privacy governance, and secure handling.',
    canonicalPath:
      '/legal/dataprotection-privacygovernance-personaldatahandling-dpdpcompliance-policy',
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
            Data Protection, Privacy Governance, Personal Data Handling &amp; DPDP Act Compliance Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Data Protection, Privacy Governance, Personal Data Handling &amp; DPDP Act Compliance Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy ensures full compliance with India’s Digital Personal Data Protection Act (DPDP Act 2023) and
          global best practices for privacy and security.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>To ensure:</p>
        <ul>
          <li>Protection of personal data</li>
          <li>Compliance with DPDP Act</li>
          <li>Privacy-first handling across platform</li>
          <li>Safe storage, sharing &amp; processing</li>
          <li>Transparent data usage</li>
          <li>Prevention of misuse</li>
          <li>User trust and security</li>
          <li>Minimizing legal liabilities</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Buyers</li>
          <li>Sellers</li>
          <li>Delivery partners</li>
          <li>Agents</li>
          <li>Yard staff</li>
          <li>Admins</li>
          <li>Support team</li>
          <li>Vendors</li>
          <li>Third-party integrations</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>Personal Data</li>
          <li>Sensitive Personal Data</li>
          <li>KYC documents</li>
          <li>Payment data</li>
          <li>Device/IP data</li>
          <li>Location data</li>
          <li>Communication logs</li>
          <li>Transaction history</li>
          <li>Chat &amp; call recordings (if used)</li>
        </ul>

        <h2>3. Personal Data We Collect</h2>
        <h3>A. Identity Data</h3>
        <ul>
          <li>Name</li>
          <li>Phone number</li>
          <li>Email</li>
          <li>Government IDs (PAN/Aadhaar/Passport/DL)</li>
          <li>Selfie photo</li>
          <li>Liveliness video</li>
        </ul>
        <h3>B. Contact Data</h3>
        <ul>
          <li>Address</li>
          <li>City</li>
          <li>Pincode</li>
        </ul>
        <h3>C. Financial Data</h3>
        <ul>
          <li>Bank account</li>
          <li>UPI ID</li>
          <li>Payment method details</li>
        </ul>
        <h3>D. Technical Data</h3>
        <ul>
          <li>Device ID</li>
          <li>IP address</li>
          <li>Location (approx, not precise)</li>
          <li>OS &amp; browser data</li>
        </ul>
        <h3>E. Transaction Data</h3>
        <ul>
          <li>Wallet logs</li>
          <li>Payment logs</li>
          <li>Auction activity</li>
          <li>Delivery logs</li>
        </ul>
        <h3>F. Communication Data</h3>
        <ul>
          <li>Chats</li>
          <li>Support messages</li>
          <li>Emails</li>
          <li>In-app voice/video (if any)</li>
        </ul>

        <h2>4. Principles of Data Processing (DPDP Act)</h2>
        <p>We follow:</p>
        <ul>
          <li>Consent First</li>
          <li>Purpose Limitation</li>
          <li>Data Minimization</li>
          <li>Lawful Use</li>
          <li>Accuracy</li>
          <li>Storage Limitation</li>
          <li>Integrity &amp; Security</li>
          <li>Transparency</li>
        </ul>

        <h2>5. How Data is Used</h2>
        <p>Data is used ONLY for:</p>
        <ul>
          <li>KYC verification</li>
          <li>Auction eligibility</li>
          <li>Fraud prevention</li>
          <li>Personalization</li>
          <li>Payments &amp; refunds</li>
          <li>Delivery</li>
          <li>Disputes</li>
          <li>Customer support</li>
          <li>Legal compliance</li>
          <li>Account safety</li>
        </ul>
        <p>We DO NOT:</p>
        <ul>
          <li>Sell data</li>
          <li>Trade data</li>
          <li>Share for advertising without permission</li>
          <li>Share privately with other users</li>
        </ul>

        <h2>6. Data Sharing Rules (Strict)</h2>
        <p>Data shared ONLY with:</p>
        <ul>
          <li>KYC provider</li>
          <li>Payment gateway</li>
          <li>SMS/Email/WhatsApp provider</li>
          <li>Delivery partners (address only)</li>
          <li>Law enforcement (authorized)</li>
          <li>Vendors under NDA + DPA</li>
        </ul>
        <p>We NEVER share:</p>
        <ul>
          <li>Full KYC documents with delivery partners</li>
          <li>Bank details with sellers</li>
          <li>Personal data with advertisers</li>
          <li>Unnecessary data with vendors</li>
        </ul>

        <h2>7. Data Storage &amp; Encryption</h2>
        <p>At rest:</p>
        <ul>
          <li>AES-256 encryption</li>
          <li>Separate tables for sensitive data</li>
        </ul>
        <p>In transit:</p>
        <ul>
          <li>HTTPS/TLS 1.2+</li>
        </ul>
        <p>Backups:</p>
        <ul>
          <li>Encrypted</li>
          <li>Stored separately</li>
          <li>Access restricted</li>
        </ul>
        <p>Production storage:</p>
        <ul>
          <li>Access controlled by permissions</li>
          <li>No developer access</li>
          <li>No external access</li>
        </ul>

        <h2>8. KYC Storage &amp; Retention Policy</h2>
        <p>KYC is:</p>
        <ul>
          <li>Stored encrypted</li>
          <li>Accessible only to compliance team</li>
          <li>Reviewed for fraud detection</li>
          <li>NOT visible to support staff</li>
          <li>NOT shared externally</li>
        </ul>
        <p>Retention:</p>
        <ul>
          <li>Active users → retained</li>
          <li>Deleted users → destroyed after 90 days (unless legal hold)</li>
        </ul>

        <h2>9. Payment &amp; Financial Data Protection</h2>
        <p>We follow:</p>
        <ul>
          <li>PCI-DSS</li>
          <li>RBI guidelines</li>
          <li>DPDP Act rules</li>
        </ul>
        <p>We DO NOT store:</p>
        <ul>
          <li>Full card numbers</li>
          <li>CVVs</li>
          <li>Sensitive banking data</li>
        </ul>
        <p>Payment data handled ONLY by payment gateways.</p>

        <h2>10. User Consent Management</h2>
        <p>We collect explicit consent for:</p>
        <ul>
          <li>Account creation</li>
          <li>KYC</li>
          <li>Payment processing</li>
          <li>Notifications</li>
          <li>Location usage</li>
          <li>Data analytics (anonymized)</li>
        </ul>
        <p>Users can:</p>
        <ul>
          <li>Withdraw consent for non-essential uses</li>
          <li>Request deletion</li>
          <li>Request correction</li>
        </ul>

        <h2>11. User Rights (DPDP Act 2023)</h2>
        <p>Users have rights to:</p>
        <ul>
          <li>Access their personal data</li>
          <li>Correct inaccurate data</li>
          <li>Delete their account/data</li>
          <li>Withdraw consent</li>
          <li>Know what is being collected</li>
          <li>Know why it is being used</li>
          <li>File grievances</li>
          <li>Get portability (future feature)</li>
        </ul>

        <h2>12. Data Deletion Rules</h2>
        <p>When user requests deletion:</p>
        <ul>
          <li>Account closed</li>
          <li>Personal data removed</li>
          <li>KYC wiped after legal retention</li>
          <li>Wallet logs anonymized</li>
          <li>Logs preserved (not personal)</li>
          <li>Backup cleanup after 90 days</li>
        </ul>
        <p>Cannot delete:</p>
        <ul>
          <li>Data under legal investigation</li>
          <li>Fraud-related logs</li>
        </ul>

        <h2>13. Data Breach Response Policy</h2>
        <p>If breach detected:</p>
        <ul>
          <li>Immediate containment</li>
          <li>Block suspicious activity</li>
          <li>Notify internal security team</li>
          <li>Investigate vulnerability</li>
          <li>Inform affected users</li>
          <li>Notify authorities (if required)</li>
          <li>Apply patch</li>
          <li>Log entire incident</li>
        </ul>
        <p>Response within 72 hours.</p>

        <h2>14. Third-Party Vendor Rules</h2>
        <p>Vendors must:</p>
        <ul>
          <li>Sign NDA</li>
          <li>Sign DPA (Data Processing Agreement)</li>
          <li>Follow security standards</li>
          <li>Not store platform data offline</li>
          <li>Delete data when contract ends</li>
          <li>Use encrypted channels</li>
        </ul>
        <p>Violations → immediate termination.</p>

        <h2>15. Sensitive Data Handling Rules</h2>
        <p>Sensitive data includes:</p>
        <ul>
          <li>KYC</li>
          <li>Bank numbers</li>
          <li>UPI IDs</li>
          <li>OTPs</li>
          <li>Address details</li>
        </ul>
        <p>Rules:</p>
        <ul>
          <li>Mask wherever possible</li>
          <li>Never shown in admin dashboards fully</li>
          <li>Accessible only with audit logs</li>
          <li>Not stored in logs</li>
          <li>Not shared outside India (unless legal)</li>
        </ul>

        <h2>16. Children’s Privacy Rules</h2>
        <p>Platform meant for 18+ only.</p>
        <p>If minor detected:</p>
        <ul>
          <li>Account deleted instantly</li>
          <li>KYC rejected</li>
          <li>No participation allowed</li>
        </ul>

        <h2>17. Data Access Control</h2>
        <p>Only authorized roles may access:</p>
        <ul>
          <li>Compliance team → KYC</li>
          <li>Finance → payout logs</li>
          <li>Support → limited profile view</li>
          <li>Fraud team → risk patterns</li>
          <li>DevOps → encrypted logs (no personal data)</li>
          <li>CTO → audit-level access</li>
        </ul>
        <p>All access logged &amp; auditable.</p>

        <h2>18. Data Retention Schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Data Type</th>
              <th>Retention</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Personal data</td>
              <td>Until account deletion</td>
            </tr>
            <tr>
              <td>KYC data</td>
              <td>5–7 years (legal requirement)</td>
            </tr>
            <tr>
              <td>Payment logs</td>
              <td>7–10 years</td>
            </tr>
            <tr>
              <td>Auction logs</td>
              <td>10 years</td>
            </tr>
            <tr>
              <td>Chat logs</td>
              <td>2 years</td>
            </tr>
            <tr>
              <td>Delivery logs</td>
              <td>2 years</td>
            </tr>
            <tr>
              <td>Fraud evidence</td>
              <td>Permanent</td>
            </tr>
            <tr>
              <td>System logs</td>
              <td>1–3 years</td>
            </tr>
          </tbody>
        </table>

        <h2>19. Data Minimization Requirements</h2>
        <p>We collect ONLY what is needed.</p>
        <p>Not collected:</p>
        <ul>
          <li>Contacts</li>
          <li>SMS</li>
          <li>Clipboard</li>
          <li>Exact GPS</li>
          <li>Health data</li>
          <li>Background mic</li>
          <li>Private files</li>
        </ul>
        <p>Only essential data allowed.</p>

        <h2>20. Penalties for Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Unauthorized data access</td>
              <td>Termination</td>
            </tr>
            <tr>
              <td>Sharing data illegally</td>
              <td>FIR + DPDP penalties</td>
            </tr>
            <tr>
              <td>Mishandling KYC</td>
              <td>Immediate firing</td>
            </tr>
            <tr>
              <td>Failing to secure system</td>
              <td>CTO audit</td>
            </tr>
            <tr>
              <td>Vendor breach</td>
              <td>Legal + contract termination</td>
            </tr>
            <tr>
              <td>Logging sensitive data</td>
              <td>Disciplinary action</td>
            </tr>
            <tr>
              <td>Data leak concealment</td>
              <td>Criminal charges</td>
            </tr>
            <tr>
              <td>Using personal data for personal use</td>
              <td>FIR</td>
            </tr>
          </tbody>
        </table>

        <h2>21. Responsibilities</h2>
        <h3>Platform</h3>
        <ul>
          <li>Protect all data</li>
          <li>Implement encryption</li>
          <li>Comply with laws</li>
          <li>Ensure transparency</li>
        </ul>
        <h3>Users</h3>
        <ul>
          <li>Provide correct data</li>
          <li>Protect their account</li>
          <li>Avoid sharing OTPs</li>
        </ul>
        <h3>Compliance</h3>
        <ul>
          <li>Review data practices</li>
          <li>Handle legal requests</li>
        </ul>
        <h3>Security Team</h3>
        <ul>
          <li>Monitor threats</li>
          <li>Patch vulnerabilities</li>
        </ul>
        <h3>Developers</h3>
        <ul>
          <li>Write privacy-safe code</li>
          <li>Avoid storing unnecessary data</li>
        </ul>
        <h3>Vendors</h3>
        <ul>
          <li>Follow the DPA</li>
          <li>Protect accessed data</li>
        </ul>

        <h2>22. Policy Updates</h2>
        <p>Platform may update this privacy policy anytime.</p>
        <p>Updated versions appear under the Legal section.</p>
      </article>
    </div>
  );
};

export default DataProtectionPrivacyGovernancePersonalDataHandlingDPDPCompliancePolicy;
