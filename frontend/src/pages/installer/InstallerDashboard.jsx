import { useState, useEffect } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { MapPin, Calendar, Zap, CheckCircle, Briefcase, User, ClipboardCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "../../lib/toast";

const API_URL = "http://localhost:8080";

export default function InstallerDashboard() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completingJob, setCompletingJob] = useState(null);
    const [formData, setFormData] = useState({
        device_id: "",
        plant_capacity_kw: "",
        inverter_brand: "SolarEdge"
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/installer/jobs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data.jobs || []);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            toast.error("Failed to load installation jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteJob = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `${API_URL}/installer/jobs/${completingJob.id}/complete`,
                {
                    device_id: formData.device_id,
                    plant_capacity_kw: parseFloat(formData.plant_capacity_kw),
                    inverter_brand: formData.inverter_brand
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Installation marked as complete!");
            setCompletingJob(null);
            setFormData({ device_id: "", plant_capacity_kw: "", inverter_brand: "SolarEdge" });
            fetchJobs();
        } catch (error) {
            console.error("Error completing job:", error);
            toast.error("Failed to complete job. Check inputs.");
        }
    };

    if (loading) return <div className="p-8 text-center">Loading jobs...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 space-y-8 min-h-screen"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-solar-primary tracking-tight uppercase">
                        Installer Portal
                    </h1>
                    <p className="text-solar-muted mt-2 font-medium italic">
                        Field operations, system commissioning, and fleet activation node.
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="solar-glass px-4 py-2 rounded-xl border-solar-yellow/20 flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-solar-yellow animate-pulse"></div>
                        <span className="text-[10px] font-black text-solar-primary uppercase tracking-widest">
                            {jobs.length} Operational Tasks
                        </span>
                    </div>
                </div>
            </div>

            {jobs.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="solar-glass rounded-3xl border-dashed border-2 border-solar-border/30 py-20 text-center"
                >
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 bg-solar-success/10 rounded-full flex items-center justify-center border border-solar-success/20">
                            <CheckCircle className="h-10 w-10 text-solar-success" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-solar-primary uppercase tracking-tight">System Synchronized</h3>
                            <p className="text-solar-muted max-w-sm italic font-medium">
                                No pending installation requests detected in the current telemetry cycle.
                            </p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {jobs.map((job, idx) => (
                            <motion.div 
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="solar-glass rounded-3xl p-6 relative overflow-hidden group border-solar-panel/10 hover:border-solar-yellow/40 transition-colors duration-500"
                            >
                                {/* Header Decorative Accent */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-solar-yellow to-transparent opacity-30"></div>
                                
                                <div className="flex justify-between items-start mb-6">
                                    <div className="px-2 py-1 bg-solar-panel/10 border border-solar-panel/20 rounded-md">
                                        <span className="text-[10px] font-black text-solar-panel uppercase tracking-widest">PLANNED_OPS</span>
                                    </div>
                                    <span className="text-[10px] font-black text-solar-muted font-mono tracking-tighter opacity-50">#{job.id.slice(0, 8).toUpperCase()}</span>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-xl font-black text-solar-primary tracking-tight uppercase leading-none">
                                        {job.first_name} {job.last_name}
                                    </h3>
                                    <div className="flex items-center text-[10px] font-bold text-solar-muted uppercase tracking-wider">
                                        <MapPin className="h-3 w-3 mr-1.5 text-solar-yellow" />
                                        {job.city}, {job.state}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="p-3 bg-solar-night/30 rounded-2xl border border-solar-border/10">
                                        <span className="text-[8px] font-black text-solar-muted uppercase tracking-widest block mb-1">Asset Class</span>
                                        <span className="text-xs font-black text-solar-primary uppercase tracking-tight">{job.property_type}</span>
                                    </div>
                                    <div className="p-3 bg-solar-night/30 rounded-2xl border border-solar-border/10">
                                        <span className="text-[8px] font-black text-solar-muted uppercase tracking-widest block mb-1">Estimated Load</span>
                                        <span className="text-xs font-black text-solar-yellow uppercase tracking-tight">{job.plant_capacity_kw || "--"} kW</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between items-center py-2 border-b border-solar-border/10">
                                        <span className="text-[10px] font-bold text-solar-muted uppercase tracking-widest">Deployment Addr</span>
                                        <span className="text-[10px] font-black text-solar-primary uppercase truncate w-32 text-right">{job.address_line1}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-solar-border/10">
                                        <span className="text-[10px] font-bold text-solar-muted uppercase tracking-widest">Telecom Signal</span>
                                        <span className="text-[10px] font-black text-solar-primary uppercase">{job.phone}</span>
                                    </div>
                                </div>

                                <Dialog open={completingJob?.id === job.id} onOpenChange={(open) => !open && setCompletingJob(null)}>
                                    <DialogTrigger asChild>
                                        <button
                                            onClick={() => {
                                                setCompletingJob(job);
                                                setFormData({
                                                    ...formData,
                                                    plant_capacity_kw: job.plant_capacity_kw || ""
                                                });
                                            }}
                                            className="w-full relative overflow-hidden px-6 py-3 rounded-2xl font-black tracking-widest uppercase text-xs transition-all duration-500 group solar-glass border-solar-yellow/30 text-solar-primary hover:border-solar-yellow/60 hover:shadow-solar-glow-yellow/20 active:scale-[0.98]"
                                        >
                                            <div className="absolute inset-0 bg-linear-to-r from-solar-yellow/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="relative flex items-center justify-center space-x-2.5">
                                                <Zap className="w-4 h-4 text-solar-yellow group-hover:scale-110 transition-transform duration-500" />
                                                <span>Initialize Activation</span>
                                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-solar-yellow/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px] rounded-3xl! border-solar-yellow/20 bg-solar-night/95 backdrop-blur-2xl">
                                        <DialogHeader>
                                            <div className="w-12 h-12 bg-solar-yellow/10 rounded-2xl flex items-center justify-center border border-solar-yellow/20 mb-4">
                                                <ClipboardCheck className="h-6 w-6 text-solar-yellow" />
                                            </div>
                                            <DialogTitle className="text-2xl font-black text-solar-primary uppercase tracking-tight">System Commissioning</DialogTitle>
                                            <DialogDescription className="text-solar-muted italic font-medium">
                                                Finalize deployment telemetry and activate the decentralized grid node.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-6 py-8">
                                            <div className="space-y-3">
                                                <Label htmlFor="device_id" className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-muted ml-1">Device Telemetry ID</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="device_id"
                                                        placeholder="SN-XXXX-XXXX-XXXX"
                                                        value={formData.device_id}
                                                        onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                                                        className="h-14 bg-solar-surface/30 border-solar-border/10 rounded-2xl focus:ring-solar-yellow/20 focus:border-solar-yellow/50 transition-all placeholder:text-solar-muted placeholder:opacity-30 font-mono"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <Label htmlFor="capacity" className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-muted ml-1">Grid Load (kW)</Label>
                                                    <Input
                                                        id="capacity"
                                                        type="number"
                                                        step="0.1"
                                                        placeholder="5.0"
                                                        value={formData.plant_capacity_kw}
                                                        onChange={(e) => setFormData({ ...formData, plant_capacity_kw: e.target.value })}
                                                        className="h-14 bg-solar-surface/30 border-solar-border/10 rounded-2xl"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label htmlFor="inverter" className="text-[10px] font-black uppercase tracking-[0.2em] text-solar-muted ml-1">Hardware Meta</Label>
                                                    <Input
                                                        id="inverter"
                                                        placeholder="SolarEdge v2"
                                                        value={formData.inverter_brand}
                                                        onChange={(e) => setFormData({ ...formData, inverter_brand: e.target.value })}
                                                        className="h-14 bg-solar-surface/30 border-solar-border/10 rounded-2xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter className="gap-3">
                                            <Button variant="ghost" onClick={() => setCompletingJob(null)} className="h-14 rounded-2xl text-solar-muted hover:text-solar-primary hover:bg-solar-surface/10">CANCEL_OPS</Button>
                                            <button 
                                                onClick={handleCompleteJob}
                                                className="flex-1 h-14 bg-linear-to-r from-solar-yellow to-solar-orange text-solar-dark font-black tracking-widest uppercase text-xs rounded-2xl hover:shadow-solar-glow-yellow transition-all duration-300 active:scale-95"
                                            >
                                                EXECUTE_ACTIVATION
                                            </button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}
