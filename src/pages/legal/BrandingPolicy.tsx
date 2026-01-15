import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const BrandingPolicy: React.FC = () => {
  usePageSEO({
    title: 'Branding, Logo & Brand Usage Policy | QuickMela',
    description: 'Brand ownership, logo usage, color system, typography, and media usage rules for the QuickMela brand.',
    canonicalPath: '/legal/branding-policy',
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
          <li className="text-gray-700 dark:text-gray-200">Branding, Logo &amp; Brand Usage Policy</li>
        </ol>
      </nav>
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Branding, Logo &amp; Brand Usage Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Rules governing QuickMela brand ownership, logo usage, colors, typography, and media usage.
        </p>
      </header>
      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <p>✅ 2. FULL BRANDING &amp; BRAND USAGE POLICY</p>
        <p><strong>QUICKMELA – BRANDING, LOGO, AND MEDIA USAGE POLICY</strong></p>
        <p>Last Updated: 20 November 2025</p>

        <h2>1. Purpose</h2>
        <p>This policy protects the QuickMela brand, identity, logos, color system, typography, and marketing assets.</p>

        <h2>2. Brand Ownership</h2>
        <p>QuickMela and Tekvoro Technologies own:</p>
        <ul>
          <li>QuickMela brand name</li>
          <li>Logo &amp; icon pack</li>
          <li>Brand colors &amp; typography</li>
          <li>UI/UX design system</li>
          <li>All marketing assets</li>
          <li>Product videos, banners, creatives</li>
          <li>Watermark designs</li>
          <li>Slogans &amp; taglines</li>
        </ul>

        <h2>3. Brand Usage Rules</h2>
        <p>Vendors, partners, banks, agencies may NOT:</p>
        <ul>
          <li>Modify or distort QuickMela logo</li>
          <li>Use QuickMela logo in advertisements without approval</li>
          <li>Use QuickMela identity on unofficial websites</li>
          <li>Combine QuickMela brand with other company logos</li>
          <li>Sell products using QuickMela branding</li>
          <li>Create apps or tools using QuickMela brand</li>
        </ul>

        <h2>4. Logo Usage</h2>
        <ul>
          <li>Must maintain proportions</li>
          <li>Must use only approved color variations</li>
          <li>No filters or shadows unless brand-approved</li>
          <li>Must use safe spacing around the logo</li>
        </ul>

        <h2>5. Color System</h2>
        <p>Primary: #FF6E1E<br />
        Secondary: #1A1A1A<br />
        Light Background: #F5F5F5<br />
        Accent: #EDEDED</p>
        <p>These colors cannot be altered by partners.</p>

        <h2>6. Typography</h2>
        <p>Approved fonts:</p>
        <ul>
          <li>Poppins (Headings)</li>
          <li>Inter (Body text)</li>
        </ul>
        <p>No alternative fonts allowed unless permitted.</p>

        <h2>7. Media Usage Rules</h2>
        <p>Images, photos, videos created by QuickMela:</p>
        <ul>
          <li>✔ May be used for promotion WITH permission</li>
          <li>❌ Cannot be copied by competitors</li>
          <li>❌ Cannot be edited to remove watermarks</li>
          <li>❌ Cannot be used for other platforms</li>
        </ul>

        <h2>8. Brand Watermark Policy</h2>
        <p>All QuickMela photos/videos include a watermark:</p>
        <ul>
          <li>Must remain visible</li>
          <li>Cannot be cropped out</li>
          <li>Cannot be replaced with other logos</li>
        </ul>

        <h2>9. Partners &amp; Banks May Use Branding Only If:</h2>
        <ul>
          <li>They have a written MoU</li>
          <li>They follow the Brand Guidelines document</li>
          <li>They do not manipulate or misuse media</li>
        </ul>

        <h2>10. Legal Enforcement</h2>
        <p>Any violation may lead to:</p>
        <ul>
          <li>Legal notice</li>
          <li>Asset takedown</li>
          <li>Platform ban</li>
          <li>Compensation claims</li>
        </ul>

        <p>✔ Branding Policy Completed</p>
      </article>
    </div>
  );
};

export default BrandingPolicy;
