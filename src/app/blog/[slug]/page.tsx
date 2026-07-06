import React from 'react';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Calendar, User, Newspaper, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });
    if (!post) return {};
    
    return {
      title: `${post.metaTitle || post.title} | Capital Gold Buyers Blog`,
      description: post.metaDescription,
      keywords: post.metaKeywords,
      openGraph: {
        title: post.title,
        description: post.metaDescription,
        type: 'article',
        publishedTime: post.createdAt.toISOString(),
      },
    };
  } catch (e) {
    return {};
  }
}

async function getPost(slug: string) {
  try {
    return await prisma.blogPost.findUnique({
      where: { slug, isPublished: true },
    });
  } catch (e) {
    return null;
  }
}

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Inject structured Article Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.title,
    'description': post.metaDescription,
    'datePublished': post.createdAt.toISOString(),
    'author': {
      '@type': 'Organization',
      'name': 'Capital Gold Buyers',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Capital Gold Buyers',
      'logo': {
        '@type': 'ImageObject',
        'url': `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/icons/icon-192x192.png`,
      },
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Insert JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-6">
        {/* Back navigation */}
        <Link
          href="/blog"
          className="inline-flex items-center text-xs text-gold-600 hover:text-gold-500 space-x-1.5 font-bold uppercase tracking-wider focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Articles</span>
        </Link>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          {post.title}
        </h1>

        {/* Meta values */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 py-3 border-y border-gold-600/10">
          <span className="px-2.5 py-0.5 rounded bg-gold-600/10 text-gold-600 font-bold uppercase tracking-widest border border-gold-600/20">
            {post.category}
          </span>
          <span className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Published: {new Date(post.createdAt).toLocaleDateString()}</span>
          </span>
          <span className="flex items-center space-x-1">
            <User className="h-3.5 w-3.5" />
            <span>Author: Capital Editorial Team</span>
          </span>
        </div>

        {/* Article Body */}
        <div className="prose prose-invert prose-gold max-w-none text-gray-300 text-sm leading-relaxed space-y-4 pt-4">
          {post.body.split('\n\n').map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Social Share Buttons */}
        <div className="border-t border-gold-600/10 pt-6 mt-12 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Share This Article</h4>
          <div className="flex items-center space-x-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${post.slug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded bg-charcoal-900 border border-gray-800 text-gray-400 hover:text-gold-600 transition-colors"
            >
              <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${post.slug}`
              )}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded bg-charcoal-900 border border-gray-800 text-gray-400 hover:text-gold-600 transition-colors"
            >
              <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Article link copied to clipboard!');
              }}
              className="p-2.5 rounded bg-charcoal-900 border border-gray-800 text-gray-400 hover:text-gold-600 transition-colors"
            >
              <LinkIcon className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
