export const DEFAULT_VEHICLE_SPECS = {
  mass: 1200,
  suspension: {
    stiffness: 30000,
    damping: 2500,
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
};
