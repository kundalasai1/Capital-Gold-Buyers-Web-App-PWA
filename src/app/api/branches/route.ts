import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET() {
  try {
    const session = await getSessionUser();
    // If admin is logged in, return all branches for management.
    // Otherwise, return only active branches.
    const showAll = session && session.role === 'ADMIN';
    const branches = await prisma.branch.findMany({
      where: showAll ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(branches);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, address, phone, email, hours, mapUrl } = await req.json();

    if (!name || !address || !phone || !email || !hours) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        address,
        phone,
        email,
        hours,
        mapUrl: mapUrl || '',
        isActive: true,
      },
    });

    logActivity(session.email, 'CREATE_BRANCH', `Created branch ${name} (${branch.id})`);

    return NextResponse.json(branch);
  } catch (error) {
    console.error('Failed to create branch:', error);
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}
