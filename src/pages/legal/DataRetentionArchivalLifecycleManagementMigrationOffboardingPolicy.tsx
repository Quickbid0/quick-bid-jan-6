import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const DataRetentionArchivalLifecycleManagementMigrationOffboardingPolicy: React.FC = () => {
  usePageSEO({
    title:
      'Data Retention, Archival, Lifecycle Management, Migration & User Offboarding Policy | QuickMela',
    description:
      'Defines how user data, logs, financial records, KYC documents, and platform information are stored, archived, migrated, retained, deleted, or preserved across the full lifecycle.',
    canonicalPath:
      '/legal/dataretention-archival-lifecyclemanagement-migration-offboarding-policy',
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
            Data Retention, Archival, Lifecycle Management, Migration &amp; User Offboarding Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Data Retention, Archival, Lifecycle Management, Migration &amp; User Offboarding Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy defines how all user data, logs, financial records, KYC documents, and platform information are
          stored, archived, migrated, retained, deleted, or preserved across the full lifecycle of QuickMela/Tekvoro
          systems.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>To ensure:</p>
        <ul>
          <li>Legal compliance with DPDP Act 2023</li>
          <li>Safe retention of required data</li>
          <li>Timely deletion of unnecessary data</li>
          <li>Proper archival for audits</li>
          <li>Secure migration between systems</li>
          <li>User transparency during account closure</li>
          <li>Prevention of unauthorized access</li>
          <li>Reduced data risks</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Buyers</li>
          <li>Sellers</li>
          <li>Delivery partners</li>
          <li>Agents</li>
          <li>Admins</li>
          <li>Moderators</li>
          <li>Developers</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>Personal data</li>
          <li>KYC</li>
          <li>Payments</li>
          <li>Wallet logs</li>
          <li>Auction logs</li>
          <li>Chat messages</li>
          <li>Delivery proof</li>
          <li>Device metadata</li>
          <li>Admin activity logs</li>
          <li>Backups</li>
          <li>Archived databases</li>
          <li>Offboarded user data</li>
        </ul>

        <h2>3. Data Retention Periods (Legal &amp; Operational)</h2>
        <h3>A. Personal Information</h3>
        <ul>
          <li>Basic profile → 3 years after last activity</li>
          <li>Contact info → 3 years</li>
          <li>Address → 3 years</li>
          <li>Photo → 3 years</li>
        </ul>
        <h3>B. KYC Information</h3>
        <p>Required by law: 5–7 years</p>
        <p>Includes:</p>
        <ul>
          <li>PAN</li>
          <li>Aadhaar (masked)</li>
          <li>Address proof</li>
          <li>Liveliness checks</li>
          <li>Bank verification</li>
        </ul>
        <h3>C. Payment/Wallet Logs</h3>
        <p>Minimum: 7–10 years (mandatory for audits)</p>
        <h3>D. Auction Logs</h3>
        <p>Bids</p>
        <p>Winner logs</p>
        <p>Price history</p>
        <p>Seller disclosures</p>
        <p>Retention: 10 years</p>
        <p>(Required to defend disputes, police cases, and tax audits.)</p>
        <h3>E. Chat Logs</h3>
        <p>1 year (except in legal cases)</p>
        <h3>F. Delivery Proof</h3>
        <p>1–3 years</p>
        <h3>G. Fraud Investigation Logs</h3>
        <p>Permanent retention</p>
        <p>For blacklisted users/devices</p>
        <h3>H. Admin Activity Logs</h3>
        <p>10 years</p>
        <h3>I. Deleted/Closed Accounts</h3>
        <p>Anonymized after 30–90 days</p>
        <p>Sensitive data removed</p>
        <p>Financial logs kept for compliance</p>

        <h2>4. Data Categories That Cannot Be Deleted on Request</h2>
        <p>Legally protected / mandatory:</p>
        <ul>
          <li>Payment transaction logs</li>
          <li>Auction records</li>
          <li>Fraud investigation logs</li>
          <li>Admin actions</li>
          <li>Tax invoices</li>
          <li>Wallet history</li>
          <li>Legal hold data</li>
        </ul>
        <p>Even if user requests deletion, these remain anonymized but retained.</p>

        <h2>5. User Data Deletion / Account Closure Process</h2>
        <p>When user requests deletion:</p>
        <ul>
          <li>Identity verified via OTP</li>
          <li>Account is locked</li>
          <li>Active orders resolved</li>
          <li>Pending payouts processed</li>
          <li>Chat history removed</li>
          <li>Profile anonymized</li>
          <li>Personal info deleted</li>
          <li>Financial logs preserved (anonymized)</li>
          <li>Confirmation sent to user</li>
        </ul>
        <p>Timeline: 15–30 days</p>

        <h2>6. Data Archival Rules</h2>
        <p>Data eligible for archival:</p>
        <ul>
          <li>Old transaction logs</li>
          <li>Old seller listings</li>
          <li>Old delivery updates</li>
          <li>Old chat metadata</li>
          <li>Old user accounts</li>
        </ul>
        <p>Archived data MUST:</p>
        <ul>
          <li>Be encrypted</li>
          <li>Be accessible only to compliance team</li>
          <li>Not be used for analytics</li>
          <li>Not be visible in admin panel</li>
        </ul>
        <p>Archival Frequency:</p>
        <ul>
          <li>Monthly for active systems</li>
          <li>Quarterly for full snapshots</li>
        </ul>

        <h2>7. Backup Retention Rules</h2>
        <p>Backups are:</p>
        <ul>
          <li>Encrypted</li>
          <li>Stored safely</li>
          <li>Tested monthly</li>
        </ul>
        <p>Retention:</p>
        <ul>
          <li>Incremental backups → 7 days</li>
          <li>Full backups → 30 days</li>
          <li>Database snapshots → 3–12 months</li>
          <li>Critical financial backup → 10 years</li>
        </ul>
        <p>Backups NEVER include unnecessary or sensitive raw KYC unless required.</p>

        <h2>8. Data Migration Rules</h2>
        <p>When migrating systems (database, cloud, apps):</p>
        <ul>
          <li>Migration plan prepared</li>
          <li>Backups created</li>
          <li>Data encryption validated</li>
          <li>Migration executed</li>
          <li>Post-migration verification</li>
          <li>Data consistency checks</li>
          <li>Old storage wiped securely (AES-256)</li>
        </ul>
        <p>Forbidden during migration:</p>
        <ul>
          <li>Copying data to personal systems</li>
          <li>Using unencrypted transfers</li>
          <li>Exporting data without permission</li>
          <li>Involving unauthorized developers</li>
        </ul>

        <h2>9. Legal Hold Rules</h2>
        <p>If a user or seller is under:</p>
        <ul>
          <li>Investigation</li>
          <li>Fraud review</li>
          <li>Police complaint</li>
          <li>Court order</li>
          <li>Regulatory audit</li>
        </ul>
        <p>Then:</p>
        <ul>
          <li>User data CANNOT be deleted</li>
          <li>Data CANNOT be modified</li>
          <li>Data CANNOT be anonymized</li>
        </ul>
        <p>Legal hold ends only via compliance team approval.</p>

        <h2>10. GDPR/DPDP Rights Adaptation</h2>
        <p>Platform supports:</p>
        <ul>
          <li>Right to access</li>
          <li>Right to correction</li>
          <li>Right to request deletion (not absolute)</li>
          <li>Right to withdraw consent</li>
          <li>Right to account deactivation</li>
        </ul>
        <p>Exceptions apply for:</p>
        <ul>
          <li>Legal hold</li>
          <li>Payment logs</li>
          <li>Auction records</li>
          <li>Tax compliance</li>
        </ul>

        <h2>11. Data Minimization Rules</h2>
        <p>Platform collects ONLY:</p>
        <ul>
          <li>What is needed</li>
          <li>What is lawful</li>
          <li>What is required for transactions</li>
          <li>What improves safety</li>
        </ul>
        <p>Platform does NOT collect:</p>
        <ul>
          <li>Unnecessary personal data</li>
          <li>Profiling sensitive categories</li>
          <li>Behaviour for advertising resale</li>
        </ul>

        <h2>12. Data Anonymization Standards</h2>
        <p>Anonymization includes:</p>
        <ul>
          <li>Removing name</li>
          <li>Removing phone</li>
          <li>Removing address</li>
          <li>Masking documents</li>
          <li>Replacing identifiers with tokens</li>
        </ul>
        <p>Anonymized data may be used for:</p>
        <ul>
          <li>Analytics</li>
          <li>Product improvement</li>
          <li>Fraud research</li>
        </ul>
        <p>Never re-identifiable.</p>

        <h2>13. Secure Deletion Rules</h2>
        <p>When data is deleted:</p>
        <ul>
          <li>Must be overwritten</li>
          <li>Must not be recoverable</li>
          <li>Must be removed from active storage</li>
          <li>Must be removed from logs wherever possible</li>
        </ul>
        <p>Backups eventually cycle out using rotation system</p>
        <p>Secure deletion applies to:</p>
        <ul>
          <li>User accounts</li>
          <li>Seller accounts</li>
          <li>Documents</li>
          <li>Chat logs</li>
          <li>Photos/videos</li>
        </ul>

        <h2>14. Employee Access Controls</h2>
        <p>Employees cannot:</p>
        <ul>
          <li>View archived data</li>
          <li>Delete data manually</li>
          <li>Overwrite logs</li>
          <li>Access backups</li>
          <li>Download data</li>
          <li>Restore backups without permission</li>
        </ul>
        <p>Only:</p>
        <ul>
          <li>CTO</li>
          <li>Compliance</li>
          <li>Security team</li>
        </ul>
        <p>Have limited access for necessary work.</p>

        <h2>15. Penalties for Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Unauthorized data deletion</td>
              <td>Termination + FIR</td>
            </tr>
            <tr>
              <td>Unauthorized access</td>
              <td>Legal action</td>
            </tr>
            <tr>
              <td>Exporting user data</td>
              <td>Immediate ban</td>
            </tr>
            <tr>
              <td>Mishandling backups</td>
              <td>Suspension</td>
            </tr>
            <tr>
              <td>Data leak</td>
              <td>Regulatory penalty</td>
            </tr>
            <tr>
              <td>Ignoring legal hold</td>
              <td>Criminal implication</td>
            </tr>
            <tr>
              <td>Improper migration</td>
              <td>Investigation</td>
            </tr>
          </tbody>
        </table>

        <h2>16. Responsibilities</h2>
        <h3>Platform</h3>
        <ul>
          <li>Maintain systems</li>
          <li>Follow compliance laws</li>
        </ul>
        <h3>Users</h3>
        <ul>
          <li>Request deletion responsibly</li>
        </ul>
        <h3>Admins</h3>
        <ul>
          <li>Never manually delete data</li>
        </ul>
        <h3>Compliance Team</h3>
        <ul>
          <li>Approve holds/deletions</li>
          <li>Manage archival</li>
        </ul>
        <h3>DevOps</h3>
        <ul>
          <li>Manage migration &amp; backups</li>
          <li>Ensure secure infrastructure</li>
        </ul>

        <h2>17. Policy Updates</h2>
        <p>This data retention/archival/offboarding policy may be updated anytime.</p>
      </article>
    </div>
  );
};

export default DataRetentionArchivalLifecycleManagementMigrationOffboardingPolicy;
