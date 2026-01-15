import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AuditLogsMonitoringEvidencePreservationAdminAccountabilityPolicy: React.FC = () => {
  usePageSEO({
    title: 'Audit Logs, Monitoring, Evidence Preservation & Admin Accountability Policy | QuickMela',
    description:
      'How QuickMela/Tekvoro logs, preserves, monitors, and audits critical actions for safety, compliance, fraud detection, and legal investigations.',
    canonicalPath: '/legal/auditlogs-monitoring-evidencepreservation-adminaccountability-policy',
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
            Audit Logs, Monitoring, Evidence Preservation &amp; Admin Accountability Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Audit Logs, Monitoring, Evidence Preservation &amp; Admin Accountability Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This governs how ALL critical user, admin, financial, and system actions must be logged, preserved, monitored,
          and audited for safety, compliance, fraud detection, and legal investigations.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>100% traceability</li>
          <li>No hidden admin actions</li>
          <li>No data tampering</li>
          <li>Reliable forensic evidence</li>
          <li>Compliance with DPDP Act, IT Act, FIU-IND</li>
          <li>Secure accountability for platform integrity</li>
          <li>Full visibility into risky operations</li>
          <li>Preventing insider manipulation</li>
        </ul>
        <p>It protects:</p>
        <ul>
          <li>Buyers &amp; sellers</li>
          <li>Money, wallets, payments</li>
          <li>Auctions</li>
          <li>Payouts</li>
          <li>KYC data</li>
          <li>All internal workflows</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>All admins</li>
          <li>Moderators</li>
          <li>Developers</li>
          <li>DevOps</li>
          <li>Support team</li>
          <li>Compliance officers</li>
          <li>Fraud team</li>
          <li>Automated systems</li>
          <li>Payment &amp; wallet flows</li>
          <li>KYC flows</li>
          <li>Auction engine</li>
          <li>User communication</li>
          <li>Delivery partner operations</li>
        </ul>
        <p>Covers logs for:</p>
        <ul>
          <li>Actions</li>
          <li>Events</li>
          <li>Errors</li>
          <li>Security alerts</li>
          <li>Access trails</li>
          <li>Data downloads</li>
          <li>API calls</li>
          <li>Payment processing</li>
          <li>Device/IP changes</li>
        </ul>

        <h2>3. What Must Be Logged (Mandatory)</h2>
        <h3>A. User Actions</h3>
        <ul>
          <li>Login/logout</li>
          <li>Device changes</li>
          <li>IP changes</li>
          <li>Password change</li>
          <li>KYC upload</li>
          <li>Bid placement</li>
          <li>Wallet load</li>
          <li>Refund request</li>
          <li>Auction participation</li>
          <li>Profile edits</li>
          <li>Delivery confirmation</li>
        </ul>
        <h3>B. Admin Actions</h3>
        <ul>
          <li>Viewing user details</li>
          <li>Editing user data</li>
          <li>Approving/disapproving KYC</li>
          <li>Freezing accounts</li>
          <li>Changing auction settings</li>
          <li>Viewing seller documents</li>
          <li>Updating payouts</li>
          <li>Approving refunds</li>
          <li>Accessing logs</li>
          <li>Unlocking wallets</li>
          <li>Modifying delivery assignments</li>
        </ul>
        <h3>C. System Events</h3>
        <ul>
          <li>Auction engine failures</li>
          <li>Payment errors</li>
          <li>Database errors</li>
          <li>Fraud detection triggers</li>
          <li>AI risk score spikes</li>
          <li>Suspicious pattern alerts</li>
          <li>Websocket disconnection anomalies</li>
        </ul>
        <h3>D. Security Events</h3>
        <ul>
          <li>Failed login attempts</li>
          <li>Suspicious IP</li>
          <li>Firewall triggers</li>
          <li>Rooted device detection</li>
          <li>Multiple account link detection</li>
          <li>Bot activity</li>
        </ul>
        <p>All logs are immutable.</p>

        <h2>4. Log Storage &amp; Integrity Rules</h2>
        <h3>A. Logs MUST be:</h3>
        <ul>
          <li>Encrypted</li>
          <li>Tamper-proof</li>
          <li>Write-only</li>
          <li>Hashed</li>
          <li>Timestamped</li>
          <li>Access-controlled</li>
        </ul>
        <h3>B. Logs CANNOT be:</h3>
        <ul>
          <li>Edited</li>
          <li>Deleted</li>
          <li>Overwritten</li>
          <li>Modified by staff</li>
          <li>Exported without approval</li>
        </ul>
        <h3>C. Storage Location</h3>
        <ul>
          <li>Primary log store</li>
          <li>Secondary backup region</li>
          <li>Long-term archive (AWS Glacier-like)</li>
        </ul>
        <p>Logs maintained for minimum 10 years.</p>

        <h2>5. Evidence Preservation Policy</h2>
        <p>Evidence includes:</p>
        <ul>
          <li>Chat logs</li>
          <li>Voice/video recordings (if used)</li>
          <li>Images &amp; disputes</li>
          <li>KYC documents</li>
          <li>Payment logs</li>
          <li>Auction histories</li>
          <li>Device/IP records</li>
          <li>Screen recordings (user-provided)</li>
          <li>App crash logs</li>
          <li>Suspicious activity logs</li>
        </ul>
        <p>Evidence preserved:</p>
        <ul>
          <li>During disputes</li>
          <li>During fraud investigations</li>
          <li>For law enforcement requests</li>
          <li>For AML/financial audits</li>
        </ul>
        <p>Evidence CANNOT be deleted until:</p>
        <ul>
          <li>Investigation closed</li>
          <li>Compliance approval given</li>
        </ul>

        <h2>6. Admin Accountability Controls</h2>
        <p>Admin actions must be:</p>
        <ul>
          <li>Logged</li>
          <li>Reviewed</li>
          <li>Verified</li>
          <li>Escalated for anomalies</li>
        </ul>
        <h3>6.1 Admin Levels</h3>
        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>L1 Support</td>
              <td>Tickets, basic read-only</td>
            </tr>
            <tr>
              <td>L2 Support</td>
              <td>Restricted edits (non-critical)</td>
            </tr>
            <tr>
              <td>Senior Support</td>
              <td>Refund review + freeze users</td>
            </tr>
            <tr>
              <td>Compliance</td>
              <td>KYC, AML, risk controls</td>
            </tr>
            <tr>
              <td>Finance</td>
              <td>Payouts, settlement logs</td>
            </tr>
            <tr>
              <td>Fraud Team</td>
              <td>Suspicious activity, blocks</td>
            </tr>
            <tr>
              <td>DevOps</td>
              <td>Infra logs, deployments</td>
            </tr>
            <tr>
              <td>CTO</td>
              <td>Full access (with audit)</td>
            </tr>
            <tr>
              <td>CEO</td>
              <td>Observation only</td>
            </tr>
          </tbody>
        </table>
        <p>Admins CANNOT:</p>
        <ul>
          <li>Delete logs</li>
          <li>Edit logs</li>
          <li>Change evidence</li>
          <li>Change user balances</li>
          <li>Manipulate auction results</li>
        </ul>
        <p>Any attempt &rarr; automatic firing + legal case.</p>

        <h2>7. Restricted Access Rules</h2>
        <p>Admins must NEVER access:</p>
        <ul>
          <li>KYC photos without case reason</li>
          <li>Bank details without AML need</li>
          <li>Wallet balance changes directly</li>
          <li>User chats unless user reports / dispute</li>
          <li>Private recordings</li>
          <li>Delivery location unless needed</li>
        </ul>
        <p>Violation &rarr; violation of privacy + termination.</p>

        <h2>8. Monitoring &amp; Auto-Flagging</h2>
        <p>AI automatically flags:</p>
        <ul>
          <li>Multiple admins checking same user</li>
          <li>Too many refund approvals</li>
          <li>Repeated payout changes</li>
          <li>Admin logging in from strange IP</li>
          <li>Admin accessing KYC from home network</li>
          <li>Unusual data exports</li>
          <li>High-number auction edits</li>
          <li>Repeated user freeze actions</li>
          <li>Unauthorized access attempts</li>
        </ul>
        <p>Flag levels:</p>
        <ul>
          <li>Yellow = suspicious</li>
          <li>Orange = high-risk</li>
          <li>Red = critical &rarr; immediate freeze</li>
        </ul>

        <h2>9. Restricted Tools &amp; Privileged Access</h2>
        <p>Privileged tools include:</p>
        <ul>
          <li>Payout override</li>
          <li>Auction time extension</li>
          <li>KYC manual override</li>
          <li>Wallet unlock</li>
          <li>Account freeze</li>
          <li>Delivery move</li>
          <li>Refund approval</li>
          <li>Role upgrade/downgrade</li>
        </ul>
        <p>These require:</p>
        <ul>
          <li>2-step approval</li>
          <li>MFA</li>
          <li>Role + reason logging</li>
          <li>Automatic system alert</li>
        </ul>

        <h2>10. User Data Export Controls</h2>
        <p>Exports allowed ONLY when:</p>
        <ul>
          <li>For legal cases</li>
          <li>For regulatory audits</li>
          <li>For law enforcement</li>
          <li>With CTO or Compliance approval</li>
        </ul>
        <p>Forbidden:</p>
        <ul>
          <li>Exporting for marketing</li>
          <li>Exporting for personal use</li>
          <li>Exporting for vendor without DPA</li>
          <li>Exporting to personal email</li>
        </ul>

        <h2>11. Developer &amp; DevOps Logging Rules</h2>
        <p>DevOps logs:</p>
        <ul>
          <li>Deployment history</li>
          <li>Build pipelines</li>
          <li>Configuration changes</li>
          <li>Server restarts</li>
          <li>Database migrations</li>
          <li>Infrastructure updates</li>
        </ul>
        <p>Anything affecting production MUST be logged.</p>

        <h2>12. Dispute Investigation Logging</h2>
        <p>Every dispute case must log:</p>
        <ul>
          <li>Supporting evidence</li>
          <li>Timeline</li>
          <li>User statements</li>
          <li>Admin actions</li>
          <li>System decisions</li>
          <li>Final resolution</li>
        </ul>
        <p>Stored for minimum 5 years.</p>

        <h2>13. Log Access Review</h2>
        <p>Weekly Review:</p>
        <ul>
          <li>High-risk admin activity</li>
          <li>Payout anomalies</li>
          <li>Refund patterns</li>
          <li>KYC override frequency</li>
        </ul>
        <p>Monthly Review:</p>
        <ul>
          <li>Access control list</li>
          <li>Audit trail completeness</li>
          <li>System logs integrity</li>
        </ul>
        <p>Quarterly Review:</p>
        <ul>
          <li>Full compliance audit</li>
          <li>Device/IP anomalies</li>
          <li>Fraud cluster analysis</li>
        </ul>
        <p>Annual Review:</p>
        <ul>
          <li>External audit</li>
          <li>FOI/ DPDP compliance</li>
          <li>Financial audit logs</li>
        </ul>

        <h2>14. Penalties for Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Deleting logs</td>
              <td>Termination + FIR</td>
            </tr>
            <tr>
              <td>Log tampering</td>
              <td>Criminal action</td>
            </tr>
            <tr>
              <td>Unauthorized access</td>
              <td>Suspension + investigation</td>
            </tr>
            <tr>
              <td>Sharing logs externally</td>
              <td>Legal penalty</td>
            </tr>
            <tr>
              <td>Admin misuse</td>
              <td>Immediate removal</td>
            </tr>
            <tr>
              <td>Data export without approval</td>
              <td>Criminal &amp; DPDP violation</td>
            </tr>
            <tr>
              <td>Manipulating auctions</td>
              <td>Permanent ban + legal</td>
            </tr>
            <tr>
              <td>Changing wallet/payout manually</td>
              <td>FIR + dismissal</td>
            </tr>
          </tbody>
        </table>

        <h2>15. Responsibilities</h2>
        <h3>Platform</h3>
        <ul>
          <li>Maintain secure logs</li>
          <li>Provide access only when needed</li>
          <li>Preserve evidence</li>
        </ul>
        <h3>Admins</h3>
        <ul>
          <li>Use access ethically</li>
          <li>Avoid misuse</li>
          <li>Follow logging protocols</li>
        </ul>
        <h3>Compliance</h3>
        <ul>
          <li>Investigate anomalies</li>
          <li>Report violations</li>
        </ul>
        <h3>Security</h3>
        <ul>
          <li>Monitor logs</li>
          <li>Detect tampering attempts</li>
          <li>Maintain integrity</li>
        </ul>
        <h3>Developers</h3>
        <ul>
          <li>Ensure logging in code</li>
          <li>Avoid sensitive log dumps</li>
          <li>Prevent logging of private user data</li>
        </ul>

        <h2>16. Policy Updates</h2>
        <p>Company may update this policy anytime.</p>
        <p>Updated versions appear under the Legal section.</p>
      </article>
    </div>
  );
};

export default AuditLogsMonitoringEvidencePreservationAdminAccountabilityPolicy;
