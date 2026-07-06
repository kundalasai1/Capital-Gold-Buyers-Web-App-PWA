import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId');
    const dateStr = searchParams.get('date'); // Format: YYYY-MM-DD

    if (!branchId || !dateStr) {
      return NextResponse.json({ error: 'Missing branchId or date' }, { status: 400 });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Determine slots based on day of week and branch business hours
    const bookingDate = new Date(dateStr);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    let potentialSlots: string[] = [];

    // Let's implement dynamic hourly slots depending on the branch business hours
    if (branch.name.includes('Downtown')) {
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Mon-Fri: 9:00 AM - 6:00 PM
        potentialSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
      } else if (dayOfWeek === 6) {
        // Sat: 10:00 AM - 4:00 PM
        potentialSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
      } // Sun: closed (potentialSlots empty)
    } else {
      // Westside Branch or default
      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        // Mon-Sat: 10:00 AM - 8:00 PM
        potentialSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
      } else if (dayOfWeek === 0) {
        // Sun: 11:00 AM - 5:00 PM
        potentialSlots = ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
      }
    }

    // Fetch existing appointments for the branch and date
    const existingBookings = await prisma.appointment.findMany({
      where: {
        branchId,
        slotDate: dateStr,
        status: { in: ['PENDING', 'APPROVED', 'COMPLETED'] },
      },
      select: {
        slotTime: true,
      },
    });

    const bookedTimes = new Set(existingBookings.map((b) => b.slotTime));

    // Filter out booked slots
    const availableSlots = potentialSlots.filter((slot) => !bookedTimes.has(slot));

    return NextResponse.json({
      date: dateStr,
      dayOfWeek,
      availableSlots,
    });
  } catch (error) {
    console.error('Failed to generate slots:', error);
    return NextResponse.json({ error: 'Failed to fetch available slots' }, { status: 500 });
  }
}
