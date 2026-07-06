import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function GET() {
  try {
    const rates = await prisma.goldRate.findMany({
      orderBy: [
        { metal: 'asc' },
        { purity: 'desc' }
      ]
    });
    return NextResponse.json(rates);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ratePerGram, isPublished } = await req.json();

    if (!id || ratePerGram === undefined) {
      return NextResponse.json({ error: 'Missing rate ID or value' }, { status: 400 });
    }

    const currentRate = await prisma.goldRate.findUnique({
      where: { id },
    });

    if (!currentRate) {
      return NextResponse.json({ error: 'Rate record not found' }, { status: 404 });
    }

    const newRatePerGram = parseFloat(ratePerGram);
    // Standard conversion: 1 Tola = 11.6638 Grams
    const newRatePerTola = +(newRatePerGram * 11.6638).toFixed(2);
    const previousRate = currentRate.ratePerGram;

    const updatedRate = await prisma.goldRate.update({
      where: { id },
      data: {
        ratePerGram: newRatePerGram,
        ratePerTola: newRatePerTola,
        isPublished: isPublished !== undefined ? isPublished : currentRate.isPublished,
        updatedBy: session.name,
      },
    });

    // Write audit log if rate value changed
    if (previousRate !== newRatePerGram) {
      await prisma.rateChangeLog.create({
        data: {
          rateId: id,
          previousValue: previousRate,
          newValue: newRatePerGram,
          changedBy: session.email,
        },
      });

      logActivity(
        session.email,
        'UPDATE_RATE',
        `Updated ${currentRate.metal} ${currentRate.purity} rate from ${previousRate} to ${newRatePerGram} per gram`
      );
    } else {
      logActivity(
        session.email,
        'UPDATE_RATE_VISIBILITY',
        `Toggled ${currentRate.metal} ${currentRate.purity} published status to ${updatedRate.isPublished}`
      );
    }

    return NextResponse.json(updatedRate);
  } catch (error) {
    console.error('Failed to update gold rate:', error);
    return NextResponse.json({ error: 'Failed to update gold rate' }, { status: 500 });
  }
}
