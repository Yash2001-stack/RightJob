import { NextRequest, NextResponse } from 'next/server';
import { callClaudeForJson } from '@/lib/claude';
import { buildJobScoringPrompt } from '@/lib/prompts/jobScoring';
import { saveScoredJobs } from '@/lib/firebase';
import type { IntentProfile, RawJob, ScoredJob } from '@/lib/types';

interface JobScoreResult {
  fitScore: number;
  selectionProbability: number;
  tier: 'strong' | 'explore' | 'stretch';
  fitReasons: string[];
  gapFlags: string[];
  competitionSignal: 'high' | 'medium' | 'low';
  whyApplyNow: string;
}

async function scoreJob(
  job: RawJob,
  intentProfile: IntentProfile
): Promise<ScoredJob> {
  const prompt = buildJobScoringPrompt(
    intentProfile,
    job.title,
    job.company,
    job.jdText
  );

  const scored = await callClaudeForJson<JobScoreResult>(prompt);

  return {
    ...job,
    fitScore: scored.fitScore,
    selectionProbability: scored.selectionProbability,
    tier: scored.tier,
    fitReasons: scored.fitReasons,
    gapFlags: scored.gapFlags || [],
    competitionSignal: scored.competitionSignal,
    whyApplyNow: scored.whyApplyNow,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, intentProfile, jobs } = body as {
      sessionId: string;
      intentProfile: IntentProfile;
      jobs: RawJob[];
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
    if (!jobs || !Array.isArray(jobs)) {
      return NextResponse.json(
        { error: 'jobs array is required' },
        { status: 400 }
      );
    }

    // Score jobs in parallel (but limit concurrency to avoid rate limits)
    const BATCH_SIZE = 5;
    const scoredJobs: ScoredJob[] = [];

    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((job) => scoreJob(job, intentProfile))
      );

      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          scoredJobs.push(result.value);
        } else {
          console.error(
            `Failed to score job ${batch[idx].title}:`,
            result.reason
          );
          // Add with default scores so it still appears
          scoredJobs.push({
            ...batch[idx],
            fitScore: 0,
            selectionProbability: 0,
            tier: 'explore',
            fitReasons: [],
            gapFlags: [],
            competitionSignal: 'medium',
            whyApplyNow: '',
          });
        }
      });
    }

    // Sort: strong first, then explore, then stretch; within tier sort by combined score
    const tierOrder = { strong: 0, explore: 1, stretch: 2 };
    scoredJobs.sort((a, b) => {
      const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
      if (tierDiff !== 0) return tierDiff;
      const aScore = a.fitScore + a.selectionProbability;
      const bScore = b.fitScore + b.selectionProbability;
      return bScore - aScore;
    });

    await saveScoredJobs(sessionId, scoredJobs);

    return NextResponse.json({ scoredJobs });
  } catch (error) {
    console.error('Error scoring jobs:', error);
    return NextResponse.json(
      { error: 'Failed to score jobs' },
      { status: 500 }
    );
  }
}
