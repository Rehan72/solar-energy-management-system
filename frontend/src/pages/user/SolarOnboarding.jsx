import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { putRequest } from "../../lib/apiService";
import { notify } from "../../lib/toast";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

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
        <div className="max-w-3xl mx-auto p-6 space-y-8 animate-fadeIn">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-solar-primary dark:text-solar-yellow mb-2">
                    Complete Your Solar Profile
                </h1>
                <p className="text-solar-muted">
                    Tell us about your energy needs to get personalized recommendations.
                </p>
            </div>

            <div className="bg-solar-card/50 rounded-xl p-8 border border-solar-border shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
                            Installation Status *
                        </label>
                        <select
                            name="installation_status"
                            value={formData.installation_status}
                            onChange={handleChange}
                            className="w-full h-11 bg-solar-dark/80 dark:bg-solar-night/80 text-solar-primary dark:text-solar-textPrimaryDark border border-solar-border rounded-lg px-3 focus:ring-2 focus:ring-solar-yellow focus:border-solar-yellow transition-all"
                        >
                            {installationStatuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
                            Property Type *
                        </label>
                        <select
                            name="property_type"
                            value={formData.property_type}
                            onChange={handleChange}
                            className="w-full h-11 bg-solar-dark/80 dark:bg-solar-night/80 text-solar-primary dark:text-solar-textPrimaryDark border border-solar-border rounded-lg px-3 focus:ring-2 focus:ring-solar-yellow focus:border-solar-yellow transition-all"
                        >
                            {propertyTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.installation_status !== "INSTALLED" && (
                        <div className="space-y-4 animate-slideUp">
                            <Field
                                label="Average Monthly Bill (₹) *"
                                name="avg_monthly_bill"
                                value={formData.avg_monthly_bill}
                                onChange={handleChange}
                                type="number"
                                placeholder="e.g., 2500"
                            />

                            <Field
                                label="Roof Area (sq ft) - Optional"
                                name="roof_area_sqft"
                                value={formData.roof_area_sqft}
                                onChange={handleChange}
                                type="number"
                                placeholder="e.g., 500"
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
                                    Connection Type
                                </label>
                                <select
                                    name="connection_type"
                                    value={formData.connection_type}
                                    onChange={handleChange}
                                    className="w-full h-11 bg-solar-dark/80 dark:bg-solar-night/80 text-solar-primary dark:text-solar-textPrimaryDark border border-solar-border rounded-lg px-3 focus:ring-2 focus:ring-solar-yellow focus:border-solar-yellow transition-all"
                                >
                                    {connectionTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-3 p-4 bg-solar-primary/5 rounded-lg border border-solar-primary/10">
                                <input
                                    type="checkbox"
                                    name="subsidy_interest"
                                    id="subsidy_interest"
                                    checked={formData.subsidy_interest}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-solar-yellow border-solar-border rounded focus:ring-solar-yellow cursor-pointer"
                                />
                                <label
                                    htmlFor="subsidy_interest"
                                    className="text-sm text-solar-primary dark:text-solar-textPrimaryDark cursor-pointer select-none"
                                >
                                    I'm interested in government subsidies
                                </label>
                            </div>
                        </div>
                    )}

                    {formData.installation_status === "INSTALLED" && (
                        <div className="space-y-4 animate-slideUp">
                            <Field
                                label="Plant Capacity (kW) *"
                                name="plant_capacity_kw"
                                value={formData.plant_capacity_kw}
                                onChange={handleChange}
                                type="number"
                                placeholder="e.g., 5"
                            />

                            <div className="flex items-center space-x-3 p-4 bg-solar-primary/5 rounded-lg border border-solar-primary/10">
                                <input
                                    type="checkbox"
                                    name="net_metering"
                                    id="net_metering"
                                    checked={formData.net_metering}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-solar-yellow border-solar-border rounded focus:ring-solar-yellow cursor-pointer"
                                />
                                <label
                                    htmlFor="net_metering"
                                    className="text-sm text-solar-primary dark:text-solar-textPrimaryDark cursor-pointer select-none"
                                >
                                    Net metering enabled
                                </label>
                            </div>

                            <Field
                                label="Inverter Brand"
                                name="inverter_brand"
                                value={formData.inverter_brand}
                                onChange={handleChange}
                                type="text"
                                placeholder="e.g., SolarEdge, Huawei"
                            />

                            <Field
                                label="DISCOM Name"
                                name="discom_name"
                                value={formData.discom_name}
                                onChange={handleChange}
                                type="text"
                                placeholder="e.g., BSES, Tata Power"
                            />

                            <Field
                                label="Consumer Number"
                                name="consumer_number"
                                value={formData.consumer_number}
                                onChange={handleChange}
                                type="text"
                                placeholder="Your electricity consumer number"
                            />
                        </div>
                    )}

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-lg tracking-wide bg-gradient-to-r from-solar-yellow to-solar-orange text-solar-dark border-0 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] transition-all duration-300"
                        >
                            {loading && (
                                <span className="h-5 w-5 border-2 border-solar-dark border-t-transparent rounded-full animate-spin mr-3" />
                            )}
                            {loading ? "Updating Profile..." : "Complete Setup"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SolarOnboarding;

function Field({ label, name, value, onChange, type, placeholder }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
                {label}
            </label>
            <Input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="
          h-11
          bg-solar-dark/80 dark:bg-solar-night/80
          text-solar-primary dark:text-solar-textPrimaryDark
          border border-solar-border dark:border-solar-border
          focus:ring-2 focus:ring-solar-yellow focus:border-solar-yellow
          placeholder:text-solar-muted/50
          rounded-lg
          transition-all duration-300
        "
                required={type !== "checkbox"}
            />
        </div>
    );
}
