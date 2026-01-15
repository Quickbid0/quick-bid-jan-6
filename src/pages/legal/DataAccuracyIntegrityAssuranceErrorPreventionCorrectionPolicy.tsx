import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const DataAccuracyIntegrityAssuranceErrorPreventionCorrectionPolicy: React.FC = () => {
  usePageSEO({
    title: 'Data Accuracy, Integrity Assurance, Error Prevention & Correction Policy | QuickMela',
    description:
      'Governs how platform data remains correct, tamper-proof, validated, and protected across auctions, payments, wallets, KYC, delivery logs, and admin actions.',
    canonicalPath: '/legal/dataaccuracy-integrityassurance-errorprevention-correction-policy',
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
            Data Accuracy, Integrity Assurance, Error Prevention &amp; Correction Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Data Accuracy, Integrity Assurance, Error Prevention &amp; Correction Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy governs how all platform data must remain correct, tamper-proof, traceable, validated, and
          protected across auctions, payments, wallets, KYC, delivery logs, user profiles, and admin actions.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>100% accuracy of critical data</li>
          <li>Zero manipulation of logs</li>
          <li>Correct auction outcomes</li>
          <li>Correct wallets and payouts</li>
          <li>Safe financial operations</li>
          <li>Strong audit evidence</li>
          <li>Legal reliability</li>
          <li>Platform-wide data trust</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Covers data related to:</p>
        <ul>
          <li>Bidding history</li>
          <li>Auction timers</li>
          <li>Bid winners</li>
          <li>Wallet balances</li>
          <li>Payouts</li>
          <li>KYC</li>
          <li>User identity</li>
          <li>Delivery logs</li>
          <li>Messages</li>
          <li>Notifications</li>
          <li>Admin actions</li>
          <li>Risk scores</li>
          <li>Payment logs</li>
          <li>Refund history</li>
        </ul>
        <p>Applies to:</p>
        <ul>
          <li>All users</li>
          <li>Admins</li>
          <li>Developers</li>
          <li>Compliance</li>
          <li>Fraud team</li>
          <li>Warehouse staff</li>
          <li>Delivery partners</li>
        </ul>

        <h2>3. What Counts as Critical Data?</h2>
        <p>Critical Data Types:</p>
        <ul>
          <li>Auction bids</li>
          <li>Auction winner</li>
          <li>Final auction price</li>
          <li>User wallet balance</li>
          <li>Payment status</li>
          <li>Payout amount</li>
          <li>KYC verification result</li>
          <li>Delivery timestamp</li>
          <li>OTP confirmation</li>
          <li>Bid time accuracy</li>
          <li>Penalty charges</li>
        </ul>
        <p>These must NEVER be:</p>
        <ul>
          <li>Wrong</li>
          <li>Missing</li>
          <li>Corrupted</li>
          <li>Manipulated</li>
          <li>Manually modified</li>
        </ul>

        <h2>4. Data Integrity Rules</h2>
        <p>Critical data MUST be:</p>
        <ul>
          <li>Immutable</li>
          <li>Timestamped</li>
          <li>Hashed</li>
          <li>Logged in audit system</li>
          <li>Stored redundantly</li>
          <li>Validated regularly</li>
          <li>Protected from admin edits</li>
        </ul>
        <p>Admins cannot:</p>
        <ul>
          <li>Change wallet amounts</li>
          <li>Change payout numbers</li>
          <li>Adjust auction outcomes</li>
          <li>Edit bid history</li>
          <li>Alter KYC results</li>
          <li>Modify system logs</li>
        </ul>
        <p>Any attempt &rarr; instant termination + FIR risk.</p>

        <h2>5. Data Validation Layers (Multi-Level)</h2>
        <p>Every action passes through:</p>
        <h3>Level 1 — Client Validation</h3>
        <ul>
          <li>Form checks</li>
          <li>Input checks</li>
          <li>Field completeness</li>
        </ul>
        <h3>Level 2 — Server Validation</h3>
        <ul>
          <li>Data type checks</li>
          <li>Identity checks</li>
          <li>Role checks</li>
        </ul>
        <h3>Level 3 — Business Rules Validation</h3>
        <ul>
          <li>Auction not expired</li>
          <li>Bid &gt; current bid</li>
          <li>User wallet has balance</li>
          <li>KYC verified for high-value</li>
        </ul>
        <h3>Level 4 — Anti-Fraud Validation</h3>
        <ul>
          <li>Device fingerprint</li>
          <li>IP history</li>
          <li>Risk score</li>
          <li>Duplicate attempts</li>
        </ul>
        <h3>Level 5 — Database Constraints</h3>
        <ul>
          <li>Foreign keys</li>
          <li>Unique constraints</li>
          <li>No orphaned records</li>
        </ul>
        <h3>Level 6 — Logging Layer</h3>
        <ul>
          <li>Every action logged</li>
        </ul>

        <h2>6. Data Accuracy Requirements</h2>
        <h3>Auction Data</h3>
        <ul>
          <li>Timer drift &lt;10 ms</li>
          <li>Bids stored in correct order</li>
          <li>Bidder identity validated</li>
          <li>No duplicate bids</li>
          <li>No bid override</li>
        </ul>
        <h3>Payment Data</h3>
        <ul>
          <li>Correct success/failure</li>
          <li>Gateway callback verified</li>
          <li>No double-settle</li>
          <li>No missing refund logs</li>
        </ul>
        <h3>Wallet Data</h3>
        <ul>
          <li>Real-time balance sync</li>
          <li>No negative balance</li>
          <li>No floating unaccounted funds</li>
        </ul>
        <h3>Delivery Data</h3>
        <ul>
          <li>Accurate timestamps</li>
          <li>Valid coordinates</li>
          <li>Correct partner assignment</li>
        </ul>

        <h2>7. Data Correction Policy</h2>
        <p>Errors are classified as:</p>
        <h3>A. System Error</h3>
        <ul>
          <li>Bug or malfunction</li>
          <li>&rarr; Must be corrected immediately</li>
          <li>&rarr; Affects multiple users</li>
          <li>&rarr; Requires CTO sign-off</li>
        </ul>
        <h3>B. Human/Admin Error</h3>
        <ul>
          <li>Wrong data entry</li>
          <li>&rarr; Logged and reversed</li>
          <li>&rarr; Training action</li>
          <li>&rarr; Re-verification</li>
        </ul>
        <h3>C. User Error</h3>
        <ul>
          <li>Wrong input</li>
          <li>&rarr; User correction access</li>
          <li>&rarr; Limited fields</li>
        </ul>
        <h3>D. Fraudulent Change Attempt</h3>
        <ul>
          <li>Intentional manipulation</li>
          <li>&rarr; Account freeze</li>
          <li>&rarr; Investigation</li>
          <li>&rarr; Legal action</li>
        </ul>
        <h3>E. Data Drift or Inconsistency</h3>
        <ul>
          <li>Mismatch between systems</li>
          <li>&rarr; Sync fix</li>
          <li>&rarr; Audit trail updated</li>
        </ul>

        <h2>8. What Can Be Corrected?</h2>
        <p>User-correctable fields:</p>
        <ul>
          <li>Name (minor spelling)</li>
          <li>Address</li>
          <li>Phone</li>
          <li>Email</li>
        </ul>
        <p>Admin-correctable with evidence:</p>
        <ul>
          <li>Incorrect delivery logs</li>
          <li>Mistyped seller description (pre-auction)</li>
          <li>Wrong category mapping</li>
          <li>Minor profile errors</li>
        </ul>
        <p>NOT correctable:</p>
        <ul>
          <li>Auction results</li>
          <li>Wallet logs</li>
          <li>Payment records</li>
          <li>System logs</li>
          <li>KYC results (only reverify, not edit)</li>
        </ul>

        <h2>9. Correction Approval Flow</h2>
        <p>For ANY sensitive correction:</p>
        <ul>
          <li>Request created</li>
          <li>Evidence uploaded</li>
          <li>Fraud/Compliance reviews</li>
          <li>If approved → correction executed</li>
          <li>Action logged</li>
          <li>User notified</li>
        </ul>
        <p>Unauthorized corrections = policy violation.</p>

        <h2>10. Data Tampering Detection (AI/ML)</h2>
        <p>AI automatically detects:</p>
        <ul>
          <li>Unusual admin changes</li>
          <li>Suspicious data edits</li>
          <li>Non-human bidding pattern</li>
          <li>Fast data updates</li>
          <li>Conflicting timestamps</li>
          <li>Duplicate entries</li>
          <li>Null field injection</li>
          <li>Out-of-range values</li>
          <li>Bid order anomalies</li>
          <li>Wrong price jumps</li>
        </ul>
        <p>Flag levels:</p>
        <ul>
          <li>Yellow → review</li>
          <li>Orange → freeze</li>
          <li>Red → automatic lockdown</li>
        </ul>

        <h2>11. Immutable Data Zones</h2>
        <p>These zones cannot ever be changed:</p>
        <ul>
          <li>Bid order history</li>
          <li>Final auction price</li>
          <li>Winner ID</li>
          <li>Wallet logs</li>
          <li>Payment gateway logs</li>
          <li>Refund logs</li>
          <li>Payout logs</li>
          <li>KYC records</li>
          <li>Device/IP logs</li>
          <li>Admin actions</li>
          <li>Delivery OTP confirmations</li>
          <li>Evidence files</li>
        </ul>
        <p>Only viewing allowed.</p>

        <h2>12. Evidence-Based Corrections</h2>
        <p>Corrections allowed only with:</p>
        <ul>
          <li>Screenshots</li>
          <li>Logs</li>
          <li>Photos</li>
          <li>Delivery camera evidence</li>
          <li>Support notes</li>
          <li>Payment gateway proof</li>
          <li>Timestamp match</li>
        </ul>
        <p>No correction without proof.</p>

        <h2>13. Data Monitoring &amp; Audits</h2>
        <p>Daily</p>
        <ul>
          <li>Auction logs</li>
          <li>Payment logs</li>
          <li>Wallet anomalies</li>
        </ul>
        <p>Weekly</p>
        <ul>
          <li>Payout audits</li>
          <li>Delivery logs</li>
          <li>KYC mismatches</li>
        </ul>
        <p>Monthly</p>
        <ul>
          <li>Full data consistency audit</li>
        </ul>
        <p>Quarterly</p>
        <ul>
          <li>Compliance audit</li>
        </ul>
        <p>Annual External Audit</p>
        <ul>
          <li>Required for legal protection</li>
        </ul>

        <h2>14. Data Backup Rules</h2>
        <p>Backups include:</p>
        <ul>
          <li>DB snapshots</li>
          <li>Audit logs</li>
          <li>Evidence files</li>
          <li>Payment logs</li>
        </ul>
        <p>Frequency:</p>
        <ul>
          <li>Real-time for critical</li>
          <li>Daily incremental</li>
          <li>Weekly full</li>
        </ul>
        <p>Retention:</p>
        <ul>
          <li>7–10 years (legal requirement)</li>
        </ul>

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
              <td>Data manipulation</td>
              <td>FIR + termination</td>
            </tr>
            <tr>
              <td>Wrong admin corrections</td>
              <td>Suspension</td>
            </tr>
            <tr>
              <td>Editing immutable fields</td>
              <td>Permanent removal</td>
            </tr>
            <tr>
              <td>Hiding data error</td>
              <td>Legal action</td>
            </tr>
            <tr>
              <td>Fraudulent changes</td>
              <td>Device ban</td>
            </tr>
            <tr>
              <td>Payment manipulation</td>
              <td>Criminal charges</td>
            </tr>
            <tr>
              <td>Auction tampering</td>
              <td>Full legal escalation</td>
            </tr>
          </tbody>
        </table>

        <h2>16. Responsibilities</h2>
        <h3>Users</h3>
        <ul>
          <li>Provide correct information</li>
          <li>Report inaccuracies</li>
        </ul>
        <h3>Sellers</h3>
        <ul>
          <li>List correct item details</li>
          <li>Not manipulate data</li>
        </ul>
        <h3>Delivery Partners</h3>
        <ul>
          <li>Upload accurate photos &amp; timestamps</li>
        </ul>
        <h3>Warehouse/Yard</h3>
        <ul>
          <li>Maintain correct inventory logs</li>
        </ul>
        <h3>Admins</h3>
        <ul>
          <li>Follow correction protocol</li>
        </ul>
        <h3>Compliance</h3>
        <ul>
          <li>Review critical data integrity</li>
        </ul>
        <h3>Security Team</h3>
        <ul>
          <li>Monitor tampering attempts</li>
        </ul>
        <h3>DevOps</h3>
        <ul>
          <li>Maintain backups</li>
        </ul>
        <h3>CTO</h3>
        <ul>
          <li>Final authority over integrity processes</li>
        </ul>

        <h2>17. Policy Updates</h2>
        <p>Platform may update this data integrity policy anytime.</p>
        <p>Updated versions appear under the Legal section.</p>
      </article>
    </div>
  );
};

export default DataAccuracyIntegrityAssuranceErrorPreventionCorrectionPolicy;
