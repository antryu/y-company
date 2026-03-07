'use client';

import { useState, useEffect } from 'react';
import { Floor, Agent } from '@/data/floors';
import { Lang } from '@/data/i18n';
import { agentSkills } from '@/data/skills';

interface Props {
  floor: Floor;
  tileUrl: string;
  onAgentClick: (agent: Agent) => void;
  onClose: () => void;
  lang: Lang;
}

// Grid positions for agents across the floor space
function getAgentPositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  if (count === 1) {
    positions.push({ x: 50, y: 50 });
  } else if (count === 2) {
    positions.push({ x: 35, y: 50 }, { x: 65, y: 50 });
  } else if (count === 3) {
    positions.push({ x: 25, y: 50 }, { x: 50, y: 45 }, { x: 75, y: 50 });
  } else {
    const rows = count <= 4 ? 1 : count <= 6 ? 2 : 3;
    const cols = Math.ceil(count / rows);
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const colsInRow = Math.min(cols, count - row * cols);
      positions.push({
        x: 12 + ((col + 0.5) / colsInRow) * 76,
        y: 25 + ((row + 0.5) / rows) * 55,
      });
    }
  }
  return positions;
}

export function FloorDetail({ floor, tileUrl, onAgentClick, onClose, lang }: Props) {
  const [agentBobs, setAgentBobs] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay for entrance animation
    const t = setTimeout(() => setReady(true), 50);
    const phases: Record<string, number> = {};
    floor.agents.forEach((a) => {
      phases[a.id] = Math.random() * Math.PI * 2;
    });
    setAgentBobs(phases);
    return () => clearTimeout(t);
  }, [floor]);

  const positions = getAgentPositions(floor.agents.length);

  return (
    <div className="h-full flex flex-col bg-[#060b14] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 glass-strong z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg glass hover:bg-white/10 text-gray-400 hover:text-white transition text-sm"
          >
            ←
          </button>
          <span className="text-xl">{floor.emoji}</span>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              {floor.label}
              <span className="text-amber-400/80 font-normal text-xs">
                {lang === 'ko' ? floor.department : floor.departmentEn}
              </span>
            </h2>
            <p className="text-[10px] text-gray-500">
              {floor.agents.length} {lang === 'ko' ? '명 에이전트 활동 중' : 'agents active'}
            </p>
          </div>
        </div>
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: floor.color, boxShadow: `0 0 8px ${floor.color}60` }}
        />
      </div>

      {/* Floor tile background with agents */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background image — bright, vivid */}
        <img
          src={tileUrl}
          alt={`${floor.label} interior`}
          className="absolute inset-0 w-full h-full object-cover opacity-90"
          draggable={false}
        />

        {/* Light vignette only at edges */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060b14]/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(6,11,20,0.4)_100%)]" />

        {/* Agent cards floating over the floor */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
          {floor.agents.map((agent, idx) => {
            const pos = positions[idx];
            const phase = agentBobs[agent.id] || 0;
            const skills = agentSkills[agent.id.replace(/^(andrew)$/, '')]?.skills?.slice(0, 3) || [];
            const statusColor =
              agent.status === 'working' ? '#22c55e' :
              agent.status === 'meeting' ? '#f59e0b' : '#6b7280';

            return (
              <button
                key={agent.id}
                onClick={() => onAgentClick(agent)}
                className="absolute group cursor-pointer animate-fadeInUp"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                {/* Card container */}
                <div className="flex flex-col items-center gap-1.5 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
                  {/* Holographic avatar card */}
                  <div className="relative">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-110 ring-1 ring-white/10 group-hover:ring-amber-400/30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      {agent.image ? (
                        <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-amber-400/60 bg-gradient-to-br from-gray-800/80 to-gray-900/80">
                          {agent.name[0]}
                        </div>
                      )}
                    </div>

                    {/* Status dot */}
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#060b14]"
                      style={{
                        backgroundColor: statusColor,
                        boxShadow: `0 0 6px ${statusColor}80`,
                      }}
                    />
                  </div>

                  {/* Name tag — minimal, clean */}
                  <div className="text-center min-w-[50px]">
                    <div className="text-[10px] sm:text-xs font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] truncate">
                      {agent.name}
                    </div>
                    <div className="text-[7px] sm:text-[8px] text-gray-300/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate">
                      {agent.role}
                    </div>
                  </div>

                  {/* Skill tags on hover */}
                  {skills.length > 0 && (
                    <div className="hidden group-hover:flex flex-wrap gap-0.5 justify-center max-w-[140px] animate-fadeIn">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300/80 border border-amber-400/10 whitespace-nowrap"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Floor info bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#060b14] via-[#060b14]/80 to-transparent pointer-events-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{floor.emoji}</span>
              <span className="text-xs text-gray-400">
                {lang === 'ko' ? floor.department : floor.departmentEn}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Status counts */}
              {(() => {
                const working = floor.agents.filter(a => a.status === 'working').length;
                const meeting = floor.agents.filter(a => a.status === 'meeting').length;
                return (
                  <>
                    {working > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-green-400/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {working}
                      </span>
                    )}
                    {meeting > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {meeting}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
