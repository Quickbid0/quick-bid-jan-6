import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const TermsAndConditions: React.FC = () => {
  usePageSEO({
    title: 'Terms & Conditions | QuickMela',
    description: 'Full Terms & Conditions for using the QuickMela online auction platform.',
    canonicalPath: '/legal/terms-and-conditions',
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
          <li className="text-gray-700 dark:text-gray-200">Terms &amp; Conditions</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Terms & Conditions
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Please read these Terms & Conditions carefully before using QuickMela.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p><strong>QUICKMELA  TERMS &amp; CONDITIONS</strong></p>
          <p>Last Updated: 20 November 2025<br />
          Effective Date: Immediately upon registration/use</p>
          <p>Welcome to QuickMela, an online marketplace and auction platform operated by Tekvoro Technologies (Company, we, our, us).</p>
          <p>By accessing or using QuickMela (the Platform), you (User, Buyer, Seller, Bidder) agree to comply with and be legally bound by these Terms &amp; Conditions.</p>
          <p>If you do not agree with these Terms, you must not use the Platform.</p>

          <h2>1. DEFINITIONS</h2>
          <p>Platform means the QuickMela website, mobile app, APIs, and all related services.<br />
          User means any individual or entity accessing or using the Platform.<br />
          Seller means a registered user who lists goods for auction or fixed-price sale.<br />
          Buyer / Bidder means a user who participates in auctions or purchases listed goods.<br />
          Auction means timed, live, flash, or webcast bidding events hosted on QuickMela.<br />
          Deposit means the refundable wallet amount required to participate in auctions.<br />
          Service Fee means the fee charged by QuickMela for facilitating auctions, logistics, and payment processing.<br />
          Content means product listings, descriptions, images, videos, documents, and user submissions.<br />
          Agreement means these Terms &amp; Conditions, Privacy Policy, Auction Rules, and related policies.</p>

          <h2>2. ELIGIBILITY</h2>
          <p>You may use the Platform only if:</p>
          <ul>
            <li>You are at least 18 years old;</li>
            <li>You have valid KYC documents (Aadhaar, PAN, or equivalent);</li>
            <li>You are legally capable of entering into a binding contract;</li>
            <li>You are not prohibited by law from participating in online auctions.</li>
          </ul>
          <p>QuickMela may deny access, suspend accounts, or reject verification at its sole discretion.</p>

          <h2>3. ACCOUNT REGISTRATION &amp; KYC</h2>
          <p>Users must register an account with accurate personal information.</p>
          <p>Mandatory KYC may include:</p>
          <ul>
            <li>Aadhaar</li>
            <li>PAN</li>
            <li>Driving License</li>
            <li>Passport</li>
            <li>Utility bills</li>
          </ul>
          <p>QuickMela may request additional verification (selfie, video KYC, address proof).</p>
          <p>Providing false, incorrect, or misleading information may result in immediate termination.</p>

          <h2>4. ROLE OF QUICKMELA (MARKETPLACE DISCLAIMER)</h2>
          <p>QuickMela is:</p>
          <ul>
            <li>NOT the owner or seller of goods listed on the Platform.</li>
            <li>NOT a party to the contract between Buyer &amp; Seller.</li>
            <li>NOT responsible for verifying ownership unless specified in special compliance policies (e.g., SARFAESI).</li>
          </ul>
          <p>Only a facilitator providing:</p>
          <ul>
            <li>Auction hosting</li>
            <li>Bidding technology</li>
            <li>Payment gateway integration</li>
            <li>Wallet &amp; deposit handling</li>
            <li>Delivery/logistics support (when available)</li>
            <li>Dispute support</li>
          </ul>
          <p>QuickMela does not guarantee:</p>
          <ul>
            <li>Quality</li>
            <li>Authenticity</li>
            <li>Title ownership</li>
            <li>Condition</li>
            <li>Performance</li>
            <li>Legality of goods</li>
          </ul>
          <p>unless specifically mentioned in the product description or by certified partners.</p>

          <h2>5. USER RESPONSIBILITIES</h2>
          <p>You agree to:</p>
          <ul>
            <li>Use the Platform legally and responsibly.</li>
            <li>Not engage in shill bidding, fake bidding, or bid manipulation.</li>
            <li>Not copy, scrape, clone, or reverse-engineer the Platform.</li>
            <li>Not upload harmful files, viruses, or malicious content.</li>
            <li>Not impersonate any person or use multiple accounts to manipulate auctions.</li>
            <li>Maintain confidentiality of login credentials.</li>
          </ul>

          <h2>6. AUCTION PARTICIPATION</h2>
          <p>By joining an auction, you agree to:</p>
          <ul>
            <li>Pay the refundable deposit required for entry</li>
            <li>Bid only if you intend to purchase</li>
            <li>Honour all winning bids (binding bids)</li>
            <li>Pay the full amount within the payment window (typically 24248 hours)</li>
            <li>Bear any additional taxes, registration charges, or delivery costs</li>
          </ul>
          <p>QuickMela reserves the right to:</p>
          <ul>
            <li>Reject bids</li>
            <li>Block suspicious accounts</li>
            <li>Cancel auctions (technical issues, legal requirements, fraud detection)</li>
          </ul>

          <h2>7. WINNING A BID</h2>
          <p>A winning bid is determined when:</p>
          <ul>
            <li>The auction timer ends</li>
            <li>No further bids are placed within the extension window</li>
            <li>Platform confirms the highest bidder</li>
          </ul>
          <p>Winners will receive:</p>
          <ul>
            <li>Invoice / payment request</li>
            <li>Delivery/pickup instructions</li>
            <li>Due dates for payment</li>
          </ul>
          <p>Failure to make payment:</p>
          <ul>
            <li>Leads to loss of deposit</li>
            <li>May result in blacklisting</li>
            <li>May attract penalties defined by Auction Rules &amp; Anti-Fraud Policies</li>
          </ul>

          <h2>8. SELLER OBLIGATIONS</h2>
          <p>Sellers must:</p>
          <ul>
            <li>Provide accurate product information and real photos/videos</li>
            <li>Ensure full ownership and right to sell</li>
            <li>Not list prohibited, illegal, counterfeit, or stolen items</li>
            <li>Cooperate with product verification if required</li>
            <li>Package products safely for delivery</li>
            <li>Release goods only after Platform confirmation</li>
          </ul>
          <p>QuickMela may suspend or ban sellers for repeated disputes or fraudulent listings.</p>

          <h2>9. BUYER OBLIGATIONS</h2>
          <p>Buyers must:</p>
          <ul>
            <li>Inspect product descriptions and verification reports before bidding</li>
            <li>Honour winning bids and make timely payments</li>
            <li>Not misuse cancellations or disputes</li>
            <li>Not attempt chargebacks without valid reason</li>
            <li>Accept that auction sales are typically final unless stated otherwise</li>
          </ul>

          <h2>10. PAYMENTS &amp; DEPOSITS</h2>
          <p>Deposits are mandatory for auction participation.</p>
          <p>Deposits are refundable unless:</p>
          <ul>
            <li>Buyer wins but fails to pay</li>
            <li>Fraudulent activity is detected</li>
          </ul>
          <p>Platform fees, commissions, and taxes are non-refundable.</p>
          <p>Payment gateways may charge additional fees.</p>

          <h2>11. WALLET BALANCE</h2>
          <p>Users can:</p>
          <ul>
            <li>Add funds</li>
            <li>Request withdrawals</li>
            <li>Use balance for bids &amp; purchases</li>
          </ul>
          <p>Withdrawals may require KYC verification and bank proof.</p>
          <p>Processing time is typically 15 business days.</p>

          <h2>12. CANCELLATIONS</h2>
          <p>A seller or buyer may cancel only when allowed by the specific Auction Rules or Dispute Policy.</p>
          <p>QuickMela may cancel transactions under:</p>
          <ul>
            <li>Fraud suspicion</li>
            <li>Product misrepresentation</li>
            <li>Payment failure</li>
            <li>Legal requirements</li>
            <li>Safety or compliance risks</li>
          </ul>

          <h2>13. REFUNDS</h2>
          <p>Refunds are governed by the Refund, Cancellation &amp; Dispute Policy and include:</p>
          <ul>
            <li>Deposit refunds</li>
            <li>Wallet refunds</li>
            <li>Overpayment refunds</li>
            <li>Logistics-related refunds</li>
          </ul>
          <p>Refund timelines depend on:</p>
          <ul>
            <li>Payment method</li>
            <li>Banking partners</li>
            <li>Verification of dispute</li>
          </ul>

          <h2>14. SHIPPING &amp; DELIVERY</h2>
          <p>Third-party logistics may handle pickup/delivery.</p>
          <p>Buyers agree that:</p>
          <ul>
            <li>Delivery timelines are estimates</li>
            <li>Damage claims must be submitted immediately upon delivery</li>
            <li>Return shipping is the buyers responsibility unless stated otherwise</li>
          </ul>

          <h2>15. PROHIBITED ITEMS</h2>
          <p>You may NOT list or buy:</p>
          <ul>
            <li>Illegal goods</li>
            <li>Stolen property</li>
            <li>Weapons, explosives</li>
            <li>Wildlife items</li>
            <li>Drugs or controlled substances</li>
            <li>Counterfeit or replica goods</li>
            <li>Any item prohibited by law</li>
          </ul>
          <p>QuickMela may remove items immediately without notice.</p>

          <h2>16. INTELLECTUAL PROPERTY</h2>
          <p>All trademarks, logos, UI designs, branding, images, code, and content belonging to QuickMela are protected under copyright and trademark laws.</p>
          <p>Users may not:</p>
          <ul>
            <li>Copy, distribute, replicate, or sell Platform assets</li>
            <li>Use the QuickMela brand without written permission</li>
          </ul>
          <p>User-uploaded content remains the property of the user, but QuickMela receives a worldwide license to display it.</p>

          <h2>17. LIMITATION OF LIABILITY</h2>
          <p>QuickMela is not liable for:</p>
          <ul>
            <li>Product defects or quality</li>
            <li>Ownership disputes</li>
            <li>Delayed delivery</li>
            <li>Losses due to bidding or pricing</li>
            <li>Financial losses from fraud committed by other users</li>
            <li>Technical failures, downtime, or data loss</li>
          </ul>
          <p>Our liability will never exceed the total amount paid by the user to the Platform in the previous 3 months.</p>

          <h2>18. INDEMNIFICATION</h2>
          <p>You agree to indemnify and hold harmless QuickMela and Tekvoro Technologies from:</p>
          <ul>
            <li>Claims by buyers or sellers</li>
            <li>Legal disputes</li>
            <li>Losses caused by your misuse</li>
            <li>Fraud, misrepresentation, or violations committed by you</li>
          </ul>

          <h2>19. TERMINATION</h2>
          <p>QuickMela may suspend or terminate accounts for:</p>
          <ul>
            <li>Fraud</li>
            <li>Abuse or harassment</li>
            <li>Multiple disputes</li>
            <li>Payment failures</li>
            <li>Illegal activities</li>
          </ul>
          <p>Users may delete their account anytime, subject to settlement of dues.</p>

          <h2>20. GOVERNING LAW &amp; JURISDICTION</h2>
          <p>These Terms shall be governed by the laws of India.</p>
          <p>Any disputes shall be subject to the exclusive jurisdiction of Hyderabad, Telangana courts.</p>

          <h2>21. AMENDMENTS</h2>
          <p>QuickMela may update these Terms anytime.</p>
          <p>Continued use after updates constitutes acceptance.</p>

          <h2>22. CONTACT INFORMATION</h2>
          <p>QuickMela  Tekvoro Technologies<br />
          Email: tekvoro@gmail.com<br />
          Phone: +91 9121331813<br />
          Address: 5-24-190, NTR Nagar, Gajularamaram, Hyderabad, Telangana, 500055</p>
        </div>
      </article>
    </div>
  );
};

export default TermsAndConditions;
