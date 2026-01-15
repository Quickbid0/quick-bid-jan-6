import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const SARFAESICompliancePolicy: React.FC = () => {
  usePageSEO({
    title: 'SARFAESI & Property Auction Compliance Policy | QuickMela',
    description: 'Compliance framework for SARFAESI and bank/property auctions conducted via QuickMela.',
    canonicalPath: '/legal/sarfaesi-property-compliance',
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
          <li className="text-gray-700 dark:text-gray-200">SARFAESI &amp; Property Auction Compliance Policy</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          SARFAESI &amp; Property Auction Compliance Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Legal and regulatory compliance for SARFAESI and secured asset auctions.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p><strong>QUICKMELA ႓ SARFAESI &amp; PROPERTY AUCTION COMPLIANCE POLICY</strong></p>
          <p>Last Updated: 20 November 2025<br />
          Effective Date: Immediately</p>
          <p>This SARFAESI &amp; Property Auction Compliance Policy (Policy) governs all bank-authorized, financial-institution-authorized, and legally mandated auctions conducted through QuickMela, owned and operated by Tekvoro Technologies (Company, we, our, us).</p>
          <p>QuickMela acts only as a digital technology facilitator for SARFAESI-related auctions.</p>
          <p>All legal rights, title transfer, compliance verification, and decisions rest solely with the authorizing bank or financial institution.</p>

          <h2>1. PURPOSE OF THIS POLICY</h2>
          <p>This Policy ensures that:</p>
          <ul>
            <li>All SARFAESI auctions comply with Indian law</li>
            <li>Buyers and Sellers understand their legal responsibilities</li>
            <li>QuickMela’s role is clearly defined</li>
            <li>Disputes follow statutory channels</li>
            <li>No violations of DRT/DRAT directives occur</li>
            <li>Banks remain the legally competent authority</li>
          </ul>

          <h2>2. GOVERNING LAWS &amp; REGULATIONS</h2>
          <p>SARFAESI auctions conducted on QuickMela follow:</p>
          <ul>
            <li>SARFAESI Act, 2002</li>
            <li>Security Interest (Enforcement) Rules, 2002</li>
            <li>Indian Contract Act, 1872</li>
            <li>Transfer of Property Act, 1882</li>
            <li>Indian Evidence Act, 1872</li>
            <li>DRT/DRAT Rules</li>
            <li>RBI Guidelines on Sale of NPA Assets</li>
            <li>IT Act, 2000</li>
          </ul>
          <p>In case of conflict, bank rules override platform rules.</p>

          <h2>3. QUICKMELA’S ROLE IN SARFAESI AUCTIONS</h2>
          <p>QuickMela provides only:</p>
          <ul>
            <li>Technology platform</li>
            <li>Auction interface</li>
            <li>Registration &amp; bidding portal</li>
            <li>EMD payment gateway (if permitted)</li>
            <li>Digital notifications</li>
            <li>Escalation support</li>
          </ul>
          <p>QuickMela does NOT:</p>
          <ul>
            <li>Verify physical property titles</li>
            <li>Verify bank-issued notices</li>
            <li>Guarantee property condition or possession</li>
            <li>Confirm legality of the auction</li>
            <li>Conduct valuation or appraisal</li>
            <li>Issue sale certificates</li>
            <li>Handle physical possession</li>
          </ul>
          <p>All legal responsibilities rest with the authorizing bank.</p>

          <h2>4. BANK’S RESPONSIBILITIES</h2>
          <p>The bank or authorized institution is responsible for:</p>
          <ul>
            <li>Issuing sale notice under Rule 8 or Rule 9</li>
            <li>Publishing auction details publicly</li>
            <li>Providing correct reserve price</li>
            <li>Setting EMD requirements</li>
            <li>Ensuring property is eligible for auction</li>
            <li>Handling inspection requests</li>
            <li>Providing access to property documents</li>
            <li>Confirming highest bid</li>
            <li>Approving or rejecting sale</li>
            <li>Issuing sale certificate</li>
            <li>Handing over possession (if applicable)</li>
            <li>Managing DRT/DRAT escalations</li>
          </ul>
          <p>Banks may also conduct due diligence to verify buyer integrity.</p>

          <h2>5. BUYER (BIDDER) RESPONSIBILITIES</h2>
          <p>Bidders must:</p>
          <ul>
            <li>Thoroughly read bank-issued Notice of Sale</li>
            <li>Conduct independent legal due diligence</li>
            <li>Verify:</li>
          </ul>
          <ul>
            <li>Encumbrances</li>
            <li>Litigation status</li>
            <li>Property tax dues</li>
            <li>Electricity/water dues</li>
            <li>Society/maintenance dues</li>
            <li>Physical possession status</li>
          </ul>
          <p>Inspect property physically (if allowed)</p>
          <p>Verify government records:</p>
          <ul>
            <li>EC (Encumbrance Certificate)</li>
            <li>Mutation records</li>
            <li>Court case filings</li>
            <li>NOCs (as applicable)</li>
          </ul>
          <p>QuickMela is not liable for any non-disclosure or misrepresentation in bank documents.</p>

          <h2>6. EMD (EARNEST MONEY DEPOSIT) RULES</h2>

          <h3>A. EMD Collection</h3>
          <p>Banks may collect EMD via:</p>
          <ul>
            <li>Direct bank transfer</li>
            <li>RTGS/NEFT</li>
            <li>DD (Demand Draft)</li>
            <li>QuickMela’s payment gateway (if authorized)</li>
          </ul>

          <h3>B. EMD Refund</h3>
          <p>Refund is issued only by the bank, not QuickMela.</p>
          <p>Refund timeframe:</p>
          <ul>
            <li>3႓30 working days, depending on bank policy.</li>
          </ul>

          <h3>C. EMD Forfeiture</h3>
          <p>EMD may be forfeited if:</p>
          <ul>
            <li>Highest bidder fails to pay the remaining amount</li>
            <li>Invalid documentation is provided</li>
            <li>Fraud or misrepresentation is detected</li>
            <li>Bidder withdraws after being declared winner</li>
          </ul>
          <p>Bank decision is final and binding.</p>

          <h2>7. AUCTION PROCEDURE</h2>
          <p>A standard SARFAESI auction includes:</p>
          <ul>
            <li>Publishing sale notice (30-day notice under Rule 8 / Rule 9)</li>
            <li>Accepting EMD</li>
            <li>Verifying bidder eligibility</li>
            <li>Conducting online auction</li>
            <li>Determining highest bidder</li>
            <li>Bank approval of highest bid</li>
            <li>Payment of balance amount</li>
            <li>Issuance of sale certificate</li>
            <li>Handover of possession (symbolic or physical)</li>
          </ul>
          <p>QuickMela only provides the digital platform for step 3 and 4.</p>

          <h2>8. BID CONFIRMATION &amp; FINAL APPROVAL</h2>
          <p>Even if you are the highest bidder, the bid is not final until:</p>
          <ul>
            <li>Bank verifies eligibility</li>
            <li>Bank approves the highest bid</li>
            <li>Regulatory conditions are satisfied</li>
          </ul>
          <p>The bank may reject the highest bid without explanation.</p>
          <p>QuickMela cannot:</p>
          <ul>
            <li>Question bank decisions</li>
            <li>Override bid rejection</li>
            <li>Influence acceptance</li>
          </ul>

          <h2>9. PROPERTY CONDITION, TITLE &amp; LIABILITY</h2>

          <h3>A. Property Sold “As-Is-Where-Is / As-Is-What-Is”</h3>
          <p>All SARFAESI auctions follow:</p>
          <ul>
            <li>As-Is-Where-Is</li>
            <li>As-Is-What-Is</li>
            <li>Whatever-There-Is</li>
          </ul>
          <p>Buyers cannot later claim:</p>
          <ul>
            <li>Construction deviations</li>
            <li>Structural issues</li>
            <li>Unpaid dues</li>
            <li>Physical damages</li>
            <li>Missing documents</li>
            <li>Litigation disputes</li>
          </ul>

          <h3>B. No Title Guarantee by QuickMela</h3>
          <p>QuickMela does NOT:</p>
          <ul>
            <li>Guarantee title</li>
            <li>Verify encumbrances</li>
            <li>Certify property condition</li>
          </ul>
          <p>Buyers must rely on independent legal and technical advice.</p>

          <h2>10. POST-AUCTION OBLIGATIONS</h2>
          <p>The winning bidder must:</p>
          <ul>
            <li>Pay the remaining amount within deadlines</li>
            <li>Submit required documents</li>
            <li>Visit bank for verification</li>
            <li>Complete sale certificate formalities</li>
            <li>Initiate mutation/registration with local authorities</li>
          </ul>
          <p>Delays result in penalties or cancellation.</p>

          <h2>11. DISPUTE RESOLUTION FOR BANK AUCTIONS</h2>

          <h3>A. Platform Cannot Resolve SARFAESI Disputes</h3>
          <p>All SARFAESI disputes must be resolved through:</p>
          <ul>
            <li>Authorized Bank</li>
            <li>DRT (Debt Recovery Tribunal)</li>
            <li>DRAT (Debt Recovery Appellate Tribunal)</li>
          </ul>
          <p>QuickMela cannot intervene in:</p>
          <ul>
            <li>Title disputes</li>
            <li>Property disputes</li>
            <li>EMD refund delays</li>
            <li>Bank approval issues</li>
            <li>Litigation involving property</li>
          </ul>

          <h3>B. Buyer’s Legal Remedies</h3>
          <p>Buyers may file appeals:</p>
          <ul>
            <li>Under Section 17 of SARFAESI Act (DRT)</li>
            <li>Further appeal under Section 18 (DRAT)</li>
          </ul>
          <p>QuickMela provides no legal representation.</p>

          <h2>12. FRAUD PREVENTION &amp; COMPLIANCE</h2>
          <p>QuickMela uses:</p>
          <ul>
            <li>IP and device tracking</li>
            <li>KYC/AML verification</li>
            <li>PAN/Aadhaar validation</li>
            <li>Bid pattern monitoring</li>
            <li>AI-based fraud detection</li>
          </ul>
          <p>Fraud by bidders (fake identities, multiple accounts, collusion) results in:</p>
          <ul>
            <li>Immediate suspension</li>
            <li>Reporting to bank</li>
            <li>Legal action under IPC 420, IT Act, SARFAESI provisions</li>
          </ul>

          <h2>13. LIMITATION OF LIABILITY (VERY IMPORTANT)</h2>
          <p>QuickMela is not responsible for:</p>
          <ul>
            <li>Accuracy of bank notices</li>
            <li>Property inspection issues</li>
            <li>Legal disputes related to ownership</li>
            <li>Encumbrances or claims on property</li>
            <li>Delay of EMD refunds</li>
            <li>Bank actions regarding approval/rejection</li>
            <li>Title transfer delays</li>
            <li>Physical possession disputes</li>
            <li>Auction cancellation by bank</li>
            <li>Financial loss due to litigation</li>
          </ul>
          <p>All risks are borne by the buyer.</p>

          <h2>14. AUCTION CANCELLATION</h2>
          <p>Auction may be cancelled by:</p>
          <ul>
            <li>Bank</li>
            <li>Court order</li>
            <li>Authority instruction</li>
            <li>Technical issue</li>
            <li>Legal conflict</li>
            <li>Incorrect reserve price</li>
            <li>Seller/financial institution request</li>
          </ul>
          <p>QuickMela has no control over cancellation decisions.</p>

          <h2>15. POLICY UPDATES</h2>
          <p>QuickMela may update this Policy at any time.</p>
          <p>Continued platform use = acceptance of updated Policy.</p>

          <h2>16. CONTACT INFORMATION</h2>
          <p>For SARFAESI auction queries:</p>
          <p>QuickMela ႓ Tekvoro Technologies<br />
          📧 Email: tekvoro@gmail.com<br />
          📞 Phone: +91 9121331813<br />
          📍 Address: 5-24-190, NTR Nagar, Gajularamaram, Hyderabad, Telangana — 500055</p>
        </div>
      </article>
    </div>
  );
};

export default SARFAESICompliancePolicy;
