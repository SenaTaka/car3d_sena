# Phase 1: プロジェクト基盤とシーン構築

Next.js (App Router), R3F, Rapier, Leva, Zustandを使ってプロジェクトの基盤を作成してください。

## 1. プロジェクトセットアップ
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.x
- **3D Library**: React Three Fiber (R3F) v8.x
- **Physics**: `@react-three/rapier` (v1.1.x以降)
- **State Management**: Zustand (Vanilla store pattern推奨)
- **UI**: Leva (パラメータ調整), Tailwind CSS (HUD)

## 2. ディレクトリ構造の作成
以下の構造を作成してください。
```text
src/
├── app/
│   ├── page.tsx (Landing)
│   └── play/ (Simulation Scene root)
├── components/
│   ├── canvas/
│   │   ├── Scene.tsx (Canvas, Physics, Lights)
│   │   ├── Car/
│   │   │   ├── CarChassis.tsx (RigidBody, Collider, Mesh)
│   │   │   ├── WheelVisual.tsx (Mesh only - no physics body)
│   │   │   └── useVehiclePhysics.ts
│   │   └── Track/
│   │       ├── Ground.tsx
│   │       └── Obstacles.tsx
│   ├── hud/
│   └── ui/
├── store/
│   └── useVehicleStore.ts
└── lib/
    ├── mathUtils.ts
    └── vehicleSpecs.ts
```

## 3. シーンの実装
`/play` ページを作成し、以下を配置してください。
1. **Physics debug**: 物理デバッグ表示をONにする (`<Physics debug>`)。
2. **床**: `RigidBody type="fixed"` で大きなPlaneを作成。
3. **車体**: `RigidBody type="dynamic"` で単純なBoxGeometryを作成。重力で落下することを確認。

## 4. ストアの準備
`src/store/useVehicleStore.ts` を作成し、基本的な型定義を行ってください（詳細はdoc.md参照）。
