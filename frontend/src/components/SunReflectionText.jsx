import { useState, useRef, useEffect } from 'react';

export default function SunReflectionText({ children, className = '' }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    };

    element.addEventListener('mousemove', handleMouseMove);
    return () => element.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <span
      ref={elementRef}
      className={`relative inline-block cursor-pointer ${className}`}
      style={{
        background: 'linear-gradient(135deg, #F59E0B 0%, #FFD700 50%, #F59E0B 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {/* Radial glow that follows mouse */}
      <span
        className="pointer-events-none absolute inset-0 rounded opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(255, 215, 0, 0.4), transparent 40%)`,
          opacity: 1,
        }}
      />
      {children}
    </span>
  );
}
