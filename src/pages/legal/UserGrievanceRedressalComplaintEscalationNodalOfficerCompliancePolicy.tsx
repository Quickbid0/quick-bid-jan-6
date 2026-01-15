import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const UserGrievanceRedressalComplaintEscalationNodalOfficerCompliancePolicy: React.FC = () => {
  usePageSEO({
    title: 'User Grievance Redressal, Complaint Escalation & Nodal Officer Compliance Policy | QuickMela',
    description:
      'Regulates how users can raise complaints, how they are resolved, and how the platform complies with grievance and nodal officer requirements under Indian IT Rules.',
    canonicalPath: '/legal/usergrievance-redressal-complaintescalation-nodalofficer-policy',
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
            User Grievance Redressal, Complaint Escalation &amp; Nodal Officer Compliance Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          User Grievance Redressal, Complaint Escalation &amp; Nodal Officer Compliance Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This regulates how users can raise complaints, how they are resolved, and how the platform provides legally
          compliant escalation, including a mandatory Grievance Officer and Nodal Officer under Indian IT Rules.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>Transparent grievance handling</li>
          <li>Faster complaint resolution</li>
          <li>Legal compliance (IT Rules 2021, CPA 2019)</li>
          <li>User protection</li>
          <li>Fair escalation levels</li>
          <li>Accountability of platform staff</li>
          <li>Accessible complaint channels</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Buyers</li>
          <li>Sellers</li>
          <li>Delivery partners</li>
          <li>Staff</li>
          <li>Agents</li>
          <li>Yard operators</li>
          <li>Admins</li>
          <li>External vendors</li>
        </ul>
        <p>Covers complaints related to:</p>
        <ul>
          <li>Account issues</li>
          <li>KYC</li>
          <li>Payments</li>
          <li>Fraud</li>
          <li>Delivery</li>
          <li>Seller misconduct</li>
          <li>Buyer misconduct</li>
          <li>Auction problems</li>
          <li>App errors</li>
          <li>Privacy violations</li>
          <li>Wrong listings</li>
          <li>Refund issues</li>
        </ul>

        <h2>3. Official Grievance Channels</h2>
        <p>Users may file complaints via:</p>
        <h3>A. In-App Help Center</h3>
        <p>Primary and fastest channel.</p>
        <h3>B. Email (Support Team)</h3>
        <p>Support@domain</p>
        <h3>C. Grievance Officer Email</h3>
        <p>Grievance@domain</p>
        <h3>D. Escalation Form</h3>
        <p>Legal escalation link.</p>
        <h3>E. Physical Notice Address (Optional)</h3>
        <p>Corporate office address.</p>

        <h2>4. Mandatory Legal Roles</h2>
        <h3>A. Grievance Officer (IT Rules Required)</h3>
        <p>Responsibilities:</p>
        <ul>
          <li>Acknowledge complaints within 24 hours</li>
          <li>Resolve within 15 days</li>
          <li>Provide written updates</li>
          <li>Review escalated cases</li>
          <li>Work with legal &amp; compliance</li>
        </ul>
        <h3>B. Nodal Officer</h3>
        <p>For government/law enforcement.</p>
        <p>Responsibilities:</p>
        <ul>
          <li>Coordinate with police</li>
          <li>Approve legally valid data requests</li>
          <li>Ensure DPDP compliance</li>
          <li>Respond within 72 hours</li>
        </ul>
        <p>Both roles must be publicly listed in your app/website.</p>

        <h2>5. Complaint Categories</h2>
        <p>1. General Issues</p>
        <ul>
          <li>Login problems</li>
          <li>App error</li>
          <li>Wrong information</li>
        </ul>
        <p>2. Transaction Issues</p>
        <ul>
          <li>Payment failure</li>
          <li>Refund delays</li>
          <li>Wrong charges</li>
        </ul>
        <p>3. Auction Issues</p>
        <ul>
          <li>Bid not accepted</li>
          <li>Timer glitch</li>
          <li>Winner dispute</li>
        </ul>
        <p>4. Seller Issues</p>
        <ul>
          <li>Fake item</li>
          <li>Wrong item</li>
          <li>Misleading listing</li>
        </ul>
        <p>5. Delivery Issues</p>
        <ul>
          <li>Late delivery</li>
          <li>Damage</li>
          <li>Bad behaviour</li>
        </ul>
        <p>6. Fraud Issues</p>
        <ul>
          <li>Scam attempts</li>
          <li>Suspicious user</li>
          <li>Fake documents</li>
        </ul>
        <p>7. Legal Issues</p>
        <ul>
          <li>Privacy violation</li>
          <li>Data misuse</li>
          <li>Abuse or harassment</li>
        </ul>

        <h2>6. Grievance Submission Requirements</h2>
        <p>Users must provide:</p>
        <ul>
          <li>Registered phone/email</li>
          <li>Issue description</li>
          <li>Order ID (if applicable)</li>
          <li>Evidence (photos/videos/screenshots)</li>
          <li>Date &amp; time of issue</li>
        </ul>
        <p>Incomplete submissions may delay processing.</p>

        <h2>7. Complaint Processing Timeline</h2>
        <h3>A. Acknowledgement</h3>
        <p>Within 24 hours.</p>
        <h3>B. Resolution Timeline</h3>
        <ul>
          <li>General complaints → 48 hours</li>
          <li>Delivery issues → 3–5 days</li>
          <li>Refund/payment issues → 3–7 days</li>
          <li>Auction complaints → 24–48 hours</li>
          <li>Fraud/safety complaints → Immediate review</li>
          <li>Legal/privacy complaints → 72 hours</li>
          <li>KYC issues → 24–72 hours</li>
        </ul>
        <h3>C. Escalation (If unresolved)</h3>
        <ul>
          <li>Level 1: Support Team</li>
          <li>Level 2: Senior Support</li>
          <li>Level 3: Grievance Officer</li>
          <li>Level 4: Nodal Officer (legal only)</li>
        </ul>

        <h2>8. Evidence Rules</h2>
        <p>Accepted:</p>
        <ul>
          <li>Photos</li>
          <li>Videos</li>
          <li>Screenshots</li>
          <li>Chat logs</li>
          <li>Delivery proof</li>
          <li>Auction logs</li>
          <li>Payment logs</li>
        </ul>
        <p>Not accepted:</p>
        <ul>
          <li>Edited media</li>
          <li>Fake photos</li>
          <li>Internet images</li>
        </ul>
        <p>Fake evidence → account ban + legal escalation.</p>

        <h2>9. Complaint Outcome Types</h2>
        <p>RESULT A — Resolved</p>
        <p>User complaint addressed.</p>
        <p>RESULT B — Partially Resolved</p>
        <p>Partial refund or solution given.</p>
        <p>RESULT C — Rejected</p>
        <p>If evidence insufficient or fraudulent.</p>
        <p>RESULT D — Escalated</p>
        <p>Sent to Grievance Officer.</p>
        <p>RESULT E — Closed Automatically</p>
        <p>If user does not respond for 7 days.</p>

        <h2>10. Fraudulent Complaint Handling</h2>
        <p>Fraud signals include:</p>
        <ul>
          <li>Repeated false claims</li>
          <li>Staged damage</li>
          <li>Misuse of refund policy</li>
          <li>Using fake evidence</li>
          <li>Harassing staff</li>
        </ul>
        <p>Action:</p>
        <ul>
          <li>Warning</li>
          <li>Account suspension</li>
          <li>Permanent ban</li>
          <li>FIR (if severe)</li>
        </ul>

        <h2>11. Harassment/Abuse Complaint Handling</h2>
        <p>If user is:</p>
        <ul>
          <li>Abusive</li>
          <li>Threatening</li>
          <li>Harassing staff</li>
        </ul>
        <p>Steps:</p>
        <ul>
          <li>Immediate review</li>
          <li>Warning issued</li>
          <li>Temporary ban</li>
          <li>Permanent ban (if repeated)</li>
          <li>Legal escalation (if violent threats)</li>
        </ul>

        <h2>12. Privacy/Data Complaints</h2>
        <p>Handled by:</p>
        <p>Privacy Compliance Team</p>
        <p>Response:</p>
        <ul>
          <li>Acknowledge in 24 hours</li>
          <li>Resolve in 7 days</li>
        </ul>
        <p>Includes:</p>
        <ul>
          <li>Data access requests</li>
          <li>Data deletion requests</li>
          <li>Wrong data case</li>
          <li>DPDP violations</li>
        </ul>

        <h2>13. Government &amp; Law Enforcement Requests</h2>
        <p>Nodal Officer manages:</p>
        <ul>
          <li>Police requests</li>
          <li>Government orders</li>
          <li>Legal notices</li>
        </ul>
        <p>Must:</p>
        <ul>
          <li>Verify validity</li>
          <li>Log the request</li>
          <li>Respond in 72 hours</li>
          <li>Provide only permitted data</li>
        </ul>
        <p>Unauthorized sharing → legal penalty.</p>

        <h2>14. Seller &amp; Delivery Partner Complaints</h2>
        <p>Can file complaints against:</p>
        <ul>
          <li>Buyers</li>
          <li>Other sellers</li>
          <li>Delivery vendors</li>
          <li>Admins</li>
          <li>Yard staff</li>
        </ul>
        <p>Handled by:</p>
        <ul>
          <li>Compliance</li>
          <li>Operations</li>
        </ul>
        <p>Timeline: 3–5 days.</p>

        <h2>15. Prohibited Complaint Behaviours</h2>
        <p>Users CANNOT:</p>
        <ul>
          <li>File fake complaints</li>
          <li>Spam support repeatedly</li>
          <li>Abuse staff</li>
          <li>Threaten negative reviews</li>
          <li>Submit false legal notices</li>
          <li>Blackmail seller or platform</li>
          <li>Misuse grievance system</li>
        </ul>
        <p>Penalties apply.</p>

        <h2>16. Support Staff Responsibilities</h2>
        <p>Staff MUST:</p>
        <ul>
          <li>Stay respectful</li>
          <li>Provide correct information</li>
          <li>Not delay cases</li>
          <li>Not hide mistakes</li>
          <li>Not ignore complaints</li>
          <li>Document everything</li>
          <li>Maintain escalation SOPs</li>
        </ul>

        <h2>17. Grievance Officer Responsibilities</h2>
        <ul>
          <li>Oversee all escalated cases</li>
          <li>Ensure fair treatment</li>
          <li>Provide written decision</li>
          <li>Communicate transparently</li>
          <li>Maintain logs</li>
          <li>Report high-risk issues to legal</li>
        </ul>

        <h2>18. Transparency Requirements</h2>
        <p>Platform will:</p>
        <ul>
          <li>Publish grievance contact details</li>
          <li>Publish monthly grievance stats (optional)</li>
          <li>Maintain log of:</li>
        </ul>
        <ul>
          <li>Number of complaints</li>
          <li>Average resolution time</li>
          <li>Pending cases</li>
        </ul>

        <h2>19. Penalties for Internal Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ignoring complaint</td>
              <td>Warning → suspension</td>
            </tr>
            <tr>
              <td>Hiding evidence</td>
              <td>Termination</td>
            </tr>
            <tr>
              <td>Delaying resolution intentionally</td>
              <td>Penalty + investigation</td>
            </tr>
            <tr>
              <td>Mishandling legal complaint</td>
              <td>Legal action</td>
            </tr>
            <tr>
              <td>Disrespecting user</td>
              <td>Formal action</td>
            </tr>
            <tr>
              <td>Fake data in response</td>
              <td>Immediate suspension</td>
            </tr>
          </tbody>
        </table>

        <h2>20. Responsibilities</h2>
        <h3>Users</h3>
        <ul>
          <li>Complain honestly</li>
          <li>Provide correct evidence</li>
          <li>Follow escalation steps</li>
        </ul>
        <h3>Support Team</h3>
        <ul>
          <li>Respond fast</li>
          <li>Resolve fairly</li>
        </ul>
        <h3>Grievance Officer</h3>
        <ul>
          <li>Final authority for resolution</li>
        </ul>
        <h3>Nodal Officer</h3>
        <ul>
          <li>Legal authority contact</li>
        </ul>
        <h3>Compliance Team</h3>
        <ul>
          <li>Ensure IT Rules 2021 adherence</li>
        </ul>
        <h3>Platform</h3>
        <ul>
          <li>Provide safe grievance systems</li>
        </ul>

        <h2>21. Policy Updates</h2>
        <p>The platform may update this grievance policy anytime.</p>
      </article>
    </div>
  );
};

export default UserGrievanceRedressalComplaintEscalationNodalOfficerCompliancePolicy;
