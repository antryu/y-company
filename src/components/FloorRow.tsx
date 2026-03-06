'use client';

import { Floor, Agent } from '@/data/floors';
import { AgentState } from '@/hooks/useSimulation';
import { TimeOfDay } from '@/hooks/useTimeOfDay';
import AgentSprite from './AgentSprite';

interface FloorRowProps {
  floor: Floor;
  agentsOnFloor: AgentState[];
  allAgents: Agent[];
  onAgentClick: (agent: Agent) => void;
  timeOfDay: TimeOfDay;
  isLit: boolean;
  darknessOpacity: number;
}

export default function FloorRow({
  floor,
  agentsOnFloor,
  allAgents,
  onAgentClick,
  timeOfDay,
  isLit,
  darknessOpacity,
}: FloorRowProps) {
  const isNight = timeOfDay === 'night' || timeOfDay === 'evening';
  const showLight = isNight && isLit;

  return (
    <div
      className="relative group"
      data-floor={floor.level}
    >
      {/* Floor container */}
      <div
        className="relative flex items-stretch border-b border-gray-800/50 transition-all duration-300"
        style={{
          borderLeft: `3px solid ${floor.color}40`,
        }}
      >
        {/* Nighttime darkness overlay */}
        {isNight && !isLit && (
          <div
            className="absolute inset-0 bg-gray-950/40 pointer-events-none z-[2] transition-opacity duration-[3000ms]"
          />
        )}

        {/* Light glow for lit floors at night */}
        {showLight && (
          <div
            className="absolute inset-0 pointer-events-none z-[2] transition-opacity duration-[3000ms]"
            style={{
              background: `radial-gradient(ellipse at center, ${floor.color}08 0%, transparent 70%)`,
              boxShadow: `inset 0 0 30px ${floor.color}10`,
            }}
          />
        )}

        {/* Floor label */}
        <div className="w-14 sm:w-20 shrink-0 flex flex-col items-center justify-center py-3 border-r border-gray-800/30 z-[3]">
          <span className="text-base sm:text-xl">{floor.emoji}</span>
          <span
            className="text-[10px] sm:text-xs font-bold font-mono"
            style={{ color: floor.color }}
          >
            {floor.label}
          </span>
        </div>

        {/* Floor interior */}
        <div className="flex-1 px-2 sm:px-4 py-3 min-h-[90px] sm:min-h-[100px] relative z-[3]">
          {/* Department name */}
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-[11px] sm:text-sm font-semibold"
              style={{ color: floor.color }}
            >
              {floor.departmentEn}
            </h3>
            {showLight && (
              <span className="text-[8px] text-yellow-400/60">💡</span>
            )}
          </div>

          {/* Animated agent area */}
          <div className="relative h-14 sm:h-16">
            {/* Desk area (left zone) */}
            <div className="absolute left-[5%] bottom-0 flex gap-1 opacity-15">
              {Array.from({ length: Math.min(allAgents.length, 4) }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-5 sm:w-7 h-4 sm:h-5 rounded-t-sm border-t border-x" style={{ borderColor: floor.color + '30', backgroundColor: floor.color + '10' }} />
                  <div className="w-4 sm:w-5 h-2 rounded-b-sm" style={{ backgroundColor: floor.color + '15' }} />
                </div>
              ))}
            </div>

            {/* Meeting area indicator (right zone) */}
            <div className="absolute right-[10%] bottom-0 opacity-10">
              <div className="w-12 sm:w-16 h-6 sm:h-8 rounded-full border" style={{ borderColor: floor.color + '30' }}>
                <div className="text-[6px] text-center mt-1 sm:mt-2 font-mono" style={{ color: floor.color }}>MEET</div>
              </div>
            </div>

            {/* Animated agents */}
            {floor.level === 10 ? (
              // Chairman is static
              <div className="absolute left-[30%] bottom-0">
                <AgentSprite
                  agent={allAgents[0]}
                  onClick={onAgentClick}
                  floorColor={floor.color}
                  animated={false}
                />
              </div>
            ) : (
              agentsOnFloor.map((agentState) => {
                const agent = allAgents.find(a => a.id === agentState.id);
                if (!agent) {
                  // Agent visiting from another floor
                  const visitingAgent: Agent = {
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
                      className="absolute bottom-0 transition-all duration-700 ease-in-out"
                      style={{
                        left: `${agentState.positionX}%`,
                        transform: `scaleX(${agentState.direction === 'left' ? -1 : 1}) translateY(${Math.sin(agentState.bobPhase) * 2}px)`,
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
                }
                return (
                  <div
                    key={agentState.id}
                    className="absolute bottom-0 transition-all duration-700 ease-in-out"
                    style={{
                      left: `${agentState.positionX}%`,
                      transform: `translateY(${Math.sin(agentState.bobPhase) * 2}px)`,
                    }}
                  >
                    <AgentSprite
                      agent={agent}
                      onClick={onAgentClick}
                      floorColor={floor.color}
                      animated
                      status={agentState.status}
                      activity={agentState.activity}
                    />
                  </div>
                );
              })
            )}

            {/* Visiting agents from other floors */}
            {floor.level === 10 && agentsOnFloor.filter(a => a.homeFloor !== 10).map((agentState) => (
              <div
                key={agentState.id}
                className="absolute bottom-0 transition-all duration-700 ease-in-out"
                style={{
                  left: `${agentState.positionX}%`,
                  transform: `translateY(${Math.sin(agentState.bobPhase) * 2}px)`,
                }}
              >
                <VisitorBadge name={agentState.name} activity={agentState.activity} color={floor.color} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VisitorBadge({ name, activity, color }: { name: string; activity: string; color: string }) {
  return (
    <div className="flex flex-col items-center opacity-70">
      <div
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-dashed flex items-center justify-center text-[10px] font-bold"
        style={{ borderColor: color + '60', color: color }}
      >
        {name[0]}
      </div>
      <span className="text-[7px] text-gray-500 font-mono whitespace-nowrap max-w-[60px] truncate">{name}</span>
    </div>
  );
}
