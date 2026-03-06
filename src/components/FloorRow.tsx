'use client';

import { Floor, Agent } from '@/data/floors';
import AgentSprite from './AgentSprite';

interface FloorRowProps {
  floor: Floor;
  isSelected: boolean;
  onFloorClick: (floor: Floor) => void;
  onAgentClick: (agent: Agent) => void;
}

export default function FloorRow({
  floor,
  isSelected,
  onFloorClick,
  onAgentClick,
}: FloorRowProps) {
  return (
    <div
      className={`
        relative group transition-all duration-300
        ${isSelected ? 'scale-[1.02] z-10' : 'hover:scale-[1.01]'}
      `}
    >
      {/* Floor container */}
      <div
        className={`
          relative flex items-stretch border-b border-gray-800/50
          transition-all duration-300 cursor-pointer
          ${isSelected
            ? 'bg-gray-800/60 shadow-lg'
            : 'bg-gray-900/40 hover:bg-gray-800/30'
          }
        `}
        onClick={() => onFloorClick(floor)}
        style={{
          borderLeft: `3px solid ${floor.color}${isSelected ? 'FF' : '40'}`,
        }}
      >
        {/* Glass wall effect - left */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 opacity-30"
          style={{ backgroundColor: floor.color }}
        />

        {/* Floor label */}
        <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center justify-center py-3 border-r border-gray-800/30">
          <span className="text-lg sm:text-xl">{floor.emoji}</span>
          <span
            className="text-[10px] sm:text-xs font-bold font-mono"
            style={{ color: floor.color }}
          >
            {floor.label}
          </span>
        </div>

        {/* Floor interior */}
        <div className="flex-1 px-3 sm:px-4 py-3 min-h-[80px] sm:min-h-[90px]">
          {/* Department name */}
          <div className="flex items-center gap-2 mb-2">
            <h3
              className="text-xs sm:text-sm font-semibold"
              style={{ color: floor.color }}
            >
              {floor.department}
            </h3>
            <span className="text-[9px] text-gray-600 hidden sm:inline">
              {floor.departmentEn}
            </span>
          </div>

          {/* Agents row */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-end">
            {floor.agents.map((agent) => (
              <AgentSprite
                key={agent.id}
                agent={agent}
                onClick={onAgentClick}
                floorColor={floor.color}
              />
            ))}

            {/* Desk/furniture decorations */}
            {floor.level !== 10 && (
              <div className="flex items-end gap-1 ml-auto opacity-20">
                {Array.from({ length: Math.min(floor.agents.length, 3) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-3 rounded-t-sm"
                    style={{ backgroundColor: floor.color + '40' }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Glass wall effect - right */}
        <div className="w-3 sm:w-4 shrink-0 border-l border-gray-700/20 bg-gradient-to-r from-transparent to-gray-800/30" />
      </div>

      {/* Selection glow */}
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none rounded-sm"
          style={{
            boxShadow: `inset 0 0 20px ${floor.color}15, 0 0 15px ${floor.color}10`,
          }}
        />
      )}
    </div>
  );
}
