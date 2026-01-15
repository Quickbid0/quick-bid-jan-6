import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const DisputeResolutionComplaintHandlingArbitrationFairPracticePolicy: React.FC = () => {
  usePageSEO({
    title: 'Dispute Resolution, Complaint Handling, Arbitration & Fair Practice Policy | QuickMela',
    description:
      'How QuickMela/Tekvoro handles disputes, complaints, arbitration, and fair practice between buyers, sellers, delivery partners, agents, warehousing staff, and the platform.',
    canonicalPath: '/legal/disputeresolution-complainthandling-arbitration-fairpractice-policy',
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
            Dispute Resolution, Complaint Handling, Arbitration &amp; Fair Practice Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dispute Resolution, Complaint Handling, Arbitration &amp; Fair Practice Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This governs all disputes between buyers, sellers, delivery partners, agents, warehouse staff, and the
          platform, and ensures safe, fair, transparent, and legally compliant resolutions.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>Transparent dispute flow</li>
          <li>Fast and fair decision-making</li>
          <li>No harassment of users</li>
          <li>Zero manipulation of evidence</li>
          <li>Full compliance with Consumer Protection Act</li>
          <li>Fair arbitration processes</li>
          <li>Strong anti-fraud checks</li>
          <li>Legal safety for platform</li>
        </ul>
        <p>It protects:</p>
        <ul>
          <li>Buyers</li>
          <li>Sellers</li>
          <li>Delivery partners</li>
          <li>Platform reputation</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to disputes related to:</p>
        <ul>
          <li>Product condition</li>
          <li>Wrong item delivered</li>
          <li>Damaged item</li>
          <li>Not as described</li>
          <li>Late delivery</li>
          <li>Seller fraud</li>
          <li>Buyer fraud</li>
          <li>Missing parts</li>
          <li>Wallet refund issues</li>
          <li>Payment issues</li>
          <li>Payout disputes</li>
          <li>Delivery partner misconduct</li>
          <li>Yard handling issues</li>
          <li>KYC disputes</li>
          <li>Auction win disputes</li>
          <li>Price manipulation claims</li>
        </ul>

        <h2>3. Dispute Categories</h2>
        <h3>A. Product Issues</h3>
        <ul>
          <li>Not working</li>
          <li>Defective</li>
          <li>Damaged</li>
          <li>Missing accessories</li>
          <li>Wrong item</li>
          <li>Fake item</li>
          <li>Condition mismatch</li>
        </ul>
        <h3>B. Delivery Issues</h3>
        <ul>
          <li>Late delivery</li>
          <li>No delivery</li>
          <li>Rude behaviour</li>
          <li>Safety incidents</li>
          <li>Damaged during transport</li>
        </ul>
        <h3>C. Auction Issues</h3>
        <ul>
          <li>Bid not counted</li>
          <li>Timer issues</li>
          <li>Wrong winner</li>
          <li>Fraudulent bidding</li>
          <li>System glitch</li>
        </ul>
        <h3>D. Payment/Wallet Issues</h3>
        <ul>
          <li>Double charge</li>
          <li>Failed refund</li>
          <li>Unsettled payout</li>
          <li>Wrong settlement</li>
        </ul>
        <h3>E. Account Issues</h3>
        <ul>
          <li>Wrong KYC rejection</li>
          <li>Suspended account</li>
          <li>Access issues</li>
        </ul>

        <h2>4. Dispute Filing Process</h2>
        <h3>Step 1 — User raises dispute</h3>
        <p>Via:</p>
        <ul>
          <li>App</li>
          <li>Chat support</li>
          <li>Email</li>
          <li>Help Center</li>
        </ul>
        <h3>Step 2 — Mandatory Evidence Required</h3>
        <p>User must upload:</p>
        <ul>
          <li>Photos</li>
          <li>Videos</li>
          <li>Screenshots</li>
          <li>Unboxing proof</li>
          <li>Delivery proof</li>
          <li>Chat history</li>
          <li>Auction recording (if applicable)</li>
        </ul>
        <h3>Step 3 — System logs attached automatically</h3>
        <p>Includes:</p>
        <ul>
          <li>Bid logs</li>
          <li>Transaction logs</li>
          <li>Delivery logs</li>
          <li>KYC logs</li>
          <li>Device/IP history</li>
        </ul>
        <h3>Step 4 — AI preliminary decision</h3>
        <p>AI detects:</p>
        <ul>
          <li>Fake evidence</li>
          <li>Manipulated photos</li>
          <li>Duplicate fraud patterns</li>
          <li>Repeated complaints</li>
        </ul>
        <p>Then forwarded to human review.</p>

        <h2>5. Evidence Rules</h2>
        <p>Accepted evidence:</p>
        <ul>
          <li>Clear photos</li>
          <li>Unedited videos</li>
          <li>Delivery partner timestamped photos</li>
          <li>Chat screenshots</li>
          <li>Screen recordings</li>
          <li>System logs</li>
          <li>Event logs</li>
        </ul>
        <p>Not accepted:</p>
        <ul>
          <li>Cropped photos hiding defects</li>
          <li>Blurred images</li>
          <li>Fake invoices</li>
          <li>Photos from internet</li>
          <li>Edited videos</li>
          <li>Manipulated screenshots</li>
        </ul>
        <p>Fake evidence &rarr; fraud violation + account ban.</p>

        <h2>6. Seller Obligations</h2>
        <p>Seller must:</p>
        <ul>
          <li>Respond to disputes within 48 hours</li>
          <li>Provide original photos</li>
          <li>Provide ownership proof (for high value items)</li>
          <li>Provide packing evidence</li>
          <li>Cooperate with investigation</li>
        </ul>
        <p>Seller cannot:</p>
        <ul>
          <li>Threaten buyer</li>
          <li>Refuse legitimate dispute</li>
          <li>Provide fake proofs</li>
          <li>Delay intentionally</li>
        </ul>
        <p>Violation &rarr; seller penalties.</p>

        <h2>7. Buyer Obligations</h2>
        <p>Buyer must:</p>
        <ul>
          <li>Upload real evidence</li>
          <li>Report issue within dispute window</li>
          <li>Allow pickup for return</li>
          <li>Not remove parts from item</li>
        </ul>
        <p>Buyer CANNOT:</p>
        <ul>
          <li>Claim fake damage</li>
          <li>Try to use “refund scam”</li>
          <li>Swap items</li>
          <li>Alter photos</li>
        </ul>
        <p>False claims &rarr; buyer ban.</p>

        <h2>8. Delivery Partner Obligations</h2>
        <p>Delivery partner must:</p>
        <ul>
          <li>Upload delivery proof</li>
          <li>Report damage immediately</li>
          <li>Follow safe handling rules</li>
          <li>Provide delivery timestamp</li>
        </ul>
        <p>Partner CANNOT:</p>
        <ul>
          <li>Hide damage</li>
          <li>Steal items</li>
          <li>Fake delivery</li>
          <li>Argue with user</li>
        </ul>
        <p>Misconduct &rarr; termination + FIR.</p>

        <h2>9. Investigation Process</h2>
        <h3>Step 1 — Case assigned</h3>
        <p>Support or dispute officer receives case.</p>
        <h3>Step 2 — Evidence collected</h3>
        <p>From:</p>
        <ul>
          <li>Buyer</li>
          <li>Seller</li>
          <li>Delivery</li>
          <li>Yard</li>
          <li>System logs</li>
        </ul>
        <h3>Step 3 — Verification</h3>
        <p>Includes:</p>
        <ul>
          <li>Product authenticity</li>
          <li>Timeline verification</li>
          <li>KYC match</li>
          <li>Delivery path tracking</li>
          <li>Auction log replay</li>
          <li>Payment logs</li>
        </ul>
        <h3>Step 4 — Decision</h3>
        <p>Outcomes:</p>
        <ul>
          <li>Buyer wins</li>
          <li>Seller wins</li>
          <li>Partial fault</li>
          <li>Delivery partner at fault</li>
          <li>Yard at fault</li>
        </ul>
        <h3>Step 5 — Action taken</h3>
        <p>Possible outcomes:</p>
        <ul>
          <li>Refund</li>
          <li>Replacement</li>
          <li>Payout</li>
          <li>Penalty</li>
          <li>Warning</li>
          <li>Ban</li>
          <li>Legal escalation</li>
        </ul>

        <h2>10. Refund Rules (Dispute-Based)</h2>
        <p>Refund allowed if:</p>
        <ul>
          <li>Item fake</li>
          <li>Wrong item</li>
          <li>Severe damage</li>
          <li>Not working</li>
          <li>Major misrepresentation</li>
        </ul>
        <p>Refund NOT allowed if:</p>
        <ul>
          <li>Buyer changed mind</li>
          <li>Small scratches not affecting function</li>
          <li>Buyer broke item</li>
        </ul>
        <p>Refund modes:</p>
        <ul>
          <li>Original payment</li>
          <li>Wallet refund</li>
          <li>Partial refund (if both agree)</li>
        </ul>

        <h2>11. Return Rules</h2>
        <p>Return required if:</p>
        <ul>
          <li>Buyer wants refund (valid reason)</li>
          <li>Seller accepts return</li>
          <li>Platform mandates return</li>
        </ul>
        <p>Return NOT required if:</p>
        <ul>
          <li>Item fake (destroy rule may apply)</li>
          <li>Low-cost item &lt;₹300</li>
          <li>Consumable or hygiene product</li>
        </ul>
        <p>Returned item must:</p>
        <ul>
          <li>Match original</li>
          <li>Include all accessories</li>
          <li>Be packed safely</li>
        </ul>

        <h2>12. Dispute Resolution Timelines</h2>
        <p>Normal disputes:</p>
        <ul>
          <li>48 hours initial review</li>
          <li>3–7 days resolution</li>
        </ul>
        <p>High-value disputes:</p>
        <ul>
          <li>3–5 days review</li>
          <li>7–14 days resolution</li>
        </ul>
        <p>Fraud disputes:</p>
        <ul>
          <li>5–10 days investigation</li>
          <li>15 days resolution</li>
        </ul>
        <p>Auction disputes:</p>
        <ul>
          <li>24–48 hours (priority)</li>
        </ul>

        <h2>13. Arbitration &amp; Escalation</h2>
        <p>If user disagrees with decision:</p>
        <ul>
          <li>Case escalated to senior dispute officer</li>
          <li>Escalated to Compliance (if needed)</li>
          <li>External neutral arbitrator (if required)</li>
        </ul>
        <p>Arbitration binding under:</p>
        <ul>
          <li>Arbitration &amp; Conciliation Act, 1996</li>
        </ul>
        <p>Venue: Hyderabad jurisdiction (default)</p>
        <p>Language: English/Telugu</p>

        <h2>14. Fraud in Disputes</h2>
        <p>The platform checks for:</p>
        <ul>
          <li>Complaint patterns</li>
          <li>Repeated returns</li>
          <li>Fake videos</li>
          <li>Item switching</li>
          <li>Seller manipulation</li>
          <li>Buyer extortion</li>
          <li>Delivery partner collusion</li>
          <li>Dual-account fraud</li>
          <li>Auction replay conflicts</li>
        </ul>
        <p>Fraud result:</p>
        <ul>
          <li>Permanent ban</li>
          <li>Loss of all refunds</li>
          <li>Legal FIR</li>
          <li>For sellers → payout hold</li>
        </ul>

        <h2>15. Delivery Partner Liability</h2>
        <p>Partner responsible if:</p>
        <ul>
          <li>Item damaged during transport</li>
          <li>Mishandling occurred</li>
          <li>Wrong delivery</li>
          <li>Lost item</li>
          <li>Fake delivery update</li>
        </ul>
        <p>Penalty:</p>
        <ul>
          <li>Deduction</li>
          <li>Vendor termination</li>
          <li>FIR (serious)</li>
        </ul>

        <h2>16. Warehouse/Yard Liability</h2>
        <p>Yard liable if:</p>
        <ul>
          <li>Damage during storage</li>
          <li>Loss of item</li>
          <li>Mishandling</li>
          <li>Wrong asset tagging</li>
        </ul>
        <p>Compensation based on:</p>
        <ul>
          <li>Item value</li>
          <li>Condition mismatch</li>
          <li>Insurance coverage</li>
        </ul>

        <h2>17. Privacy Rules in Disputes</h2>
        <p>Allowed:</p>
        <ul>
          <li>Viewing necessary evidence</li>
          <li>Viewing KYC (by compliance only)</li>
          <li>Viewing delivery photos</li>
        </ul>
        <p>Forbidden:</p>
        <ul>
          <li>Sharing evidence outside case</li>
          <li>Sharing personal data</li>
          <li>Using evidence for training models (without anonymizing)</li>
        </ul>

        <h2>18. Fairness Principles</h2>
        <p>Platform follows:</p>
        <ul>
          <li>Neutrality</li>
          <li>Transparency</li>
          <li>No favoritism</li>
          <li>No discrimination</li>
          <li>Equal rights for buyers &amp; sellers</li>
          <li>Strict fraud detection</li>
        </ul>
        <p>Every case based ONLY on:</p>
        <ul>
          <li>Evidence</li>
          <li>Logs</li>
          <li>Facts</li>
        </ul>

        <h2>19. Penalties</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fake dispute claim</td>
              <td>Ban</td>
            </tr>
            <tr>
              <td>Fake evidence</td>
              <td>FIR</td>
            </tr>
            <tr>
              <td>Seller misrepresentation</td>
              <td>Ban + legal</td>
            </tr>
            <tr>
              <td>Delivery misconduct</td>
              <td>Termination</td>
            </tr>
            <tr>
              <td>Yard damage concealment</td>
              <td>FIR</td>
            </tr>
            <tr>
              <td>Auction fraud complaint abuse</td>
              <td>Ban</td>
            </tr>
            <tr>
              <td>Extortion attempt</td>
              <td>Criminal action</td>
            </tr>
          </tbody>
        </table>

        <h2>20. Responsibilities</h2>
        <h3>Buyers</h3>
        <ul>
          <li>Provide truthful evidence</li>
        </ul>
        <h3>Sellers</h3>
        <ul>
          <li>List honestly</li>
          <li>Cooperate with dispute</li>
        </ul>
        <h3>Delivery Partners</h3>
        <ul>
          <li>Deliver safely</li>
        </ul>
        <h3>Warehouse/Yard</h3>
        <ul>
          <li>Maintain item integrity</li>
        </ul>
        <h3>Support/Moderators</h3>
        <ul>
          <li>Follow rules</li>
          <li>Stay neutral</li>
        </ul>
        <h3>Compliance &amp; Fraud Team</h3>
        <ul>
          <li>Detect fraud</li>
          <li>Verify identity</li>
        </ul>
        <h3>Platform</h3>
        <ul>
          <li>Maintain fair system</li>
          <li>Publish dispute guidelines</li>
        </ul>

        <h2>21. Policy Updates</h2>
        <p>Platform may update dispute policy anytime.</p>
        <p>Updated versions appear under the Legal section.</p>
      </article>
    </div>
  );
};

export default DisputeResolutionComplaintHandlingArbitrationFairPracticePolicy;
