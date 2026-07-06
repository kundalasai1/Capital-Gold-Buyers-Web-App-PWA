import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        branch: true,
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Role restriction check for STAFF
    if (session.role === 'STAFF') {
      const isAssigned = lead.assignedToId === session.userId;
      const isBranchLead = session.branchId && lead.branchId === session.branchId;
      if (!isAssigned && !isBranchLead) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lead details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status, assignedToId, branchId, noteText } = await req.json();

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Role restriction check for STAFF
    if (session.role === 'STAFF') {
      const isAssigned = lead.assignedToId === session.userId;
      const isBranchLead = session.branchId && lead.branchId === session.branchId;
      if (!isAssigned && !isBranchLead) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Parse existing notes activity history log
    let activityLog = [];
    try {
      activityLog = JSON.parse(lead.notes || '[]');
      if (!Array.isArray(activityLog)) {
        activityLog = [];
      }
    } catch (_) {
      activityLog = [];
    }

    // Add note text if passed
    if (noteText) {
      activityLog.push({
        date: new Date().toISOString(),
        note: noteText,
        author: session.name,
      });
    }

    // Log status transition
    if (status && status !== lead.status) {
      activityLog.push({
        date: new Date().toISOString(),
        note: `Status updated from ${lead.status} to ${status}.`,
        author: session.name,
      });
    }

    // Log assignment transition
    if (assignedToId !== undefined && assignedToId !== lead.assignedToId) {
      if (assignedToId) {
        const staffUser = await prisma.user.findUnique({ where: { id: assignedToId } });
        activityLog.push({
          date: new Date().toISOString(),
          note: `Assigned to staff member: ${staffUser ? staffUser.name : 'Unknown'}`,
          author: session.name,
        });
      } else {
        activityLog.push({
          date: new Date().toISOString(),
          note: `Lead unassigned.`,
          author: session.name,
        });
      }
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: status || lead.status,
        assignedToId: assignedToId !== undefined ? assignedToId : lead.assignedToId,
        branchId: branchId !== undefined ? branchId : lead.branchId,
        notes: JSON.stringify(activityLog),
      },
    });

    logActivity(
      session.email,
      'UPDATE_LEAD',
      `Modified lead profile for ${lead.name} (${id}). Status: ${updated.status}.`
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
