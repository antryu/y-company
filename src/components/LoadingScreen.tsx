'use client';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-[100]">
      {/* _y Logo */}
      <div className="relative mb-8">
        <div className="text-5xl sm:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600 font-mono animate-pulse">
          _y
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      </div>

      <h2 className="text-sm sm:text-base text-gray-400 font-mono mb-6 tracking-widest">
        HOLDINGS
      </h2>

      {/* Loading bar */}
      <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
          style={{
            animation: 'loadBar 1.8s ease-in-out',
          }}
        />
      </div>

      <p className="text-[10px] text-gray-600 font-mono mt-4">
        Initializing 29 agents...
      </p>

      <style jsx>{`
        @keyframes loadBar {
          0% { width: 0% }
          50% { width: 60% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  );
}
