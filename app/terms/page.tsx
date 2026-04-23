import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Terms of Service — 45 Mix Trackr',
  description:
    'Terms of Service for 45 Mix Trackr. Read our usage rules, intellectual property policy, disclaimers, and limitations before using the service.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <PageShell>
      <div className="max-w-3xl text-white">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-[#B3B3B3] text-sm mb-10">Last updated: April 6, 2025</p>

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
              fingerprinting technology (ACRCloud) to identify songs, retrieve album artwork
              via the Apple iTunes Search API, and generate downloadable files including:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>A full tracklist with song titles, artists, and album covers</li>
              <li>An SRT subtitle file timed to each identified track</li>
              <li>A ZIP archive of album cover images</li>
            </ul>
            <p className="mt-2">
              The Service is provided free of charge and is supported by advertising.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">3. Eligibility</h2>
            <p>
              You must be at least 13 years of age (or 16 in the European Economic Area) to use
              this Service. By using the Service, you represent and warrant that you meet this
              age requirement.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">4. User Responsibilities</h2>
            <p>By using the Service, you agree that you will not:</p>
            <ul className="list-disc list-inside mt-2 space-y-2">
              <li>Upload files containing content you do not have the right to process or analyze</li>
              <li>Use the Service for any unlawful, fraudulent, or harmful purpose</li>
              <li>Attempt to reverse engineer, decompile, hack, or disrupt the Service</li>
              <li>Upload malicious files, viruses, or any code intended to cause harm</li>
              <li>Use automated tools, bots, or scripts to abuse or overload the Service</li>
              <li>Circumvent any usage limits, rate limits, or file size restrictions</li>
              <li>Redistribute or resell song identification results for commercial purposes without authorization</li>
              <li>Misrepresent yourself or impersonate any person or entity</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">5. Intellectual Property</h2>
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
            <h2 className="text-white text-lg font-semibold mb-2">6. Accuracy of Results</h2>
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
            <h2 className="text-white text-lg font-semibold mb-2">7. File Uploads &amp; Usage Limits</h2>
            <p>
              Uploaded files must not exceed the stated file size limit (currently 500 MB) and
              must be in a supported format (MP3, MP4, WAV, M4A, AAC). We reserve the right to
              reject, delete, or limit uploads at our discretion, particularly where misuse is
              suspected. Files are automatically deleted after processing is complete.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">8. Third-Party Services</h2>
            <p>
              This Service integrates with the following third parties, whose terms apply
              independently:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong className="text-white">ACRCloud</strong> — audio fingerprinting:{' '}
                <a
                  href="https://www.acrcloud.com/terms-of-service/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F97316] underline"
                >
                  ACRCloud Terms
                </a>
              </li>
              <li>
                <strong className="text-white">Apple iTunes Search API</strong> — album artwork
                retrieval (subject to Apple&apos;s API terms)
              </li>
              <li>
                <strong className="text-white">Google AdSense</strong> — advertising:{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F97316] underline"
                >
                  Google Advertising Policies
                </a>
              </li>
            </ul>
            <p className="mt-2">
              We are not responsible for the availability, accuracy, or practices of any
              third-party service.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">9. Advertising</h2>
            <p>
              This site displays advertisements served by Google AdSense to fund the free
              Service. By using this site, you acknowledge that ads may appear and that Google
              may use cookies to serve personalized advertisements based on your browsing
              activity. You may manage your ad preferences at{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F97316] underline"
              >
                Google Ads Settings
              </a>.
              See our{' '}
              <a href="/privacy" className="text-[#F97316] underline">Privacy Policy</a>{' '}
              for more details.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">10. Disclaimer of Warranties</h2>
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
            <h2 className="text-white text-lg font-semibold mb-2">11. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, 45 Mix Trackr, its operators,
              affiliates, and licensors shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising from:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Your use of or inability to use the Service</li>
              <li>Inaccurate or incomplete song identification results</li>
              <li>Loss or corruption of uploaded files</li>
              <li>Any unauthorized access to or use of our servers or your data</li>
              <li>Any interruption or cessation of the Service</li>
            </ul>
            <p className="mt-2">
              In jurisdictions that do not allow the exclusion of certain warranties or
              limitation of liability, our liability shall be limited to the greatest extent
              permitted by law.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless 45 Mix Trackr and its operators from
              any claims, damages, losses, or expenses (including legal fees) arising from your
              use of the Service, your violation of these Terms, or your violation of any
              third-party rights, including intellectual property or privacy rights.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">13. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at any
              time, without notice, for conduct that violates these Terms or that we determine
              to be harmful to the Service, other users, or third parties.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">14. Modifications to the Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service (or any part
              of it) at any time with or without notice. We will not be liable to you or any
              third party for any such modification, suspension, or discontinuation.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">15. Changes to These Terms</h2>
            <p>
              We may revise these Terms from time to time. When we do, we will update the
              &quot;Last updated&quot; date at the top of this page. For significant changes, we may
              display a notice on the site. Continued use of the Service after updated Terms
              are posted constitutes your acceptance of the revised Terms.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">16. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable law.
              Any disputes arising from these Terms or your use of the Service shall be resolved
              through good-faith negotiation first. Where legal proceedings are necessary, they
              shall be subject to the jurisdiction of the courts in the applicable territory.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-semibold mb-2">17. Contact</h2>
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
