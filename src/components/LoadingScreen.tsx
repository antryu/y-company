'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Booting systems...');

  useEffect(() => {
    const steps = [
      { at: 15, text: 'Loading floor plans...' },
      { at: 35, text: 'Initializing 29 agents...' },
      { at: 55, text: 'Powering up workstations...' },
      { at: 75, text: 'Connecting elevator systems...' },
      { at: 90, text: 'Opening for business...' },
    ];

    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + 2;
        const step = steps.find(s => s.at <= next && s.at > p);
        if (step) setStatusText(step.text);
        return next >= 100 ? 100 : next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-[100]">
      {/* Building silhouette */}
      <div className="relative mb-8">
        <div className="flex flex-col items-center gap-1 opacity-20">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-1">
              {Array.from({ length: 8 }).map((_, j) => (
                <div
                  key={j}
                  className="w-3 h-3 border border-gray-600/30"
                  style={{
                    opacity: progress > (i * 20 + j * 2) ? 1 : 0.2,
                    background: progress > (i * 20 + j * 2) ? 'rgba(0, 200, 255, 0.1)' : 'transparent',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* _y Logo overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 font-mono">
            _y
          </div>
        </div>
      </div>

      <h2 className="text-xs sm:text-sm text-gray-500 font-mono mb-6 tracking-[0.3em] uppercase">
        Holdings
      </h2>

      {/* Progress bar */}
      <div className="w-48 h-[2px] bg-gray-800 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-[10px] text-gray-600 font-mono h-4">
        {statusText}
      </p>
    </div>
  );
}
