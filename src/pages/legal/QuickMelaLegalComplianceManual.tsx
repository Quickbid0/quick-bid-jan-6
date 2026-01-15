import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const QuickMelaLegalComplianceManual: React.FC = () => {
  usePageSEO({
    title: 'QuickMela Legal & Compliance Manual | Tekvoro Technologies',
    description:
      'Branded overview of the QuickMela 100-Page Legal & Compliance Manual prepared by Tekvoro Technologies, summarising the full legal, policy, and compliance framework.',
    canonicalPath: '/legal/quickmela-legal-compliance-manual',
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
          <li className="text-gray-700 dark:text-gray-200">QuickMela Legal &amp; Compliance Manual</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          QUICKMELA LEGAL &amp; COMPLIANCE MANUAL
        </h1>
        <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          QUICKMELA – COMPLETE LEGAL, COMPLIANCE &amp; POLICY MANUAL (BRANDED VERSION)
        </p>
        <p className="text-gray-600 dark:text-gray-300">
          Prepared by: Tekvoro Technologies (QuickMela)
        </p>
        <p className="text-gray-600 dark:text-gray-300">Updated: 20 November 2025</p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 sm:p-8 border border-orange-100 dark:border-orange-900/40 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-5 select-none"
          aria-hidden="true"
        >
          <div className="flex justify-center items-center h-full text-6xl font-extrabold tracking-[0.3em] text-[#FF6E1E]">
            QUICKMELA
          </div>
        </div>

        <section className="relative">
          <h2>Brand Elements</h2>
          <dl>
            <div>
              <dt>Primary Color</dt>
              <dd>
                <code>#FF6E1E</code>
              </dd>
            </div>
            <div>
              <dt>Secondary Color</dt>
              <dd>
                <code>#1A1A1A</code>
              </dd>
            </div>
            <div>
              <dt>Watermark</dt>
              <dd>QUICKMELATM</dd>
            </div>
            <div>
              <dt>Company</dt>
              <dd>Tekvoro Technologies</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>+91 9121331813 | tekvoro@gmail.com | www.quickmela.com</dd>
            </div>
          </dl>
        </section>

        <section className="relative mt-6">
          <h2>Summary</h2>
          <p>
            This branded PDF includes the entire structure and framework of the QuickMela 100-Page Legal &amp; Compliance
            Manual.
          </p>
          <p>
            It contains fully defined policies, MoUs, agreements, SLA, SOPs, templates, and compliance frameworks.
          </p>
          <p>QUICKMELATM</p>
        </section>

        <section className="relative mt-8">
          <h2>Explore the Full Legal &amp; Compliance Suite</h2>
          <p>
            The complete manual is implemented across the QuickMela Legal Center as individual, searchable policies.
            You can browse all active legal documents and frameworks here:
          </p>
          <p>
            <Link to="/legal" className="font-semibold text-[#FF6E1E] hover:underline">
              Go to QuickMela Legal Center
            </Link>
          </p>
        </section>
      </article>
    </div>
  );
};

export default QuickMelaLegalComplianceManual;
