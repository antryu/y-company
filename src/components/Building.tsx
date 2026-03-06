'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { floors, Agent } from '@/data/floors';
import { useSimulation, AgentState } from '@/hooks/useSimulation';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { useLang } from '@/context/LangContext';
import IsometricFloor from './IsometricFloor';
import ChatPanel from './ChatPanel';
import ActivityFeed from './ActivityFeed';
import FloorIndicator from './FloorIndicator';
import LoadingScreen from './LoadingScreen';
import { ActivityLogEntry } from '@/data/activities';

export default function Building() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [loading, setLoading] = useState(true);
  const buildingRef = useRef<HTMLDivElement>(null);
  const [visibleFloor, setVisibleFloor] = useState(10);

  const { agentStates, activityLog, getAgentsOnFloor, getElevatorAgents } = useSimulation();
  const { timeOfDay, darknessOpacity, litFloors } = useTimeOfDay();
  const { lang, setLang, text } = useLang();

  // Loading screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Track which floor is in view
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const level = parseInt(entry.target.getAttribute('data-floor') || '1');
            setVisibleFloor(level);
          }
        }
      },
      { threshold: 0.5 }
    );
    const floorEls = document.querySelectorAll('[data-floor]');
    floorEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  // Elevator agents for display
  const elevatorAgents = getElevatorAgents();

  const handleAgentClick = (agent: Agent) => {
    if (agent.id === 'andrew') {
      setShowDashboard(true);
      return;
    }
    setSelectedAgent(agent);
  };

  const scrollToFloor = (level: number) => {
    const el = document.querySelector(`[data-floor="${level}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Sky class based on time
  const skyClass = `sky-${timeOfDay}`;

  // Stars for night
  const stars = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 40,
      delay: Math.random() * 5,
      size: 1 + Math.random() * 1.5,
    }));
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className={`relative min-h-screen ${skyClass} transition-all duration-[5000ms]`}>
      {/* Stars (night only) */}
      {(timeOfDay === 'night' || timeOfDay === 'evening') && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {stars.map((star, i) => (
            <div
              key={i}
              className="star"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/85 backdrop-blur-lg border-b border-cyan-500/15">
        <div className="max-w-5xl mx-auto px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-900/50 to-gray-900 border border-cyan-500/20 flex items-center justify-center">
                <span className="text-sm font-bold text-cyan-400 font-mono">_y</span>
              </div>
              {timeOfDay === 'night' && (
                <span className="absolute -top-1 -right-1 text-[10px]">🌙</span>
              )}
              {timeOfDay === 'morning' && (
                <span className="absolute -top-1 -right-1 text-[10px]">🌅</span>
              )}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
                ANDREW TOWER
              </h1>
              <p className="text-[9px] sm:text-[10px] text-cyan-500/60 font-mono">
                {text.headerSub}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
              className="text-[10px] font-mono px-2 py-1 rounded border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-500 transition-all cursor-pointer"
            >
              {lang === 'en' ? '한국어' : 'EN'}
            </button>
            <button
              onClick={() => setShowActivityFeed(!showActivityFeed)}
              className={`text-[10px] font-mono px-2 py-1 rounded border transition-all cursor-pointer ${
                showActivityFeed
                  ? 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10'
                  : 'border-gray-700/50 text-gray-500 hover:text-gray-300'
              }`}
            >
              📊
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] text-green-400/80 font-mono hidden sm:inline">{text.live}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Floor indicator */}
      <FloorIndicator currentFloor={visibleFloor} onFloorClick={scrollToFloor} />

      {/* Activity Feed */}
      {showActivityFeed && (
        <ActivityFeed entries={activityLog} onClose={() => setShowActivityFeed(false)} />
      )}

      {/* === THE BUILDING === */}
      <div className="max-w-4xl mx-auto building-container" ref={buildingRef}>
        <div className="relative mx-2 sm:mx-4">

          {/* Rooftop / Antenna */}
          <div className="flex justify-center pt-6 pb-2">
            <div className="flex flex-col items-center">
              {/* Antenna */}
              <div className="w-[1px] h-6 bg-gradient-to-t from-gray-500/40 to-transparent" />
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 animate-pulse mb-1" />
              <div className="w-[1px] h-4 bg-gray-500/30" />

              {/* Rooftop signage */}
              <div className="relative px-6 py-1.5 border border-cyan-500/20 rounded bg-gray-900/90 backdrop-blur-sm">
                <span className="text-sm sm:text-base font-bold text-cyan-400 font-mono tracking-[0.2em]">
                  _y HOLDINGS
                </span>
                {/* Neon glow */}
                <div className="absolute inset-0 rounded" style={{
                  boxShadow: '0 0 15px rgba(0, 200, 255, 0.1), inset 0 0 15px rgba(0, 200, 255, 0.05)',
                }} />
              </div>

              {/* Rooftop structure */}
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-3 sm:w-4 h-1 bg-gray-700/20 rounded-sm" />
                ))}
              </div>
            </div>
          </div>

          {/* Building frame */}
          <div className="relative building-frame">
            {/* Left glass wall */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] z-10 glass-wall"
              style={{
                background: 'linear-gradient(180deg, rgba(100, 150, 200, 0.15), rgba(100, 150, 200, 0.05), rgba(100, 150, 200, 0.1))',
                boxShadow: '-2px 0 8px rgba(0, 100, 200, 0.05)',
              }}
            />

            {/* Right glass wall */}
            <div className="absolute right-0 top-0 bottom-0 w-[3px] z-10"
              style={{
                background: 'linear-gradient(180deg, rgba(80, 120, 160, 0.12), rgba(80, 120, 160, 0.04), rgba(80, 120, 160, 0.08))',
              }}
            />

            {/* Right side depth panel */}
            <div className="absolute -right-[6px] top-0 bottom-0 w-[6px] z-[1] hidden sm:block"
              style={{
                background: 'linear-gradient(90deg, rgba(30, 30, 40, 0.6), rgba(20, 20, 30, 0.8))',
                transform: 'skewY(2deg)',
                transformOrigin: 'top',
              }}
            />

            {/* Glass panel shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none z-[1]"
              style={{
                background: 'linear-gradient(135deg, rgba(150, 200, 255, 0.02) 0%, transparent 30%, rgba(150, 200, 255, 0.01) 50%, transparent 70%)',
              }}
            />

            {/* Glass panel columns */}
            <div className="absolute inset-0 pointer-events-none flex justify-between px-[4%] z-[1]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[1px] h-full" style={{
                  background: 'linear-gradient(180deg, rgba(120, 160, 200, 0.06), rgba(120, 160, 200, 0.03), rgba(120, 160, 200, 0.06))',
                }} />
              ))}
            </div>

            {/* Floor stack */}
            <div className="relative">
              {floors.map((floor) => (
                <IsometricFloor
                  key={floor.level}
                  floor={floor}
                  agentsOnFloor={getAgentsOnFloor(floor.level)}
                  allAgents={floor.agents}
                  onAgentClick={handleAgentClick}
                  timeOfDay={timeOfDay}
                  isLit={litFloors.has(floor.level)}
                  darknessOpacity={darknessOpacity}
                />
              ))}
            </div>

            {/* Elevator agents in transit indicator */}
            {elevatorAgents.length > 0 && (
              <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-12 pointer-events-none z-20">
                {elevatorAgents.map(agent => {
                  const fromIdx = floors.findIndex(f => f.level === agent.floor);
                  const toIdx = floors.findIndex(f => f.level === agent.elevatorTargetFloor);
                  const currentIdx = fromIdx + (toIdx - fromIdx) * agent.elevatorProgress;
                  const topPercent = (currentIdx / floors.length) * 100 + (100 / floors.length / 2);
                  return (
                    <div
                      key={agent.id}
                      className="absolute left-1 right-1 elevator-car px-0.5 py-0.5"
                      style={{ top: `${topPercent}%` }}
                    >
                      <span className="text-[6px] text-cyan-400/80 font-mono block text-center truncate">
                        {agent.name[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Building base / entrance */}
          <div className="relative">
            {/* Foundation */}
            <div className="h-3 bg-gradient-to-b from-gray-700/30 to-gray-800/20 border-x-[3px] border-gray-600/10" />

            {/* Entrance */}
            <div className="flex justify-center py-2">
              <div className="flex items-end gap-1">
                {/* Left planter */}
                <div className="flex flex-col items-center">
                  <div className="text-[10px]">🌿</div>
                  <div className="w-6 h-3 bg-gray-700/20 rounded-t" />
                </div>

                {/* Main door */}
                <div className="relative">
                  <div className="w-20 sm:w-28 h-8 rounded-t-lg border border-gray-600/20 overflow-hidden"
                    style={{
                      background: 'linear-gradient(180deg, rgba(50, 60, 70, 0.5) 0%, rgba(30, 40, 50, 0.5) 100%)',
                    }}
                  >
                    {/* Door panels */}
                    <div className="absolute inset-1 flex gap-[1px]">
                      <div className="flex-1 border border-gray-500/15 rounded-sm bg-cyan-900/10" />
                      <div className="flex-1 border border-gray-500/15 rounded-sm bg-cyan-900/10" />
                    </div>
                    {/* Door label */}
                    <div className="absolute bottom-1 left-0 right-0 text-center">
                      <span className="text-[5px] sm:text-[6px] text-cyan-500/40 font-mono tracking-wider">ENTRANCE</span>
                    </div>
                  </div>
                </div>

                {/* Right planter */}
                <div className="flex flex-col items-center">
                  <div className="text-[10px]">🌿</div>
                  <div className="w-6 h-3 bg-gray-700/20 rounded-t" />
                </div>
              </div>
            </div>

            {/* Ground / street level */}
            <div className="h-1 bg-gradient-to-b from-gray-800/30 to-transparent mx-4 rounded-b" />
            <div className="h-2 bg-gradient-to-b from-gray-900/40 to-transparent mx-8 rounded-b-full" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-700 text-[9px] font-mono">
        {lang === 'ko'
          ? '_y Holdings 인터랙티브 회사 시뮬레이터 v3.0 · 에이전트를 클릭하여 대화하세요'
          : '_y Holdings Interactive Company Simulator v3.0 · Click any agent to chat'}
      </footer>

      {/* Chat Panel */}
      {selectedAgent && (
        <ChatPanel
          agent={selectedAgent}
          agentState={agentStates.get(selectedAgent.id)}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      {/* Chairman Dashboard */}
      {showDashboard && (
        <DashboardPanel
          agentStates={agentStates}
          activityLog={activityLog}
          onClose={() => setShowDashboard(false)}
          lang={lang}
        />
      )}
    </div>
  );
}

// Chairman's Dashboard
function DashboardPanel({
  agentStates,
  activityLog,
  onClose,
  lang,
}: {
  agentStates: Map<string, AgentState>;
  activityLog: ActivityLogEntry[];
  onClose: () => void;
  lang: string;
}) {
  const working = [...agentStates.values()].filter(a => a.status === 'working').length;
  const meeting = [...agentStates.values()].filter(a => a.status === 'meeting').length;
  const elevator = [...agentStates.values()].filter(a => a.status === 'elevator').length;
  const reporting = [...agentStates.values()].filter(a => a.floor === 10 && a.id !== 'andrew').length;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-20 bottom-20 sm:inset-auto sm:right-4 sm:top-16 sm:w-96 sm:bottom-auto sm:max-h-[80vh] bg-gray-900/95 border border-yellow-500/20 z-50 rounded-xl overflow-y-auto animate-slide-in shadow-xl shadow-yellow-500/10">
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer">✕</button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600 to-amber-800 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-yellow-900/30">A</div>
            <div>
              <h2 className="text-lg font-bold text-yellow-400">{lang === 'ko' ? '회장 대시보드' : "Chairman's Dashboard"}</h2>
              <p className="text-[10px] text-gray-500 font-mono">_y Holdings Overview</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard label={lang === 'ko' ? '업무 중' : 'Working'} value={working} color="#2ECC71" />
            <StatCard label={lang === 'ko' ? '회의 중' : 'In Meetings'} value={meeting} color="#F1C40F" />
            <StatCard label={lang === 'ko' ? '이동 중' : 'In Elevator'} value={elevator} color="#3498DB" />
            <StatCard label={lang === 'ko' ? '보고 중' : 'Reporting'} value={reporting} color="#E74C3C" />
          </div>

          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {lang === 'ko' ? '부서별 현황' : 'Department Status'}
          </h3>
          <div className="space-y-1.5 mb-6">
            {floors.slice(1).map(floor => {
              const onFloor = [...agentStates.values()].filter(a => a.floor === floor.level && a.status !== 'elevator').length;
              return (
                <div key={floor.level} className="flex items-center justify-between text-[11px] bg-gray-800/40 rounded px-3 py-1.5">
                  <span className="text-gray-400">{floor.label} {lang === 'ko' ? floor.department : floor.departmentEn}</span>
                  <span style={{ color: floor.color }} className="font-mono text-[10px]">{onFloor} agents</span>
                </div>
              );
            })}
          </div>

          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {lang === 'ko' ? '최근 활동' : 'Recent Activity'}
          </h3>
          <div className="space-y-1">
            {activityLog.slice(0, 8).map(entry => (
              <div key={entry.id} className="text-[9px] text-gray-500 font-mono">
                <span className="text-cyan-500/60">{entry.agentName}</span>{' '}
                {entry.activity}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/20">
      <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
      <div className="text-[9px] text-gray-500 uppercase tracking-wide">{label}</div>
    </div>
  );
}
