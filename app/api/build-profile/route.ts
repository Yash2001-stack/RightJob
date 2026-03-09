import { NextRequest, NextResponse } from 'next/server';
import { callClaudeForJson } from '@/lib/claude';
import { buildIntentProfilePrompt } from '@/lib/prompts/intentProfile';
import { saveIntentProfile } from '@/lib/firebase';
import type { BaseProfile, IntentProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, baseProfile, answers } = body as {
      sessionId: string;
      baseProfile: BaseProfile;
      answers: string[];
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }
    if (!baseProfile) {
      return NextResponse.json(
        { error: 'baseProfile is required' },
        { status: 400 }
      );
    }
    if (!answers || answers.length < 7) {
      return NextResponse.json(
        { error: 'All 7 onboarding answers are required' },
        { status: 400 }
      );
    }

    const prompt = buildIntentProfilePrompt(baseProfile, answers);
    const intentProfile = await callClaudeForJson<IntentProfile>(prompt);

    await saveIntentProfile(sessionId, intentProfile);

    return NextResponse.json({ intentProfile });
  } catch (error) {
    console.error('Error building profile:', error);
    return NextResponse.json(
      { error: 'Failed to build intent profile' },
      { status: 500 }
    );
  }
}
