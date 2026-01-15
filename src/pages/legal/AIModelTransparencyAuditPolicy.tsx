import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AIModelTransparencyAuditPolicy: React.FC = () => {
  usePageSEO({
    title: 'AI Model Transparency & Audit Policy | QuickMela',
    description: 'Explains audit, monitoring, and regulator-facing transparency for QuickMela AI models.',
    canonicalPath: '/legal/ai-model-transparency-audit-policy',
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
          <li className="text-gray-700 dark:text-gray-200">AI Model Transparency &amp; Audit Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          QuickMela – AI Model Transparency, Audit &amp; Accountability Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Owner: Sanjeev Musugu</p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>
          To ensure AI models are auditable, monitored, and compliant with Indian IT laws, and transparent to regulators
          (not public users).
        </p>

        <h2>2. Audit Requirements</h2>
        <p>AI systems must maintain:</p>
        <ul>
          <li>Version history</li>
          <li>Dataset lineage</li>
          <li>Training logs</li>
          <li>Risk scoring formula logs</li>
          <li>Output monitoring</li>
        </ul>

        <h2>3. Regulator Access</h2>
        <p>
          Upon official request from RBI, FIU-IND, MeitY, courts, or SARFAESI banks, QuickMela will share output
          transparency, detection rationale, and audit logs (but not core model code).
        </p>

        <h2>4. Internal AI Audits</h2>
        <p>QuickMela performs:</p>
        <ul>
          <li>Quarterly AI audits</li>
          <li>Annual external audit (if required by bank)</li>
          <li>Bias, drift, and data-skew detection</li>
        </ul>
      </article>
    </div>
  );
};

export default AIModelTransparencyAuditPolicy;
