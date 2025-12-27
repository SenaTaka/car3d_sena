# Phase 2: サスペンションの実装 (ホバリングテスト)

車体に「レイキャストサスペンション」を実装して浮遊させてください。

## 1. 物理計算フックの作成
`src/components/canvas/Car/useVehiclePhysics.ts` を作成し、`useFrame((state, delta) => { ... })` ループ内にロジックを実装します。

## 2. レイキャストサスペンションの実装 (Step 1)
4輪それぞれについて以下の計算を行います。

### レイ設定
- **始点**: シャシーのハードポイント（ワールド座標）
- **方向**: シャシーの下向きベクトル（ワールド座標）

### 計測と計算
1. `rapierWorld.castRay` を実行し、距離 `hitDistance` を取得。
2. **接地判定**: `hitDistance < restLength + radius` ならば接地中。
3. **サスペンション力 (F_sus)**:
   - 圧縮量: `x = (restLength + radius) - hitDistance`
   - 圧縮速度: `v_sus = (x_current - x_prev) / delta`
   - 力 (N): `F_sus = k * x + c * v_sus`
   - 制約: `F_sus = max(0, F_sus)`

### 力の適用 (Impulse)
**重要**: 力の適用には必ず `applyImpulseAtPoint` を使用してください。
- `ImpulseVector = F_sus * delta * HitNormal`
- `rigidBody.current.applyImpulseAtPoint(ImpulseVector, RayHitPoint, true)`

## 3. パラメータ調整
Levaでバネ定数(k)と減衰(c)を調整できるようにし、挙動が変わることを確認してください。
単位系は **SI単位系 (m, kg, N)** を厳守してください。
