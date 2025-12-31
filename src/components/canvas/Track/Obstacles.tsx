'use client';

import { RigidBody } from '@react-three/rapier';

interface ObstacleProps {
  trackType: 'straight' | 'circle' | 'slalom';
}

export default function Obstacles({ trackType }: ObstacleProps) {
  if (trackType === 'slalom') {
    // スラローム用のコーンを配置
    const cones = [];
    const spacing = 8; // 8m間隔
    const offset = 3; // 左右3mオフセット
    
    for (let i = 0; i < 8; i++) {
      const z = -30 + i * spacing;
      const x = (i % 2 === 0) ? offset : -offset;
      cones.push(
        <RigidBody key={i} type="fixed" position={[x, 0.5, z]}>
          <mesh castShadow>
            <coneGeometry args={[0.3, 1, 8]} />
            <meshStandardMaterial color="orange" />
          </mesh>
        </RigidBody>
      );
    }
    return <>{cones}</>;
  } else if (trackType === 'circle') {
    // 定常円旋回用のマーカー（視覚的なガイド）
    const markers = [];
    const radius = 15; // 15m半径
    const segments = 16;
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      markers.push(
        <mesh key={i} position={[x, 0.1, z]}>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 8]} />
          <meshStandardMaterial color="yellow" />
        </mesh>
      );
    }
    return <>{markers}</>;
  }
  
  // 'straight' の場合は何も配置しない（直線＋制動テスト用）
  return null;
}
