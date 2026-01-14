import { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import EnergyLayer from "../components/EnergyLayer";
import ThemeToggle from "../components/ThemeToggle";
import BackgroundLayer from "../components/BackgroundLayer";
import FloatingParticles from "../components/FloatingParticles";
import SunCanvas from "../components/SunCanvas";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen w-screen overflow-hidden 
                    bg-linear-to-br from-solar-bg via-solar-bg to-solar-secondary/10 
                    dark:from-solar-bg dark:via-solar-night dark:to-solar-secondary/20
                    font-sans transition-colors duration-500">
      
      {/* 🌞 SOLAR THEME BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Sun/Moon Orb */}
        <div className={`
          absolute -top-32 -right-32
          w-[500px] h-[500px] rounded-full
          transition-all duration-700
          ${isDarkMode 
            ? 'bg-linear-to-br from-solar-panel/20 via-transparent to-transparent blur-3xl' 
            : 'bg-linear-to-br from-solar-yellow/30 via-solar-orange/20 to-transparent blur-3xl'
          }
        `} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(var(--solar-border) 1px, transparent 1px),
              linear-gradient(90deg, var(--solar-border) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at 50% 50%, black 40%, transparent 70%)'
          }}
        />
        
        {/* Circuit Lines */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="absolute h-px w-full"
              style={{
                top: `${20 + i * 15}%`,
                background: `linear-gradient(90deg, 
                  transparent, 
                  var(--solar-yellow), 
                  var(--solar-orange), 
                  transparent)`,
                filter: 'blur(1px)'
              }}
            />
          ))}
        </div>
      </div>

      {/* ⚡ ENERGY ANIMATION LAYER */}
      <div className="absolute inset-0">
        {/* <EnergyLayer /> */}
        <BackgroundLayer />
              <FloatingParticles />
               <SunCanvas />
      </div>

      {/* 🌑 THEME OVERLAY */}
      <div className="absolute inset-0 
                      bg-linear-to-br from-white/20 via-transparent to-transparent
                      dark:from-black/30 dark:via-transparent
                      transition-all duration-500" />

      {/* 🎨 THEME TOGGLE */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div>

      {/* 🔐 AUTH CONTENT */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* LOGO/HEADER */}
          <div className="mb-8 text-center animate-fade-in">
            <h1 className="text-4xl font-bold bg-linear-to-r from-solar-yellow to-solar-orange bg-clip-text text-transparent">
              SolarSync
            </h1>
            <p className="mt-2 text-solar-muted dark:text-solar-muted/80">
              Intelligent Solar Energy Management
            </p>
          </div>

          {/* 🔁 ADVANCED SOLAR GLOW AUTH TOGGLE */}
          <div className="
            flex rounded-2xl overflow-hidden mb-8
            border border-solar-border
            bg-solar-surface/40 backdrop-blur-xl
            shadow-lg p-1.5
          ">
            <button
              onClick={() => setIsLogin(true)}
              className={`
                flex-1 py-3 text-sm font-semibold transition-all duration-300
                rounded-xl relative group
                ${isLogin
                  ? "bg-solar-yellow text-solar-dark shadow-solar-glow-yellow scale-[1.02]"
                  : "text-solar-muted hover:text-solar-primary hover:bg-solar-border/30"}
              `}
            >
              Login
            </button>
            
            <button
              onClick={() => setIsLogin(false)}
              className={`
                flex-1 py-3 text-sm font-semibold transition-all duration-300
                rounded-xl relative group
                ${!isLogin
                  ? "bg-solar-yellow text-solar-dark shadow-solar-glow-yellow scale-[1.02]"
                  : "text-solar-muted hover:text-solar-primary hover:bg-solar-border/30"}
              `}
            >
              Register
            </button>
          </div>

          {/* 🔐 AUTH FORM CARD */}
          <div className="solar-glass rounded-3xl overflow-hidden relative animate-fade-in">
            {/* Animated primary border strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-solar-yellow via-solar-orange to-solar-yellow animate-shimmer" />
            
            <div className="p-8 md:p-10">
              {isLogin ? <Login /> : <Register />}
            </div>
          </div>

          {/* 🚀 FEATURES BADGE */}
          <div className="mt-8 text-center">
            <div className="inline-flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1.5 text-xs rounded-full 
                              bg-solar-success/20 dark:bg-solar-success/10 
                              text-solar-success dark:text-solar-success 
                              border border-solar-success/30">
                ⚡ Real-time Monitoring
              </span>
              <span className="px-3 py-1.5 text-xs rounded-full 
                              bg-solar-secondary/20 dark:bg-solar-secondary/10 
                              text-solar-secondary dark:text-solar-secondary 
                              border border-solar-secondary/30">
                🤖 AI Predictions
              </span>
              <span className="px-3 py-1.5 text-xs rounded-full 
                              bg-solar-yellow/20 dark:bg-solar-yellow/10 
                              text-solar-yellow dark:text-solar-yellow 
                              border border-solar-yellow/30">
                📱 24/7 Alerts
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 📱 RESPONSIVE FOOTER NOTE */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-20">
        <p className="text-sm text-solar-muted/70 dark:text-solar-muted/60 px-4">
          Optimizing solar energy for a sustainable future • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
