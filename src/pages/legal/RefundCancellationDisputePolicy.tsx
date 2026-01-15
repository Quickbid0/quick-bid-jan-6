import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const RefundCancellationDisputePolicy: React.FC = () => {
  usePageSEO({
    title: 'Refund, Cancellation & Dispute Resolution Policy | QuickMela',
    description: 'Complete policy for refunds, cancellations, and dispute resolution on QuickMela.',
    canonicalPath: '/legal/refund-cancellation-dispute',
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
          <li className="text-gray-700 dark:text-gray-200">Refund, Cancellation &amp; Dispute Resolution Policy</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Refund, Cancellation &amp; Dispute Resolution Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Rules governing refunds, cancellations, chargebacks, and dispute handling.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p><strong>QUICKMELA ႓ REFUND, CANCELLATION &amp; DISPUTE RESOLUTION POLICY</strong></p>
          <p>Last Updated: 20 November 2025<br />
          Effective Date: Immediately</p>
          <p>This Refund, Cancellation &amp; Dispute Resolution Policy (Policy) governs how refunds, cancellations, and disputes are handled for all transactions and auctions conducted on QuickMela, operated by Tekvoro Technologies (Company, we, our, us).</p>
          <p>This Policy is to be read together with the Terms &amp; Conditions, Auction Rules, Buyer Policy, Seller Policy, and Anti-Fraud Policy.</p>

          <h2>1. PURPOSE OF THIS POLICY</h2>
          <p>This Policy aims to:</p>
          <ul>
            <li>Ensure fair treatment of Buyers and Sellers</li>
            <li>Provide clear rules for refunds and cancellations</li>
            <li>Prevent misuse of refunds and disputes</li>
            <li>Maintain auction integrity</li>
            <li>Ensure legal compliance</li>
          </ul>

          <h2>2. REFUND TYPES COVERED UNDER THIS POLICY</h2>
          <p>The following refunds may apply:</p>
          <ul>
            <li>Refundable Security Deposit Refunds</li>
            <li>Wallet Balance Refunds</li>
            <li>Order Cancellation Refunds</li>
            <li>Auction Cancellation Refunds</li>
            <li>Overpayment Refunds</li>
            <li>Failed Payment Refunds</li>
            <li>Logistics/Delivery Refunds (when applicable)</li>
          </ul>
          <p>Refunds are always subject to verification and compliance checks.</p>

          <h2>3. REFUNDABLE SECURITY DEPOSIT RULES</h2>
          <p>Most auctions require a refundable deposit.</p>

          <h3>A. Eligible for Refund</h3>
          <p>Deposit is refunded when:</p>
          <ul>
            <li>Buyer does NOT win the auction</li>
            <li>Buyer wins and completes payment</li>
            <li>No fraud, rule violation, or dispute is associated</li>
            <li>User voluntarily exits auction before bidding</li>
          </ul>

          <h3>B. Not Eligible for Refund</h3>
          <p>Deposit is forfeited if:</p>
          <ul>
            <li>Buyer wins but fails to pay</li>
            <li>Buyer attempts to manipulate bidding</li>
            <li>Buyer cancels after winning</li>
            <li>Fraud or misconduct is detected</li>
            <li>Buyer initiates false dispute or chargeback</li>
            <li>Buyer uses multiple accounts to influence auctions</li>
          </ul>

          <h3>C. Refund Timeline</h3>
          <p>Wallet refund: Instant to 24 hours<br />
          Bank refund: 15 business days<br />
          UPI refund: Instant to 48 hours</p>
          <p>Refund timelines may vary by bank/payment gateway.</p>

          <h2>4. ORDER CANCELLATION POLICY</h2>

          <h3>A. Buyer-Initiated Cancellations</h3>
          <p>Buyer can request cancellation ONLY if:</p>
          <ul>
            <li>Seller fails to dispatch the item</li>
            <li>Misrepresentation is proven</li>
            <li>Item is illegal or prohibited</li>
            <li>Listing contains false information</li>
            <li>There is extreme delay due to Seller negligence</li>
          </ul>
          <p>Cancellation cannot be requested for:</p>
          <ul>
            <li>Buyer changing mind</li>
            <li>Buyer bidding by mistake</li>
            <li>Buyer misreading listing</li>
            <li>Buyer failing to arrange payment</li>
          </ul>

          <h3>B. Seller-Initiated Cancellations</h3>
          <p>Seller may cancel ONLY when:</p>
          <ul>
            <li>Item is damaged beyond repair before delivery</li>
            <li>Item becomes unavailable due to unforeseen legal issues</li>
            <li>Fraud suspected from Buyer</li>
            <li>Delivery impossible due to buyer refusal</li>
          </ul>
          <p>Unauthorized cancellations lead to Seller penalties.</p>

          <h3>C. Platform-Initiated Cancellations</h3>
          <p>QuickMela may cancel any order/auction if:</p>
          <ul>
            <li>Fraud is detected</li>
            <li>Listing violates policy</li>
            <li>Technical error occurred</li>
            <li>Legal authorities instruct cancellation</li>
            <li>Payment failure or reversal occurs</li>
          </ul>
          <p>Platform decision is final.</p>

          <h2>5. AUCTION CANCELLATION RULES</h2>
          <p>Auction may be cancelled if:</p>
          <ul>
            <li>System glitch affected bidding</li>
            <li>Reserve price mismatch</li>
            <li>Seller misrepresented item</li>
            <li>Fraudulent bids detected</li>
            <li>Seller withdraws item before bidding begins</li>
            <li>Legal issues arise (police, court order, SARFAESI rules)</li>
          </ul>
          <p>Buyers are refunded deposits for cancelled auctions.</p>

          <h2>6. DISPUTE RESOLUTION POLICY</h2>
          <p>Buyers or sellers may raise a dispute for:</p>
          <ul>
            <li>Wrong item delivered</li>
            <li>Item significantly different from description</li>
            <li>Item damaged during shipping</li>
            <li>Item not delivered</li>
            <li>Payment not reflecting</li>
            <li>Misrepresentation by Seller</li>
            <li>Fraudulent behaviour</li>
          </ul>

          <h3>A. How to Raise a Dispute</h3>
          <p>User must:</p>
          <ul>
            <li>Open a dispute ticket from the app/website</li>
            <li>Provide:</li>
          </ul>
          <ul>
            <li>Order ID / Auction ID</li>
            <li>Photos/videos</li>
            <li>Delivery proof (if applicable)</li>
            <li>Exact issue explanation</li>
          </ul>
          <p>Disputes must be raised within:</p>
          <ul>
            <li>24 hours of delivery for physical goods</li>
            <li>Immediately for pickup items</li>
            <li>Before payment for auction-not-completed disputes</li>
          </ul>

          <h3>B. Dispute Review Steps</h3>
          <p>Platform reviews dispute details</p>
          <p>Platform may request more evidence</p>
          <p>Seller is contacted for response</p>
          <p>Platform investigates via:</p>
          <ul>
            <li>Verification report</li>
            <li>Delivery partner’s evidence</li>
            <li>System logs</li>
          </ul>
          <p>Final decision is made within 4872 hours (typical time)</p>

          <h3>C. Types of Resolutions</h3>
          <p>Possible outcomes:</p>
          <ul>
            <li>Refund to Buyer</li>
            <li>Replacement (if applicable)</li>
            <li>Return to Seller</li>
            <li>Partial refund</li>
            <li>Penalty to Seller</li>
            <li>Penalty to Buyer (for misuse)</li>
            <li>Rejection of dispute</li>
          </ul>
          <p>Platform’s decision is final and binding.</p>

          <h2>7. NO-RETURN / AS-IS SALES</h2>
          <p>Unless otherwise specified:</p>
          <ul>
            <li>Most auction items are sold "as-is"</li>
            <li>No standard warranty</li>
            <li>No returns after delivery/pickup</li>
          </ul>
          <p>Refunds only granted in cases of:</p>
          <ul>
            <li>Fraud</li>
            <li>Non-delivery</li>
            <li>Major misrepresentation</li>
            <li>Prohibited/illegal goods</li>
          </ul>
          <p>For vehicles:</p>
          <ul>
            <li>Buyer must verify RC, insurance, chassis numbers before bidding</li>
            <li>Seller must disclose defects</li>
            <li>No returns allowed after RC transfer begins</li>
          </ul>

          <h2>8. REFUNDS FOR FAILED OR REVERSED PAYMENTS</h2>
          <p>Refunds apply when:</p>
          <ul>
            <li>Payment deducted but not credited</li>
            <li>Double payment made</li>
            <li>UPI issues occur</li>
            <li>Gateway failure during transaction</li>
          </ul>
          <p>Refund timeline:</p>
          <ul>
            <li>UPI: Instant48 hrs</li>
            <li>Cards/NB: 37 days</li>
            <li>Wallet: Instant</li>
          </ul>

          <h2>9. FALSE CLAIMS &amp; PENALTIES</h2>
          <p>If Buyer raises false or fraudulent disputes:</p>
          <ul>
            <li>Deposit forfeiture</li>
            <li>Account suspension</li>
            <li>Permanent ban</li>
            <li>Legal action for fraud (IPC 420)</li>
            <li>Marking the user as “High Risk”</li>
          </ul>
          <p>If Seller misrepresents product:</p>
          <ul>
            <li>Listing removal</li>
            <li>Refund responsibility</li>
            <li>Penalties deducted from payouts</li>
            <li>Seller ban (in repeated cases)</li>
          </ul>

          <h2>10. LOGISTICS &amp; DELIVERY DISPUTES</h2>
          <p>Refund eligibility:</p>

          <h3>A. Eligible</h3>
          <ul>
            <li>Item damaged during transit</li>
            <li>Item lost by courier</li>
            <li>Wrong item delivered</li>
            <li>Package stolen before delivery</li>
            <li>Seller sent incorrect item</li>
          </ul>

          <h3>B. Not Eligible</h3>
          <ul>
            <li>Buyer unavailable during delivery</li>
            <li>Buyer refusing delivery without reason</li>
            <li>Normal wear &amp; cosmetic differences</li>
            <li>Delays caused by buyer</li>
          </ul>
          <p>Delivery disputes must include:</p>
          <ul>
            <li>Unboxing video (recommended)</li>
            <li>Photos of damage</li>
            <li>Courier slip</li>
            <li>Delivery OTP details</li>
          </ul>

          <h2>11. SARFAESI/BANK AUCTION REFUNDS</h2>
          <p>For SARFAESI auctions:</p>
          <ul>
            <li>EMD refunds follow bank rules</li>
            <li>QuickMela only assists with technology</li>
            <li>Refund timelines depend on bank authority</li>
            <li>Disputes must be resolved with:</li>
          </ul>
          <ul>
            <li>Bank</li>
            <li>DRT</li>
            <li>DRAT</li>
          </ul>
          <p>QuickMela is NOT liable for SARFAESI refunds</p>

          <h2>12. PLATFORM FEES &amp; NON-REFUNDABLE CHARGES</h2>
          <p>The following are non-refundable:</p>
          <ul>
            <li>Platform service fee</li>
            <li>Commission fee</li>
            <li>Payment gateway charges</li>
            <li>Listing fees</li>
            <li>Verification fees</li>
            <li>Penalty charges</li>
            <li>Paid promotions</li>
            <li>Convenience fees</li>
          </ul>
          <p>Even if the order is cancelled (except for major platform error), these fees remain non-refundable.</p>

          <h2>13. CHARGEBACK POLICY</h2>
          <p>Unauthorized chargebacks are treated as fraud.</p>
          <p>If Buyer issues a false chargeback:</p>
          <ul>
            <li>Account is suspended</li>
            <li>Deposit forfeited</li>
            <li>Legal action may be initiated</li>
            <li>Buyer banned permanently</li>
          </ul>
          <p>Chargebacks should be used ONLY for genuine bank issues.</p>

          <h2>14. FINAL DECISION AUTHORITY</h2>
          <p>QuickMela reserves the right to:</p>
          <ul>
            <li>Approve or reject refunds</li>
            <li>Modify refund amount</li>
            <li>Require additional evidence</li>
            <li>Escalate cases to legal team</li>
            <li>Take action against any fraudulent party</li>
          </ul>
          <p>Platform decision is final.</p>

          <h2>15. POLICY UPDATES</h2>
          <p>QuickMela may modify this Policy anytime.</p>
          <p>Updated version applies immediately upon publication.</p>
          <p>Users will be notified through:</p>
          <ul>
            <li>Email</li>
            <li>App notification</li>
            <li>Website banner</li>
          </ul>
          <p>Continued use = acceptance.</p>

          <h2>16. CONTACT INFORMATION</h2>
          <p>For refund/dispute support:</p>
          <p>QuickMela ႓ Tekvoro Technologies<br />
          📧 Email: tekvoro@gmail.com<br />
          📞 Phone: +91 9121331813<br />
          📍 Address: 5-24-190, NTR Nagar, Gajularamaram, Hyderabad, Telangana ႓ 500055</p>
        </div>
      </article>
    </div>
  );
};

export default RefundCancellationDisputePolicy;
