'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { JobDetailView } from '@/components/JobDetailView';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getSessionId } from '@/lib/firebase';
import type { ScoredJob, JobDetail, IntentProfile } from '@/lib/types';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadJobDetail();
  }, [jobId]);

  async function loadJobDetail() {
    const sessionId = getSessionId();
    const scoredJobsStr = sessionStorage.getItem('scoredJobs');
    const intentProfileStr = sessionStorage.getItem('intentProfile');
    const cvText = sessionStorage.getItem('cvText');

    if (!scoredJobsStr || !intentProfileStr || !cvText) {
      router.replace('/');
      return;
    }

    const scoredJobs: ScoredJob[] = JSON.parse(scoredJobsStr);
    const job = scoredJobs.find((j) => j.id === jobId);

    if (!job) {
      setError('Job not found');
      setLoading(false);
      return;
    }

    const intentProfile: IntentProfile = JSON.parse(intentProfileStr);

    try {
      const res = await fetch('/api/job-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, job, cvText, intentProfile }),
      });

      if (!res.ok) throw new Error('Failed to load job details');

      const data = await res.json();
      setJobDetail(data.jobDetail);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load job details'
      );
    } finally {
      setLoading(false);
    }
  }

  const job = jobDetail?.job;

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-10 pb-24">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to results
      </button>

      {loading && (
        <div className="flex flex-col items-center py-20">
          <LoadingSpinner size="lg" text="Preparing your application strategy..." />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-700">
          {error}
        </div>
      )}

      {jobDetail && job && (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">{job.title}</h1>
            <p className="text-lg text-slate-600 mt-1">{job.company}</p>
            <p className="text-sm text-slate-400 mt-1">
              {job.location} · {job.postedDate}
            </p>

            {/* Score badges */}
            <div className="flex gap-3 mt-4">
              <div className="bg-slate-100 rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-slate-400">Fit</p>
                <p className="text-xl font-bold text-slate-800">{job.fitScore}</p>
              </div>
              <div className="bg-slate-100 rounded-xl px-4 py-2 text-center">
                <p className="text-xs text-slate-400">Selection chance</p>
                <p className="text-xl font-bold text-slate-800">
                  {job.selectionProbability}%
                </p>
              </div>
            </div>
          </div>

          <JobDetailView jobDetail={jobDetail} />
        </>
      )}

      {/* Sticky apply button */}
      {job && (
        <div className="fixed bottom-6 right-6">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 text-white rounded-2xl font-medium shadow-lg hover:bg-slate-700 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Apply Now →
          </a>
        </div>
      )}
    </main>
  );
}
