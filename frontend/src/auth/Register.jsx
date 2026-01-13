import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { postRequest } from "../lib/apiService";
import { notify } from "../lib/toast";
import { CheckCircle, ArrowLeft } from "lucide-react";

function Register() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    return formData.first_name && formData.last_name && formData.email &&
      formData.password && formData.phone;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }

    if (!validateForm()) {
      notify.error("Please fill in all required fields.");
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
      });
      notify.success("Registration successful! Please login.");
      setSuccess(true);
    } catch (error) {
      notify.error("Registration failed: " + (error.response?.data?.error || "Unknown error"));
    }
    setLoading(false);
  };

  // Success view
  if (success) {
    return (
      <div className="space-y-6">
        <div className="bg-solar-card rounded-lg p-8 energy-card text-center">
          <div className="w-16 h-16 bg-solar-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-solar-success" />
          </div>
          <h2 className="text-xl font-semibold text-solar-primary mb-2">Registration Successful!</h2>
          <p className="text-solar-muted mb-6">Your account has been created. Please login to complete your profile.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate("/login")} className="flex items-center justify-center space-x-2 px-6 py-3 bg-solar-yellow text-solar-dark font-semibold rounded-lg hover:bg-solar-orange transition sun-button">
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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-solar-primary dark:text-solar-yellow">Create Account</h2>
        <p className="text-solar-muted">Enter your basic details to get started</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} type="text" placeholder="First name" />
          <Field label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} type="text" placeholder="Last name" />
        </div>
        <Field label="Email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="name@example.com" />
        <Field label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="10-digit number" />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Password" name="password" value={formData.password} onChange={handleChange} type="password" placeholder="Create password" />
          <Field label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" placeholder="Confirm password" />
        </div>

        <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-base tracking-wide bg-linear-to-r from-solar-yellow to-solar-orange text-solar-dark border-0 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] transition-all duration-300 mt-4"
        >
            {loading && <span className="h-4 w-4 border-2 border-solar-dark border-t-transparent rounded-full animate-spin mr-2" />}
            {loading ? "Creating Account..." : "Create Account"}
        </Button>
        
        <p className="text-center text-sm text-solar-muted dark:text-solar-muted/80 mt-4">
          Already have an account? <Link to="/login" className="text-solar-yellow hover:text-solar-orange transition-colors duration-200">Login</Link>
        </p>
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
