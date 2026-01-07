import React from 'react';

const SunLoader = ({ message = 'Processing...' }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      {/* Sun Animation Container */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer Glow Rings - Increasing/Decreasing */}
        <div className="absolute inset-0 animate-ping-slow">
          <div className="w-full h-full rounded-full border-4 border-amber-400/20"></div>
        </div>
        <div className="absolute inset-2 animate-pulse-slow">
          <div className="w-full h-full rounded-full border-4 border-amber-400/30"></div>
        </div>
        <div className="absolute inset-4 animate-pulse-medium">
          <div className="w-full h-full rounded-full border-4 border-amber-400/40"></div>
        </div>
        
        {/* Main Sun Circle with Glow */}
        <div className="relative w-20 h-20">
          {/* Sun core with pulsing glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 animate-sun-glow shadow-[0_0_60px_rgba(251,191,36,0.8),0_0_100px_rgba(251,146,60,0.5)]"></div>
          
          {/* Inner bright core */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white via-yellow-200 to-amber-300 animate-core-pulse"></div>
          
          {/* Sun rays */}
          <div className="absolute inset-0 animate-rotate-slow">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-t from-amber-400/80 via-yellow-400/40 to-transparent"
                style={{
                  transform: `rotate(${i * 45}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                <div 
                  className="w-full h-8 bg-gradient-to-t from-amber-300/60 to-transparent"
                  style={{ marginTop: '-100%' }}
                ></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Light rays extending outward */}
        <div className="absolute inset-0 animate-ray-pulse">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-t from-amber-400/60 via-yellow-400/20 to-transparent origin-bottom"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-60px)`,
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Loading Message */}
      <div className="mt-8 text-center">
        <p className="text-amber-400 text-lg font-semibold animate-text-pulse tracking-wide">
          {message}
        </p>
        <div className="flex justify-center mt-3 space-x-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.6s',
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Style for custom animations */}
      <style>{`
        @keyframes sun-glow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(251, 191, 36, 0.6), 0 0 80px rgba(251, 146, 60, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 80px rgba(251, 191, 36, 0.9), 0 0 120px rgba(251, 146, 60, 0.7), 0 0 160px rgba(245, 158, 11, 0.5);
            transform: scale(1.05);
          }
        }
        
        @keyframes core-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.95);
          }
        }
        
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes ray-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(-60px) scaleX(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-60px) scaleX(1.2);
          }
        }
        
        @keyframes ping-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.2;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.4;
          }
        }
        
        @keyframes pulse-medium {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.6;
          }
        }
        
        @keyframes text-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        
        .animate-sun-glow {
          animation: sun-glow 2s ease-in-out infinite;
        }
        
        .animate-core-pulse {
          animation: core-pulse 1.5s ease-in-out infinite;
        }
        
        .animate-rotate-slow {
          animation: rotate-slow 8s linear infinite;
        }
        
        .animate-ray-pulse {
          animation: ray-pulse 2s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2.5s ease-in-out infinite;
        }
        
        .animate-pulse-medium {
          animation: pulse-medium 2s ease-in-out infinite;
        }
        
        .animate-text-pulse {
          animation: text-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SunLoader;
