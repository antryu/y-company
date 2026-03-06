'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { Floor } from '@/data/floors';

interface Floor3DProps {
  floor: Floor;
  yOffset: number;
  isSelected: boolean;
  onFloorClick: () => void;
  timeOfDay: 'day' | 'evening' | 'night';
}

const FLOOR_WIDTH = 20;
const FLOOR_DEPTH = 12;
const FLOOR_HEIGHT = 3;
const WALL_THICKNESS = 0.15;

// Department colors
const DEPT_COLORS: Record<string, string> = {
  '회장실': '#FFD700',
  '기획조정실': '#4A90D9',
  '리스크챌린지실 / 감사실': '#E74C3C',
  'SW개발본부': '#2ECC71',
  '콘텐츠본부': '#9B59B6',
  '마케팅본부': '#E67E22',
  'ICT본부': '#1ABC9C',
  '인사실': '#F39C12',
  '_y Capital': '#00D4AA',
  '_y SaaS / 로비': '#3498DB',
};

function Desk({ position, hasMonitors = 1, screenColor = '#00aaff' }: { position: [number, number, number]; hasMonitors?: number; screenColor?: string }) {
  return (
    <group position={position}>
      {/* Desk surface */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.6, 0.08, 0.8]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Desk legs */}
      {[[-0.7, 0.375, -0.35], [0.7, 0.375, -0.35], [-0.7, 0.375, 0.35], [0.7, 0.375, 0.35]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.05, 0.75, 0.05]} />
          <meshStandardMaterial color="#2a2a3a" />
        </mesh>
      ))}
      {/* Monitor(s) */}
      {Array.from({ length: hasMonitors }).map((_, i) => {
        const xOff = hasMonitors > 1 ? (i - (hasMonitors - 1) / 2) * 0.5 : 0;
        return (
          <group key={i} position={[xOff, 1.15, -0.2]}>
            {/* Monitor screen */}
            <mesh>
              <boxGeometry args={[0.45, 0.3, 0.02]} />
              <meshStandardMaterial color="#0a0a1a" emissive={screenColor} emissiveIntensity={0.6} />
            </mesh>
            {/* Monitor stand */}
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[0.05, 0.1, 0.05]} />
              <meshStandardMaterial color="#2a2a3a" />
            </mesh>
          </group>
        );
      })}
      {/* Chair */}
      <mesh position={[0, 0.4, 0.6]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 8]} />
        <meshStandardMaterial color="#1a1a2a" />
      </mesh>
      <mesh position={[0, 0.25, 0.6]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

function ServerRack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.5, 2, 0.6]} />
        <meshStandardMaterial color="#0a0a1a" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* LEDs */}
      {[0.3, 0.6, 0.9, 1.2, 1.5].map((y, i) => (
        <mesh key={i} position={[0.26, y, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#00ff00' : i % 3 === 1 ? '#ffaa00' : '#00aaff'}
            emissive={i % 3 === 0 ? '#00ff00' : i % 3 === 1 ? '#ffaa00' : '#00aaff'}
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function MeetingTable({ position, size = [2.5, 0.08, 1.2] }: { position: [number, number, number]; size?: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#3a3028" metalness={0.1} roughness={0.8} />
      </mesh>
      {[[-size[0]/2 + 0.1, 0.375, -size[2]/2 + 0.1], [size[0]/2 - 0.1, 0.375, -size[2]/2 + 0.1], 
        [-size[0]/2 + 0.1, 0.375, size[2]/2 - 0.1], [size[0]/2 - 0.1, 0.375, size[2]/2 - 0.1]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.06, 0.75, 0.06]} />
          <meshStandardMaterial color="#2a2018" />
        </mesh>
      ))}
    </group>
  );
}

function RecordingBooth({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Booth walls */}
      <mesh position={[0, 1, -0.5]}>
        <boxGeometry args={[2, 2, 0.1]} />
        <meshStandardMaterial color="#1a1a2a" opacity={0.8} transparent />
      </mesh>
      <mesh position={[-1, 1, 0]}>
        <boxGeometry args={[0.1, 2, 1]} />
        <meshStandardMaterial color="#1a1a2a" opacity={0.8} transparent />
      </mesh>
      <mesh position={[1, 1, 0]}>
        <boxGeometry args={[0.1, 2, 1]} />
        <meshStandardMaterial color="#1a1a2a" opacity={0.8} transparent />
      </mesh>
      {/* Red recording light */}
      <mesh position={[0, 2.2, -0.4]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 2.2, -0.4]} color="#ff0000" intensity={0.5} distance={2} />
    </group>
  );
}

