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
}

const FLOOR_WIDTH = 20;
const FLOOR_DEPTH = 12;
const FLOOR_HEIGHT = 3;

// Subtle department accent colors (for chairs, small details)
const DEPT_ACCENTS: Record<string, string> = {
  '회장실': '#8B7355',
  '기획조정실': '#5B8DB8',
  '리스크챌린지실 / 감사실': '#C0584B',
  'SW개발본부': '#4AAF7C',
  '콘텐츠본부': '#8B6BAE',
  '마케팅본부': '#CC8844',
  'ICT본부': '#3DA89A',
  '인사실': '#D4A84B',
  '_y Capital': '#3BB896',
  '_y SaaS / 로비': '#5A9BCB',
};

/* =================== FURNITURE COMPONENTS =================== */

function Desk({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Desktop surface - light wood */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[1.4, 0.04, 0.7]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
      </mesh>
      {/* 4 legs */}
      {[[-0.62, 0.37, -0.28], [0.62, 0.37, -0.28], [-0.62, 0.37, 0.28], [0.62, 0.37, 0.28]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.03, 0.74, 0.03]} />
          <meshStandardMaterial color="#d0ccc4" roughness={0.5} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Monitor({ position, screenColor = '#00d4aa', rotation = 0 }: { position: [number, number, number]; screenColor?: string; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Screen frame */}
      <mesh position={[0, 1.05, -0.25]} castShadow>
        <boxGeometry args={[0.5, 0.32, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      {/* Screen surface (emissive) */}
      <mesh position={[0, 1.05, -0.235]}>
        <planeGeometry args={[0.46, 0.28]} />
        <meshStandardMaterial color="#111111" emissive={screenColor} emissiveIntensity={0.4} />
      </mesh>
      {/* Stand neck */}
      <mesh position={[0, 0.87, -0.25]}>
        <boxGeometry args={[0.03, 0.12, 0.03]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
      {/* Stand base */}
      <mesh position={[0, 0.78, -0.25]}>
        <boxGeometry args={[0.15, 0.015, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>
    </group>
  );
}

function Chair({ position, color, rotation = 0 }: { position: [number, number, number]; color: string; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.7, -0.18]}>
        <boxGeometry args={[0.38, 0.5, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {/* Base post */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.44, 6]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Base star */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.03, 5]} />
        <meshStandardMaterial color="#888888" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function ServerRack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Rack body */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.6, 2.2, 0.5]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Front panel lines */}
      {[0.3, 0.6, 0.9, 1.2, 1.5, 1.8].map((y, i) => (
        <mesh key={i} position={[0.305, y, 0]}>
          <boxGeometry args={[0.01, 0.08, 0.35]} />
          <meshStandardMaterial color="#333" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      {/* LED indicators */}
      {[0.35, 0.65, 0.95, 1.25, 1.55, 1.85].map((y, i) => (
        <mesh key={`led-${i}`} position={[0.31, y, 0.15]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#00ff66' : '#00aaff'}
            emissive={i % 2 === 0 ? '#00ff66' : '#00aaff'}
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </group>
  );
}

function MeetingTable({ position, size = [2.4, 1.0] }: { position: [number, number, number]; size?: [number, number] }) {
  return (
    <group position={position}>
      {/* Table top - rounded would be nice but boxGeometry works */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[size[0], 0.05, size[1]]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.5} />
      </mesh>
      {/* Center support */}
      <mesh position={[0, 0.37, 0]}>
        <cylinderGeometry args={[0.08, 0.15, 0.74, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Whiteboard({ position, size = [2, 1.2] }: { position: [number, number, number]; size?: [number, number] }) {
  return (
    <group position={position}>
      {/* Board */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[size[0], size[1], 0.04]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.3} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 1.5, -0.025]}>
        <boxGeometry args={[size[0] + 0.06, size[1] + 0.06, 0.01]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Sofa({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.6, 0.25, 0.7]} />
        <meshStandardMaterial color="#e0ddd5" roughness={0.6} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.6, -0.3]}>
        <boxGeometry args={[1.6, 0.4, 0.15]} />
        <meshStandardMaterial color="#d8d5cd" roughness={0.6} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.75, 0.45, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.7]} />
        <meshStandardMaterial color="#d8d5cd" roughness={0.6} />
      </mesh>
      <mesh position={[0.75, 0.45, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.7]} />
        <meshStandardMaterial color="#d8d5cd" roughness={0.6} />
      </mesh>
    </group>
  );
}

function PresentationScreen({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 1.8, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.5, 0.025]}>
        <planeGeometry args={[2.85, 1.65]} />
        <meshStandardMaterial color="#111" emissive="#1a3a6a" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function GlassPartition({ position, size = [0.05, FLOOR_HEIGHT, 3] }: { position: [number, number, number]; size?: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        color="#cce8ff"
        transparent
        transmission={0.5}
        roughness={0.05}
        opacity={0.2}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function TickerStrip({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.6, 0]}>
        <boxGeometry args={[10, 0.25, 0.04]} />
        <meshStandardMaterial color="#111" roughness={0.3} />
      </mesh>
      {/* LED text simulation */}
      <mesh position={[0, 2.6, 0.025]}>
        <planeGeometry args={[9.8, 0.2]} />
        <meshStandardMaterial color="#001100" emissive="#00cc44" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function RecordingBooth({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Glass walls */}
      <GlassPartition position={[0, FLOOR_HEIGHT / 2, -1]} size={[2, FLOOR_HEIGHT, 0.05]} />
      <GlassPartition position={[-1, FLOOR_HEIGHT / 2, 0]} size={[0.05, FLOOR_HEIGHT, 2]} />
      <GlassPartition position={[1, FLOOR_HEIGHT / 2, 0]} size={[0.05, FLOOR_HEIGHT, 2]} />
      {/* Red recording dot */}
      <mesh position={[0, 2.7, -0.9]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <pointLight position={[0, 2.7, -0.9]} color="#ff0000" intensity={0.3} distance={2} />
    </group>
  );
}

function ReceptionDesk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Curved front desk */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.5, 1.1, 0.6]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.5} />
      </mesh>
      {/* Front panel */}
      <mesh position={[0, 0.55, 0.31]}>
        <boxGeometry args={[2.5, 1.1, 0.02]} />
        <meshStandardMaterial color="#e0dbd0" roughness={0.4} />
      </mesh>
      {/* _y logo text */}
      <Text
        position={[0, 0.6, 0.33]}
        fontSize={0.3}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        _y
      </Text>
    </group>
  );
}

/* =================== FLOOR-SPECIFIC LAYOUTS =================== */

function FloorFurniture({ level, accentColor }: { level: number; accentColor: string }) {
  const screenColor = level === 2 ? '#4488ff' : level === 7 || level === 4 ? '#00d4aa' : '#3399cc';

  switch (level) {
    case 10: // Chairman
      return (
        <>
          <Desk position={[-3, 0, -1]} />
          <Monitor position={[-3, 0, -1]} screenColor="#FFD700" />
          <Monitor position={[-3.5, 0, -1]} screenColor="#FFD700" />
          <Chair position={[-3, 0, 0.2]} color="#3a2a1a" />
          <MeetingTable position={[4, 0, 1]} size={[3, 1.5]} />
          {/* Conference chairs */}
          {[[-1, 0.5], [0, 0.5], [1, 0.5], [-1, -0.5], [0, -0.5], [1, -0.5], [-1.8, 0], [1.8, 0]].map((off, i) => (
            <Chair key={i} position={[4 + (off[0] as number) * 1.2, 0, 1 + (off[1] as number) * 1.5]} color="#4a3a2a" />
          ))}
          {/* Panoramic window (bright back wall section) */}
          <mesh position={[0, 1.5, -FLOOR_DEPTH / 2 + 0.06]}>
            <planeGeometry args={[8, 2]} />
            <meshStandardMaterial color="#ddeeff" emissive="#aaccee" emissiveIntensity={0.15} />
          </mesh>
        </>
      );
    case 9: // Planning
      return (
        <>
          {[[-6, 0, -2], [-2, 0, -2], [2, 0, -2]].map((pos, i) => (
            <group key={i}>
              <Desk position={pos as [number, number, number]} />
              <Monitor position={pos as [number, number, number]} screenColor={screenColor} />
              <Chair position={[pos[0], 0, pos[2] + 1.2]} color={accentColor} />
            </group>
          ))}
          <Whiteboard position={[-8, 0, -FLOOR_DEPTH / 2 + 0.1]} size={[2.5, 1.3]} />
          <GlassPartition position={[5, FLOOR_HEIGHT / 2, 0]} />
          <MeetingTable position={[7, 0, 0]} size={[1.8, 1]} />
          <Chair position={[7, 0, -0.8]} color={accentColor} rotation={0} />
          <Chair position={[7, 0, 0.8]} color={accentColor} rotation={Math.PI} />
        </>
      );
    case 8: // Risk/Audit
      return (
        <>
          {[[-5, 0, -2], [0, 0, -2]].map((pos, i) => (
            <group key={i}>
              <Desk position={pos as [number, number, number]} />
              <Monitor position={pos as [number, number, number]} screenColor="#E74C3C" />
              <Chair position={[pos[0], 0, pos[2] + 1.2]} color={accentColor} />
            </group>
          ))}
          {/* Wall of monitors (6 screens) */}
          {[[-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].map(([x, row], i) => (
            <mesh key={i} position={[6 + x * 1.1, 1.2 + row * 0.8, -FLOOR_DEPTH / 2 + 0.1]}>
              <boxGeometry args={[1, 0.7, 0.03]} />
              <meshStandardMaterial color="#1a1a1a" emissive="#cc4444" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </>
      );
    case 7: // SW Dev
      return (
        <>
          {[[-6, 0, -2], [-1.5, 0, -2], [3, 0, -2]].map((pos, i) => (
            <group key={i}>
              <Desk position={pos as [number, number, number]} />
              <Monitor position={[pos[0] - 0.25, 0, pos[2]]} screenColor="#00d4aa" />
              <Monitor position={[pos[0] + 0.25, 0, pos[2]]} screenColor="#00d4aa" />
              <Chair position={[pos[0], 0, pos[2] + 1.2]} color={accentColor} />
            </group>
          ))}
          <ServerRack position={[8, 0, -4]} />
          {/* Standing desk */}
          <group position={[7, 0, 1]}>
            <mesh position={[0, 1.05, 0]} castShadow>
              <boxGeometry args={[1.2, 0.04, 0.6]} />
              <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
            </mesh>
            <mesh position={[-0.5, 0.52, 0]}>
              <boxGeometry args={[0.04, 1.04, 0.04]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0.5, 0.52, 0]}>
              <boxGeometry args={[0.04, 1.04, 0.04]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.7} roughness={0.3} />
            </mesh>
            <Monitor position={[0, 0.3, 0]} screenColor="#00d4aa" />
          </group>
        </>
      );
    case 6: // Content
      return (
        <>
          {[[-7, 0, -2], [-3.5, 0, -2], [0, 0, -2], [3.5, 0, -2]].map((pos, i) => (
            <group key={i}>
              <Desk position={pos as [number, number, number]} />
              <Monitor position={pos as [number, number, number]} screenColor="#9B59B6" />
              <Chair position={[pos[0], 0, pos[2] + 1.2]} color={accentColor} />
            </group>
          ))}
          <RecordingBooth position={[7, 0, -3]} />
        </>
      );
    case 5: // Marketing
      return (
        <>
          {[[-7, 0, -2], [-3.5, 0, -2], [0, 0, -2], [3.5, 0, -2], [7, 0, -2]].map((pos, i) => (
            <group key={i}>
              <Desk position={pos as [number, number, number]} />
              <Monitor position={pos as [number, number, number]} screenColor="#E67E22" />
              <Chair position={[pos[0], 0, pos[2] + 1.2]} color={accentColor} />
            </group>
          ))}
          <PresentationScreen position={[0, 0, -FLOOR_DEPTH / 2 + 0.15]} />
        </>
      );
    case 4: // ICT
      return (
        <>
          {[[-5, 0, -2], [-1, 0, -2], [3, 0, -2]].map((pos, i) => (
            <group key={i}>
              <Desk position={pos as [number, number, number]} />
              <Monitor position={pos as [number, number, number]} screenColor="#00d4aa" />
              <Chair position={[pos[0], 0, pos[2] + 1.2]} color={accentColor} />
            </group>
          ))}
          {/* Server room section */}
          <GlassPartition position={[5, FLOOR_HEIGHT / 2, 0]} size={[0.05, FLOOR_HEIGHT, FLOOR_DEPTH - 1]} />
          {[6.5, 7.3, 8.1, 8.9].map((x, i) => (
            <ServerRack key={i} position={[x, 0, -2]} />
          ))}
          {/* Cool blue light in server room */}
          <pointLight position={[7.5, 2, -2]} color="#2266ff" intensity={0.6} distance={6} />
        </>
      );
    case 3: // HR
      return (
        <>
          {[[-5, 0, -2], [-1, 0, -2]].map((pos, i) => (
            <group key={i}>
              <Desk position={pos as [number, number, number]} />
              <Monitor position={pos as [number, number, number]} screenColor="#F39C12" />
              <Chair position={[pos[0], 0, pos[2] + 1.2]} color={accentColor} />
            </group>
          ))}
          {/* Interview room */}
          <GlassPartition position={[4, FLOOR_HEIGHT / 2, 0]} />
          <Chair position={[6, 0, -0.8]} color={accentColor} rotation={0} />
          <Chair position={[6, 0, 0.8]} color={accentColor} rotation={Math.PI} />
          <MeetingTable position={[6, 0, 0]} size={[1, 0.6]} />
        </>
      );
    case 2: // Capital
      return (
        <>
          {[[-8, 0, -2], [-5, 0, -2], [-2, 0, -2], [1, 0, -2], [4, 0, -2], [7, 0, -2]].map((pos, i) => (
            <group key={i}>
              <Desk position={pos as [number, number, number]} />
              <Monitor position={[pos[0] - 0.3, 0, pos[2]]} screenColor="#4488ff" />
              <Monitor position={[pos[0], 0, pos[2]]} screenColor="#00cc66" />
              <Monitor position={[pos[0] + 0.3, 0, pos[2]]} screenColor="#4488ff" />
              <Chair position={[pos[0], 0, pos[2] + 1.2]} color={accentColor} />
            </group>
          ))}
          <TickerStrip position={[0, 0, -FLOOR_DEPTH / 2 + 0.1]} />
          {/* War room */}
          <GlassPartition position={[-6, FLOOR_HEIGHT / 2, 2]} size={[0.05, FLOOR_HEIGHT, 3.5]} />
          <MeetingTable position={[-8, 0, 3.5]} size={[2, 1]} />
        </>
      );
    case 1: // SaaS / Lobby
      return (
        <>
          <ReceptionDesk position={[0, 0, 2]} />
          <Sofa position={[-5, 0, 3]} rotation={Math.PI / 2} />
          <Sofa position={[5, 0, 3]} rotation={-Math.PI / 2} />
          <Desk position={[6, 0, -2]} />
          <Monitor position={[6, 0, -2]} screenColor="#3498DB" />
          <Chair position={[6, 0, -0.8]} color={accentColor} />
        </>
      );
    default:
      return null;
  }
}

/* =================== MAIN FLOOR COMPONENT =================== */

export default function Floor3D({ floor, yOffset, isSelected, onFloorClick }: Floor3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const accentColor = DEPT_ACCENTS[floor.department] || '#5B8DB8';

  return (
    <group ref={groupRef} position={[0, yOffset, 0]} onClick={(e) => { e.stopPropagation(); onFloorClick(); }}>
      {/* Floor slab - light gray */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[FLOOR_WIDTH, FLOOR_DEPTH]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.8} />
      </mesh>

      {/* Floor edge (thin slab visible from side) */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[FLOOR_WIDTH, 0.1, FLOOR_DEPTH]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.7} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, FLOOR_HEIGHT - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[FLOOR_WIDTH, FLOOR_DEPTH]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>

      {/* Back wall - light gray */}
      <mesh position={[0, FLOOR_HEIGHT / 2, -FLOOR_DEPTH / 2]}>
        <planeGeometry args={[FLOOR_WIDTH, FLOOR_HEIGHT]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Left wall - glass */}
      <mesh position={[-FLOOR_WIDTH / 2, FLOOR_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[FLOOR_DEPTH, FLOOR_HEIGHT]} />
        <meshPhysicalMaterial
          color="#cce8ff"
          transparent
          transmission={0.6}
          roughness={0.1}
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Ceiling light strip (warm white) */}
      <mesh position={[0, FLOOR_HEIGHT - 0.06, 0]}>
        <boxGeometry args={[6, 0.03, 0.2]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fff5e6"
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh position={[-5, FLOOR_HEIGHT - 0.06, 0]}>
        <boxGeometry args={[3, 0.03, 0.2]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#fff5e6"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Per-floor warm point light */}
      <pointLight
        position={[0, FLOOR_HEIGHT - 0.3, 0]}
        color="#fff5e6"
        intensity={0.5}
        distance={15}
        decay={2}
      />

      {/* Department accent strip along floor edge - very subtle */}
      <mesh position={[0, 0.01, FLOOR_DEPTH / 2 - 0.05]}>
        <boxGeometry args={[FLOOR_WIDTH, 0.01, 0.1]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.3} />
      </mesh>

      {/* Floor label */}
      <Text
        position={[-FLOOR_WIDTH / 2 + 0.8, FLOOR_HEIGHT - 0.3, -FLOOR_DEPTH / 2 + 0.15]}
        fontSize={0.25}
        color="#888888"
        anchorX="left"
        anchorY="top"
      >
        {floor.label} {floor.department}
      </Text>

      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[FLOOR_WIDTH + 0.3, FLOOR_DEPTH + 0.3]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.2} opacity={0.1} transparent />
        </mesh>
      )}

      {/* Floor-specific furniture */}
      <FloorFurniture level={floor.level} accentColor={accentColor} />
    </group>
  );
}
