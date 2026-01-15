import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const PlatformModerationContentReviewListingApprovalTakedownPolicy: React.FC = () => {
  usePageSEO({
    title: 'Platform Moderation, Content Review, Listing Approval & Takedown Policy | QuickMela',
    description:
      'Governs how items, users, listings, media, chats, reviews, and auction entries are moderated, approved, restricted, or removed on QuickMela.',
    canonicalPath: '/legal/platformmoderation-contentreview-listingapproval-takedown-policy',
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
            Platform Moderation, Content Review, Listing Approval &amp; Takedown Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Platform Moderation, Content Review, Listing Approval &amp; Takedown Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy governs how items, users, listings, media, chats, reviews, seller content, and auction entries are
          moderated, approved, restricted, or removed on QuickMela to ensure legality, safety, and trust.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>Safety of users</li>
          <li>Removal of illegal and harmful content</li>
          <li>Prevention of fraud and scams</li>
          <li>Consistent moderation rules</li>
          <li>Fast takedowns of prohibited items</li>
          <li>Protection of buyers and sellers</li>
          <li>Compliance with Indian IT Rules &amp; Consumer Protection Act</li>
          <li>Fair and neutral decision-making</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to all:</p>
        <ul>
          <li>Listings</li>
          <li>Photos/videos</li>
          <li>Seller descriptions</li>
          <li>Chat messages</li>
          <li>Reviews/comments</li>
          <li>Auction titles</li>
          <li>Usernames</li>
          <li>Profiles</li>
          <li>Seller stores</li>
          <li>Delivery partner uploads</li>
          <li>Yard images</li>
          <li>Support staff notes</li>
        </ul>
        <p>Applies to:</p>
        <ul>
          <li>Buyers</li>
          <li>Sellers</li>
          <li>Delivery partners</li>
          <li>Yard operators</li>
          <li>Admins</li>
          <li>Moderators</li>
          <li>Vendors</li>
        </ul>

        <h2>3. Moderation Types</h2>
        <h3>A. Automated AI Moderation</h3>
        <p>AI scans for:</p>
        <ul>
          <li>Illegal items</li>
          <li>Fake items</li>
          <li>Counterfeits</li>
          <li>Stolen goods</li>
          <li>Misleading descriptions</li>
          <li>Offensive content</li>
          <li>Duplicate listings</li>
          <li>Price manipulation</li>
          <li>Suspicious bidding</li>
          <li>Risky behaviour patterns</li>
        </ul>
        <h3>B. Manual Moderator Review</h3>
        <p>Human review for:</p>
        <ul>
          <li>Flagged listings</li>
          <li>High-value items</li>
          <li>Disputed items</li>
          <li>Edge cases</li>
        </ul>
        <h3>C. Community Reporting</h3>
        <p>Users can report:</p>
        <ul>
          <li>Fake items</li>
          <li>Abuse</li>
          <li>Scam attempts</li>
          <li>Safety threats</li>
        </ul>
        <p>Moderators act within 24–48 hours.</p>

        <h2>4. Content That Requires Rejection (Full Takedown)</h2>
        <p>Content that MUST be removed immediately:</p>
        <h3>Illegal Items</h3>
        <ul>
          <li>Weapons</li>
          <li>Ammunition</li>
          <li>Drugs</li>
          <li>Wildlife items</li>
          <li>Stolen items</li>
          <li>Counterfeits</li>
          <li>Hazardous materials</li>
          <li>Banned electronics</li>
        </ul>
        <h3>Fraudulent Listings</h3>
        <ul>
          <li>Fake photos</li>
          <li>Stock images for used items</li>
          <li>Listings without item possession</li>
          <li>Incorrect condition disclosure</li>
          <li>Manipulated item values</li>
        </ul>
        <h3>Harmful or Unsafe Content</h3>
        <ul>
          <li>Violence</li>
          <li>Abuse</li>
          <li>Harassment</li>
          <li>Threats</li>
          <li>Hate speech</li>
          <li>Adult content</li>
        </ul>
        <h3>Prohibited Behaviour</h3>
        <ul>
          <li>Multi-account collusion</li>
          <li>Fake bidding</li>
          <li>Price manipulation</li>
          <li>Seller-buyer collusion</li>
          <li>Misuse of platform tools</li>
        </ul>

        <h2>5. Listing Approval Workflow</h2>
        <p>Step 1 — Seller Upload</p>
        <p>Photos + description added.</p>
        <p>Step 2 — AI Screening</p>
        <p>Checks:</p>
        <ul>
          <li>Legality</li>
          <li>Photo authenticity</li>
          <li>Counterfeits</li>
          <li>Risk score</li>
          <li>Duplication</li>
        </ul>
        <p>Step 3 — Compliance Review (If High-Risk)</p>
        <p>Triggered if:</p>
        <ul>
          <li>High-value</li>
          <li>Suspicious description</li>
          <li>Stolen-goods indicators</li>
          <li>Electronics/IMEI mismatch</li>
          <li>Art/collectibles</li>
          <li>Hazardous items</li>
        </ul>
        <p>Step 4 — Decision</p>
        <ul>
          <li>Approved</li>
          <li>Rejected</li>
          <li>Needs more evidence</li>
          <li>Needs additional documents</li>
        </ul>
        <p>Step 5 — Live Listing</p>
        <p>Only after passing all checks.</p>

        <h2>6. Takedown Reasons (Immediate Removal)</h2>
        <p>Listings removed if:</p>
        <ul>
          <li>Against law</li>
          <li>Against safety rules</li>
          <li>Misleading</li>
          <li>Dangerous</li>
          <li>Abusive</li>
          <li>Fake</li>
          <li>Violates IP</li>
          <li>Contains personal data</li>
          <li>Attempts to scam</li>
          <li>Violates auction rules</li>
        </ul>
        <p>Admins may remove without notice if urgent.</p>

        <h2>7. Seller Restrictions During Moderation</h2>
        <p>Sellers cannot:</p>
        <ul>
          <li>Re-upload rejected items without correction</li>
          <li>Upload photos of another seller's item</li>
          <li>Misrepresent condition</li>
          <li>Edit high-value listings after approval (requires re-verification)</li>
          <li>Upload suspicious or edited media</li>
          <li>Upload watermarked photos from other brands</li>
        </ul>

        <h2>8. Review &amp; Appeal System</h2>
        <p>If seller believes listing was wrongly removed:</p>
        <ul>
          <li>Submit appeal</li>
          <li>Provide additional proof</li>
          <li>Moderator review within 48 hours</li>
          <li>Final decision by Compliance Team</li>
        </ul>
        <p>Appeals for illegal items → rejected automatically.</p>

        <h2>9. Moderator &amp; Admin Rules</h2>
        <p>Moderators MUST:</p>
        <ul>
          <li>Stay neutral</li>
          <li>Follow policy strictly</li>
          <li>Not favour any seller</li>
          <li>Not ignore community reports</li>
          <li>Not modify logs</li>
          <li>Not delete evidence</li>
          <li>Document all actions</li>
          <li>Follow audit trail</li>
        </ul>
        <p>Misuse of moderation tools → termination.</p>

        <h2>10. Timeframes for Moderation</h2>
        <p>AI review: instantly</p>
        <p>Human review (normal): 24 hours</p>
        <p>High-risk items: 48–72 hours</p>
        <p>Fraud checks: up to 5 days</p>
        <p>Urgent takedowns: immediate</p>
        <p>Appeals: 48 hours</p>

        <h2>11. Chat &amp; User Behavior Moderation</h2>
        <p>Chats monitored for:</p>
        <ul>
          <li>Abuse</li>
          <li>Harassment</li>
          <li>Threats</li>
          <li>Fraud attempts</li>
          <li>Exchange of personal payment IDs</li>
          <li>Off-platform transactions</li>
        </ul>
        <p>Violations lead to:</p>
        <ul>
          <li>Warnings</li>
          <li>Message blocking</li>
          <li>Account suspension</li>
          <li>Permanent ban</li>
        </ul>

        <h2>12. Review &amp; Rating Moderation</h2>
        <p>Not allowed:</p>
        <ul>
          <li>Fake reviews</li>
          <li>Paid reviews</li>
          <li>Revenge reviews</li>
          <li>Racist comments</li>
          <li>Seller retaliation</li>
          <li>Abuse in comments</li>
        </ul>
        <p>Moderators may:</p>
        <ul>
          <li>Remove fake reviews</li>
          <li>Restore honest reviews</li>
          <li>Penalize manipulative behaviour</li>
        </ul>

        <h2>13. Auction-Specific Moderation Rules</h2>
        <p>Monitors:</p>
        <ul>
          <li>Fake bidding patterns</li>
          <li>Bot activity</li>
          <li>Suspicious price jumps</li>
          <li>Collusion between users</li>
          <li>Bid withdrawal abuse</li>
        </ul>
        <p>Actions:</p>
        <ul>
          <li>Bid invalidation</li>
          <li>Auction cancellation</li>
          <li>User ban</li>
          <li>Seller account freeze</li>
        </ul>

        <h2>14. Intellectual Property (IP) Violations</h2>
        <p>Immediate removal for:</p>
        <ul>
          <li>Copyrighted images</li>
          <li>Fake brand logos</li>
          <li>Counterfeits</li>
          <li>Stolen design assets</li>
          <li>Trademark misuse</li>
        </ul>
        <p>Repeat offenders → permanent ban.</p>

        <h2>15. Community Guidelines Enforcement</h2>
        <p>Users must not:</p>
        <ul>
          <li>Harass</li>
          <li>Threaten</li>
          <li>Abuse</li>
          <li>Spam</li>
          <li>Promote illegal content</li>
          <li>Run scams</li>
          <li>Post misleading information</li>
        </ul>
        <p>Failure → penalties.</p>

        <h2>16. Escalation Levels for Moderation Decisions</h2>
        <ul>
          <li>Level 1: Moderator</li>
          <li>Level 2: Senior Moderator</li>
          <li>Level 3: Compliance Team</li>
          <li>Level 4: Legal Officer (for criminal cases)</li>
        </ul>

        <h2>17. Penalties for Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Illegal items</td>
              <td>Permanent ban + FIR</td>
            </tr>
            <tr>
              <td>Counterfeits</td>
              <td>Seller ban</td>
            </tr>
            <tr>
              <td>Fake bidding</td>
              <td>Device ban</td>
            </tr>
            <tr>
              <td>Price manipulation</td>
              <td>Suspension + penalty</td>
            </tr>
            <tr>
              <td>Fake photos</td>
              <td>Listing removal + warning</td>
            </tr>
            <tr>
              <td>Hate speech</td>
              <td>Immediate suspension</td>
            </tr>
            <tr>
              <td>Threatening behaviour</td>
              <td>Account removal</td>
            </tr>
            <tr>
              <td>Massive fraud</td>
              <td>Police complaint</td>
            </tr>
            <tr>
              <td>Misleading listings</td>
              <td>Rejection + seller probation</td>
            </tr>
            <tr>
              <td>IP violations</td>
              <td>DMCA removal + ban</td>
            </tr>
          </tbody>
        </table>

        <h2>18. Responsibilities</h2>
        <h3>Sellers</h3>
        <ul>
          <li>Provide accurate listings</li>
          <li>Follow rules</li>
        </ul>
        <h3>Buyers</h3>
        <ul>
          <li>Report fake items</li>
          <li>Avoid fraud</li>
        </ul>
        <h3>Moderators</h3>
        <ul>
          <li>Review fairly</li>
          <li>Act neutrally</li>
        </ul>
        <h3>Compliance Team</h3>
        <ul>
          <li>Handle escalations</li>
          <li>Manage removals</li>
        </ul>
        <h3>Platform</h3>
        <ul>
          <li>Maintain safe ecosystem</li>
          <li>Provide moderation tools</li>
        </ul>

        <h2>19. Policy Updates</h2>
        <p>The platform may update this moderation policy at any time.</p>
      </article>
    </div>
  );
};

export default PlatformModerationContentReviewListingApprovalTakedownPolicy;
