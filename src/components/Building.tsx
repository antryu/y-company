'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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

// Smooth camera animation to selected floor
function CameraController({ targetFloor, controlsRef }: { targetFloor: number | null; controlsRef: React.RefObject<any> }) {
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (targetFloor !== null && controlsRef.current) {
      const y = (targetFloor - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
      targetLookAt.current = new THREE.Vector3(0, y, 0);
    }
  }, [targetFloor, controlsRef]);

  useFrame(() => {
    if (targetLookAt.current && controlsRef.current) {
      const controls = controlsRef.current;
      controls.target.lerp(targetLookAt.current, 0.05);
      controls.update();
      if (controls.target.distanceTo(targetLookAt.current) < 0.1) {
        targetLookAt.current = null;
      }
    }
  });

  return null;
}

// Scene component
function Scene({
  selectedFloor,
  onFloorClick,
  onAgentClick,
  simAgents,
}: {
  selectedFloor: number | null;
  onFloorClick: (level: number) => void;
  onAgentClick: (agent: Agent) => void;
  simAgents: SimAgent[];
}) {
  const controlsRef = useRef<any>(null);

  return (
    <>
      {/* Lighting — BRIGHT and clean */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[15, 30, 10]}
        intensity={1.0}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={80}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={40}
        shadow-camera-bottom={-5}
      />
      {/* Fill light from front-left */}
      <directionalLight position={[-10, 20, 15]} intensity={0.3} color="#eef4ff" />
      {/* Subtle warm uplight */}
      <pointLight position={[0, 5, 8]} intensity={0.2} color="#fff5e6" distance={30} />

      {/* Sky color */}
      <color attach="background" args={['#e8ecf0']} />
      {/* Hemisphere light for natural fill */}
      <hemisphereLight args={['#b1e1ff', '#b97a20', 0.3]} />

      {/* Building structure */}
      <BuildingExterior />

      {/* Floors */}
      {floors.map(floor => (
        <Floor3D
          key={floor.level}
          floor={floor}
          yOffset={(floor.level - 1) * FLOOR_HEIGHT}
          isSelected={selectedFloor === floor.level}
          onFloorClick={() => onFloorClick(floor.level)}
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

      <CameraController targetFloor={selectedFloor} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={80}
        minPolarAngle={0.3}
        maxPolarAngle={1.3}
        minZoom={0.5}
        maxZoom={3}
        target={[0, 15, 0]}
        makeDefault
      />
    </>
  );
}

// Loading screen
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
      <div className="relative">
        <div className="text-4xl font-bold tracking-wider mb-4">
          <span className="text-gray-800">_y</span>
          <span className="text-gray-500 ml-1">Holdings</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
      <div className="mt-12 flex items-end gap-0.5 h-20">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="w-3 bg-gray-200 rounded-t"
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeSimulation();
    seedInitialActivities();
    setSimAgents(getAllSimAgents());
    setActivityLog(getActivityLog(30));
    setIsLoaded(true);
    const timer = setTimeout(() => setIsReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      const newActivities = simulationStep();
      setSimAgents([...getAllSimAgents()]);
      if (newActivities.length > 0) {
        setActivityLog(getActivityLog(30));
      }
    }, 3000);
    return () => clearInterval(interval);
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
    <div className="fixed inset-0 bg-[#f0f2f5]">
      <Canvas
        camera={{
          position: [28, 22, 28],
          fov: 35,
          near: 0.1,
          far: 200,
        }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
        style={{ background: '#f0f2f5' }}
      >
        <Suspense fallback={null}>
          <Scene
            selectedFloor={selectedFloor}
            onFloorClick={handleFloorClick}
            onAgentClick={handleAgentClick}
            simAgents={simAgents}
          />
        </Suspense>
      </Canvas>

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
