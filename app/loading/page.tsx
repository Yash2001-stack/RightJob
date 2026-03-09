'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyCard } from '@/components/CompanyCard';
import { getSessionId } from '@/lib/firebase';
import type { Company, IntentProfile } from '@/lib/types';

type Phase = 'companies' | 'scraping' | 'scoring';

interface CompanyStatus {
  company: Company;
  status: 'pending' | 'done' | 'failed';
}

export default function LoadingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyStatuses, setCompanyStatuses] = useState<CompanyStatus[]>([]);
  const [error, setError] = useState('');
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    run();
  }, []);

  async function run() {
    const sessionId = getSessionId();
    const intentProfileStr = sessionStorage.getItem('intentProfile');
    const cvText = sessionStorage.getItem('cvText');

    if (!intentProfileStr || !cvText) {
      router.replace('/');
      return;
    }

    const intentProfile: IntentProfile = JSON.parse(intentProfileStr);

    try {
      // Phase 1: Generate companies
      setPhase('companies');
      const companiesRes = await fetch('/api/generate-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, intentProfile }),
      });

      if (!companiesRes.ok) throw new Error('Failed to generate companies');
      const companiesData = await companiesRes.json();
      const fetchedCompanies: Company[] = companiesData.companies;

      // Animate companies appearing
      for (let i = 0; i < fetchedCompanies.length; i++) {
        await new Promise((r) => setTimeout(r, 100));
        setCompanies((prev) => [...prev, fetchedCompanies[i]]);
      }

      // Phase 2: Scraping
      setPhase('scraping');
      const statuses: CompanyStatus[] = fetchedCompanies.map((c) => ({
        company: c,
        status: 'pending',
      }));
      setCompanyStatuses(statuses);

      const scrapeRes = await fetch('/api/scrape-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, companies: fetchedCompanies }),
      });

      if (!scrapeRes.ok) throw new Error('Failed to scrape jobs');
      const scrapeData = await scrapeRes.json();

      // Update scrape statuses
      const scrapeStatusMap: Record<string, 'done' | 'failed'> = {};
      (scrapeData.scrapeStatus || []).forEach(
        (s: { company: string; status: string }) => {
          scrapeStatusMap[s.company] = s.status === 'success' ? 'done' : 'failed';
        }
      );

      setCompanyStatuses(
        fetchedCompanies.map((c) => ({
          company: c,
          status: scrapeStatusMap[c.name] || 'done',
        }))
      );

      // Phase 3: Scoring
      setPhase('scoring');
      const scoreRes = await fetch('/api/score-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          intentProfile,
          jobs: scrapeData.jobs,
        }),
      });

      if (!scoreRes.ok) throw new Error('Failed to score jobs');
      const scoreData = await scoreRes.json();

      sessionStorage.setItem('scoredJobs', JSON.stringify(scoreData.scoredJobs));
      // Also persist companies so results page can show the company browser
      sessionStorage.setItem('companies', JSON.stringify(fetchedCompanies));

      router.push('/results');
    } catch (err) {
      console.error('Loading error:', err);
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  }

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          {phase === 'companies' && 'Finding companies in your space...'}
          {phase === 'scraping' && 'Scanning career pages...'}
          {phase === 'scoring' && 'Ranking your matches...'}
        </h1>
        <p className="text-slate-400">
          {phase === 'companies' && 'Building your personalised company universe'}
          {phase === 'scraping' && 'Checking live job listings across career pages'}
          {phase === 'scoring' && 'Scoring each job against your profile'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-red-600 underline mt-2"
          >
            Start over
          </button>
        </div>
      )}

      {phase === 'companies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {companies.map((c, i) => (
            <CompanyCard key={c.name} company={c} isNew />
          ))}
          {companies.length === 0 && (
            <div className="col-span-2 flex items-center gap-3 text-slate-400 py-8">
              <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin flex-shrink-0" />
              Generating your company universe...
            </div>
          )}
        </div>
      )}

      {phase === 'scraping' && (
        <div className="space-y-2">
          {companyStatuses.map((cs) => (
            <div
              key={cs.company.name}
              className="flex items-center gap-3 py-2 border-b border-slate-50"
            >
              <span
                className={`text-sm ${
                  cs.status === 'done'
                    ? 'text-green-500'
                    : cs.status === 'failed'
                    ? 'text-red-400'
                    : 'text-slate-300'
                }`}
              >
                {cs.status === 'done' ? '✓' : cs.status === 'failed' ? '✗' : '·'}
              </span>
              <span
                className={`text-sm ${
                  cs.status === 'done' ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {cs.company.name}
              </span>
              {cs.status === 'pending' && (
                <div className="w-3 h-3 border border-slate-200 border-t-blue-400 rounded-full animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      )}

      {phase === 'scoring' && (
        <div className="flex items-center gap-4 py-8 text-slate-500">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin flex-shrink-0" />
          Analysing each job against your profile...
        </div>
      )}
    </main>
  );
}
