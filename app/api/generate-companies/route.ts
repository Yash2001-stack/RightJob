import { NextRequest, NextResponse } from 'next/server';
import { callClaudeForJson } from '@/lib/claude';
import { buildCompanyUniversePrompt } from '@/lib/prompts/companyUniverse';
import { saveCompanies } from '@/lib/firebase';
import type { Company, IntentProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, intentProfile } = body as {
      sessionId: string;
      intentProfile: IntentProfile;
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }
    if (!intentProfile) {
      return NextResponse.json(
        { error: 'intentProfile is required' },
        { status: 400 }
      );
    }

    const prompt = buildCompanyUniversePrompt(intentProfile);
    const companies = await callClaudeForJson<Company[]>(prompt);

    if (!Array.isArray(companies)) {
      return NextResponse.json(
        { error: 'Invalid company list returned' },
        { status: 500 }
      );
    }

    await saveCompanies(sessionId, companies);

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Error generating companies:', error);
    return NextResponse.json(
      { error: 'Failed to generate company universe' },
      { status: 500 }
    );
  }
}
