import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingCardProps {
  position: [number, number, number];
  color?: string;
  delay?: number;
}

export function FloatingCard({ position, color = '#4f46e5', delay = 0 }: FloatingCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.2;

      // Gentle rotation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.1;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.2 + delay) * 0.05;
    }
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[2, 2.5, 0.2]}
      radius={0.15}
      smoothness={4}
      position={position}
    >
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.4}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </RoundedBox>
  );
}
