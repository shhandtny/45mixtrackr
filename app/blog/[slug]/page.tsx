import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { blogPosts, getBlogPost, getBlogCoverImage } from '@/lib/blog-posts';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — 45 Mix Trackr`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
  };
}

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-white text-2xl font-bold mt-10 mb-4">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-white text-lg font-semibold mt-6 mb-2">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('---')) {
      elements.push(<hr key={key++} className="border-[#282828] my-8" />);
    } else if (line.startsWith('![')) {
      const altMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (altMatch) {
        elements.push(
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={key++} src={altMatch[2]} alt={altMatch[1]}
            className="w-full rounded-xl my-6" />
        );
      }
    } else if (line.startsWith('@[')) {
      const vidMatch = line.match(/^@\[([^\]]*)\]\(([^)]+)\)$/);
      if (vidMatch) {
        elements.push(
          <video key={key++} src={vidMatch[2]} controls playsInline
            className="w-full rounded-xl my-6 bg-black" />
        );
      }
    } else if (line.startsWith('- ')) {
      // Collect consecutive list items
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      i--; // back up one since outer loop will increment
      elements.push(
        <ul key={key++} className="list-disc list-outside ml-5 space-y-1 text-[#B3B3B3] leading-relaxed my-3">
          {items.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
    } else if (line.startsWith('| ')) {
      // Table
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!lines[i].includes('---')) {
          rows.push(lines[i].split('|').filter((c) => c.trim()).map((c) => c.trim()));
        }
        i++;
      }
      i--;
      elements.push(
        <div key={key++} className="overflow-x-auto my-6">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr>
                {rows[0]?.map((cell, ci) => (
                  <th key={ci} className="px-4 py-2 text-white font-semibold border-b border-[#282828]">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} className="border-b border-[#1a1a1a]">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-2 text-[#B3B3B3]">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      elements.push(
        <p key={key++} className="text-[#B3B3B3] leading-relaxed my-3"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }
  }

  return elements;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-spotify-green hover:underline">$1</a>');
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: '45 Mix Trackr',
      url: 'https://www.45mixtrackr.com',
    },
    publisher: {
      '@type': 'Organization',
      name: '45 Mix Trackr',
      url: 'https://www.45mixtrackr.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.45mixtrackr.com/blog/${slug}`,
    },
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-2xl text-white">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-[#B3B3B3] hover:text-white text-sm mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
          </svg>
          All posts
        </Link>

        {/* Hero image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getBlogCoverImage(post.slug)}
          alt={post.title}
          className="w-full h-64 object-cover rounded-xl mb-8 bg-spotify-surface"
        />

        {/* Header */}
        <h1 className="text-3xl font-black leading-tight mb-3">{post.title}</h1>
        <div className="flex items-center gap-3 text-xs text-[#6B6B6B] mb-10">
          <span>{post.date}</span>
          <span>&bull;</span>
          <span>{post.readTime}</span>
        </div>

        {/* Content */}
        <div>{renderContent(post.content)}</div>

        {/* CTA */}
        <div className="mt-12 bg-spotify-surface rounded-xl p-6">
          <p className="text-white font-bold mb-1">Identify your DJ mix instantly</p>
          <p className="text-[#B3B3B3] text-sm mb-4">
            Upload any audio or video mix and get a full tracklist with song titles, artists, and album covers in minutes.
          </p>
          <Link
            href="/"
            className="inline-block bg-spotify-green hover:bg-[#FB923C] text-black font-bold py-2 px-6 rounded-full text-sm transition-colors"
          >
            Try 45 Mix Trackr →
          </Link>
        </div>

        {/* Other posts */}
        <div className="mt-10">
          <p className="text-[#6B6B6B] text-xs uppercase tracking-widest mb-4">More articles</p>
          <div className="space-y-3">
            {[...blogPosts].reverse()
              .filter((p) => p.slug !== slug)
              .slice(0, 3)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-spotify-hover transition-colors group"
                >
                  <span className="text-[#B3B3B3] text-sm group-hover:text-white transition-colors truncate">
                    {p.title}
                  </span>
                  <svg className="w-4 h-4 text-[#6B6B6B] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                  </svg>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </PageShell>
  );
}
