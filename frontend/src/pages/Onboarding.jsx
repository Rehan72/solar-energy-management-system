import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { getRequest, postRequest } from "../lib/apiService";
import { notify } from "../lib/toast";
import { CheckCircle, ArrowLeft, ArrowRight, MapPin, Factory, Shield, User } from "lucide-react";
import SunLoader from "../components/SunLoader";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Data for selections
  const [regions, setRegions] = useState([]);
  const [plants, setPlants] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [formData, setFormData] = useState({
    region: "", 
    plant_id: "",
    admin_id: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    latitude: 0,
    longitude: 0,
  });

  // Fetch Regions on mount
  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const data = await getRequest("/superadmin/regions");
      setRegions(data || []);
    } catch (error) {
      console.error("Failed to fetch regions", error);
      notify.error("Could not load regions");
    } finally {
        setLoading(false);
    }
  };

  const fetchPlants = async (regionName) => {
    try {
        const data = await getRequest(`/superadmin/plants`); 
        // Filter plants by region name (assuming region is stored as name in plants or matched)
        const filteredPlants = data.plants ? data.plants.filter(p => p.region === regionName) : [];
        setPlants(filteredPlants);
    } catch (error) {
      console.error("Failed to fetch plants", error);
    }
  };

    const fetchAdmins = async (plantId) => {
        try {
            // Fetch admins and filter by plant_id
            const data = await getRequest("/users?role=ADMIN"); 
            // Logic: Admins must be assigned to this plant
            const filteredAdmins = data.users ? data.users.filter(u => u.plant_id === plantId) : [];
            setAdmins(filteredAdmins);
        } catch (error) {
            console.error("Failed to fetch admins", error);
        }
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegionSelect = (regionName) => {
      setFormData(prev => ({ ...prev, region: regionName, plant_id: "", admin_id: "" }));
      fetchPlants(regionName);
  }

  const handlePlantSelect = (plant) => {
      setFormData(prev => ({ 
          ...prev, 
          plant_id: plant.id, 
          admin_id: "",
          // Auto-fill lat/long if available from plant
          latitude: plant.latitude || 0,
          longitude: plant.longitude || 0,
          // Auto-fill city/state if available
          city: plant.city || prev.city,
          state: plant.state || prev.state
      }));
      fetchAdmins(plant.id);
  }

  const nextStep = () => {
      if (step === 1 && !formData.region) { notify.error("Please select a region"); return; }
      if (step === 2 && !formData.plant_id) { notify.error("Please select a plant"); return; }
      if (step === 3 && !formData.admin_id) { notify.error("Please select an admin"); return; }
      setStep(prev => prev + 1);
  }

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.address_line1 || !formData.city || !formData.state || !formData.pincode) {
        notify.error("Please fill in all address fields");
        return;
    }

    setSubmitting(true);
    try {
      await postRequest("/user/onboarding", {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      });
      notify.success("Onboarding Completed!");
      // Redirect to dashboard
      navigate("/dashboard"); // or /user/dashboard
    } catch (error) {
      notify.error("Onboarding failed: " + (error.response?.data?.error || "Unknown error"));
    }
    setSubmitting(false);
  };

  if (loading) return <SunLoader message="Loading onboarding data..." />;

  return (
    <div className="min-h-screen bg-solar-bg flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-solar-card rounded-2xl shadow-2xl p-8 border border-solar-border overflow-hidden">
            
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold sun-glow-text mb-2">Complete Your Profile</h1>
                <p className="text-solar-muted">We need a few more details to set up your solar account.</p>
            </div>

            {/* Progress Bar */}
            <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className="flex items-center">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                 step >= s ? 'bg-solar-yellow text-solar-dark scale-110' : 'bg-solar-muted/20 text-solar-muted'
                             }`}>
                                 {s}
                             </div>
                             {s < 4 && <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${step > s ? 'bg-solar-yellow' : 'bg-solar-muted/20'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="min-h-[400px]">
                {/* Step 1: Region */}
                {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-semibold text-solar-primary flex items-center gap-2"><MapPin className="w-5 h-5 text-solar-yellow"/> Select Your Region</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {regions.map(region => (
                                <div key={region.id} 
                                    onClick={() => handleRegionSelect(region.name)}
                                    className={`p-6 rounded-xl border cursor-pointer hover:border-solar-yellow hover:scale-[1.02] transition-all flex justify-between items-center group ${formData.region === region.name ? 'border-solar-yellow bg-solar-yellow/10' : 'border-solar-border bg-solar-night/40'}`}
                                >
                                    <span className="font-medium text-lg">{region.name}</span>
                                    {formData.region === region.name && <CheckCircle className="w-6 h-6 text-solar-yellow"/>}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={nextStep} className="px-8" disabled={!formData.region}>Next <ArrowRight className="ml-2 w-4 h-4"/></Button>
                        </div>
                    </div>
                )}

                {/* Step 2: Plant */}
                {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-semibold text-solar-primary flex items-center gap-2"><Factory className="w-5 h-5 text-solar-yellow"/> Select Solar Plant</h3>
                        <div className="grid grid-cols-1 gap-4">
                        {plants.length > 0 ? plants.map(plant => (
                            <div key={plant.id} 
                                onClick={() => handlePlantSelect(plant)}
                                className={`p-6 rounded-xl border cursor-pointer hover:border-solar-yellow transition-all flex justify-between items-center ${formData.plant_id === plant.id ? 'border-solar-yellow bg-solar-yellow/10' : 'border-solar-border bg-solar-night/40'}`}
                            >
                                <div>
                                    <div className="font-bold text-lg">{plant.name}</div>
                                    <div className="text-sm text-solar-muted flex items-center mt-1"><MapPin className="w-3 h-3 mr-1"/> {plant.city}, {plant.state}</div>
                                </div>
                                {formData.plant_id === plant.id && <CheckCircle className="w-6 h-6 text-solar-yellow"/>}
                            </div>
                        )) : (
                            <div className="text-center p-8 bg-solar-night/40 rounded-xl border border-dashed border-solar-muted">
                                <p className="text-solar-muted">No specific plants found in this region. You may need to contact support.</p>
                            </div>
                        )}
                        </div>
                        <div className="flex justify-between pt-8">
                            <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 w-4 h-4"/> Back</Button>
                            <Button onClick={nextStep} disabled={!formData.plant_id}>Next <ArrowRight className="ml-2 w-4 h-4"/></Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Admin */}
                {step === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-semibold text-solar-primary flex items-center gap-2"><Shield className="w-5 h-5 text-solar-yellow"/> Assign Administrator</h3>
                        <p className="text-sm text-solar-muted">Select an administrator who will oversee your solar installation and data.</p>
                        <div className="grid grid-cols-1 gap-4">
                        {admins.length > 0 ? admins.map(admin => (
                            <div key={admin.id} 
                                onClick={() => setFormData(prev => ({ ...prev, admin_id: admin.id }))}
                                className={`p-4 rounded-xl border cursor-pointer hover:border-solar-yellow transition-all flex items-center space-x-4 ${formData.admin_id === admin.id ? 'border-solar-yellow bg-solar-yellow/10' : 'border-solar-border bg-solar-night/40'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-solar-yellow to-solar-orange flex items-center justify-center text-solar-dark font-bold">
                                    <User className="w-5 h-5"/>
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-solar-primary">{admin.first_name} {admin.last_name}</div>
                                    <div className="text-xs text-solar-muted">{admin.email}</div>
                                </div>
                                {formData.admin_id === admin.id && <CheckCircle className="w-6 h-6 text-solar-yellow"/>}
                            </div>
                        )) : (
                            <div className="text-center p-8 bg-solar-night/40 rounded-xl">
                                <p className="text-solar-muted">No admins available for the selected plant.</p>
                            </div>
                        )}
                        </div>
                         <div className="flex justify-between pt-8">
                            <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 w-4 h-4"/> Back</Button>
                            <Button onClick={nextStep} disabled={!formData.admin_id}>Next <ArrowRight className="ml-2 w-4 h-4"/></Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Address */}
                {step === 4 && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-semibold text-solar-primary flex items-center gap-2"><MapPin className="w-5 h-5 text-solar-yellow"/> Address Details</h3>
                        
                        <div className="space-y-4">
                            <Field label="Address Line 1" name="address_line1" value={formData.address_line1} onChange={handleChange} type="text" placeholder="Street Address" />
                            <Field label="Address Line 2 (Optional)" name="address_line2" value={formData.address_line2} onChange={handleChange} type="text" placeholder="Apartment, unit, etc." />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="City" name="city" value={formData.city} onChange={handleChange} type="text" placeholder="City" />
                                <Field label="State" name="state" value={formData.state} onChange={handleChange} type="text" placeholder="State" />
                                <Field label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} type="text" placeholder="Pincode" />
                            </div>
                        </div>

                         <div className="flex justify-between pt-8">
                            <Button type="button" variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 w-4 h-4"/> Back</Button>
                            <Button 
                                type="submit" 
                                disabled={submitting}
                                className="bg-gradient-to-r from-solar-yellow to-solar-orange text-solar-dark min-w-[150px]"
                            >
                                {submitting ? "Finishing..." : "Complete Setup"}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type, placeholder }) {
  return (
    <div className="space-y-2">
       <label className="block text-sm font-medium text-solar-primary">{label}</label>
       <Input
         type={type}
         name={name}
         value={value}
         onChange={onChange}
         placeholder={placeholder}
         className="bg-solar-dark/50 border-solar-border text-solar-primary"
         required
       />
    </div>
  )
}
