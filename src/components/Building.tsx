'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Floor3D from './Floor3D';
import Agent3D from './Agent3D';
import BuildingExterior from './BuildingExterior';
import UIOverlay from './UIOverlay';
import { floors, Agent } from '@/data/floors';
import {
  initializeSimulation,
  simulationStep,
  getAllSimAgents,
  getActivityLog,
  seedInitialActivities,
  SimAgent,
  ActivityLogEntry,
} from '@/engine/simulation';

const FLOOR_HEIGHT = 3;

function getTimeOfDay(): 'day' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

// Camera controller for floor navigation
function CameraController({ targetFloor, onAnimationComplete }: { targetFloor: number | null; onAnimationComplete: () => void }) {
  const { camera } = useThree();
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const lookAtRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (targetFloor !== null) {
      const y = (targetFloor - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
      targetRef.current = new THREE.Vector3(25, y + 15, 25);
      lookAtRef.current = new THREE.Vector3(0, y, 0);
    }
  }, [targetFloor]);

  useFrame(() => {
    if (targetRef.current) {
      camera.position.lerp(targetRef.current, 0.04);
      if (camera.position.distanceTo(targetRef.current) < 0.5) {
        targetRef.current = null;
        onAnimationComplete();
      }
    }
  });

  return null;
}

// Lighting system
function SceneLighting({ timeOfDay }: { timeOfDay: 'day' | 'evening' | 'night' }) {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);
  
  const lightConfig = {
    day: { ambient: 0.4, dir: 1.2, dirColor: '#fff5e6', dirPos: [15, 30, 10] as [number, number, number] },
    evening: { ambient: 0.2, dir: 0.6, dirColor: '#ff8844', dirPos: [20, 15, 5] as [number, number, number] },
    night: { ambient: 0.08, dir: 0.15, dirColor: '#4466aa', dirPos: [10, 25, 10] as [number, number, number] },
  };

  const config = lightConfig[timeOfDay];

  return (
    <>
      <ambientLight intensity={config.ambient} />
      <directionalLight
        ref={dirLightRef}
        position={config.dirPos}
        intensity={config.dir}
        color={config.dirColor}
        castShadow={false}
      />
      {/* Fill light from front */}
      <directionalLight position={[0, 10, 20]} intensity={0.15} color="#88aacc" />
      {/* Cyan accent light */}
      <pointLight position={[0, 35, 0]} intensity={0.5} color="#00e5ff" distance={50} />
    </>
  );
}

// The 3D scene
function Scene({ 
  selectedFloor, 
  onFloorClick, 
  onAgentClick, 
  simAgents,
  timeOfDay,
}: {
  selectedFloor: number | null;
  onFloorClick: (level: number) => void;
  onAgentClick: (agent: Agent) => void;
  simAgents: SimAgent[];
  timeOfDay: 'day' | 'evening' | 'night';
}) {
  const controlsRef = useRef<any>(null);

  return (
    <>
      <SceneLighting timeOfDay={timeOfDay} />
      
      {timeOfDay === 'night' && <Stars radius={100} depth={50} count={1000} factor={3} fade speed={1} />}
      
      <fog attach="fog" args={[timeOfDay === 'night' ? '#050510' : '#0a0a1a', 40, 100]} />

      <BuildingExterior timeOfDay={timeOfDay} />

      {/* Floors */}
      {floors.map(floor => (
        <Floor3D
          key={floor.level}
          floor={floor}
          yOffset={(floor.level - 1) * FLOOR_HEIGHT}
          isSelected={selectedFloor === floor.level}
          onFloorClick={() => onFloorClick(floor.level)}
          timeOfDay={timeOfDay}
        />
      ))}

      {/* Agents */}
      {simAgents.map(sim => (
        <Agent3D
          key={sim.agent.id}
          simAgent={sim}
          floorY={(sim.currentFloor - 1) * FLOOR_HEIGHT}
          onClick={() => onAgentClick(sim.agent)}
        />
      ))}

      <CameraController 
        targetFloor={selectedFloor} 
        onAnimationComplete={() => {}} 
      />

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={15}
        maxDistance={80}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
        minAzimuthAngle={-Math.PI / 4}
        maxAzimuthAngle={Math.PI / 3}
        target={[0, 15, 0]}
        makeDefault
      />
    </>
  );
}

// Loading screen
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030712]">
      <div className="relative">
        <div className="text-4xl font-bold tracking-wider mb-4">
          <span className="text-cyan-400">_y</span>
          <span className="text-white/90"> Holdings</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-white/40">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          초기화 중...
        </div>
      </div>
      {/* Animated building silhouette */}
      <div className="mt-12 flex items-end gap-0.5 h-20">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="w-3 bg-cyan-900/50 rounded-t"
            style={{
              height: `${20 + i * 6}%`,
              animation: `pulse 1.5s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Building() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [simAgents, setSimAgents] = useState<SimAgent[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'evening' | 'night'>('day');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Initialize simulation
  useEffect(() => {
    initializeSimulation();
    seedInitialActivities();
    setSimAgents(getAllSimAgents());
    setActivityLog(getActivityLog(30));
    setTimeOfDay(getTimeOfDay());
    setIsLoaded(true);
    
    // Delay removing loading screen for smooth transition
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      const newActivities = simulationStep();
      setSimAgents([...getAllSimAgents()]);
      if (newActivities.length > 0) {
        setActivityLog(getActivityLog(30));
      }
    }, 3000);

    // Time of day check
    const timeInterval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [isLoaded]);

  const handleFloorClick = useCallback((level: number) => {
    setSelectedFloor(prev => prev === level ? null : level);
  }, []);

  const handleAgentClick = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    setSelectedFloor(agent.floor);
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <div className="fixed inset-0 bg-[#030712]">
      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [30, 25, 30],
          fov: 35,
          near: 0.1,
          far: 200,
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ background: timeOfDay === 'night' ? '#050510' : timeOfDay === 'evening' ? '#1a1020' : '#0a0a1a' }}
      >
        <Suspense fallback={null}>
          <Scene
            selectedFloor={selectedFloor}
            onFloorClick={handleFloorClick}
            onAgentClick={handleAgentClick}
            simAgents={simAgents}
            timeOfDay={timeOfDay}
          />
        </Suspense>
      </Canvas>

      {/* HTML overlay */}
      <UIOverlay
        selectedAgent={selectedAgent}
        onCloseAgent={() => setSelectedAgent(null)}
        onFloorClick={handleFloorClick}
        selectedFloor={selectedFloor}
        activityLog={activityLog}
      />
    </div>
  );
}
