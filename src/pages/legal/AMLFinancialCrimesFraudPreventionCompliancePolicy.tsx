import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AMLFinancialCrimesFraudPreventionCompliancePolicy: React.FC = () => {
  usePageSEO({
    title: 'Anti-Money Laundering (AML), Fraud Prevention & Financial Crimes Compliance Policy | QuickMela',
    description:
      'Establishes strict controls to detect, prevent, investigate, and report money laundering, fraud, and financial crimes on QuickMela.',
    canonicalPath: '/legal/aml-fraudprevention-financialcrimescompliance-policy',
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
            Anti-Money Laundering (AML), Fraud Prevention &amp; Financial Crimes Compliance Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Anti-Money Laundering (AML), Fraud Prevention &amp; Financial Crimes Compliance Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This policy establishes strict controls to detect, prevent, investigate, and report money laundering, fraud,
          illegal payments, suspicious transactions, identity manipulation, and financial crimes on the QuickMela
          platform.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>Platform is not used for money laundering</li>
          <li>Compliance with RBI, PMLA, FIU-IND rules</li>
          <li>Secure payment flows</li>
          <li>Protection from fraudsters</li>
          <li>Proper KYC enforcement</li>
          <li>Prevention of illegal fund movement</li>
          <li>Accurate tracking of money trails</li>
          <li>Investor &amp; regulator confidence</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Buyers</li>
          <li>Sellers</li>
          <li>Delivery partners</li>
          <li>Agents</li>
          <li>Admins</li>
          <li>Vendors</li>
          <li>Developers</li>
          <li>Third-party payment providers</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>KYC</li>
          <li>Wallet usage</li>
          <li>Payments</li>
          <li>Payouts</li>
          <li>Deposits</li>
          <li>Refunds</li>
          <li>Auction settlements</li>
          <li>Suspicious activity</li>
          <li>Fraud flows</li>
          <li>Financial logs</li>
        </ul>

        <h2>3. AML Legal Framework (India)</h2>
        <p>We comply with:</p>
        <ul>
          <li>PMLA (Prevention of Money Laundering Act, 2002)</li>
          <li>FIU-IND Reporting Obligations</li>
          <li>RBI KYC Directions</li>
          <li>Information Technology Act</li>
          <li>DPDP Act 2023</li>
          <li>Merchant Onboarding Guidelines (Gateways)</li>
        </ul>

        <h2>4. Mandatory KYC Requirements</h2>
        <p>No financial activity allowed without KYC verification for:</p>
        <ul>
          <li>Sellers</li>
          <li>High-value buyers</li>
          <li>Wallet deposits</li>
          <li>Auction wins &gt; ₹25,000</li>
          <li>Payout withdrawals</li>
        </ul>
        <p>KYC includes:</p>
        <ul>
          <li>PAN</li>
          <li>Aadhaar / Passport / DL</li>
          <li>Liveliness check</li>
          <li>Address proof</li>
          <li>Bank verification</li>
        </ul>
        <p>Fake KYC → permanent ban + FIU report + FIR.</p>

        <h2>5. Prohibited Financial Activities</h2>
        <p>Strictly forbidden:</p>
        <ul>
          <li>Washing money through multiple accounts</li>
          <li>Using auction deposits for laundering</li>
          <li>Using fake payments</li>
          <li>Rapid deposit–withdrawal looping</li>
          <li>Third-party payments</li>
          <li>Transacting using unknown bank accounts</li>
          <li>Using stolen cards</li>
          <li>Using multiple identities</li>
          <li>Cross-border suspicious payments</li>
          <li>Cash-based settlement (except authorized cases)</li>
        </ul>

        <h2>6. Suspicious Transaction Detection (AI-Driven)</h2>
        <p>Automatically detected patterns:</p>
        <ul>
          <li>Unusual round-number wallet deposits</li>
          <li>Frequent failed payments</li>
          <li>Multiple refunds</li>
          <li>High bid activity with no intention to pay</li>
          <li>Multiple accounts using same IP/device</li>
          <li>Rapid account creation &amp; bidding</li>
          <li>Low-value items purchased at abnormally high rates</li>
          <li>Sellers buying their own items (self-laundering)</li>
          <li>Excessive deposit top-ups</li>
          <li>Account sharing</li>
          <li>Money flowing between related accounts</li>
        </ul>
        <p>Flag levels:</p>
        <ul>
          <li>Yellow: Monitor</li>
          <li>Orange: Freeze activity</li>
          <li>Red: Account suspension + AML investigation</li>
        </ul>

        <h2>7. Transaction Limits &amp; Controls</h2>
        <p>Buyer Limits</p>
        <ul>
          <li>Unverified users → very low limits</li>
          <li>KYC verified → higher limits</li>
          <li>High-risk users → restrictions</li>
        </ul>
        <p>Seller Limits</p>
        <ul>
          <li>Payouts restricted until KYC &amp; bank verification</li>
          <li>Suspicious accounts → payouts on hold</li>
        </ul>
        <p>Wallet Controls</p>
        <ul>
          <li>Deposit → allowed</li>
          <li>Withdraw → limited</li>
          <li>Transfer → NOT allowed between users</li>
          <li>Refunds → only to original payment method</li>
        </ul>

        <h2>8. AML Investigation Protocol</h2>
        <p>When suspicious activity is detected:</p>
        <p>Step 1 — Freeze</p>
        <ul>
          <li>Account frozen</li>
          <li>Wallet frozen</li>
          <li>Bidding disabled</li>
        </ul>
        <p>Step 2 — Verify Identity</p>
        <ul>
          <li>KYC re-check</li>
          <li>Video verification</li>
          <li>Bank re-validation</li>
        </ul>
        <p>Step 3 — Transaction Analysis</p>
        <ul>
          <li>Review wallet logs</li>
          <li>Check payment history</li>
          <li>Cross-check IP/device</li>
        </ul>
        <p>Step 4 — Risk Assessment</p>
        <ul>
          <li>Categorize high/medium/low risk</li>
        </ul>
        <p>Step 5 — Final Action</p>
        <ul>
          <li>Restore account</li>
          <li>Continue monitoring</li>
          <li>Permanent ban</li>
          <li>Legal escalation</li>
          <li>FIU-IND suspicious transaction report (if required)</li>
        </ul>

        <h2>9. High-Risk Scenarios (Immediate Freeze)</h2>
        <p>Account frozen instantly if:</p>
        <ul>
          <li>User attempts 3+ stolen card payments</li>
          <li>Multiple users linked to same bank account</li>
          <li>Seller sends large payouts to unknown buyers</li>
          <li>Buyer refuses to complete KYC</li>
          <li>Refund pattern looks like laundering</li>
          <li>Cross-border suspicious behaviour</li>
          <li>Seller buying own items</li>
          <li>Big payments without bidding pattern consistency</li>
        </ul>

        <h2>10. Payout Safety Rules</h2>
        <p>Before releasing seller payout:</p>
        <ul>
          <li>Delivery confirmed</li>
          <li>Buyer verified</li>
          <li>No dispute active</li>
          <li>Fraud check passed</li>
          <li>IP history checked</li>
          <li>Bank account matches KYC</li>
        </ul>
        <p>Suspicious cases → payout on HOLD.</p>

        <h2>11. Refund Integrity Rules</h2>
        <p>Refunds are only allowed:</p>
        <ul>
          <li>To original source</li>
          <li>After verification</li>
          <li>With fraud scoring</li>
        </ul>
        <p>Refund abuse triggers:</p>
        <ul>
          <li>Lock</li>
          <li>Investigation</li>
          <li>Account ban</li>
        </ul>

        <h2>12. Cross-Border AML Controls</h2>
        <p>For international payments:</p>
        <ul>
          <li>Extra KYC</li>
          <li>PEP (Politically Exposed Person) screening</li>
          <li>OFAC screening</li>
          <li>Sanction list checks</li>
          <li>Bank compliance verification</li>
        </ul>
        <p>Any match → immediate freeze.</p>

        <h2>13. Insider Fraud Prevention</h2>
        <p>Employees CANNOT:</p>
        <ul>
          <li>Modify payouts</li>
          <li>Approve suspicious accounts</li>
          <li>Whitelist flagged users</li>
          <li>Change AML decisions</li>
          <li>Access raw financial logs</li>
          <li>Process external payments manually</li>
        </ul>
        <p>Internal fraud → termination + FIR.</p>

        <h2>14. Reporting to Authorities</h2>
        <p>If required:</p>
        <ul>
          <li>STR (Suspicious Transaction Report)</li>
          <li>CTR (Cash Transaction Report)</li>
          <li>FIU-IND compliance</li>
          <li>RBI alerts</li>
          <li>Police/FIR filing</li>
        </ul>

        <h2>15. Penalties for Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Money laundering suspicion</td>
              <td>Account freeze + FIU report</td>
            </tr>
            <tr>
              <td>Fraudulent payments</td>
              <td>Ban + legal action</td>
            </tr>
            <tr>
              <td>Fake KYC</td>
              <td>Permanent ban + police case</td>
            </tr>
            <tr>
              <td>Large suspicious deposits</td>
              <td>Wallet freeze</td>
            </tr>
            <tr>
              <td>Self-laundering</td>
              <td>Seller removal</td>
            </tr>
            <tr>
              <td>Using stolen cards</td>
              <td>Police complaint</td>
            </tr>
            <tr>
              <td>Account sharing</td>
              <td>Device ban</td>
            </tr>
            <tr>
              <td>Bypass AML controls</td>
              <td>Legal escalation</td>
            </tr>
          </tbody>
        </table>

        <h2>16. Responsibilities</h2>
        <h3>Users</h3>
        <ul>
          <li>Provide real identity</li>
          <li>Avoid suspicious activity</li>
        </ul>
        <h3>Sellers</h3>
        <ul>
          <li>Use correct bank accounts</li>
          <li>Provide valid documents</li>
        </ul>
        <h3>Platform</h3>
        <ul>
          <li>Monitor transactions</li>
          <li>Prevent financial crime</li>
          <li>Cooperate with regulators</li>
        </ul>
        <h3>Compliance Team</h3>
        <ul>
          <li>Approve AML decisions</li>
          <li>File required reports</li>
        </ul>
        <h3>Security Team</h3>
        <ul>
          <li>Maintain monitoring tools</li>
        </ul>

        <h2>17. Policy Updates</h2>
        <p>This AML policy may be updated anytime due to legal or regulatory changes.</p>
      </article>
    </div>
  );
};

export default AMLFinancialCrimesFraudPreventionCompliancePolicy;
