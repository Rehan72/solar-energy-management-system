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
import {
    MapPin,
    Calendar,
    Zap,
    CheckCircle,
    Briefcase,
    User
} from "lucide-react";
import toast from "react-hot-toast";

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
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Installer Portal
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        View available installation jobs and commission new systems.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                        <Briefcase className="mr-2 h-4 w-4" />
                        {jobs.length} Active Jobs
                    </Badge>
                </div>
            </div>

            {jobs.length === 0 ? (
                <Card className="bg-slate-50 dark:bg-slate-900 border-dashed border-2 py-12 text-center">
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">All Caught Up!</h3>
                        <p className="text-slate-500 max-w-sm">
                            There are no pending installation jobs at the moment. Check back later when new users request installations.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <Card key={job.id} className="flex flex-col border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100">
                                        Planned
                                    </Badge>
                                    <span className="text-xs text-slate-500 font-mono">#{job.id.slice(0, 8)}</span>
                                </div>
                                <CardTitle className="text-lg mt-2">
                                    {job.first_name} {job.last_name}
                                </CardTitle>
                                <CardDescription className="flex items-center mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {job.city}, {job.state}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded border">
                                        <span className="text-xs text-slate-500 block">Property Type</span>
                                        <span className="font-medium">{job.property_type}</span>
                                    </div>
                                    <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded border">
                                        <span className="text-xs text-slate-500 block">Capacity</span>
                                        <span className="font-medium">{job.plant_capacity_kw || "--"} kW</span>
                                    </div>
                                </div>

                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between py-1 border-b border-dashed">
                                        <span className="text-slate-500">Address</span>
                                        <span className="font-medium text-right truncate w-40">{job.address_line1}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-dashed">
                                        <span className="text-slate-500">Phone</span>
                                        <span className="font-medium">{job.phone}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Dialog open={completingJob?.id === job.id} onOpenChange={(open) => !open && setCompletingJob(null)}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="w-full"
                                            onClick={() => {
                                                setCompletingJob(job);
                                                setFormData({
                                                    ...formData,
                                                    plant_capacity_kw: job.plant_capacity_kw || ""
                                                });
                                            }}
                                        >
                                            <Zap className="mr-2 h-4 w-4" />
                                            Complete Installation
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Commissioning Report</DialogTitle>
                                            <DialogDescription>
                                                Enter the details of the installed system to link the device and activate monitoring.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="device_id">Device ID (Serial Number)</Label>
                                                <Input
                                                    id="device_id"
                                                    placeholder="e.g. DEV-2024-XY-99"
                                                    value={formData.device_id}
                                                    onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="capacity">Installed Capacity (kW)</Label>
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="5.0"
                                                    value={formData.plant_capacity_kw}
                                                    onChange={(e) => setFormData({ ...formData, plant_capacity_kw: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="inverter">Inverter Brand</Label>
                                                <Input
                                                    id="inverter"
                                                    placeholder="e.g. SolarEdge, Enphase"
                                                    value={formData.inverter_brand}
                                                    onChange={(e) => setFormData({ ...formData, inverter_brand: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setCompletingJob(null)}>Cancel</Button>
                                            <Button onClick={handleCompleteJob}>Verify & Activate</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
