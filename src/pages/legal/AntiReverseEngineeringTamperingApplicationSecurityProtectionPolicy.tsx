import React from 'react';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../hooks/usePageSEO';

const AntiReverseEngineeringTamperingApplicationSecurityProtectionPolicy: React.FC = () => {
  usePageSEO({
    title: 'Anti-Reverse-Engineering, Anti-Tampering & Application Security Protection Policy | QuickMela',
    description:
      'Protections against reverse engineering, code tampering, automation, spoofing, cloning, and other technical abuse of the QuickMela platform.',
    canonicalPath: '/legal/anti-reverse-engineering-tampering-application-security-protection-policy',
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
            Anti-Reverse-Engineering, Anti-Tampering &amp; Application Security Protection Policy
          </li>
        </ol>
      </nav>

      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Anti-Reverse-Engineering, Anti-Tampering &amp; Application Security Protection Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Technical and legal protections against reverse engineering, tampering, automation, spoofing, and cloning of
          the QuickMela/Tekvoro platform.
        </p>
      </header>

      <article className="prose lg:prose-xl max-w-none dark:prose-invert bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8">
        <h2>1. Purpose</h2>
        <p>This policy defines protections against:</p>
        <ul>
          <li>Reverse engineering</li>
          <li>Code tampering</li>
          <li>Unauthorized app modification</li>
          <li>Bot injection</li>
          <li>Memory manipulation</li>
          <li>API spoofing</li>
          <li>Cheating tools</li>
          <li>Script automation</li>
          <li>Unofficial app clones</li>
        </ul>
        <p>It ensures that:</p>
        <ul>
          <li>The QuickMela platform remains secure</li>
          <li>Auction fairness is maintained</li>
          <li>Sensitive code logic is protected</li>
          <li>No user gains unfair technical advantage</li>
        </ul>

        <h2>2. Scope</h2>
        <p>Applies to:</p>
        <ul>
          <li>Mobile apps (Android/iOS)</li>
          <li>Web apps</li>
          <li>Admin dashboards</li>
          <li>APIs</li>
          <li>SDKs</li>
          <li>Internal tools</li>
          <li>CI/CD pipelines</li>
          <li>All client-side and server-side code</li>
        </ul>
        <p>Covers:</p>
        <ul>
          <li>App binaries</li>
          <li>Network calls</li>
          <li>JavaScript bundles</li>
          <li>React/React Native builds</li>
          <li>API tokens</li>
          <li>Local storage</li>
          <li>Device security</li>
        </ul>

        <h2>3. Reverse Engineering Protection</h2>
        <p>The platform includes:</p>
        <ul>
          <li>Code obfuscation</li>
          <li>String encryption</li>
          <li>Class/method renaming</li>
          <li>Resource obfuscation</li>
          <li>Dynamic code loading protection</li>
          <li>Anti-decompilation layers</li>
          <li>Hash-based integrity checks</li>
        </ul>
        <p>These prevent:</p>
        <ul>
          <li>.apk/.ipa decompiling</li>
          <li>Reading source logic</li>
          <li>Extracting business logic</li>
          <li>Repackaging the app</li>
          <li>Modifying data flow</li>
        </ul>

        <h2>4. Anti-Tampering System</h2>
        <p>App continuously checks:</p>
        <ul>
          <li>Signature validity</li>
          <li>Package integrity</li>
          <li>Runtime memory tampering</li>
          <li>Injection attempts</li>
          <li>Modified resources</li>
          <li>Repackaged APK indicators</li>
          <li>Jailbreak/root status</li>
          <li>Emulator detection</li>
        </ul>
        <p>If tampering is detected:</p>
        <ul>
          <li>App immediately blocks usage</li>
          <li>User account is locked</li>
          <li>Device fingerprint saved</li>
          <li>Fraud team alerted</li>
        </ul>

        <h2>5. Device Security Requirements</h2>
        <p>App does NOT work on:</p>
        <ul>
          <li>Rooted Android devices</li>
          <li>Jailbroken iPhones</li>
          <li>Emulators (unless whitelisted)</li>
          <li>Virtual machines</li>
          <li>Custom ROMs</li>
          <li>Debuggable builds</li>
        </ul>
        <p>If bypass attempts detected:</p>
        <ul>
          <li>Automatic suspension</li>
          <li>Device/IP ban</li>
        </ul>

        <h2>6. API Anti-Spoofing Rules</h2>
        <p>All API calls require:</p>
        <ul>
          <li>Signed tokens</li>
          <li>Nonces</li>
          <li>Hash-based signatures</li>
          <li>Device fingerprints</li>
          <li>Timestamp validation</li>
          <li>Replay-attack prevention</li>
          <li>Rate-limit enforcement</li>
        </ul>
        <p>Blocked immediately:</p>
        <ul>
          <li>Scripted requests</li>
          <li>Postman/API spoofing</li>
          <li>Curl-based automation</li>
          <li>BurpSuite interceptions</li>
          <li>Proxy tampering</li>
        </ul>

        <h2>7. Browser Protection (Web App)</h2>
        <p>Web app includes:</p>
        <ul>
          <li>Obfuscated JS</li>
          <li>Anti-debugging tools</li>
          <li>Anti-devtools detection</li>
          <li>Script injection prevention</li>
          <li>CSRF protection</li>
          <li>XSS filters</li>
          <li>Content-Security-Policy (CSP)</li>
          <li>Anti-scraping lockout</li>
        </ul>
        <p>If devtools &rarr; opened:</p>
        <ul>
          <li>Sensitive workflows disabled</li>
          <li>Warnings logged</li>
          <li>Fraud check triggered</li>
        </ul>

        <h2>8. Anti-Automation / Anti-Bot System</h2>
        <p>Detected &amp; blocked:</p>
        <ul>
          <li>Auto-bidding bots</li>
          <li>Auto-refresh scripts</li>
          <li>Macro tools</li>
          <li>Selenium/Playwright automation</li>
          <li>High-frequency requests</li>
          <li>Headless browsers</li>
          <li>Modified user agents</li>
        </ul>
        <p>AI monitors:</p>
        <ul>
          <li>Bid timing precision</li>
          <li>Repetitive pattern behaviour</li>
          <li>Device anomalies</li>
          <li>Click simulation</li>
        </ul>
        <p>Violation &rarr; instant ban.</p>

        <h2>9. Local Storage Protection</h2>
        <p>Sensitive data is:</p>
        <ul>
          <li>Encrypted</li>
          <li>Hashed</li>
          <li>Stored in secure containers</li>
        </ul>
        <p>Forbidden to store:</p>
        <ul>
          <li>Tokens in plain text</li>
          <li>Session cookies unencrypted</li>
          <li>Keys in local storage</li>
        </ul>

        <h2>10. Anti-Cloning &amp; Fake App Prevention</h2>
        <p>Platform prohibits:</p>
        <ul>
          <li>Modified APKs</li>
          <li>Cloned apps</li>
          <li>Parallel space clones</li>
          <li>Multi-instance cheating</li>
          <li>Fake apps with branding</li>
        </ul>
        <p>Detection triggers:</p>
        <ul>
          <li>Device ban</li>
          <li>Account closure</li>
          <li>Legal action</li>
        </ul>

        <h2>11. Network &amp; TLS Security</h2>
        <p>App enforces:</p>
        <ul>
          <li>SSL pinning</li>
          <li>TLS 1.3</li>
          <li>Certificate validation</li>
          <li>MITM attack prevention</li>
        </ul>
        <p>MITM tools blocked:</p>
        <ul>
          <li>Charles Proxy</li>
          <li>BurpSuite</li>
          <li>Fiddler</li>
          <li>mitmproxy</li>
        </ul>
        <p>If detected:</p>
        <ul>
          <li>Connection denied</li>
          <li>Fraud alert triggered</li>
        </ul>

        <h2>12. Legal Enforcement</h2>
        <p>Any attempt at:</p>
        <ul>
          <li>Reverse engineering</li>
          <li>Decrypting source code</li>
          <li>Cheating app logic</li>
          <li>Modifying auctions</li>
          <li>Exploiting vulnerabilities</li>
          <li>Scraping sensitive APIs</li>
          <li>Bypassing security checks</li>
        </ul>
        <p>
          &hellip;is a punishable offense under:
        </p>
        <ul>
          <li>IT Act (2000)</li>
          <li>IPC Fraud Sections</li>
          <li>DPDP Act</li>
          <li>Cybercrime regulations</li>
        </ul>
        <p>Platform may file:</p>
        <ul>
          <li>FIR</li>
          <li>Civil liabilities</li>
          <li>Compensation claims</li>
          <li>Permanent device bans</li>
        </ul>

        <h2>13. Penalties for Violations</h2>
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Penalty</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Decompiling APK</td>
              <td>Permanent ban</td>
            </tr>
            <tr>
              <td>Modifying files</td>
              <td>Device/IP block</td>
            </tr>
            <tr>
              <td>App cloning</td>
              <td>FIR</td>
            </tr>
            <tr>
              <td>Using automation</td>
              <td>Permanent ban</td>
            </tr>
            <tr>
              <td>Changing API calls</td>
              <td>Device blacklisting</td>
            </tr>
            <tr>
              <td>Bypassing root checks</td>
              <td>Account + device ban</td>
            </tr>
            <tr>
              <td>Memory injection</td>
              <td>Legal action</td>
            </tr>
            <tr>
              <td>Using cracked tools</td>
              <td>Cybercrime case</td>
            </tr>
          </tbody>
        </table>

        <h2>14. Responsibilities</h2>
        <h3>Users</h3>
        <ul>
          <li>Must use official app only</li>
          <li>Must not modify code</li>
          <li>Must avoid using automation</li>
        </ul>
        <h3>Developers</h3>
        <ul>
          <li>Maintain anti-tampering code</li>
          <li>Update obfuscation regularly</li>
          <li>Close vulnerabilities promptly</li>
        </ul>
        <h3>Security Team</h3>
        <ul>
          <li>Monitor suspicious clients</li>
          <li>Investigate tampering attempts</li>
          <li>Enforce bans</li>
          <li>Update signatures</li>
        </ul>
        <h3>Compliance Team</h3>
        <ul>
          <li>Ensure policies meet legal standards</li>
        </ul>

        <h2>15. Allowed Modification</h2>
        <p>None.</p>
        <p>At no point may users:</p>
        <ul>
          <li>Edit code</li>
          <li>Inspect binaries</li>
          <li>Modify network traffic</li>
          <li>Inject scripts</li>
          <li>Bypass any security process</li>
        </ul>

        <h2>16. Policy Updates</h2>
        <p>Company may update reverse-engineering and tamper-protection rules anytime.</p>
      </article>
    </div>
  );
};

export default AntiReverseEngineeringTamperingApplicationSecurityProtectionPolicy;
