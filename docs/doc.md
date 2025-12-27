Markdown

# AI実装ガイド: 教育用3D運転シミュレータ (EV In-Wheel Motor) v1.0

## 1. プロジェクト概要

本プロジェクトは、Vercel上で動作するブラウザベースの車両運動シミュレータである。
既存のブラックボックスな車両ライブラリ（`useVehicleController`等）は**使用せず**、レイキャストと剛体物理（Rapier RigidBody）を用いて、サスペンションとタイヤ摩擦円の物理挙動をスクラッチで実装する。これにより、トルクベクタリング等の教育的なパラメータ調整を透明性高く実現する。

### 1.1 技術スタック (バージョン固定)
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.x
- **3D Library**: React Three Fiber (R3F) v8.x
- **Physics**: `@react-three/rapier` (v1.1.x以降)
- **State Management**: Zustand (Vanilla store pattern推奨 - 物理ループ外からのアクセス容易性のため)
- **UI**: Leva (パラメータ調整), Tailwind CSS (HUD)

### 1.2 【重要】物理実装の絶対ルール
AIは以下の2点を厳格に遵守すること。

#### 1.  **SI単位系の徹底**:
    - 内部計算は全て **メートル(m), キログラム(kg), 秒(s), ニュートン(N), ラジアン(rad)** で行うこと。
    - `km/h` や `deg` への変換は、**HUD表示コンポーネント内のみ**で行う。物理ロジックに持ち込まないこと。
    


#### 2.  **Impulse (力積) による制御**:
    - Rapierの `applyForce` は使用しない。
    - 挙動の安定性とフレームレート独立性を担保するため、力を計算した直後に時間ステップ `delta` を掛け、力積（Impulse）として適用する。
    - **式**: `Impulse (N・s) = Force (N) × delta (s)`
    - **メソッド**: `rigidBody.current.applyImpulseAtPoint(impulseVector, worldPoint, true)`

---

## 2. ディレクトリ構造

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
│   │   │   └── useVehiclePhysics.ts (【核心】物理計算フック)
│   │   └── Track/
│   │       ├── Ground.tsx
│   │       └── Obstacles.tsx
│   ├── hud/
│   │   ├── TelemetryPanel.tsx (Speed, G-force)
│   │   ├── WheelStatus.tsx (Load, Slip, DriveForce)
│   │   └── ControlsOverlay.tsx
│   └── ui/ (Buttons, Modals)
├── store/
│   └── useVehicleStore.ts (Physics parameters & Transient telemetry data)
└── lib/
    ├── mathUtils.ts (Vector math, Friction circle clamp)
    └── vehicleSpecs.ts (Constants)
3. データ構造定義 (TypeScript)
実装のブレを防ぐため、以下の型定義を遵守する。

TypeScript

// src/store/useVehicleStore.ts

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
};

// リアルタイムテレメトリ (60fps更新)
export type TelemetryData = {
  speed: number;       // m/s
  steerAngle: number;  // rad
  yawRate: number;     // rad/s
  wheelLoads: [number, number, number, number]; // FL, FR, RL, RR (N)
  wheelForces: [number, number, number, number]; // Longitudinal Force (N)
};
4. 物理モデル実装詳細 (Step-by-Step)
useVehiclePhysics.ts 内の useFrame((state, delta) => { ... }) ループ内に実装するロジック。 ループ内では delta (秒) が渡されるため、必ずこれを利用する。

Step 1: レイキャストサスペンション
4輪それぞれについて計算を行う。

レイ設定:

始点: シャシーのハードポイント（ワールド座標）

方向: シャシーの下向きベクトル（ワールド座標）

計測:

rapierWorld.castRay を実行し、距離 hitDistance を取得。

接地判定: hitDistance < restLength + radius ならば接地中。

サスペンション力 (F 
sus
​
 ):

圧縮量: x=(restLength+radius)−hitDistance

圧縮速度: v 
sus
​
 =(x 
current
​
 −x 
prev
​
 )/delta

力 (N): F 
sus
​
 =k⋅x+c⋅v 
sus
​
 

制約: F 
sus
​
 =max(0,F 
sus
​
 ) （ダンパーが地面を吸い寄せないようにする）

適用 (Impulse):

ImpulseVector = F_{sus} * delta * HitNormal

applyImpulseAtPoint(ImpulseVector, RayHitPoint)

※ ここで計算した F 
sus
​
  を「垂直荷重 F 
z
​
 」として保存しておく。

Step 2: タイヤ摩擦と駆動力 (摩擦円モデル)
接地している場合のみ計算する。

速度ベクトルの分解:

