'use client';

import { useState } from 'react';

interface Option {
  label: string;
  value: string;
  emoji?: string;
}

interface Question {
  id: number;
  title: string;
  subtitle: string;
  type: 'single' | 'multi' | 'number';
  options?: Option[];
  placeholder?: string;
  unit?: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "What's your next career move?",
    subtitle: 'Pick one',
    type: 'single',
    options: [
      { label: 'Step up to senior / lead role', value: 'Step up to a senior or lead role', emoji: '🚀' },
      { label: 'Same level, better company', value: 'Stay at same level but move to a better company', emoji: '🔄' },
      { label: 'Pivot to new function / industry', value: 'Pivot to a different function or industry', emoji: '↗️' },
      { label: 'Go independent / freelance', value: 'Move to freelance or consulting work', emoji: '💼' },
    ],
  },
  {
    id: 2,
    title: 'Which industries excite you?',
    subtitle: 'Pick all that apply — this directly controls which companies we search',
    type: 'multi',
    options: [
      { label: 'Manufacturing / Industrial Engineering', value: 'Manufacturing and Industrial Engineering', emoji: '🏭' },
      { label: 'Automation / Robotics / IoT', value: 'Automation, Robotics and Industrial IoT', emoji: '🦾' },
      { label: 'Automotive / Mobility', value: 'Automotive and Mobility', emoji: '🚗' },
      { label: 'EV / Clean Energy', value: 'EV and Clean Energy', emoji: '⚡' },
      { label: 'Aerospace / Defence', value: 'Aerospace and Defence', emoji: '✈️' },
      { label: 'Semiconductor / Electronics / Hardware', value: 'Semiconductor, Electronics and Hardware', emoji: '💡' },
      { label: 'Supply Chain / Logistics', value: 'Supply Chain and Logistics', emoji: '🚚' },
      { label: 'Construction / Infrastructure', value: 'Construction and Infrastructure', emoji: '🏗️' },
      { label: 'SaaS / B2B Software', value: 'SaaS and B2B Software', emoji: '☁️' },
      { label: 'AI / Deep Tech', value: 'AI and Deep Tech', emoji: '🤖' },
      { label: 'Fintech / Payments', value: 'Fintech and Payments', emoji: '💳' },
      { label: 'Consumer Tech / E-commerce', value: 'Consumer Tech and E-commerce', emoji: '🛒' },
      { label: 'Healthtech / Medtech', value: 'Healthtech and Medtech', emoji: '🏥' },
      { label: 'Edtech', value: 'Edtech', emoji: '📚' },
      { label: 'Telecom / Networking', value: 'Telecom and Networking', emoji: '📡' },
      { label: 'Oil & Gas / Chemicals', value: 'Oil, Gas and Chemicals', emoji: '⛽' },
      { label: 'BFSI / Insurance', value: 'BFSI and Insurance', emoji: '🏦' },
      { label: 'Agriculture / AgriTech', value: 'Agriculture and AgriTech', emoji: '🌾' },
    ],
  },
  {
    id: 3,
    title: 'What company stage fits you?',
    subtitle: 'Pick all that apply',
    type: 'multi',
    options: [
      { label: 'Early startup (Seed - Series A)', value: 'seed/series_a', emoji: '🌱' },
      { label: 'Growth stage (Series B - C)', value: 'series_b/series_c', emoji: '📈' },
      { label: 'Scaled startup (post Series C)', value: 'growth', emoji: '🦄' },
      { label: 'MNC / Large corporation', value: 'mnc', emoji: '🏢' },
      { label: 'Open to all stages', value: 'any', emoji: '🔓' },
    ],
  },
  {
    id: 4,
    title: 'Where can you work?',
    subtitle: 'Pick all locations you are open to',
    type: 'multi',
    options: [
      { label: 'Bangalore', value: 'Bangalore', emoji: '🏙️' },
      { label: 'Mumbai', value: 'Mumbai', emoji: '🌊' },
      { label: 'Delhi / NCR', value: 'Delhi NCR', emoji: '🏛️' },
      { label: 'Hyderabad', value: 'Hyderabad', emoji: '💎' },
      { label: 'Pune', value: 'Pune', emoji: '🌿' },
      { label: 'Chennai', value: 'Chennai', emoji: '🌴' },
      { label: 'Remote only', value: 'Remote only', emoji: '🏠' },
      { label: 'Open to any city', value: 'Open to any city in India', emoji: '🗺️' },
    ],
  },
  {
    id: 5,
    title: 'Minimum salary expectation?',
    subtitle: 'Roles below this number will not be shown',
    type: 'number',
    placeholder: '20',
    unit: 'LPA',
  },
  {
    id: 6,
    title: 'Any deal-breakers?',
    subtitle: 'Pick everything you will not compromise on',
    type: 'multi',
    options: [
      { label: 'Poor work-life balance', value: 'Poor work-life balance', emoji: '⏰' },
      { label: 'No equity / ESOPs', value: 'No equity or ESOPs offered', emoji: '📊' },
      { label: 'Mandatory relocation', value: 'Mandatory relocation required', emoji: '✈️' },
      { label: 'No remote flexibility', value: 'No remote work flexibility', emoji: '🏠' },
      { label: 'Outdated tech stack', value: 'Outdated technology stack', emoji: '💻' },
      { label: 'No clear growth path', value: 'No structured career growth path', emoji: '🪜' },
      { label: 'Bond / service clause', value: 'Bond or service agreement required', emoji: '📜' },
      { label: 'No deal-breakers', value: 'No specific deal-breakers', emoji: '✅' },
    ],
  },
  {
    id: 7,
    title: 'What energises you at work?',
    subtitle: 'Pick all that apply — this shapes your matches',
    type: 'multi',
    options: [
      { label: 'Building products from scratch', value: 'Building products from scratch (0 to 1)', emoji: '🔨' },
      { label: 'Scaling what is working', value: 'Scaling existing products and systems', emoji: '📈' },
      { label: 'Deep technical / R&D work', value: 'Deep technical work and research', emoji: '🔬' },
      { label: 'Managing and growing teams', value: 'Managing and mentoring people', emoji: '👥' },
      { label: 'Customer-facing / GTM', value: 'Customer-facing and go-to-market work', emoji: '🤝' },
      { label: 'Data and analytics', value: 'Data analysis and business insights', emoji: '📊' },
      { label: 'Strategy and operations', value: 'Strategy and business operations', emoji: '♟️' },
      { label: 'Cross-functional projects', value: 'Cross-functional collaboration', emoji: '🔗' },
    ],
  },
];

