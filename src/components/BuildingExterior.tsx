'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

interface BuildingExteriorProps {
  timeOfDay: 'day' | 'evening' | 'night';
}

const FLOOR_HEIGHT = 3;
const NUM_FLOORS = 10;
const BUILDING_WIDTH = 20;
const BUILDING_DEPTH = 12;
const TOTAL_HEIGHT = NUM_FLOORS * FLOOR_HEIGHT + 2; // +2 for roof

export default function BuildingExterior({ timeOfDay }: BuildingExteriorProps) {
  const neonRef = useRef<THREE.Mesh>(null);
  const isNight = timeOfDay === 'night';
  const isEvening = timeOfDay === 'evening';
  const glowIntensity = isNight ? 1.5 : isEvening ? 0.8 : 0.3;

  useFrame((state) => {
    if (neonRef.current) {
      const material = neonRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = glowIntensity + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  // Glass pillar columns at corners
  const cornerPositions: [number, number, number][] = [
    [-BUILDING_WIDTH / 2, TOTAL_HEIGHT / 2, -BUILDING_DEPTH / 2],
    [BUILDING_WIDTH / 2, TOTAL_HEIGHT / 2, -BUILDING_DEPTH / 2],
    [-BUILDING_WIDTH / 2, TOTAL_HEIGHT / 2, BUILDING_DEPTH / 2],
    [BUILDING_WIDTH / 2, TOTAL_HEIGHT / 2, BUILDING_DEPTH / 2],
  ];

  // Window glow panels for night time (back wall only)
  const windowPanels = useMemo(() => {
    if (!isNight && !isEvening) return [];
    const panels: { pos: [number, number, number]; color: string }[] = [];
    const colors = ['#FFD700', '#4A90D9', '#E74C3C', '#2ECC71', '#9B59B6', '#E67E22', '#1ABC9C', '#F39C12', '#00D4AA', '#3498DB'];
    for (let f = 0; f < NUM_FLOORS; f++) {
      const y = f * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
      // Random windows lit
      for (let w = 0; w < 4; w++) {
        if (Math.random() > 0.4) {
          const x = -BUILDING_WIDTH / 2 + 3 + w * 4.5;
          panels.push({
            pos: [x, y, -BUILDING_DEPTH / 2 - 0.1],
            color: colors[f],
          });
        }
      }
    }
    return panels;
  }, [isNight, isEvening]);

  return (
    <group>
      {/* Glass exterior walls - back wall (partially transparent) */}
      <mesh position={[0, TOTAL_HEIGHT / 2, -BUILDING_DEPTH / 2 - 0.2]}>
        <planeGeometry args={[BUILDING_WIDTH + 0.5, TOTAL_HEIGHT]} />
        <meshPhysicalMaterial
          color="#88bbdd"
          transparent
          opacity={0.06}
          metalness={0.95}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left wall glass */}
      <mesh position={[-BUILDING_WIDTH / 2 - 0.2, TOTAL_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[BUILDING_DEPTH + 0.5, TOTAL_HEIGHT]} />
        <meshPhysicalMaterial
          color="#88bbdd"
          transparent
          opacity={0.04}
          metalness={0.95}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right wall glass */}
      <mesh position={[BUILDING_WIDTH / 2 + 0.2, TOTAL_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[BUILDING_DEPTH + 0.5, TOTAL_HEIGHT]} />
        <meshPhysicalMaterial
          color="#88bbdd"
          transparent
          opacity={0.04}
          metalness={0.95}
          roughness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Corner steel columns */}
      {cornerPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.3, TOTAL_HEIGHT, 0.3]} />
          <meshStandardMaterial color="#3a3a4a" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Horizontal steel beams between floors */}
      {Array.from({ length: NUM_FLOORS + 1 }).map((_, i) => (
        <mesh key={`beam-${i}`} position={[0, i * FLOOR_HEIGHT, BUILDING_DEPTH / 2]}>
          <boxGeometry args={[BUILDING_WIDTH + 0.5, 0.12, 0.2]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Rooftop */}
      <group position={[0, TOTAL_HEIGHT - 1, 0]}>
        {/* Roof slab */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[BUILDING_WIDTH + 1, 0.3, BUILDING_DEPTH + 1]} />
          <meshStandardMaterial color="#2a2a3a" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Rooftop signage - "_y HOLDINGS" */}
        <Text
          position={[0, 2, 0]}
          fontSize={1.8}
          color="#00e5ff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#003344"
        >
          _y HOLDINGS
        </Text>

        {/* Neon glow bar behind text */}
        <mesh ref={neonRef} position={[0, 1.6, -0.5]}>
          <boxGeometry args={[12, 0.1, 0.1]} />
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={glowIntensity}
          />
        </mesh>

        {/* Antenna */}
        <mesh position={[7, 3, -3]}>
          <cylinderGeometry args={[0.05, 0.05, 5, 8]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.8} />
        </mesh>
        <mesh position={[7, 5.5, -3]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={isNight ? 2 : 0.5} />
        </mesh>

        {/* Secondary antenna */}
        <mesh position={[-6, 2, -4]}>
          <cylinderGeometry args={[0.03, 0.03, 3, 6]} />
          <meshStandardMaterial color="#4a4a5a" metalness={0.8} />
        </mesh>

        {/* Rooftop AC units */}
        {[[-4, 0.5, -3], [2, 0.5, -3], [5, 0.5, -4]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <boxGeometry args={[1.5, 0.8, 1.5]} />
            <meshStandardMaterial color="#3a3a4a" metalness={0.4} roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Ground level */}
      <group position={[0, 0, 0]}>
        {/* Ground plane */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 40]} />
          <meshStandardMaterial color="#0a0a15" />
        </mesh>

        {/* Entrance canopy */}
        <mesh position={[0, 3.3, BUILDING_DEPTH / 2 + 1.5]}>
          <boxGeometry args={[6, 0.15, 3]} />
          <meshPhysicalMaterial color="#88bbdd" transparent opacity={0.15} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Entrance pillars */}
        {[[-2.5, 1.65, BUILDING_DEPTH / 2 + 1], [2.5, 1.65, BUILDING_DEPTH / 2 + 1]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.12, 0.12, 3.3, 8]} />
            <meshStandardMaterial color="#4a4a5a" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        {/* Entrance light */}
        <pointLight position={[0, 3, BUILDING_DEPTH / 2 + 1.5]} color="#00e5ff" intensity={0.8} distance={8} />

        {/* Trees / planters */}
        {[[-12, 0, BUILDING_DEPTH / 2 + 3], [12, 0, BUILDING_DEPTH / 2 + 3], [-8, 0, BUILDING_DEPTH / 2 + 5], [8, 0, BUILDING_DEPTH / 2 + 5]].map((pos, i) => (
          <group key={i} position={pos as [number, number, number]}>
            {/* Planter */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.6, 0.5, 0.6, 8]} />
              <meshStandardMaterial color="#2a2a2a" />
            </mesh>
            {/* Tree trunk */}
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 1.2, 6]} />
              <meshStandardMaterial color="#4a3020" />
            </mesh>
            {/* Tree crown */}
            <mesh position={[0, 2.2, 0]}>
              <sphereGeometry args={[0.8, 8, 8]} />
              <meshStandardMaterial color="#1a5530" />
            </mesh>
          </group>
        ))}

        {/* Parking lines */}
        {[-18, -14, -10, 14, 18].map((x, i) => (
          <mesh key={i} position={[x, 0.01, BUILDING_DEPTH / 2 + 8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.5, 5]} />
            <meshStandardMaterial color="#1a1a2a" />
          </mesh>
        ))}

        {/* Road markings */}
        <mesh position={[0, 0.02, BUILDING_DEPTH / 2 + 12]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[50, 0.15]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>

      {/* Night window glows */}
      {windowPanels.map((panel, i) => (
        <mesh key={i} position={panel.pos}>
          <planeGeometry args={[3, 2]} />
          <meshStandardMaterial
            color={panel.color}
            emissive={panel.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}
