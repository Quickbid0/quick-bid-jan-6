import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const InvestorPolicy: React.FC = () => {
  usePageSEO({
    title: 'Investor Participation Policy | QuickMela',
    description: 'Investor participation, returns, and risk management policy for non-equity investments in QuickMela.',
    canonicalPath: '/legal/investor-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Investor Participation Policy</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Investor Participation Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Investor participation, returns, and risk management rules for non-equity contributions to QuickMela.
        </p>
      </header>
      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <p><strong>QUICKMELA  INVESTOR PARTICIPATION, RETURNS &amp; RISK MANAGEMENT POLICY</strong></p>
        <p>Last Updated: 20 November 2025</p>

        <h2>1. Purpose</h2>
        <p>This policy governs individuals or institutions (Investors) who invest capital into QuickMela operations, asset pools, buyer deposits, or expansion programs without receiving company equity.</p>
        <p>This is strictly a non-equity participation model.</p>

        <h2>2. Allowed Investment Models</h2>
        <p>Investors can participate through:</p>
        <h3>A. Fixed Return Investment Pool</h3>
        <ul>
          <li>Tenure: 3, 6, 12, or 24 months</li>
          <li>Returns Range: 8%  16% annually</li>
          <li>Zero shareholding</li>
          <li>Principal + returns paid at the end of tenure</li>
        </ul>
        <h3>B. Auction Liquidity Pool</h3>
        <p>Investor funds are used to:</p>
        <ul>
          <li>Provide buyer deposit support</li>
          <li>Fund escrow liquidity</li>
          <li>Manage operational floats</li>
        </ul>
        <p>Return: 1%3% per successful cycle</p>
        <h3>C. Verified Recovery Partner Pool</h3>
        <p>For SARFAESI / vehicle liquidation:</p>
        <p>Investor funds support logistics</p>
        <p>Earn profit-share per asset, usually 37%</p>

        <h2>3. Prohibited Models</h2>
        <ul>
          <li>No equity shares</li>
          <li>No voting rights</li>
          <li>No MLM-type structures</li>
          <li>No guaranteed high returns beyond RBI norms</li>
        </ul>

        <h2>4. Investor Eligibility</h2>
        <ul>
          <li>Must be 18+</li>
          <li>KYC compulsory</li>
          <li>AML verification</li>
          <li>Proof of source of funds</li>
          <li>Must sign Investor Agreement</li>
        </ul>

        <h2>5. Risk Disclaimer</h2>
        <p>Investors acknowledge:</p>
        <ul>
          <li>Market risks</li>
          <li>Auction result variability</li>
          <li>Time delays</li>
          <li>No guaranteed returns</li>
          <li>No ownership of QuickMela assets</li>
        </ul>
        <p>QuickMela is not liable for market fluctuations.</p>

        <h2>6. Payout Terms</h2>
        <ul>
          <li>Payouts done monthly/quarterly/year-end (as per plan)</li>
          <li>Instant payout not allowed</li>
          <li>Withdrawals require 7-day notice</li>
        </ul>

        <h2>7. Legal Compliance</h2>
        <p>QuickMela follows:</p>
        <ul>
          <li>Indian Contract Act</li>
          <li>RBI KYC/AML norms</li>
          <li>IT Act</li>
          <li>Income Tax compliance</li>
        </ul>

        <h2>8. Termination</h2>
        <p>Investment may be terminated due to:</p>
        <ul>
          <li>Legal issues</li>
          <li>KYC failure</li>
          <li>Fraud suspicion</li>
          <li>Breach of agreement</li>
        </ul>

        <p>✔ Investors Policy Completed</p>
      </article>
    </div>
  );
};

export default InvestorPolicy;
