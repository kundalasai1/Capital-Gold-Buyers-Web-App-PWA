import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const { name, phone, branchId } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required for callback requests' }, { status: 400 });
    }

    // 1. Fetch branch if specified
    let branch = null;
    if (branchId) {
      branch = await prisma.branch.findUnique({ where: { id: branchId } });
    }

    const branchName = branch ? branch.name : 'Nearest Branch';

    // 2. Create Lead
    const activityLog = [
      {
        date: new Date().toISOString(),
        note: `Hot Lead! Callback requested via "Call an Agent" floating widget. Routing branch: ${branchName}.`,
      },
    ];

    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        email: '',
        inquirySource: 'AGENT_CALL',
        branchId: branchId || null,
        status: 'NEW',
        notes: JSON.stringify(activityLog),
      },
    });

    // 3. Create Call Log
    await prisma.callLog.create({
      data: {
        branchId: branchId || null,
        type: 'CALLBACK',
        outcome: 'CALLBACK_REQUESTED',
        durationSeconds: 0,
      },
    });

    // 4. Alert Admin via Email
    const alertEmail = branch ? branch.email : (process.env.EMAIL_FROM || 'admin@capitalgoldbuyers.com');
    await sendEmail({
      to: alertEmail,
      subject: `[HOT LEAD] Callback Requested: ${name}`,
      templateName: 'contact_form_admin', // Re-use contact form alert layout
      variables: {
        customerName: name,
        phone,
        email: 'N/A (Callback Request)',
        message: `Customer requested an immediate callback via the website's floating 'Call an Agent' panel. Preferred Branch: ${branchName}.`,
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error('Call callback error:', error);
    return NextResponse.json({ error: 'Failed to request callback' }, { status: 500 });
  }
}
