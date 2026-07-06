import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { metal, purity, weight, unit, name, phone, email, branchId } = await req.json();

    if (!metal || !purity || !weight || !unit) {
      return NextResponse.json({ error: 'Missing required calculation parameters' }, { status: 400 });
    }

    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight) || numericWeight <= 0) {
      return NextResponse.json({ error: 'Invalid weight value' }, { status: 400 });
    }

    // 1. Fetch current rate from database
    const dbRate = await prisma.goldRate.findFirst({
      where: { metal, purity, isPublished: true },
    });

    if (!dbRate) {
      return NextResponse.json({ error: 'Selected metal/purity rate is not available' }, { status: 404 });
    }

    // Use current rate
    const ratePerGram = dbRate.ratePerGram;
    const ratePerTola = dbRate.ratePerTola;

    let grossValue = 0;
    if (unit.toLowerCase() === 'grams') {
      grossValue = numericWeight * ratePerGram;
    } else {
      grossValue = numericWeight * ratePerTola;
    }

    // Standard deduction percentage (e.g. 8% service deduction for melt/assay loss)
    const DEDUCTION_PCT = 0.08; 
    const payoutValue = +(grossValue * (1 - DEDUCTION_PCT)).toFixed(2);
    const grossValueFormatted = +grossValue.toFixed(2);

    const calculationResult = {
      metal,
      purity,
      weight: numericWeight,
      unit,
      rateUsed: unit.toLowerCase() === 'grams' ? ratePerGram : ratePerTola,
      grossValue: grossValueFormatted,
      deductionPercent: DEDUCTION_PCT * 100,
      payout: payoutValue,
      disclaimer: 'Disclaimer: This calculation is an estimate only. The final valuation and actual payout amount will be determined at the branch after physical testing of the metal purity and weight.',
    };

    // 2. If user opted in to lock in or request a callback, create a Lead record
    let lead = null;
    if (name && phone) {
      const activityLog = [
        {
          date: new Date().toISOString(),
          note: `Lead created from Gold Value Calculator. Est. Payout: $${payoutValue} for ${numericWeight} ${unit} of ${purity} ${metal}.`,
        },
      ];

      lead = await prisma.lead.create({
        data: {
          name,
          phone,
          email: email || '',
          inquirySource: 'CALCULATOR',
          branchId: branchId || null,
          status: 'NEW',
          notes: JSON.stringify(activityLog),
        },
      });
    }

    return NextResponse.json({
      success: true,
      calculation: calculationResult,
      leadCreated: !!lead,
    });
  } catch (error) {
    console.error('Calculator API error:', error);
    return NextResponse.json({ error: 'Failed to process calculation' }, { status: 500 });
  }
}
