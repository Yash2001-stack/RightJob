'use client';

import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import type { JobDetail, ScoredJob } from '@/lib/types';

interface JobDetailViewProps {
  jobDetail: JobDetail;
  onRegenerateDetail?: () => void;
}

const priorityConfig = {
  high: { label: 'High Priority', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  medium: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  low: { label: 'Optional', color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200' },
};

const attachmentIcons: Record<string, string> = {
  cover_letter: '📝',
  portfolio: '🎨',
  case_study: '📊',
  linkedin: '💼',
};

const tweakTypeConfig = {
  reframe: { label: 'Reframe', color: 'text-blue-600', bg: 'bg-blue-50' },
  emphasis: { label: 'Emphasis', color: 'text-purple-600', bg: 'bg-purple-50' },
  gap_bridge: { label: 'Gap Bridge', color: 'text-orange-600', bg: 'bg-orange-50' },
};

export function JobDetailView({ jobDetail }: JobDetailViewProps) {
  const [acceptedTweaks, setAcceptedTweaks] = useState<Set<number>>(new Set());
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState(jobDetail.coverLetter);
  const [copied, setCopied] = useState(false);

  function toggleTweak(idx: number) {
    setAcceptedTweaks((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-10">
      {/* Section 1: CV Tweaks */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Tweak Your CV</h2>
        <p className="text-slate-500 text-sm mb-5">
          Targeted changes to boost your match for this role.
        </p>

        {jobDetail.cvTweaks.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Your CV already looks well-aligned for this role.
          </p>
        ) : (
          <div className="space-y-4">
            {jobDetail.cvTweaks.map((tweak, i) => {
              const typeConf = tweakTypeConfig[tweak.type];
              const accepted = acceptedTweaks.has(i);

              return (
                <div
                  key={i}
                  className={`border rounded-2xl p-5 transition-all ${
                    accepted
                      ? 'border-green-200 bg-green-50'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConf.bg} ${typeConf.color}`}
                    >
                      {typeConf.label}
                    </span>
                    <span className="text-xs text-slate-400 capitalize">
                      {tweak.section}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs font-medium text-slate-400 mb-1.5">
                        CURRENT
                      </p>
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        {tweak.original}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-1.5">
                        SUGGESTED
                      </p>
                      <p className="text-sm text-slate-800 bg-green-50 rounded-xl p-3 border border-green-100">
                        {tweak.suggested}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-3">{tweak.reason}</p>

                  <button
                    onClick={() => toggleTweak(i)}
                    className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                      accepted
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    {accepted ? '✓ Accepted' : 'Accept'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 2: Attachments */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-2">What to Attach</h2>
        <p className="text-slate-500 text-sm mb-5">
          Prioritised recommendations for this specific role.
        </p>

        <div className="space-y-3">
          {jobDetail.attachmentRecommendations.map((rec, i) => {
            const conf = priorityConfig[rec.priority];
            return (
              <div
                key={i}
                className={`border rounded-2xl p-4 ${conf.bg}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {attachmentIcons[rec.type] || '📎'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-800 text-sm capitalize">
                        {rec.type.replace(/_/g, ' ')}
                      </p>
                      <span className={`text-xs font-medium ${conf.color}`}>
                        {conf.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{rec.reasoning}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      → {rec.actionLabel}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Cover Letter */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Cover Letter</h2>
        <p className="text-slate-500 text-sm mb-5">
          Personalised to this role and company.
        </p>

        {!showCoverLetter ? (
          <button
            onClick={() => setShowCoverLetter(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Generate Cover Letter
          </button>
        ) : (
          <div className="space-y-3">
            <textarea
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              rows={14}
              className="w-full border border-slate-200 rounded-2xl p-5 text-sm text-slate-700 leading-relaxed outline-none focus:border-blue-400 resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {copied ? (
                  <>✓ Copied!</>
                ) : (
                  <>
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy to clipboard
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
