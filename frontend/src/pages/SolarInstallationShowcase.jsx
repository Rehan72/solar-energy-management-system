import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sun, 
  Zap, 
  Battery, 
  Cpu, 
  Activity, 
  ShieldCheck, 
  Wifi, 
  ArrowLeft,
  ShoppingCart,
  Box,
  Settings,
  Code
} from 'lucide-react';
import BackgroundLayer from '../components/BackgroundLayer';
import FloatingParticles from '../components/FloatingParticles';
import PublicNavbar from '../components/PublicNavbar';

// Assets
import SolarPanelsImg from '../assets/installation/solar_panels.png';
import InverterImg from '../assets/installation/solar_inverter.png';
import BatteryImg from '../assets/installation/lithium_battery.png';
import IoTImg from '../assets/installation/esp32_iot.png';

const sections = [
  {
    title: "1️⃣ SOLAR GENERATION HARDWARE",
    subtitle: "Physical Installation - Mandatory for any solar plant",
    items: [
      {
        name: "Solar Panels (Mono/Poly Crystalline)",
        description: "Convert sunlight directly into DC electricity using high-efficiency cells.",
        specs: "Rating: 330W – 550W per panel",
        purpose: "Convert sunlight → DC power",
        price: "₹18,000 - ₹25,000 / Panel",
        image: SolarPanelsImg,
        icon: Sun
      },
      {
        name: "DC Combiner Box",
        description: "Aggregates multiple panel outputs with safety measures like fuses and surge protection.",
        specs: "Includes: Fuses, SPD, MCB",
        purpose: "Safety + aggregation",
        price: "₹5,000 - ₹12,000",
        image: null, // No specific image generated yet, will use icon
        icon: Box
      },
      {
        name: "Solar Inverter",
        description: "The heart of the system. Converts DC power from panels to AC power for usage.",
        specs: "Types: String, Central, Micro-inverter",
        purpose: "DC → AC conversion & Grid Sync",
        price: "₹45,000 - ₹1,50,000",
        image: InverterImg,
        icon: Zap
      },
      {
        name: "Battery (Optional/Recommended)",
        description: "Storage solution for energy during night or power outages.",
        specs: "Lithium-ion / Lead-acid",
        purpose: "Energy storage & Peak shaving",
        price: "₹80,000 - ₹2,50,000",
        image: BatteryImg,
        icon: Battery
      },
      {
        name: "Net Meter",
        description: "Bidirectional meter for grid-connected systems to track imports/exports.",
        specs: "Government approved",
        purpose: "Subsidy & Net Metering compliance",
        price: "₹3,000 - ₹7,000",
        image: null,
        icon: Activity
      }
    ]
  },
  {
    title: "2️⃣ MONITORING & IOT HARDWARE",
    subtitle: "App Connectivity - The Brain of Your Smart Solar System",
    items: [
      {
        name: "ESP32 (Core Device)",
        description: "Wi-Fi enabled microcontroller acting as the data gateway.",
        specs: "Dual-core, Wi-Fi, Bluetooth",
        purpose: "Data acquisition & Cloud gateway",
        price: "₹800 - ₹1,500 (Installed)",
        image: IoTImg,
        icon: Cpu
      },
      {
        name: "Sensors (Voltage/Current/PZEM)",
        description: "Measures real-time parameters from the inverter and panels.",
        specs: "Voltage, Current (CT Clamp), Irradiance",
        purpose: "Generate raw performance data",
        price: "₹2,500 - ₹5,000 (Set)",
        image: null,
        icon: Settings
      },
      {
        name: "Wiring & Enclosure",
        description: "Industrial-grade cables and IP65 weatherproof housing for safety.",
        specs: "IP65 Rating, DC Cables",
        purpose: "Safety & Weather protection",
        price: "₹4,000 - ₹10,000",
        image: null,
        icon: ShieldCheck
      }
    ]
  },
  {
    title: "3️⃣ DEVICE SOFTWARE (FIRMWARE)",
    subtitle: "Custom Control - ESPHome vs Arduino",
    items: [
      {
        name: "ESPHome (Recommended)",
        description: "Stable, fast, and easy to configure via YAML. Ideal for OTA updates.",
        specs: "YAML base",
        purpose: "Standardized Data Flow",
        price: "Free (Included in Service)",
        image: null,
        icon: Code
      }
    ]
  },
  {
    title: "4️⃣ COMMUNICATION LAYER",
    subtitle: "Connected Ecosystem",
    items: [
      {
        name: "Internet Connectivity",
        description: "Reliable Wi-Fi or 4G LTE Router for real-time cloud monitoring.",
        specs: "Wi-Fi / 4G SIM Router",
        purpose: "Cloud synchronization",
        price: "₹1,500 - ₹3,500",
        image: null,
        icon: Wifi
      }
    ]
  }
];

export default function SolarInstallationShowcase() {
  return (
    <div className="relative min-h-screen bg-solar-night text-solar-primary overflow-hidden pb-20">
      <BackgroundLayer />
      <FloatingParticles />
      <PublicNavbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 mt-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold sun-glow-text mb-4">
            COMPLETE SOLAR INSTALLATION
          </h1>
          <p className="text-xl text-solar-muted max-w-3xl mx-auto">
            System Integration & Required Components for Your Smart Energy Plant
          </p>
        </div>

        {sections.map((section, sIndex) => (
          <div key={sIndex} className="mb-20">
            <div className="flex flex-col mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-solar-yellow flex items-center gap-3">
                {section.title}
              </h2>
              <p className="text-solar-muted mt-2 ml-1">{section.subtitle}</p>
              <div className="h-1 w-24 bg-linear-to-r from-solar-yellow to-transparent mt-3 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.items.map((item, iIndex) => (
                <div 
                  key={iIndex} 
                  className="solar-glass rounded-3xl overflow-hidden border border-solar-border group hover:border-solar-yellow/50 transition-all duration-500"
                >
                  <div className="relative h-48 bg-solar-night/40 overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-solar-yellow/5">
                        <item.icon size={64} className="text-solar-yellow/20 group-hover:text-solar-yellow/40 transition-colors duration-500" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-solar-yellow/90 text-solar-night px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {item.price}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-solar-yellow/10 text-solar-yellow">
                        <item.icon size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-solar-primary leading-tight">{item.name}</h3>
                    </div>
                    
                    <p className="text-sm text-solar-muted line-clamp-2 mb-4">
                      {item.description}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-solar-border/50">
                      <div className="flex justify-between text-xs">
                        <span className="text-solar-muted uppercase tracking-wider">Specs:</span>
                        <span className="text-solar-primary font-medium">{item.specs}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-solar-muted uppercase tracking-wider">Purpose:</span>
                        <span className="text-solar-yellow font-medium italic">{item.purpose}</span>
                      </div>
                    </div>
                    
                    <button className="sun-button sun-button-outline w-full mt-6">
                      <ShoppingCart size={18} className="-translate-y-px" />
                      Get Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-20 p-8 rounded-3xl solar-glass border border-solar-yellow/30 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Cpu size={120} />
          </div>
          <h2 className="text-3xl font-bold sun-glow-text mb-4">Ready for Smart Monitoring?</h2>
          <p className="text-solar-muted mb-8 max-w-2xl mx-auto">
            Our ESP32-based IoT hardware integrates seamlessly with all these components to provide real-time data directly to your dashboard.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="sun-button">
              Setup Your System
            </Link>
            <button className="px-8 py-3 border border-solar-border rounded-xl hover:bg-solar-yellow/10 transition-all duration-300">
              Technical Documentation
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
