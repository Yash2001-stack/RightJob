'use client';

import type { Company } from '@/lib/types';

interface CompanyCardProps {
  company: Company;
  isNew?: boolean;
}

const stageLabels: Record<string, string> = {
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c: 'Series C',
  growth: 'Growth',
  mnc: 'MNC',
};

const stageColors: Record<string, string> = {
  seed: 'bg-purple-50 text-purple-700',
  series_a: 'bg-blue-50 text-blue-700',
  series_b: 'bg-cyan-50 text-cyan-700',
  series_c: 'bg-teal-50 text-teal-700',
  growth: 'bg-green-50 text-green-700',
  mnc: 'bg-slate-100 text-slate-700',
};

export function CompanyCard({ company, isNew }: CompanyCardProps) {
  return (
    <div
      className={`
        bg-white border border-slate-100 rounded-2xl p-4 shadow-sm
        ${isNew ? 'animate-fade-in' : ''}
        transition-shadow hover:shadow-md
      `}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold text-sm">
          {company.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800 text-sm">
              {company.name}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                stageColors[company.stage] || 'bg-slate-100 text-slate-600'
              }`}
            >
              {stageLabels[company.stage] || company.stage}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{company.industry}</p>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
            {company.whyRelevant}
          </p>
        </div>
      </div>
    </div>
  );
}
