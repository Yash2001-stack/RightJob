'use client';

import { useRouter } from 'next/navigation';
import type { ScoredJob } from '@/lib/types';

interface JobCardProps {
  job: ScoredJob;
  rank?: number;
}

const tierConfig = {
  strong: {
    label: 'Strong Match',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
  },
  explore: {
    label: 'Worth Exploring',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-500',
  },
  stretch: {
    label: 'Stretch',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    dot: 'bg-orange-500',
  },
};

const competitionLabels = {
  high: 'High competition',
  medium: 'Medium competition',
  low: 'Low competition',
};

export function JobCard({ job, rank }: JobCardProps) {
  const router = useRouter();
  const config = tierConfig[job.tier];

  return (
    <div
      className={`
        border rounded-2xl p-5 transition-all hover:shadow-md
        ${config.bg} ${config.border}
      `}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {rank && (
              <span className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {rank}
              </span>
            )}
            <h3 className="font-semibold text-slate-800">{job.title}</h3>
          </div>
          <p className="text-slate-600">{job.company}</p>
          <p className="text-sm text-slate-400 mt-0.5">
            {job.location} · {job.postedDate}
          </p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${config.badge}`}
        >
          {config.label}
        </span>
      </div>

      {/* Scores */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-white rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Fit score</p>
          <p className="text-2xl font-bold text-slate-800">{job.fitScore}</p>
          <p className="text-xs text-slate-400">/ 100</p>
        </div>
        <div className="flex-1 bg-white rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Selection chance</p>
          <p className="text-2xl font-bold text-slate-800">
            {job.selectionProbability}%
          </p>
          <p className="text-xs text-slate-400">interview</p>
        </div>
      </div>

      {/* Fit reasons */}
      {job.fitReasons.length > 0 && (
        <ul className="space-y-1 mb-3">
          {job.fitReasons.slice(0, 2).map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mt-1.5 flex-shrink-0`} />
              {reason}
            </li>
          ))}
        </ul>
      )}

      {/* Gap flag */}
      {job.gapFlags.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
          <p className="text-xs text-amber-700 font-medium">
            Gap: {job.gapFlags[0]}
          </p>
        </div>
      )}

      {/* Competition signal */}
      <p className="text-xs text-slate-400 mb-4">
        {competitionLabels[job.competitionSignal]}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/job/${job.id}`)}
          className="flex-1 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          View Details
        </button>
        <a
          href={job.careersUrl || job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors text-center"
        >
          Apply Now →
        </a>
      </div>
      {/* Show specific posting link only if it differs from careers page */}
      {job.applyUrl && job.careersUrl && job.applyUrl !== job.careersUrl && (
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 hover:text-blue-500 mt-1 block text-right transition-colors"
        >
          View specific posting ↗
        </a>
      )}
    </div>
  );
}