接地点でのシャシー速度 V 
world
​
  を取得。

タイヤの向き（前輪は操舵角 δ を考慮）に合わせてローカル座標系へ変換 →V 
long
​
 ,V 
lat
​
 。

スリップ角 (α):

α=arctan(−V 
lat
​
 /∣V 
long
​
 ∣)

※ V 
long
​
 ≈0 の微低速時は計算をスキップまたは緩和する（ゼロ除算防止）。

縦力 (F 
long
​
 ) の計算:

後輪:

アクセル時: F 
long
​
 =F 
drive
​
  (Step 3で計算するTV補正後の値)

ブレーキ時: F 
long
​
 =−F 
brake
​
 

前輪:

F 
long
​
 =−F 
brake
​
  (前輪駆動なし)

横力 (F 
lat
​
 ) の計算:

F 
lat
​
 =CorneringStiffness×α

摩擦円 (Friction Circle) によるクリッピング:

最大許容摩擦力: F 
max
​
 =μ×F 
z
​
 

要求ベクトル:  
F

  
req
​
 =(F 
long
​
 ,F 
lat
​
 )

判定: ∣ 
F

  
req
​
 ∣>F 
max
​
  の場合、大きさが F 
max
​
  になるようにベクトルを縮小（正規化×F 
max
​
 ）する。

適用 (Impulse):

補正後の力をワールド座標に戻す → 
F

  
world
​
 

Impulse化:  
J

  
tire
​
 = 
F

  
world
​
 ×delta

applyImpulseAtPoint(\vec{J}_{tire}, RayHitPoint)

Step 3: インホイルモーターとトルクベクタリング (TV)
後輪(RL, RR)の F 
drive
​
  計算ロジック。

基本駆動力:

F 
base
​
 =ThrottleInput×MaxDriveForce

目標ヨーモーメント係数 (M 
req
​
 ):

M 
req
​
 =SteerInput×Speed×TVGain

※ 直感的な挙動: 「右にハンドルを切ったら、左後輪を強く、右後輪を弱く」する。

左右配分:

左後輪 (RL): F 
drive_RL
​
 =0.5×F 
base
​
 −M 
req
​
 

右後輪 (RR): F 
drive_RR
​
 =0.5×F 
base
​
 +M 
req
​
 

※ 合計駆動力が F 
base
​
  を超えないようリミッターを入れても良いが、教育用としてはこの単純式で可。

5. AIへのプロンプト戦略 (実装フェーズ分け)
一度に全て生成させず、以下のフェーズごとにコードを書かせること。

Phase 1: プロジェクト基盤とシーン構築
Plaintext

Next.js (App Router), R3F, Rapier, Leva, Zustandを使ってプロジェクトの基盤を作成してください。
/play ページを作成し、以下を配置してください。
1. <Physics debug>: 物理デバッグ表示をONにする。
2. 床 (RigidBody type="fixed"): 大きなPlane。
3. 車体 (RigidBody type="dynamic"): 単純なBoxGeometry。重力で落下することを確認。
ディレクトリは src/components/canvas/Scene.tsx 等に整理してください。
Phase 2: サスペンションの実装 (ホバリングテスト)
Plaintext

車体に「レイキャストサスペンション」を実装して浮遊させてください。
1. useVehiclePhysics.ts フックを作成し、useFrame内で処理します。
2. 車体の4隅から下向きにレイを飛ばし、バネ・ダンパー力を計算します。
3. 重要: 力の適用には必ず `applyImpulseAtPoint(Force * delta)` を使用してください。
4. Levaでバネ定数(k)と減衰(c)を調整し、挙動が変わることを確認します。
Phase 3: 走行と摩擦の実装 (基本走行)
Plaintext

タイヤの摩擦力と駆動力を実装して走行可能にしてください。
1. 「AI実装ガイド」のStep 2に従い、スリップ角と簡易摩擦円モデルを実装します。
2. useKeyboardControls等でWASD入力を受け取ります。
3. まだTV(トルクベクタリング)は実装せず、後輪に均等に駆動力を与えてください。
4. 単位系はSI(m, kg, N)を厳守してください。
Phase 4: EV機能とHUDの実装
Plaintext

仕上げとして以下を実装してください。
1. 後輪左右独立駆動によるトルクベクタリング(TV)。ステアリングと速度に応じて左右の駆動力に差をつけます。
2. HUDコンポーネント。速度(m/s -> km/h変換)、各輪の垂直荷重(Fz)、後輪駆動力(Fx)をバーグラフで表示してください。
3. 車体のMeshは半透明にし、タイヤの位置やサスの沈み込みが見えるようにしてください。