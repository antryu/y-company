'use client';

import Image from 'next/image';
import { Agent } from '@/data/floors';

interface AgentSpriteProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
  floorColor: string;
  animated?: boolean;
  status?: string;
  activity?: string;
  isVisitor?: boolean;
}

export default function AgentSprite({
  agent,
  onClick,
  floorColor,
  animated = false,
  status = 'working',
  activity,
  isVisitor = false,
}: AgentSpriteProps) {
  const isAndrew = agent.id === 'andrew';

  const statusColor =
    status === 'working' ? '#2ECC71' :
    status === 'meeting' ? '#F1C40F' :
    status === 'reporting' ? '#E74C3C' : '#95A5A6';

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(agent); }}
      className={`group relative flex flex-col items-center gap-0.5 cursor-pointer
        ${animated ? '' : 'transition-transform hover:scale-110 hover:-translate-y-1'}
        ${isVisitor ? 'opacity-60' : ''}
      `}
      title={activity || `${agent.name} — ${agent.role}`}
    >
      {/* Status indicator */}
      <div
        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full z-10"
        style={{
          backgroundColor: statusColor,
          boxShadow: `0 0 4px ${statusColor}`,
          animation: status === 'working' ? 'pulse 2s infinite' : undefined,
        }}
      />

      {/* Agent avatar */}
      <div
        className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden border-2 transition-all group-hover:border-white/80 group-hover:shadow-lg"
        style={{
          borderColor: floorColor + '80',
          boxShadow: `0 0 8px ${floorColor}30`,
          backgroundColor: isAndrew ? '#1a1a2e' : '#111827',
        }}
      >
        {isAndrew ? (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-yellow-400 bg-gradient-to-br from-yellow-900/30 to-gray-900">
            A
          </div>
        ) : agent.image ? (
          <Image
            src={agent.image}
            alt={agent.name}
            fill
            className="object-cover"
            sizes="44px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: floorColor }}>
            {agent.name[0]}
          </div>
        )}
      </div>

      {/* Name label */}
      <span className="text-[8px] sm:text-[9px] text-gray-400 group-hover:text-white transition-colors font-mono whitespace-nowrap">
        {agent.name}
      </span>

      {/* Activity tooltip */}
      {activity && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900/95 border border-gray-700 rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 max-w-[180px] truncate">
          <span className="text-[9px] text-gray-300">{activity}</span>
        </div>
      )}
    </button>
  );
}
