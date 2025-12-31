import { create } from 'zustand';

// ユーザーがLevaで調整可能なパラメータ
export type VehicleParams = {
  mass: number;         // kg (例: 1200)
  suspension: {
    stiffness: number;  // N/m (例: 30000)
    damping: number;    // N・s/m (例: 2500)
    restLength: number; // m (例: 0.5) - 自然長
    radius: number;     // m (例: 0.3) - タイヤ半径
  };
  tires: {
    frictionCoeff: number; // μ (例: 1.0) - 最大摩擦係数
    corneringStiffness: number; // N/rad (例: 5000) - 横力係数
  };
  powertrain: {
    maxDriveForce: number; // N (例: 6000)
    maxBrakeForce: number; // N (例: 8000)
    tvGain: number;        // scalar (例: 100) - トルクベクタリング強度
  };
  maxSteerAngle: number; // rad (例: 0.5) - 最大操舵角
};

// リアルタイムテレメトリ (60fps更新)
export type TelemetryData = {
  speed: number;       // m/s
  steerAngle: number;  // rad
  yawRate: number;     // rad/s
  throttle: number;    // 0-1
  brake: number;       // 0-1
  wheelLoads: [number, number, number, number]; // FL, FR, RL, RR (N)
  wheelForces: [number, number, number, number]; // Longitudinal Force (N)
};

interface VehicleStore {
  params: VehicleParams;
  telemetry: TelemetryData;
  isPaused: boolean;
  shouldReset: boolean;
  trackType: 'straight' | 'circle' | 'slalom';
  setParams: (params: Partial<VehicleParams>) => void;
  setTelemetry: (data: Partial<TelemetryData>) => void;
  setPaused: (paused: boolean) => void;
  requestReset: () => void;
  resetComplete: () => void;
  setTrackType: (trackType: 'straight' | 'circle' | 'slalom') => void;
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  params: {
    mass: 1200,
    suspension: {
      stiffness: 20000,
      damping: 4000,
      restLength: 0.5,
      radius: 0.3,
    },
    tires: {
      frictionCoeff: 1.0,
      corneringStiffness: 5000,
    },
    powertrain: {
      maxDriveForce: 6000,
      maxBrakeForce: 8000,
      tvGain: 100,
    },
    maxSteerAngle: 0.5,
  },
  telemetry: {
    speed: 0,
    steerAngle: 0,
    yawRate: 0,
    throttle: 0,
    brake: 0,
    wheelLoads: [0, 0, 0, 0],
    wheelForces: [0, 0, 0, 0],
  },
  isPaused: false,
  shouldReset: false,
  trackType: 'straight',
  setParams: (newParams) =>
    set((state) => ({
      params: { ...state.params, ...newParams },
    })),
  setTelemetry: (newData) =>
    set((state) => ({
      telemetry: { ...state.telemetry, ...newData },
    })),
  setPaused: (paused) => set({ isPaused: paused }),
  requestReset: () => set({ shouldReset: true }),
  resetComplete: () => set({ shouldReset: false }),
  setTrackType: (trackType) => set({ trackType }),
}));
