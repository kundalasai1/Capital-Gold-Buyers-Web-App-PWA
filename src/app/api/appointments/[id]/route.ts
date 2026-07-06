import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { sendEmail } from '@/lib/mailer';

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { branch: true },
    });
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes, slotDate, slotTime } = body;

    const session = await getSessionUser();

    // 1. If NO authenticated session, check if it's a public cancellation request matching client email
    if (!session) {
      const { email } = body;
      if (!email) {
        return NextResponse.json({ error: 'Email is required for cancellation validation' }, { status: 400 });
      }

      const appt = await prisma.appointment.findUnique({
        where: { id },
        include: { branch: true },
      });

      if (!appt || appt.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json({ error: 'Unauthorized cancellation request' }, { status: 401 });
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { branch: true },
      });

      // Send cancellation confirmation email
      await sendEmail({
        to: updated.email,
        subject: `Appointment Cancelled - Capital Gold Buyers`,
        templateName: 'appointment_cancellation',
        variables: {
          customerName: updated.customerName,
          branchName: updated.branch.name,
          slotDate: updated.slotDate,
          slotTime: updated.slotTime,
        },
      });

      return NextResponse.json({ success: true, appointment: updated });
    }

    // 2. Authenticated status change or booking updates
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: { branch: true },
    });

    if (!appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Staff role restriction: Staff can only edit appointments within their own assigned branch
    if (session.role === 'STAFF' && session.branchId && appt.branchId !== session.branchId) {
      return NextResponse.json({ error: 'Unauthorized branch access' }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: status || appt.status,
        notes: notes !== undefined ? notes : appt.notes,
        slotDate: slotDate || appt.slotDate,
        slotTime: slotTime || appt.slotTime,
      },
      include: { branch: true },
    });

    logActivity(
      session.email,
      'UPDATE_APPOINTMENT',
      `Updated appointment status for ${appt.customerName} to ${updated.status} (Appt ID: ${id})`
    );

    // Send customer email on status modifications (like approvals, rescheduling, or admin cancellations)
    if (status && status !== appt.status) {
      await sendEmail({
        to: updated.email,
        subject: `Appointment Status Update: ${updated.status} - Capital Gold Buyers`,
        templateName: 'appointment_status_update',
        variables: {
          customerName: updated.customerName,
          branchName: updated.branch.name,
          slotDate: updated.slotDate,
          slotTime: updated.slotTime,
          status: updated.status,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}
