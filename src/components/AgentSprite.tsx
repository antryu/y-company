'use client';

import Image from 'next/image';
import { Agent } from '@/data/floors';

interface AgentSpriteProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
  floorColor: string;
}

export default function AgentSprite({ agent, onClick, floorColor }: AgentSpriteProps) {
  const isAndrew = agent.id === 'andrew';

  return (
    <button
      onClick={() => onClick(agent)}
      className="group relative flex flex-col items-center gap-0.5 transition-transform hover:scale-110 hover:-translate-y-1 cursor-pointer"
      title={`${agent.name} — ${agent.role}`}
    >
      {/* Status indicator */}
      <div
        className="absolute -top-1 -right-1 w-2 h-2 rounded-full z-10 animate-pulse"
        style={{
          backgroundColor:
            agent.status === 'working' ? '#2ECC71' :
            agent.status === 'meeting' ? '#F1C40F' : '#95A5A6',
          boxShadow: `0 0 4px ${
            agent.status === 'working' ? '#2ECC71' :
            agent.status === 'meeting' ? '#F1C40F' : '#95A5A6'
          }`,
        }}
      />

      {/* Agent avatar */}
      <div
        className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition-all group-hover:border-white/80"
        style={{
          borderColor: floorColor + '80',
          boxShadow: `0 0 8px ${floorColor}40`,
          backgroundColor: isAndrew ? '#1a1a2e' : undefined,
        }}
      >
        {isAndrew ? (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-yellow-400">
            A
          </div>
        ) : (
          <Image
            src={agent.image}
            alt={agent.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        )}
      </div>

      {/* Name label */}
      <span className="text-[9px] sm:text-[10px] text-gray-400 group-hover:text-white transition-colors font-mono whitespace-nowrap">
        {agent.name}
      </span>

      {/* Hover tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900/95 border border-gray-700 rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        <span className="text-[10px] text-gray-300">
          #{agent.number} {agent.name} — {agent.role}
        </span>
      </div>
    </button>
  );
}
