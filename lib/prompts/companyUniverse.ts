import type { IntentProfile } from '../types';

export function buildCompanyUniversePrompt(intentProfile: IntentProfile): string {
  const preferredIndustries = intentProfile.preferredIndustries.join(', ');
  const avoidedIndustries = intentProfile.avoidedIndustries.join(', ');
  const location = intentProfile.location;
  const companyStage = intentProfile.companyStage.join(', ');
  const targetRoles = intentProfile.targetRoleTitles.join(', ');

  return `You are an expert on the Indian job market with deep knowledge of which companies hire for specific roles and industries.

Your task: Generate 20-25 companies for this specific candidate. Your output determines their entire job search — get the industry matching right.

CANDIDATE SUMMARY:
- Current title: ${intentProfile.baseProfile.currentTitle}
- Experience: ${intentProfile.baseProfile.totalExperienceYears} years
- Industries worked in: ${intentProfile.baseProfile.industriesWorkedIn.join(', ')}
- Skills: ${intentProfile.baseProfile.skills.slice(0, 10).join(', ')}
- Target roles: ${targetRoles}
- Preferred industries: ${preferredIndustries}
- Avoided industries: ${avoidedIndustries || 'none specified'}
- Company stage preference: ${companyStage}
- Location: ${location}

RULE 1 — INDUSTRY MATCH IS MANDATORY:
You MUST ONLY suggest companies from the candidate's preferred industries listed above.
Do NOT suggest companies from other industries just because they are well-known Indian startups.
If preferred industries include Manufacturing/Engineering/Automation, suggest companies like Siemens India, ABB India, L&T Technology Services, Tata Technologies, KPIT, Bosch India, Honeywell India, Rockwell Automation India, Schneider Electric India, Emerson India, Mahindra Tech, Thermax, GreyOrange, Addverb, Zetwerk, John Deere India, Caterpillar India, 3M India — NOT fintech/e-commerce companies.
If preferred industries include Fintech, suggest Razorpay, PhonePe, CRED, BharatPe, Cashfree, Slice — NOT manufacturing companies.
If preferred industries include Consumer Tech, suggest Flipkart, Meesho, Zepto, Swiggy, Blinkit, Ola — NOT industrial companies.

RULE 2 — ROLE MATCH:
Only include companies that actually hire for roles similar to: ${targetRoles}
A fintech company does not need an industrial automation engineer. Match role + industry together.

RULE 3 — REAL CAREERS PAGES ONLY:
Every company must have a real, currently active careers page that loads without login.
For MNCs use their India-specific jobs page where it exists.
careersUrl = the main careers/jobs page of the company (always reliable)
atsUrl = the direct job listings URL (Greenhouse board, Lever board, Workday search page, or same as careersUrl for custom pages)

RULE 4 — ATS URL MUST BE STABLE:
Use these stable URL patterns:
- Greenhouse: https://boards.greenhouse.io/COMPANYSLUG
- Lever: https://jobs.lever.co/COMPANYSLUG
- Workday: https://COMPANY.wd1.myworkdayjobs.com/en-US/COMPANY_Careers
- For custom pages: use the direct careers listing page (not a specific job post URL which goes stale)
Do NOT use specific job post URLs with numeric IDs — those expire.

RULE 5 — STAGE MIX within the candidate's industries:
Include a realistic mix matching their preference: ${companyStage}
For industrial/manufacturing sector: include large MNCs (Siemens, ABB, Bosch), growth companies (L&T Tech, KPIT, Tata Tech), and funded startups (GreyOrange, Addverb, Zetwerk) in the right proportion.

INDUSTRY → COMPANY REFERENCE (use this as your lookup, pick from here first):

Manufacturing / Industrial Engineering:
MNCs: Siemens India, ABB India, Honeywell India, Bosch India, Rockwell Automation, Schneider Electric, Emerson India, GE India, 3M India, Parker Hannifin, Eaton India, Atlas Copco India
Large Indian: L&T Technology Services, Tata Technologies, KPIT Technologies, Mahindra CIE, Thermax, Kirloskar Electric, Godrej & Boyce, Larsen & Toubro
Growth/Startups: Zetwerk, Delhivery, Shadowfax, ElectroMech

Automation / Robotics / IoT:
MNCs: Fanuc India, Beckhoff Automation, Omron India, Mitsubishi Electric India, B&R Industrial Automation, Yaskawa India, Kuka India
Indian: GreyOrange, Addverb Technologies, Systemantics, Hi-Tech Robotic Systemz, Sastra Robotics, Gridbots

Automotive / Mobility:
MNCs: Bosch India (automotive), Continental India, Valeo India, ZF India, Aptiv India, Marelli India
Indian: Tata Motors, Mahindra, Bajaj Auto, TVS Motor, Minda Industries, Endurance Technologies, KPIT Technologies, Sasken Technologies

EV / Clean Energy:
Indian: Ather Energy, Ola Electric, Revolt Motors, Greaves Electric, Euler Motors, Log9 Materials, Statiq, Exponent Energy, Servotech
MNCs: BorgWarner India, Vitesco Technologies India

Aerospace / Defence:
Indian: Tata Advanced Systems, Hindustan Aeronautics (HAL — limited), Larsen & Toubro Aerospace, Safran India, MTAR Technologies, Data Patterns, Ideaforge
MNCs: Boeing India, Airbus India, Honeywell Aerospace India, Collins Aerospace India

Semiconductor / Electronics / Hardware:
MNCs: Texas Instruments India, Qualcomm India, Intel India, NXP Semiconductors India, Analog Devices India, Renesas India, STMicroelectronics India
Indian: Tata Elxsi, HCL Hardware, Saankhya Labs, Sievert Larson, IdeaForge, Entuple Technologies

Supply Chain / Logistics:
Indian: Delhivery, Rivigo, Ecom Express, Shadowfax, BlackBuck, Shiprocket, Xpressbees, Mahindra Logistics, Blue Dart
MNCs: DHL India, FedEx India, Maersk India, DB Schenker India

Fintech / Payments:
Razorpay, PhonePe, CRED, BharatPe, Cashfree Payments, Slice, Pine Labs, Paytm, Open Financial, Setu, Decentro, Perfios

Consumer Tech / E-commerce:
Flipkart, Meesho, Zepto, Blinkit, Swiggy, Zomato, Nykaa, Myntra, Purplle, Udaan, Shadowfax

SaaS / B2B Software:
Zoho, Freshworks, Chargebee, Postman, Darwinbox, Leadsquared, Kapture CRM, Exotel, Sprinklr India, Saasfee

AI / Deep Tech:
Sarvam AI, Krutrim, Mad Street Den, Mihup, Arya AI, Agara Labs, Yellow AI, Uniphore, Crayon Data, Tricog Health

Now generate the JSON array. Return ONLY the JSON array, no explanation, no markdown fences.

For each company:
{
  "name": "exact company name",
  "stage": "seed|series_a|series_b|series_c|growth|mnc",
  "industry": "the specific industry this company operates in",
  "careersUrl": "https://... (company's main careers page — must be real and stable)",
  "atsPlatform": "greenhouse|lever|workday|custom",
  "atsUrl": "https://... (direct job listings URL — stable format only)",
  "whyRelevant": "one line: specific reason this company matches THIS candidate's background and target role"
}`;
}
