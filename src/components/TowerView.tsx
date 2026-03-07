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
// Calibrated to actual tower image pixel analysis
// Building starts at ~17% (10F top) and ends at ~88% (1F bottom)
const FLOOR_POSITIONS: Record<number, { top: number; height: number }> = {
  10: { top: 19, height: 6 },
  9:  { top: 25, height: 7 },
  8:  { top: 31, height: 6 },
  7:  { top: 37, height: 7 },
  6:  { top: 44, height: 7 },
  5:  { top: 51, height: 7 },
  4:  { top: 58, height: 7 },
  3:  { top: 65, height: 7 },
  2:  { top: 72, height: 8 },
  1:  { top: 80, height: 8 },
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
      {/* Header — minimal, floating */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-lg sm:text-xl font-light text-white/90 tracking-widest">
            <span className="font-bold text-amber-400">_y</span>
            <span className="text-white/50 ml-1 text-sm hidden sm:inline">TOWER</span>
          </h1>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-green-500/20 bg-green-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400/80 text-[9px] font-medium tracking-wider uppercase">{text.live}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowActivity(!showActivity)}
            className="px-3 py-1.5 text-[10px] tracking-wider uppercase rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200"
          >
            {text.activityFeed}
          </button>
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-400 hover:text-white text-xs transition-all duration-200"
          >
            {lang === 'ko' ? 'EN' : '한'}
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
          {/* Rich atmospheric background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c1829] via-[#060e1a] to-[#020408]" />
          
          {/* Ambient glow layers */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full bg-amber-500/[0.02] blur-[100px]" />
            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[60%] h-[30%] rounded-full bg-blue-500/[0.02] blur-[80px]" />
          </div>

          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[2px] h-[2px] rounded-full bg-amber-400/30 animate-float-particle"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.7}s`,
                  animationDuration: `${6 + Math.random() * 8}s`,
                }}
              />
            ))}
          </div>

          {/* Scanning light effect across tower */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-scan-line" />
          </div>

          {/* Tower container */}
          <div
            ref={towerRef}
            className="relative z-10 flex items-center justify-center w-full h-full p-2 sm:p-4"
          >
            <div
              className={`relative transition-all duration-500 ${
                selectedFloor ? 'h-[90%]' : 'h-[88vh] sm:h-[92vh]'
              }`}
              style={{ aspectRatio: '1' }}
            >
              {/* Tower image with ambient glow animation */}
              <div className="relative h-full w-full">
                <img
                  src="/tiles/y-tower-main.png"
                  alt="_y Tower"
                  className="h-full w-full object-contain select-none drop-shadow-2xl"
                  draggable={false}
                />
                {/* Warm pulsing glow overlay on tower windows */}
                <div className="absolute inset-0 mix-blend-soft-light animate-tower-glow opacity-30 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse 40% 60% at 50% 50%, rgba(251,191,36,0.3), transparent)',
                  }}
                />
                {/* Moving light streak */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute w-[120%] h-[1px] bg-gradient-to-r from-transparent via-white/8 to-transparent animate-light-streak"
                    style={{ transform: 'rotate(-15deg)' }}
                  />
                </div>
              </div>

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
                    className="absolute left-[25%] right-[25%] floor-hotspot cursor-pointer group"
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

                    {/* Agent count badge */}
                    <div className={`absolute bottom-[10%] left-1/2 -translate-x-1/2 flex items-center gap-1 transition-all duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-50'
                    }`}>
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-medium ${
                        isHovered
                          ? 'bg-amber-400/20 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]'
                          : 'bg-white/5 text-gray-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-amber-400' : 'bg-green-400'}`} />
                        {floor.agents.length}
                      </div>
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

                    {/* Floor label — left side with dark pill background */}
                    <div className={`absolute right-full mr-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap ${
                      isHovered ? 'opacity-100' : 'opacity-80'
                    }`}>
                      <div className={`text-right px-2 py-1 rounded-lg ${
                        isHovered ? 'bg-amber-400/20 backdrop-blur-sm' : 'bg-black/50 backdrop-blur-sm'
                      }`}>
                        <div className={`text-[11px] sm:text-[13px] font-bold tracking-tight ${
                          isHovered ? 'text-amber-400' : 'text-white'
                        }`}>
                          {floor.label}
                        </div>
                        <div className={`text-[8px] sm:text-[10px] ${
                          isHovered ? 'text-amber-300/80' : 'text-gray-300/80'
                        }`}>
                          {lang === 'ko' ? floor.department : floor.departmentEn}
                        </div>
                      </div>
                      {/* Connector line */}
                      <div className={`w-3 h-[1px] ${isHovered ? 'bg-amber-400/60' : 'bg-white/30'}`} />
                    </div>
                  </button>
                );
              })}

              {/* Tower top label — elegant branding above crown */}
              <div className="absolute top-[2%] left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <div className="text-[9px] sm:text-[11px] font-light text-amber-400/30 tracking-[0.5em] uppercase">
                  _y Holdings
                </div>
                <div className="mt-0.5 w-8 h-[1px] mx-auto bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
              </div>
            </div>
          </div>

          {/* Bottom info bar */}
          {!selectedFloor && (
            <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
              <div className="bg-gradient-to-t from-[#020408] via-[#020408]/60 to-transparent pt-12 pb-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 tracking-wider">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-green-500/60" />
                      29 {lang === 'ko' ? '에이전트' : 'agents'}
                    </span>
                    <span className="text-gray-700">•</span>
                    <span>10 {lang === 'ko' ? '층' : 'floors'}</span>
                    <span className="text-gray-700">•</span>
                    <span>5 {lang === 'ko' ? '사업부' : 'divisions'}</span>
                  </div>
                  <p className="text-[9px] text-gray-600/60 tracking-widest uppercase">
                    {lang === 'ko' ? '층을 클릭하여 탐색하세요' : 'Click a floor to explore'}
                  </p>
                </div>
              </div>
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
