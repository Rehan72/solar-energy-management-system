import React from "react";
import { Link } from "react-router-dom";
import BackgroundLayer from "../components/BackgroundLayer";
import SolarMap from "../components/SolarMap";
import SunCanvas from "../components/SunCanvas";
import FloatingParticles from "../components/FloatingParticles";
import SunReflectionText from "../components/SunReflectionText";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-solar-primary">
      <BackgroundLayer />
      <FloatingParticles />
      <SunCanvas />
      {/* 🌟 CONTENT */}
      <div className="relative z-10">

        {/* ================= HERO ================= */}
        <section className="min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 px-6 items-center">

            {/* LEFT TEXT */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold sun-glow-text leading-tight">
                Solar Energy <br /> Management Platform
              </h1>

              <p className="mt-6 text-lg text-solar-muted max-w-xl">
                A smart platform to monitor, analyze, and optimize solar energy
                production using real-time IoT data and AI-powered insights.
              </p>

              <div className="mt-10 flex gap-4">
                <Link
                  to="/auth"
                  className="px-6 py-3 bg-solar-yellow text-solar-dark font-semibold rounded-md hover:bg-solar-orange transition sun-button"
                >
                  Get Started
                </Link>

                <Link
                  to="/login"
                  className="px-6 py-3 border border-solar-primary rounded-md hover:bg-solar-panel/40 transition sun-button"
                >
                  View Dashboard
                </Link>
              </div>
            </div>

            {/* RIGHT VISUAL - SOLAR MAP */}
            <div className="relative">
              <div className="
                bg-solar-night/80
                backdrop-blur-xl
                border border-solar-primary
                rounded-2xl
                shadow-2xl
                p-6
                energy-card
              ">
                <SolarMap isPublic={true} />
              </div>
            </div>

          </div>
        </section>

        {/* ================= TRUST STRIP ================= */}
        <section className="py-20 border-t border-solar-primary bg-solar-night/60 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 px-6 text-center">
            <Stat value={60} suffix="% Average Savings" />
            <Stat value={2.1} suffix="M kWh Generated" />
            <Stat value={15000} suffix="+ Users" />
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center sun-glow-text">
              Built for Modern Solar Systems
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <Feature
                title="Live Solar Data"
                desc="ESP32 sensors stream voltage, current, and power data in real time."
              />
              <Feature
                title="AI Energy Prediction"
                desc="LSTM-based models predict energy generation using weather data for optimal planning."
              />
              <Feature
                title="Smart Alerts & Monitoring"
                desc="Instant notifications for underperformance, faults, and energy loss prevention."
              />
              <Feature
                title="Cost Savings Calculator"
                desc="Track electricity bill savings, ROI calculations, and payback period analysis."
              />
              <Feature
                title="Environmental Impact"
                desc="Monitor CO2 reduction, trees saved equivalent, and your carbon footprint impact."
              />
              <Feature
                title="Maintenance & Support"
                desc="Automated maintenance scheduling, warranty tracking, and 24/7 technical support."
              />
            </div>
          </div>
        </section>

        {/* ================= USER BENEFITS ================= */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-center sun-glow-text mb-12">
              Real Users, Real Benefits
            </h2>
            <p className="text-center text-solar-muted mb-16">
              See how our platform is transforming solar energy management for users across India
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <Testimonial
                quote="Reduced my electricity bills by 70% in the first year. The AI predictions help me optimize my solar panel usage perfectly."
                author="Rajesh Kumar, Delhi"
                benefit="₹45,000 saved annually"
              />
              <Testimonial
                quote="The smart alerts caught a panel fault before it became serious. Maintenance costs dropped significantly."
                author="Priya Sharma, Mumbai"
                benefit="90% uptime maintained"
              />
              <Testimonial
                quote="Environmental tracking shows I've saved 2.3 tons of CO2 this year. Proud to contribute to a greener India."
                author="Amit Patel, Ahmedabad"
                benefit="2.3 tons CO2 reduced"
              />
            </div>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="py-24 text-center bg-solar-night/70 backdrop-blur-xl">
          <h2 className="text-4xl font-bold sun-glow-text">
            Start Managing Solar Energy Smarter
          </h2>
          <p className="text-solar-muted mt-4">
            Join the next generation of intelligent solar management.
          </p>

          <Link
            to="/register"
            className="inline-block mt-8 px-8 py-3 bg-solar-yellow text-solar-dark font-semibold rounded-md hover:bg-solar-orange transition sun-button"
          >
            Create Free Account
          </Link>
        </section>

        {/* ================= FOOTER ================= */}
        <footer className="py-8 text-center text-sm text-solar-muted border-t border-solar-primary">
          © {new Date().getFullYear()} Solar Energy Management System
        </footer>

      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Counter({ target, suffix = "" }) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <>{count}{suffix}</>;
}

function Stat({ value, suffix }) {
  return (
    <div className="text-solar-primary font-semibold text-lg">
      ⚡ <Counter target={value} suffix={suffix} />
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="bg-solar-night/80 backdrop-blur-xl border border-solar-primary rounded-xl p-6 energy-card">
      <h3 className="text-xl font-semibold text-solar-yellow">{title}</h3>
      <p className="text-solar-muted mt-3">{desc}</p>
    </div>
  );
}

function Testimonial({ quote, author, benefit }) {
  return (
    <div className="bg-solar-night/80 backdrop-blur-xl border border-solar-primary rounded-xl p-6 energy-card">
      <p className="text-solar-muted italic mb-4">"{quote}"</p>
      <div className="flex justify-between items-center">
        <span className="text-solar-yellow font-semibold">{author}</span>
        <span className="text-green-400 text-sm">{benefit}</span>
      </div>
    </div>
  );
}

