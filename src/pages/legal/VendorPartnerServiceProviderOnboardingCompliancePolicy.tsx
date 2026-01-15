import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const VendorPartnerServiceProviderOnboardingCompliancePolicy: React.FC = () => {
  usePageSEO({
    title: 'Vendor, Partner, Service Provider Onboarding & Compliance Policy | QuickMela',
    description:
      'Governs screening, onboarding, monitoring, and compliance of all vendors, partners, and service providers working with QuickMela/Tekvoro.',
    canonicalPath: '/legal/vendor-partner-serviceprovider-onboarding-compliance-policy',
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
            Vendor, Partner, Service Provider Onboarding &amp; Compliance Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Vendor, Partner, Service Provider Onboarding &amp; Compliance Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This governs how all vendors, contractors, agencies, delivery companies, yard operators, KYC providers,
          payment partners, verification companies, creative agencies, tech partners, and B2B suppliers must be
          screened, onboarded, monitored, and controlled.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy ensures:</p>
        <ul>
          <li>Safe vendor onboarding</li>
          <li>No risky or illegal partnerships</li>
          <li>High-quality service providers</li>
          <li>Verified delivery &amp; yard vendors</li>
          <li>Data protection compliance</li>
          <li>Operational safety</li>
          <li>Audit trails</li>
          <li>Legal contracts</li>
          <li>Fraud-free ecosystem</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Logistics partners</li>
          <li>Delivery vendors</li>
          <li>Transport companies</li>
          <li>Yard/warehouse contractors</li>
          <li>KYC service providers</li>
          <li>Call centers</li>
          <li>Marketing agencies</li>
          <li>Ad agencies</li>
          <li>Creative partners</li>
          <li>Payment gateway vendors</li>
          <li>Verification vendors</li>
          <li>Cloud &amp; tech providers</li>
          <li>SMS/Email/WhatsApp vendors</li>
          <li>Influencer partners</li>
          <li>Hardware suppliers</li>
        </ul>

        <h2>3. Vendor Categories</h2>
        <h3>A. Critical Vendors</h3>
        <p>Impact:</p>
        <ul>
          <li>KYC</li>
          <li>Payment settlement</li>
          <li>Auction engine</li>
          <li>Security systems</li>
          <li>Fraud detection</li>
          <li>Delivery &amp; transport</li>
          <li>Storage/yard operations</li>
        </ul>
        <p>Require strictest onboarding.</p>
        <h3>B. Operational Vendors</h3>
        <p>Impact:</p>
        <ul>
          <li>Customer support</li>
          <li>Creative services</li>
          <li>Marketing</li>
          <li>Photography</li>
          <li>Influencers</li>
        </ul>
        <p>Moderate controls.</p>
        <h3>C. Non-Critical Vendors</h3>
        <p>Impact:</p>
        <ul>
          <li>Printing</li>
          <li>Office supplies</li>
        </ul>
        <p>Light controls.</p>

        <h2>4. Mandatory Vendor Verification Requirements</h2>
        <p>Every vendor MUST complete:</p>
        <h3>A. Identity Verification</h3>
        <ul>
          <li>Company PAN</li>
          <li>GST certificate</li>
          <li>Certificate of incorporation</li>
          <li>Authorized signatory details</li>
        </ul>
        <h3>B. Legal Verification</h3>
        <ul>
          <li>Vendor agreement</li>
          <li>NDA (non-disclosure agreement)</li>
          <li>DPA (data processing agreement) if handling data</li>
          <li>SLA (service level agreement)</li>
        </ul>
        <h3>C. Operational Verification</h3>
        <ul>
          <li>Previous client references</li>
          <li>Performance history</li>
          <li>Delivery capacity</li>
          <li>Infrastructure check</li>
        </ul>
        <h3>D. Financial Verification</h3>
        <ul>
          <li>Bank details</li>
          <li>Cancelled cheque</li>
          <li>Past financial reliability</li>
        </ul>
        <h3>E. Security Verification</h3>
        <ul>
          <li>Data handling standards</li>
          <li>Encryption use</li>
          <li>Employee background checks</li>
          <li>Access controls</li>
        </ul>

        <h2>5. High-Risk Vendor Screening</h2>
        <p>High-risk categories include:</p>
        <ul>
          <li>KYC/identity verification vendors</li>
          <li>Payment gateway integration vendors</li>
          <li>Delivery/logistics companies</li>
          <li>Yard/warehouse operators</li>
          <li>Outsourced support teams</li>
        </ul>
        <p>They must undergo:</p>
        <ul>
          <li>Background check</li>
          <li>Physical workplace inspection</li>
          <li>Staff identity verification</li>
          <li>Compliance certifications</li>
          <li>Proof of data security</li>
        </ul>
        <p>Risky vendors are rejected.</p>

        <h2>6. Vendor Approval Process</h2>
        <p>Step 1 — Submission</p>
        <p>Vendor submits all required documents.</p>
        <p>Step 2 — Compliance Check</p>
        <p>Verifies:</p>
        <ul>
          <li>Legality</li>
          <li>Background</li>
          <li>Risk score</li>
        </ul>
        <p>Step 3 — Security Assessment</p>
        <p>Validates:</p>
        <ul>
          <li>Data protection</li>
          <li>Access control</li>
          <li>Encryption practices</li>
        </ul>
        <p>Step 4 — Operational Evaluation</p>
        <p>Reviews:</p>
        <ul>
          <li>Timeliness</li>
          <li>Reliability</li>
          <li>Past delivery performance</li>
        </ul>
        <p>Step 5 — Contract Signing</p>
        <p>Vendor must sign:</p>
        <ul>
          <li>NDA</li>
          <li>DPA (if handling data)</li>
          <li>SLA</li>
          <li>Master Service Agreement</li>
        </ul>
        <p>Step 6 — Final Approval</p>
        <p>Compliance + Legal + Operations + CEO approval for critical vendors.</p>

        <h2>7. Vendor Responsibilities</h2>
        <p>Vendors MUST:</p>
        <ul>
          <li>Follow platform rules</li>
          <li>Maintain safety standards</li>
          <li>Protect user data</li>
          <li>Maintain service uptime</li>
          <li>Train their employees</li>
          <li>Follow delivery/yard safety rules</li>
          <li>Complete jobs professionally</li>
          <li>Report issues proactively</li>
        </ul>
        <p>Vendors CANNOT:</p>
        <ul>
          <li>Outsource subcontractors without approval</li>
          <li>View unnecessary user data</li>
          <li>Misuse platform tools</li>
          <li>Use unsafe equipment</li>
          <li>Mislead clients</li>
          <li>Delay without reason</li>
        </ul>

        <h2>8. Performance Monitoring</h2>
        <p>Vendors will be monitored for:</p>
        <ul>
          <li>Delivery accuracy</li>
          <li>Timeliness</li>
          <li>Damage rate</li>
          <li>Customer complaints</li>
          <li>Communication quality</li>
          <li>Compliance violations</li>
          <li>Fraud signals</li>
          <li>Employee behaviour</li>
        </ul>
        <p>Monthly rating:</p>
        <ul>
          <li>4.5–5.0 → Premium vendor</li>
          <li>4.0–4.4 → Eligible</li>
          <li>3.5–3.9 → Warning</li>
          <li>3.0–3.4 → Probation</li>
          <li>&lt;3.0 → Termination</li>
        </ul>

        <h2>9. Vendor Access Restrictions</h2>
        <p>Vendors may access ONLY:</p>
        <ul>
          <li>Delivery addresses</li>
          <li>Basic order details</li>
          <li>Tracking status</li>
          <li>Assigned jobs</li>
        </ul>
        <p>Vendors CANNOT access:</p>
        <ul>
          <li>Full user profiles</li>
          <li>KYC data</li>
          <li>Wallet balance</li>
          <li>Auction logs</li>
          <li>Payment details</li>
          <li>Admin tools</li>
          <li>Internal dashboards</li>
        </ul>
        <p>Violation → immediate termination.</p>

        <h2>10. Vendor Employee Rules</h2>
        <p>Vendors must ensure:</p>
        <ul>
          <li>Employees wear ID cards</li>
          <li>Employees are trained</li>
          <li>Clean background check</li>
          <li>Drug-free</li>
          <li>Follow safety rules</li>
          <li>Dress uniformly</li>
          <li>Use verified mobile numbers</li>
          <li>Not engage in misconduct</li>
        </ul>
        <p>Employee violations → vendor penalties.</p>

        <h2>11. Delivery Vendor Compliance Rules</h2>
        <p>Delivery vendors MUST:</p>
        <ul>
          <li>Follow pickup/delivery SOP</li>
          <li>Verify OTP</li>
          <li>Upload proof-of-delivery</li>
          <li>Handle items safely</li>
          <li>Never use personal vehicles without approval</li>
          <li>Follow local laws</li>
        </ul>
        <p>Forbidden:</p>
        <ul>
          <li>Fake delivery attempts</li>
          <li>Theft</li>
          <li>Harassment</li>
          <li>Cash handling (unless approved)</li>
        </ul>

        <h2>12. Yard/Warehouse Vendor Compliance</h2>
        <p>Must:</p>
        <ul>
          <li>Provide safe environment</li>
          <li>Maintain CCTV</li>
          <li>Follow asset tagging rules</li>
          <li>Handle items carefully</li>
          <li>Store items responsibly</li>
          <li>Report damages</li>
          <li>Restrict access</li>
        </ul>
        <p>Not allowed:</p>
        <ul>
          <li>Unauthorized item movement</li>
          <li>Storage of prohibited items</li>
          <li>Staff without ID cards</li>
        </ul>

        <h2>13. Payment &amp; Financial Vendor Duties</h2>
        <p>Payment partners must:</p>
        <ul>
          <li>Follow PCI-DSS</li>
          <li>Comply with RBI</li>
          <li>Offer secure gateway</li>
          <li>Handle refunds responsibly</li>
          <li>Provide accurate settlement logs</li>
        </ul>
        <p>Financial vendors CANNOT:</p>
        <ul>
          <li>Store card information</li>
          <li>See user KYC</li>
          <li>Log sensitive data</li>
        </ul>

        <h2>14. Creative &amp; Marketing Vendor Rules</h2>
        <p>Agencies MUST:</p>
        <ul>
          <li>Follow brand guidelines</li>
          <li>Avoid misleading ads</li>
          <li>Follow ASCI rules</li>
          <li>Stick to approved messaging</li>
          <li>Get compliance approval</li>
        </ul>
        <p>Influencers MUST:</p>
        <ul>
          <li>Use #Sponsored</li>
          <li>Not mislead about item quality</li>
          <li>Not encourage illegal behaviour</li>
          <li>Not show fake auctions</li>
        </ul>

        <h2>15. Vendor Data Protection Rules</h2>
        <p>Vendors must:</p>
        <ul>
          <li>Encrypt data</li>
          <li>Limit access</li>
          <li>Store no unnecessary data</li>
          <li>Delete data after job completion</li>
          <li>Maintain logs</li>
          <li>Follow DPDP Act 2023</li>
        </ul>
        <p>Breaches → contract termination + legal action.</p>

        <h2>16. Vendor Penalties</h2>
        <table>
          <thead>
            <tr>
              <th>Violation</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fraud</td>
              <td>Immediate termination + FIR</td>
            </tr>
            <tr>
              <td>Data misuse</td>
              <td>Legal + financial penalty</td>
            </tr>
            <tr>
              <td>Delivery misconduct</td>
              <td>Suspension</td>
            </tr>
            <tr>
              <td>Damaging items</td>
              <td>Deduction + warning</td>
            </tr>
            <tr>
              <td>Storage violations</td>
              <td>Yard ban</td>
            </tr>
            <tr>
              <td>Contract violation</td>
              <td>Legal notice</td>
            </tr>
            <tr>
              <td>Fake documents</td>
              <td>Blacklist</td>
            </tr>
            <tr>
              <td>Misleading communication</td>
              <td>Contract cancellation</td>
            </tr>
            <tr>
              <td>Subcontracting without approval</td>
              <td>Penalty</td>
            </tr>
            <tr>
              <td>Unsafe practices</td>
              <td>Termination</td>
            </tr>
          </tbody>
        </table>

        <h2>17. Vendor Termination Rules</h2>
        <p>Vendor will be terminated if:</p>
        <ul>
          <li>Repeated complaints</li>
          <li>Unsafe operations</li>
          <li>Data breach</li>
          <li>Legal violations</li>
          <li>Failure to meet SLA</li>
          <li>Fraud or misconduct</li>
          <li>Non-cooperation</li>
        </ul>
        <p>Termination includes:</p>
        <ul>
          <li>Account deactivation</li>
          <li>Access revocation</li>
          <li>Legal notice</li>
          <li>Blacklisting</li>
        </ul>

        <h2>18. Responsibilities</h2>
        <h3>Vendors</h3>
        <ul>
          <li>Stay compliant</li>
          <li>Follow safety</li>
          <li>Protect data</li>
        </ul>
        <h3>Platform</h3>
        <ul>
          <li>Monitor performance</li>
          <li>Provide SOPs</li>
          <li>Review vendors regularly</li>
        </ul>
        <h3>Compliance</h3>
        <ul>
          <li>Approve vendors</li>
          <li>Enforce legal rules</li>
        </ul>
        <h3>Operations</h3>
        <ul>
          <li>Evaluate performance</li>
          <li>Train vendor staff</li>
        </ul>
        <h3>Legal Team</h3>
        <ul>
          <li>Draft contracts</li>
          <li>Handle disputes</li>
        </ul>

        <h2>19. Policy Updates</h2>
        <p>The platform may update this vendor compliance policy anytime.</p>
      </article>
    </div>
  );
};

export default VendorPartnerServiceProviderOnboardingCompliancePolicy;
