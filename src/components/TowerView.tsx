'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLang } from '@/context/LangContext';
import { floors, Agent, Floor } from '@/data/floors';
import { FloorDetail } from './FloorDetail';
import { AgentChat } from './AgentChat';
import { ActivityFeed } from './ActivityFeed';
import {
  initializeSimulation,
  simulationStep,
  seedInitialActivities,
  getActivityLog,
  ActivityLogEntry,
} from '@/engine/simulation';

// Floor tile filenames mapped by level
const FLOOR_TILES: Record<number, string> = {
  10: '/tiles/floor-10-chairman.png',
  9: '/tiles/floor-9-planning.png',
  8: '/tiles/floor-8-risk.png',
  7: '/tiles/floor-7-dev.png',
  6: '/tiles/floor-6-content.png',
  5: '/tiles/floor-5-marketing.png',
  4: '/tiles/floor-4-ict.png',
  3: '/tiles/floor-3-hr.png',
  2: '/tiles/floor-2-capital.png',
  1: '/tiles/floor-1-lobby.png',
};

// Calibrated floor positions within the tower image
// The tower structure occupies roughly 15%-85% of the image height
// Each floor zone is mapped to where it visually appears in the DNA helix tower
const FLOOR_POSITIONS: Record<number, { top: number; height: number }> = {
  10: { top: 13, height: 6.5 },
  9:  { top: 20, height: 7 },
  8:  { top: 27, height: 7 },
  7:  { top: 34, height: 7 },
  6:  { top: 41, height: 7 },
  5:  { top: 48, height: 7 },
  4:  { top: 55, height: 7 },
  3:  { top: 62, height: 7 },
  2:  { top: 69, height: 7 },
  1:  { top: 76, height: 7 },
};

