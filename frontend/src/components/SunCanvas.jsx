import { useMemo } from 'react';

// Seeded random function for consistent values
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function SunCanvas({ offsetY = 0 }) {
  // Generate particle data once using seeded random
  const particles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      size: seededRandom(i * 123.45) * 6 + 2,
      left: seededRandom(i * 234.56) * 200 - 100,
      top: seededRandom(i * 345.67) * 200 - 100,
      delay: seededRandom(i * 456.78) * 2,
      duration: seededRandom(i * 567.89) * 3 + 2,
    }));
  }, []);

  // Calculate sun position based on scroll
  const maxScroll = 500;
  const scrollFactor = Math.min(offsetY, maxScroll) / maxScroll;
  const sunTranslateY = scrollFactor * 80; // Moves down as you scroll
  const raysRotate = offsetY * 0.02;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Sun core - positioned at top right */}
      <div
        className="absolute rounded-full"
        style={{
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, #FFD166 0%, #FFA500 100%)',
          top: '60px',
          right: '8%',
          boxShadow: '0 0 60px #FFD166, 0 0 100px #FFA500',
          transform: `translateY(${sunTranslateY}px)`,
        }}
      />

      {/* Sun glow layers */}
      <div
        className="absolute rounded-full"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,209,102,0.4) 0%, rgba(255,209,102,0) 70%)',
          top: '0px',
          right: '4%',
          transform: `translateY(${sunTranslateY}px)`,
        }}
      />

      {/* Corona rays */}
      {/* <div
        className="absolute"
        style={{
          width: '300px',
          height: '300px',
          top: '-90px',
          right: '-5%',
          transform: `translateY(${sunTranslateY}px) rotate(${raysRotate}deg)`,
          transformOrigin: 'center 150px',
        }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-0 -translate-x-1/2"
            style={{
              width: '4px',
              height: '130px',
              background: 'linear-gradient(to top, rgba(255,209,102,0.8), transparent)',
              transform: `rotate(${i * 30}deg)`,
              transformOrigin: 'center bottom',
              borderRadius: '2px',
            }}
          />
        ))}
      </div> */}

      {/* Floating particles */}
      <div
        className="absolute"
        style={{
          width: '200px',
          height: '200px',
          top: '0px',
          right: '5%',
          transform: `translateY(${sunTranslateY + 60}px)`,
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: '#FFD166',
              opacity: 0.6,
              left: `${p.left}px`,
              top: `${p.top}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