interface ChatInterfaceProps {
  onComplete: (answers: string[]) => void;
}

export function ChatInterface({ onComplete }: ChatInterfaceProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [numberInput, setNumberInput] = useState('');
  const [animating, setAnimating] = useState(false);

  const q = QUESTIONS[current];
  const progress = (current / QUESTIONS.length) * 100;

  function toggleOption(value: string) {
    if (q.type === 'single') {
      setSelected([value]);
    } else {
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
  }

  function canProceed() {
    if (q.type === 'number') return numberInput.trim().length > 0;
    return selected.length > 0;
  }

  function handleNext() {
    if (!canProceed()) return;
    const answer = q.type === 'number' ? `${numberInput} LPA` : selected.join(', ');
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (current + 1 < QUESTIONS.length) {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setSelected([]);
        setNumberInput('');
        setAnimating(false);
      }, 200);
    } else {
      onComplete(newAnswers);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress */}
      <div className="px-8 py-5 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-500">{current + 1} / {QUESTIONS.length}</span>
          <span className="text-xs text-slate-400">{QUESTIONS.length - current - 1} left</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className={`flex-1 px-8 py-8 overflow-y-auto transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">{q.title}</h2>
        <p className="text-slate-400 mb-7 text-sm">{q.subtitle}</p>

        {q.type === 'number' ? (
          <div className="max-w-xs">
            <div className="flex border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-400 transition-colors bg-white">
              <input
                type="number"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                placeholder={q.placeholder}
                className="flex-1 px-5 py-4 text-3xl font-bold outline-none text-slate-800 bg-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                autoFocus
              />
              <span className="px-5 flex items-center text-slate-400 font-semibold bg-slate-50 border-l-2 border-slate-200">{q.unit}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Press Enter to continue</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {q.options?.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleOption(opt.value)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all duration-150 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt.emoji && <span className="text-xl leading-none flex-shrink-0">{opt.emoji}</span>}
                  <span className="text-sm font-medium flex-1">{opt.label}</span>
                  <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs ${
                    isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && '✓'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Next button */}
      <div className="px-8 pb-8 pt-3 border-t border-slate-100 bg-white">
        {q.type === 'multi' && selected.length > 0 && (
          <p className="text-xs text-slate-400 mb-2">{selected.length} selected</p>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
            canProceed()
              ? 'bg-slate-900 text-white hover:bg-slate-700 shadow-sm'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          {current + 1 === QUESTIONS.length ? 'Build my job universe →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
