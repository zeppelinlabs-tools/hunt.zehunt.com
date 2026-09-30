'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGate from '@/components/RoleGate';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selections, setSelections] = useState<{
    build: string[];
    problems: string[];
    tools: string[];
  }>({
    build: [],
    problems: [],
    tools: []
  });

  const toggleItem = (category: 'build' | 'problems' | 'tools', val: string) => {
    setSelections(prev => {
      const exists = prev[category].includes(val);
      return {
        ...prev,
        [category]: exists ? prev[category].filter(x => x !== val) : [...prev[category], val]
      };
    });
  };

  const handleFinish = async () => {
    await fetch('/api/v1/users/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences: selections })
    });
    router.push('/');
  };

  return (
    <RoleGate allow={['developer', 'admin']} title="Onboarding preferences">
    <div className="bg-white border border-[#e5e5e5] rounded-xl p-8 max-w-xl mx-auto shadow-sm">
      <div className="flex items-center gap-2 text-xs font-mono text-[#737373] mb-4">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-[#2563eb] text-white' : 'bg-[#f5f5f5]'}`}>1</span> Build
        <span>&rarr;</span>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-[#2563eb] text-white' : 'bg-[#f5f5f5]'}`}>2</span> Failure Domains
        <span>&rarr;</span>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step === 3 ? 'bg-[#2563eb] text-white' : 'bg-[#f5f5f5]'}`}>3</span> Tools
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#171717]">What are you building?</h2>
          <p className="text-xs text-[#525252]">Helps prioritize relevant problem-solving cases in your feed.</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['Web Applications', 'Distributed Backends', 'Mobile Apps', 'AI & Agent Workflows', 'Embedded / IoT', 'Data Pipelines'].map(item => (
              <button
                key={item}
                onClick={() => toggleItem('build', item)}
                className={`p-3 text-left rounded-lg border cursor-pointer transition-all ${selections.build.includes(item) ? 'bg-[#eff6ff] border-[#2563eb] font-semibold text-[#2563eb]' : 'border-[#e5e5e5] text-[#525252] hover:bg-[#fafafa]'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="btn-primary w-full mt-4">Continue &rarr;</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#171717]">Which failure domains hurt the most?</h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['Authentication & Cookies', 'Neon / DB Connection Pooling', 'Docker & Container Networking', 'Hydration & Next.js SSR', 'CORS & API Gateways', 'Build & Toolchain Failures'].map(item => (
              <button
                key={item}
                onClick={() => toggleItem('problems', item)}
                className={`p-3 text-left rounded-lg border cursor-pointer transition-all ${selections.problems.includes(item) ? 'bg-[#eff6ff] border-[#2563eb] font-semibold text-[#2563eb]' : 'border-[#e5e5e5] text-[#525252] hover:bg-[#fafafa]'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue &rarr;</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#171717]">Select your daily developer tools</h2>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {['Cursor', 'Claude Desktop', 'VS Code', 'Kiro', 'WebStorm', 'Neovim'].map(item => (
              <button
                key={item}
                onClick={() => toggleItem('tools', item)}
                className={`p-3 text-center rounded-lg border cursor-pointer transition-all ${selections.tools.includes(item) ? 'bg-[#eff6ff] border-[#2563eb] font-semibold text-[#2563eb]' : 'border-[#e5e5e5] text-[#525252] hover:bg-[#fafafa]'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
            <button onClick={handleFinish} className="btn-primary flex-1">Complete Setup</button>
          </div>
        </div>
      )}
    </div>
    </RoleGate>
  );
}
