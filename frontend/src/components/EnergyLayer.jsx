// components/EnergyLayer.jsx
import { useEffect, useRef } from "react";

export default function EnergyLayer() {
  const ref = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!ref.current) return;

      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;

      ref.current.style.transform = `translate(${x}px, ${y}px)`;
    };

    // Add some random movement to particles
    const interval = setInterval(() => {
      particlesRef.current.forEach(particle => {
        if (particle) {
          const randomX = Math.random() * 4 - 2;
          const randomY = Math.random() * 4 - 2;
          particle.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }
      });
    }, 3000);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  const particles = [
    { top: "20%", left: "10%", delay: 0 },
    { top: "40%", left: "80%", delay: 1 },
    { top: "60%", left: "20%", delay: 2 },
    { top: "80%", left: "70%", delay: 3 },
    { top: "30%", left: "50%", delay: 4 },
    { top: "70%", left: "30%", delay: 5 },
    { top: "10%", left: "90%", delay: 6 },
    { top: "90%", left: "10%", delay: 7 },
  ];

  const rays = [
    { rotation: 0, delay: 0 },
    { rotation: 45, delay: 3 },
    { rotation: 90, delay: 6 },
    { rotation: 135, delay: 9 },
  ];

  return (
    <div ref={ref} className="absolute inset-0 energy-layer transition-transform duration-700 ease-out">
      {/* ⚡ Energy particles */}
      {particles.map((particle, index) => (
        <div
          key={index}
          ref={el => particlesRef.current[index] = el}
          className="energy-particle"
          style={{
            top: particle.top,
            left: particle.left,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}

      {/* 🌟 Light rays */}
      {rays.map((ray, index) => (
        <div
          key={index}
          className="light-ray"
          style={{
            animationDelay: `${ray.delay}s`,
            transform: `rotate(${ray.rotation}deg)`
          }}
        />
      ))}

      {/* ✨ Sparkles */}
      <div className="sparkle-container">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}