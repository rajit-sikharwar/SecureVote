import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { VotingAnimation } from './VotingAnimation';

interface VotingSceneProps {
  className?: string;
}

export function VotingScene({ className = '' }: VotingSceneProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 6]} fov={50} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, 0, -5]} intensity={0.8} color="#4f46e5" />
        <pointLight position={[10, 0, -5]} intensity={0.8} color="#06b6d4" />

        {/* Environment */}
        <Environment preset="night" />

        {/* Voting Animation */}
        <VotingAnimation />

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}