export function TowerView() {
  const { lang, setLang, text } = useLang();
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [hoveredFloor, setHoveredFloor] = useState<Floor | null>(null);
  const towerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeSimulation();
    seedInitialActivities();
    setActivities(getActivityLog(30));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const interval = setInterval(() => {
      const newActs = simulationStep();
      if (newActs.length > 0) {
        setActivities(getActivityLog(30));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [initialized]);

  const handleFloorClick = useCallback((floor: Floor) => {
    setSelectedFloor(floor);
    setSelectedAgent(null);
    setHoveredFloor(null);
  }, []);

  const handleAgentClick = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
  }, []);

  const handleCloseFloor = useCallback(() => {
    setSelectedFloor(null);
    setSelectedAgent(null);
  }, []);

  const handleCloseChat = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  return (
    <div className="h-dvh w-screen bg-[#030712] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#0a0f1a]/80 backdrop-blur-md border-b border-white/5 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            <span className="text-amber-400">_y</span> Tower
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold animate-pulse">
            {text.live}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowActivity(!showActivity)}
            className="px-2.5 py-1 text-xs rounded-md glass hover:bg-white/10 text-gray-300 transition"
          >
            📋 {text.activityFeed}
          </button>
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="px-2.5 py-1 text-xs rounded-md glass hover:bg-white/10 text-gray-300 transition"
          >
            {lang === 'ko' ? '🇺🇸 EN' : '🇰🇷 한'}
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ===== TOWER COLUMN ===== */}
        <div
          className={`transition-all duration-500 ease-out flex flex-col items-center justify-center relative
            ${selectedFloor ? 'hidden md:flex md:w-[25%] md:opacity-60 md:blur-[1px]' : 'w-full'}
          `}
        >
          {/* Atmospheric background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#030712] to-[#030712]" />

          {/* Subtle radial glow behind tower */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[60%] h-[70%] rounded-full bg-amber-500/[0.03] blur-3xl" />
          </div>

          {/* Tower container */}
          <div
            ref={towerRef}
            className="relative z-10 flex items-center justify-center w-full h-full p-2 sm:p-4"
          >
            <div
              className={`relative transition-all duration-500 ${
                selectedFloor ? 'h-[90%]' : 'h-[85vh] sm:h-[88vh]'
              }`}
              style={{ aspectRatio: '0.45' }}
            >
              {/* Tower image - dominant, immersive */}
              <img
                src="/tiles/y-tower-main.png"
                alt="_y Tower"
                className="h-full w-auto object-contain select-none drop-shadow-2xl"
                draggable={false}
              />

              {/* Floor hotspot overlays */}
              {floors.map((floor) => {
                const pos = FLOOR_POSITIONS[floor.level];
                if (!pos) return null;
                const isHovered = hoveredFloor?.level === floor.level;
                const agentsToShow = floor.agents.slice(0, 6);

                return (
                  <button
                    key={floor.level}
                    onClick={() => handleFloorClick(floor)}
                    onMouseEnter={() => setHoveredFloor(floor)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    className="absolute left-[15%] right-[15%] floor-hotspot cursor-pointer group"
                    style={{
                      top: `${pos.top}%`,
                      height: `${pos.height}%`,
                    }}
                  >
                    {/* Hover glow border */}
                    <div
                      className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                        isHovered
                          ? 'border border-amber-400/40 bg-amber-400/[0.06] shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                          : 'border border-transparent'
                      }`}
                    />

                    {/* Agent avatars inside the tower */}
                    <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 flex gap-[2px] items-end">
                      {agentsToShow.map((agent) => (
                        <div
                          key={agent.id}
                          className={`w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] rounded-full border overflow-hidden bg-gray-900 transition-all duration-200 ${
                            isHovered
                              ? 'border-amber-400/60 shadow-[0_0_6px_rgba(251,191,36,0.4)] scale-110'
                              : 'border-white/20'
                          }`}
                          title={agent.name}
                        >
                          {agent.image && (
                            <img
                              src={agent.image}
                              alt={agent.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                      {floor.agents.length > 6 && (
                        <div className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] rounded-full bg-gray-800 border border-white/20 flex items-center justify-center text-[7px] text-gray-400 font-bold">
                          +{floor.agents.length - 6}
                        </div>
                      )}
                    </div>

                    {/* Floor tooltip on hover */}
                    {isHovered && !selectedFloor && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-30 pointer-events-none animate-fadeIn hidden sm:block">
                        <div className="glass-strong rounded-xl px-3 py-2 min-w-[180px] shadow-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">{floor.emoji}</span>
                            <div>
                              <div className="text-xs font-bold text-white">
                                {floor.label}
                              </div>
                              <div className="text-[10px] text-amber-400/80">
                                {lang === 'ko' ? floor.department : floor.departmentEn}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {floor.agents.map((a) => (
                              <span key={a.id} className="text-[9px] text-gray-400 bg-white/5 rounded px-1 py-0.5">
                                {a.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Floor label ON the tower (left side, subtle) */}
                    <div className={`absolute right-full mr-1 top-1/2 -translate-y-1/2 text-[9px] sm:text-[11px] font-bold transition-all duration-200 whitespace-nowrap ${
                      isHovered ? 'text-amber-400' : 'text-gray-500/60'
                    }`}>
                      {floor.label}
                    </div>
                  </button>
                );
              })}

              {/* Tower top label */}
              <div className="absolute top-[7%] left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <div className="text-[8px] sm:text-[10px] font-bold text-amber-400/40 tracking-[0.3em] uppercase">
                  _y Holdings
                </div>
              </div>
            </div>
          </div>

          {/* Bottom info bar (only when no floor selected) */}
          {!selectedFloor && (
            <div className="absolute bottom-0 left-0 right-0 text-center pb-3 z-10 pointer-events-none">
              <p className="text-[10px] text-gray-600">
                {lang === 'ko' ? '층을 클릭하여 탐색하세요' : 'Click a floor to explore'}
              </p>
            </div>
          )}
        </div>

        {/* ===== FLOOR DETAIL PANEL ===== */}
        {selectedFloor && (
          <div className="w-full md:w-[75%] h-full animate-slideIn">
            <FloorDetail
              floor={selectedFloor}
              tileUrl={FLOOR_TILES[selectedFloor.level]}
              onAgentClick={handleAgentClick}
              onClose={handleCloseFloor}
              lang={lang}
            />
          </div>
        )}

        {/* ===== AGENT CHAT PANEL ===== */}
        {selectedAgent && (
          <AgentChat
            agent={selectedAgent}
            onClose={handleCloseChat}
            lang={lang}
          />
        )}

        {/* ===== ACTIVITY FEED ===== */}
        {showActivity && (
          <ActivityFeed
            activities={activities}
            onClose={() => setShowActivity(false)}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}
