'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobCard } from '@/components/JobCard';
import type { ScoredJob, Company } from '@/lib/types';

type Tab = 'matches' | 'companies';

const stageLabels: Record<string, string> = {
  seed: 'Seed', series_a: 'Series A', series_b: 'Series B',
  series_c: 'Series C', growth: 'Growth', mnc: 'MNC', any: 'All stages',
};

const stageColors: Record<string, string> = {
  seed: 'bg-purple-50 text-purple-700',
  series_a: 'bg-blue-50 text-blue-700',
  series_b: 'bg-cyan-50 text-cyan-700',
  series_c: 'bg-teal-50 text-teal-700',
  growth: 'bg-green-50 text-green-700',
  mnc: 'bg-slate-100 text-slate-700',
};

export default function ResultsPage() {
  const router = useRouter();
  const [scoredJobs, setScoredJobs] = useState<ScoredJob[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tab, setTab] = useState<Tab>('matches');
  const [showAll, setShowAll] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  useEffect(() => {
    const jobsStr = sessionStorage.getItem('scoredJobs');
    const companiesStr = sessionStorage.getItem('companies');
    if (!jobsStr) { router.replace('/'); return; }
    setScoredJobs(JSON.parse(jobsStr));
    if (companiesStr) setCompanies(JSON.parse(companiesStr));
  }, [router]);

  const topJobs = scoredJobs.slice(0, 5);
  const extraJobs = scoredJobs.slice(5);

  function getJobsForCompany(companyName: string) {
    return scoredJobs.filter(
      (j) => j.company.toLowerCase() === companyName.toLowerCase()
    );
  }

  const tierConfig = {
    strong: 'bg-green-100 text-green-800',
    explore: 'bg-yellow-100 text-yellow-800',
    stretch: 'bg-orange-100 text-orange-800',
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-lg">JobRight</span>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {scoredJobs.length} jobs scored
            </span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Start over
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Your job universe</h1>
          <p className="text-slate-400 mt-1">
            {companies.length} companies scanned · {scoredJobs.length} jobs ranked
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-8 w-fit">
          <button
            onClick={() => setTab('matches')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'matches'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Top Matches
          </button>
          <button
            onClick={() => setTab('companies')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === 'companies'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Browse Companies ({companies.length})
          </button>
        </div>

        {/* Tab: Top Matches */}
        {tab === 'matches' && (
          <>
            {scoredJobs.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-lg mb-2">No jobs found</p>
                <p className="text-sm mb-4">Try adjusting your preferences or try again later.</p>
                <button onClick={() => router.push('/')} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium">
                  Start over
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {topJobs.map((job, i) => <JobCard key={job.id} job={job} rank={i + 1} />)}
                </div>

                {extraJobs.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowAll((v) => !v)}
                      className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-semibold mb-4 transition-colors"
                    >
                      <svg className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Worth Exploring ({extraJobs.length} more)
                    </button>
                    {showAll && (
                      <div className="space-y-4">
                        {extraJobs.map((job) => <JobCard key={job.id} job={job} />)}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Tab: Companies */}
        {tab === 'companies' && (
          <div className="space-y-3">
            {companies.length === 0 ? (
              <p className="text-slate-400 text-sm py-8">No company data available.</p>
            ) : (
              companies.map((company) => {
                const companyJobs = getJobsForCompany(company.name);
                const isExpanded = expandedCompany === company.name;

                return (
                  <div key={company.name} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    {/* Company header — always visible */}
                    <button
                      onClick={() => setExpandedCompany(isExpanded ? null : company.name)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                    >
                      {/* Logo placeholder */}
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0 font-bold text-slate-500 text-sm">
                        {company.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800">{company.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColors[company.stage] || 'bg-slate-100 text-slate-600'}`}>
                            {stageLabels[company.stage] || company.stage}
                          </span>
                          {companyJobs.length > 0 && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                              {companyJobs.length} {companyJobs.length === 1 ? 'job' : 'jobs'} found
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{company.industry}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{company.whyRelevant}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <a
                          href={company.careersUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-500 hover:text-blue-700 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Careers page ↗
                        </a>
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Jobs for this company — only shown when expanded */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 px-5 py-4 bg-slate-50">
                        {companyJobs.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-sm text-slate-400 mb-3">No specific job listings scraped from this company.</p>
                            <a
                              href={company.careersUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl transition-colors"
                            >
                              Browse open roles on their careers page ↗
                            </a>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {companyJobs.map((job) => (
                              <div key={job.id} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <p className="font-semibold text-slate-800 text-sm">{job.title}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierConfig[job.tier]}`}>
                                      {job.tier === 'strong' ? 'Strong match' : job.tier === 'explore' ? 'Explore' : 'Stretch'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400">{job.location}</p>
                                  <div className="flex gap-3 mt-1">
                                    <span className="text-xs text-slate-500">Fit: <strong>{job.fitScore}</strong></span>
                                    <span className="text-xs text-slate-500">Selection: <strong>{job.selectionProbability}%</strong></span>
                                  </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => router.push(`/job/${job.id}`)}
                                    className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                                  >
                                    Details
                                  </button>
                                  <a
                                    href={job.careersUrl || job.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs px-3 py-1.5 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
                                  >
                                    Apply →
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </main>
  );
}
