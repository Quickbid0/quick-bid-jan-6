import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const PlatformUsageAcceptancePolicy: React.FC = () => {
  usePageSEO({
    title: 'Platform Usage, Security, Compliance & Ownership Policy | QuickMela',
    description: 'Policy governing platform usage, security, compliance, and ownership requirements for all QuickMela users.',
    canonicalPath: '/legal/platform-usage-acceptance-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Platform Usage &amp; Ownership Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Platform Usage, Security, Compliance &amp; Ownership Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Platform usage acceptance, security restrictions, compliance obligations, and ownership declaration for all QuickMela users.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Mandatory Acceptance of All Policies</h2>
        <p>Every buyer and seller MUST accept all QuickMela terms before using the platform.</p>
        <p>
          All users (buyers, sellers, vendors, bankers, agencies) must explicitly accept ALL Terms &amp; Conditions, Privacy Policy,
          Seller Policy, Buyer Policy, Fraud Policy, Branding Policy, IP Policy, Investor Policy, SARFAESI Compliance Policy,
          Bank Partner Policies, and ALL Legal Manual sections before listing, bidding, buying, selling or interacting with the
          QuickMela platform.
        </p>

        <h2>2. Strict Security Rules</h2>
        <ul>
          <li>No user is allowed to hack, bypass, reverse-engineer, copy, clone, scrape, download, or replicate any part of QuickMela.</li>
          <li>No copying of UI/UX, branding, design system, layouts, components or workflows.</li>
          <li>No copying or reverse-engineering of backend code, auction engine, algorithms, AI logic, or security systems.</li>
          <li>No automated bots, scrapers, crawlers, except those approved by QuickMela.</li>
          <li>Strict anti-piracy, anti-plagiarism, and anti-reengineering rules applied.</li>
        </ul>

        <h2>3. Legal Ownership Declaration</h2>
        <p>
          QuickMela, BidCraft, SmartChit, and all related products, source code, UI/UX designs, algorithms, trademarks, brand identity,
          platform assets, business processes, documents, and intellectual property are 100% solely owned by <strong>Sanjeev Musugu</strong>,
          Founder &amp; CEO of Tekvoro Technologies.
        </p>
        <p>
          No other individual, partner, investor, vendor, bank, developer, freelancer or agency has ownership rights, IP rights,
          control rights, or claim rights over the QuickMela platform or its technology.
        </p>
        <p>
          All rights are protected under Indian Copyright Act, Trademarks Act, IT Act, and International IP laws.
        </p>

        <h2>4. Clear Prohibitions</h2>
        <ul>
          <li>No copying of content.</li>
          <li>No downloading or replicating listings, images, videos.</li>
          <li>No copying auction logic or technology.</li>
          <li>No building a competing system using QuickMela data.</li>
          <li>Violations will result in immediate termination + legal action.</li>
        </ul>

        <h2>5. Criminal &amp; Civil Liability</h2>
        <p>
          Violations can result in damages, civil claims, criminal FIR under IPC (Sections 63, 65, 66C, 420), IT Act 2000, Copyright Act,
          and Trademarks Act.
        </p>

        <h2>6. Platform Security Compliance</h2>
        <ul>
          <li>Data encryption rules</li>
          <li>Anti-scraping protection declaration</li>
          <li>Anti-bot declaration</li>
          <li>Secure login declaration</li>
          <li>Tampering prevention statement</li>
        </ul>

        <h2>Full Legal Text</h2>
        <p><strong>PLATFORM USAGE, SECURITY, COMPLIANCE &amp; OWNERSHIP POLICY</strong></p>
        <p>(Insert all your custom legal text here)</p>
      </article>
    </div>
  );
};

export default PlatformUsageAcceptancePolicy;
