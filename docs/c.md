# Phase 3: 走行と摩擦の実装 (基本走行)

タイヤの摩擦力と駆動力を実装して走行可能にしてください。

## 1. タイヤ摩擦と駆動力の実装 (Step 2)
接地している場合のみ計算します。

### 速度ベクトルの分解
1. 接地点でのシャシー速度 `V_world` を取得。
2. タイヤの向き（前輪は操舵角 δ を考慮）に合わせてローカル座標系へ変換 → `V_long`, `V_lat`。

### スリップ角 (α)
- `α = arctan(-V_lat / |V_long|)`
- ※ `V_long ≈ 0` の微低速時は計算をスキップまたは緩和（ゼロ除算防止）。

### 縦力 (F_long) の計算
- **後輪**:
  - アクセル時: `F_long = F_drive` (均等配分)
  - ブレーキ時: `F_long = -F_brake`
- **前輪**:
  - `F_long = -F_brake`

### 横力 (F_lat) の計算
- `F_lat = CorneringStiffness * α`

### 摩擦円 (Friction Circle) によるクリッピング
1. 最大許容摩擦力: `F_max = μ * F_z` (F_zはPhase 2で計算したサスペンション力)
2. 要求ベクトル: `F_req = (F_long, F_lat)`
3. 判定: `|F_req| > F_max` の場合、大きさが `F_max` になるようにベクトルを縮小。

### 力の適用 (Impulse)
- 補正後の力をワールド座標に戻す → `F_world`
- `J_tire = F_world * delta`
- `applyImpulseAtPoint(J_tire, RayHitPoint)`

## 2. 入力制御
- `useKeyboardControls` 等でWASD入力を受け取ります。
- まだTV(トルクベクタリング)は実装せず、後輪に均等に駆動力を与えてください。
