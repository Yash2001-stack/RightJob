export function buildCvParserPrompt(cvText: string): string {
  return `You are a CV parsing expert. Extract structured information from this CV text and return ONLY valid JSON matching this exact structure. No preamble, no explanation, just JSON.

CV Text:
${cvText}

Return this exact JSON structure:
{
  "name": "",
  "email": "",
  "currentTitle": "",
  "totalExperienceYears": 0,
  "skills": [],
  "industriesWorkedIn": [],
  "companies": [{"name": "", "stage": "", "size": ""}],
  "education": "",
  "careerTrajectory": "ascending|lateral|pivot",
  "impliedSkills": [],
  "resumeQualitySignal": "outcome-oriented|responsibility-listed"
}`;
}
