'use client';

import Scene from '@/components/canvas/Scene';
import Ground from '@/components/canvas/Track/Ground';
import CarChassis from '@/components/canvas/Car/CarChassis';
import HUD from '@/components/hud/HUD';
import { Leva } from 'leva';

export default function PlayPage() {
  return (
    <div className="w-full h-screen relative">
      <Leva />
      <HUD />
      <Scene>
        <Ground />
        <CarChassis />
      </Scene>
    </div>
  );
}
