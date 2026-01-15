import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const legalPages = [
  {
    path: '/legal/terms-and-conditions',
    title: 'Terms & Conditions',
    description: 'Master terms governing the use of the QuickMela platform.',
  },
  {
    path: '/legal/privacy-policy',
    title: 'Privacy Policy',
    description: 'How QuickMela collects, uses, and protects personal data.',
  },
  {
    path: '/legal/e-contract-digital-agreement',
    title: 'E-Contract & Digital Agreement Policy',
    description: 'Validity and enforceability of digital contracts and agreements.',
  },
  {
    path: '/legal/auction-rules-bidding',
    title: 'Auction Rules & Bidding Policy',
    description: 'Rules for bidding, participation, and auction closure.',
  },
  {
    path: '/legal/anti-fraud-shill-bidding',
    title: 'Anti-Fraud & Anti–Shill Bidding Policy',
    description: 'Policies to detect, prevent, and act on fraudulent behaviour.',
  },
  {
    path: '/legal/seller-policy',
    title: 'Seller Policy',
    description: 'Obligations, rights, and responsibilities of sellers.',
  },
  {
    path: '/legal/buyer-policy',
    title: 'Buyer Policy',
    description: 'Rules and responsibilities for buyers on the platform.',
  },
  {
    path: '/legal/refund-cancellation-dispute',
    title: 'Refund, Cancellation & Dispute Resolution Policy',
    description: 'Procedures for refunds, cancellations, and resolving disputes.',
  },
  {
    path: '/legal/wallet-deposit-investment',
    title: 'Wallet, Deposit & Investment Agreement Policy',
    description: 'Terms for wallet usage, deposits, and investment arrangements.',
  },
  {
    path: '/legal/sarfaesi-property-compliance',
    title: 'SARFAESI & Property Auction Compliance Policy',
    description: 'Compliance standards for SARFAESI and property auctions.',
  },
  {
    path: '/legal/intellectual-property',
    title: 'Intellectual Property, Copyright & Trademark Policy',
    description: 'Protection of IP, copyrights, and trademarks related to QuickMela.',
  },
  {
    path: '/legal/vendor-bank-partner-agreement',
    title: 'Vendor & Bank Partner Agreement',
    description: 'Agreement for banks, NBFCs, recovery agencies, and asset managers partnering with QuickMela.',
  },
  {
    path: '/legal/bank-nbfc-mou',
    title: 'Bank / NBFC Partnership MoU',
    description: 'Memorandum of Understanding template for seized vehicle and SARFAESI auction collaboration.',
  },
  {
    path: '/legal/vendor-service-level-agreement',
    title: 'Vendor Service Level Agreement (SLA)',
    description: 'SLA for vendors handling repossession, inspections, storage, and delivery services.',
  },
  {
    path: '/legal/recovery-agency-agreement',
    title: 'Recovery Agency Agreement',
    description: 'Agreement terms for repossession vendors, field agents, and recovery contractors.',
  },
  {
    path: '/legal/commission-rate-sheet',
    title: 'Commission Rate Sheet',
    description: 'Commission and pricing models for banks, NBFCs, vendors, and asset partners.',
  },
  {
    path: '/legal/white-label-partner-agreement',
    title: 'White-Label Partner Agreement',
    description: 'Agreement for companies using the QuickMela auction engine as a white-label platform.',
  },
  {
    path: '/legal/bank-nbfc-onboarding-sop',
    title: 'Bank / NBFC Onboarding SOP',
    description: 'Standard Operating Procedure for bank and NBFC onboarding and asset liquidation.',
  },
  {
    path: '/legal/investor-policy',
    title: 'Investor Participation Policy',
    description: 'Investor participation, returns, and risk management policy for non-equity contributions.',
  },
  {
    path: '/legal/branding-policy',
    title: 'Branding, Logo & Brand Usage Policy',
    description: 'Rules governing QuickMela brand ownership, logo, colors, typography, and media usage.',
  },
  {
    path: '/legal/manuals-sops',
    title: 'Manuals & SOPs Hub',
    description: 'Central overview of QuickMela manuals, bank/vendor agreements, and operational SOPs.',
  },
  {
    path: '/legal/platform-usage-acceptance-policy',
    title: 'Platform Usage, Security, Compliance & Ownership Policy',
    description: 'Global usage, security, compliance, and ownership rules applicable to all QuickMela users.',
  },
  {
    path: '/legal/anti-reverse-engineering-tampering-application-security-protection-policy',
    title: 'Anti-Reverse-Engineering, Anti-Tampering & Application Security Protection Policy',
    description:
      'Defines protections against reverse engineering, tampering, spoofing, automation, and cloning of the QuickMela platform.',
  },
  {
    path: '/legal/incident-response-breach-handling-cybersecurity-crisis-management-policy',
    title: 'Incident Response, Breach Handling & Cybersecurity Crisis Management Policy',
    description:
      'Details how QuickMela/Tekvoro detects, contains, investigates, recovers from, and reports security incidents.',
  },
  {
    path: '/legal/auditlogs-monitoring-evidencepreservation-adminaccountability-policy',
    title: 'Audit Logs, Monitoring, Evidence Preservation & Admin Accountability Policy',
    description:
      'Governs logging, monitoring, evidence preservation, and admin accountability for all critical platform actions.',
  },
  {
    path: '/legal/crossbordertrade-importexport-customscompliance-internationalsellerbuyer-policy',
    title: 'Cross-Border Trade, Import/Export, Customs Compliance & International Seller/Buyer Policy',
    description:
      'Defines rules for cross-border auctions, import/export, customs duties, international shipping, and regulatory compliance.',
  },
  {
    path: '/legal/disputeresolution-complainthandling-arbitration-fairpractice-policy',
    title: 'Dispute Resolution, Complaint Handling, Arbitration & Fair Practice Policy',
    description:
      'Explains how QuickMela handles disputes, complaints, arbitration and fair practice between buyers, sellers, partners and the platform.',
  },
  {
    path: '/legal/emergencyresponse-safetyincidents-lawenforcement-crisismanagement-policy',
    title: 'Emergency Response, Safety Incidents, Law-Enforcement Cooperation & Crisis Management Policy',
    description:
      'Defines emergency response, safety incident handling, and law-enforcement cooperation protocols for QuickMela.',
  },
  {
    path: '/legal/dataprotection-privacygovernance-personaldatahandling-dpdpcompliance-policy',
    title: 'Data Protection, Privacy Governance, Personal Data Handling & DPDP Act Compliance Policy',
    description:
      'Ensures compliance with India’s DPDP Act 2023 and global best practices for data protection and privacy governance.',
  },
  {
    path: '/legal/dataaccuracy-integrityassurance-errorprevention-correction-policy',
    title: 'Data Accuracy, Integrity Assurance, Error Prevention & Correction Policy',
    description:
      'Governs correctness, integrity, error prevention, and correction of critical QuickMela data and logs.',
  },
  {
    path: '/legal/marketing-advertising-promotionethics-brandcommunication-policy',
    title: 'Marketing, Advertising, Promotion Ethics & Brand Communication Compliance Policy',
    description:
      'Defines ethical marketing, advertising, and brand communication rules in line with ASCI and consumer protection guidelines.',
  },
  {
    path: '/legal/vendor-partner-serviceprovider-onboarding-compliance-policy',
    title: 'Vendor, Partner, Service Provider Onboarding & Compliance Policy',
    description:
      'Explains how vendors, partners, and service providers are screened, onboarded, monitored, and controlled.',
  },
  {
    path: '/legal/usergrievance-redressal-complaintescalation-nodalofficer-policy',
    title: 'User Grievance Redressal, Complaint Escalation & Nodal Officer Compliance Policy',
    description:
      'Sets out grievance redressal, complaint escalation flows, and nodal officer compliance under Indian IT Rules.',
  },
  {
    path: '/legal/ethicalconduct-integrity-anticorruption-professionalbehaviour-codeofconduct-policy',
    title: 'Ethical Conduct, Integrity, Anti-Corruption, Professional Behaviour & Code of Conduct Policy',
    description:
      'Defines ethical conduct, integrity, anti-corruption, and professional behaviour expectations for all individuals associated with QuickMela.',
  },
  {
    path: '/legal/platformmoderation-contentreview-listingapproval-takedown-policy',
    title: 'Platform Moderation, Content Review, Listing Approval & Takedown Policy',
    description:
      'Explains how content, listings, users, and auctions are moderated, approved, restricted, or removed on QuickMela.',
  },
  {
    path: '/legal/security-authentication-passwordprotection-accesscontrol-encryption-policy',
    title: 'Security, Authentication, Password Protection, Access Control & Encryption Policy',
    description:
      'Defines platform-wide security, authentication, password protection, access control, and encryption requirements.',
  },
  {
    path: '/legal/aml-fraudprevention-financialcrimescompliance-policy',
    title: 'Anti-Money Laundering (AML), Fraud Prevention & Financial Crimes Compliance Policy',
    description:
      'Sets AML, fraud prevention, and financial crime controls for payments, wallets, payouts, and KYC.',
  },
  {
    path: '/legal/audit-logging-monitoring-compliancereview-regulatoryreporting-policy',
    title: 'Audit, Logging, Monitoring, Compliance Review & Regulatory Reporting Policy',
    description:
      'Defines how logs, audits, monitoring, and regulatory reporting are handled for transparency and compliance.',
  },
  {
    path: '/legal/apiusage-developeraccess-integrationsecurity-ratelimiting-policy',
    title: 'API Usage, Developer Access, Integration Security & Rate-Limiting Compliance Policy',
    description:
      'Covers API usage, developer access, integration security, rate limits, and data exposure rules for QuickMela APIs.',
  },
  {
    path: '/legal/businesscontinuity-disasterrecovery-systemavailability-outagecommunication-policy',
    title: 'Business Continuity, Disaster Recovery, System Availability & Outage Communication Policy',
    description:
      'Explains business continuity, disaster recovery, uptime, and outage communication rules for QuickMela/Tekvoro.',
  },
  {
    path: '/legal/intellectualproperty-copyright-trademark-brandprotection-policy',
    title: 'Intellectual Property (IP), Copyright, Trademark, Branding & Content Ownership Policy',
    description:
      'Defines IP ownership, branding, copyright, and content usage rules for QuickMela/Tekvoro and its users.',
  },
  {
    path: '/legal/aiusage-monitoring-fairness-safety-responsibleautomation-policy',
    title: 'AI Usage, Monitoring, Fairness, Safety, Transparency & Responsible Automation Policy',
    description:
      'Covers safe, fair, and transparent use of AI systems, fraud models, and automation across the platform.',
  },
  {
    path: '/legal/dataretention-archival-lifecyclemanagement-migration-offboarding-policy',
    title: 'Data Retention, Archival, Lifecycle Management, Migration & User Offboarding Policy',
    description:
      'Defines lifecycle rules for data retention, archival, migration, and user offboarding for QuickMela/Tekvoro.',
  },
  {
    path: '/legal/legalnotice-termsupdate-usernotification-versioning-policy',
    title: 'Legal Notice, Terms Update Procedure, User Notification Rules & Policy Versioning System',
    description:
      'Explains how legal documents are published, versioned, updated, and communicated to users with proper notice.',
  },
  {
    path: '/legal/quickmela-legal-compliance-manual',
    title: 'QuickMela Legal & Compliance Manual',
    description:
      'Branded overview of the complete QuickMela 100-page legal, compliance, policy, and documentation framework.',
  },
  {
    path: '/legal/seller-onboarding-productapproval-verification-compliance-policy',
    title: 'Seller Onboarding, Product Approval, Verification & Compliance Policy',
    description:
      'Defines the onboarding, product approval, verification, and compliance framework applicable to all QuickMela sellers.',
  },
  {
    path: '/legal/buyer-onboarding-identityverification-walletsafety-responsibleparticipation-policy',
    title: 'Buyer Onboarding, Identity Verification, Wallet Safety & Responsible Participation Policy',
    description:
      'Sets buyer onboarding, KYC, wallet safety, responsible bidding, and participation standards for all QuickMela buyers.',
  },
  {
    path: '/legal/auction-participation-rules-bidconduct-antimanipulation-policy',
    title: 'Auction Participation Rules, Bid Conduct & Anti-Manipulation Policy',
    description:
      'Defines auction participation standards, bid conduct rules, and anti-manipulation protections for all QuickMela users.',
  },
  {
    path: '/legal/buyer-deposit-escrowhandling-refunds-paymentcompliance-policy',
    title: 'Buyer Deposit, Escrow Handling, Refunds & Payment Compliance Policy',
    description:
      'Explains deposits, wallet funding, escrow handling, refunds, and payment compliance obligations for buyers.',
  },
  {
    path: '/legal/highrisk-items-prohibitedassets-restrictedlistings-policy',
    title: 'High-Risk Items, Prohibited Assets & Restricted Listings Policy',
    description:
      'Lists prohibited, restricted, and high-risk asset categories, along with seller disclosure and enforcement rules.',
  },
  {
    path: '/legal/vehicle-documentation-conditiondisclosure-authenticityverification-policy',
    title: 'Vehicle Documentation, Condition Disclosure & Authenticity Verification Policy',
    description:
      'Defines documentation, disclosure, and authenticity requirements for vehicles listed and auctioned on QuickMela.',
  },
  {
    path: '/legal/internal-accesscontrol-rbac-adminaccountability-audit-policy',
    title: 'Internal Access Control, RBAC, Admin Accountability & Audit Policy',
    description:
      'Defines internal RBAC, admin responsibilities, audit trails, and misuse prevention for QuickMela internal users.',
  },
  {
    path: '/legal/transport-yardsafety-delivery-handover-compliance-policy',
    title: 'Transport, Yard Safety, Delivery & Handover Compliance Policy',
    description:
      'Defines yard access, logistics, delivery, and handover safety and compliance standards for QuickMela vehicles.',
  },
  {
    path: '/legal/transport-partner-agreement',
    title: 'Transport Partner Agreement',
    description:
      'Defines responsibilities, SLAs, safety, payments, and conduct rules for logistics and delivery partners.',
  },
  {
    path: '/legal/vendor-registration-approval-policy',
    title: 'Vendor Registration & Approval Policy',
    description:
      'Defines vendor onboarding eligibility, documentation, verification, approval workflow, and blacklisting rules.',
  },
  {
    path: '/legal/ai-fraud-detection-policy',
    title: 'AI Fraud Detection Policy',
    description: 'Overview of QuickMela AI-driven fraud detection and prevention framework.',
  },
  {
    path: '/legal/ai-risk-score-policy',
    title: 'AI Risk Scoring Policy',
    description: 'Explains the AI-based risk score system and how different risk levels impact user access.',
  },
  {
    path: '/legal/device-fingerprinting-policy',
    title: 'Device Security & Fingerprinting Policy',
    description: 'Describes device fingerprinting, captured attributes, and automatic blocks for risky devices.',
  },
  {
    path: '/legal/multi-account-detection-policy',
    title: 'Multi-Account Detection Policy',
    description: 'Details how QuickMela detects and penalizes duplicate and collusive accounts.',
  },
  {
    path: '/legal/location-gps-verification-policy',
    title: 'Location & GPS Verification Policy',
    description: 'Explains how QuickMela verifies location, detects geo-spoofing, and enforces penalties.',
  },
  {
    path: '/legal/behavioural-monitoring-policy',
    title: 'Behavioural Monitoring Policy',
    description: 'Describes behavioural pattern tracking used to flag suspicious or bot-like activity.',
  },
  {
    path: '/legal/ip-reputation-network-security-policy',
    title: 'IP Reputation & Network Security Policy',
    description: 'Explains IP reputation analysis and network-based blocking of bots and high-risk traffic.',
  },
  {
    path: '/legal/automated-fraud-escalation-policy',
    title: 'Automated Fraud Escalation Policy',
    description: 'Outlines fraud escalation levels from AI flags to compliance review and legal action.',
  },
  {
    path: '/legal/auction-integrity-monitoring-policy',
    title: 'Auction Integrity & Real-Time Monitoring Policy',
    description: 'Defines real-time auction monitoring and anti-manipulation protections.',
  },
  {
    path: '/legal/aml-financial-integrity-policy',
    title: 'AML & Financial Integrity Policy',
    description: 'Sets out AML controls to prevent money laundering and financial misuse on QuickMela.',
  },
  {
    path: '/legal/ai-model-ownership-policy',
    title: 'AI Model Ownership & Training Data Protection Policy',
    description: 'Declares AI IP ownership and training data protection rules for QuickMela systems.',
  },
  {
    path: '/legal/ai-explainability-human-oversight-policy',
    title: 'AI Explainability & Human Oversight Policy',
    description: 'Ensures AI-driven decisions are explainable and always subject to human review.',
  },
  {
    path: '/legal/ai-model-transparency-audit-policy',
    title: 'AI Model Transparency & Audit Policy',
    description: 'Explains audit, monitoring, and regulator-facing transparency for QuickMela AI models.',
  },
];

