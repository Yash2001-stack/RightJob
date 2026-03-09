import type { BaseProfile } from '../types';

export function buildIntentProfilePrompt(
  baseProfile: BaseProfile,
  answers: string[]
): string {
  const baseProfileJson = JSON.stringify(baseProfile, null, 2);

  return `You are a senior career advisor. Build a structured intent profile combining this candidate's CV data with their explicit onboarding answers. Return ONLY valid JSON, no preamble.

IMPORTANT: The onboarding answers below come from structured multiple-choice selections, not free text. Treat them as exact values — do not reinterpret or generalise them.

Base Profile (from CV):
${baseProfileJson}

Onboarding Answers (structured selections):
Q1 (career direction): ${answers[0] || ''}
Q2 (preferred industries — exact selections): ${answers[1] || ''}
Q3 (company stage preference): ${answers[2] || ''}
Q4 (location — selected cities): ${answers[3] || ''}
Q5 (minimum salary in LPA): ${answers[4] || ''}
Q6 (deal breakers): ${answers[5] || ''}
Q7 (what energises them): ${answers[6] || ''}

RULES FOR preferredIndustries:
- Copy the EXACT industry names from Q2 into preferredIndustries array — do not paraphrase
- If Q2 contains "Manufacturing and Industrial Engineering", that must appear verbatim in preferredIndustries
- Do NOT add industries not mentioned in Q2 unless they are strongly implied by the CV AND absent from Q2
- avoidedIndustries should only be populated if Q2 explicitly excluded something or Q6 mentions it

RULES FOR companyStage:
- Extract directly from Q3 selections

RULES FOR targetRoleTitles:
- Generate 3-5 specific job titles this person should apply for based on their CV + Q1 direction
- Be specific: "Automation Engineer", "Manufacturing Process Engineer", not just "Engineer"
- Match to their actual experience level

Return this exact JSON:
{
  "baseProfile": ${baseProfileJson},
  "targetRoleType": "step_up|same|pivot",
  "targetRoleTitles": [],
  "preferredIndustries": [],
  "avoidedIndustries": [],
  "companyStage": [],
  "location": "",
  "salaryFloor": 0,
  "dealBreakers": [],
  "energisedBy": "",
  "impliedStrengths": []
}`;
}
