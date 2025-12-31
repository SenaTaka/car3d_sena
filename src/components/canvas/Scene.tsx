'use client';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import { OrbitControls, KeyboardControls, KeyboardControlsEntry } from '@react-three/drei';

export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  brake = 'brake',
}

const map: KeyboardControlsEntry<Controls>[] = [
  { name: Controls.forward, keys: ['ArrowUp', 'w', 'W'] },
  { name: Controls.backward, keys: ['ArrowDown', 's', 'S'] },
  { name: Controls.left, keys: ['ArrowLeft', 'a', 'A'] },
  { name: Controls.right, keys: ['ArrowRight', 'd', 'D'] },
  { name: Controls.brake, keys: ['Space'] },
];

interface SceneProps {
  children: React.ReactNode;
}

export default function Scene({ children }: SceneProps) {
  return (
    <KeyboardControls map={map}>
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
        <color attach="background" args={['#1a1a2e']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <Suspense fallback={null}>
          <Physics debug>
            {children}
          </Physics>
          <OrbitControls />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}
