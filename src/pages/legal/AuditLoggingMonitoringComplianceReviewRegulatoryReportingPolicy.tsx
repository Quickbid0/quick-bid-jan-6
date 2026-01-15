import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AuditLoggingMonitoringComplianceReviewRegulatoryReportingPolicy: React.FC = () => {
  usePageSEO({
    title:
      'Audit, Logging, Monitoring, Compliance Review & Regulatory Reporting Policy | QuickMela',
    description:
      'Governs how platform actions, payments, admin activities, fraud events, and logs are captured, stored, monitored, audited, and reported.',
    canonicalPath: '/legal/audit-logging-monitoring-compliancereview-regulatoryreporting-policy',
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
            Audit, Logging, Monitoring, Compliance Review &amp; Regulatory Reporting Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Audit, Logging, Monitoring, Compliance Review &amp; Regulatory Reporting Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy governs how all platform actions, payments, admin activities, fraud events, financial logs, and
          operational records are captured, stored, monitored, audited, and reported, ensuring transparency,
          accountability, and regulatory compliance.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>To ensure:</p>
        <ul>
          <li>Full transparency</li>
          <li>Reliable audit trails</li>
          <li>Zero manipulation</li>
          <li>Regulatory compliance</li>
          <li>Fraud detection</li>
          <li>System accountability</li>
          <li>Clear evidence for disputes</li>
          <li>Protection during legal investigations</li>
          <li>Trust from banks &amp; investors</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Buyers</li>
          <li>Sellers</li>
          <li>Delivery partners</li>
          <li>Yard staff</li>
          <li>Agents</li>
          <li>Admins</li>
          <li>Moderators</li>
          <li>Developers</li>
          <li>Compliance team</li>
          <li>Finance team</li>
        </ul>
        <p>Covers logs related to:</p>
        <ul>
          <li>Auctions</li>
          <li>Bids</li>
          <li>Payments</li>
          <li>Refunds</li>
          <li>Payouts</li>
          <li>Wallet activity</li>
          <li>KYC decisions</li>
          <li>Admin actions</li>
          <li>Fraud flags</li>
          <li>System alerts</li>
          <li>Errors</li>
          <li>API calls</li>
          <li>Notifications</li>
          <li>Delivery updates</li>
        </ul>

        <h2>3. Mandatory Audit Logging Requirements</h2>
        <p>The following actions MUST always be logged:</p>
        <h3>User Actions</h3>
        <ul>
          <li>Login / logout</li>
          <li>OTP requests</li>
          <li>Password changes</li>
          <li>KYC status changes</li>
          <li>Bidding</li>
          <li>Adding money to wallet</li>
          <li>Checkout attempts</li>
          <li>Refund requests</li>
        </ul>
        <h3>Seller Actions</h3>
        <ul>
          <li>Listing creation</li>
          <li>Listing edits</li>
          <li>Price changes</li>
          <li>Auction scheduling</li>
          <li>Withdrawals</li>
          <li>Delivery updates</li>
        </ul>
        <h3>Admin Actions (CRITICAL)</h3>
        <ul>
          <li>Login with IP</li>
          <li>Viewing sensitive data</li>
          <li>Every approval/rejection</li>
          <li>Listing takedowns</li>
          <li>Refund or payout approval</li>
          <li>KYC override</li>
          <li>User suspension</li>
          <li>Data export attempts</li>
        </ul>
        <h3>Platform Events</h3>
        <ul>
          <li>System errors</li>
          <li>API failures</li>
          <li>Payment gateway callbacks</li>
          <li>Suspicious user patterns</li>
          <li>Fraud flags</li>
          <li>Device/IP mismatches</li>
        </ul>

        <h2>4. Audit Log Immutability</h2>
        <p>Audit logs must be:</p>
        <ul>
          <li>Immutable</li>
          <li>Write-only</li>
          <li>Tamper-proof</li>
          <li>Cryptographically hashed</li>
          <li>Replicated to secure storage</li>
        </ul>
        <p>Admins CANNOT:</p>
        <ul>
          <li>Modify logs</li>
          <li>Delete logs</li>
          <li>Manipulate timestamps</li>
        </ul>
        <p>Violation → instant termination + legal action.</p>

        <h2>5. Log Retention Rules</h2>
        <table>
          <thead>
            <tr>
              <th>Log Type</th>
              <th>Retention</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Payment logs</td>
              <td>7–10 years</td>
            </tr>
            <tr>
              <td>Auction logs</td>
              <td>10 years</td>
            </tr>
            <tr>
              <td>KYC logs</td>
              <td>5–7 years</td>
            </tr>
            <tr>
              <td>Wallet logs</td>
              <td>Permanent</td>
            </tr>
            <tr>
              <td>Fraud investigation logs</td>
              <td>Permanent</td>
            </tr>
            <tr>
              <td>Admin activity logs</td>
              <td>10 years</td>
            </tr>
            <tr>
              <td>Error logs</td>
              <td>1–3 years</td>
            </tr>
            <tr>
              <td>API logs</td>
              <td>1 year</td>
            </tr>
            <tr>
              <td>Notification logs</td>
              <td>1 year</td>
            </tr>
          </tbody>
        </table>
        <p>Required by:</p>
        <ul>
          <li>IT Act</li>
          <li>RBI</li>
          <li>Payment gateways</li>
          <li>Legal compliance</li>
        </ul>

        <h2>6. Monitoring &amp; Alerting Rules</h2>
        <p>System must monitor:</p>
        <ul>
          <li>Login failure bursts</li>
          <li>Payment failures</li>
          <li>Suspicious bidding</li>
          <li>High wallet deposits</li>
          <li>Duplicate device detection</li>
          <li>Fraud clusters</li>
          <li>API abuse</li>
          <li>Data access spikes</li>
          <li>Admin misuse</li>
        </ul>
        <p>Alerts sent to:</p>
        <ul>
          <li>Security team</li>
          <li>Compliance</li>
          <li>CTO</li>
          <li>Founders (critical only)</li>
        </ul>
        <p>Response time:</p>
        <ul>
          <li>Critical: Immediate</li>
          <li>High: &lt;30 min</li>
          <li>Medium: &lt;4 hours</li>
          <li>Low: &lt;24 hours</li>
        </ul>

        <h2>7. Types of Audits Conducted</h2>
        <h3>A. Internal Audits</h3>
        <p>Performed by:</p>
        <ul>
          <li>Compliance team</li>
          <li>Finance team</li>
          <li>Security team</li>
        </ul>
        <p>Frequency:</p>
        <ul>
          <li>Weekly (fraud checks)</li>
          <li>Monthly (financial reconciliation)</li>
          <li>Quarterly (compliance audit)</li>
        </ul>
        <h3>B. External Audits</h3>
        <p>Performed by:</p>
        <ul>
          <li>Registered CA firm</li>
          <li>Security auditors</li>
          <li>DPIA (Data Protection Impact Assessment)</li>
          <li>Payment gateway annual audits</li>
          <li>Government (if required)</li>
        </ul>
        <p>Frequency:</p>
        <ul>
          <li>Annual mandatory</li>
          <li>Semi-annual recommended</li>
        </ul>
        <h3>C. Surprise Audits</h3>
        <p>Triggered when:</p>
        <ul>
          <li>Fraud detected</li>
          <li>Suspicious patterns appear</li>
          <li>Admin misuse suspected</li>
        </ul>

        <h2>8. Evidence Preservation Rules</h2>
        <p>All evidence must be stored securely:</p>
        <ul>
          <li>Photos</li>
          <li>Videos</li>
          <li>Logs</li>
          <li>Screenshots</li>
          <li>KYC</li>
          <li>Payment history</li>
          <li>Delivery proof</li>
        </ul>
        <p>Evidence used for:</p>
        <ul>
          <li>Disputes</li>
          <li>Fraud cases</li>
          <li>Police reports</li>
          <li>Compliance audits</li>
        </ul>
        <p>Retention: 5–10 years depending on case type.</p>

        <h2>9. Regulatory Reporting</h2>
        <p>Required by law for:</p>
        <ul>
          <li>FIU-IND (suspicious transactions)</li>
          <li>Payment failures (RBI escalation)</li>
          <li>CERT-In breach reporting within 6 hours</li>
          <li>DPDP Act data misuse reporting</li>
          <li>Cybercrime coordination for illegal items</li>
        </ul>
        <p>Reports handled by:</p>
        <ul>
          <li>Nodal Officer</li>
          <li>Grievance Officer</li>
          <li>Compliance Head</li>
        </ul>

        <h2>10. Admin &amp; Moderator Audit Accountability</h2>
        <p>Admins MUST:</p>
        <ul>
          <li>Log all actions</li>
          <li>Not edit data</li>
          <li>Not bypass approval systems</li>
          <li>Only act within roles</li>
        </ul>
        <p>Mistakes must be:</p>
        <ul>
          <li>Reported immediately</li>
          <li>Logged</li>
          <li>Corrected with audit trail</li>
        </ul>
        <p>Hidden actions → major violation.</p>

        <h2>11. API &amp; System Audit Requirements</h2>
        <p>API logs must include:</p>
        <ul>
          <li>Endpoint used</li>
          <li>IP</li>
          <li>Token/user ID</li>
          <li>Request body (except sensitive data)</li>
          <li>Response code</li>
          <li>Response time</li>
        </ul>
        <p>APIs must be:</p>
        <ul>
          <li>Rate-limited</li>
          <li>Secure</li>
          <li>Logged for 1 year</li>
        </ul>

        <h2>12. Fraud Audit Controls</h2>
        <p>Fraud auditors monitor:</p>
        <ul>
          <li>High-value transactions</li>
          <li>Rapid deposits/withdrawals</li>
          <li>Account linking</li>
          <li>Seller collusion</li>
          <li>Buyer collusion</li>
          <li>Admin bias patterns</li>
          <li>Multi-account clusters</li>
          <li>Suspicious refunds</li>
        </ul>
        <p>Fraud anomalies → case opened.</p>

        <h2>13. Data Integrity Checks</h2>
        <p>Daily/weekly checks for:</p>
        <ul>
          <li>Wrong balances</li>
          <li>Duplicate bids</li>
          <li>Missing payment entries</li>
          <li>Negative wallet values</li>
          <li>Unsynced logs</li>
          <li>Server time drift</li>
          <li>API inconsistencies</li>
        </ul>
        <p>Mismatch → corrected with full documentation.</p>

        <h2>14. Financial Reconciliation Rules</h2>
        <p>Finance team must reconcile:</p>
        <ul>
          <li>Payment gateway statements</li>
          <li>Wallet funds</li>
          <li>Refund logs</li>
          <li>Commission logs</li>
          <li>Seller payouts</li>
          <li>Delivery fees</li>
          <li>GST/tax deductions</li>
        </ul>
        <p>Frequency:</p>
        <ul>
          <li>Daily for wallets</li>
          <li>Weekly for payouts</li>
          <li>Monthly full reconciliation</li>
        </ul>

        <h2>15. Penalties for Audit &amp; Logging Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Altering logs</td>
              <td>Immediate termination + FIR</td>
            </tr>
            <tr>
              <td>Deleting audit records</td>
              <td>Criminal action</td>
            </tr>
            <tr>
              <td>Hiding suspicious transactions</td>
              <td>Escalation</td>
            </tr>
            <tr>
              <td>Admin misuse</td>
              <td>Device ban + legal</td>
            </tr>
            <tr>
              <td>Fake audit report</td>
              <td>Blacklisting</td>
            </tr>
            <tr>
              <td>Poor logging</td>
              <td>Warning → audit failure</td>
            </tr>
            <tr>
              <td>Not reporting breaches</td>
              <td>Legal penalty</td>
            </tr>
          </tbody>
        </table>

        <h2>16. Responsibilities</h2>
        <h3>Platform</h3>
        <ul>
          <li>Maintain audit system</li>
          <li>Ensure transparency</li>
          <li>Provide secure logs</li>
        </ul>
        <h3>Admins</h3>
        <ul>
          <li>Follow logging rules</li>
          <li>Not bypass process</li>
        </ul>
        <h3>Compliance</h3>
        <ul>
          <li>Conduct regular audits</li>
          <li>Report issues</li>
        </ul>
        <h3>Finance</h3>
        <ul>
          <li>Reconcile all transactions</li>
        </ul>
        <h3>Developers</h3>
        <ul>
          <li>Implement logging standards</li>
        </ul>
        <h3>Security Team</h3>
        <ul>
          <li>Monitor alerts</li>
          <li>Investigate anomalies</li>
        </ul>

        <h2>17. Policy Updates</h2>
        <p>This audit/logging policy may be updated anytime for compliance and regulatory changes.</p>
      </article>
    </div>
  );
};

export default AuditLoggingMonitoringComplianceReviewRegulatoryReportingPolicy;
