import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET() {
  try {
    // Return all agents ordered by priority
    const agents = await prisma.agent.findMany({
      include: {
        branch: { select: { name: true, phone: true } },
      },
      orderBy: { priority: 'asc' },
    });

    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agent list' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, branchId, isOnline, priority } = await req.json();

    if (!name || !phone || !branchId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        phone,
        branchId,
        isOnline: isOnline !== undefined ? isOnline : true,
        priority: priority !== undefined ? parseInt(priority) : 1,
      },
    });

    logActivity(session.email, 'CREATE_AGENT', `Created call agent ${name} (${agent.id})`);

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Failed to create agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, isOnline, priority } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const updated = await prisma.agent.update({
      where: { id },
      data: {
        isOnline: isOnline !== undefined ? isOnline : agent.isOnline,
        priority: priority !== undefined ? parseInt(priority) : agent.priority,
      },
    });

    logActivity(
      session.email,
      'TOGGLE_AGENT_STATUS',
      `Updated agent ${agent.name} online status to ${updated.isOnline}`
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update agent status' }, { status: 500 });
  }
}