function PresentationScreen({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2.5, 1.5, 0.05]} />
        <meshStandardMaterial color="#0a0a1a" emissive="#1a3a5a" emissiveIntensity={0.4} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 1.5, -0.03]}>
        <boxGeometry args={[2.6, 1.6, 0.02]} />
        <meshStandardMaterial color="#2a2a3a" metalness={0.5} />
      </mesh>
    </group>
  );
}

function TickerDisplay({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[8, 0.4, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" emissive="#00aa44" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

export default function Floor3D({ floor, yOffset, isSelected, onFloorClick, timeOfDay }: Floor3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const deptColor = DEPT_COLORS[floor.department] || '#4A90D9';
  const isNight = timeOfDay === 'night';
  const lightIntensity = isNight ? 1.5 : 0.8;

  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(deptColor).multiplyScalar(0.15),
      metalness: 0.2,
      roughness: 0.8,
    });
  }, [deptColor]);

  // Determine desk layout based on floor
  const deskConfigs = useMemo(() => {
    const configs: { pos: [number, number, number]; monitors: number; screenColor: string }[] = [];
    const level = floor.level;
    const agentCount = floor.agents.length;

    if (level === 10) {
      configs.push({ pos: [-4, 0, 0], monitors: 2, screenColor: '#FFD700' });
    } else if (level === 2) {
      // Trading floor - triple monitors
      for (let i = 0; i < agentCount; i++) {
        configs.push({ pos: [-7 + i * 3, 0, -2], monitors: 3, screenColor: '#00ff88' });
      }
    } else if (level === 7 || level === 4) {
      // Dev / ICT - dual monitors
      for (let i = 0; i < agentCount; i++) {
        configs.push({ pos: [-5 + i * 3.5, 0, -2], monitors: 2, screenColor: '#00aaff' });
      }
    } else {
      for (let i = 0; i < agentCount; i++) {
        const spacing = Math.min(3, 16 / Math.max(agentCount, 1));
        const startX = -(agentCount - 1) * spacing / 2;
        configs.push({ pos: [startX + i * spacing, 0, -2], monitors: 1, screenColor: deptColor });
      }
    }
    return configs;
  }, [floor, deptColor]);

  return (
    <group ref={groupRef} position={[0, yOffset, 0]} onClick={(e) => { e.stopPropagation(); onFloorClick(); }}>
      {/* Floor plane */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} material={floorMaterial}>
        <planeGeometry args={[FLOOR_WIDTH, FLOOR_DEPTH]} />
      </mesh>

      {/* Floor grid lines */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[FLOOR_WIDTH, FLOOR_DEPTH]} />
        <meshStandardMaterial color="#ffffff" opacity={0.03} transparent wireframe />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, FLOOR_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[FLOOR_WIDTH, FLOOR_DEPTH]} />
        <meshStandardMaterial color="#1a1a2a" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, FLOOR_HEIGHT / 2, -FLOOR_DEPTH / 2]}>
        <planeGeometry args={[FLOOR_WIDTH, FLOOR_HEIGHT]} />
        <meshStandardMaterial color="#1a1a2a" side={THREE.DoubleSide} />
      </mesh>

      {/* Left wall - glass */}
      <mesh position={[-FLOOR_WIDTH / 2, FLOOR_HEIGHT / 2, 0]}>
        <planeGeometry args={[FLOOR_DEPTH, FLOOR_HEIGHT]} />
        <meshPhysicalMaterial
          color={deptColor}
          transparent
          opacity={0.08}
          metalness={0.9}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right wall - glass */}
      <mesh position={[FLOOR_WIDTH / 2, FLOOR_HEIGHT / 2, 0]}>
        <planeGeometry args={[FLOOR_DEPTH, FLOOR_HEIGHT]} />
        <meshPhysicalMaterial
          color={deptColor}
          transparent
          opacity={0.08}
          metalness={0.9}
          roughness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Structural beam at top */}
      <mesh position={[0, FLOOR_HEIGHT, -FLOOR_DEPTH / 2 + 0.1]}>
        <boxGeometry args={[FLOOR_WIDTH, 0.15, 0.2]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Floor edge beam */}
      <mesh position={[0, 0, FLOOR_DEPTH / 2]}>
        <boxGeometry args={[FLOOR_WIDTH, 0.12, 0.1]} />
        <meshStandardMaterial color="#3a3a4a" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Ceiling light strip */}
      <mesh position={[0, FLOOR_HEIGHT - 0.05, 0]}>
        <boxGeometry args={[8, 0.05, 0.3]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={isNight ? 1.2 : 0.5}
          opacity={0.8}
          transparent
        />
      </mesh>

      {/* Interior point light */}
      <pointLight
        position={[0, FLOOR_HEIGHT - 0.3, 0]}
        color="#fff5e6"
        intensity={lightIntensity}
        distance={15}
        decay={2}
      />

      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[FLOOR_WIDTH + 0.5, FLOOR_DEPTH + 0.5]} />
          <meshStandardMaterial color={deptColor} emissive={deptColor} emissiveIntensity={0.3} opacity={0.15} transparent />
        </mesh>
      )}

      {/* Floor label on back wall */}
      <Text
        position={[-FLOOR_WIDTH / 2 + 1, FLOOR_HEIGHT - 0.4, -FLOOR_DEPTH / 2 + 0.1]}
        fontSize={0.35}
        color={deptColor}
        anchorX="left"
        anchorY="top"
      >
        {floor.label} {floor.department}
      </Text>

      {/* Desks */}
      {deskConfigs.map((config, i) => (
        <Desk key={i} position={config.pos} hasMonitors={config.monitors} screenColor={config.screenColor} />
      ))}

      {/* Floor-specific furniture */}
      {floor.level === 10 && (
        <>
          <MeetingTable position={[4, 0, 1]} size={[3, 0.08, 1.5]} />
          {/* Window view placeholder - bright back wall section */}
          <mesh position={[0, FLOOR_HEIGHT / 2, -FLOOR_DEPTH / 2 + 0.05]}>
            <planeGeometry args={[6, 2]} />
            <meshStandardMaterial color="#1a3050" emissive="#1a3050" emissiveIntensity={0.3} />
          </mesh>
        </>
      )}

      {floor.level === 9 && (
        <>
          <MeetingTable position={[6, 0, 1]} />
          {/* Whiteboard */}
          <mesh position={[-8, 1.5, -FLOOR_DEPTH / 2 + 0.1]}>
            <boxGeometry args={[2, 1.2, 0.05]} />
            <meshStandardMaterial color="#e0e0e0" />
          </mesh>
        </>
      )}

      {(floor.level === 7 || floor.level === 4) && (
        <>
          <ServerRack position={[8, 0, -4]} />
          <ServerRack position={[8.8, 0, -4]} />
          {floor.level === 7 && <ServerRack position={[9.2, 0, -4]} />}
        </>
      )}

      {floor.level === 6 && (
        <RecordingBooth position={[7, 0, -3]} />
      )}

      {floor.level === 5 && (
        <PresentationScreen position={[0, 0, -FLOOR_DEPTH / 2 + 0.2]} />
      )}

      {floor.level === 2 && (
        <TickerDisplay position={[0, 0, -FLOOR_DEPTH / 2 + 0.2]} />
      )}

      {floor.level === 3 && (
        <>
          {/* Interview room glass partition */}
          <mesh position={[5, FLOOR_HEIGHT / 2, 0]}>
            <boxGeometry args={[0.05, FLOOR_HEIGHT, 4]} />
            <meshPhysicalMaterial color="#88ccff" transparent opacity={0.12} metalness={0.9} roughness={0.1} />
          </mesh>
          <MeetingTable position={[7, 0, 0]} size={[1.5, 0.08, 0.8]} />
        </>
      )}

      {/* Elevator shaft area (right side) */}
      <group position={[FLOOR_WIDTH / 2 - 1.5, 0, 0]}>
        {/* Elevator doors */}
        <mesh position={[0, FLOOR_HEIGHT / 2, 0]}>
          <boxGeometry args={[0.05, FLOOR_HEIGHT, 1.5]} />
          <meshStandardMaterial color="#3a3a4a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Door frame */}
        <mesh position={[0.05, FLOOR_HEIGHT / 2, 0]}>
          <boxGeometry args={[0.08, FLOOR_HEIGHT + 0.1, 1.7]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}
