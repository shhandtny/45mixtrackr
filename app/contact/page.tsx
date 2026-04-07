import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact — 45 Mix Trackr',
  description:
    'Get in touch with the 45 Mix Trackr team. Send us questions, feedback, or bug reports and we\'ll get back to you.',
};

export default function ContactPage() {
  return (
    <PageShell>
      <div className="max-w-xl text-white">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-[#B3B3B3] mb-10">
          Have a question, feedback, or issue? Fill out the form below and we&apos;ll get back to you.
        </p>
        <ContactForm />
      </div>
    </PageShell>
  );
}
