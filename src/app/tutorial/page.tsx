import Link from 'next/link';

export default function TutorialPage() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">チュートリアル / Tutorial</h1>
        
        <section className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">操作方法 / Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2">基本操作:</h3>
              <ul className="space-y-1 text-sm">
                <li><kbd className="bg-gray-700 px-2 py-1 rounded">W</kbd> / <kbd className="bg-gray-700 px-2 py-1 rounded">↑</kbd> : スロットル (Throttle)</li>
                <li><kbd className="bg-gray-700 px-2 py-1 rounded">S</kbd> / <kbd className="bg-gray-700 px-2 py-1 rounded">↓</kbd> : ブレーキ (Brake)</li>
                <li><kbd className="bg-gray-700 px-2 py-1 rounded">A</kbd> / <kbd className="bg-gray-700 px-2 py-1 rounded">←</kbd> : 左ステア (Steer Left)</li>
                <li><kbd className="bg-gray-700 px-2 py-1 rounded">D</kbd> / <kbd className="bg-gray-700 px-2 py-1 rounded">→</kbd> : 右ステア (Steer Right)</li>
                <li><kbd className="bg-gray-700 px-2 py-1 rounded">Space</kbd> : ブレーキ (Brake)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-2">システム操作:</h3>
              <ul className="space-y-1 text-sm">
                <li><kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd> : 車両リセット (Reset Vehicle)</li>
                <li><kbd className="bg-gray-700 px-2 py-1 rounded">Esc</kbd> : ポーズ (Pause)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">学習ポイント / Learning Points</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg mb-2">1. 車両運動の基礎</h3>
              <p className="text-sm text-gray-300">
                加速、減速、旋回時の車両の挙動を観察してください。
                速度が上がると旋回時のステアリング応答が変化することに注目してください。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">2. タイヤと摩擦</h3>
              <p className="text-sm text-gray-300">
                路面摩擦係数（μ）を変更すると、グリップ力が変化します。
                摩擦円の概念により、縦力（加減速）と横力（旋回）は独立ではありません。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">3. サスペンション</h3>
              <p className="text-sm text-gray-300">
                ばね定数と減衰係数を調整して、車両の乗り心地と安定性の関係を学びましょう。
                旋回時やブレーキング時の荷重移動を観察できます。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">4. インホイルモーターとトルクベクタリング</h3>
              <p className="text-sm text-gray-300">
                後輪左右の駆動力を独立制御することで、旋回性能を向上させます。
                TVゲインを変更して、その効果を体感してください。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">パラメータ調整 / Parameter Adjustment</h2>
          <p className="text-sm text-gray-300 mb-4">
            画面右上のLevaパネルから、以下のパラメータをリアルタイムで調整できます:
          </p>
          
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-bold">Suspension (サスペンション):</h4>
              <ul className="ml-4 space-y-1 text-gray-300">
                <li>• stiffness: ばね定数 [N/m]</li>
                <li>• damping: 減衰係数 [N·s/m]</li>
                <li>• restLength: 自然長 [m]</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold">Tires (タイヤ):</h4>
              <ul className="ml-4 space-y-1 text-gray-300">
                <li>• frictionCoeff: 摩擦係数 μ</li>
                <li>• corneringStiffness: コーナリング剛性 [N/rad]</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold">Powertrain (パワートレイン):</h4>
              <ul className="ml-4 space-y-1 text-gray-300">
                <li>• maxDriveForce: 最大駆動力 [N]</li>
                <li>• maxBrakeForce: 最大制動力 [N]</li>
                <li>• tvGain: トルクベクタリングゲイン</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold">Steering (ステアリング):</h4>
              <ul className="ml-4 space-y-1 text-gray-300">
                <li>• maxSteerAngle: 最大操舵角 [rad]</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">HUD表示 / HUD Display</h2>
          <p className="text-sm text-gray-300 mb-4">
            画面左上に表示される情報:
          </p>
          
          <ul className="space-y-1 text-sm text-gray-300">
            <li>• Speed: 車速 [km/h]</li>
            <li>• Steer: 操舵角 [度]</li>
            <li>• Yaw Rate: ヨーレート [rad/s]</li>
            <li>• Throttle: スロットル開度 [%]</li>
            <li>• Brake: ブレーキ圧 [%]</li>
            <li>• Wheel Status: 各輪の荷重と駆動力 (FL, FR, RL, RR)</li>
          </ul>
        </section>

        <div className="flex gap-4">
          <Link 
            href="/play" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            シミュレーションを開始 / Start Simulation
          </Link>
          <Link 
            href="/" 
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            トップに戻る / Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
