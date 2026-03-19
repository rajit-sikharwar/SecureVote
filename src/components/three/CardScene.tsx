import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { FloatingCard } from './FloatingCard';

interface CardSceneProps {
  cardCount?: number;
  className?: string;
}

export function CardScene({ cardCount = 3, className = '' }: CardSceneProps) {
  const colors = ['#4f46e5', '#06b6d4', '#8b5cf6', '#ec4899'];

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4f46e5" />

        {/* Environment */}
        <Environment preset="city" />

        {/* Floating Cards */}
        {Array.from({ length: cardCount }).map((_, i) => {
          const angle = (i / cardCount) * Math.PI * 2;
          const radius = 3;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <FloatingCard
              key={i}
              position={[x, 0, z]}
              color={colors[i % colors.length]}
              delay={i * 0.5}
            />
          );
        })}

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
