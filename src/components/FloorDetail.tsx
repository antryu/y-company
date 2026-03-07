'use client';

import { useLang } from '@/context/LangContext';
import { Floor } from '@/data/floors';
import { SimAgent } from '@/engine/simulation';

interface Props {
  floor: Floor;
  floorTile: string;
  agents: SimAgent[];
  onAgentClick: (agent: SimAgent['agent']) => void;
  onBack: () => void;
}

export function FloorDetail({ floor, floorTile, agents, onAgentClick, onBack }: Props) {
  const { text } = useLang();

  return (
    <div className="w-full h-full flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 pt-14 bg-gray-900/95 border-b border-gray-800">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors text-white"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{floor.emoji}</span>
            <h2 className="text-base font-bold text-white truncate">
              {floor.label} — {floor.department}
            </h2>
          </div>
          <p className="text-xs text-gray-400">{floor.departmentEn}</p>
        </div>
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: floor.color }}
        />
      </div>

      {/* Floor Tile Image */}
      <div className="relative flex-shrink-0 w-full bg-gray-900">
        <img
          src={floorTile}
          alt={`${floor.label} - ${floor.department}`}
          className="w-full h-auto max-h-[40vh] object-contain"
          draggable={false}
        />
        {/* Animated agent sprites on the floor */}
        <div className="absolute inset-0">
          {agents.map((sa, i) => {
            const totalAgents = agents.length;
            // Spread agents across the floor image
            const leftPct = 15 + (i / Math.max(totalAgents - 1, 1)) * 65;
            const topPct = 55 + (i % 2 === 0 ? 0 : 10);
            return (
              <button
                key={sa.agent.id}
                onClick={() => onAgentClick(sa.agent)}
                className="absolute group cursor-pointer"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="relative"
                  style={{
                    animation: `agentBob 2s ease-in-out infinite ${i * 0.3}s, agentDrift 6s ease-in-out infinite ${i * 0.5}s`,
                  }}
                >
                  <div className="w-10 h-10 rounded-full border-2 border-white/60 overflow-hidden bg-gray-800 shadow-lg shadow-black/50 group-hover:border-white group-hover:scale-110 transition-all">
                    {sa.agent.image ? (
                      <img
                        src={sa.agent.image}
                        alt={sa.agent.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">
                        👤
                      </div>
                    )}
                  </div>
                  {/* Name tag */}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[9px] font-medium text-white bg-black/70 px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
                      {sa.agent.name}
                    </span>
                  </div>
                  {/* Status indicator */}
                  <div
                    className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border border-gray-900"
                    style={{
                      backgroundColor:
                        sa.state === 'working'
                          ? '#22c55e'
                          : sa.state === 'meeting'
                          ? '#eab308'
                          : sa.state === 'idle'
                          ? '#6b7280'
                          : '#3b82f6',
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {text.department} · {agents.length}명
        </h3>
        {agents.map((sa) => (
          <button
            key={sa.agent.id}
            onClick={() => onAgentClick(sa.agent)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 transition-all text-left"
          >
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-700 border border-gray-600">
                {sa.agent.image ? (
                  <img src={sa.agent.image} alt={sa.agent.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                )}
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-800"
                style={{
                  backgroundColor:
                    sa.state === 'working' ? '#22c55e' : sa.state === 'meeting' ? '#eab308' : '#6b7280',
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{sa.agent.name}</span>
                <span className="text-[10px] text-gray-400">{sa.agent.number}</span>
              </div>
              <p className="text-xs text-gray-400 truncate">{sa.agent.role}</p>
              <p className="text-[10px] text-gray-500 truncate mt-0.5">{sa.lastActivity}</p>
            </div>
            <span className="text-gray-500 text-sm">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
