'use client';

import { useState, useRef, useEffect } from 'react';
import { Lang, t } from '@/data/i18n';

interface AgentResponse {
  agentId: string;
  agentName: string;
  floor: string;
  role: string;
  response: string;
}

interface SimulationResult {
  scenario: string;
  type: string;
  agentCount: number;
  responses: AgentResponse[];
  summary: string;
}

// Agent images
const AGENT_IMAGES: Record<string, string> = {
  tasky: '/agents/tasky.png',
  finy: '/agents/finy.png',
  legaly: '/agents/legaly.png',
  skepty: '/agents/skepty.png',
  audity: '/agents/audity.png',
  pixely: '/agents/pixely.png',
  buildy: '/agents/buildy.png',
  testy: '/agents/testy.png',
  buzzy: '/agents/buzzy.png',
  wordy: '/agents/wordy.png',
  edity: '/agents/edity.png',
  searchy: '/agents/searchy.png',
  growthy: '/agents/growthy.png',
  logoy: '/agents/logoy.png',
  helpy: '/agents/helpy.png',
  clicky: '/agents/clicky.png',
  selly: '/agents/selly.png',
  stacky: '/agents/stacky.png',
  watchy: '/agents/watchy.png',
  guardy: '/agents/guardy.png',
  hiry: '/agents/hiry.png',
  evaly: '/agents/evaly.png',
  quanty: '/agents/quanty.png',
  tradey: '/agents/tradey.png',
  globy: '/agents/globy.png',
  fieldy: '/agents/fieldy.png',
  hedgy: '/agents/hedgy.png',
  valuey: '/agents/valuey.png',
  opsy: '/agents/opsy.png',
};

const SCENARIO_TYPE_LABELS: Record<string, { ko: string; en: string; emoji: string }> = {
  market: { ko: '시장/경쟁', en: 'Market', emoji: '📊' },
  product: { ko: '제품/개발', en: 'Product', emoji: '🛠️' },
  crisis: { ko: '위기 대응', en: 'Crisis', emoji: '🚨' },
  investment: { ko: '투자', en: 'Investment', emoji: '💰' },
  launch: { ko: '런칭/마케팅', en: 'Launch', emoji: '🚀' },
  hiring: { ko: '채용/인사', en: 'Hiring', emoji: '👥' },
  security: { ko: '보안', en: 'Security', emoji: '🔒' },
  content: { ko: '콘텐츠', en: 'Content', emoji: '📝' },
  general: { ko: '일반', en: 'General', emoji: '💼' },
};

interface Props {
  onClose: () => void;
  lang: Lang;
}

export function SimulationPanel({ onClose, lang }: Props) {
  const text = t[lang];
  const [scenario, setScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [visibleResponses, setVisibleResponses] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const examples = [text.scenario1, text.scenario2, text.scenario3, text.scenario4];

  // Animate responses appearing one by one
  useEffect(() => {
    if (!result) return;
    if (visibleResponses < result.responses.length) {
      const timer = setTimeout(() => {
        setVisibleResponses((v) => v + 1);
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 600);
      return () => clearTimeout(timer);
    } else if (visibleResponses === result.responses.length && !showSummary) {
      const timer = setTimeout(() => {
        setShowSummary(true);
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [result, visibleResponses, showSummary]);

  const runSimulation = async () => {
    if (!scenario.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setVisibleResponses(0);
    setShowSummary(false);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenario.trim() }),
      });

      if (!res.ok) throw new Error('Simulation failed');
      const data: SimulationResult = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const typeInfo = result ? SCENARIO_TYPE_LABELS[result.type] || SCENARIO_TYPE_LABELS.general : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full h-[92dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:mx-4 bg-[#0a0f1a] border border-white/10 rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden animate-slideIn shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 glass-strong shrink-0 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div>
              <h2 className="text-sm font-bold text-white">{text.simulation}</h2>
              <p className="text-[10px] text-gray-500">{text.simulationDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg glass hover:bg-white/10 text-gray-400 hover:text-white transition text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Input section */}
          {!result && !loading && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <textarea
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder={text.scenarioPlaceholder}
                  className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400/30 resize-none h-24"
                  autoFocus
                />
              </div>

              {/* Example scenarios */}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">{text.exampleScenarios}</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {examples.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setScenario(ex)}
                      className="text-left px-3 py-2 text-[11px] rounded-xl glass hover:bg-white/10 text-gray-400 hover:text-gray-200 transition"
                    >
                      💡 {ex}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={runSimulation}
                disabled={!scenario.trim()}
                className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-30 disabled:cursor-not-allowed text-amber-300 text-sm font-medium transition border border-amber-400/20"
              >
                🎯 {text.runSimulation}
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fadeIn">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-xl">🎯</span>
              </div>
              <div className="text-center">
                <p className="text-sm text-amber-300 font-medium">{text.simulating}</p>
                <p className="text-[10px] text-gray-500 mt-1">{scenario}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Scenario header */}
              <div className="glass rounded-xl px-4 py-3 animate-fadeIn">
                <div className="flex items-center gap-2 mb-1">
                  {typeInfo && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300/80 font-medium">
                      {typeInfo.emoji} {lang === 'ko' ? typeInfo.ko : typeInfo.en}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white font-medium">{result.scenario}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {result.agentCount} {lang === 'ko' ? '명의 에이전트가 분석했습니다' : 'agents analyzed'}
                </p>
              </div>

              {/* Agent responses */}
              <div className="space-y-3">
                {result.responses.slice(0, visibleResponses).map((r, i) => (
                  <div key={i} className="flex gap-3 animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
                    {/* Agent avatar */}
                    <div className="shrink-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800 border border-white/10">
                        <img
                          src={AGENT_IMAGES[r.agentId] || ''}
                          alt={r.agentName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                    {/* Response content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{r.agentName}</span>
                        <span className="text-[9px] text-gray-500">{r.floor}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{r.role}</span>
                      </div>
                      <div className="glass rounded-xl rounded-tl-md px-3 py-2 text-[13px] text-gray-200 leading-relaxed">
                        {r.response}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Show thinking dots while more responses coming */}
                {visibleResponses < result.responses.length && (
                  <div className="flex gap-3 animate-fadeIn">
                    <div className="w-10 h-10 rounded-xl bg-gray-800/50 border border-white/5 flex items-center justify-center">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                    <div className="flex-1 glass rounded-xl px-3 py-3 flex items-center">
                      <span className="text-[11px] text-gray-500">
                        {result.responses[visibleResponses]?.agentName} {lang === 'ko' ? '분석 중...' : 'analyzing...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Executive summary */}
              {showSummary && result.summary && (
                <div className="animate-fadeInUp">
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📋</span>
                      <h3 className="text-sm font-bold text-amber-300">{text.executiveSummary}</h3>
                    </div>
                    <div className="text-[13px] text-gray-200 leading-relaxed whitespace-pre-line">
                      {result.summary}
                    </div>
                  </div>

                  {/* Run another */}
                  <button
                    onClick={() => {
                      setResult(null);
                      setScenario('');
                      setVisibleResponses(0);
                      setShowSummary(false);
                    }}
                    className="w-full mt-3 py-2.5 rounded-xl glass hover:bg-white/10 text-gray-400 text-sm transition"
                  >
                    🔄 {lang === 'ko' ? '새 시뮬레이션' : 'New Simulation'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
