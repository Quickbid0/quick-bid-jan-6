import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const WhiteLabelPartnerAgreement: React.FC = () => {
  usePageSEO({
    title: 'White-Label Partner Agreement | QuickMela',
    description: 'Agreement terms for partners using the QuickMela auction engine under their own brand.',
    canonicalPath: '/legal/white-label-partner-agreement',
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
          <li className="text-gray-700 dark:text-gray-200">White-Label Partner Agreement</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          White-Label Partner Agreement
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Agreement for companies using the QuickMela auction engine as a white-label platform under their own brand.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-100">
✅ 4. WHITE-LABEL PARTNER AGREEMENT
(For other companies using QuickMela’s engine under their brand)

WHITE-LABEL PARTNER AGREEMENT
Between:
Tekvoro Technologies (QuickMela Platform Engine)
________________________ (White-Label Partner Brand)

1. RIGHTS GRANTED
QuickMela grants the Partner:
Use of QuickMela auction engine
Custom branding (logo, colors, domain)
Access to admin dashboard
Buyer/Seller management interface
API integrations
Partner may NOT:
Resell engine to third parties
Reverse-engineer platform
Use engine for illegal auctions
Remove “Powered by QuickMela AI Engine” (unless enterprise plan)

2. FEES
White-label pricing:
Plan TypeMonthly Fee
Standard White Label
₹60,000
Premium White Label
₹1,20,000
Enterprise SLA
Custom

3. DATA OWNERSHIP
Partner owns buyer/seller data
QuickMela owns platform engine, designs, and code
No transfer of intellectual property

4. SUPPORT SERVICE LEVELS
Priority tech support
Uptime guarantee: 99.5%
Dedicated account manager
Custom feature development (chargeable)

5. TERMINATION
30 days’ notice
Immediate termination for breach/fraud
Platform shutdown after access expiry

✔ White-Label Agreement Completed
          </pre>
        </div>
      </article>
    </div>
  );
};

export default WhiteLabelPartnerAgreement;
