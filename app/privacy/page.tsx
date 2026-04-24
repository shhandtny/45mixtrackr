import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy — 45 Mix Trackr',
  description:
    'Privacy Policy for 45 Mix Trackr. Learn how we collect, use, and protect your data, including account data, payment processing, Google login, and GDPR/CCPA rights.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="max-w-3xl text-white">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-[#B3B3B3] text-sm mb-10">Last updated: April 23, 2026</p>

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
            <p className="mb-3">We collect the following categories of information:</p>

            <p className="text-white text-sm font-semibold mb-1">2a. Account Information (registered users)</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong className="text-white">Email address</strong> — collected when you create an account
                via email/password signup or Google OAuth. Used solely for authentication and account management.
              </li>
              <li>
                <strong className="text-white">Authentication provider</strong> — whether you signed up with
                email or Google. If you use Google Sign-In, we receive only your name and email from Google;
                we do not receive your Google password or other Google account data.
              </li>
              <li>
                <strong className="text-white">Plan status</strong> — whether your account is on the Free or
                Premium plan, and your subscription status.
              </li>
              <li>
                <strong className="text-white">Usage count</strong> — the number of mix identifications you
                have performed in the current calendar month, used to enforce Free plan limits.
              </li>
            </ul>

            <p className="text-white text-sm font-semibold mb-1">2b. Payment Information (Premium subscribers)</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong className="text-white">Billing details</strong> — collected and processed exclusively
                by <strong className="text-white">Stripe, Inc.</strong> We never see or store your full card number,
                CVV, or banking credentials. We only store your Stripe Customer ID and subscription status.
              </li>
            </ul>

            <p className="text-white text-sm font-semibold mb-1">2c. Uploaded Files</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong className="text-white">Audio / video files (Free users)</strong> — processed solely
                to identify songs. Files are automatically deleted from our servers once processing is complete
                (typically within minutes).
              </li>
              <li>
                <strong className="text-white">Audio / video files (Premium users)</strong> — uploaded files
                and result files (SRT, ZIP) are stored in Supabase cloud storage linked to your account so you
                can re-download results from your History page. You may delete these files at any time by
                contacting us or closing your account.
              </li>
            </ul>

            <p className="text-white text-sm font-semibold mb-1">2d. Usage &amp; Technical Data</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Pages visited</strong>, features used, time on site, and referrer URL</li>
              <li><strong className="text-white">Device &amp; browser information</strong> — browser type, OS, screen resolution, and language preference</li>
              <li><strong className="text-white">IP address</strong> — used for analytics, fraud prevention, and regional legal compliance</li>
              <li><strong className="text-white">Session cookies</strong> — used to keep you logged in across page visits (see Section 5)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To authenticate your account and maintain your session</li>
              <li>To enforce Free plan limits (3 identifications per month) and unlock Premium features</li>
              <li>To process your uploaded audio and return song identification results</li>
              <li>To generate and store SRT subtitle files and album cover ZIP archives for your History</li>
              <li>To process Premium subscription payments via Stripe</li>
              <li>To send transactional emails (e.g., payment receipts) via Stripe — we do not send marketing emails</li>
              <li>To analyze site usage and improve performance and usability</li>
              <li>To display advertisements via Google AdSense (free users)</li>
              <li>To detect and prevent abuse, fraud, or service disruption</li>
              <li>To comply with applicable legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">4. Data Retention</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">Free user uploads</strong> — deleted from our servers
                automatically after processing (typically within minutes).
              </li>
              <li>
                <strong className="text-white">Premium user uploads &amp; results</strong> — stored in
                Supabase cloud storage until you delete them or close your account. You can request
                deletion at any time by emailing us.
              </li>
              <li>
                <strong className="text-white">Account data</strong> — retained for as long as your account
                is active. Deleted within 30 days of an account closure request.
              </li>
              <li>
                <strong className="text-white">Payment records</strong> — Stripe retains billing records
                in accordance with their own retention policy and applicable financial regulations.
              </li>
              <li>
                <strong className="text-white">Analytics data</strong> — anonymized usage analytics may be
                retained for up to 26 months as permitted by our analytics provider.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">5. Cookies &amp; Session Storage</h2>
            <p className="mb-2">We use cookies and similar technologies for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">Authentication cookies (Supabase)</strong> — store a secure
                session token so you remain logged in. These are essential cookies and cannot be disabled
                without breaking account functionality.
              </li>
              <li>
                <strong className="text-white">Consent cookie</strong> — stores your cookie consent choice
                locally so you are not prompted on every visit.
              </li>
              <li>
                <strong className="text-white">Analytics cookies</strong> — help us understand how visitors
                interact with the site.
              </li>
              <li>
                <strong className="text-white">Advertising cookies (Google AdSense)</strong> — Google LLC
                uses cookies to serve personalized ads based on your browsing activity. These ads help fund
                the free service tier.
              </li>
            </ul>
            <p className="mt-3">
              You can opt out of personalized advertising at{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                Google Ads Settings
              </a>{' '}
              or{' '}
              <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                AboutAds.info
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">6. Third-Party Services</h2>
            <p className="mb-2">
              We integrate with the following third-party services, each governed by their own privacy policies:
            </p>
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong className="text-white">Supabase</strong> — database, authentication, and file storage
                provider. Your account data and (for Premium users) uploaded files are stored on Supabase infrastructure.{' '}
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                  Supabase Privacy Policy
                </a>
              </li>
              <li>
                <strong className="text-white">Stripe, Inc.</strong> — payment processing. Handles all credit
                card and billing data for Premium subscriptions. We do not store card numbers.{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                  Stripe Privacy Policy
                </a>
              </li>
              <li>
                <strong className="text-white">Google (OAuth &amp; AdSense)</strong> — used for Google Sign-In
                (authentication) and Google AdSense (advertising). When you sign in with Google, Google shares
                your name and email with us.{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <strong className="text-white">ACRCloud</strong> — audio fingerprinting and music recognition.
                Your audio is sent to ACRCloud for identification.{' '}
                <a href="https://www.acrcloud.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                  ACRCloud Privacy Policy
                </a>
              </li>
              <li>
                <strong className="text-white">Apple iTunes Search API</strong> — used to retrieve album artwork.
                No personal data is sent.{' '}
                <a href="https://www.apple.com/legal/privacy/" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                  Apple Privacy Policy
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
              <li>With third-party service providers listed in Section 6, as required to operate the service</li>
              <li>With Stripe, to process payments and manage your subscription</li>
              <li>When required by law, court order, or government authority</li>
              <li>To protect the rights, property, or safety of 45 Mix Trackr or its users</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">8. Your Rights — GDPR (EEA / UK / Switzerland)</h2>
            <p>
              If you are located in the European Economic Area, United Kingdom, or Switzerland,
              you have the following rights under GDPR:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-white">Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong className="text-white">Rectification</strong> — request correction of inaccurate data</li>
              <li><strong className="text-white">Erasure</strong> — request deletion of your account and data (&quot;right to be forgotten&quot;)</li>
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
              California residents have the right to:
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
              child has submitted data through our service, please contact us at{' '}
              <a href="mailto:contact@45mixtrackr.com" className="text-[#F97316] underline">
                contact@45mixtrackr.com
              </a>{' '}
              and we will delete it promptly.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">11. Data Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption for all
              data in transit, secure server-side session handling via Supabase, and restricted
              access controls. Payment data is handled exclusively by Stripe&apos;s PCI-DSS compliant
              infrastructure. However, no method of transmission over the internet is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">12. International Data Transfers</h2>
            <p>
              Our service and its third-party providers (including Supabase and Stripe) may process
              your data in countries outside your own, including the United States. Where required,
              we ensure appropriate safeguards are in place (such as Standard Contractual Clauses
              for EEA data transfers).
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
                <a href="https://www.45mixtrackr.com" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
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
