'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGate from '@/components/RoleGate';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState({
    build: ['Web', 'Backend', 'Cloud'],
    problems: ['Authentication', 'Deployment', 'Databases'],
    tools: ['VS Code', 'Cursor', 'Claude']
  });

  const toggleSelection = (category: 'build' | 'problems' | 'tools', item: string) => {
    setSelections(prev => {
      const list = prev[category];
      return {
        ...prev,
        [category]: list.includes(item) ? list.filter(i => i !== item) : [...list, item]
      };
    });
  };

  const handleComplete = async () => {
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'onboarding', preferences: selections })
    });
    router.push('/');
  };

  return (
    <RoleGate allow={['developer']} title="Onboarding preferences">
    <div className="bg-white border border-[#e5e5e5] rounded-xl p-8 max-w-xl mx-auto shadow-sm">
      <div className="flex items-center gap-2 text-xs font-mono text-[#737373] mb-4">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-[#2563eb] text-white' : 'bg-[#f5f5f5]'}`}>1</span> Build
        <span>→</span>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-[#2563eb] text-white' : 'bg-[#f5f5f5]'}`}>2</span> Failure Domains
        <span>→</span>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step === 3 ? 'bg-[#2563eb] text-white' : 'bg-[#f5f5f5]'}`}>3</span> Tools
      </div>

      <h1 className="text-xl font-bold tracking-tight text-[#171717]">
        {step === 1 ? 'Step 1 — What do you build?' : step === 2 ? 'Step 2 — What problems do you encounter most?' : 'Step 3 — Preferred Coding Tools'}
      </h1>
      <p className="text-xs text-[#525252] mb-6 mt-1">
        Personalize the engineering knowledge streams and AI agent retrieval index.
      </p>

      {step === 1 && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {['Web', 'Mobile', 'Backend', 'AI / ML', 'DevOps', 'Cloud', 'Data', 'Open Source', 'Desktop', 'Security'].map(item => (
            <button
              key={item}
              type="button"
              onClick={() => toggleSelection('build', item)}
              className={`filter-btn text-center py-2.5 ${selections.build.includes(item) ? 'active' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {['Debugging', 'Deployment', 'Architecture', 'Performance', 'Databases', 'APIs', 'Authentication', 'AI / LLM', 'DevOps', 'Security'].map(item => (
            <button
              key={item}
              type="button"
              onClick={() => toggleSelection('problems', item)}
              className={`filter-btn text-center py-2.5 ${selections.problems.includes(item) ? 'active' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {['VS Code', 'Cursor', 'Kiro', 'Claude', 'ChatGPT', 'Other'].map(item => (
            <button
              key={item}
              type="button"
              onClick={() => toggleSelection('tools', item)}
              className={`filter-btn text-center py-2.5 ${selections.tools.includes(item) ? 'active' : ''}`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-[#e5e5e5]">
        {step > 1 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">
            ← Previous
          </button>
        ) : <div></div>}

        {step < 3 ? (
          <button type="button" onClick={() => setStep(step + 1)} className="btn-primary">
            Next Step →
          </button>
        ) : (
          <button type="button" onClick={handleComplete} className="btn-primary">
            Save Preferences
          </button>
        )}
      </div>
    </div>
    </RoleGate>
  );
}
