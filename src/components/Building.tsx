'use client';

import { useState, useRef, useEffect } from 'react';
import { floors, Agent } from '@/data/floors';
import { useSimulation } from '@/hooks/useSimulation';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { useLang } from '@/context/LangContext';
import FloorRow from './FloorRow';
import ElevatorShaft from './ElevatorShaft';
import ChatPanel from './ChatPanel';
import ActivityFeed from './ActivityFeed';
import FloorIndicator from './FloorIndicator';
import LoadingScreen from './LoadingScreen';

export default function Building() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const buildingRef = useRef<HTMLDivElement>(null);
  const [visibleFloor, setVisibleFloor] = useState(10);

  const { agentStates, activityLog, getAgentsOnFloor, getElevatorAgents } = useSimulation();
  const { timeOfDay, darknessOpacity, litFloors } = useTimeOfDay();
  const { lang, setLang, text } = useLang();

  // Loading screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Track which floor is in view
  useEffect(() => {
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

  if (loading) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen bg-gray-950">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,170,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Night sky overlay */}
      {darknessOpacity > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-[5000ms]"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,20,${darknessOpacity}) 0%, rgba(0,0,40,${darknessOpacity * 0.7}) 100%)`,
          }}
        />
      )}

      {/* Header / Rooftop */}
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-2xl">🏢</span>
              {timeOfDay === 'night' && (
                <span className="absolute -top-1 -right-1 text-xs">🌙</span>
              )}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                _y HOLDINGS
              </h1>
              <p className="text-[10px] sm:text-xs text-cyan-500/70 font-mono">
                {text.headerSub}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
              className="text-xs font-mono px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all cursor-pointer"
            >
              {lang === 'en' ? '한국어' : 'EN'}
            </button>
            {/* Activity feed toggle */}
            <button
              onClick={() => setShowActivityFeed(!showActivityFeed)}
              className={`text-xs font-mono px-2 py-1 rounded border transition-all cursor-pointer ${
                showActivityFeed
                  ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10'
                  : 'border-gray-700 text-gray-500 hover:text-gray-300'
              }`}
            >
              📊 {lang === 'ko' ? '피드' : 'Feed'}
            </button>
            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-sm cursor-pointer"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400 font-mono hidden sm:inline">{text.live}</span>
          </div>
        </div>
      </header>

      {/* Floor indicator (left side) */}
      <FloorIndicator
        currentFloor={visibleFloor}
        onFloorClick={scrollToFloor}
      />

      {/* Activity Feed (right side) */}
      {showActivityFeed && (
        <ActivityFeed entries={activityLog} onClose={() => setShowActivityFeed(false)} />
      )}

      {/* Main building */}
      <div className="max-w-5xl mx-auto" ref={buildingRef}>
        <div className="relative mx-2 sm:mx-4">
          {/* Rooftop signage */}
          <div className="flex justify-center py-4">
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-8 bg-gradient-to-t from-cyan-500/50 to-transparent" />
              <div className="relative px-4 py-1 border border-cyan-500/30 rounded bg-gray-900/80">
                <span className="text-sm sm:text-base font-bold text-cyan-400 font-mono tracking-widest">
                  _y HOLDINGS
                </span>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 border border-cyan-500/50 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                </div>
              </div>
              {/* Glass panel decorations */}
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 sm:w-6 h-1 rounded-sm bg-cyan-500/10"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Building frame */}
          <div className="relative border-x-2 border-t-2 border-gray-700/30 rounded-t-lg overflow-visible">
            {/* Glass wall shimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            {/* Glass panel columns */}
            <div className="absolute inset-0 pointer-events-none flex justify-between px-[3%]">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-px h-full bg-gray-700/10" />
              ))}
            </div>

            {/* Floors + Elevator shaft */}
            <div className="flex">
              {/* Floor stack */}
              <div className="flex-1">
                {floors.map((floor) => (
                  <FloorRow
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

              {/* Elevator shaft */}
              <ElevatorShaft
                elevatorAgents={getElevatorAgents()}
                floors={floors}
              />
            </div>
          </div>

          {/* Building base */}
          <div className="h-6 bg-gradient-to-b from-gray-800 to-gray-900 border-x-2 border-b-2 border-gray-700/30 rounded-b-lg flex items-center justify-center">
            <div className="flex gap-2">
              <div className="w-8 h-3 rounded-t bg-amber-900/30 border border-amber-800/20" />
              <div className="w-12 h-3 rounded-t bg-cyan-900/20 border border-cyan-800/20 flex items-center justify-center">
                <span className="text-[6px] text-cyan-600/50 font-mono">{lang === 'ko' ? '정문' : 'ENTRANCE'}</span>
              </div>
              <div className="w-8 h-3 rounded-t bg-amber-900/30 border border-amber-800/20" />
            </div>
          </div>

          {/* Ground shadow */}
          <div className="h-3 bg-gradient-to-b from-gray-900 to-transparent mx-6 rounded-b-full opacity-50" />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-700 text-[10px] font-mono">
        {lang === 'ko' ? '_y Holdings 인터랙티브 회사 시뮬레이터 v2.0 · 에이전트를 클릭하여 대화하세요' : '_y Holdings Interactive Company Simulator v2.0 · Click any agent to chat'}
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
  agentStates: Map<string, import('@/hooks/useSimulation').AgentState>;
  activityLog: import('@/data/activities').ActivityLogEntry[];
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
      <div className="fixed inset-x-4 top-20 bottom-20 sm:inset-auto sm:right-4 sm:top-16 sm:w-96 sm:bottom-auto sm:max-h-[80vh] bg-gray-900/95 border border-yellow-500/30 z-50 rounded-xl overflow-y-auto animate-slide-in shadow-xl shadow-yellow-500/10">
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer">✕</button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600 to-amber-800 flex items-center justify-center text-2xl font-bold text-white">A</div>
            <div>
              <h2 className="text-lg font-bold text-yellow-400">{lang === 'ko' ? '회장 대시보드' : "Chairman's Dashboard"}</h2>
              <p className="text-xs text-gray-500 font-mono">_y Holdings Overview</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard label="Working" value={working} color="#2ECC71" />
            <StatCard label="In Meetings" value={meeting} color="#F1C40F" />
            <StatCard label="In Elevator" value={elevator} color="#3498DB" />
            <StatCard label="Reporting (10F)" value={reporting} color="#E74C3C" />
          </div>

          {/* Department summary */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Department Status</h3>
          <div className="space-y-2 mb-6">
            {floors.slice(1).map(floor => {
              const onFloor = [...agentStates.values()].filter(a => a.floor === floor.level && a.status !== 'elevator').length;
              return (
                <div key={floor.level} className="flex items-center justify-between text-xs bg-gray-800/50 rounded px-3 py-2">
                  <span className="text-gray-400">{floor.label} {floor.departmentEn}</span>
                  <span style={{ color: floor.color }} className="font-mono">{onFloor} agents</span>
                </div>
              );
            })}
          </div>

          {/* Recent activity */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Activity</h3>
          <div className="space-y-1">
            {activityLog.slice(0, 8).map(entry => (
              <div key={entry.id} className="text-[10px] text-gray-500 font-mono">
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
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
      <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
      <div className="text-[10px] text-gray-500 uppercase">{label}</div>
    </div>
  );
}
