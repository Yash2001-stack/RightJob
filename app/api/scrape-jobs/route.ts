import { NextRequest, NextResponse } from 'next/server';
import { saveRawJobs } from '@/lib/firebase';
import type { Company, RawJob } from '@/lib/types';

// Playwright scrapers only work where Chromium is installed (local dev, Railway, etc.)
// On Vercel serverless they are unavailable — handled gracefully below
async function loadScrapers() {
  try {
    const [gh, lv, wd, cu] = await Promise.all([
      import('@/lib/scrapers/greenhouse'),
      import('@/lib/scrapers/lever'),
      import('@/lib/scrapers/workday'),
      import('@/lib/scrapers/custom'),
    ]);
    return {
      scrapeGreenhouse: gh.scrapeGreenhouse,
      scrapeLever: lv.scrapeLever,
      scrapeWorkday: wd.scrapeWorkday,
      scrapeCustom: cu.scrapeCustom,
    };
  } catch {
    return null;
  }
}

function deduplicateJobs(jobs: RawJob[]): RawJob[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getCompanyKey(company: Company): string {
  return company.name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getAtsSlug(company: Company): string {
  try {
    const url = new URL(company.atsUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[0] || company.name.toLowerCase().replace(/\s+/g, '');
  } catch {
    return company.name.toLowerCase().replace(/\s+/g, '');
  }
}

async function scrapeCompany(
  company: Company,
  scrapers: Awaited<ReturnType<typeof loadScrapers>>
): Promise<RawJob[]> {
  if (!scrapers) return [];

  const slug = getAtsSlug(company);
  let jobs: RawJob[] = [];

  switch (company.atsPlatform) {
    case 'greenhouse':
      jobs = await scrapers.scrapeGreenhouse(slug, company.name);
      break;
    case 'lever':
      jobs = await scrapers.scrapeLever(slug, company.name);
      break;
    case 'workday':
      jobs = await scrapers.scrapeWorkday(company.atsUrl, company.name);
      break;
    case 'custom':
    default:
      jobs = await scrapers.scrapeCustom(getCompanyKey(company), company.name, company.atsUrl);
      break;
  }

  // Attach careers page URL as reliable fallback for apply links
  return jobs.map((job) => ({
    ...job,
    careersUrl: company.careersUrl || company.atsUrl,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, companies } = body as {
      sessionId: string;
      companies: Company[];
    };

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }
    if (!companies || !Array.isArray(companies)) {
      return NextResponse.json({ error: 'companies array is required' }, { status: 400 });
    }

    const scrapers = await loadScrapers();
    const scrapingAvailable = scrapers !== null;

    const results = await Promise.allSettled(
      companies.map((company) => scrapeCompany(company, scrapers))
    );

    const allJobs: RawJob[] = [];
    const scrapeStatus: { company: string; status: string; count: number }[] = [];

    results.forEach((result, index) => {
      const company = companies[index];
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
        scrapeStatus.push({ company: company.name, status: 'success', count: result.value.length });
      } else {
        console.error(`Scrape failed for ${company.name}:`, result.reason);
        scrapeStatus.push({ company: company.name, status: 'failed', count: 0 });
      }
    });

    const uniqueJobs = deduplicateJobs(allJobs);
    await saveRawJobs(sessionId, uniqueJobs);

    return NextResponse.json({
      total: uniqueJobs.length,
      jobs: uniqueJobs,
      scrapeStatus,
      scrapingAvailable,
    });
  } catch (error) {
    console.error('Error scraping jobs:', error);
    return NextResponse.json({ error: 'Failed to scrape jobs' }, { status: 500 });
  }
}
