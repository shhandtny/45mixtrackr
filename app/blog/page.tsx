import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { blogPosts, getBlogCoverImage } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'Blog — 45 Mix Trackr | Vinyl Records, Turntables & DJ Tips',
  description: 'Tips, guides, and insights for vinyl DJs and music lovers. Learn how to identify songs in a DJ mix, store vinyl records, set up turntables, and more.',
  keywords: 'DJ mix tracklist, identify songs in mix, vinyl records, turntable setup, 45 RPM adapter, vinyl vs digital DJing, DJ tips',
};

export default function BlogPage() {
  return (
    <PageShell>
      <div className="max-w-3xl text-white">
        <h1 className="text-3xl font-black mb-2">Blog</h1>
        <p className="text-[#B3B3B3] mb-10 text-sm">
          Guides and tips for vinyl DJs, record collectors, and music lovers.
        </p>

        <div className="space-y-6">
          {[...blogPosts].reverse().map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-spotify-surface hover:bg-spotify-hover rounded-xl overflow-hidden transition-colors group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getBlogCoverImage(post.slug)}
                alt={post.title}
                className="w-full h-48 object-cover bg-spotify-surface"
              />
              <div className="flex items-start justify-between gap-4 p-6">
                <div className="min-w-0">
                  <h2 className="text-white font-bold text-lg leading-snug group-hover:text-spotify-green transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[#B3B3B3] text-sm mt-2 leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-[#6B6B6B]">
                    <span>{post.date}</span>
                    <span>&bull;</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-[#6B6B6B] group-hover:text-spotify-green flex-shrink-0 mt-1 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
