import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const BankNBFCOnboardingSOP: React.FC = () => {
  usePageSEO({
    title: 'Bank / NBFC Onboarding SOP | QuickMela',
    description: 'Standard Operating Procedure for onboarding banks and NBFCs to QuickMela for asset liquidation and auctions.',
    canonicalPath: '/legal/bank-nbfc-onboarding-sop',
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
          <li className="text-gray-700 dark:text-gray-200">Bank / NBFC Onboarding SOP</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Bank / NBFC Onboarding SOP
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Standard Operating Procedure for bank and NBFC asset liquidation teams using QuickMela.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-100">
✅ 5. BANK ONBOARDING DOCUMENT / SOP

QUICKMELA – BANK/NBFC ONBOARDING SOP
(SOP for Asset Liquidation Teams)

Step 1: Account Creation
Bank provides:
Nodal Officer details
Compliance officer details
Branch list
Authorized signatory KYC

Step 2: Documentation Submission
Bank submits:
Seizure memos
Repossession reports
RC copies
SARFAESI notice (if applicable)
Yard/storage details
Asset photos &amp; condition reports

Step 3: Asset Listing Process
Upload assets via dashboard
Add reserve price
Add inspection details
Submit listing for verification
QuickMela reviews &amp; approves within 24 hours

Step 4: Auction Process
Auction scheduled
Buyers place deposits
Real-time bidding
Reserve price validation
Highest bid shared with bank
Bank approves/rejects

Step 5: Post-Auction Flow
Buyer pays full amount
Bank verifies payment
QuickMela raises invoice to bank
Bank settles QuickMela fees
Bank issues DO/NOC
Vehicle handover

Step 6: Dispute Handling
QuickMela mediates first
Legal matters handled by Bank AO
Buyer disputes resolved within 72 hours

Step 7: Compliance &amp; Monitoring
All actions logged
MIS reports generated
Audit trails maintained
Fraud checks active
Regular performance reviews

✔ Onboarding SOP Completed
          </pre>
        </div>
      </article>
    </div>
  );
};

export default BankNBFCOnboardingSOP;
