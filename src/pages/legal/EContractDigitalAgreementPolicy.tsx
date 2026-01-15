import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const EContractDigitalAgreementPolicy: React.FC = () => {
  usePageSEO({
    title: 'E-Contract & Digital Agreement Policy | QuickMela',
    description: 'Policy governing e-contracts and digital agreements on QuickMela.',
    canonicalPath: '/legal/e-contract-digital-agreement',
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
          <li className="text-gray-700 dark:text-gray-200">E-Contract &amp; Digital Agreement Policy</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          E-Contract &amp; Digital Agreement Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Legal framework for digital contracts and agreements executed on QuickMela.
        </p>
      </header>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert">
          <p><strong>QUICKMELA ႓ E-CONTRACT &amp; DIGITAL AGREEMENT POLICY</strong></p>
          <p>Last Updated: 20 November 2025<br />
          Effective Date: Immediately</p>
          <p>This E-Contract &amp; Digital Agreement Policy (Policy) explains how all contracts, consents, and legally binding actions occur digitally on QuickMela, operated by Tekvoro Technologies (Company, we, our, us).</p>
          <p>By accessing or using QuickMela, you agree to be legally bound by this Policy in addition to the Terms &amp; Conditions, Auction Rules, Buyer Policy, Seller Policy, and Anti-Fraud Policy.</p>

          <h2>1. PURPOSE OF THIS POLICY</h2>
          <p>This Policy is designed to:</p>
          <ul>
            <li>Establish the legal validity of digital and electronic agreements</li>
            <li>Explain how online acceptance forms a binding contract</li>
            <li>Define user responsibilities when engaging digitally</li>
            <li>Ensure compliance with Indian law</li>
            <li>Clarify obligations for Buyers, Sellers, Bidders, and Investors</li>
            <li>Standardize legally binding actions across the entire platform</li>
          </ul>

          <h2>2. LEGAL VALIDITY OF E-CONTRACTS (INDIAN LAW)</h2>
          <p>QuickMela’s digital agreements are compliant with:</p>
          <ul>
            <li>Information Technology Act, 2000 (IT Act)</li>
            <li>Indian Contract Act, 1872</li>
            <li>Evidence Act, 1872</li>
            <li>IT (Reasonable Security Practices &amp; Procedures) Rules, 2011</li>
          </ul>
          <p>Under these laws:</p>
          <ul>
            <li>✔ Electronic contracts are legally enforceable</li>
            <li>✔ Digital signatures and electronic consent are binding</li>
            <li>✔ Digital logs, IP addresses, and timestamps are admissible evidence</li>
          </ul>
          <p>By using QuickMela, you acknowledge that electronic consent is a legally binding agreement.</p>

          <h2>3. HOW DIGITAL AGREEMENT / E-CONTRACT IS FORMED</h2>
          <p>You enter into a legally binding contract when you perform one or more of the following actions on QuickMela:</p>

          <h3>A. Clicking Actions</h3>
          <ul>
            <li>“Register”</li>
            <li>“Login”</li>
            <li>“Agree &amp; Continue”</li>
            <li>“Place Bid”</li>
            <li>“Buy Now”</li>
            <li>“Confirm Payment”</li>
            <li>“I Agree to Terms”</li>
            <li>“List Item for Auction”</li>
            <li>“Submit KYC”</li>
            <li>“Start Auction”</li>
          </ul>
          <p>Each click is treated as an electronic signature.</p>

          <h3>B. OTP-Based Confirmation</h3>
          <p>Entering OTP received via:</p>
          <ul>
            <li>SMS</li>
            <li>Email</li>
            <li>WhatsApp (if enabled)</li>
          </ul>
          <p>is treated as digital authentication.</p>

          <h3>C. Digital KYC Verification</h3>
          <p>Submitting KYC documents (Aadhaar, PAN, Passport, etc.) constitutes:</p>
          <ul>
            <li>Legal identity verification</li>
            <li>Agreement to platform terms</li>
            <li>Confirmation of authenticity</li>
          </ul>

          <h3>D. Payment Confirmation</h3>
          <p>Completing payment indicates:</p>
          <ul>
            <li>Acceptance of invoice</li>
            <li>Agreement to purchase</li>
            <li>Consent to all auction and transaction terms</li>
          </ul>

          <h3>E. Placing a Bid</h3>
          <p>A bid is a legal offer.</p>
          <p>The winning bid becomes a legally binding contract, requiring:</p>
          <ul>
            <li>Full payment</li>
            <li>Acceptance of platform rules</li>
            <li>Compliance with deadlines</li>
          </ul>
          <p>This contract remains binding even without a physical signature.</p>

          <h2>4. BINDING NATURE OF DIGITAL ACTIONS</h2>
          <p>Every digital action taken on QuickMela is:</p>
          <ul>
            <li>Legally valid</li>
            <li>Irrevocable once completed</li>
            <li>Enforceable under contract law</li>
            <li>Protected under digital evidence rules</li>
          </ul>
          <p>This includes:</p>
          <ul>
            <li>Bids</li>
            <li>Payments</li>
            <li>Listing submissions</li>
            <li>Deposit confirmations</li>
            <li>KYC statements</li>
            <li>Video/audio verifications</li>
            <li>Acceptance of policies</li>
          </ul>

          <h2>5. RECORDS &amp; DIGITAL LOGS MAINTAINED</h2>
          <p>QuickMela securely records:</p>
          <ul>
            <li>IP address</li>
            <li>Geolocation (if enabled)</li>
            <li>Device ID &amp; fingerprint</li>
            <li>Timestamp of every action</li>
            <li>Browser/OS signature</li>
            <li>KYC metadata</li>
            <li>Payment logs</li>
            <li>Digital acceptance logs</li>
            <li>Auction history &amp; bid timestamps</li>
          </ul>
          <p>These may be used as:</p>
          <ul>
            <li>Legal evidence</li>
            <li>Fraud detection</li>
            <li>Compliance audit logs</li>
          </ul>

          <h2>6. SELLER E-AGREEMENT</h2>
          <p>When listing an item, the Seller digitally agrees that:</p>
          <ul>
            <li>They own the item or have the right to sell it</li>
            <li>All details and photos are accurate</li>
            <li>They will deliver/pickup the item after sale</li>
            <li>They accept QuickMela fees and commissions</li>
            <li>They will comply with all refund &amp; dispute processes</li>
            <li>They will cooperate with verification teams</li>
          </ul>
          <p>Any misrepresentation constitutes a breach of digital contract.</p>

          <h2>7. BUYER / BIDDER E-AGREEMENT</h2>
          <p>When placing a bid, the Buyer agrees:</p>
          <ul>
            <li>The bid is final</li>
            <li>The bid cannot be withdrawn</li>
            <li>If they win, they must complete payment</li>
            <li>They will comply with delivery rules</li>
            <li>They will not misuse disputes or refunds</li>
            <li>They will adhere to all compliance requirements</li>
          </ul>
          <p>Failure to complete payment is considered breach of contract and may result in:</p>
          <ul>
            <li>Deposit forfeiture</li>
            <li>Legal action</li>
            <li>Permanent ban</li>
          </ul>

          <h2>8. INVESTOR E-AGREEMENT (NON-EQUITY)</h2>
          <p>Investors digitally agree that:</p>
          <ul>
            <li>Contributions are not shares or equity</li>
            <li>Returns (if any) are governed by separate agreements</li>
            <li>Platform does not guarantee profits unless contractually defined</li>
            <li>Digital acceptance of investment terms is binding</li>
          </ul>
          <p>Digital contracts for investment may require:</p>
          <ul>
            <li>Video verification</li>
            <li>OTP consent</li>
            <li>Signed digital copy</li>
          </ul>

          <h2>9. PLATFORM INITIATED DIGITAL AGREEMENTS</h2>
          <p>QuickMela may require users to:</p>
          <ul>
            <li>Reconfirm terms</li>
            <li>Provide digital signatures</li>
            <li>Accept updated versions of policies</li>
            <li>Complete e-consent for high-value auctions</li>
          </ul>
          <p>Use of the platform constitutes implied acceptance of all updates.</p>

          <h2>10. FRAUD PREVENTION IN E-CONTRACTS</h2>
          <p>QuickMela uses:</p>
          <ul>
            <li>AI-based fraud detection</li>
            <li>Multi-step verification</li>
            <li>Device &amp; IP tracking</li>
            <li>OTP authentication</li>
            <li>Blockchain-grade timestamping (if implemented)</li>
          </ul>
          <p>Fraudulent digital signatures or fake acceptances may lead to:</p>
          <ul>
            <li>Account suspension</li>
            <li>Legal action</li>
            <li>Police complaints</li>
            <li>Permanent ban</li>
          </ul>

          <h2>11. TERMINATION OF DIGITAL AGREEMENTS</h2>
          <p>QuickMela may cancel or void a digital contract if:</p>
          <ul>
            <li>Fraud is detected</li>
            <li>Terms were violated</li>
            <li>Illegal activity occurred</li>
            <li>Buyer or Seller misrepresented facts</li>
            <li>Technical errors invalidated the action</li>
            <li>Government authority requests cancellation</li>
            <li>SARFAESI/banking rules override platform agreements</li>
          </ul>
          <p>Users remain liable for any damages or losses caused.</p>

          <h2>12. E-CONTRACTS IN SARFAESI &amp; BANK AUCTIONS</h2>
          <p>For SARFAESI or secured-asset auctions:</p>
          <ul>
            <li>Bank’s legal terms override QuickMela terms</li>
            <li>Bank-issued sale notice forms part of the digital agreement</li>
            <li>EMD submissions are binding</li>
            <li>Bid acceptance forms legal obligation</li>
          </ul>
          <p>Disputes must be handled through:</p>
          <ul>
            <li>Bank</li>
            <li>DRT</li>
            <li>DRAT</li>
          </ul>
          <p>QuickMela facilitates technology, not legal title transfer.</p>

          <h2>13. GOVERNING LAW &amp; JURISDICTION</h2>
          <p>This Policy is governed by:</p>
          <ul>
            <li>Indian Contract Act, 1872</li>
            <li>Information Technology Act, 2000</li>
            <li>Indian Evidence Act, 1872</li>
            <li>Consumer Protection Act</li>
            <li>Applicable State and Central laws</li>
          </ul>
          <p>Jurisdiction: Hyderabad, Telangana, India</p>

          <h2>14. POLICY CHANGES</h2>
          <p>QuickMela may update this Policy at any time.</p>
          <p>Continued use of the platform = acceptance of updated Policy.</p>

          <h2>15. CONTACT INFORMATION</h2>
          <p>For legal, contract, or compliance queries:</p>
          <p>QuickMela ႓ Tekvoro Technologies<br />
          📧 Email: tekvoro@gmail.com<br />
          📞 Phone: +91 9121331813<br />
          📍 Address: 5-24-190, NTR Nagar, Gajularamaram, Hyderabad, Telangana — 500055</p>
        </div>
      </article>
    </div>
  );
};

export default EContractDigitalAgreementPolicy;
