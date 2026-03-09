'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/ChatInterface';
import { getSessionId } from '@/lib/firebase';
import type { BaseProfile } from '@/lib/types';

export default function OnboardingPage() {
  const router = useRouter();
  const [baseProfile, setBaseProfile] = useState<BaseProfile | null>(null);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const id = getSessionId();
    setSessionId(id);

    const stored = sessionStorage.getItem('baseProfile');
    if (!stored) {
      router.replace('/');
      return;
    }
    setBaseProfile(JSON.parse(stored));
  }, [router]);

  async function handleComplete(answers: string[]) {
    if (!baseProfile || !sessionId) return;

    try {
      const res = await fetch('/api/build-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, baseProfile, answers }),
      });

      if (!res.ok) throw new Error('Failed to build profile');

      const data = await res.json();
      sessionStorage.setItem('intentProfile', JSON.stringify(data.intentProfile));

      router.push('/loading');
    } catch (err) {
      console.error('Error building profile:', err);
      // Still redirect, loading page will handle errors
      router.push('/loading');
    }
  }

  if (!baseProfile) return null;

  return (
    <main className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Nav */}
      <div className="px-8 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
        <span className="font-bold text-slate-800 text-lg">JobRight</span>
        <span className="text-xs text-slate-400">Tell us what you want</span>
      </div>

      <div className="flex-1 flex flex-col">
        <ChatInterface onComplete={handleComplete} />
      </div>
    </main>
  );
}
