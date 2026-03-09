import type { IntentProfile } from '../types';

export function buildJobScoringPrompt(
  intentProfile: IntentProfile,
  title: string,
  company: string,
  jdText: string
): string {
  return `You are an expert recruiter and hiring manager. Score this job opportunity for this specific candidate. Return ONLY valid JSON, no preamble.

Candidate Intent Profile:
${JSON.stringify(intentProfile, null, 2)}

Job Posting:
Title: ${title}
Company: ${company}
JD Text: ${jdText.slice(0, 3000)}

Return this exact JSON:
{
  "fitScore": 0,
  "selectionProbability": 0,
  "tier": "strong|explore|stretch",
  "fitReasons": ["reason1", "reason2"],
  "gapFlags": ["gap1"],
  "competitionSignal": "high|medium|low",
  "whyApplyNow": "one line reason to apply urgently or not"
}

Scoring rules:
- fitScore: 0-100, how well the role matches what the candidate WANTS
- selectionProbability: 0-100, realistic chance of getting an interview given their background
- strong tier: both scores above 70
- explore tier: either score 50-70
- stretch tier: high fit but selection probability below 50
- Be honest about gaps, do not inflate scores`;
}
