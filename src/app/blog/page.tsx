import React from 'react';
import { prisma } from '@/lib/db';
import { Newspaper, Calendar, BookOpen, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

async function getBlogPosts(category?: string) {
  try {
    return await prisma.blogPost.findMany({
      where: {
        isPublished: true,
        category: category || undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.error('Failed to load blog posts:', e);
    return [];
  }
}

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const posts = await getBlogPosts(category);

  const categories = [
    'Gold Price Updates',
    'Gold Selling Tips',
    'Gold Purity Guides',
    'Investment Advice',
    'Company News',
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl flex items-center justify-center space-x-2">
          <Newspaper className="h-8 w-8 text-gold-600 animate-float" />
          <span>Gold Education & <span className="text-gold-600 text-gold-gradient">Market Insights</span></span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Stay informed on gold market movements, alloy testing procedures, investment strategies, and expert tips for maximizing your jewelry selling value.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12 border-b border-gold-600/10 pb-6">
        <Link
          href="/blog"
          className={`px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${
            !category
              ? 'bg-gold-600 text-black border-gold-600'
              : 'bg-charcoal-900 text-gray-300 border-gray-800 hover:border-gold-600/40 hover:text-white'
          }`}
        >
          All Articles
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/blog?category=${encodeURIComponent(cat)}`}
            className={`px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider border transition-all duration-200 ${
              category === cat
                ? 'bg-gold-600 text-black border-gold-600'
                : 'bg-charcoal-900 text-gray-300 border-gray-800 hover:border-gold-600/40 hover:text-white'
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article
            key={post.id}
            className="glass border border-gold-600/10 rounded-xl overflow-hidden hover:border-gold-600/25 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Header info */}
            <div className="p-6 space-y-4">
              <span className="inline-block px-2.5 py-0.5 rounded bg-gold-600/10 text-gold-600 text-[10px] font-bold uppercase tracking-widest border border-gold-600/20">
                {post.category}
              </span>
              
              <h2 className="text-lg font-bold text-white leading-snug line-clamp-2 hover:text-gold-600 transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>

              {/* Short meta description mock / excerpt */}
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                {post.metaDescription || 'No description provided. Read the full article to discover professional tips and gold valuation insights.'}
              </p>
            </div>

            {/* Footer details */}
            <div className="px-6 py-4 bg-charcoal-900/40 border-t border-gray-900 flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-gold-600" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="flex items-center space-x-1 text-gold-600 hover:text-gold-500 font-bold"
              >
                <span>Read Article</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
        
        {posts.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            No articles found under this category. Please check back later.
          </div>
        )}
      </div>
    </div>
  );
}
