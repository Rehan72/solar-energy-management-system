import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { postRequest } from "../lib/apiService";
import { notify } from "../lib/toast";
import { CheckCircle, User, ArrowLeft } from "lucide-react";

function Register() {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Basic details
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    
    // Solar-specific
    installation_status: "NOT_INSTALLED",
    property_type: "RESIDENTIAL",
    avg_monthly_bill: "",
    roof_area_sqft: "",
    connection_type: "SINGLE_PHASE",
    subsidy_interest: false,
    
    // Installed user fields
    plant_capacity_kw: "",
    net_metering: false,
    inverter_brand: "",
    discom_name: "",
    consumer_number: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const validateStep1 = () => {
    return formData.first_name && formData.last_name && formData.email && 
           formData.password && formData.phone && formData.city && 
           formData.state && formData.pincode && formData.address_line1;
  };

  const validateStep2 = () => {
    if (formData.installation_status === "NOT_INSTALLED" || formData.installation_status === "INSTALLATION_PLANNED") {
      return formData.avg_monthly_bill && parseFloat(formData.avg_monthly_bill) > 0;
    } else if (formData.installation_status === "INSTALLED") {
      return formData.plant_capacity_kw && parseFloat(formData.plant_capacity_kw) > 0;
    }
    return false;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    setStep(prev => prev - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await postRequest("/auth/register", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
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
      notify.success("Registration successful! Please login.");
      setSuccess(true);
    } catch (error) {
      notify.error("Registration failed: " + (error.response?.data?.error || "Unknown error"));
    }
    setLoading(false);
  };

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

  // Success view
  if (success) {
    return (
      <div className="space-y-6">
        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <div className="w-16 h-16 bg-solar-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-solar-success" />
          </div>
          <h2 className="text-xl font-semibold text-solar-primary mb-2">Registration Successful!</h2>
          <p className="text-solar-muted mb-6">Your account has been created. What would you like to do next?</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button"
            >
              <User className="w-5 h-5" />
              <span>Complete Your Profile</span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-solar-card border border-solar-yellow text-solar-primary font-semibold rounded-lg hover:bg-solar-panel/20 transition sun-button"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go to Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-center items-center space-x-4 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= s 
                ? "bg-gradient-to-r from-solar-yellow to-solar-orange text-solar-dark" 
                : "bg-gray-300 text-gray-500"
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-16 h-1 ${step > s ? "bg-solar-yellow" : "bg-gray-300"}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        {/* Step 1: Basic Details */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-semibold text-solar-primary dark:text-solar-yellow">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                type="text"
                placeholder="Enter first name"
              />
              <Field
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                type="text"
                placeholder="Enter last name"
              />
            </div>

            <Field
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              placeholder="Enter your email"
            />

            <Field
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel"
              placeholder="Enter phone number"
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="Create password"
              />
              <Field
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                type="password"
                placeholder="Confirm password"
              />
            </div>

            <Field
              label="Address Line 1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              type="text"
              placeholder="Enter full address"
            />

            <Field
              label="Address Line 2 (Optional)"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleChange}
              type="text"
              placeholder="Apartment, suite, etc. (optional)"
            />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
                  City *
                </label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="h-11 bg-solar-dark/80 dark:bg-solar-night/80 text-solar-primary dark:text-solar-textPrimaryDark border border-solar-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
                  State *
                </label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="h-11 bg-solar-dark/80 dark:bg-solar-night/80 text-solar-primary dark:text-solar-textPrimaryDark border border-solar-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
                  Pincode *
                </label>
                <Input
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  className="h-11 bg-solar-dark/80 dark:bg-solar-night/80 text-solar-primary dark:text-solar-textPrimaryDark border border-solar-border"
                  required
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleNext}
              disabled={!validateStep1()}
              className="w-full h-11 text-base tracking-wide mt-4 bg-gradient-to-r from-solar-yellow to-solar-orange text-solar-dark border-0 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] transition-all duration-300"
            >
              Next: Solar Details →
            </Button>
          </div>
        )}

        {/* Step 2: Solar Installation Status */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-semibold text-solar-primary dark:text-solar-yellow">
              Solar Installation Status
            </h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
                Installation Status *
              </label>
              <select
                name="installation_status"
                value={formData.installation_status}
                onChange={handleChange}
                className="w-full h-11 bg-solar-dark/80 dark:bg-solar-night/80 text-solar-primary dark:text-solar-textPrimaryDark border border-solar-border rounded-lg px-3 focus:ring-2 focus:ring-solar-yellow focus:border-solar-yellow"
              >
                {installationStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.installation_status !== "INSTALLED" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
                    Property Type *
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full h-11 bg-solar-dark/80 dark:bg-solar-night/80 text-solar-primary dark:text-solar-textPrimaryDark border border-solar-border rounded-lg px-3 focus:ring-2 focus:ring-solar-yellow focus:border-solar-yellow"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

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
                    className="w-full h-11 bg-solar-dark/80 dark:bg-solar-night/80 text-solar-primary dark:text-solar-textPrimaryDark border border-solar-border rounded-lg px-3 focus:ring-2 focus:ring-solar-yellow focus:border-solar-yellow"
                  >
                    {connectionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="subsidy_interest"
                    id="subsidy_interest"
                    checked={formData.subsidy_interest}
                    onChange={handleChange}
                    className="w-5 h-5 text-solar-yellow border-solar-border rounded focus:ring-solar-yellow"
                  />
                  <label htmlFor="subsidy_interest" className="text-sm text-solar-primary dark:text-solar-textPrimaryDark">
                    I'm interested in government subsidies
                  </label>
                </div>
              </>
            )}

            {formData.installation_status === "INSTALLED" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
                    Property Type *
                  </label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full h-11 bg-solar-dark/80 dark:bg-solar-night/80 text-solar-primary dark:text-solar-textPrimaryDark border border-solar-border rounded-lg px-3 focus:ring-2 focus:ring-solar-yellow focus:border-solar-yellow"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Field
                  label="Plant Capacity (kW) *"
                  name="plant_capacity_kw"
                  value={formData.plant_capacity_kw}
                  onChange={handleChange}
                  type="number"
                  placeholder="e.g., 5"
                />

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="net_metering"
                    id="net_metering"
                    checked={formData.net_metering}
                    onChange={handleChange}
                    className="w-5 h-5 text-solar-yellow border-solar-border rounded focus:ring-solar-yellow"
                  />
                  <label htmlFor="net_metering" className="text-sm text-solar-primary dark:text-solar-textPrimaryDark">
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
              </>
            )}

            <div className="flex space-x-4 mt-4">
              <Button
                type="button"
                onClick={handleBack}
                className="flex-1 h-11 text-base bg-gray-300 text-gray-700 border-0 rounded-lg hover:bg-gray-400 transition-all duration-300"
              >
                ← Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validateStep2()}
                className="flex-1 h-11 text-base tracking-wide bg-gradient-to-r from-solar-yellow to-solar-orange text-solar-dark border-0 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] transition-all duration-300"
              >
                Next: Review →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-semibold text-solar-primary dark:text-solar-yellow">
              Review Your Information
            </h3>

            <div className="bg-solar-dark/50 dark:bg-solar-night/50 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-solar-muted">Name:</span>
                <span className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                  {formData.first_name} {formData.last_name}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-solar-muted">Email:</span>
                <span className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                  {formData.email}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-solar-muted">Phone:</span>
                <span className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                  {formData.phone}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-solar-muted">Location:</span>
                <span className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                  {formData.city}, {formData.state} - {formData.pincode}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-solar-muted">Installation Status:</span>
                <span className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                  {formData.installation_status === "NOT_INSTALLED" ? "Not Installed (Planning)" : 
                   formData.installation_status === "INSTALLATION_PLANNED" ? "Installation Planned" : "Already Installed"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="text-solar-muted">Property Type:</span>
                <span className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                  {formData.property_type}
                </span>
              </div>
              {formData.installation_status !== "INSTALLED" && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-solar-muted">Avg. Monthly Bill:</span>
                  <span className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                    ₹{formData.avg_monthly_bill}/month
                  </span>
                </div>
              )}
              {formData.installation_status === "INSTALLED" && (
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-solar-muted">Plant Capacity:</span>
                  <span className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                    {formData.plant_capacity_kw} kW
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <span className="text-solar-muted">Subsidy Interest:</span>
                <span className="text-solar-primary dark:text-solar-textPrimaryDark font-medium">
                  {formData.subsidy_interest ? "Yes" : "No"}
                </span>
              </div>
            </div>

            <div className="flex space-x-4 mt-4">
              <Button
                type="button"
                onClick={handleBack}
                className="flex-1 h-11 text-base bg-gray-300 text-gray-700 border-0 rounded-lg hover:bg-gray-400 transition-all duration-300"
              >
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 text-base tracking-wide bg-gradient-to-r from-solar-yellow to-solar-orange text-solar-dark border-0 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] transition-all duration-300"
              >
                {loading && (
                  <span className="h-4 w-4 border-2 border-solar-dark border-t-transparent rounded-full animate-spin mr-2" />
                )}
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <p className="text-center text-sm text-solar-muted dark:text-solar-muted/80">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-solar-yellow hover:text-solar-orange transition-colors duration-200"
            >
              Login
            </Link>
          </p>
        )}
      </form>
    </div>
  );
}

export default Register;

/* ================================
   🔌 SOLAR INPUT FIELD
=============================== */
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
