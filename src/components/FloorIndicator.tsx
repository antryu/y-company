'use client';

import { floors } from '@/data/floors';

interface FloorIndicatorProps {
  currentFloor: number;
  onFloorClick: (level: number) => void;
}

export default function FloorIndicator({ currentFloor, onFloorClick }: FloorIndicatorProps) {
  return (
    <div className="fixed left-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex flex-col gap-1">
      {floors.map(floor => {
        const isActive = currentFloor === floor.level;
        return (
          <button
            key={floor.level}
            onClick={() => onFloorClick(floor.level)}
            className={`
              w-8 h-6 rounded-sm text-[8px] font-mono font-bold transition-all cursor-pointer
              flex items-center justify-center
              ${isActive
                ? 'text-white scale-110 shadow-lg'
                : 'text-gray-600 hover:text-gray-400 hover:scale-105'
              }
            `}
            style={{
              backgroundColor: isActive ? floor.color + '40' : 'transparent',
              borderLeft: isActive ? `2px solid ${floor.color}` : '2px solid transparent',
            }}
            title={`${floor.label} - ${floor.departmentEn}`}
          >
            {floor.label}
          </button>
        );
      })}
    </div>
  );
}
