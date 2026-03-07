'use client';

import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, Html } from '@react-three/drei';
import { SimAgent } from '@/engine/simulation';

interface Agent3DProps {
  simAgent: SimAgent;
  onClick: () => void;
  floorY: number;
}

const STATE_COLORS: Record<string, string> = {
  working: '#22cc66',
  meeting: '#ee9922',
  walking: '#3399ff',
  elevator: '#8877dd',
  idle: '#999999',
  chatting: '#ee6699',
};

// Subtle department accent for foot glow
const DEPT_GLOW: Record<string, string> = {
  '회장실': '#d4a84b',
  '기획조정실': '#5B8DB8',
  '리스크챌린지실': '#C0584B',
  '감사실': '#C0584B',
  'SW개발본부': '#4AAF7C',
  '콘텐츠본부': '#8B6BAE',
  '마케팅본부': '#CC8844',
  'ICT본부': '#3DA89A',
  '인사실': '#D4A84B',
  '_y Capital': '#3BB896',
  '_y SaaS': '#5A9BCB',
};

export default function Agent3D({ simAgent, onClick, floorY }: Agent3DProps) {
  const spriteRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const currentPos = useRef({ x: simAgent.position.x, z: simAgent.position.z });

  const texture = useMemo(() => {
    if (!simAgent.agent.image) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(simAgent.agent.image);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [simAgent.agent.image]);

  useFrame((_, delta) => {
    if (!spriteRef.current) return;
    
    currentPos.current.x += (simAgent.position.x - currentPos.current.x) * Math.min(delta * 3, 1);
    currentPos.current.z += (simAgent.position.z - currentPos.current.z) * Math.min(delta * 3, 1);
    
    spriteRef.current.position.x = currentPos.current.x;
    spriteRef.current.position.z = currentPos.current.z;

    // Subtle bob when moving
    if (simAgent.state === 'walking' || simAgent.state === 'elevator') {
      spriteRef.current.position.y = floorY + 0.75 + Math.sin(Date.now() * 0.006) * 0.04;
    } else {
      spriteRef.current.position.y = floorY + 0.75;
    }

    // Hover scale
    const targetScale = hovered ? 1.2 : 1;
    spriteRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const stateColor = STATE_COLORS[simAgent.state] || '#999999';
  const deptGlow = DEPT_GLOW[simAgent.agent.department] || '#5B8DB8';

  return (
    <group
      ref={spriteRef}
      position={[simAgent.position.x, floorY + 0.75, simAgent.position.z]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Agent avatar */}
        {texture ? (
          <sprite scale={[1.5, 1.5, 1]}>
            <spriteMaterial map={texture} transparent alphaTest={0.1} />
          </sprite>
        ) : (
          /* Placeholder circle for Andrew (no image) */
          <group>
            <mesh>
              <circleGeometry args={[0.5, 16]} />
              <meshStandardMaterial color="#d4a84b" />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.35}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              A
            </Text>
          </group>
        )}
      </Billboard>

      {/* Name tag (Html for crisp text) */}
      {(hovered || simAgent.agent.floor === 10) && (
        <Html
          position={[0, 1.1, 0]}
          center
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.92)',
            color: '#333',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            borderBottom: `2px solid ${stateColor}`,
          }}>
            {simAgent.agent.name}
          </div>
        </Html>
      )}

      {/* Glow ring at feet (department color) */}
      <mesh position={[0, -0.74, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 0.4, 16]} />
        <meshStandardMaterial
          color={deptGlow}
          emissive={deptGlow}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent
          opacity={hovered ? 0.5 : 0.25}
        />
      </mesh>

      {/* Shadow on floor */}
      <mesh position={[0, -0.73, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#000000" opacity={0.15} transparent />
      </mesh>

      {/* Status dot */}
      <Billboard position={[0.55, 0.5, 0]}>
        <mesh>
          <circleGeometry args={[0.06, 8]} />
          <meshBasicMaterial color={stateColor} />
        </mesh>
      </Billboard>

      {/* Chat bubble when chatting */}
      {simAgent.chattingWith && (
        <Html position={[0.7, 0.9, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '2px 5px',
            fontSize: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}>
            💬
          </div>
        </Html>
      )}
    </group>
  );
}
