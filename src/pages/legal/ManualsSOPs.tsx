import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const ManualsSOPs: React.FC = () => {
  usePageSEO({
    title: 'Manuals & SOPs | QuickMela',
    description: 'QuickMela complete legal, compliance, policy manual, and operational SOP hub with links to all detailed policies and agreements.',
    canonicalPath: '/legal/manuals-sops',
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
          <li className="text-gray-700 dark:text-gray-200">Manuals &amp; SOPs</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          📘 QuickMela – Complete Legal, Compliance &amp; Policy Manual
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Central hub for QuickMela legal manuals, bank &amp; vendor agreements, and operational SOPs.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <p><strong>Version 1.0 – Updated: 20 November 2025</strong></p>
        <p>Prepared by: Tekvoro Technologies (Owner of QuickMela)</p>

        <h2>TABLE OF CONTENTS (Overview)</h2>
        <p>(Auto-generated outline – each section below links to full policies and SOPs where available.)</p>

        <h3>PART I — Introduction &amp; Corporate Governance</h3>
        <ul>
          <li>Overview</li>
          <li>Mission &amp; Governance</li>
          <li>Legal Framework Applicable</li>
          <li>Definitions</li>
        </ul>

        <h3>PART II — Core Platform Policies</h3>
        <ul>
          <li><Link to="/legal/terms-and-conditions">Terms &amp; Conditions</Link></li>
          <li><Link to="/legal/privacy-policy">Privacy Policy</Link></li>
          <li><Link to="/legal/buyer-policy">Buyer Policy</Link></li>
          <li>Seller Policy (to be added)</li>
          <li><Link to="/legal/refund-cancellation-dispute">Refund &amp; Dispute Policy</Link></li>
          <li><Link to="/legal/anti-fraud-shill-bidding">Anti-Fraud &amp; Anti–Shill Bidding Policy</Link></li>
          <li><Link to="/legal/auction-rules-bidding">Auction Rules &amp; Bidding Guidelines</Link></li>
          <li><Link to="/legal/e-contract-digital-agreement">E-Contract &amp; Digital Agreement Policy</Link></li>
          <li><Link to="/legal/wallet-deposit-investment">Wallet, Deposit &amp; Investment Policy</Link></li>
        </ul>

        <h3>PART III — Asset Liquidation &amp; Bank-Specific Compliance</h3>
        <ul>
          <li><Link to="/legal/sarfaesi-property-compliance">SARFAESI &amp; Property Auction Compliance Policy</Link></li>
          <li><Link to="/legal/vendor-bank-partner-agreement">Vendor &amp; Bank Partner Agreement</Link></li>
          <li><Link to="/legal/bank-nbfc-mou">Bank / NBFC Partnership MoU</Link></li>
          <li><Link to="/legal/vendor-service-level-agreement">Vendor Service Level Agreement (SLA)</Link></li>
          <li><Link to="/legal/recovery-agency-agreement">Recovery Agency Agreement</Link></li>
          <li><Link to="/legal/commission-rate-sheet">Commission Rate Sheet</Link></li>
          <li><Link to="/legal/bank-nbfc-onboarding-sop">Bank / NBFC Onboarding SOP</Link></li>
          <li><Link to="/legal/investor-policy">Investor Participation Policy</Link></li>
        </ul>

        <h3>PART IV — Operational SOPs (High-Level)</h3>
        <p>Detailed SOPs follow the lifecycle: Listing → Verification → Auction → Payment → Handover.</p>
        <ul>
          <li><Link to="/legal/bank-nbfc-onboarding-sop">Bank Onboarding SOP</Link></li>
          <li>Vendor Onboarding SOP (planned)</li>
          <li>Buyer KYC SOP (planned)</li>
          <li>Seller Verification SOP (planned)</li>
          <li>Asset Listing SOP (planned)</li>
          <li>Auction Execution SOP (planned)</li>
          <li>Payment &amp; Settlement SOP (planned)</li>
          <li>Vehicle Delivery SOP (planned)</li>
          <li>Dispute &amp; Escalation SOP (planned)</li>
        </ul>

        <h3>PART V — Risk, Fraud, Security</h3>
        <ul>
          <li><Link to="/legal/anti-fraud-shill-bidding">Fraud &amp; Manipulation Detection</Link></li>
          <li><Link to="/legal/e-contract-digital-agreement">Digital Evidence &amp; E-Contracts</Link></li>
          <li><Link to="/legal/privacy-policy">Data Security &amp; Privacy Standards</Link></li>
        </ul>

        <h3>PART VI — Legal Agreements &amp; Templates</h3>
        <ul>
          <li><Link to="/legal/bank-nbfc-mou">Bank Partnership MoU</Link></li>
          <li><Link to="/legal/vendor-bank-partner-agreement">Vendor Agreement</Link></li>
          <li><Link to="/legal/vendor-service-level-agreement">SLA Agreement</Link></li>
          <li><Link to="/legal/recovery-agency-agreement">Recovery Agency Agreement</Link></li>
          <li><Link to="/legal/white-label-partner-agreement">White-Label Partner Agreement</Link></li>
        </ul>

        <h3>PART VII — Brand &amp; IP Protection</h3>
        <ul>
          <li><Link to="/legal/intellectual-property">IP / Copyright / Trademark Policy</Link></li>
          <li><Link to="/legal/branding-policy">Branding, Logo &amp; Brand Usage Policy</Link></li>
        </ul>

        <h3>PART VIII — Audit, Compliance &amp; Monitoring</h3>
        <p>Supported by:</p>
        <ul>
          <li><Link to="/legal/sarfaesi-property-compliance">SARFAESI &amp; Property Auction Compliance Policy</Link></li>
          <li><Link to="/legal/anti-fraud-shill-bidding">Anti-Fraud &amp; Anti–Shill Bidding Policy</Link></li>
        </ul>

        <h3>PART IX &amp; X — Emergency, Response &amp; Annexures</h3>
        <p>Emergency procedures, templates, and detailed annexures are backed by the above core policies and SOPs. Additional templates (DO/NOC, Sale Certificate, Seizure Memo, Inspection Checklist, etc.) can be attached as PDFs or internal documents referencing these core legal pages.</p>
      </article>
    </div>
  );
};

export default ManualsSOPs;
