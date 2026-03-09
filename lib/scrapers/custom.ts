import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import type { RawJob } from '../types';
import { scrapeLever } from './lever';

const DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface CustomScrapeConfig {
  url: string;
  jobLinkSelector: string;
  titleSelector: string;
  locationSelector?: string;
  jdSelector: string;
  useLever?: boolean;
  leverSlug?: string;
}

const CUSTOM_CONFIGS: Record<string, CustomScrapeConfig> = {
  zepto: {
    url: 'https://www.zeptonow.com/careers',
    jobLinkSelector: 'a[href*="career"], a[href*="job"]',
    titleSelector: 'h1, h2, .job-title',
    jdSelector: '.job-description, main, article',
  },
  meesho: {
    url: 'https://meesho.io/jobs',
    jobLinkSelector: 'a[href*="job"], a[href*="career"]',
    titleSelector: 'h1, h2',
    jdSelector: '.job-description, main',
  },
  ather: {
    url: 'https://www.atherenergy.com/careers',
    jobLinkSelector: 'a[href*="career"], a[href*="job"], a[href*="position"]',
    titleSelector: 'h1, h2, .position-title',
    jdSelector: '.job-description, .position-description, main',
  },
  sarvam: {
    url: 'https://www.sarvam.ai/careers',
    jobLinkSelector: 'a[href*="career"], a[href*="job"]',
    titleSelector: 'h1, h2',
    jdSelector: 'main, article, .job-description',
  },
  krutrim: {
    url: 'https://krutrim.com/careers',
    jobLinkSelector: 'a[href*="career"], a[href*="job"]',
    titleSelector: 'h1, h2',
    jdSelector: 'main, article',
  },
  cred: {
    url: 'https://careers.cred.club',
    jobLinkSelector: 'a[href*="job"], a[href*="position"]',
    titleSelector: 'h1, h2, .job-title',
    jdSelector: '.job-description, main',
  },
  slice: {
    url: 'https://www.sliceit.com/careers',
    jobLinkSelector: 'a[href*="career"], a[href*="job"]',
    titleSelector: 'h1, h2',
    jdSelector: 'main, article, .job-description',
  },
};

export async function scrapeCustom(
  companyKey: string,
  companyName: string,
  atsUrl?: string
): Promise<RawJob[]> {
  // Razorpay uses Lever
  if (companyKey === 'razorpay') {
    return scrapeLever('razorpay', companyName);
  }

  const config = CUSTOM_CONFIGS[companyKey.toLowerCase()];
  if (!config) {
    return scrapeGenericCareerPage(atsUrl || '', companyName);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    await page.goto(config.url, { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(DELAY_MS);

    const links = await page.$$eval(config.jobLinkSelector, (els) =>
      els
        .slice(0, 10)
        .map((el) => {
          const a = el as HTMLAnchorElement;
          return { href: a.href, text: a.textContent?.trim() || '' };
        })
        .filter((l) => l.href && l.href.startsWith('http'))
    );

    const jobs: RawJob[] = [];

    for (const link of links) {
      try {
        const jobPage = await context.newPage();
        await jobPage.goto(link.href, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });
        await sleep(DELAY_MS);

        const title = await jobPage
          .$eval(config.titleSelector, (el) => el.textContent?.trim() || '')
          .catch(() => link.text);

        const jdText = await jobPage
          .$eval(config.jdSelector, (el) => el.textContent?.trim() || '')
          .catch(() => '');

        if (!title || !jdText) {
          await jobPage.close();
          continue;
        }

        jobs.push({
          id: uuidv4(),
          title,
          company: companyName,
          location: 'India',
          postedDate: new Date().toISOString().split('T')[0],
          jdText: jdText.slice(0, 5000),
          applyUrl: link.href,
          source: 'custom',
        });

        await jobPage.close();
      } catch {
        // Skip
      }
    }

    await browser.close();
    return jobs;
  } catch {
    await browser.close();
    return [];
  }
}

async function scrapeGenericCareerPage(
  url: string,
  companyName: string
): Promise<RawJob[]> {
  if (!url) return [];

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await sleep(DELAY_MS);

    // Extract all job-like links
    const links = await page.$$eval('a', (els) =>
      els
        .filter((a) => {
          const href = (a as HTMLAnchorElement).href;
          const text = a.textContent?.toLowerCase() || '';
          return (
            href &&
            href.startsWith('http') &&
            (href.includes('job') ||
              href.includes('career') ||
              href.includes('position') ||
              href.includes('role')) &&
            text.length > 5
          );
        })
        .slice(0, 10)
        .map((a) => ({
          href: (a as HTMLAnchorElement).href,
          text: a.textContent?.trim() || '',
        }))
    );

    const jobs: RawJob[] = [];

    for (const link of links) {
      try {
        const jobPage = await context.newPage();
        await jobPage.goto(link.href, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });
        await sleep(DELAY_MS);

        const bodyText = await jobPage
          .$eval('body', (el) => el.textContent?.trim() || '')
          .catch(() => '');

        if (!bodyText || bodyText.length < 200) {
          await jobPage.close();
          continue;
        }

        jobs.push({
          id: uuidv4(),
          title: link.text,
          company: companyName,
          location: 'India',
          postedDate: new Date().toISOString().split('T')[0],
          jdText: bodyText.slice(0, 5000),
          applyUrl: link.href,
          source: 'custom',
        });

        await jobPage.close();
      } catch {
        // Skip
      }
    }

    await browser.close();
    return jobs;
  } catch {
    await browser.close();
    return [];
  }
}
