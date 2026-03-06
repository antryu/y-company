'use client';

import { Floor, Agent } from '@/data/floors';
import { AgentState } from '@/hooks/useSimulation';
import { TimeOfDay } from '@/hooks/useTimeOfDay';
import AgentSprite from './AgentSprite';
import RoomFurniture from './RoomFurniture';

interface IsometricFloorProps {
  floor: Floor;
  agentsOnFloor: AgentState[];
  allAgents: Agent[];
  onAgentClick: (agent: Agent) => void;
  timeOfDay: TimeOfDay;
  isLit: boolean;
  darknessOpacity: number;
}

export default function IsometricFloor({
  floor,
  agentsOnFloor,
  allAgents,
  onAgentClick,
  timeOfDay,
  isLit,
  darknessOpacity,
}: IsometricFloorProps) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';
  const showLight = isNight && isLit;
  const floorHeight = floor.level === 10 ? 140 : floor.level === 2 ? 130 : 115;

  return (
    <div className="relative group" data-floor={floor.level}>
      {/* Floor depth strip - creates isometric 3D effect */}
      <div
        className="floor-depth relative overflow-hidden"
        style={{
          background: `linear-gradient(90deg, 
            ${floor.color}15 0%, 
            ${floor.color}08 20%, 
            rgba(30, 30, 45, 0.4) 50%, 
            ${floor.color}05 80%,
            rgba(40, 40, 60, 0.6) 100%
          )`,
        }}
      >
        {/* Tile pattern on depth strip */}
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 14px)`,
        }} />
      </div>

      {/* Main floor interior */}
      <div
        className="relative flex border-b border-gray-800/30 transition-all duration-500"
        style={{ minHeight: `${floorHeight}px` }}
      >
        {/* Night darkness overlay */}
        {isNight && !isLit && (
          <div className="absolute inset-0 z-[4] pointer-events-none transition-opacity duration-[3000ms]"
            style={{ background: `rgba(0, 0, 10, ${darknessOpacity * 0.8})` }}
          />
        )}

        {/* Lit floor glow at night */}
        {showLight && (
          <div className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 40% 30%, ${floor.color}10 0%, transparent 60%)`,
              boxShadow: `inset 0 0 40px ${floor.color}08`,
            }}
          />
        )}

        {/* Left side wall depth */}
        <div className="absolute left-0 top-0 bottom-0 w-1 z-[5]"
          style={{
            background: `linear-gradient(180deg, ${floor.color}30, ${floor.color}10, ${floor.color}20)`,
          }}
        />

        {/* Floor label panel */}
        <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center justify-center z-[5] relative"
          style={{
            background: `linear-gradient(135deg, ${floor.color}08, transparent)`,
            borderRight: `1px solid ${floor.color}15`,
          }}
        >
          <span className="text-lg sm:text-xl mb-0.5">{floor.emoji}</span>
          <span className="text-[10px] sm:text-xs font-bold font-mono" style={{ color: floor.color }}>
            {floor.label}
          </span>
          {/* Floor indicator line */}
          <div className="absolute right-0 top-[20%] bottom-[20%] w-[2px]"
            style={{ background: `linear-gradient(180deg, transparent, ${floor.color}40, transparent)` }}
          />
        </div>

        {/* Room interior */}
        <div className="flex-1 relative z-[3] overflow-hidden">
          {/* Floor surface / tile pattern */}
          <div className="absolute inset-0 floor-tiles opacity-60" />

          {/* Back wall */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, ${floor.color}20, rgba(60, 60, 80, 0.3), ${floor.color}10)` }}
          />

          {/* Department name on back wall */}
          <div className="absolute top-[3px] left-3 z-10 flex items-center gap-1.5">
            <span className="text-[9px] sm:text-[11px] font-semibold tracking-wide" style={{ color: `${floor.color}90` }}>
              {floor.departmentEn}
            </span>
            {showLight && (
              <span className="text-[7px] text-yellow-400/50 animate-pulse">💡</span>
            )}
          </div>

          {/* Glass partition (separating work area from meeting room) */}
          <div className="absolute glass-partition"
            style={{
              left: '58%',
              top: '15%',
              bottom: '10%',
            }}
          />

          {/* Room furniture */}
          <div className="absolute inset-0" style={{ left: '2%', right: '2%' }}>
            <RoomFurniture
              floorLevel={floor.level}
              floorColor={floor.color}
              isNight={isNight}
              isLit={isLit}
            />
          </div>

          {/* Agent sprites */}
          <div className="absolute inset-0">
            {floor.level === 10 ? (
              <>
                {/* Chairman is static */}
                <div className="absolute bottom-2" style={{ left: '25%' }}>
                  <AgentSprite
                    agent={allAgents[0]}
                    onClick={onAgentClick}
                    floorColor={floor.color}
                    animated={false}
                  />
                </div>
                {/* Visitors to chairman's office */}
                {agentsOnFloor.filter(a => a.homeFloor !== 10).map(agentState => {
                  const visitingAgent: Agent = {
                    id: agentState.id,
                    number: '??',
                    name: agentState.name,
                    image: '',
                    department: '',
                    floor: agentState.floor,
                    role: 'Reporting',
                    status: 'working',
                  };
                  return (
                    <div
                      key={agentState.id}
                      className="absolute bottom-2 agent-sprite"
                      style={{
                        left: `${Math.min(agentState.positionX, 85)}%`,
                        transform: `translateY(${Math.sin(agentState.bobPhase) * 1.5}px)`,
                      }}
                    >
                      <AgentSprite
                        agent={visitingAgent}
                        onClick={() => {}}
                        floorColor={floor.color}
                        animated
                        status={agentState.status}
                        activity={agentState.activity}
                        isVisitor
                      />
                    </div>
                  );
                })}
              </>
            ) : (
              agentsOnFloor.map(agentState => {
                const agent = allAgents.find(a => a.id === agentState.id);
                const displayAgent: Agent = agent || {
                  id: agentState.id,
                  number: '??',
                  name: agentState.name,
                  image: '',
                  department: '',
                  floor: agentState.floor,
                  role: 'Visiting',
                  status: 'working',
                };
                return (
                  <div
                    key={agentState.id}
                    className="absolute bottom-2 agent-sprite"
                    style={{
                      left: `${Math.min(agentState.positionX, 85)}%`,
                      transform: `translateY(${Math.sin(agentState.bobPhase) * 1.5}px)`,
                    }}
                  >
                    <AgentSprite
                      agent={displayAgent}
                      onClick={agent ? onAgentClick : () => {}}
                      floorColor={floor.color}
                      animated
                      status={agentState.status}
                      activity={agentState.activity}
                      isVisitor={!agent}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Elevator area */}
        <div className="w-10 sm:w-12 shrink-0 elevator-shaft relative z-[3]">
          {/* Elevator door frame */}
          <div className="absolute inset-x-1 top-[30%] bottom-[20%] border border-gray-600/20 rounded-sm"
            style={{ background: 'linear-gradient(180deg, rgba(40,40,50,0.5), rgba(30,30,40,0.5))' }}
          >
            {/* Door slit */}
            <div className="absolute inset-0 flex justify-center">
              <div className="w-[1px] h-full bg-gray-500/20" />
            </div>
            {/* Floor indicator */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[6px] font-mono" style={{ color: floor.color + '60' }}>
              {floor.label}
            </div>
          </div>
          {/* Up/Down arrows */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col gap-0.5">
            <div className="text-[6px] text-gray-600">▲</div>
            <div className="text-[6px] text-gray-600">▼</div>
          </div>
        </div>
      </div>

      {/* Structural beam */}
      <div className="structural-beam" />
    </div>
  );
}
