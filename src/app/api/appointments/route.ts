import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { sendEmail } from '@/lib/mailer';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId') || undefined;
    const status = searchParams.get('status') || undefined;
    const slotDate = searchParams.get('date') || undefined;

    // Fetch appointments. Staff can only access their assigned branch unless branchId is not restricted
    const whereClause: any = {};
    if (branchId) {
      whereClause.branchId = branchId;
    }
    if (status) {
      whereClause.status = status;
    }
    if (slotDate) {
      whereClause.slotDate = slotDate;
    }

    // Role restriction: Staff can only read their assigned branch
    if (session.role === 'STAFF' && session.branchId) {
      whereClause.branchId = session.branchId;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        branch: {
          select: { name: true, phone: true, address: true },
        },
      },
      orderBy: [
        { slotDate: 'asc' },
        { slotTime: 'asc' },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Fetch appointments error:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { branchId, slotDate, slotTime, customerName, phone, email, notes } = await req.json();

    if (!branchId || !slotDate || !slotTime || !customerName || !phone || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Verify slot availability
    const conflict = await prisma.appointment.findFirst({
      where: {
        branchId,
        slotDate,
        slotTime,
        status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] },
      },
    });

    if (conflict) {
      return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 });
    }

    // 2. Fetch branch details
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // 3. Create appointment (status defaults to APPROVED for immediate booking confirmation)
    const appointment = await prisma.appointment.create({
      data: {
        branchId,
        slotDate,
        slotTime,
        customerName,
        phone,
        email,
        status: 'APPROVED',
        notes: notes || '',
      },
    });

    // 4. Capture customer as a scheduled lead in Lead Management
    const activityLog = [
      {
        date: new Date().toISOString(),
        note: `Lead auto-captured from Appointment booking on ${slotDate} at ${slotTime} (${branch.name}).`,
      },
    ];

    await prisma.lead.create({
      data: {
        name: customerName,
        phone,
        email,
        inquirySource: 'APPOINTMENT',
        branchId,
        status: 'SCHEDULED',
        notes: JSON.stringify(activityLog),
      },
    });

    // 5. Dispatch Emails (Module 7)
    // Branded email to customer
    await sendEmail({
      to: email,
      subject: `Appointment Confirmed - Capital Gold Buyers (${branch.name})`,
      templateName: 'appointment_confirmation_customer',
      variables: {
        customerName,
        branchName: branch.name,
        branchAddress: branch.address,
        branchPhone: branch.phone,
        slotDate,
        slotTime,
        appointmentId: appointment.id,
      },
    });

    // Email alert to branch admin/email address
    await sendEmail({
      to: branch.email,
      subject: `New Booking Alert: ${customerName} - ${slotDate} ${slotTime}`,
      templateName: 'appointment_confirmation_admin',
      variables: {
        customerName,
        phone,
        email,
        slotDate,
        slotTime,
        notes: notes || 'None',
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({ error: 'Failed to complete appointment booking' }, { status: 500 });
  }
}
