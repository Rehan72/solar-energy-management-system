import React, { useState, useEffect, useRef } from 'react';
import {
    Zap,
    Play,
    Square,
    Settings,
    Activity,
    Thermometer,
    Droplets,
    Battery,
    AlertTriangle,
    Plus,
    Trash2,
    RefreshCw,
    Cpu
} from 'lucide-react';
import { postRequest } from '../../lib/apiService';
import { notify } from '../../lib/toast';

const SolarSimulator = () => {
    const [devices, setDevices] = useState([
        {
            id: 1,
            name: 'Simulated Device 1',
            apiKey: 'sim_device_001_demo',
            status: 'idle',
            data: {
                solarPower: 0,
                loadPower: 0,
                batteryLevel: 80,
                gridPower: 0,
                temperature: 25,
                humidity: 45
            },
            config: {
                interval: 5000,
                autoMode: true,
                faultInjection: false
            }
        }
    ]);

    const timers = useRef({});

    const toggleSimulation = (deviceId) => {
        const device = devices.find(d => d.id === deviceId);
        if (device.status === 'running') {
            stopSimulation(deviceId);
        } else {
            startSimulation(deviceId);
        }
    };

    const startSimulation = (deviceId) => {
        setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'running' } : d));

        // Initial data send
        sendData(deviceId);

        // Set interval
        const device = devices.find(d => d.id === deviceId);
        timers.current[deviceId] = setInterval(() => {
            sendData(deviceId);
        }, device.config.interval);

        notify.success(`Simulator started for ${device.name}`);
    };

    const stopSimulation = (deviceId) => {
        clearInterval(timers.current[deviceId]);
        delete timers.current[deviceId];
        setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'idle' } : d));
        notify.info(`Simulator stopped for Device ${deviceId}`);
    };

    const sendData = async (deviceId) => {
        setDevices(prev => {
            const newDevices = [...prev];
            const index = newDevices.findIndex(d => d.id === deviceId);
            const device = newDevices[index];

            // Logic to generate or update data
            let newData = { ...device.data };
            if (device.config.autoMode) {
                const hour = new Date().getHours();

                // Simple bell curve for solar power
                let intensity = 0;
                if (hour >= 6 && hour <= 18) {
                    intensity = Math.sin((hour - 6) * Math.PI / 12);
                }

                newData.solarPower = Math.round(intensity * 5000 * (0.9 + Math.random() * 0.2));
                newData.loadPower = Math.round(Math.random() * 2000 + 500);
                newData.gridPower = Math.max(0, newData.solarPower - newData.loadPower);
                newData.batteryLevel = Math.max(10, Math.min(100, newData.batteryLevel + (intensity > 0.3 ? 2 : -1)));
                newData.temperature = Math.round(25 + intensity * 15 + Math.random() * 2);
                newData.humidity = Math.round(50 - intensity * 20 + Math.random() * 5);

                // Fault injection
                if (device.config.faultInjection && Math.random() < 0.05) {
                    newData.solarPower = 0;
                    notify.warning(`Fault injected in ${device.name}: Low Current`);
                }
            }

            // API call to backend
            const payload = {
                api_key: device.apiKey,
                solar_power: newData.solarPower,
                load_power: newData.loadPower,
                battery_level: newData.batteryLevel,
                grid_power: newData.gridPower,
                temperature: newData.temperature,
                humidity: newData.humidity
            };

            postRequest('/iot/data', payload).catch(err => {
                console.error('Failed to send simulator data:', err);
            });

            newDevices[index] = { ...device, data: newData };
            return newDevices;
        });
    };

    const addDevice = () => {
        const newId = devices.length > 0 ? Math.max(...devices.map(d => d.id)) + 1 : 1;
        setDevices([...devices, {
            id: newId,
            name: `Simulated Device ${newId}`,
            apiKey: `sim_device_${newId}_demo`,
            status: 'idle',
            data: {
                solarPower: 0,
                loadPower: 0,
                batteryLevel: 80,
                gridPower: 0,
                temperature: 25,
                humidity: 45
            },
            config: {
                interval: 5000,
                autoMode: true,
                faultInjection: false
            }
        }]);
    };

    const removeDevice = (id) => {
        if (timers.current[id]) stopSimulation(id);
        setDevices(devices.filter(d => d.id !== id));
    };

    const updateDeviceConfig = (id, key, value) => {
        setDevices(prev => prev.map(d => d.id === id ? { ...d, [key]: value } : d));
    };

    const updateDataManually = (deviceId, key, value) => {
        setDevices(prev => prev.map(d => {
            if (d.id === deviceId) {
                return { ...d, data: { ...d.data, [key]: parseFloat(value) || 0 } };
            }
            return d;
        }));
    };

    useEffect(() => {
        return () => {
            // Cleanup all timers on unmount
            Object.keys(timers.current).forEach(id => {
                clearInterval(timers.current[id]);
            });
        };
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold sun-glow-text">Advanced Solar Simulator</h1>
                    <p className="text-solar-muted mt-2">Test your energy management system with real-time virtual device feeds</p>
                </div>
                <button
                    onClick={addDevice}
                    className="flex items-center space-x-2 px-6 py-3 bg-solar-yellow text-solar-dark font-bold rounded-xl sun-button"
                >
                    <Plus size={20} />
                    <span>Add Virtual Device</span>
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {devices.map((device) => (
                    <div key={device.id} className="bg-solar-card rounded-2xl p-6 border border-solar-border shadow-2xl relative overflow-hidden group">
                        {/* Background Glow */}
                        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] transition-all duration-1000 ${device.status === 'running' ? 'bg-solar-yellow/20' : 'bg-slate-400/10'}`}></div>

                        <div className="flex justify-between items-start relative z-10 mb-8">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl ${device.status === 'running' ? 'bg-solar-yellow/20 text-solar-yellow' : 'bg-slate-500/10 text-slate-500'}`}>
                                    <Cpu size={24} className={device.status === 'running' ? 'animate-pulse' : ''} />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={device.name}
                                        onChange={(e) => updateDeviceConfig(device.id, 'name', e.target.value)}
                                        className="bg-transparent border-none text-xl font-bold text-solar-primary focus:outline-none p-0 w-full"
                                    />
                                    <div className="flex items-center mt-1 space-x-2">
                                        <span className={`w-2 h-2 rounded-full ${device.status === 'running' ? 'bg-solar-success animate-pulse' : 'bg-slate-400'}`}></span>
                                        <span className="text-xs font-semibold text-solar-muted uppercase">{device.status}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => toggleSimulation(device.id)}
                                    className={`p-3 rounded-xl transition-all ${device.status === 'running'
                                            ? 'bg-solar-danger/10 text-solar-danger hover:bg-solar-danger/20'
                                            : 'bg-solar-success/10 text-solar-success hover:bg-solar-success/20'
                                        }`}
                                >
                                    {device.status === 'running' ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                </button>
                                <button
                                    onClick={() => removeDevice(device.id)}
                                    className="p-3 bg-slate-500/10 text-slate-500 rounded-xl hover:bg-solar-danger/10 hover:text-solar-danger transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8 relative z-10">
                            <DataCard icon={Zap} label="Solar Power" value={`${device.data.solarPower}W`} color="text-solar-yellow" />
                            <DataCard icon={Activity} label="Load Power" value={`${device.data.loadPower}W`} color="text-solar-panel" />
                            <DataCard icon={Battery} label="Battery" value={`${device.data.batteryLevel}%`} color="text-solar-success" />
                            <DataCard icon={RefreshCw} label="Grid Output" value={`${device.data.gridPower}W`} color="text-solar-orange" />
                            <DataCard icon={Thermometer} label="Temp" value={`${device.data.temperature}°C`} color="text-solar-danger" />
                            <DataCard icon={Droplets} label="Humidity" value={`${device.data.humidity}%`} color="text-solar-panel" />
                        </div>

                        <div className="space-y-6 pt-6 border-t border-solar-border relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-solar-primary font-semibold">
                                    <Settings size={18} />
                                    <span>Device Configuration</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={device.config.autoMode}
                                                onChange={(e) => updateDeviceConfig(device.id, 'config', { ...device.config, autoMode: e.target.checked })}
                                            />
                                            <div className={`w-10 h-6 rounded-full transition-colors ${device.config.autoMode ? 'bg-solar-yellow' : 'bg-slate-600'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${device.config.autoMode ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="ml-2 text-xs font-bold text-solar-muted uppercase">Auto Cycle</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={device.config.faultInjection}
                                                onChange={(e) => updateDeviceConfig(device.id, 'config', { ...device.config, faultInjection: e.target.checked })}
                                            />
                                            <div className={`w-10 h-6 rounded-full transition-colors ${device.config.faultInjection ? 'bg-solar-danger/50' : 'bg-slate-600'}`}></div>
                                            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${device.config.faultInjection ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="ml-2 text-xs font-bold text-solar-muted uppercase">Faults</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-solar-muted uppercase mb-2">Device API Key</label>
                                    <input
                                        type="text"
                                        value={device.apiKey}
                                        onChange={(e) => updateDeviceConfig(device.id, 'apiKey', e.target.value)}
                                        className="w-full px-4 py-2 bg-solar-night/50 border border-solar-border rounded-lg text-solar-primary focus:border-solar-yellow transition-all outline-none text-sm font-mono"
                                        placeholder="Enter device API key"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-solar-muted uppercase mb-2">Update Interval (ms)</label>
                                    <input
                                        type="number"
                                        value={device.config.interval}
                                        onChange={(e) => updateDeviceConfig(device.id, 'config', { ...device.config, interval: parseInt(e.target.value) || 2000 })}
                                        className="w-full px-4 py-2 bg-solar-night/50 border border-solar-border rounded-lg text-solar-primary focus:border-solar-yellow transition-all outline-none text-sm"
                                        step="1000"
                                        min="1000"
                                    />
                                </div>
                            </div>

                            {!device.config.autoMode && (
                                <div className="p-4 bg-solar-night/30 rounded-xl space-y-4">
                                    <div className="flex items-center space-x-2 text-solar-primary font-bold text-xs uppercase opacity-70">
                                        <Settings size={14} />
                                        <span>Manual Override</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <ManualInput label="Solar (W)" value={device.data.solarPower} onChange={(val) => updateDataManually(device.id, 'solarPower', val)} />
                                        <ManualInput label="Load (W)" value={device.data.loadPower} onChange={(val) => updateDataManually(device.id, 'loadPower', val)} />
                                        <ManualInput label="Battery (%)" value={device.data.batteryLevel} onChange={(val) => updateDataManually(device.id, 'batteryLevel', val)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DataCard = ({ icon: Icon, label, value, color }) => (
    <div className="p-4 bg-solar-night/30 rounded-xl border border-white/5 hover:border-white/10 transition-all flex flex-col items-center text-center">
        <Icon size={18} className={`${color} mb-2`} />
        <span className="text-[10px] uppercase font-bold text-solar-muted tracking-widest">{label}</span>
        <span className="text-sm font-bold text-solar-primary mt-1">{value}</span>
    </div>
);

const ManualInput = ({ label, value, onChange }) => (
    <div>
        <label className="block text-[10px] font-bold text-solar-muted uppercase mb-1">{label}</label>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white outline-none focus:border-solar-yellow transition-all"
        />
    </div>
);

export default SolarSimulator;
