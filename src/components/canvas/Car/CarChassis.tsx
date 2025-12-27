'use client';

import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { useRef } from 'react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { useVehiclePhysics } from './useVehiclePhysics';
import WheelVisual from './WheelVisual';
import * as THREE from 'three';

export default function CarChassis() {
  const rigidBody = useRef<RapierRigidBody>(null);
  const wheelRefs = useRef<(THREE.Group | null)[]>([null, null, null, null]);
  const { mass } = useVehicleStore((state) => state.params);

  useVehiclePhysics(rigidBody, wheelRefs);

  return (
    <>
      <RigidBody
        ref={rigidBody}
        type="dynamic"
        position={[0, 1, 0]} // Start closer to ground to prevent huge impact
        mass={mass}
        colliders={false} // Use custom collider
        linearDamping={0.5}
        angularDamping={0.5}
        friction={0} // Zero friction to allow tire forces to control movement
      >
        <CuboidCollider args={[0.9, 0.4, 1.9]} />
        <mesh castShadow>
          <boxGeometry args={[2, 1, 4]} />
          <meshStandardMaterial color="orange" transparent opacity={0.5} />
        </mesh>
      </RigidBody>
      
      {/* Wheels - Rendered outside RigidBody to be controlled manually by physics hook */}
      <WheelVisual ref={(el) => { wheelRefs.current[0] = el; }} />
      <WheelVisual ref={(el) => { wheelRefs.current[1] = el; }} />
      <WheelVisual ref={(el) => { wheelRefs.current[2] = el; }} />
      <WheelVisual ref={(el) => { wheelRefs.current[3] = el; }} />
    </>
  );
}
