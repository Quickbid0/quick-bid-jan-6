import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const VendorServiceLevelAgreement: React.FC = () => {
  usePageSEO({
    title: 'Vendor Service Level Agreement (SLA) | QuickMela',
    description: 'Service Level Agreement for recovery agencies, repossession vendors, inspection partners, and asset handlers working with QuickMela.',
    canonicalPath: '/legal/vendor-service-level-agreement',
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
          <li className="text-gray-700 dark:text-gray-200">Vendor Service Level Agreement (SLA)</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Vendor Service Level Agreement (SLA)
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          SLA for recovery agencies, repossession vendors, inspection partners, and asset handlers working with QuickMela.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p>✅ 2. VENDOR SERVICE LEVEL AGREEMENT (SLA)</p>
          <p>(For Recovery Agencies, Repossession Vendors, Inspection Partners, Asset Handlers)</p>

          <h2>QUICKMELA ႓ VENDOR SERVICE LEVEL AGREEMENT (SLA)</h2>
          <p>Effective Date: ____________________<br />
          SLA ID: QM-SLA-____________________</p>
          <p>This Vendor Service Level Agreement (Agreement) is entered between:<br />
          1. Tekvoro Technologies (QuickMela)<br />
          AND<br />
          2. ________________________ (Vendor / Agency / Partner)</p>

          <h2>2. PURPOSE OF THIS SLA</h2>
          <p>This SLA defines:</p>
          <ul>
            <li>Performance standards</li>
            <li>Responsibilities</li>
            <li>Expected turnaround times (TATs)</li>
            <li>Compliance obligations</li>
            <li>Penalties for delays or misconduct</li>
          </ul>
          <p>for vendors working with bank-seized vehicles, asset inspections, repossession support, or delivery assistance.</p>

          <h2>3. SERVICES COVERED UNDER THIS SLA</h2>
          <p>Vendor agrees to provide one or more of the following:</p>
          <ul>
            <li>Vehicle repossession</li>
            <li>Asset relocation</li>
            <li>Inspection &amp; condition reporting</li>
            <li>Photographs &amp; video documentation</li>
            <li>Yard parking &amp; storage</li>
            <li>Buyer coordination for inspection</li>
            <li>Vehicle delivery after sale</li>
            <li>Assistance in DO/NOC handover</li>
          </ul>
          <p>QuickMela may assign tasks through the vendor dashboard.</p>

          <h2>4. VENDOR PERFORMANCE REQUIREMENTS</h2>
          <h3>4.1 Inspection TAT</h3>
          <ul>
            <li>Standard inspection report: 24–48 hours</li>
            <li>Photos upload: Same day</li>
            <li>Videos upload: Same day</li>
          </ul>

          <h3>4.2 Vehicle Release TAT</h3>
          <p>After bank approval + buyer payment: Within 48 hours</p>

          <h3>4.3 Buyer Coordination TAT</h3>
          <ul>
            <li>Respond to buyer queries within 24 hours</li>
            <li>Allow inspection at pre-approved slots</li>
          </ul>

          <h3>4.4 Document Handling</h3>
          <p>Vendor must:</p>
          <ul>
            <li>Ensure authenticity</li>
            <li>Not manipulate odometer readings</li>
            <li>Not hide structural damages</li>
            <li>Submit seizure memos &amp; repossession records accurately</li>
          </ul>

          <h2>5. FEES &amp; PAYMENTS</h2>
          <p>QuickMela will pay the Vendor as per agreed rates:</p>
          <p>Service<br />
          Fee<br />
          Notes</p>
          <p>Inspection<br />
          ₹_____ <br />
          Per vehicle</p>
          <p>Storage/Yard<br />
          ₹_____ <br />
          Per day/month</p>
          <p>Delivery<br />
          ₹_____ <br />
          Route-based</p>
          <p>Repossession<br />
          ₹_____ <br />
          Case-based</p>
          <p>Misc Charges<br />
          ₹_____ <br />
          Optional</p>
          <p>Payments released within 7–15 days after invoice submission.<br />
          Vendor must raise invoices monthly or per assignment.</p>

          <h2>6. NON-COMPLIANCE &amp; PENALTIES</h2>
          <p>Vendor may face penalties if:</p>
          <ul>
            <li>Reports contain false information</li>
            <li>Photos are manipulated</li>
            <li>Delayed handover causing buyer dispute</li>
            <li>Harassment/threats to buyer or seller</li>
            <li>Mishandling of vehicles</li>
            <li>Fake inspection reports</li>
            <li>Theft of parts or accessories</li>
            <li>Bribes or corruption attempts</li>
          </ul>
          <p>Penalties include:</p>
          <ul>
            <li>Payment deduction</li>
            <li>SLA strike count</li>
            <li>Vendor suspension</li>
            <li>Blacklisting</li>
            <li>Legal action</li>
          </ul>

          <h2>7. FRAUD &amp; MISCONDUCT PREVENTION</h2>
          <p>Vendor must NOT:</p>
          <ul>
            <li>Collude with bidders</li>
            <li>Share private auction data</li>
            <li>Share buyer information externally</li>
            <li>Engage in under-the-table dealings</li>
            <li>Charge buyers any unauthorized fees</li>
          </ul>
          <p>Strict zero-tolerance policy applies.</p>

          <h2>8. LIABILITY</h2>
          <p>Vendor is liable for:</p>
          <ul>
            <li>Asset damage while in their custody</li>
            <li>Document tampering</li>
            <li>Misrepresentation</li>
            <li>Theft or loss of vehicle parts</li>
            <li>Injury or misconduct during repossession</li>
          </ul>
          <p>QuickMela is NOT liable for:</p>
          <ul>
            <li>Vendor employee misconduct</li>
            <li>Accidents caused by Vendor</li>
            <li>Wrongful repossession</li>
            <li>Criminal actions by Vendor</li>
          </ul>

          <h2>9. CONFIDENTIALITY</h2>
          <p>Vendor must protect:</p>
          <ul>
            <li>Buyer identity</li>
            <li>Bank documents</li>
            <li>Internal platform data</li>
            <li>Inspection reports</li>
          </ul>
          <p>Public sharing is strictly prohibited.</p>

          <h2>10. TERMINATION</h2>
          <p>QuickMela may terminate Vendor immediately for:</p>
          <ul>
            <li>Fraud</li>
            <li>Theft</li>
            <li>Misconduct</li>
            <li>Repeat SLA violations</li>
            <li>Non-performance</li>
            <li>Data theft</li>
          </ul>
          <p>Either party may terminate with 30 days’ notice.</p>

          <h2>11. GOVERNING LAW</h2>
          <p>This SLA is governed by the laws of India and courts of Hyderabad, Telangana.</p>

          <h2>12. SIGNATURES</h2>
          <p>For QuickMela (Tekvoro Technologies)<br />
          Name: ______________________<br />
          Designation: _________________<br />
          Signature: __________________<br />
          Date: _______________________</p>
          <p>For Vendor / Agency<br />
          Name: ______________________<br />
          Designation: _________________<br />
          Signature: __________________<br />
          Date: _______________________</p>
        </div>
      </article>
    </div>
  );
};

export default VendorServiceLevelAgreement;
