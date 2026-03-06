'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { floors, Agent } from '@/data/floors';
import { getRandomActivity, getRandomMeetingActivity, getRandomElevatorActivity, ActivityLogEntry } from '@/data/activities';

export type AgentState = {
  id: string;
  name: string;
  floor: number;         // current floor
  homeFloor: number;     // original floor
  status: 'working' | 'meeting' | 'elevator' | 'idle' | 'reporting';
  positionX: number;     // 0-100 percentage across the floor
  targetX: number;
  direction: 'left' | 'right';
  bobPhase: number;
  activity: string;
  nextActionAt: number;  // timestamp
  elevatorProgress: number; // 0 = not in elevator, 0-1 = in transit
  elevatorTargetFloor: number;
};

const TICK_MS = 100;
const MAX_LOG_ENTRIES = 50;

function initAgentStates(): Map<string, AgentState> {
  const states = new Map<string, AgentState>();
  for (const floor of floors) {
    for (const agent of floor.agents) {
      if (agent.id === 'andrew') continue; // Chairman doesn't move
      const posX = 15 + Math.random() * 50;
      states.set(agent.id, {
        id: agent.id,
        name: agent.name,
        floor: floor.level,
        homeFloor: floor.level,
        status: 'working',
        positionX: posX,
        targetX: posX,
        direction: 'right',
        bobPhase: Math.random() * Math.PI * 2,
        activity: getRandomActivity(agent.id),
        nextActionAt: Date.now() + 3000 + Math.random() * 10000,
        elevatorProgress: 0,
        elevatorTargetFloor: 0,
      });
    }
  }
  return states;
}

export function useSimulation() {
  const [agentStates, setAgentStates] = useState<Map<string, AgentState>>(() => initAgentStates());
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const logIdRef = useRef(0);

  const addLogEntry = useCallback((agentId: string, agentName: string, activity: string, floor: number) => {
    const entry: ActivityLogEntry = {
      id: `log-${logIdRef.current++}`,
      agentId,
      agentName,
      activity,
      timestamp: Date.now(),
      floor,
    };
    setActivityLog(prev => [entry, ...prev].slice(0, MAX_LOG_ENTRIES));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgentStates(prev => {
        const next = new Map(prev);
        const now = Date.now();

        for (const [id, state] of next) {
          const updated = { ...state };
          updated.bobPhase += 0.15;

          // Move toward target
          if (state.status !== 'elevator') {
            const dx = state.targetX - state.positionX;
            if (Math.abs(dx) > 0.5) {
              updated.positionX += Math.sign(dx) * 0.4;
              updated.direction = dx > 0 ? 'right' : 'left';
            }
          }

          // Handle elevator animation
          if (state.status === 'elevator') {
            updated.elevatorProgress += 0.02;
            if (updated.elevatorProgress >= 1) {
              updated.status = 'working';
              updated.floor = state.elevatorTargetFloor;
              updated.elevatorProgress = 0;
              updated.positionX = 15 + Math.random() * 50;
              updated.targetX = updated.positionX;
              updated.activity = state.elevatorTargetFloor === 10
                ? 'reporting to Chairman'
                : getRandomActivity(id);
              updated.nextActionAt = now + 5000 + Math.random() * 10000;
              addLogEntry(id, state.name, `arrived at ${updated.floor}F`, updated.floor);
            }
          }

          // Time for a new action?
          if (now >= state.nextActionAt && state.status !== 'elevator') {
            const roll = Math.random();

            if (roll < 0.4) {
              // Move to a new position on same floor (working)
              updated.status = 'working';
              updated.targetX = 10 + Math.random() * 65;
              updated.activity = getRandomActivity(id);
              updated.nextActionAt = now + 4000 + Math.random() * 8000;
            } else if (roll < 0.65) {
              // Go to meeting area (right side)
              updated.status = 'meeting';
              updated.targetX = 60 + Math.random() * 15;
              updated.activity = getRandomMeetingActivity();
              updated.nextActionAt = now + 6000 + Math.random() * 10000;
              addLogEntry(id, state.name, updated.activity, state.floor);
            } else if (roll < 0.78 && state.floor !== 10) {
              // Take elevator to chairman's office
              updated.status = 'elevator';
              updated.elevatorProgress = 0;
              updated.elevatorTargetFloor = 10;
              updated.activity = getRandomElevatorActivity();
              addLogEntry(id, state.name, 'heading to 10F', state.floor);
            } else if (roll < 0.88 && state.floor !== state.homeFloor) {
              // Return home
              updated.status = 'elevator';
              updated.elevatorProgress = 0;
              updated.elevatorTargetFloor = state.homeFloor;
              updated.activity = 'returning to department';
              addLogEntry(id, state.name, `returning to ${state.homeFloor}F`, state.floor);
            } else {
              // Idle / back to work
              updated.status = 'working';
              updated.targetX = 15 + Math.random() * 45;
              updated.activity = getRandomActivity(id);
              updated.nextActionAt = now + 5000 + Math.random() * 12000;
            }
          }

          next.set(id, updated);
        }

        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [addLogEntry]);

  // Get agents currently on a given floor
  const getAgentsOnFloor = useCallback((floorLevel: number): AgentState[] => {
    const result: AgentState[] = [];
    for (const state of agentStates.values()) {
      if (state.floor === floorLevel && state.status !== 'elevator') {
        result.push(state);
      }
    }
    return result;
  }, [agentStates]);

  // Get agents in elevator
  const getElevatorAgents = useCallback((): AgentState[] => {
    const result: AgentState[] = [];
    for (const state of agentStates.values()) {
      if (state.status === 'elevator') {
        result.push(state);
      }
    }
    return result;
  }, [agentStates]);

  return { agentStates, activityLog, getAgentsOnFloor, getElevatorAgents };
}
