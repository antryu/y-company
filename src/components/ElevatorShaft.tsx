'use client';

import { AgentState } from '@/hooks/useSimulation';
import { Floor } from '@/data/floors';

interface ElevatorShaftProps {
  elevatorAgents: AgentState[];
  floors: Floor[];
}

export default function ElevatorShaft({ elevatorAgents, floors }: ElevatorShaftProps) {
  const totalFloors = floors.length;

  return (
    <div className="w-10 sm:w-14 shrink-0 border-l border-gray-700/20 bg-gray-900/30 relative">
      {/* Shaft label */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[6px] text-gray-600 font-mono z-10">
        ELV
      </div>

      {/* Shaft rail lines */}
      <div className="absolute inset-0 flex justify-between px-1">
        <div className="w-px h-full bg-gray-700/20" />
        <div className="w-px h-full bg-gray-700/20" />
      </div>

      {/* Floor markers */}
      {floors.map((floor, idx) => (
        <div
          key={floor.level}
          className="absolute left-0 right-0 border-b border-gray-700/15"
          style={{
            top: `${(idx / totalFloors) * 100}%`,
            height: `${100 / totalFloors}%`,
          }}
        >
          <div className="absolute right-1 top-1 text-[6px] text-gray-700 font-mono">
            {floor.label}
          </div>
        </div>
      ))}

      {/* Elevator cars (agents in transit) */}
      {elevatorAgents.map(agent => {
        // Calculate vertical position based on progress between floors
        const fromFloorIdx = floors.findIndex(f => f.level === agent.floor);
        const toFloorIdx = floors.findIndex(f => f.level === agent.elevatorTargetFloor);
        const currentIdx = fromFloorIdx + (toFloorIdx - fromFloorIdx) * agent.elevatorProgress;
        const topPercent = (currentIdx / totalFloors) * 100 + (100 / totalFloors / 2) - 3;

        return (
          <div
            key={agent.id}
            className="absolute left-1 right-1 transition-all duration-100 z-10"
            style={{ top: `${topPercent}%` }}
          >
            <div className="bg-gray-800 border border-cyan-500/30 rounded-sm px-0.5 py-0.5 flex items-center justify-center">
              <span className="text-[7px] text-cyan-400 font-mono truncate">
                {agent.name[0]}
              </span>
            </div>
          </div>
        );
      })}

      {/* Elevator cable */}
      <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-gray-600/30 via-gray-700/20 to-gray-600/30" />
    </div>
  );
}
