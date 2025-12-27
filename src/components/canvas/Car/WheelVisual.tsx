'use client';

import { forwardRef } from 'react';
import * as THREE from 'three';

const WheelVisual = forwardRef<THREE.Group>((props, ref) => {
  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
});

WheelVisual.displayName = 'WheelVisual';
export default WheelVisual;
