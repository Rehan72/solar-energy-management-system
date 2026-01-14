import React from 'react';

/**
 * SunLoader - A premium, mesmerizing solar-themed loading component.
 * Features multi-layered glow animations, rotating rays, and a vibrant sun core.
 */
const SunLoader = ({ message = 'Harnessing Solar Energy...', fullscreen = true }) => {
  const positionClasses = fullscreen 
    ? "fixed inset-0 z-[99999]" 
    : "absolute inset-0 z-50 rounded-2xl";

  return (
    <div className={`${positionClasses} bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>

      {/* Main Sun Construction */}
      <div className="relative w-48 h-48 flex items-center justify-center scale-110">

        {/* Pulsing Aura Rings */}
        <div className="absolute inset-0 rounded-full border border-amber-500/20 scale-[1.4] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute inset-0 rounded-full border border-orange-500/10 scale-[1.8] animate-[ping_4s_linear_infinite]"></div>

        {/* Rotating Outer Rays */}
        <div className="absolute inset-0 animate-[spin_12s_linear_infinite]">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full flex flex-col justify-between"
              style={{ transform: `rotate(${i * 30}deg)` }}
            >
              <div className="w-1.5 h-6 bg-gradient-to-b from-amber-400 to-transparent rounded-full shadow-[0_0_12px_rgba(251,191,36,0.5)]"></div>
              <div className="w-1.5 h-6 bg-gradient-to-t from-orange-500 to-transparent rounded-full opacity-40"></div>
            </div>
          ))}
        </div>

        {/* Counter-Rotating Inner Rays */}
        <div className="absolute inset-4 animate-[spin_8s_linear_infinite_reverse]">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full flex flex-col justify-between"
              style={{ transform: `rotate(${i * 45 + 22.5}deg)` }}
            >
              <div className="w-1 h-4 bg-gradient-to-b from-yellow-300 to-transparent rounded-full"></div>
            </div>
          ))}
        </div>

        {/* The Solar Core */}
        <div className="relative w-24 h-24 group">
          {/* Intense Outer Glow */}
          <div className="absolute -inset-4 bg-amber-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>

          {/* Main Sun Gradient Body */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-600 via-yellow-400 to-amber-300 shadow-[0_0_80px_rgba(245,158,11,0.6)] animate-[sun-vibration_0.5s_infinite]"></div>

          {/* Inner Plasma Core */}
          <div className="absolute inset-3 rounded-full bg-white shadow-[0_0_30px_#fff] flex items-center justify-center">
            {/* Dynamic Core Texture */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white via-yellow-100 to-amber-200 animate-pulse overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(251,191,36,0.1)_100%)]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Text Container */}
      <div className="mt-16 flex flex-col items-center">
        <div className="relative overflow-hidden px-6 py-2">
          <p className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 animate-[shimmer_2s_infinite_linear] bg-[length:200%_auto]">
            {message.toUpperCase()}
          </p>
          {/* Progress underline */}
          <div className="mt-2 h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent w-1/2 animate-[progress-slide_1.5s_ease-in-out_infinite]"></div>
          </div>
        </div>

        <p className="mt-4 text-slate-500 font-medium text-sm italic tracking-wide animate-pulse">
          Optimizing energy grids...
        </p>
      </div>

      <style>{`
        @keyframes sun-vibration {
          0%, 100% { transform: scale(1) translate(0, 0); }
          25% { transform: scale(1.02) translate(1px, -1px); }
          50% { transform: scale(1) translate(-1px, 1px); }
          75% { transform: scale(1.02) translate(1px, 1px); }
        }

        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

export default SunLoader;
