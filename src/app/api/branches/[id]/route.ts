import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const branch = await prisma.branch.findUnique({
      where: { id },
    });
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }
    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch branch' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, address, phone, email, hours, mapUrl, isActive } = await req.json();

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        name,
        address,
        phone,
        email,
        hours,
        mapUrl,
        isActive,
      },
    });

    logActivity(session.email, 'UPDATE_BRANCH', `Updated branch ${name} (${id})`);

    return NextResponse.json(branch);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const branch = await prisma.branch.findUnique({ where: { id } });

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Toggle active state instead of hard deleting to prevent breaking relations
    const updated = await prisma.branch.update({
      where: { id },
      data: { isActive: !branch.isActive },
    });

    logActivity(session.email, 'TOGGLE_BRANCH_ACTIVE', `Toggled branch ${branch.name} (${id}) active state to ${updated.isActive}`);

    return NextResponse.json({ success: true, isActive: updated.isActive });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle branch state' }, { status: 500 });
  }
}
