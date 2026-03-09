import { NextRequest, NextResponse } from 'next/server';
import { callClaudeForJson } from '@/lib/claude';
import { buildJobDetailPrompt } from '@/lib/prompts/jobDetail';
import { saveJobDetail, getJobDetail } from '@/lib/firebase';
import type { IntentProfile, ScoredJob, JobDetail } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, job, cvText, intentProfile } = body as {
      sessionId: string;
      job: ScoredJob;
      cvText: string;
      intentProfile: IntentProfile;
    };

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }
    if (!job) {
      return NextResponse.json({ error: 'job is required' }, { status: 400 });
    }
    if (!cvText) {
      return NextResponse.json(
        { error: 'cvText is required' },
        { status: 400 }
      );
    }
    if (!intentProfile) {
      return NextResponse.json(
        { error: 'intentProfile is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = await getJobDetail(sessionId, job.id);
    if (cached) {
      return NextResponse.json({ jobDetail: cached });
    }

    const prompt = buildJobDetailPrompt(cvText, intentProfile, job);
    const result = await callClaudeForJson<Omit<JobDetail, 'job'>>(prompt);

    const jobDetail: JobDetail = {
      job,
      cvTweaks: result.cvTweaks || [],
      attachmentRecommendations: result.attachmentRecommendations || [],
      coverLetter: result.coverLetter || '',
    };

    await saveJobDetail(sessionId, job.id, jobDetail);

    return NextResponse.json({ jobDetail });
  } catch (error) {
    console.error('Error generating job detail:', error);
    return NextResponse.json(
      { error: 'Failed to generate job details' },
      { status: 500 }
    );
  }
}
