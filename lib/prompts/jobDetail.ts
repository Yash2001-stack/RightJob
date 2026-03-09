import type { IntentProfile, ScoredJob } from '../types';

export function buildJobDetailPrompt(
  cvText: string,
  intentProfile: IntentProfile,
  job: ScoredJob
): string {
  return `You are a senior career coach helping a candidate prepare the strongest possible application for this specific role. Return ONLY valid JSON, no preamble.

Candidate CV Text:
${cvText.slice(0, 4000)}

Intent Profile:
${JSON.stringify(intentProfile, null, 2)}

Job Details:
Title: ${job.title}
Company: ${job.company}
JD Text: ${job.jdText.slice(0, 3000)}

Return this exact JSON:
{
  "cvTweaks": [
    {
      "section": "summary|experience|skills",
      "original": "exact text from their CV",
      "suggested": "improved version",
      "reason": "why this change helps for this specific role",
      "type": "reframe|emphasis|gap_bridge"
    }
  ],
  "attachmentRecommendations": [
    {
      "type": "cover_letter|portfolio|case_study|linkedin",
      "priority": "high|medium|low",
      "reasoning": "why this matters for this specific role",
      "actionLabel": "what to do specifically"
    }
  ],
  "coverLetter": "full cover letter text personalised to this role and company, 3 paragraphs, professional but not generic"
}

Rules:
- CV tweaks must reference actual text from their CV, not generic advice
- Cover letter must mention the company by name and reference something specific about them
- Maximum 4 CV tweaks, prioritise highest impact changes
- Cover letter should open with their strongest relevant experience`;
}
