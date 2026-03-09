'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CVUpload } from '@/components/CVUpload';
import { getSessionId } from '@/lib/firebase';

export default function LandingPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  function handleUploadSuccess(baseProfile: unknown, cvText: string) {
    sessionStorage.setItem('baseProfile', JSON.stringify(baseProfile));
    sessionStorage.setItem('cvText', cvText);
    router.push('/onboarding');
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-slate-800 text-xl tracking-tight">JobRight</span>
          <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
            Built for India 🇮🇳
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-blue-100">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            AI-powered · Free to use
          </div>

          <h1 className="text-6xl font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-6">
            Find the 5 jobs<br />
            <span className="text-blue-500">you&apos;ll actually get.</span>
          </h1>

          <p className="text-xl text-slate-500 mb-12 leading-relaxed">
            Upload your CV. Answer 7 questions. We scan 20+ company career pages,
            score every role against your profile, and hand you the ones worth your time.
          </p>

          {/* Upload zone */}
          {sessionId && (
            <CVUpload onUploadSuccess={handleUploadSuccess} sessionId={sessionId} />
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-10">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload your CV',
                desc: 'PDF or DOCX. We extract your experience, skills, and trajectory automatically.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                step: '02',
                title: 'Answer 7 questions',
                desc: 'Tell us what you want: direction, industries, location, salary, deal-breakers.',
                color: 'bg-purple-50 text-purple-600',
              },
              {
                step: '03',
                title: 'Get your top 5',
                desc: 'We scan real career pages, score every job, and surface the ones you can actually win.',
                color: 'bg-green-50 text-green-600',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${item.color}`}>
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 mb-1">{item.title}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm font-bold text-slate-400">JobRight</span>
          <span className="text-xs text-slate-300">Your data stays in your session. Nothing is stored without your CV.</span>
        </div>
      </footer>
    </div>
  );
}
