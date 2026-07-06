import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { MockRateProvider } from '@/lib/rateProvider';
import { logActivity } from '@/lib/activity';

export async function POST() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const provider = new MockRateProvider();
    const marketRates = await provider.fetchRates();

    const rateMappings = [
      { metal: 'GOLD', purity: '24K', rate: marketRates.gold24k },
      { metal: 'GOLD', purity: '22K', rate: marketRates.gold22k },
      { metal: 'GOLD', purity: '18K', rate: marketRates.gold18k },
      { metal: 'SILVER', purity: '999', rate: marketRates.silver },
    ];

    const syncedRates = [];

    for (const mapping of rateMappings) {
      const dbRate = await prisma.goldRate.findFirst({
        where: { metal: mapping.metal, purity: mapping.purity },
      });

      if (dbRate) {
        const previousRate = dbRate.ratePerGram;
        const newRatePerGram = mapping.rate;
        const newRatePerTola = +(newRatePerGram * 11.6638).toFixed(2);

        const updated = await prisma.goldRate.update({
          where: { id: dbRate.id },
          data: {
            ratePerGram: newRatePerGram,
            ratePerTola: newRatePerTola,
            updatedBy: `Market Sync (${session.name})`,
          },
        });

        syncedRates.push(updated);

        if (previousRate !== newRatePerGram) {
          await prisma.rateChangeLog.create({
            data: {
              rateId: dbRate.id,
              previousValue: previousRate,
              newValue: newRatePerGram,
              changedBy: `Market API (${session.email})`,
            },
          });
        }
      }
    }

    logActivity(
      session.email,
      'MARKET_SYNC',
      'Synced gold and silver rates with the live market API'
    );

    return NextResponse.json({ success: true, rates: syncedRates });
  } catch (error) {
    console.error('Rates sync error:', error);
    return NextResponse.json({ error: 'Failed to sync rates with market' }, { status: 500 });
  }
}
