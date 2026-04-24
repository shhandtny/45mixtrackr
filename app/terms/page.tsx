import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Terms of Service — 45 Mix Trackr',
  description:
    'Terms of Service for 45 Mix Trackr. Read our usage rules, subscription billing terms, cancellation policy, intellectual property policy, and limitations.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <PageShell>
      <div className="max-w-3xl text-white">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-[#B3B3B3] text-sm mb-10">Last updated: April 23, 2026</p>

        <section className="space-y-8 text-[#B3B3B3] leading-relaxed">

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using <strong className="text-white">45 Mix Trackr</strong> at{' '}
              <strong className="text-white">www.45mixtrackr.com</strong> (the &quot;Service&quot;), you
              agree to be bound by these Terms of Service (&quot;Terms&quot;) and our{' '}
              <a href="/privacy" className="text-[#F97316] underline">Privacy Policy</a>.
              If you do not agree with any part of these Terms, you must not use the Service.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">2. Description of Service</h2>
            <p>
              45 Mix Trackr is a web-based tool that allows users to upload audio or video
              files containing music mixes. The Service analyzes audio using third-party
              fingerprinting technology (ACRCloud) to identify songs, retrieves album artwork
              via the Apple iTunes Search API, and generates downloadable files including:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>A full tracklist with song titles, artists, and album covers</li>
              <li>An SRT subtitle file timed to each identified track</li>
              <li>A ZIP archive of album cover images</li>
            </ul>
            <p className="mt-2">
              The Service is available on a <strong className="text-white">freemium</strong> basis.
              A Free plan is available at no charge (with usage limits and advertising).
              A Premium subscription unlocks unlimited identifications and additional features.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">3. Accounts &amp; Authentication</h2>
            <p className="mb-2">
              You may use core features without an account. Creating an account is required to
              access history, re-downloads, and Premium features. You may register with an email
              address and password, or sign in with Google OAuth.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must not share your account with others or allow unauthorized access.</li>
              <li>You must notify us immediately at{' '}
                <a href="mailto:contact@45mixtrackr.com" className="text-[#F97316] underline">
                  contact@45mixtrackr.com
                </a>{' '}
                if you suspect unauthorized use of your account.
              </li>
              <li>We reserve the right to terminate accounts that violate these Terms.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">4. Eligibility</h2>
            <p>
              You must be at least 13 years of age (or 16 in the European Economic Area) to use
              this Service. By using the Service, you represent and warrant that you meet this
              age requirement. Premium subscriptions require you to be of legal age to enter into
              contracts in your jurisdiction.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">5. Free Plan &amp; Usage Limits</h2>
            <p>
              Free plan users may perform up to <strong className="text-white">3 mix identifications
              per calendar month</strong>. This limit resets on the first day of each month.
              Free plan results are not stored — you must download your files before leaving the page.
              Attempting to circumvent usage limits (e.g., by creating multiple accounts) is a
              violation of these Terms and may result in account termination.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">6. Premium Subscription &amp; Billing</h2>

            <p className="text-white text-sm font-semibold mb-1 mt-3">Subscription</p>
            <p className="mb-2">
              Premium is a recurring monthly subscription priced at{' '}
              <strong className="text-white">$4.99 USD per month</strong>. Subscribing unlocks
              unlimited monthly identifications, permanent history with re-downloads, and priority
              processing.
            </p>

            <p className="text-white text-sm font-semibold mb-1 mt-3">Payment Processing</p>
            <p className="mb-2">
              All payments are processed by <strong className="text-white">Stripe, Inc.</strong>,
              a PCI-DSS compliant payment processor. We do not store your credit card number or
              banking credentials. By subscribing, you also agree to{' '}
              <a href="https://stripe.com/legal/ssa" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                Stripe&apos;s Terms of Service
              </a>.
            </p>

            <p className="text-white text-sm font-semibold mb-1 mt-3">Renewal &amp; Cancellation</p>
            <p className="mb-2">
              Your subscription renews automatically each month until cancelled. You may cancel
              at any time through the <strong className="text-white">Account</strong> page →
              &quot;Manage subscription&quot;. Cancellation takes effect at the end of your current
              billing period — you retain Premium access until then.
            </p>

            <p className="text-white text-sm font-semibold mb-1 mt-3">Refunds</p>
            <p>
              We do not offer refunds for partial billing periods. If you believe you were charged
              in error, contact us at{' '}
              <a href="mailto:contact@45mixtrackr.com" className="text-[#F97316] underline">
                contact@45mixtrackr.com
              </a>{' '}
              within 7 days of the charge and we will review your request.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">7. User Responsibilities</h2>
            <p>By using the Service, you agree that you will not:</p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>Upload files containing content you do not have the right to process or analyze</li>
              <li>Use the Service for any unlawful, fraudulent, or harmful purpose</li>
              <li>Attempt to reverse engineer, decompile, hack, or disrupt the Service</li>
              <li>Upload malicious files, viruses, or any code intended to cause harm</li>
              <li>Use automated tools, bots, or scripts to abuse or overload the Service</li>
              <li>Create multiple accounts to circumvent Free plan usage limits</li>
              <li>Redistribute or resell song identification results for commercial purposes without authorization</li>
              <li>Misrepresent yourself or impersonate any person or entity</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">8. Intellectual Property</h2>
            <p>
              The songs identified by this Service are the intellectual property of their
              respective rights holders. 45 Mix Trackr does not host, store, stream, or
              distribute any copyrighted music. The Service only returns metadata (song title,
              artist name, album cover image URL) for informational and organizational purposes.
            </p>
            <p className="mt-2">
              You retain full ownership of the audio and video files you upload. By uploading,
              you grant us a temporary, limited license solely to process your file for the
              purpose of providing the Service. We do not claim any rights to your content.
            </p>
            <p className="mt-2">
              The 45 Mix Trackr name, logo, website design, and original software code are
              owned by 45 Mix Trackr and may not be copied or used without permission.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">9. Accuracy of Results</h2>
            <p>
              Song identification is powered by ACRCloud&apos;s audio fingerprinting technology.
              Recognition accuracy depends on the quality of the uploaded audio, the presence
              of songs in ACRCloud&apos;s database, and other factors outside our control.
              We make no guarantee that all songs in a mix will be identified correctly or at all.
              Results are provided for informational purposes and should be verified independently
              where accuracy is critical.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">10. File Uploads &amp; Storage</h2>
            <p>
              Uploaded files must not exceed the current maximum file size limit and must be in
              a supported format (MP3, MP4, WAV, M4A, AAC). We reserve the right to reject,
              delete, or limit uploads at our discretion.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-white">Free plan</strong> — files are deleted automatically after processing.</li>
              <li><strong className="text-white">Premium plan</strong> — result files (SRT, ZIP) are stored in your account for re-download from the History page. You may request deletion at any time.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">11. Third-Party Services</h2>
            <p>
              This Service integrates with the following third parties, whose terms apply independently:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>
                <strong className="text-white">Supabase</strong> — database, authentication, and file storage:{' '}
                <a href="https://supabase.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                  Supabase Terms
                </a>
              </li>
              <li>
                <strong className="text-white">Stripe, Inc.</strong> — payment processing:{' '}
                <a href="https://stripe.com/legal/ssa" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                  Stripe Terms
                </a>
              </li>
              <li>
                <strong className="text-white">Google</strong> — OAuth authentication and AdSense advertising:{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                  Google Terms
                </a>
              </li>
              <li>
                <strong className="text-white">ACRCloud</strong> — audio fingerprinting:{' '}
                <a href="https://www.acrcloud.com/terms-of-service/" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                  ACRCloud Terms
                </a>
              </li>
              <li>
                <strong className="text-white">Apple iTunes Search API</strong> — album artwork retrieval
                (subject to Apple&apos;s API terms)
              </li>
            </ul>
            <p className="mt-2">
              We are not responsible for the availability, accuracy, or practices of any third-party service.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">12. Advertising</h2>
            <p>
              This site displays advertisements served by Google AdSense to help fund the free
              Service tier. By using this site, you acknowledge that ads may appear and that Google
              may use cookies to serve personalized advertisements. You may manage your ad preferences at{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-[#F97316] underline">
                Google Ads Settings
              </a>.
              Premium subscribers may still see ads unless otherwise stated.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">13. Disclaimer of Warranties</h2>
            <p>
              The Service is provided <strong className="text-white">&quot;as is&quot;</strong> and{' '}
              <strong className="text-white">&quot;as available&quot;</strong> without warranties of any kind,
              either express or implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement. We do
              not warrant that the Service will be uninterrupted, error-free, or free of
              harmful components.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">14. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, 45 Mix Trackr shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages
              arising from:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your use of or inability to use the Service</li>
              <li>Inaccurate or incomplete song identification results</li>
              <li>Loss or corruption of uploaded files or stored results</li>
              <li>Any unauthorized access to or use of our servers or your data</li>
              <li>Any interruption or cessation of the Service</li>
              <li>Billing errors or payment processing failures caused by third-party payment providers</li>
            </ul>
            <p className="mt-2">
              Our total liability for any claim related to a Premium subscription shall not exceed
              the amount you paid in the 3 months prior to the event giving rise to the claim.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">15. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless 45 Mix Trackr and its operators from
              any claims, damages, losses, or expenses (including legal fees) arising from your
              use of the Service, your violation of these Terms, or your violation of any
              third-party rights, including intellectual property or privacy rights.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">16. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account and access to the Service
              at any time, without notice, for conduct that violates these Terms or that we
              determine to be harmful to the Service, other users, or third parties. Upon
              termination of a Premium account, your subscription will be cancelled and stored
              files will be deleted within 30 days.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">17. Modifications to the Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service (or any part
              of it) at any time with or without notice. If we discontinue the Premium plan,
              we will provide at least 30 days&apos; notice and cancel any outstanding subscriptions.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">18. Changes to These Terms</h2>
            <p>
              We may revise these Terms from time to time. When we do, we will update the
              &quot;Last updated&quot; date at the top of this page. For significant changes, we may
              display a notice on the site. Continued use of the Service after updated Terms
              are posted constitutes your acceptance of the revised Terms.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">19. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable law.
              Any disputes arising from these Terms or your use of the Service shall be resolved
              through good-faith negotiation first. Where legal proceedings are necessary, they
              shall be subject to the jurisdiction of the courts in the applicable territory.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">20. Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us:
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
