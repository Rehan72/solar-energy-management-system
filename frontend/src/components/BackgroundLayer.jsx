// components/BackgroundLayer.jsx
import { useEffect, useState } from "react";
import EnergyLayer from "./EnergyLayer";
import SunCanvas from "./SunCanvas";

export default function BackgroundLayer() {
  const [offsetY, setOffsetY] = useState(0);

  // 🔁 PARALLAX + SCROLL ANIMATION
  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY * 0.15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 🌞 THREE.JS SUN CANVAS */}
      <SunCanvas offsetY={offsetY} />

      {/* Sky Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              180deg,
              #0f2027 0%,
              #203a43 50%,
              #2c5364 100%
            )
          `
        }}
      />

      {/* 🌗 THEME TINT OVERLAY (Improved) */}
      <div
        className="
          absolute inset-0
          transition-all duration-500
        "
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.7) 0%,
              rgba(255, 255, 255, 0.4) 50%,
              transparent 100%
            )
          `
        }}
      />
      <div
        className="
          absolute inset-0
          transition-all duration-500
          dark:block hidden
        "
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(0, 0, 0, 0.45) 0%,
              rgba(0, 0, 0, 0.25) 50%,
              transparent 100%
            )
          `
        }}
      />

      {/* Additional gradient layers for solar theme */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Solar energy glow */}
        <div 
          className="absolute top-0 left-0 w-full h-1/3"
          style={{
            background: `
              radial-gradient(
                ellipse at 50% 0%,
                rgba(245, 158, 11, 0.15) 0%,
                transparent 70%
              )
            `
          }}
        />
        
        {/* Panel tech pattern */}
        <div 
          className="absolute inset-0 opacity-5 dark:opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(45deg, var(--solar-border) 1px, transparent 1px),
              linear-gradient(-45deg, var(--solar-border) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 70%)'
          }}
        />
      </div>

      {/* ⚡ ENERGY LAYER */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <EnergyLayer />
      </div>
    </>
  );
}