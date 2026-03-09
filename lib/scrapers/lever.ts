import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import type { RawJob } from '../types';

const DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeLever(
  companySlug: string,
  companyName: string
): Promise<RawJob[]> {
  const boardUrl = `https://jobs.lever.co/${companySlug}`;

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    await page.goto(boardUrl, { waitUntil: 'networkidle', timeout: 20000 });

    // Lever is React-rendered, wait for postings
    await page
      .waitForSelector('.posting', { timeout: 10000 })
      .catch(() => null);
    await sleep(DELAY_MS);

    const jobLinks = await page.$$eval('.posting', (postings) =>
      postings.slice(0, 10).map((posting) => {
        const a = posting.querySelector('a.posting-title') as HTMLAnchorElement;
        const locationEl = posting.querySelector('.sort-by-location');
        const teamEl = posting.querySelector('.sort-by-team');
        return {
          href: a?.href || '',
          title: a?.querySelector('h5')?.textContent?.trim() || '',
          location:
            locationEl?.textContent?.trim() || teamEl?.textContent?.trim() || 'India',
        };
      })
    );

    const jobs: RawJob[] = [];

    for (const link of jobLinks) {
      if (!link.href) continue;
      try {
        const jobPage = await context.newPage();
        await jobPage.goto(link.href, {
          waitUntil: 'networkidle',
          timeout: 15000,
        });
        await sleep(DELAY_MS);

        const jdText = await jobPage
          .$eval('.content', (el) => el.textContent?.trim() || '')
          .catch(async () => {
            return (
              (await jobPage
                .$eval('[data-qa="job-description"]', (el) =>
                  el.textContent?.trim() || ''
                )
                .catch(() => '')) || ''
            );
          });

        jobs.push({
          id: uuidv4(),
          title: link.title,
          company: companyName,
          location: link.location,
          postedDate: new Date().toISOString().split('T')[0],
          jdText: jdText.slice(0, 5000),
          applyUrl: link.href,
          source: 'lever',
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
