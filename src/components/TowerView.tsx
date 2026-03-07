'use client';

import { useState, useEffect, useCallback } from 'react';
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

export function TowerView() {
  const { lang, setLang, text } = useLang();
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [initialized, setInitialized] = useState(false);

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
      <header className="flex items-center justify-between px-4 py-2 bg-[#0a0f1a]/90 backdrop-blur border-b border-white/5 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            _y Holdings · <span className="text-amber-400">_y Tower</span>
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold animate-pulse">
            {text.live}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowActivity(!showActivity)}
            className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-gray-300 transition"
          >
            📋 {text.activityFeed}
          </button>
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-gray-300 transition"
          >
            {lang === 'ko' ? '🇺🇸 EN' : '🇰🇷 한'}
          </button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Tower column */}
        <div
          className={`transition-all duration-500 ease-out flex flex-col items-center justify-center relative
            ${selectedFloor ? 'hidden md:flex md:w-[30%]' : 'w-full'}
          `}
        >
          {/* Tower container */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative max-h-full" style={{ aspectRatio: '0.45' }}>
              {/* Tower image */}
              <img
                src="/tiles/y-tower-main.png"
                alt="_y Tower"
                className="h-full w-auto object-contain select-none"
                draggable={false}
              />

              {/* Floor hotspots overlay */}
              <div className="absolute inset-0 flex flex-col">
                {floors.map((floor) => {
                  const floorIndex = 10 - floor.level;
                  // Each floor occupies ~8.5% of the tower height, starting from ~7% from top
                  const topPercent = 7 + floorIndex * 8.5;
                  return (
                    <button
                      key={floor.level}
                      onClick={() => handleFloorClick(floor)}
                      className="absolute left-[10%] right-[10%] group cursor-pointer"
                      style={{
                        top: `${topPercent}%`,
                        height: '8.5%',
                      }}
                      title={`${floor.label} - ${lang === 'ko' ? floor.department : floor.departmentEn}`}
                    >
                      {/* Hover highlight */}
                      <div className="absolute inset-0 rounded-md bg-white/0 group-hover:bg-white/10 transition-all duration-200 border border-transparent group-hover:border-white/20" />

                      {/* Floor label */}
                      <div className="absolute -left-[35%] top-1/2 -translate-y-1/2 text-[10px] sm:text-xs font-bold text-gray-400 group-hover:text-white transition whitespace-nowrap">
                        {floor.label}
                      </div>

                      {/* Agent dots */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {floor.agents.slice(0, 6).map((agent) => (
                          <div
                            key={agent.id}
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-white/30 overflow-hidden bg-gray-800"
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
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gray-700 flex items-center justify-center text-[6px] text-gray-300">
                            +{floor.agents.length - 6}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Floor detail panel */}
        {selectedFloor && (
          <div className="w-full md:w-[70%] h-full animate-slideIn">
            <FloorDetail
              floor={selectedFloor}
              tileUrl={FLOOR_TILES[selectedFloor.level]}
              onAgentClick={handleAgentClick}
              onClose={handleCloseFloor}
              lang={lang}
            />
          </div>
        )}

        {/* Agent chat panel */}
        {selectedAgent && (
          <AgentChat
            agent={selectedAgent}
            onClose={handleCloseChat}
            lang={lang}
          />
        )}

        {/* Activity feed overlay */}
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
