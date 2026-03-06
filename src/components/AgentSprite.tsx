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
      className={`group/agent relative flex flex-col items-center gap-0 cursor-pointer
        ${isVisitor ? 'opacity-50' : ''}
      `}
      title={activity || `${agent.name} — ${agent.role}`}
    >
      {/* Status bubble */}
      <div
        className="absolute -top-1 -right-1 w-[6px] h-[6px] rounded-full z-20"
        style={{
          backgroundColor: statusColor,
          boxShadow: `0 0 4px ${statusColor}80`,
          animation: status === 'working' ? 'pulse 2.5s infinite' : undefined,
        }}
      />

      {/* Agent body container */}
      <div className="agent-avatar relative flex flex-col items-center">
        {/* Activity tooltip */}
        {activity && (
          <div className="absolute -top-[22px] left-1/2 -translate-x-1/2 bg-gray-900/95 border border-gray-700/50 rounded px-1.5 py-0.5 opacity-0 group-hover/agent:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 max-w-[150px] truncate shadow-lg">
            <span className="text-[7px] text-gray-300 font-mono">{activity}</span>
          </div>
        )}

        {/* Avatar circle */}
        <div
          className="relative rounded-full overflow-hidden border-2 transition-all"
          style={{
            width: isAndrew ? '36px' : '30px',
            height: isAndrew ? '36px' : '30px',
            borderColor: isVisitor ? 'rgba(150, 150, 170, 0.3)' : floorColor + '70',
            boxShadow: `0 2px 8px ${floorColor}20, 0 0 0 1px rgba(0,0,0,0.3)`,
            background: '#111827',
          }}
        >
          {isAndrew ? (
            <div className="w-full h-full flex items-center justify-center text-base font-bold text-yellow-400 bg-gradient-to-br from-yellow-900/40 to-gray-900">
              A
            </div>
          ) : agent.image ? (
            <Image
              src={agent.image}
              alt={agent.name}
              fill
              className="object-cover"
              sizes="30px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ color: floorColor }}>
              {agent.name[0]}
            </div>
          )}
        </div>

        {/* Shadow under agent */}
        <div className="agent-shadow" />
      </div>

      {/* Name label */}
      <span className="agent-name text-[7px] sm:text-[8px] text-gray-500 group-hover/agent:text-white transition-colors font-mono whitespace-nowrap mt-[-1px] opacity-80">
        {agent.name}
      </span>
    </button>
  );
}
