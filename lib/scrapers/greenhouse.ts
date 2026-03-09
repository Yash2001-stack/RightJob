import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import type { RawJob } from '../types';

const DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeGreenhouse(
  companySlug: string,
  companyName: string
): Promise<RawJob[]> {
  const urls = [
    `https://boards.greenhouse.io/${companySlug}`,
    `https://boards.eu.greenhouse.io/${companySlug}`,
  ];

  for (const boardUrl of urls) {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      const page = await context.newPage();

      await page.goto(boardUrl, { waitUntil: 'networkidle', timeout: 20000 });
      await sleep(DELAY_MS);

      // Check if page has job listings
      const hasJobs = await page.$('.opening');
      if (!hasJobs) {
        await browser.close();
        continue;
      }

      const jobLinks = await page.$$eval('.opening a', (links) =>
        links.map((a) => ({
          href: (a as HTMLAnchorElement).href,
          title: a.textContent?.trim() || '',
        }))
      );

      const jobs: RawJob[] = [];

      for (const link of jobLinks.slice(0, 10)) {
        try {
          const jobPage = await context.newPage();
          await jobPage.goto(link.href, {
            waitUntil: 'networkidle',
            timeout: 15000,
          });
          await sleep(DELAY_MS);

          const location = await jobPage
            .$eval('.location', (el) => el.textContent?.trim() || '')
            .catch(() => 'India');

          const jdText = await jobPage
            .$eval('#content', (el) => el.textContent?.trim() || '')
            .catch(async () => {
              return (
                (await jobPage
                  .$eval('.job-post', (el) => el.textContent?.trim() || '')
                  .catch(() => '')) || ''
              );
            });

          jobs.push({
            id: uuidv4(),
            title: link.title,
            company: companyName,
            location,
            postedDate: new Date().toISOString().split('T')[0],
            jdText: jdText.slice(0, 5000),
            applyUrl: link.href,
            source: 'greenhouse',
          });

          await jobPage.close();
        } catch {
          // Skip failed job pages
        }
      }

      await browser.close();
      return jobs;
    } catch {
      await browser.close();
    }
  }

  return [];
}
