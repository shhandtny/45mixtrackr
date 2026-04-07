'use client';

import { useState } from 'react';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:contact@45mixtrackr.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-6 text-orange-300">
        Thanks for reaching out! Your email client should have opened with your message.
        If it didn&apos;t, email us directly at{' '}
        <a href="mailto:contact@45mixtrackr.com" className="underline">
          contact@45mixtrackr.com
        </a>.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm text-[#B3B3B3] mb-1">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full bg-[#282828] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500 transition-colors"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-[#B3B3B3] mb-1">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full bg-[#282828] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500 transition-colors"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm text-[#B3B3B3] mb-1">Message</label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          className="w-full bg-[#282828] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500 transition-colors resize-none"
          placeholder="How can we help?"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-400 text-black font-semibold py-3 rounded-full transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}
