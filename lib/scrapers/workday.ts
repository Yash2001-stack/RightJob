import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import type { RawJob } from '../types';

const DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeWorkday(
  atsUrl: string,
  companyName: string
): Promise<RawJob[]> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    await page.goto(atsUrl, { timeout: 30000 });

    // Workday is JavaScript-heavy, wait for network idle
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    await sleep(DELAY_MS);

    // Try to find job listings - Workday has different selectors per tenant
    const jobListSelectors = [
      '[data-automation-id="jobTitle"]',
      '.job-title',
      'a[href*="/job/"]',
      '[class*="jobTitle"]',
    ];

    let jobElements: { href: string; title: string }[] = [];

    for (const selector of jobListSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        jobElements = await page.$$eval(selector, (els) =>
          els.slice(0, 10).map((el) => ({
            href: (el as HTMLAnchorElement).href || '',
            title: el.textContent?.trim() || '',
          }))
        );
        if (jobElements.length > 0) break;
      } catch {
        continue;
      }
    }

    const jobs: RawJob[] = [];

    for (const job of jobElements) {
      if (!job.href || !job.title) continue;
      try {
        const jobPage = await context.newPage();
        await jobPage.goto(job.href, { waitUntil: 'networkidle', timeout: 20000 });
        await sleep(DELAY_MS);

        const jdText = await jobPage
          .$eval('[data-automation-id="jobPostingDescription"]', (el) =>
            el.textContent?.trim() || ''
          )
          .catch(async () => {
            return (
              (await jobPage
                .$eval('.job-description', (el) =>
                  el.textContent?.trim() || ''
                )
                .catch(() => '')) || ''
            );
          });

        jobs.push({
          id: uuidv4(),
          title: job.title,
          company: companyName,
          location: 'India',
          postedDate: new Date().toISOString().split('T')[0],
          jdText: jdText.slice(0, 5000),
          applyUrl: job.href,
          source: 'workday',
        });

        await jobPage.close();
      } catch {
        // Skip failed pages
      }
    }

    await browser.close();
    return jobs;
  } catch {
    await browser.close();
    return [];
  }
}
