# EV In-Wheel Motor Simulator

教育用3D運転シミュレータ - 後輪インホイルモーター×2による独立駆動とトルクベクタリングを学ぶ

Educational 3D driving simulator with independent rear wheel in-wheel motors and torque vectoring.

## Overview

This browser-based 3D vehicle dynamics simulator demonstrates:
- Vehicle motion (acceleration, braking, cornering)
- Tire friction and friction circle concept
- Suspension behavior (spring & damper)
- EV rear-wheel independent drive (in-wheel motors × 2)
- Simple torque vectoring

## Features

- **Real-time 3D Physics**: Built with Three.js/R3F and Rapier physics engine
- **HUD Telemetry**: Speed, steering angle, yaw rate, throttle/brake status, wheel loads, and drive forces
- **Parameter Adjustment**: Real-time tuning of suspension, tires, powertrain, and steering parameters via Leva controls
- **Multiple Track Types**: Straight (braking test), Circle (steady-state cornering), Slalom
- **Educational Focus**: Transparent chassis visualization to observe suspension and tire behavior

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

The project is ready to deploy on Vercel:

```bash
vercel
```

## Controls

### Driving
- `W` / `↑` : Throttle
- `S` / `↓` : Brake
- `A` / `←` : Steer Left  
- `D` / `→` : Steer Right
- `Space` : Brake

### System
- `R` : Reset Vehicle
- `Esc` : Pause/Resume

## Adjustable Parameters

### Suspension
- **stiffness**: Spring constant [N/m]
- **damping**: Damping coefficient [N·s/m]
- **restLength**: Natural length [m]

### Tires
- **frictionCoeff**: Friction coefficient μ
- **corneringStiffness**: Lateral force coefficient [N/rad]

### Powertrain
- **maxDriveForce**: Maximum drive force [N]
- **maxBrakeForce**: Maximum brake force [N]
- **tvGain**: Torque vectoring gain

### Steering
- **maxSteerAngle**: Maximum steering angle [rad]

### Track
- **type**: Straight (直線), Circle (定常円), Slalom (スラローム)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── play/page.tsx         # 3D simulation page
│   └── tutorial/page.tsx     # Tutorial & documentation
├── components/
│   ├── canvas/
│   │   ├── Scene.tsx         # Three.js canvas & physics setup
│   │   ├── Car/
│   │   │   ├── CarChassis.tsx
│   │   │   ├── WheelVisual.tsx
│   │   │   └── useVehiclePhysics.ts  # Core physics implementation
│   │   └── Track/
│   │       ├── Ground.tsx
│   │       └── Obstacles.tsx
│   └── hud/
│       └── HUD.tsx           # Telemetry display
├── store/
│   └── useVehicleStore.ts    # State management (Zustand)
└── lib/
    ├── mathUtils.ts
    └── vehicleSpecs.ts
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **3D**: React Three Fiber v9 / Three.js
- **Physics**: @react-three/rapier (Rapier physics engine)
- **UI**: Leva (parameter controls) + Tailwind CSS
- **State**: Zustand

## Learning Objectives

1. **Vehicle Dynamics**: Observe acceleration, braking, and cornering behavior
2. **Tire Friction**: Understand the friction circle concept and μ (friction coefficient)
3. **Suspension**: See how spring stiffness and damping affect ride and handling
4. **Torque Vectoring**: Experience how independent rear wheel drive improves cornering

## Development

This project uses:
- ESLint for code linting
- TypeScript for type safety
- Tailwind CSS for styling

## License

This project is for educational purposes.

## Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Rapier Physics](https://rapier.rs/)

---

Built with ❤️ for learning vehicle dynamics
