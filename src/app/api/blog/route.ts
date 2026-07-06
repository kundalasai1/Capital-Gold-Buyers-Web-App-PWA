import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces/dashes with single dash
    .replace(/^-+|-+$/g, '');  // Trim outer dashes
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;

    const session = await getSessionUser();
    // Public users only see published posts. Admins see draft + published.
    const showAll = session && session.role === 'ADMIN';

    const posts = await prisma.blogPost.findMany({
      where: {
        category,
        isPublished: showAll ? undefined : true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      body,
      category,
      tags,
      featuredImage,
      isPublished,
      metaTitle,
      metaDescription,
      metaKeywords,
    } = await req.json();

    if (!title || !body || !category) {
      return NextResponse.json({ error: 'Title, content, and category are required' }, { status: 400 });
    }

    // Auto-generate slug and check uniqueness
    let slug = generateSlug(title);
    let originalSlug = slug;
    let count = 1;
    while (true) {
      const conflict = await prisma.blogPost.findUnique({ where: { slug } });
      if (!conflict) break;
      slug = `${originalSlug}-${count++}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        body,
        category,
        tags: tags || '',
        featuredImage: featuredImage || '/images/blog-placeholder.jpg',
        isPublished: isPublished !== undefined ? isPublished : true,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || '',
        metaKeywords: metaKeywords || '',
      },
    });

    logActivity(session.email, 'CREATE_BLOG_POST', `Created blog article: "${title}" (Slug: ${slug})`);

    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to create blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
