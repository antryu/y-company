'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLang } from '@/context/LangContext';
import { floors, Floor, Agent } from '@/data/floors';
import {
  initializeSimulation,
  simulationStep,
  getAllSimAgents,
  getActivityLog,
  seedInitialActivities,
  SimAgent,
  ActivityLogEntry,
} from '@/engine/simulation';
import { FloorDetail } from './FloorDetail';
import { AgentChat } from './AgentChat';
import { ActivityFeed } from './ActivityFeed';

const FLOOR_TILES: Record<number, string> = {
  1: '/tiles/floor-1-lobby.png',
  2: '/tiles/floor-2-capital.png',
  3: '/tiles/floor-3-hr.png',
  4: '/tiles/floor-4-ict.png',
  5: '/tiles/floor-5-marketing.png',
  6: '/tiles/floor-6-content.png',
  7: '/tiles/floor-7-dev.png',
  8: '/tiles/floor-8-risk.png',
  9: '/tiles/floor-9-planning.png',
  10: '/tiles/floor-10-chairman.png',
};

export function TowerView() {
  const { lang, setLang, text } = useLang();
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showFeed, setShowFeed] = useState(false);
  const [simAgents, setSimAgents] = useState<SimAgent[]>([]);
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [initialized, setInitialized] = useState(false);
  const towerRef = useRef<HTMLDivElement>(null);

  // Initialize simulation
  useEffect(() => {
    initializeSimulation();
    seedInitialActivities();
    setSimAgents(getAllSimAgents());
    setActivities(getActivityLog(30));
    setInitialized(true);
  }, []);

  // Simulation tick
  useEffect(() => {
    if (!initialized) return;
    const interval = setInterval(() => {
      const newActs = simulationStep();
      setSimAgents([...getAllSimAgents()]);
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

  const handleBack = useCallback(() => {
    if (selectedAgent) {
      setSelectedAgent(null);
    } else {
      setSelectedFloor(null);
    }
  }, [selectedAgent]);

  // Get agents on a floor from sim
  const getFloorAgents = useCallback(
    (level: number) => simAgents.filter((s) => s.agent.floor === level),
    [simAgents]
  );

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-gray-950 select-none">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-gray-950/95 to-transparent">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-white tracking-tight">_y Holdings</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded animate-pulse">
            {text.live}
          </span>
        </div>
        <button
          onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
          className="px-2 py-1 text-xs font-medium text-gray-300 bg-gray-800/80 rounded-md hover:bg-gray-700 transition-colors"
        >
          {lang === 'ko' ? 'EN' : '한'}
        </button>
      </header>

      {/* Main Content */}
      {!selectedFloor ? (
        /* Tower View */
        <div className="w-full h-full flex flex-col">
          {/* Tower Image with floor hotspots */}
          <div
            ref={towerRef}
            className="flex-1 relative overflow-y-auto overflow-x-hidden"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="relative w-full min-h-full flex items-center justify-center pt-12 pb-20">
              <div className="relative">
                {/* Tower Image */}
                <img
                  src="/tiles/y-tower-main.png"
                  alt="_y Tower"
                  className="w-[85vw] max-w-[500px] h-auto"
                  draggable={false}
                />
                {/* Floor Hotspot Overlays */}
                <div className="absolute inset-0">
                  {floors.map((floor) => {
                    const floorAgents = getFloorAgents(floor.level);
                    // Position each floor hotspot — tower image has 10 floors
                    // Floor 10 is at top (~5%), Floor 1 at bottom (~90%)
                    const topPercent = 5 + (10 - floor.level) * 8.5;
                    return (
                      <button
                        key={floor.level}
                        onClick={() => handleFloorClick(floor)}
                        className="absolute left-0 right-0 group cursor-pointer"
                        style={{
                          top: `${topPercent}%`,
                          height: '8.5%',
                        }}
                      >
                        {/* Floor label */}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
                            {floor.label}
                          </span>
                        </div>

                        {/* Hover highlight */}
                        <div className="absolute inset-x-[10%] inset-y-0 rounded-sm border border-transparent group-hover:border-white/30 group-hover:bg-white/5 transition-all duration-200" />

                        {/* Agent thumbnails */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex -space-x-1.5">
                          {floorAgents.slice(0, 4).map((sa) => (
                            <div
                              key={sa.agent.id}
                              className="w-5 h-5 rounded-full border border-white/40 overflow-hidden bg-gray-800 shadow-sm"
                            >
                              {sa.agent.image && (
                                <img
                                  src={sa.agent.image}
                                  alt={sa.agent.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                          {floorAgents.length > 4 && (
                            <div className="w-5 h-5 rounded-full bg-gray-700 border border-white/40 flex items-center justify-center">
                              <span className="text-[7px] text-white font-bold">
                                +{floorAgents.length - 4}
                              </span>
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

          {/* Activity Feed Toggle */}
          <button
            onClick={() => setShowFeed(!showFeed)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-gray-800/90 backdrop-blur-sm rounded-full text-xs text-gray-300 hover:text-white hover:bg-gray-700 transition-all border border-gray-700/50"
          >
            {showFeed ? '✕ ' : '📋 '}
            {text.activityFeed}
          </button>

          {/* Activity Feed Panel */}
          {showFeed && (
            <ActivityFeed activities={activities} onClose={() => setShowFeed(false)} />
          )}
        </div>
      ) : (
        /* Floor Detail View */
        <div className="w-full h-full">
          <FloorDetail
            floor={selectedFloor}
            floorTile={FLOOR_TILES[selectedFloor.level]}
            agents={getFloorAgents(selectedFloor.level)}
            onAgentClick={handleAgentClick}
            onBack={handleBack}
          />
        </div>
      )}

      {/* Agent Chat Panel */}
      {selectedAgent && (
        <AgentChat agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
}
