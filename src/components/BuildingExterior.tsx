'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

const FLOOR_HEIGHT = 3;
const NUM_FLOORS = 10;
const BUILDING_WIDTH = 20;
const BUILDING_DEPTH = 12;
const TOTAL_HEIGHT = NUM_FLOORS * FLOOR_HEIGHT;

export default function BuildingExterior() {
  // Corner column positions
  const columns = useMemo(() => {
    const cols: { pos: [number, number, number] }[] = [];
    const hw = BUILDING_WIDTH / 2;
    const hd = BUILDING_DEPTH / 2;
    // 4 corners
    for (const x of [-hw, hw]) {
      for (const z of [-hd, hd]) {
        cols.push({ pos: [x, TOTAL_HEIGHT / 2, z] });
      }
    }
    // Mid columns on long sides
    for (const z of [-hd, hd]) {
      cols.push({ pos: [0, TOTAL_HEIGHT / 2, z] });
    }
    return cols;
  }, []);

  // Horizontal beams at each floor level (front edge only - visible)
  const beams = useMemo(() => {
    const b: [number, number, number][] = [];
    for (let i = 0; i <= NUM_FLOORS; i++) {
      b.push([0, i * FLOOR_HEIGHT, BUILDING_DEPTH / 2]);
      b.push([0, i * FLOOR_HEIGHT, -BUILDING_DEPTH / 2]);
    }
    return b;
  }, []);

  return (
    <group>
      {/* Steel corner columns */}
      {columns.map((col, i) => (
        <mesh key={`col-${i}`} position={col.pos}>
          <cylinderGeometry args={[0.15, 0.15, TOTAL_HEIGHT, 8]} />
          <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Horizontal beams */}
      {beams.map((pos, i) => (
        <mesh key={`beam-${i}`} position={pos}>
          <boxGeometry args={[BUILDING_WIDTH + 0.4, 0.08, 0.12]} />
          <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Side beams (depth direction) at each floor */}
      {Array.from({ length: NUM_FLOORS + 1 }).map((_, i) => (
        <group key={`side-beam-${i}`}>
          <mesh position={[-BUILDING_WIDTH / 2, i * FLOOR_HEIGHT, 0]}>
            <boxGeometry args={[0.12, 0.08, BUILDING_DEPTH + 0.4]} />
            <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[BUILDING_WIDTH / 2, i * FLOOR_HEIGHT, 0]}>
            <boxGeometry args={[0.12, 0.08, BUILDING_DEPTH + 0.4]} />
            <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Glass curtain wall - back */}
      <mesh position={[0, TOTAL_HEIGHT / 2, -BUILDING_DEPTH / 2 - 0.05]}>
        <planeGeometry args={[BUILDING_WIDTH, TOTAL_HEIGHT]} />
        <meshPhysicalMaterial
          color="#cce8ff"
          transparent
          transmission={0.4}
          roughness={0.1}
          metalness={0.1}
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glass curtain wall - right side */}
      <mesh position={[BUILDING_WIDTH / 2 + 0.05, TOTAL_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[BUILDING_DEPTH, TOTAL_HEIGHT]} />
        <meshPhysicalMaterial
          color="#cce8ff"
          transparent
          transmission={0.4}
          roughness={0.1}
          metalness={0.1}
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rooftop structure */}
      <group position={[0, TOTAL_HEIGHT, 0]}>
        {/* Roof slab */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[BUILDING_WIDTH + 0.6, 0.2, BUILDING_DEPTH + 0.6]} />
          <meshStandardMaterial color="#d0d0d0" roughness={0.6} />
        </mesh>

        {/* Rooftop sign */}
        <Text
          position={[0, 2.5, 0]}
          fontSize={1.5}
          color="#333333"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
          outlineWidth={0.02}
          outlineColor="#666666"
        >
          _y HOLDINGS
        </Text>

        {/* Small rooftop elements */}
        {[[-5, 0.6, -3], [4, 0.5, -4]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <boxGeometry args={[1.2, 0.8, 1.2]} />
            <meshStandardMaterial color="#c0c0c0" roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Ground plane - light concrete */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 60]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.9} />
      </mesh>

      {/* Subtle ground grid */}
      <gridHelper args={[80, 40, '#c0c0c0', '#e0e0e0']} position={[0, 0.01, 0]} />

      {/* Trees */}
      {[
        [-14, 0, 10], [14, 0, 10], [-14, 0, -10], [14, 0, -10],
        [-8, 0, 12], [8, 0, 12],
      ].map((pos, i) => (
        <group key={`tree-${i}`} position={pos as [number, number, number]}>
          {/* Trunk */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 2.4, 6]} />
            <meshStandardMaterial color="#8B7355" roughness={0.8} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[1.2, 2.5, 8]} />
            <meshStandardMaterial color="#5a8a5a" roughness={0.8} />
          </mesh>
          <mesh position={[0, 3.8, 0]}>
            <coneGeometry args={[0.9, 2, 8]} />
            <meshStandardMaterial color="#4a7a4a" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Entrance area */}
      <group position={[0, 0, BUILDING_DEPTH / 2]}>
        {/* Entrance canopy */}
        <mesh position={[0, 3.2, 2]}>
          <boxGeometry args={[6, 0.1, 3]} />
          <meshPhysicalMaterial
            color="#e8f0ff"
            transparent
            opacity={0.5}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
        {/* Canopy supports */}
        {[[-2.5, 1.6, 2], [2.5, 1.6, 2]].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.06, 0.06, 3.2, 8]} />
            <meshStandardMaterial color="#999999" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Glass entrance doors */}
        <mesh position={[-1, 1.4, 0.1]}>
          <boxGeometry args={[1.8, 2.8, 0.05]} />
          <meshPhysicalMaterial color="#cce8ff" transparent transmission={0.6} roughness={0.05} opacity={0.3} />
        </mesh>
        <mesh position={[1, 1.4, 0.1]}>
          <boxGeometry args={[1.8, 2.8, 0.05]} />
          <meshPhysicalMaterial color="#cce8ff" transparent transmission={0.6} roughness={0.05} opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}
