export interface BaseProfile {
  name: string;
  email: string;
  currentTitle: string;
  totalExperienceYears: number;
  skills: string[];
  industriesWorkedIn: string[];
  companies: { name: string; stage: string; size: string }[];
  education: string;
  careerTrajectory: 'ascending' | 'lateral' | 'pivot';
  impliedSkills: string[];
  resumeQualitySignal: 'outcome-oriented' | 'responsibility-listed';
}

export interface IntentProfile {
  baseProfile: BaseProfile;
  targetRoleType: 'step_up' | 'same' | 'pivot';
  targetRoleTitles: string[];
  preferredIndustries: string[];
  avoidedIndustries: string[];
  companyStage: string[];
  location: string;
  salaryFloor: number;
  dealBreakers: string[];
  energisedBy: string;
  impliedStrengths: string[];
}

export interface Company {
  name: string;
  stage: string;
  industry: string;
  careersUrl: string;
  atsPlatform: 'greenhouse' | 'lever' | 'workday' | 'custom';
  atsUrl: string;
  whyRelevant: string;
  logoUrl?: string;
}

export interface RawJob {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
  jdText: string;
  applyUrl: string;
  careersUrl: string;  // Company's main careers page — always reliable
  source: string;
}

export interface ScoredJob extends RawJob {
  fitScore: number;
  selectionProbability: number;
  tier: 'strong' | 'explore' | 'stretch';
  fitReasons: string[];
  gapFlags: string[];
  competitionSignal: 'high' | 'medium' | 'low';
  whyApplyNow: string;
}

export interface CvTweak {
  section: string;
  original: string;
  suggested: string;
  reason: string;
  type: 'reframe' | 'emphasis' | 'gap_bridge';
}

export interface AttachmentRecommendation {
  type: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  actionLabel: string;
}

export interface JobDetail {
  job: ScoredJob;
  cvTweaks: CvTweak[];
  attachmentRecommendations: AttachmentRecommendation[];
  coverLetter: string;
}

export interface SessionData {
  sessionId: string;
  baseProfile?: BaseProfile;
  intentProfile?: IntentProfile;
  companies?: Company[];
  rawJobs?: RawJob[];
  scoredJobs?: ScoredJob[];
  cvText?: string;
  createdAt?: number;
  usageCount?: number;
}
