import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AntiFraudShillBiddingPolicy: React.FC = () => {
  usePageSEO({
    title: 'Anti-Fraud & Anti–Shill Bidding Policy | QuickMela',
    description: 'Policy outlining anti-fraud, anti–shill bidding, and enforcement mechanisms on QuickMela.',
    canonicalPath: '/legal/anti-fraud-shill-bidding',
    robots: 'index,follow',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-primary-600">Home</Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link to="/legal" className="hover:text-primary-600">Legal</Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 dark:text-gray-200">Anti-Fraud &amp; Anti–Shill Bidding Policy</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Anti-Fraud &amp; Anti–Shill Bidding Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Rules and enforcement against fraudulent and manipulative bidding activities.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p><strong>QUICKMELA  ANTI-FRAUD &amp; ANTI–SHILL BIDDING POLICY</strong></p>
          <p>Last Updated: 20 November 2025<br />
          Effective Date: Immediately</p>
          <p>QuickMela maintains a zero-tolerance stance against fraud, shill bidding, manipulation, and unfair auction practices.</p>
          <p>This policy applies to all users, including buyers, sellers, bidders, investors, and visitors.</p>
          <p>By using the QuickMela platform, you agree to follow this policy along with the Terms &amp; Conditions, Auction Rules, Buyer Policy, and Seller Policy.</p>

          <h2>1. PURPOSE OF THIS POLICY</h2>
          <p>This policy aims to:</p>
          <ul>
            <li>Ensure fairness in all QuickMela auctions</li>
            <li>Protect genuine buyers and sellers</li>
            <li>Maintain platform integrity</li>
            <li>Prevent price manipulation</li>
            <li>Detect and eliminate fraudulent behaviour</li>
            <li>Comply with legal obligations (IT Act 2000, IPC 420, Contract Act 1872)</li>
          </ul>

          <h2>2. WHAT COUNTS AS FRAUD?</h2>
          <p>Fraud includes, but is not limited to:</p>

          <h3>A. Identity Fraud</h3>
          <ul>
            <li>Fake KYC</li>
            <li>Using someone else’s documents</li>
            <li>Multiple accounts under different names</li>
            <li>Faking address/ownership details</li>
          </ul>

          <h3>B. Payment Fraud</h3>
          <ul>
            <li>Chargeback misuse</li>
            <li>Using stolen cards/accounts</li>
            <li>False payment confirmation</li>
            <li>Intentional non-payment after winning</li>
          </ul>

          <h3>C. Listing Fraud (Seller-Side)</h3>
          <ul>
            <li>Stolen items</li>
            <li>Misrepresented products</li>
            <li>Fake images/videos</li>
            <li>Duplicate postings to manipulate demand</li>
          </ul>

          <h3>D. Auction Fraud</h3>
          <ul>
            <li>Shill bidding</li>
            <li>Price boosting</li>
            <li>Collusive bidding</li>
            <li>Multiple accounts used to manipulate prices</li>
          </ul>

          <h3>E. Behavioural Fraud</h3>
          <ul>
            <li>Abuse of dispute system</li>
            <li>Filing false claims</li>
            <li>Fabricating evidence</li>
            <li>Engaging in threats, harassment, or extortion</li>
          </ul>

          <h2>3. WHAT IS SHILL BIDDING?</h2>
          <p>Shill bidding occurs when:</p>
          <ul>
            <li>A seller bids on their own item</li>
            <li>A friend, family member, or associate bids to increase price</li>
            <li>Multiple accounts are used to artificially raise bids</li>
            <li>Paid agents are used to manipulate bidding</li>
            <li>Coordinated group bidding is used to mislead buyers</li>
          </ul>
          <p>Shill bidding is illegal under Indian Penal Code (IPC 420) and is strictly prohibited.</p>

          <h2>4. PROHIBITED ACTIVITIES</h2>
          <p>The following are strictly prohibited on QuickMela:</p>
          <ul>
            <li>Creating multiple accounts to influence auctions</li>
            <li>Bidding on your own listing</li>
            <li>Coordinating with others to boost prices</li>
            <li>Using VPN/Proxy to hide true identity</li>
            <li>Attempting to hack/modify bidding systems</li>
            <li>Automated bot bidding without platform approval</li>
            <li>Manipulating deposits/refunds</li>
            <li>Using fake or incomplete KYC</li>
            <li>Unauthorized access of other accounts</li>
            <li>Sharing sensitive platform data or internal analytics</li>
            <li>Attempting to reverse payments without valid reason</li>
            <li>Attempting to disrupt auctions intentionally</li>
          </ul>
          <p>Any attempt to cheat or influence auction outcomes is considered fraud.</p>

          <h2>5. FRAUD DETECTION SYSTEMS</h2>
          <p>QuickMela uses a multi-layered fraud detection mechanism:</p>

          <h3>A. AI-Based Behaviour Analysis</h3>
          <ul>
            <li>Unusual bidding patterns</li>
            <li>Sudden high-value jumps</li>
            <li>Sibling IP/device patterns</li>
            <li>Rapid multi-account switching</li>
          </ul>

          <h3>B. KYC Verification</h3>
          <ul>
            <li>Aadhaar/PAN validation</li>
            <li>Bank account verification</li>
            <li>Address cross-checking</li>
          </ul>

          <h3>C. Device Fingerprinting</h3>
          <ul>
            <li>Tracks unique device signatures</li>
            <li>Prevents multi-account abuse</li>
          </ul>

          <h3>D. IP &amp; Location Monitoring</h3>
          <ul>
            <li>Detects proxy servers</li>
            <li>Identifies coordinated group bidding</li>
          </ul>

          <h3>E. Manual Review</h3>
          <ul>
            <li>Dedicated Fraud Review Team</li>
            <li>Escalation to compliance officers</li>
          </ul>

          <h2>6. ACTIONS TAKEN AGAINST FRAUD</h2>
          <p>If fraud is detected or suspected, QuickMela may enforce one or more of the following actions:</p>

          <h3>A. Immediate Account Suspension</h3>
          <p>Without notice, pending investigation.</p>

          <h3>B. Permanent Ban</h3>
          <p>If fraud is confirmed.</p>

          <h3>C. Forfeiture of Deposit</h3>
          <p>Deposit will NOT be refunded if the user:</p>
          <ul>
            <li>Manipulated bids</li>
            <li>Won and refused to pay</li>
            <li>Created fake accounts</li>
            <li>Abused chargebacks</li>
          </ul>

          <h3>D. Blocking Devices &amp; IP Addresses</h3>
          <p>Permanent device-level and IP-level ban.</p>

          <h3>E. Removal of Listings</h3>
          <p>Fake or misleading listings will be deleted immediately.</p>

          <h3>F. Reversal of Auction Results</h3>
          <p>Winning bids may be canceled if fraud is involved.</p>

          <h3>G. Legal Action</h3>
          <p>Fraud may result in prosecution under:</p>
          <ul>
            <li>IPC Section 420 – Cheating</li>
            <li>IT Act Section 66D – Online impersonation</li>
            <li>IT Act Section 43 – Unauthorized access</li>
            <li>Contract Act 1872 – Breach of contract</li>
            <li>Other applicable cybercrime laws</li>
          </ul>

          <h3>H. Police Complaints</h3>
          <p>For severe cases (stolen goods, payment fraud, identity theft).</p>

          <h2>7. HIGH-RISK USER VERIFICATION</h2>
          <p>QuickMela may subject certain users to Enhanced Verification, including:</p>
          <ul>
            <li>Video KYC</li>
            <li>Address verification</li>
            <li>Bank statement submission</li>
            <li>PAN–Aadhaar matching</li>
            <li>Income source verification (for high-value bidding)</li>
            <li>Face-match verification</li>
          </ul>
          <p>This is mandatory for:</p>
          <ul>
            <li>High-value item bidders</li>
            <li>Suspicious activity users</li>
            <li>Repeat auction winners</li>
            <li>Those involved in disputes</li>
          </ul>

          <h2>8. BUYER-SIDE FRAUD EXAMPLES</h2>
          <ul>
            <li>Winning and refusing to pay</li>
            <li>Creating multiple bidder accounts</li>
            <li>Fake complaints for refunds</li>
            <li>Intentional chargebacks</li>
            <li>Misuse of wallet refunds</li>
            <li>Claiming “item not received” after receiving it</li>
            <li>Uploading fake evidence during disputes</li>
          </ul>
          <p>All these lead to immediate penalties.</p>

          <h2>9. SELLER-SIDE FRAUD EXAMPLES</h2>
          <ul>
            <li>Posting stolen items</li>
            <li>Fake images or third-party pictures</li>
            <li>Listing non-existent inventory</li>
            <li>Inflating bids using friends/family</li>
            <li>Not dispatching items after sale</li>
            <li>Canceling after auction end</li>
            <li>Listing items with undeclared defects</li>
          </ul>
          <p>Sellers involved will be banned and reported.</p>

          <h2>10. FRAUD DURING LIVE / WEBCAST AUCTIONS</h2>
          <p>Strict monitoring is enforced for:</p>
          <ul>
            <li>Rapid repetitive bid attempts</li>
            <li>Fake bidder IDs</li>
            <li>Collusive groups</li>
            <li>Remote bidding via proxies</li>
          </ul>
          <p>Auctioneer’s decision is final.</p>

          <h2>11. CONSEQUENCES OF SHILL BIDDING</h2>
          <p>If a seller or associated user is caught shill bidding:</p>
          <ul>
            <li>Entire deposit forfeited</li>
            <li>All ongoing and scheduled listings suspended</li>
            <li>Lifetime ban</li>
            <li>Potential police case</li>
            <li>QuickMela may recover damages or losses</li>
          </ul>

          <h2>12. REPORTING FRAUD</h2>
          <p>Users can report suspicious activity at:</p>
          <p>📧 tekvoro@gmail.com<br />
          📞 +91 9121331813</p>
          <p>Reports must include:</p>
          <ul>
            <li>Auction ID</li>
            <li>User ID (if known)</li>
            <li>Screenshots or video proof</li>
            <li>Description of fraudulent activity</li>
          </ul>
          <p>QuickMela investigates all reports confidentially.</p>

          <h2>13. DISPUTES RELATED TO FRAUD</h2>
          <p>If a user is accused of fraud:</p>
          <ul>
            <li>A case file is created</li>
            <li>Evidence is reviewed</li>
            <li>Counter-evidence may be requested</li>
            <li>Verification checks are run</li>
            <li>Final decision is communicated</li>
          </ul>
          <p>QuickMela’s decision is binding and final.</p>

          <h2>14. LIMITATION OF LIABILITY</h2>
          <p>QuickMela is NOT responsible for:</p>
          <ul>
            <li>Losses due to another user’s fraud</li>
            <li>Damage or theft outside platform control</li>
            <li>Fake products if seller misleads buyers</li>
            <li>External scams unrelated to QuickMela</li>
            <li>Third-party handling or logistics fraud</li>
          </ul>
          <p>However, we will take action when violation is proven.</p>

          <h2>15. POLICY AMENDMENTS</h2>
          <p>QuickMela may update this policy periodically.</p>
          <p>Updated version applies immediately upon publication.</p>

          <h2>16. CONTACT FOR LEGAL &amp; FRAUD ISSUES</h2>
          <p>QuickMela  Tekvoro Technologies<br />
          📧 Email: tekvoro@gmail.com<br />
          📞 Phone: +91 9121331813<br />
          📍 Address: 5-24-190, NTR Nagar, Gajularamaram, Hyderabad, Telangana  500055</p>
        </div>
      </article>
    </div>
  );
};

export default AntiFraudShillBiddingPolicy;
