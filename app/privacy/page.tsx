import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy — 45 Mix Trackr',
  description:
    'Privacy Policy for 45 Mix Trackr. Learn how we collect, use, and protect your data, including Google AdSense cookies, GDPR, and CCPA rights.',
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="max-w-3xl text-white">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-[#B3B3B3] text-sm mb-10">Last updated: April 6, 2025</p>

        <section className="space-y-8 text-[#B3B3B3] leading-relaxed">

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">1. Introduction</h2>
            <p>
              45 Mix Trackr (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates{' '}
              <strong className="text-white">www.45mixtrackr.com</strong>. This Privacy Policy explains
              what information we collect, how we use it, and your rights regarding your data.
              By using this site you agree to the practices described here. If you do not agree,
              please stop using the service.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">2. Information We Collect</h2>
            <p className="mb-2">We collect the following categories of information:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">Audio / video files you upload</strong> — processed
                solely to identify songs and generate your tracklist. Files are stored temporarily
                and deleted automatically once processing is complete (typically within minutes).
              </li>
              <li>
                <strong className="text-white">Usage data</strong> — pages visited, features used,
                time on site, referrer URL, and similar analytics.
              </li>
              <li>
                <strong className="text-white">Device &amp; browser information</strong> — browser
                type, operating system, screen resolution, and language preference.
              </li>
              <li>
                <strong className="text-white">IP address</strong> — used for geographic analytics,
                fraud prevention, and regional legal compliance.
              </li>
              <li>
                <strong className="text-white">Cookie data</strong> — including your cookie consent
                preference stored locally in your browser.
              </li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-white">not</strong> collect your name, email address, or
              any account credentials unless you contact us directly.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To process your uploaded audio and return song identification results</li>
              <li>To generate SRT subtitle files and album cover ZIP archives</li>
              <li>To analyze site usage and improve performance and usability</li>
              <li>To display advertisements via Google AdSense</li>
              <li>To detect and prevent abuse, fraud, or service disruption</li>
              <li>To comply with applicable legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">4. Data Retention</h2>
            <p>
              Uploaded audio and video files are retained only as long as needed to complete
              processing — typically a few minutes — and are then permanently deleted from our
              servers. We do not store your media files long-term. Anonymized usage analytics
              may be retained for up to 26 months as permitted by our analytics provider.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">5. Cookies &amp; Advertising</h2>
            <p>
              We use cookies and similar tracking technologies for the following purposes:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>
                <strong className="text-white">Essential cookies</strong> — store your cookie consent
                preference so you are not prompted on every visit.
              </li>
              <li>
                <strong className="text-white">Analytics cookies</strong> — help us understand how
                visitors interact with the site so we can improve it.
              </li>
              <li>
                <strong className="text-white">Advertising cookies (Google AdSense)</strong> —
                Google LLC uses cookies to serve ads based on your prior visits to this and other
                websites. These ads help fund the free service.
              </li>
            </ul>
            <p className="mt-3">
              You can opt out of personalized advertising at any time by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F97316] underline"
              >
                Google Ads Settings
              </a>{' '}
              or{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F97316] underline"
              >
                AboutAds.info
              </a>.
              For more on how Google uses data when you visit partner sites, see{' '}
              <a
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F97316] underline"
              >
                Google&apos;s Privacy &amp; Terms
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">6. Third-Party Services</h2>
            <p className="mb-2">
              We integrate with the following third-party services, each governed by their own
              privacy policies:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">ACRCloud</strong> — audio fingerprinting and music
                recognition. Your audio is sent to ACRCloud for identification.{' '}
                <a
                  href="https://www.acrcloud.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F97316] underline"
                >
                  ACRCloud Privacy Policy
                </a>
              </li>
              <li>
                <strong className="text-white">Apple iTunes Search API</strong> — used to retrieve
                album artwork. No personal data is sent.{' '}
                <a
                  href="https://www.apple.com/legal/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F97316] underline"
                >
                  Apple Privacy Policy
                </a>
              </li>
              <li>
                <strong className="text-white">Google AdSense</strong> — advertising network.{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F97316] underline"
                >
                  Google Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">7. Data Sharing</h2>
            <p>
              We do <strong className="text-white">not</strong> sell your personal data. We share
              data only in the following limited circumstances:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>With third-party services listed above, as required to operate the service</li>
              <li>When required by law, court order, or government authority</li>
              <li>To protect the rights, property, or safety of 45 Mix Trackr or its users</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">8. Your Rights — GDPR (EEA / UK / Switzerland)</h2>
            <p>
              If you are located in the European Economic Area, United Kingdom, or Switzerland,
              you have the following rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-white">Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong className="text-white">Rectification</strong> — request correction of inaccurate data</li>
              <li><strong className="text-white">Erasure</strong> — request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong className="text-white">Restriction</strong> — request that we limit how we process your data</li>
              <li><strong className="text-white">Portability</strong> — receive your data in a machine-readable format</li>
              <li><strong className="text-white">Objection</strong> — object to processing based on legitimate interests</li>
              <li><strong className="text-white">Withdraw consent</strong> — at any time for consent-based processing</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:contact@45mixtrackr.com" className="text-[#F97316] underline">
                contact@45mixtrackr.com
              </a>.
              We will respond within 30 days.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">9. Your Rights — CCPA (California Residents)</h2>
            <p>
              If you are a California resident, the California Consumer Privacy Act (CCPA) gives
              you the right to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Know what personal information we collect and how it is used</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of the sale of your personal information (we do not sell data)</li>
              <li>Non-discrimination for exercising your privacy rights</li>
            </ul>
            <p className="mt-3">
              To submit a CCPA request, contact us at{' '}
              <a href="mailto:contact@45mixtrackr.com" className="text-[#F97316] underline">
                contact@45mixtrackr.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">10. Children&apos;s Privacy</h2>
            <p>
              45 Mix Trackr is not directed to children under the age of 13 (or 16 in the EEA).
              We do not knowingly collect personal information from children. If you believe a
              child has submitted data through our service, please contact us immediately at{' '}
              <a href="mailto:contact@45mixtrackr.com" className="text-[#F97316] underline">
                contact@45mixtrackr.com
              </a>{' '}
              and we will delete it promptly.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">11. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including
              HTTPS encryption for all data in transit and restricted server access. However, no
              method of transmission over the internet is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">12. International Data Transfers</h2>
            <p>
              Our service and its third-party providers may process your data in countries
              outside your own, including the United States. Where required, we ensure
              appropriate safeguards are in place (such as Standard Contractual Clauses for
              EEA data transfers).
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise
              the &quot;Last updated&quot; date at the top of this page. For material changes, we may
              display a notice on the site. Continued use of the service after changes are
              posted constitutes your acceptance of the revised policy.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">14. Contact Us</h2>
            <p>
              For any questions, concerns, or requests regarding this Privacy Policy or your
              personal data, please contact us:
            </p>
            <div className="mt-3 bg-spotify-surface rounded-xl p-4">
              <p className="font-semibold text-white">45 Mix Trackr</p>
              <p className="mt-1">
                Email:{' '}
                <a href="mailto:contact@45mixtrackr.com" className="text-[#F97316] underline">
                  contact@45mixtrackr.com
                </a>
              </p>
              <p className="mt-1">
                Website:{' '}
                <a
                  href="https://www.45mixtrackr.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F97316] underline"
                >
                  www.45mixtrackr.com
                </a>
              </p>
            </div>
          </div>

        </section>
      </div>
    </PageShell>
  );
}
