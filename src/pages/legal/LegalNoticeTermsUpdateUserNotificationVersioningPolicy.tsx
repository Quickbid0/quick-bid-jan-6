import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const LegalNoticeTermsUpdateUserNotificationVersioningPolicy: React.FC = () => {
  usePageSEO({
    title:
      'Legal Notice, Terms Update Procedure, User Notification Rules & Policy Versioning System | QuickMela',
    description:
      'Defines how QuickMela/Tekvoro publishes, updates, versions, and communicates all legal documents with users in a transparent and compliant way.',
    canonicalPath: '/legal/legalnotice-termsupdate-usernotification-versioning-policy',
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
            Legal Notice, Terms Update Procedure, User Notification Rules &amp; Policy Versioning System
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Legal Notice, Terms Update Procedure, User Notification Rules &amp; Policy Versioning System
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy defines how QuickMela/Tekvoro publishes, updates, stores, versions, communicates, and enforces all
          legal documents, ensuring transparency, accountability, and compliance with Indian IT Rules, Consumer
          Protection Act, and DPDP Act.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>Transparent legal updates</li>
          <li>Proper user notification</li>
          <li>Clear version tracking</li>
          <li>Fair enforcement of policy changes</li>
          <li>Regulatory compliance</li>
          <li>Legal defensibility</li>
          <li>Accountability for platform changes</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Terms &amp; Conditions</li>
          <li>Privacy Policy</li>
          <li>Seller Terms</li>
          <li>Buyer Terms</li>
          <li>Delivery Partner Terms</li>
          <li>KYC Policy</li>
          <li>Refunds &amp; Payments Policy</li>
          <li>Risk &amp; Fraud Policies</li>
          <li>Auction Rules</li>
          <li>All 75 legal policies in your suite</li>
        </ul>
        <p>Applies to:</p>
        <ul>
          <li>Buyers</li>
          <li>Sellers</li>
          <li>Delivery partners</li>
          <li>Agents</li>
          <li>Admins</li>
          <li>Employees</li>
          <li>Vendors</li>
        </ul>

        <h2>3. Legal Document Publication Rules</h2>
        <p>All policies must be:</p>
        <ul>
          <li>Published on website/app</li>
          <li>Permanent URLs</li>
          <li>Hosted under /legal/</li>
          <li>Accessible without login</li>
          <li>Written in clear language</li>
          <li>Updated timestamp shown</li>
          <li>Version number displayed</li>
        </ul>
        <p>No policy may be hidden or unpublished.</p>

        <h2>4. Policy Versioning Framework</h2>
        <p>Each legal document includes:</p>
        <ul>
          <li>Version number (v1, v2, v3…)</li>
          <li>Last updated date</li>
          <li>Change summary</li>
          <li>Reason for update</li>
          <li>Approval signatures</li>
          <li>Compliance reference</li>
        </ul>
        <p>Version history stored for a minimum of 7 years.</p>

        <h2>5. Terms Update Categories</h2>
        <p>There are 3 types of updates:</p>
        <h3>A. Minor Updates (No user consent needed)</h3>
        <ul>
          <li>Grammar fixes</li>
          <li>UI wording</li>
          <li>Clarification</li>
          <li>Formatting changes</li>
          <li>Non-impacting improvements</li>
        </ul>
        <h3>B. Moderate Updates (Notify users)</h3>
        <ul>
          <li>New features</li>
          <li>Additional rules</li>
          <li>Expanded definitions</li>
          <li>Updated compliance statements</li>
        </ul>
        <h3>C. Major Updates (Explicit user consent needed)</h3>
        <ul>
          <li>Changes to core rights</li>
          <li>Changes to privacy terms</li>
          <li>Payment-related rule changes</li>
          <li>Arbitration/dispute changes</li>
          <li>Auction rules affecting outcomes</li>
        </ul>
        <p>Major updates require user agreement via:</p>
        <ul>
          <li>Popup</li>
          <li>Email</li>
          <li>Checkbox acceptance</li>
        </ul>

        <h2>6. User Notification Rules</h2>
        <h3>A. Mandatory Notification Channels</h3>
        <ul>
          <li>In-app popup/banner</li>
          <li>Email</li>
          <li>Push notifications (optional)</li>
          <li>SMS (only for critical changes)</li>
        </ul>
        <h3>B. Notification Timing</h3>
        <ul>
          <li>Moderate changes → Notify at update time</li>
          <li>Major changes → Notify 7 days before enforcement</li>
        </ul>
        <h3>C. Opt-Out Not Allowed</h3>
        <p>Users cannot opt-out of required legal terms for platform usage.</p>

        <h2>7. Enforcement of Updated Terms</h2>
        <p>Users considered to have accepted terms if:</p>
        <ul>
          <li>They continue using the platform after notification</li>
          <li>They explicitly click "Accept" (for major updates)</li>
          <li>They interact with updated features</li>
        </ul>
        <p>If user disagrees:</p>
        <ul>
          <li>Account may be restricted</li>
          <li>Certain features disabled</li>
          <li>Offboarding option provided</li>
        </ul>

        <h2>8. Legal Notice Requirements</h2>
        <p>Legal notices MUST include:</p>
        <ul>
          <li>Platform name (QuickMela/Tekvoro)</li>
          <li>Contact details</li>
          <li>Company registration details</li>
          <li>Grievance Officer details</li>
          <li>Nodal Officer details</li>
          <li>Effective date</li>
          <li>Notice reference ID</li>
        </ul>
        <p>Published under:</p>
        <p>/legal/legal-notice</p>

        <h2>9. How Disputes Use Policy Versions</h2>
        <p>In disputes, the version applied is:</p>
        <p>The version active at the time of the event/transaction</p>
        <p>For example:</p>
        <ul>
          <li>For a disputed auction → use policy version on auction date</li>
          <li>For KYC issues → version active on the KYC date</li>
          <li>For payout issues → version active on payout date</li>
        </ul>
        <p>This protects against retroactive liability.</p>

        <h2>10. Policy Storage &amp; Record-Keeping</h2>
        <p>Platform must store:</p>
        <ul>
          <li>All current policies</li>
          <li>Past versions</li>
          <li>Approval logs</li>
          <li>Audit trail for each update</li>
          <li>Snapshot copies</li>
        </ul>
        <p>Storage:</p>
        <ul>
          <li>Encrypted</li>
          <li>Immutably archived</li>
          <li>Accessible only to legal/compliance</li>
        </ul>

        <h2>11. Internal Approval Workflow</h2>
        <p>Before publishing updates:</p>
        <ul>
          <li>Draft prepared</li>
          <li>Compliance review</li>
          <li>Legal team approval</li>
          <li>CTO review (if technical impact)</li>
          <li>CEO / Founder approval</li>
          <li>Version updated</li>
          <li>Published live</li>
          <li>Notification sent to users</li>
        </ul>
        <p>No update can bypass approval chain.</p>

        <h2>12. External Review (Optional but Recommended)</h2>
        <p>For sensitive policies:</p>
        <ul>
          <li>External consultant review</li>
          <li>Legal audit</li>
          <li>Security audit</li>
        </ul>
        <p>Useful for:</p>
        <ul>
          <li>Auction rules</li>
          <li>Payments &amp; refunds</li>
          <li>AML policy</li>
          <li>Privacy policy</li>
        </ul>

        <h2>13. Emergency Policy Updates</h2>
        <p>Allowed only when:</p>
        <ul>
          <li>Required by law</li>
          <li>Necessary for user safety</li>
          <li>Required to address critical risk</li>
        </ul>
        <p>Users notified immediately after update.</p>

        <h2>14. Policy Removal Rules</h2>
        <p>Platform may remove outdated policies ONLY IF:</p>
        <ul>
          <li>Replaced with updated versions</li>
          <li>Still accessible in archive</li>
          <li>Not required by law</li>
        </ul>
        <p>Outdated versions must remain:</p>
        <ul>
          <li>Archived</li>
          <li>Uneditable</li>
          <li>Time-stamped</li>
        </ul>

        <h2>15. Penalties for Internal Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Publishing without approval</td>
              <td>Suspension</td>
            </tr>
            <tr>
              <td>Hiding policy updates</td>
              <td>Termination</td>
            </tr>
            <tr>
              <td>Backdating documents</td>
              <td>Legal action</td>
            </tr>
            <tr>
              <td>Editing archive history</td>
              <td>Immediate termination</td>
            </tr>
            <tr>
              <td>Not notifying users</td>
              <td>Compliance escalation</td>
            </tr>
          </tbody>
        </table>

        <h2>16. Responsibilities</h2>
        <h3>Platform</h3>
        <ul>
          <li>Maintain clear and updated policies</li>
        </ul>
        <h3>Legal Team</h3>
        <ul>
          <li>Approve changes</li>
          <li>Maintain version history</li>
        </ul>
        <h3>Compliance Team</h3>
        <ul>
          <li>Ensure DPDP/IT Act compliance</li>
        </ul>
        <h3>Admins</h3>
        <ul>
          <li>Follow updated rules</li>
        </ul>
        <h3>Users</h3>
        <ul>
          <li>Follow terms to use platform</li>
        </ul>

        <h2>17. Policy Updates</h2>
        <p>This versioning/update policy itself will be updated based on:</p>
        <ul>
          <li>New regulations</li>
          <li>Feature launches</li>
          <li>Operational changes</li>
        </ul>

        <p>✅ Policy 75 Completed:</p>
        <p>/legal/legalnotice-termsupdate-usernotification-versioning-policy</p>
      </article>
    </div>
  );
};

export default LegalNoticeTermsUpdateUserNotificationVersioningPolicy;
