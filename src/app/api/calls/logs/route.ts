import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await prisma.callLog.findMany({
      include: {
        agent: { select: { name: true } },
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch call logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { agentId, branchId, type, outcome, durationSeconds } = await req.json();

    if (!type || !outcome) {
      return NextResponse.json({ error: 'Missing required call log fields' }, { status: 400 });
    }

    const log = await prisma.callLog.create({
      data: {
        agentId: agentId || null,
        branchId: branchId || null,
        type,
        outcome,
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : 0,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Call log error:', error);
    return NextResponse.json({ error: 'Failed to save call log' }, { status: 500 });
  }
}
