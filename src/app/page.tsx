import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900">
      <h1 className="text-4xl font-bold mb-4 text-white">EV In-Wheel Motor Simulator</h1>
      <p className="text-gray-300 mb-8 text-center max-w-2xl">
        教育用3D運転シミュレータ - 後輪インホイルモーター×2による独立駆動とトルクベクタリングを学ぶ
      </p>
      <div className="flex gap-4">
        <Link href="/play" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Start Simulation
        </Link>
        <Link href="/tutorial" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Tutorial
        </Link>
      </div>
    </main>
  );
}
