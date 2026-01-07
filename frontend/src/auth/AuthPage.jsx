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
                    bg-gradient-to-br from-solar-bg via-solar-bg to-solar-panel/10 
                    dark:from-solar-bg dark:via-solar-night dark:to-solar-panel/20
                    font-sans transition-colors duration-500">
      
      {/* 🌞 SOLAR THEME BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Sun/Moon Orb */}
        <div className={`
          absolute -top-32 -right-32
          w-[500px] h-[500px] rounded-full
          transition-all duration-700
          ${isDarkMode 
            ? 'bg-gradient-to-br from-solar-panel/20 via-transparent to-transparent blur-3xl' 
            : 'bg-gradient-to-br from-solar-yellow/30 via-solar-orange/20 to-transparent blur-3xl'
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
                      bg-gradient-to-br from-white/20 via-transparent to-transparent
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
          <div className="mb-8 text-center">
            {/* <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full 
                              bg-gradient-to-br from-solar-yellow to-solar-orange 
                              shadow-[0_0_25px_rgba(245,158,11,0.5)]
                              flex items-center justify-center">
                <svg className="w-6 h-6 text-solar-dark" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-3.791l-.168-.527-.653.375a1 1 0 00-.995.69l-.256.768a1 1 0 01-1.023.242l-.249-.114-.928.373A1 1 0 008 15.465V14a1 1 0 01-1-1V4a1 1 0 011-1h3z" clipRule="evenodd" transform="rotate(15 10 10)" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold 
                             bg-gradient-to-r from-solar-yellow to-solar-orange 
                             bg-clip-text text-transparent">
                SolarSync
              </h1>
            </div> */}
            <p className="text-solar-muted dark:text-solar-muted/80">
              Intelligent Solar Energy Management
            </p>
          </div>

          {/* 🔁 ADVANCED SOLAR GLOW AUTH TOGGLE */}
          <div className="
            flex rounded-xl overflow-hidden mb-6
            border border-solar-border dark:border-solar-border
            bg-solar-card/80 dark:bg-solar-card/80
            backdrop-blur-xl
            shadow-lg
            p-1
            relative
            before:absolute before:inset-0 before:rounded-xl
            before:bg-gradient-to-r before:from-solar-gold/10 before:via-transparent before:to-solar-gold/10
            before:opacity-0 before:transition-opacity before:duration-500
            hover:before:opacity-100
          ">
            <button
              onClick={() => setIsLogin(true)}
              className={`
                flex-1 py-3.5 text-sm font-semibold transition-all duration-300
                rounded-lg relative
                overflow-hidden
                group
                ${isLogin
                  ? `
                      bg-solar-gold text-solar-textPrimaryLight dark:text-solar-textPrimaryDark
                      shadow-[0_0_0_3px_rgba(212,174,85,0.3),0_0_20px_rgba(212,174,85,0.5),0_0_40px_rgba(212,174,85,0.2)]
                      hover:shadow-[0_0_0_4px_rgba(212,174,85,0.4),0_0_25px_rgba(212,174,85,0.6),0_0_50px_rgba(212,174,85,0.3)]
                      transform hover:scale-[1.02]
                      after:absolute after:inset-0 after:rounded-lg
                      after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_70%)]
                    `
                  : "text-solar-muted hover:text-solar-primary hover:bg-solar-border/30"}
              `}
            >
              {/* Energy particles */}
              {isLogin && (
                <>
                  <div className="
                    absolute top-1 left-4 w-1 h-1 rounded-full bg-white/80
                    animate-bounce
                  " />
                  <div className="
                    absolute top-2 right-6 w-1 h-1 rounded-full bg-white/60
                    animate-bounce [animation-delay:0.2s]
                  " />
                  <div className="
                    absolute bottom-2 left-8 w-1 h-1 rounded-full bg-white/70
                    animate-bounce [animation-delay:0.4s]
                  " />
                </>
              )}
              
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLogin && (
                  <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                Login
              </span>
            </button>
            
            <button
              onClick={() => setIsLogin(false)}
              className={`
                flex-1 py-3.5 text-sm font-semibold transition-all duration-300
                rounded-lg relative
                overflow-hidden
                group
                ${!isLogin
                  ? `
                      bg-solar-gold text-solar-textPrimaryLight dark:text-solar-textPrimaryDark
                      shadow-[0_0_0_3px_rgba(212,174,85,0.3),0_0_20px_rgba(212,174,85,0.5),0_0_40px_rgba(212,174,85,0.2)]
                      hover:shadow-[0_0_0_4px_rgba(212,174,85,0.4),0_0_25px_rgba(212,174,85,0.6),0_0_50px_rgba(212,174,85,0.3)]
                      transform hover:scale-[1.02]
                      after:absolute after:inset-0 after:rounded-lg
                      after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.3),transparent_70%)]
                    `
                  : "text-solar-muted hover:text-solar-primary hover:bg-solar-border/30"}
              `}
            >
              {/* Energy particles */}
              {!isLogin && (
                <>
                  <div className="
                    absolute top-1 left-4 w-1 h-1 rounded-full bg-white/80
                    animate-bounce
                  " />
                  <div className="
                    absolute top-2 right-6 w-1 h-1 rounded-full bg-white/60
                    animate-bounce [animation-delay:0.2s]
                  " />
                  <div className="
                    absolute bottom-2 left-8 w-1 h-1 rounded-full bg-white/70
                    animate-bounce [animation-delay:0.4s]
                  " />
                </>
              )}
              
              <span className="relative z-10 flex items-center justify-center gap-2">
                {!isLogin && (
                  <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                Register
              </span>
            </button>
          </div>

          {/* 🔐 AUTH FORM CARD */}
          <div className="
            animate-fade-in
            bg-solar-card dark:bg-solar-card
            border border-solar-border dark:border-solar-border
            rounded-2xl
            backdrop-blur-xl
            shadow-2xl
            overflow-hidden
            relative
          ">
            {/* Animated border */}
            <div className="
              absolute top-0 left-0 right-0 h-1
              bg-gradient-to-r from-solar-yellow via-solar-orange to-solar-yellow
              animate-shimmer
            " />
            
            {/* Form content */}
            <div className="p-8">
              {isLogin ? <Login /> : <Register />}
            </div>

            {/* Energy dots */}
            <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-solar-yellow/50 blur-sm" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-solar-orange/50 blur-sm" />
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
                              bg-solar-panel/20 dark:bg-solar-panel/10 
                              text-solar-panel dark:text-solar-panel 
                              border border-solar-panel/30">
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
