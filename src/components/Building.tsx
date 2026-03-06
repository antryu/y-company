'use client';

import { useState } from 'react';
import { floors, Floor, Agent } from '@/data/floors';
import FloorRow from './FloorRow';
import AgentPanel from './AgentPanel';

export default function Building() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const handleFloorClick = (floor: Floor) => {
    setSelectedFloor(selectedFloor === floor.level ? null : floor.level);
  };

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
  };

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

      {/* Header / Rooftop */}
      <header className="sticky top-0 z-30 bg-gray-950/90 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* DNA helix icon */}
            <div className="text-cyan-400 text-2xl">🧬</div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Andrew Tower
              </h1>
              <p className="text-[10px] sm:text-xs text-cyan-500/70 font-mono">
                _y Holdings HQ — 29 Agents Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] text-green-400 font-mono">LIVE</span>
          </div>
        </div>
      </header>

      {/* Rooftop decoration */}
      <div className="max-w-4xl mx-auto">
        <div className="relative mx-2 sm:mx-4">
          {/* Antenna */}
          <div className="flex justify-center py-2">
            <div className="flex flex-col items-center">
              <div className="w-px h-6 bg-gradient-to-t from-cyan-500/50 to-transparent" />
              <div className="w-3 h-3 border border-cyan-500/50 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
              </div>
              <div className="text-[8px] text-cyan-500/40 font-mono mt-1">
                _y HOLDINGS
              </div>
            </div>
          </div>

          {/* Building exterior frame */}
          <div className="relative border-x-2 border-t-2 border-gray-700/30 rounded-t-lg overflow-hidden">
            {/* Glass wall shimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

            {/* Floors */}
            {floors.map((floor) => (
              <FloorRow
                key={floor.level}
                floor={floor}
                isSelected={selectedFloor === floor.level}
                onFloorClick={handleFloorClick}
                onAgentClick={handleAgentClick}
              />
            ))}
          </div>

          {/* Building base */}
          <div className="h-4 bg-gradient-to-b from-gray-800 to-gray-900 border-x-2 border-b-2 border-gray-700/30 rounded-b-lg" />

          {/* Ground */}
          <div className="h-2 bg-gradient-to-b from-gray-900 to-transparent mx-4 rounded-b-full opacity-50" />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-700 text-[10px] font-mono">
        _y Holdings Interactive Company Simulator v1.0
      </footer>

      {/* Agent detail panel */}
      <AgentPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
    </div>
  );
}
