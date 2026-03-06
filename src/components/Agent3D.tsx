'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import { SimAgent } from '@/engine/simulation';

interface Agent3DProps {
  simAgent: SimAgent;
  onClick: () => void;
  floorY: number;
}

// Simple name tag colors per state
const STATE_COLORS: Record<string, string> = {
  working: '#00ff88',
  meeting: '#ffaa00',
  walking: '#00aaff',
  elevator: '#aa88ff',
  idle: '#888888',
  chatting: '#ff88cc',
};

export default function Agent3D({ simAgent, onClick, floorY }: Agent3DProps) {
  const spriteRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const currentPos = useRef({ x: simAgent.position.x, z: simAgent.position.z });

  // Load agent texture
  const texture = useMemo(() => {
    if (!simAgent.agent.image) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(simAgent.agent.image);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [simAgent.agent.image]);

  // Smooth movement
  useFrame((_, delta) => {
    if (spriteRef.current) {
      currentPos.current.x += (simAgent.position.x - currentPos.current.x) * Math.min(delta * 3, 1);
      currentPos.current.z += (simAgent.position.z - currentPos.current.z) * Math.min(delta * 3, 1);
      
      spriteRef.current.position.x = currentPos.current.x;
      spriteRef.current.position.z = currentPos.current.z;

      // Subtle bobbing animation when walking
      if (simAgent.state === 'walking' || simAgent.state === 'elevator') {
        spriteRef.current.position.y = floorY + 0.7 + Math.sin(Date.now() * 0.005) * 0.05;
      } else {
        spriteRef.current.position.y = floorY + 0.7;
      }

      // Scale on hover
      const targetScale = hovered ? 1.3 : 1;
      spriteRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const stateColor = STATE_COLORS[simAgent.state] || '#888888';

  return (
    <group
      ref={spriteRef}
      position={[simAgent.position.x, floorY + 0.7, simAgent.position.z]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Agent avatar */}
        {texture ? (
          <sprite scale={[1.2, 1.2, 1]}>
            <spriteMaterial map={texture} transparent alphaTest={0.1} />
          </sprite>
        ) : (
          // Placeholder for Andrew (no image)
          <mesh>
            <circleGeometry args={[0.5, 16]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
          </mesh>
        )}

        {/* Name tag (visible on hover or always for chairman) */}
        {(hovered || simAgent.agent.floor === 10) && (
          <group position={[0, 0.85, 0]}>
            {/* Background */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[2.2, 0.35]} />
              <meshBasicMaterial color="#000000" opacity={0.75} transparent />
            </mesh>
            <Text
              fontSize={0.18}
              color={stateColor}
              anchorX="center"
              anchorY="middle"
            >
              {simAgent.agent.name}
            </Text>
          </group>
        )}

        {/* Status indicator dot */}
        <mesh position={[0.5, -0.5, 0]}>
          <circleGeometry args={[0.08, 8]} />
          <meshBasicMaterial color={stateColor} />
        </mesh>
      </Billboard>

      {/* Shadow on floor */}
      <mesh position={[0, -0.69, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.5, 1]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>

      {/* Chat bubble when chatting */}
      {simAgent.chattingWith && (
        <Billboard position={[0.8, 0.8, 0]}>
          <mesh>
            <planeGeometry args={[0.4, 0.4]} />
            <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
          </mesh>
          <Text fontSize={0.2} color="#000000" position={[0, 0, 0.01]}>
            💬
          </Text>
        </Billboard>
      )}
    </group>
  );
}
