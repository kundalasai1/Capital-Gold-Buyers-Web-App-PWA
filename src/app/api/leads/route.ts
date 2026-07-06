import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const branchId = searchParams.get('branchId') || undefined;
    const source = searchParams.get('source') || undefined;
    const query = searchParams.get('q') || '';

    // Build the query where clause
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (branchId) {
      whereClause.branchId = branchId;
    }
    if (source) {
      whereClause.inquirySource = source;
    }

    // Search query matches name, email, or phone
    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    // Role restrictions: Staff can only access leads assigned to them OR leads tied to their assigned branch
    if (session.role === 'STAFF') {
      whereClause.OR = [
        { assignedToId: session.userId },
        ...(session.branchId ? [{ branchId: session.branchId }] : []),
      ];
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        branch: { select: { name: true } },
        assignedTo: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Fetch leads error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST endpoint is public for general contact forms
export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, branchId, message } = await req.json();

    if (!name || !phone || !email) {
      return NextResponse.json({ error: 'Missing contact information fields' }, { status: 400 });
    }

    // Clean up inputs
    const activityLog = [
      {
        date: new Date().toISOString(),
        note: `Lead created from public Contact Form submission. Message: "${message || 'None'}"`,
      },
    ];

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        inquirySource: 'CONTACT_FORM',
        branchId: branchId || null,
        status: 'NEW',
        notes: JSON.stringify(activityLog),
      },
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json({ error: 'Failed to submit contact request' }, { status: 500 });
  }
}