const LegalIndex: React.FC = () => {
  usePageSEO({
    title: 'Legal Documents | QuickMela',
    description: 'Full legal document library for the QuickMela online auction platform.',
    canonicalPath: '/legal',
    robots: 'index,follow',
  });

  const pagesByPath = React.useMemo(
    () =>
      legalPages.reduce<Record<string, (typeof legalPages)[number]>>((acc, page) => {
        acc[page.path] = page;
        return acc;
      }, {}),
    [],
  );

  const featuredPages: (typeof legalPages)[number][] = [
    pagesByPath['/legal/terms-and-conditions'],
    pagesByPath['/legal/privacy-policy'],
    pagesByPath['/legal/auction-rules-bidding'],
    pagesByPath['/legal/seller-policy'],
    pagesByPath['/legal/buyer-policy'],
    pagesByPath['/legal/refund-cancellation-dispute'],
    pagesByPath['/legal/security-authentication-passwordprotection-accesscontrol-encryption-policy'],
    pagesByPath['/legal/legalnotice-termsupdate-usernotification-versioning-policy'],
    pagesByPath['/legal/quickmela-legal-compliance-manual'],
  ].filter(Boolean);

  const sections: { title: string; pages: (typeof legalPages)[number][] } = {
    title: '',
    pages: [],
  } as any;

  const categorizedSections: { title: string; pages: (typeof legalPages)[number][] }[] = [
    {
      title: 'Core Platform & User Policies',
      pages: [
        pagesByPath['/legal/terms-and-conditions'],
        pagesByPath['/legal/privacy-policy'],
        pagesByPath['/legal/e-contract-digital-agreement'],
        pagesByPath['/legal/auction-rules-bidding'],
        pagesByPath['/legal/anti-fraud-shill-bidding'],
        pagesByPath['/legal/seller-policy'],
        pagesByPath['/legal/buyer-policy'],
        pagesByPath['/legal/refund-cancellation-dispute'],
        pagesByPath['/legal/wallet-deposit-investment'],
        pagesByPath['/legal/sarfaesi-property-compliance'],
        pagesByPath['/legal/platform-usage-acceptance-policy'],
        pagesByPath['/legal/investor-policy'],
      ].filter(Boolean),
    },
    {
      title: 'Bank, Vendor & Partner Agreements',
      pages: [
        pagesByPath['/legal/vendor-bank-partner-agreement'],
        pagesByPath['/legal/bank-nbfc-mou'],
        pagesByPath['/legal/vendor-service-level-agreement'],
        pagesByPath['/legal/recovery-agency-agreement'],
        pagesByPath['/legal/commission-rate-sheet'],
        pagesByPath['/legal/white-label-partner-agreement'],
        pagesByPath['/legal/bank-nbfc-onboarding-sop'],
        pagesByPath['/legal/vendor-registration-approval-policy'],
        pagesByPath['/legal/transport-partner-agreement'],
      ].filter(Boolean),
    },
    {
      title: 'Security, Data Protection & Logging',
      pages: [
        pagesByPath['/legal/security-authentication-passwordprotection-accesscontrol-encryption-policy'],
        pagesByPath['/legal/anti-reverse-engineering-tampering-application-security-protection-policy'],
        pagesByPath['/legal/incident-response-breach-handling-cybersecurity-crisis-management-policy'],
        pagesByPath['/legal/auditlogs-monitoring-evidencepreservation-adminaccountability-policy'],
        pagesByPath['/legal/audit-logging-monitoring-compliancereview-regulatoryreporting-policy'],
        pagesByPath['/legal/dataprotection-privacygovernance-personaldatahandling-dpdpcompliance-policy'],
        pagesByPath['/legal/dataaccuracy-integrityassurance-errorprevention-correction-policy'],
        pagesByPath['/legal/dataretention-archival-lifecyclemanagement-migration-offboarding-policy'],
        pagesByPath['/legal/businesscontinuity-disasterrecovery-systemavailability-outagecommunication-policy'],
        pagesByPath['/legal/aml-fraudprevention-financialcrimescompliance-policy'],
        pagesByPath['/legal/aml-financial-integrity-policy'],
        pagesByPath['/legal/apiusage-developeraccess-integrationsecurity-ratelimiting-policy'],
        pagesByPath['/legal/ip-reputation-network-security-policy'],
      ].filter(Boolean),
    },
    {
      title: 'AI, Fraud & Risk Monitoring',
      pages: [
        pagesByPath['/legal/ai-fraud-detection-policy'],
        pagesByPath['/legal/ai-risk-score-policy'],
        pagesByPath['/legal/device-fingerprinting-policy'],
        pagesByPath['/legal/multi-account-detection-policy'],
        pagesByPath['/legal/location-gps-verification-policy'],
        pagesByPath['/legal/behavioural-monitoring-policy'],
        pagesByPath['/legal/automated-fraud-escalation-policy'],
        pagesByPath['/legal/auction-integrity-monitoring-policy'],
        pagesByPath['/legal/aiusage-monitoring-fairness-safety-responsibleautomation-policy'],
        pagesByPath['/legal/ai-model-ownership-policy'],
        pagesByPath['/legal/ai-explainability-human-oversight-policy'],
        pagesByPath['/legal/ai-model-transparency-audit-policy'],
      ].filter(Boolean),
    },
    {
      title: 'Onboarding, Participation & Payments',
      pages: [
        pagesByPath['/legal/seller-onboarding-productapproval-verification-compliance-policy'],
        pagesByPath['/legal/buyer-onboarding-identityverification-walletsafety-responsibleparticipation-policy'],
        pagesByPath['/legal/auction-participation-rules-bidconduct-antimanipulation-policy'],
        pagesByPath['/legal/buyer-deposit-escrowhandling-refunds-paymentcompliance-policy'],
        pagesByPath['/legal/highrisk-items-prohibitedassets-restrictedlistings-policy'],
        pagesByPath['/legal/vehicle-documentation-conditiondisclosure-authenticityverification-policy'],
        pagesByPath['/legal/transport-yardsafety-delivery-handover-compliance-policy'],
      ].filter(Boolean),
    },
    {
      title: 'User Behaviour, Content & Complaints',
      pages: [
        pagesByPath['/legal/usergrievance-redressal-complaintescalation-nodalofficer-policy'],
        pagesByPath['/legal/ethicalconduct-integrity-anticorruption-professionalbehaviour-codeofconduct-policy'],
        pagesByPath['/legal/platformmoderation-contentreview-listingapproval-takedown-policy'],
        pagesByPath['/legal/disputeresolution-complainthandling-arbitration-fairpractice-policy'],
        pagesByPath['/legal/emergencyresponse-safetyincidents-lawenforcement-crisismanagement-policy'],
        pagesByPath['/legal/marketing-advertising-promotionethics-brandcommunication-policy'],
        pagesByPath['/legal/crossbordertrade-importexport-customscompliance-internationalsellerbuyer-policy'],
      ].filter(Boolean),
    },
    {
      title: 'Legal Governance, IP & Branding',
      pages: [
        pagesByPath['/legal/intellectual-property'],
        pagesByPath['/legal/intellectualproperty-copyright-trademark-brandprotection-policy'],
        pagesByPath['/legal/branding-policy'],
        pagesByPath['/legal/legalnotice-termsupdate-usernotification-versioning-policy'],
        pagesByPath['/legal/quickmela-legal-compliance-manual'],
        pagesByPath['/legal/manuals-sops'],
      ].filter(Boolean),
    },
    {
      title: 'Internal Governance & Admin Controls',
      pages: [
        pagesByPath['/legal/auditlogs-monitoring-evidencepreservation-adminaccountability-policy'],
        pagesByPath['/legal/internal-accesscontrol-rbac-adminaccountability-audit-policy'],
      ].filter(Boolean),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-primary-600">Home</Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-700 dark:text-gray-200">Legal</li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Legal, Compliance & Trust Center
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          QuickMela handles high-value auctions, payments and sensitive personal data. This Legal, Compliance &
          Trust Center brings together the policies that govern how we run auctions, protect users, use AI,
          prevent fraud, and work with banks and partners.
        </p>
      </header>
      <div className="space-y-10">
        {featuredPages.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Featured documents
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredPages.map((page) => (
                <article
                  key={page.path}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {page.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {page.description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link
                      to={page.path}
                      className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      View policy
                      <span className="ml-1" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {categorizedSections.map((section) =>
          section.pages.length ? (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {section.pages.map((page) => (
                  <article
                    key={page.path}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {page.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {page.description}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Link
                        to={page.path}
                        className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        View policy
                        <span className="ml-1" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null,
        )}
      </div>
    </div>
  );
};

export default LegalIndex;
