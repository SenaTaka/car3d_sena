'use client';

import { useEffect } from 'react';
import Scene from '@/components/canvas/Scene';
import Ground from '@/components/canvas/Track/Ground';
import Obstacles from '@/components/canvas/Track/Obstacles';
import CarChassis from '@/components/canvas/Car/CarChassis';
import HUD from '@/components/hud/HUD';
import { Leva, useControls } from 'leva';
import { useVehicleStore } from '@/store/useVehicleStore';

function PauseModal({ onResume, onRestart }: { onResume: () => void; onRestart: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-4">Paused</h2>
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            Resume (Esc)
          </button>
          <button
            onClick={onRestart}
            className="w-full px-6 py-3 bg-green-600 rounded hover:bg-green-700 transition"
          >
            Restart (R)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const isPaused = useVehicleStore((state) => state.isPaused);
  const setPaused = useVehicleStore((state) => state.setPaused);
  const requestReset = useVehicleStore((state) => state.requestReset);
  const trackType = useVehicleStore((state) => state.trackType);
  const setTrackType = useVehicleStore((state) => state.setTrackType);

  // Track selection controls
  useControls('Track', {
    type: {
      value: trackType,
      options: {
        'Straight (直線)': 'straight',
        'Circle (定常円)': 'circle',
        'Slalom (スラローム)': 'slalom',
      },
      onChange: (v) => setTrackType(v as 'straight' | 'circle' | 'slalom'),
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setPaused(!isPaused);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        requestReset();
        setPaused(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, setPaused, requestReset]);

  return (
    <div className="w-full h-screen relative">
      <Leva />
      <HUD />
      {isPaused && (
        <PauseModal
          onResume={() => setPaused(false)}
          onRestart={() => {
            requestReset();
            setPaused(false);
          }}
        />
      )}
      <Scene>
        <Ground />
        <Obstacles trackType={trackType} />
        <CarChassis />
      </Scene>
    </div>
  );
}
