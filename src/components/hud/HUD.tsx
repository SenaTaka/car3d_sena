'use client';

import { useVehicleStore } from '@/store/useVehicleStore';

function TelemetryPanel() {
  const { speed, steerAngle, yawRate } = useVehicleStore((state) => state.telemetry);
  
  // Convert m/s to km/h
  const speedKmh = (speed * 3.6).toFixed(1);
  const steerDeg = (steerAngle * 180 / Math.PI).toFixed(1);

  return (
    <div className="bg-black/50 p-4 rounded-lg text-white font-mono text-sm mb-4">
      <h3 className="font-bold mb-2 border-b border-gray-500">Telemetry</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>Speed:</div>
        <div className="text-right">{speedKmh} km/h</div>
        <div>Steer:</div>
        <div className="text-right">{steerDeg}°</div>
        <div>Yaw Rate:</div>
        <div className="text-right">{yawRate.toFixed(2)} rad/s</div>
      </div>
    </div>
  );
}

function WheelStatus() {
  const { wheelLoads, wheelForces } = useVehicleStore((state) => state.telemetry);
  const labels = ['FL', 'FR', 'RL', 'RR'];

  return (
    <div className="bg-black/50 p-4 rounded-lg text-white font-mono text-xs">
      <h3 className="font-bold mb-2 border-b border-gray-500">Wheel Status</h3>
      <div className="grid grid-cols-4 gap-2 text-center mb-1">
        {labels.map(l => <div key={l}>{l}</div>)}
      </div>
      
      <div className="mb-2">Load (N)</div>
      <div className="grid grid-cols-4 gap-2 h-20 items-end mb-4">
        {wheelLoads.map((load, i) => (
          <div key={i} className="w-full bg-gray-700 relative h-full rounded">
            <div 
              className="absolute bottom-0 w-full bg-blue-500 rounded-b transition-all duration-75"
              style={{ height: `${Math.min(100, load / 50)}%` }} // Scale: 5000N = 100%
            />
            <div className="absolute bottom-0 w-full text-center text-[10px] mix-blend-difference">{Math.round(load || 0)}</div>
          </div>
        ))}
      </div>

      <div className="mb-2">Drive Force (N)</div>
      <div className="grid grid-cols-4 gap-2 h-20 items-end">
        {wheelForces.map((force, i) => (
          <div key={i} className="w-full bg-gray-700 relative h-full rounded flex items-center justify-center">
             {/* Center zero line */}
             <div className="absolute top-1/2 w-full h-px bg-gray-500"></div>
             <div 
              className={`absolute w-full transition-all duration-75 ${force > 0 ? 'bg-green-500 bottom-1/2' : 'bg-red-500 top-1/2'}`}
              style={{ height: `${Math.min(50, Math.abs(force || 0) / 60)}%` }} // Scale: 3000N = 50% height (from center)
            />
            <div className="absolute z-10 text-[10px] mix-blend-difference">{Math.round(force || 0)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HUD() {
  return (
    <div className="absolute top-4 left-4 z-10 pointer-events-none select-none">
      <TelemetryPanel />
      <WheelStatus />
      <div className="mt-4 text-white/70 text-xs">
        <p>Controls:</p>
        <p>WASD / Arrows : Drive</p>
        <p>Space : Brake</p>
      </div>
    </div>
  );
}
