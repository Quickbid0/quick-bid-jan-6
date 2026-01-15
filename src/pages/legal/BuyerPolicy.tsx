import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const BuyerPolicy: React.FC = () => {
  usePageSEO({
    title: 'Buyer Policy | QuickMela',
    description: 'Full Buyer Policy explaining rules and responsibilities for buyers on QuickMela.',
    canonicalPath: '/legal/buyer-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Buyer Policy</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Buyer Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Guidelines and obligations for buyers participating in QuickMela auctions.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p><strong>QUICKMELA ႓ BUYER POLICY</strong></p>
          <p>Last Updated: 20 November 2025<br />
          Effective Date: Immediately</p>
          <p>This Buyer Policy outlines the rights, obligations, and rules for Buyers / Bidders / Participants (you, your) on QuickMela, owned and operated by Tekvoro Technologies (Company, we, our, us).</p>
          <p>By bidding, buying, or participating in any auction or purchase on QuickMela, you agree to this Policy along with the Terms &amp; Conditions, Privacy Policy, Auction Rules, and Anti-Fraud Policy.</p>

          <h2>1. SCOPE OF THIS POLICY</h2>
          <p>This policy applies to all buyers who:</p>
          <ul>
            <li>Register an account</li>
            <li>Participate in auctions</li>
            <li>Make purchases</li>
            <li>Join timed, flash, live, or webcast auctions</li>
            <li>Pay deposits or wallet balances</li>
            <li>Interact with sellers or delivery partners</li>
          </ul>
          <p>This policy governs both auction-based purchases and fixed-price listings on QuickMela.</p>

          <h2>2. BUYER ELIGIBILITY</h2>
          <p>You must:</p>
          <ul>
            <li>Be at least 18 years old</li>
            <li>Have valid KYC documentation:</li>
          </ul>
          <ul>
            <li>Aadhaar</li>
            <li>PAN</li>
            <li>Address proof</li>
          </ul>
          <ul>
            <li>Have an active mobile number &amp; email</li>
            <li>Agree to all platform rules</li>
            <li>Maintain an active wallet/deposit balance (when required)</li>
            <li>Not be banned or restricted by QuickMela</li>
          </ul>

          <h2>3. BUYER ACCOUNT RESPONSIBILITIES</h2>
          <p>As a Buyer, you agree to:</p>
          <ul>
            <li>Provide accurate personal information</li>
            <li>Complete KYC verification</li>
            <li>Maintain confidentiality of your login credentials</li>
            <li>Use only one account (multiple accounts are prohibited)</li>
            <li>Update contact details if they change</li>
            <li>Not misuse the platform, auctions, or dispute systems</li>
          </ul>

          <h2>4. UNDERSTANDING AUCTION PARTICIPATION</h2>
          <p>By joining an auction:</p>
          <ul>
            <li>You acknowledge that every bid is legally binding</li>
            <li>You agree to pay the winning bid amount</li>
            <li>You agree to pay applicable fees &amp; taxes</li>
            <li>You acknowledge that item condition is as described by the Seller</li>
            <li>You confirm you have sufficient funds to complete payment</li>
          </ul>
          <p>Bidding is not a trial or preview — it is a contractual commitment.</p>

          <h2>5. BUYER DEPOSITS</h2>
          <p>Most auctions require a refundable security deposit.</p>

          <h3>A. Deposit Refund</h3>
          <p>Deposits are refunded when:</p>
          <ul>
            <li>You do not win</li>
            <li>No violations occurred</li>
            <li>No disputes or fraud indicators exist</li>
          </ul>

          <h3>B. Deposit Forfeiture</h3>
          <p>Your deposit may be forfeited if:</p>
          <ul>
            <li>You win but refuse to pay</li>
            <li>You attempt to manipulate auctions</li>
            <li>Fraud activities are detected</li>
            <li>You cancel without permitted reasons</li>
            <li>You misuse chargebacks</li>
          </ul>

          <h2>6. PLACING BIDS</h2>
          <p>You agree that:</p>
          <ul>
            <li>All bids are final and cannot be withdrawn</li>
            <li>You understand the increment value</li>
            <li>You will not place bids without intention to purchase</li>
            <li>You will not allow others to bid using your account</li>
            <li>Auto-bid limits are binding</li>
            <li>You must monitor the auction until it ends</li>
          </ul>
          <p>Bid manipulation or joking bids are considered misconduct.</p>

          <h2>7. WINNING AN AUCTION</h2>
          <p>If you win an auction:</p>
          <p>You must:</p>
          <ul>
            <li>Pay the full amount within the specified payment window (usually 2448 hours)</li>
            <li>Pay service fees, GST, and delivery/handling charges</li>
            <li>Complete any required verification</li>
            <li>Follow pickup/delivery instructions</li>
          </ul>
          <p>Failure to pay leads to:</p>
          <ul>
            <li>Deposit forfeiture</li>
            <li>Account suspension</li>
            <li>Ban from future auctions</li>
            <li>Legal action for fraud (if applicable)</li>
          </ul>

          <h2>8. PAYMENT TERMS</h2>
          <p>Buyers must pay:</p>
          <ul>
            <li>Winning bid amount</li>
            <li>Platform fees</li>
            <li>Taxes (GST, RTO, etc.)</li>
            <li>Delivery/logistics fees</li>
            <li>Storage fees (if applicable)</li>
          </ul>
          <p>Accepted payment methods:</p>
          <ul>
            <li>UPI</li>
            <li>Net banking</li>
            <li>Debit/Credit cards</li>
            <li>Wallet balance</li>
            <li>Bank transfers (for high-value items)</li>
          </ul>
          <p>Partial payments may not be accepted unless explicitly stated.</p>

          <h2>9. PRODUCT CONDITION &amp; BUYER RESPONSIBILITY</h2>
          <p>Buyers must:</p>
          <ul>
            <li>Carefully read product descriptions</li>
            <li>Review photos, videos, and verification reports</li>
            <li>Understand “as-is” sales policy (unless verified otherwise)</li>
            <li>Clarify doubts before bidding</li>
          </ul>
          <p>QuickMela and Sellers are NOT responsible for:</p>
          <ul>
            <li>Assumptions made by the Buyer</li>
            <li>Issues disclosed in the listing</li>
            <li>Hidden defects unless misrepresentation is proven</li>
          </ul>

          <h2>10. PICKUP, DELIVERY &amp; INSPECTION</h2>
          <p>After payment:</p>

          <h3>A. Delivery</h3>
          <p>Items may be delivered by:</p>
          <ul>
            <li>Third-party logistics partners</li>
            <li>Seller self-delivery</li>
            <li>Buyer pickup (where applicable)</li>
          </ul>

          <h3>B. Inspection</h3>
          <p>Buyers must inspect items:</p>
          <ul>
            <li>Immediately upon delivery/pickup</li>
            <li>Before signing delivery confirmation</li>
          </ul>
          <p>Any damage claims must be raised immediately with:</p>
          <ul>
            <li>Photos</li>
            <li>Videos</li>
            <li>Delivery proof</li>
          </ul>
          <p>After confirmation, responsibility shifts to the Buyer.</p>

          <h2>11. DISPUTES &amp; RESOLUTION</h2>
          <p>Buyers may raise disputes for:</p>
          <ul>
            <li>Item significantly different from description</li>
            <li>Item not received</li>
            <li>Damage during delivery</li>
            <li>Fraud by seller</li>
          </ul>
          <p>Dispute process:</p>
          <ul>
            <li>Buyer raises ticket with evidence</li>
            <li>Platform reviews within 4872 hours</li>
            <li>Seller may be asked to provide proof</li>
            <li>Final decision is made by QuickMela</li>
          </ul>
          <p>Platform decision is final and binding.</p>
          <p>False or malicious disputes result in penalties.</p>

          <h2>12. PROHIBITED BUYER BEHAVIOURS</h2>
          <p>Buyers must NOT:</p>
          <ul>
            <li>Create multiple accounts</li>
            <li>Place fake bids</li>
            <li>Bid without intention to buy</li>
            <li>Engage in shill bidding</li>
            <li>Share account credentials</li>
            <li>Misuse the dispute/refund system</li>
            <li>Threaten or harass sellers or staff</li>
            <li>Attempt chargebacks without valid reason</li>
            <li>Manipulate auction results</li>
            <li>Spread false information</li>
            <li>Request cancellations after winning</li>
            <li>Fraudulently claim “item not received”</li>
          </ul>
          <p>Any violation leads to strict penalties.</p>

          <h2>13. PENALTIES FOR BUYER MISCONDUCT</h2>
          <p>Penalties include:</p>
          <ul>
            <li>Forfeiture of deposit</li>
            <li>Blocking of account</li>
            <li>Permanent ban</li>
            <li>Reporting to law enforcement</li>
            <li>Legal action under IPC 420 (cheating)</li>
            <li>Fraud record marked on QuickMela’s internal systems</li>
          </ul>

          <h2>14. REFUNDS TO BUYERS</h2>
          <p>Refunds are governed by the Refund &amp; Dispute Policy.</p>
          <p>Refunds may apply to:</p>
          <ul>
            <li>Deposits</li>
            <li>Overpayments</li>
            <li>Cancelled orders</li>
            <li>Cancelled auctions</li>
          </ul>
          <p>Refund timelines:</p>
          <ul>
            <li>Wallet refunds: Instant to 24 hours</li>
            <li>Bank refunds: 15 business days</li>
            <li>UPI refunds: Instant to 48 hours</li>
          </ul>
          <p>Platform fees, commissions, and penalties are not refundable.</p>

          <h2>15. BUYER LIABILITY</h2>
          <p>The buyer is fully responsible for:</p>
          <ul>
            <li>Completing auction payment</li>
            <li>Ensuring correct delivery address</li>
            <li>Complying with age and eligibility requirements</li>
            <li>Paying any government-related fees (RTO, transfer, taxes)</li>
            <li>Compliance with SARFAESI rules (if applicable)</li>
          </ul>
          <p>QuickMela is not liable for:</p>
          <ul>
            <li>Buyer’s negligence</li>
            <li>Loss or damage after item delivery</li>
            <li>Registration or transfer delays</li>
            <li>Issues disclosed in listings</li>
          </ul>

          <h2>16. POLICY UPDATES</h2>
          <p>QuickMela may update this Buyer Policy at any time.</p>
          <p>Continued platform use = acceptance of updated terms.</p>

          <h2>17. CONTACT INFORMATION</h2>
          <p>For Buyer support:</p>
          <p>QuickMela  Tekvoro Technologies<br />
          📧 Email: tekvoro@gmail.com<br />
          📞 Phone: +91 9121331813<br />
          📍 Address: 5-24-190, NTR Nagar, Gajularamaram, Hyderabad, Telangana  500055</p>
        </div>
      </article>
    </div>
  );
};

export default BuyerPolicy;
