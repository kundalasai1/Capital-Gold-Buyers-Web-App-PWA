import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.rateChangeLog.findMany({
      include: {
        rate: {
          select: { metal: true, purity: true },
        },
      },
      orderBy: { changedAt: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to fetch rate logs:', error);
    return NextResponse.json({ error: 'Failed to fetch rate logs' }, { status: 500 });
  }
}
