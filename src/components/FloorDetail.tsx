'use client';

import { useState, useEffect } from 'react';
import { Floor, Agent } from '@/data/floors';
import { Lang } from '@/data/i18n';

interface Props {
  floor: Floor;
  tileUrl: string;
  onAgentClick: (agent: Agent) => void;
  onClose: () => void;
  lang: Lang;
}

// Predefined agent positions as percentages (x%, y%) within the floor tile
function getAgentPositions(count: number): { x: number; y: number }[] {
  // Distribute agents across the floor space
  const positions: { x: number; y: number }[] = [];
  const rows = count <= 3 ? 1 : count <= 6 ? 2 : 3;
  const cols = Math.ceil(count / rows);
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const colsInRow = Math.min(cols, count - row * cols);
    positions.push({
      x: 15 + ((col + 0.5) / colsInRow) * 70,
      y: 30 + ((row + 0.5) / rows) * 50,
    });
  }
  return positions;
}

export function FloorDetail({ floor, tileUrl, onAgentClick, onClose, lang }: Props) {
  const [agentAnimations, setAgentAnimations] = useState<Record<string, { dx: number; bobPhase: number }>>({});

  useEffect(() => {
    // Initialize random animation phases
    const anims: Record<string, { dx: number; bobPhase: number }> = {};
    floor.agents.forEach((agent) => {
      anims[agent.id] = { dx: 0, bobPhase: Math.random() * Math.PI * 2 };
    });
    setAgentAnimations(anims);

    // Gentle drift animation
    const interval = setInterval(() => {
      setAgentAnimations((prev) => {
        const next = { ...prev };
        for (const id of Object.keys(next)) {
          next[id] = {
            dx: Math.sin(Date.now() / 3000 + next[id].bobPhase) * 8,
            bobPhase: next[id].bobPhase,
          };
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [floor]);

  const positions = getAgentPositions(floor.agents.length);

  return (
    <div className="h-full flex flex-col bg-[#0a0f1a] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f1520]/90 backdrop-blur border-b border-white/5 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition text-sm"
          >
            ←
          </button>
          <span className="text-lg">{floor.emoji}</span>
          <div>
            <h2 className="text-sm font-bold text-white">
              {floor.label} — {lang === 'ko' ? floor.department : floor.departmentEn}
            </h2>
            <p className="text-[10px] text-gray-500">
              {floor.agents.length} {lang === 'ko' ? '명 에이전트' : 'agents'}
            </p>
          </div>
        </div>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: floor.color }}
        />
      </div>

      {/* Floor tile with agents */}
      <div className="flex-1 relative overflow-hidden">
        {/* Floor background image */}
        <img
          src={tileUrl}
          alt={`${floor.label} interior`}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          draggable={false}
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/60 via-transparent to-[#0a0f1a]/30" />

        {/* Agent sprites */}
        {floor.agents.map((agent, idx) => {
          const pos = positions[idx];
          const anim = agentAnimations[agent.id] || { dx: 0, bobPhase: 0 };
          const bobY = Math.sin(Date.now() / 600 + (anim.bobPhase || 0)) * 3;

          return (
            <button
              key={agent.id}
              onClick={() => onAgentClick(agent)}
              className="absolute group cursor-pointer"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) translate(${anim.dx}px, ${bobY}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              {/* Agent avatar */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 overflow-hidden bg-gray-800 shadow-lg shadow-black/50 group-hover:border-white/80 group-hover:scale-110 transition-all duration-200"
                style={{ borderColor: floor.color + '80' }}
              >
                {agent.image ? (
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
                    {agent.name[0]}
                  </div>
                )}
              </div>

              {/* Agent name tag */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium bg-black/70 text-white backdrop-blur">
                  {agent.name}
                </span>
              </div>

              {/* Status indicator */}
              <div
                className="absolute top-0 right-0 w-3 h-3 rounded-full border border-black"
                style={{
                  backgroundColor:
                    agent.status === 'working' ? '#22c55e' :
                    agent.status === 'meeting' ? '#f59e0b' : '#6b7280',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
