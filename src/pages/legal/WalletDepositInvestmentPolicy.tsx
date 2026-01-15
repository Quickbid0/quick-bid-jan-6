import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const WalletDepositInvestmentPolicy: React.FC = () => {
  usePageSEO({
    title: 'Wallet, Deposit & Investment Agreement Policy | QuickMela',
    description: 'Policy for wallet usage, security deposits, and investment agreements on QuickMela.',
    canonicalPath: '/legal/wallet-deposit-investment',
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
          <li className="text-gray-700 dark:text-gray-200">Wallet, Deposit &amp; Investment Agreement Policy</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Wallet, Deposit &amp; Investment Agreement Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Terms for wallet balances, deposits, and investor arrangements on QuickMela.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p><strong>QUICKMELA ႓ WALLET, DEPOSIT &amp; INVESTMENT AGREEMENT POLICY</strong></p>
          <p>Last Updated: 20 November 2025<br />
          Effective Date: Immediately</p>
          <p>This Wallet, Deposit &amp; Investment Agreement Policy (Policy) governs all financial interactions conducted through the QuickMela Wallet, Refundable Deposits, and Investor Contribution Programs, operated by Tekvoro Technologies (Company, we, our, us).</p>
          <p>Use of these financial services means you agree to this Policy along with the Terms &amp; Conditions, Buyer Policy, Seller Policy, Auction Rules, Refund Policy, and Anti-Fraud Policy.</p>

          <h2>1. PURPOSE OF THIS POLICY</h2>
          <p>This Policy explains:</p>
          <ul>
            <li>How wallet balance works</li>
            <li>How security deposits work</li>
            <li>When deposits are refundable or forfeited</li>
            <li>How payments, withdrawals, and settlements are processed</li>
            <li>How investment contributions work (non-equity returns)</li>
            <li>Fraud prevention &amp; compliance rules</li>
          </ul>

          <h2>2. DEFINITIONS</h2>
          <p>Wallet – A digital balance maintained by the user on QuickMela.<br />
          Deposit – A refundable security amount required for bidding in auctions.<br />
          EMD (Earnest Money Deposit) – Deposit used specifically in SARFAESI or bank auctions.<br />
          Investment Contribution – A program where individuals contribute funds for fixed returns (non-equity).<br />
          Settlement – Payouts made to Sellers after successful sale.<br />
          Refund – Amount returned to the user due to eligibility under this Policy.</p>

          <h2>3. QUICKMELA WALLET</h2>
          <p>The QuickMela Wallet is a prepaid digital balance that users can:</p>
          <ul>
            <li>Add money to</li>
            <li>Use for bidding</li>
            <li>Use for paying invoices</li>
            <li>Use for deposits</li>
            <li>Receive refunds into</li>
            <li>Withdraw back to bank account</li>
          </ul>
          <p>Wallet balance is not interest bearing and not transferable between users.</p>

          <h2>4. ADDING MONEY TO WALLET</h2>
          <p>Accepted payment methods:</p>
          <ul>
            <li>UPI</li>
            <li>Net Banking</li>
            <li>Debit/Credit Cards</li>
            <li>Third-party wallet providers (if supported)</li>
          </ul>

          <h3>A. Payment Charges</h3>
          <p>Payment gateway fees may apply.</p>
          <p>These fees are non-refundable.</p>

          <h3>B. Verification Requirements</h3>
          <p>Large deposits may require:</p>
          <ul>
            <li>PAN verification</li>
            <li>Aadhaar verification</li>
            <li>Bank proof</li>
            <li>Source-of-funds declaration (₹50,000+ cumulative)</li>
          </ul>

          <h2>5. USE OF WALLET BALANCE</h2>
          <p>Wallet balance can be used for:</p>
          <ul>
            <li>Auction bidding</li>
            <li>Paying winning bid invoices</li>
            <li>Buying items</li>
            <li>Paying platform fees</li>
            <li>Paying penalties</li>
            <li>Paying for logistics services</li>
          </ul>
          <p>Wallet balance cannot be withdrawn if:</p>
          <ul>
            <li>A pending invoice exists</li>
            <li>A dispute is unresolved</li>
            <li>Fraud is suspected</li>
            <li>Compliance holds are applied</li>
          </ul>

          <h2>6. WITHDRAWING WALLET BALANCE</h2>
          <p>Users can withdraw wallet balance to:</p>
          <ul>
            <li>Bank account (primary)</li>
            <li>UPI ID (if supported)</li>
          </ul>
          <p>Withdrawal Timeframes</p>
          <ul>
            <li>Standard: 15 business days</li>
            <li>Large withdrawals: 17 business days + KYC verification</li>
          </ul>
          <p>Required Information</p>
          <ul>
            <li>Bank account number</li>
            <li>IFSC code</li>
            <li>Account holder name (must match KYC name)</li>
          </ul>
          <p>Withdrawals may be delayed if:</p>
          <ul>
            <li>Bank server issues occur</li>
            <li>Fraud checks are triggered</li>
            <li>KYC mismatch is found</li>
          </ul>

          <h2>7. REFUNDABLE SECURITY DEPOSIT</h2>
          <p>A refundable Security Deposit is required to participate in most auctions.</p>

          <h3>A. When a Deposit is Refundable</h3>
          <p>Deposit is refunded if:</p>
          <ul>
            <li>User does not win the auction</li>
            <li>User wins and completes payment</li>
            <li>No fraudulent activity is detected</li>
            <li>Auction is cancelled by the platform</li>
            <li>Seller withdraws listing before bidding begins</li>
          </ul>

          <h3>B. When a Deposit is Forfeited</h3>
          <p>Deposit is forfeited when:</p>
          <ul>
            <li>Buyer wins and fails to pay invoice</li>
            <li>Buyer attempts to manipulate auctions</li>
            <li>Buyer participates using multiple fraudulent accounts</li>
            <li>Buyer files false disputes</li>
            <li>Buyer attempts chargeback after bidding</li>
            <li>Fraud activity is detected</li>
            <li>Buyer violates any Auction Rule</li>
          </ul>
          <p>Deposit forfeiture is final and non-reversible.</p>

          <h2>8. DEPOSIT REFUND PROCESS</h2>
          <p>Refund Method:</p>
          <ul>
            <li>Wallet refund (instant to 24 hours)</li>
            <li>Bank refund (15 business days)</li>
            <li>UPI refund (instant to 48 hours)</li>
          </ul>
          <p>Refunds may be delayed if:</p>
          <ul>
            <li>Disputes exist</li>
            <li>Fraud review is underway</li>
            <li>KYC is incomplete</li>
            <li>Bank servers are down</li>
          </ul>

          <h2>9. EMD (EARNEST MONEY DEPOSIT) FOR SARFAESI/BANK AUCTIONS</h2>
          <p>For SARFAESI or secured-asset auctions:</p>
          <ul>
            <li>EMD follows bank rules, not QuickMela rules</li>
            <li>Refund timelines may vary between 330 days</li>
            <li>Banks handle refund processing</li>
            <li>QuickMela is NOT responsible for delays</li>
            <li>Disputes related to EMD must be raised with:</li>
          </ul>
          <ul>
            <li>Bank</li>
            <li>DRT (Debt Recovery Tribunal)</li>
            <li>DRAT</li>
          </ul>

          <h2>10. PENALTIES &amp; DEDUCTIONS</h2>
          <p>Penalties may be deducted from:</p>
          <ul>
            <li>Wallet balance</li>
            <li>Security deposit</li>
            <li>Future settlements</li>
          </ul>
          <p>Penalties include:</p>
          <ul>
            <li>Non-payment fines</li>
            <li>No-show penalties</li>
            <li>Listing cancellation fines</li>
            <li>Misrepresentation penalties</li>
            <li>Fraud penalties</li>
          </ul>
          <p>If wallet balance is insufficient, deposit may be used.</p>

          <h2>11. INVESTMENT CONTRIBUTION POLICY (NON-EQUITY)</h2>
          <p>QuickMela may allow selected individuals (Investors) to contribute funds for returns.</p>

          <h3>A. Important Legal Clarifications</h3>
          <p>Investment contributions on QuickMela:</p>
          <ul>
            <li>Are NOT company equity</li>
            <li>Do NOT give ownership rights</li>
            <li>Do NOT give voting rights</li>
            <li>Do NOT represent securities</li>
            <li>Are NOT shares or debentures</li>
          </ul>

          <h3>B. Types of Investment Models</h3>
          <ul>
            <li>Fixed Return Contribution – investors receive a pre-agreed return</li>
            <li>Revenue-Based Contribution – returns linked to platform revenue</li>
            <li>Project-Based Contribution – returns based on Auction/Marketplace performance</li>
          </ul>
          <p>All models require:</p>
          <ul>
            <li>A signed investment agreement</li>
            <li>KYC &amp; PAN verification</li>
            <li>Bank details</li>
            <li>Tax compliance</li>
          </ul>

          <h3>C. Investor Responsibilities</h3>
          <p>Investors agree:</p>
          <ul>
            <li>Funds are voluntary contributions</li>
            <li>Risks associated with platform growth exist</li>
            <li>Returns are not guaranteed unless contractually defined</li>
            <li>Platform is not liable for external financial losses</li>
          </ul>

          <h3>D. Payouts to Investors</h3>
          <p>Payout timelines:</p>
          <ul>
            <li>Monthly</li>
            <li>Quarterly</li>
            <li>Yearly</li>
          </ul>
          <p>All according to signed agreements.</p>

          <h2>12. FRAUD PREVENTION &amp; FINANCIAL SECURITY</h2>
          <p>QuickMela uses:</p>
          <ul>
            <li>AI-driven fraud detection</li>
            <li>Device fingerprinting</li>
            <li>Payment risk assessment</li>
            <li>Transaction monitoring</li>
            <li>KYC/AML checks</li>
            <li>IP/location tracking</li>
          </ul>
          <p>Suspicious transactions may be:</p>
          <ul>
            <li>Delayed</li>
            <li>Blocked</li>
            <li>Reversed</li>
            <li>Investigated</li>
            <li>Reported to authorities</li>
          </ul>

          <h2>13. CHARGEBACKS</h2>
          <p>Unauthorized chargebacks are treated as fraud.</p>
          <p>If a user wrongly initiates a chargeback:</p>
          <ul>
            <li>Account suspension</li>
            <li>Deposit forfeiture</li>
            <li>Legal action</li>
            <li>Permanent ban</li>
          </ul>
          <p>Valid chargebacks must contain proper proof.</p>

          <h2>14. COMPLIANCE WITH INDIAN LAW</h2>
          <p>This Policy complies with:</p>
          <ul>
            <li>IT Act 2000</li>
            <li>SPDI Rules</li>
            <li>RBI digital payments guidelines</li>
            <li>AML/KYC norms</li>
            <li>Contract Act 1872</li>
            <li>Consumer Protection Act</li>
            <li>Income Tax regulations</li>
          </ul>

          <h2>15. LIMITATION OF LIABILITY</h2>
          <p>QuickMela is NOT responsible for:</p>
          <ul>
            <li>Bank delays</li>
            <li>Payment gateway failures</li>
            <li>Incorrect bank details provided by user</li>
            <li>Loss of funds due to user mistakes</li>
            <li>Third-party payment fraud</li>
            <li>Losses arising from investments</li>
          </ul>
          <p>Liability is limited to the amount paid to QuickMela within the last 3 months.</p>

          <h2>16. POLICY UPDATES</h2>
          <p>QuickMela may update this Policy anytime.</p>
          <p>Continued use = acceptance of updated version.</p>

          <h2>17. CONTACT INFORMATION</h2>
          <p>For payout, wallet, deposit, or investment queries:</p>
          <p>QuickMela ႓ Tekvoro Technologies<br />
          📧 Email: tekvoro@gmail.com<br />
          📞 Phone: +91 9121331813<br />
          📍 Address: 5-24-190, NTR Nagar, Gajularamaram, Hyderabad, Telangana — 500055</p>
        </div>
      </article>
    </div>
  );
};

export default WalletDepositInvestmentPolicy;
