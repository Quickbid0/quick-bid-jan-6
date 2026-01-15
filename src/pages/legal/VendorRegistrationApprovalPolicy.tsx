import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const VendorRegistrationApprovalPolicy: React.FC = () => {
  usePageSEO({
    title: 'Vendor Registration & Approval Policy | QuickMela',
    description:
      'Defines the process, documentation, verification, eligibility criteria, approval workflow, and compliance requirements for all vendors working with QuickMela.',
    canonicalPath: '/legal/vendor-registration-approval-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Vendor Registration &amp; Approval Policy</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Vendor Registration &amp; Approval Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          The Vendor Registration &amp; Approval Policy defines the process, documentation, verification, eligibility
          criteria, approval workflow, and compliance requirements for all vendors, suppliers, service providers, and
          contractors working with QuickMela / Tekvoro.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>
          The Vendor Registration &amp; Approval Policy defines the process, documentation, verification, eligibility
          criteria, approval workflow, and compliance requirements for all vendors, suppliers, service providers, and
          contractors working with QuickMela / Tekvoro. This ensures:
        </p>
        <ul>
          <li>Secure onboarding</li>
          <li>Verified &amp; trustworthy vendor partners</li>
          <li>Fraud-free operations</li>
          <li>Transparent evaluation</li>
          <li>Compliance with law and internal standards</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Service vendors</li>
          <li>Transport vendors</li>
          <li>Product suppliers</li>
          <li>IT vendors</li>
          <li>Marketing vendors</li>
          <li>Finance-linked partners</li>
          <li>Maintenance &amp; utility vendors</li>
          <li>Third-party contractors</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>Registration</li>
          <li>KYC</li>
          <li>Verification</li>
          <li>Legal compliance</li>
          <li>Approval workflow</li>
          <li>Blacklisting rules</li>
        </ul>

        <h2>3. Vendor Eligibility Criteria</h2>
        <p>A vendor must meet minimum requirements:</p>

        <h3>3.1 Legal Eligibility</h3>
        <ul>
          <li>Registered business (GSTIN preferred)</li>
          <li>PAN mandatory</li>
          <li>Valid identity of promoter/owner</li>
          <li>Active bank account</li>
          <li>Compliance with local/state laws</li>
        </ul>

        <h3>3.2 Operational Eligibility</h3>
        <p>Vendor must have:</p>
        <ul>
          <li>Minimum 1-year experience</li>
          <li>Proven service record</li>
          <li>Ability to meet SLAs</li>
          <li>Capacity to scale operations</li>
          <li>No blacklisting in past 3 years</li>
        </ul>

        <h3>3.3 Financial Eligibility</h3>
        <p>Vendor must demonstrate:</p>
        <ul>
          <li>Valid financial documents</li>
          <li>Stable cash flow</li>
          <li>Reasonable creditworthiness</li>
          <li>No major outstanding legal disputes</li>
        </ul>

        <h2>4. Registration Requirements</h2>
        <h3>4.1 Vendor Must Submit</h3>
        <ul>
          <li>Company registration certificate</li>
          <li>GST certificate</li>
          <li>PAN card</li>
          <li>Aadhaar/ID of owner/director</li>
          <li>Cancelled cheque/bank passbook</li>
          <li>MSME certificate (if applicable)</li>
          <li>Past work references</li>
          <li>Portfolio / samples (if applicable)</li>
          <li>Signed Vendor Agreement</li>
        </ul>

        <h3>4.2 Additional For Transport Vendors</h3>
        <ul>
          <li>Vehicle documents</li>
          <li>Insurance</li>
          <li>Driver documents</li>
          <li>Fleet size proof</li>
        </ul>

        <h2>5. Verification Process</h2>
        <p>Verification is conducted in 3 levels:</p>

        <h3>5.1 Level 1 — Document Verification</h3>
        <p>Checks:</p>
        <ul>
          <li>Validity of GST/PAN</li>
          <li>Cross-check registration</li>
          <li>Verify bank account</li>
          <li>Confirm ownership</li>
        </ul>

        <h3>5.2 Level 2 — Background Check</h3>
        <p>Vendor past work, market reputation, online verification, fraud risk history.</p>

        <h3>5.3 Level 3 — Operational Assessment</h3>
        <p>Quality of services, infrastructure audit, manpower capability, audit of equipment (if applicable), compliance capability.</p>

        <h2>6. Approval Workflow</h2>
        <h3>6.1 Step-by-Step Process</h3>
        <ul>
          <li>Vendor applies using portal/form</li>
          <li>Documents submitted</li>
          <li>Initial screening by Vendor Management Team</li>
          <li>Verification team validates documents</li>
          <li>Operational team evaluates capability</li>
          <li>Finance team checks financial stability</li>
          <li>Legal team reviews compliance risks</li>
          <li>Final approval by Vendor Approval Committee</li>
        </ul>

        <h3>6.2 Approval Outcome Types</h3>
        <ul>
          <li>Approved</li>
          <li>Approved with conditions</li>
          <li>Rejected</li>
          <li>On hold pending documents</li>
        </ul>

        <h3>6.3 Approval Timeline</h3>
        <p>Standard timeline: 3–10 business days.</p>

        <h2>7. Vendor Classification</h2>
        <p>Vendors are classified as:</p>
        <ul>
          <li>Tier 1 (High value / critical)</li>
          <li>Tier 2 (Standard)</li>
          <li>Tier 3 (Local / small vendors)</li>
          <li>Strategic partners</li>
          <li>Contract vendors</li>
          <li>On-call vendors</li>
        </ul>
        <p>Classification defines SLA, monitoring, payments.</p>

        <h2>8. Vendor Onboarding</h2>
        <p>After approval:</p>
        <ul>
          <li>Vendor receives login to Vendor Portal</li>
          <li>Vendor Agreement shared digitally</li>
          <li>Bank details linked</li>
          <li>KYC verified</li>
          <li>SLA assigned</li>
          <li>Operational training given</li>
        </ul>
        <p>Vendor must accept all terms before starting work.</p>

        <h2>9. Vendor Code of Conduct</h2>
        <p>Vendor must:</p>
        <ul>
          <li>Follow all compliance rules</li>
          <li>Not engage in bribery or corruption</li>
          <li>Maintain professionalism</li>
          <li>Protect company data</li>
          <li>Deliver as per SLA</li>
          <li>Respect intellectual property</li>
          <li>Avoid conflicts of interest</li>
        </ul>
        <p>Any violation = suspension or blacklisting.</p>

        <h2>10. Vendor Blacklisting Rules</h2>
        <p>A vendor can be blacklisted for:</p>
        <ul>
          <li>Fraud</li>
          <li>Fake documents</li>
          <li>Overbilling</li>
          <li>Repeated SLA breaches</li>
          <li>Safety violations</li>
          <li>Theft or aiding theft</li>
          <li>Misconduct</li>
          <li>Legal disputes</li>
        </ul>
        <p>Blacklisting duration:</p>
        <ul>
          <li>Minor violations: 3–6 months</li>
          <li>Major violations: 1–3 years</li>
          <li>Critical violations: Permanent ban</li>
        </ul>

        <h2>11. Annual Vendor Review</h2>
        <p>Vendor performance will be reviewed yearly based on:</p>
        <ul>
          <li>SLA compliance</li>
          <li>Reliability</li>
          <li>Transaction volume</li>
          <li>Quality of service</li>
          <li>Audit results</li>
          <li>Complaint history</li>
        </ul>
        <p>Low-performing vendors may be removed.</p>

        <h2>12. Vendor Data &amp; Privacy Rules</h2>
        <p>Vendor data must be:</p>
        <ul>
          <li>Stored securely</li>
          <li>Not shared without permission</li>
          <li>Used only for business purposes</li>
          <li>Protected under internal compliance policies</li>
        </ul>

        <h2>13. Policy Updates</h2>
        <p>
          Company may update this policy anytime. Changes will be published on the vendor portal and website.
        </p>
      </article>
    </div>
  );
};

export default VendorRegistrationApprovalPolicy;
