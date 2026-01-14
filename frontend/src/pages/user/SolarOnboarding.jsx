import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { putRequest } from "../../lib/apiService";
import { notify } from "../../lib/toast";
import { Zap, Sun, Settings, CheckCircle, ArrowRight, ShieldCheck, Activity, Globe, Cpu, CreditCard } from "lucide-react";


function SolarOnboarding() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        installation_status: "NOT_INSTALLED",
        property_type: "RESIDENTIAL",
        avg_monthly_bill: "",
        roof_area_sqft: "",
        connection_type: "SINGLE_PHASE",
        subsidy_interest: false,
        plant_capacity_kw: "",
        net_metering: false,
        inverter_brand: "",
        discom_name: "",
        consumer_number: "",
    });

    const installationStatuses = [
        { value: "NOT_INSTALLED", label: "Not Installed (Planning)" },
        { value: "INSTALLATION_PLANNED", label: "Installation Planned" },
        { value: "INSTALLED", label: "Already Installed" },
    ];

    const propertyTypes = [
        { value: "RESIDENTIAL", label: "Residential" },
        { value: "COMMERCIAL", label: "Commercial" },
        { value: "INDUSTRIAL", label: "Industrial" },
    ];

    const connectionTypes = [
        { value: "SINGLE_PHASE", label: "Single Phase" },
        { value: "THREE_PHASE", label: "Three Phase" },
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validateForm = () => {
        if (formData.installation_status === "NOT_INSTALLED" || formData.installation_status === "INSTALLATION_PLANNED") {
            return formData.avg_monthly_bill && parseFloat(formData.avg_monthly_bill) > 0;
        } else if (formData.installation_status === "INSTALLED") {
            return formData.plant_capacity_kw && parseFloat(formData.plant_capacity_kw) > 0;
        }
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            notify.error("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            await putRequest("/user/solar-profile", {
                installation_status: formData.installation_status,
                property_type: formData.property_type,
                avg_monthly_bill: parseFloat(formData.avg_monthly_bill) || 0,
                roof_area_sqft: parseFloat(formData.roof_area_sqft) || 0,
                connection_type: formData.connection_type,
                subsidy_interest: formData.subsidy_interest,
                plant_capacity_kw: parseFloat(formData.plant_capacity_kw) || 0,
                net_metering: formData.net_metering,
                inverter_brand: formData.inverter_brand,
                discom_name: formData.discom_name,
                consumer_number: formData.consumer_number,
            });

            notify.success("Solar profile updated successfully!");
            navigate("/dashboard");
        } catch (error) {
            notify.error("Failed to update profile: " + (error.response?.data?.error || "Unknown error"));
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-linear-to-br from-solar-panel to-solar-yellow rounded-3xl flex items-center justify-center mx-auto shadow-2xl border border-solar-yellow/20">
                    <Sun size={40} className="text-solar-dark animate-spin-slow" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-solar-primary tracking-tighter uppercase">Onboarding Protocol</h1>
                  <p className="text-solar-muted font-medium italic mt-2">Initializing your solar grid identity and node configurations.</p>
                </div>
            </div>

            <div className="solar-glass rounded-[40px] p-10 border-solar-panel/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Settings className="w-48 h-48 text-solar-yellow rotate-12" />
                </div>
                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                          <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] ml-1">
                              Deployment Phase *
                          </label>
                          <select
                              name="installation_status"
                              value={formData.installation_status}
                              onChange={handleChange}
                              className="solar-input"
                          >
                              {installationStatuses.map((status) => (
                                  <option key={status.value} value={status.value}>
                                      {status.label}
                                  </option>
                              ))}
                          </select>
                      </div>

                      <div className="space-y-3">
                          <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] ml-1">
                              Structural Matrix *
                          </label>
                          <select
                              name="property_type"
                              value={formData.property_type}
                              onChange={handleChange}
                              className="solar-input"
                          >
                              {propertyTypes.map((type) => (
                                  <option key={type.value} value={type.value}>
                                      {type.label}
                                  </option>
                              ))}
                          </select>
                      </div>
                    </div>

                    {formData.installation_status !== "INSTALLED" && (
                        <div className="space-y-8 pt-6 border-t border-solar-border/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <Field
                                  label="Cycle Flux (Average Monthly Bill ₹) *"
                                  name="avg_monthly_bill"
                                  value={formData.avg_monthly_bill}
                                  onChange={handleChange}
                                  type="number"
                                  placeholder="e.g., 2500"
                              />

                              <Field
                                  label="Surface Volume (Roof Area Sq Ft) - Optional"
                                  name="roof_area_sqft"
                                  value={formData.roof_area_sqft}
                                  onChange={handleChange}
                                  type="number"
                                  placeholder="e.g., 500"
                              />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] ml-1">
                                    Phase Modulation
                                </label>
                                <select
                                    name="connection_type"
                                    value={formData.connection_type}
                                    onChange={handleChange}
                                    className="solar-input"
                                >
                                    {connectionTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-4 p-6 solar-glass bg-solar-primary/5 rounded-2xl border border-solar-primary/20 group/check">
                                <input
                                    type="checkbox"
                                    name="subsidy_interest"
                                    id="subsidy_interest"
                                    checked={formData.subsidy_interest}
                                    onChange={handleChange}
                                    className="w-6 h-6 text-solar-yellow bg-solar-night/50 border-solar-border/30 rounded-lg focus:ring-solar-yellow cursor-pointer transition-all duration-300 group-hover/check:scale-110"
                                />
                                <div className="space-y-1">
                                  <label
                                      htmlFor="subsidy_interest"
                                      className="text-sm font-black text-solar-primary uppercase tracking-tight cursor-pointer select-none"
                                  >
                                      Initialize Incentive Protocol
                                  </label>
                                  <p className="text-[10px] text-solar-muted font-medium italic">Signal interest in government solar subsidies and grants.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {formData.installation_status === "INSTALLED" && (
                        <div className="space-y-8 pt-6 border-t border-solar-border/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Field
                                    label="Quantum Yield (Plant Capacity kW) *"
                                    name="plant_capacity_kw"
                                    value={formData.plant_capacity_kw}
                                    onChange={handleChange}
                                    type="number"
                                    placeholder="e.g., 5"
                                />

                                <div className="space-y-3">
                                  <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] ml-1">Grid Flux Bi-Directionality</label>
                                  <div className="flex items-center space-x-4 p-6 solar-glass bg-solar-primary/5 rounded-2xl border border-solar-primary/20 group/check h-[52px]">
                                      <input
                                          type="checkbox"
                                          name="net_metering"
                                          id="net_metering"
                                          checked={formData.net_metering}
                                          onChange={handleChange}
                                          className="w-6 h-6 text-solar-yellow border-solar-border/30 rounded-lg focus:ring-solar-yellow cursor-pointer group-hover/check:scale-110 transition-transform"
                                      />
                                      <label
                                          htmlFor="net_metering"
                                          className="text-xs font-black text-solar-primary uppercase tracking-tight cursor-pointer select-none"
                                      >
                                          Net Metering Synchronized
                                      </label>
                                  </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Field
                                    label="Hardware Architecture"
                                    name="inverter_brand"
                                    value={formData.inverter_brand}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="e.g., SolarEdge, Huawei"
                                />

                                <Field
                                    label="Grid Interconnect (DISCOM)"
                                    name="discom_name"
                                    value={formData.discom_name}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="e.g., Tata Power"
                                />

                                <Field
                                    label="Personnel Reference (Consumer #)"
                                    name="consumer_number"
                                    value={formData.consumer_number}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="Electricity ID"
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 sun-button group"
                        >
                            <div className="flex items-center justify-center space-x-3 font-black uppercase tracking-widest">
                                {loading ? (
                                    <>
                                      <div className="w-5 h-5 border-2 border-solar-dark border-t-transparent rounded-full animate-spin" />
                                      <span>Synchronizing Registry...</span>
                                    </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Complete Onboarding protocol</span>
                                  </>
                                )}
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SolarOnboarding;

function Field({ label, name, value, onChange, type, placeholder }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-solar-muted uppercase tracking-[0.2em] ml-1">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="solar-input"
                required={type !== "checkbox"}
            />
        </div>
    );
}
