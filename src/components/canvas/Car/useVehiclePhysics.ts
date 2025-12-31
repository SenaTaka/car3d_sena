import { useRapier, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { useVehicleStore } from '@/store/useVehicleStore';
import * as THREE from 'three';
import { useControls } from 'leva';
import { useKeyboardControls } from '@react-three/drei';
import { clamp } from '@/lib/mathUtils';

// Wheel positions relative to chassis center (approximate for 2x4m car)
// FL, FR, RL, RR
const WHEEL_OFFSETS = [
  new THREE.Vector3(-0.8, -0.5, -1.2), // Front Left
  new THREE.Vector3(0.8, -0.5, -1.2),  // Front Right
  new THREE.Vector3(-0.8, -0.5, 1.2),  // Rear Left
  new THREE.Vector3(0.8, -0.5, 1.2),   // Rear Right
];

export const useVehiclePhysics = (
  chassisBody: React.RefObject<RapierRigidBody | null>,
  wheelRefs: React.MutableRefObject<(THREE.Object3D | null)[]>
) => {
  const { world, rapier } = useRapier();
  const params = useVehicleStore((state) => state.params);
  const setParams = useVehicleStore((state) => state.setParams);
  const setTelemetry = useVehicleStore((state) => state.setTelemetry);
  const isPaused = useVehicleStore((state) => state.isPaused);
  const shouldReset = useVehicleStore((state) => state.shouldReset);
  const resetComplete = useVehicleStore((state) => state.resetComplete);
  const [, getKeys] = useKeyboardControls();

  // Leva controls
  useControls('Suspension', {
    stiffness: {
      value: params.suspension.stiffness,
      min: 0,
      max: 100000,
      step: 100,
      onChange: (v) => setParams({ suspension: { ...params.suspension, stiffness: v } }),
    },
    damping: {
      value: params.suspension.damping,
      min: 0,
      max: 10000,
      step: 10,
      onChange: (v) => setParams({ suspension: { ...params.suspension, damping: v } }),
    },
    restLength: {
      value: params.suspension.restLength,
      min: 0.1,
      max: 2.0,
      step: 0.01,
      onChange: (v) => setParams({ suspension: { ...params.suspension, restLength: v } }),
    },
  });

  useControls('Tires', {
    frictionCoeff: {
      value: params.tires.frictionCoeff,
      min: 0.1,
      max: 2.0,
      step: 0.1,
      onChange: (v) => setParams({ tires: { ...params.tires, frictionCoeff: v } }),
    },
    corneringStiffness: {
      value: params.tires.corneringStiffness,
      min: 1000,
      max: 20000,
      step: 100,
      onChange: (v) => setParams({ tires: { ...params.tires, corneringStiffness: v } }),
    },
  });
  
  useControls('Powertrain', {
    maxDriveForce: {
      value: params.powertrain.maxDriveForce,
      min: 0,
      max: 15000,
      step: 100,
      onChange: (v) => setParams({ powertrain: { ...params.powertrain, maxDriveForce: v } }),
    },
    maxBrakeForce: {
      value: params.powertrain.maxBrakeForce,
      min: 0,
      max: 20000,
      step: 100,
      onChange: (v) => setParams({ powertrain: { ...params.powertrain, maxBrakeForce: v } }),
    },
    tvGain: {
      value: params.powertrain.tvGain,
      min: 0,
      max: 500,
      step: 10,
      onChange: (v) => setParams({ powertrain: { ...params.powertrain, tvGain: v } }),
    },
  });

  useControls('Steering', {
    maxSteerAngle: {
      value: params.maxSteerAngle,
      min: 0.1,
      max: 1.0,
      step: 0.05,
      onChange: (v) => setParams({ maxSteerAngle: v }),
    },
  });

  // Store previous compression for damping calculation
  const prevCompressions = useRef<number[]>([0, 0, 0, 0]);

  useFrame((state, delta) => {
    if (!chassisBody.current || delta <= 0) return;

    const { suspension, tires, powertrain, maxSteerAngle } = params;
    const chassis = chassisBody.current;
    
    // Handle reset
    if (shouldReset) {
      chassis.setTranslation({ x: 0, y: 1, z: 0 }, true);
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
      chassis.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
      prevCompressions.current = [0, 0, 0, 0];
      resetComplete();
      return;
    }

    // Handle pause
    if (isPaused) {
      return;
    }

    const keys = getKeys();
    
    // Input handling
    const throttle = keys.forward ? 1 : 0;
    const brake = keys.backward ? 1 : (keys.brake ? 1 : 0);
    const steerInput = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
    const currentSteerAngle = steerInput * maxSteerAngle;

    // Get chassis world transform
    const translation = chassis.translation();
    const rotation = chassis.rotation();

    // Safety check for NaN/Infinite in physics state
    if (!translation || !Number.isFinite(translation.x) || !Number.isFinite(translation.y) || !Number.isFinite(translation.z) ||
        !rotation || !Number.isFinite(rotation.x) || !Number.isFinite(rotation.y) || !Number.isFinite(rotation.z) || !Number.isFinite(rotation.w)) {
        console.warn("Physics explosion detected! Resetting vehicle.");
        chassis.setTranslation({ x: 0, y: 1, z: 0 }, true);
        chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
        chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
        chassis.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
        return;
    }

    const quaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);

    // Down direction in world space (local -Y rotated to world)
    const downDir = new THREE.Vector3(0, -1, 0).applyQuaternion(quaternion);
    
    // Chassis forward and right vectors
    const chassisForward = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion); // -Z is forward
    const chassisUp = new THREE.Vector3(0, 1, 0).applyQuaternion(quaternion);

    // Telemetry data containers
    const wheelLoads: [number, number, number, number] = [0, 0, 0, 0];
    const wheelForces: [number, number, number, number] = [0, 0, 0, 0];
    
    // Calculate Speed
    const velocity = chassis.linvel();
    const speed = Math.sqrt(velocity.x**2 + velocity.y**2 + velocity.z**2);

    WHEEL_OFFSETS.forEach((offset, index) => {
      const isFront = index < 2;
      const isRear = index >= 2;
      const wheelVisual = wheelRefs.current[index];

      // Calculate hardpoint world position
      const localPoint = offset.clone();
      const worldPoint = localPoint.applyQuaternion(quaternion).add(translation);

      // Raycast
      // Origin: Hardpoint + small offset downwards to avoid self-intersection
      const rayOrigin = worldPoint.clone().add(downDir.clone().multiplyScalar(0.1));
      const ray = new rapier.Ray(rayOrigin, downDir);
      const maxDistance = suspension.restLength + suspension.radius - 0.1;
      
      const hit = world.castRay(ray, maxDistance, true) as any;

      if (hit) {
        const hitDistance = hit.toi + 0.1; // Add offset back
        const hitPoint = rayOrigin.clone().add(downDir.clone().multiplyScalar(hit.toi));
        const hitNormal = new THREE.Vector3(hit.normal.x, hit.normal.y, hit.normal.z);
        
        // 1. Velocity at contact point (needed for both suspension damping and tires)
        // V_point = V_cm + omega x r
        const linvel = chassis.linvel();
        const angvel = chassis.angvel();
        const r = worldPoint.clone().sub(translation);
        const omega = new THREE.Vector3(angvel.x, angvel.y, angvel.z);
        const V_world = new THREE.Vector3(linvel.x, linvel.y, linvel.z).add(omega.cross(r));

        // --- Suspension (Disabled) ---
        // Just calculate Fz for tire friction based on static weight distribution
        // Fz = Mass * Gravity / 4
        const Fz = (params.mass * 9.81) / 4;
        wheelLoads[index] = Fz;

        // No suspension impulse applied
        // chassis.applyImpulseAtPoint(suspensionImpulse, worldPoint, true);

        // --- Tire Friction & Drive ---
        
        // 2. Tire Basis
        const tireSteerAngle = isFront ? currentSteerAngle : 0;
        
        // Rotate forward vector by steer angle around up vector
        const tireForward = chassisForward.clone().applyAxisAngle(chassisUp, tireSteerAngle);
        const tireRightDir = tireForward.clone().cross(chassisUp).normalize();

        // Project velocity onto tire basis
        const V_long = V_world.dot(tireForward);
        const V_lat = V_world.dot(tireRightDir);

        // 3. Slip Angle
        let alpha = 0;
        if (Math.abs(V_long) > 0.1) {
            alpha = Math.atan2(-V_lat, Math.abs(V_long));
        }

        // 4. Forces
        // Longitudinal
        let F_long = 0;
        if (isRear) {
            // RWD with Torque Vectoring
            const F_base = throttle * powertrain.maxDriveForce;
            const M_req = steerInput * speed * powertrain.tvGain;
            
            if (throttle > 0) {
                if (index === 2) { // RL
                    F_long = 0.5 * F_base - M_req;
                } else { // RR
                    F_long = 0.5 * F_base + M_req;
                }
            } else if (brake > 0) {
                F_long = -brake * powertrain.maxBrakeForce / 2;
            }
        } else {
            // Front
            if (brake > 0) {
                F_long = -brake * powertrain.maxBrakeForce / 2;
            }
        }
        
        wheelForces[index] = F_long;

        // Lateral
        const F_lat = tires.corneringStiffness * alpha;

        // 5. Friction Circle
        const F_max = tires.frictionCoeff * Fz;
        const F_req = new THREE.Vector2(F_long, F_lat);
        
        if (F_req.length() > F_max) {
            F_req.setLength(F_max);
        }

        // 6. Apply Impulse
        const F_world = tireForward.clone().multiplyScalar(F_req.x)
            .add(tireRightDir.clone().multiplyScalar(F_req.y));
        
        const tireImpulse = F_world.multiplyScalar(delta);
        const maxImpulse = 1000; // Clamp impulse to prevent explosion
        if (tireImpulse.lengthSq() > maxImpulse * maxImpulse) {
            tireImpulse.setLength(maxImpulse);
        }

        if (tireImpulse.lengthSq() > 0 && !isNaN(tireImpulse.x)) {
            chassis.applyImpulseAtPoint(tireImpulse, worldPoint, true);
        }

        // --- Visual Update ---
        if (wheelVisual) {
            const newPos = hitNormal.clone().multiplyScalar(suspension.radius).add(hitPoint);
            if (Number.isFinite(newPos.x) && Number.isFinite(newPos.y) && Number.isFinite(newPos.z)) {
                wheelVisual.position.copy(newPos);
                
                // Rotation: Match chassis rotation + steer
                wheelVisual.quaternion.copy(quaternion);
                if (Number.isFinite(tireSteerAngle)) {
                    wheelVisual.rotateOnAxis(new THREE.Vector3(0, 1, 0), tireSteerAngle);
                }
            }
        }

      } else {
        prevCompressions.current[index] = 0;
        
        // Airborne visual
        if (wheelVisual) {
            const extendedPos = worldPoint.clone().add(downDir.clone().multiplyScalar(suspension.restLength));
            if (Number.isFinite(extendedPos.x) && Number.isFinite(extendedPos.y) && Number.isFinite(extendedPos.z)) {
                wheelVisual.position.copy(extendedPos);
                wheelVisual.quaternion.copy(quaternion);
                if (isFront && Number.isFinite(currentSteerAngle)) {
                     wheelVisual.rotateOnAxis(new THREE.Vector3(0, 1, 0), currentSteerAngle);
                }
            }
        }
      }
    });

    // Update Telemetry
    setTelemetry({
        speed: isNaN(speed) ? 0 : speed,
        steerAngle: isNaN(currentSteerAngle) ? 0 : currentSteerAngle,
        yawRate: isNaN((chassis as any).angvel().y) ? 0 : (chassis as any).angvel().y,
        throttle: throttle,
        brake: brake,
        wheelLoads: wheelLoads.map(v => isNaN(v) ? 0 : v) as [number, number, number, number],
        wheelForces: wheelForces.map(v => isNaN(v) ? 0 : v) as [number, number, number, number],
    });
  });
};
