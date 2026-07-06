import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

type Params = {
  params: Promise<{ idOrSlug: string }>;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { idOrSlug } = await params;
    const isId = UUID_REGEX.test(idOrSlug);

    const post = await prisma.blogPost.findFirst({
      where: isId ? { id: idOrSlug } : { slug: idOrSlug },
    });

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const session = await getSessionUser();
    // Public users cannot see draft posts
    if (!post.isPublished && (!session || session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve blog post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idOrSlug } = await params;
    const isId = UUID_REGEX.test(idOrSlug);

    const post = await prisma.blogPost.findFirst({
      where: isId ? { id: idOrSlug } : { slug: idOrSlug },
    });

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
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

    const updated = await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        title: title || post.title,
        body: body || post.body,
        category: category || post.category,
        tags: tags !== undefined ? tags : post.tags,
        featuredImage: featuredImage || post.featuredImage,
        isPublished: isPublished !== undefined ? isPublished : post.isPublished,
        metaTitle: metaTitle || post.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : post.metaDescription,
        metaKeywords: metaKeywords !== undefined ? metaKeywords : post.metaKeywords,
      },
    });

    logActivity(session.email, 'UPDATE_BLOG_POST', `Updated blog article: "${updated.title}"`);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { idOrSlug } = await params;
    const isId = UUID_REGEX.test(idOrSlug);

    const post = await prisma.blogPost.findFirst({
      where: isId ? { id: idOrSlug } : { slug: idOrSlug },
    });

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({
      where: { id: post.id },
    });

    logActivity(session.email, 'DELETE_BLOG_POST', `Deleted blog article: "${post.title}"`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
