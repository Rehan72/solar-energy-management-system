import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { login } from "../lib/auth";
import { notify } from "../lib/toast";
import { postRequest } from "../lib/apiService";

function Login() {
  const [formData, setFormData] = useState({
    email: localStorage.getItem("rememberedEmail") || "",
    password: "",
    rememberMe: !!localStorage.getItem("rememberedEmail")
  });
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validation rules
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        } else if (value.length > 100) {
          error = "Email is too long (max 100 characters)";
        }
        break;
        
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        } else if (value.length > 50) {
          error = "Password is too long (max 50 characters)";
        } else if (!/^[\x00-\x7F]*$/.test(value)) {
          error = "Password contains invalid characters";
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password)
    };
    
    setErrors(newErrors);
    
    // Check if form is valid (no errors)
    return !newErrors.email && !newErrors.password;
  };

  // Handle input change with validation
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate field if it has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Handle field blur (mark as touched and validate)
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });
    
    // Validate form
    if (!validateForm()) {
      notify.error("Please fix the errors in the form");
      return;
    }
    
    // Additional sanitization before sending
    const sanitizedData = {
      email: formData.email,
      password: formData.password.trim()
    };
    
    // Hande Remember Me logic
    if (formData.rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    setLoading(true);
    try {
      const response = await postRequest("/auth/login", sanitizedData);
      const { token, user } = response.data;
      login(token, user);
      notify.success("Login successful! Welcome back.");
      navigate("/dashboard");
    } catch (error) {
      // Handle specific API errors
      const errorMessage = error.response?.data?.error || "Login failed";
      
      // Map common API errors to global notification for security
      if (error.response?.status === 401 || error.response?.status === 404) {
        notify.error("Invalid email or password");
      } else if (error.response?.status === 429) {
        notify.error("Too many attempts. Please try again later.");
      } else if (error.response?.status >= 500) {
        notify.error("Server error. Please try again later.");
      } else {
        notify.error("Login failed: " + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if form can be submitted
  const canSubmit = formData.email && formData.password && 
                    !errors.email && !errors.password;

  return (
    <form onSubmit={handleLogin} className="space-y-5" noValidate>
      <Field
        label="Email"
        name="email"
        value={formData.email}
        onChange={(value) => handleChange("email", value)}
        onBlur={() => handleBlur("email")}
        error={touched.email && errors.email}
        type="email"
        placeholder="Enter your email"
        disabled={loading}
      />

      <Field
        label="Password"
        name="password"
        value={formData.password}
        onChange={(value) => handleChange("password", value)}
        onBlur={() => handleBlur("password")}
        error={touched.password && errors.password}
        type="password"
        placeholder="Enter your password"
        disabled={loading}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={formData.rememberMe}
              onChange={(e) => handleChange("rememberMe", e.target.checked)}
            />
            <div className="w-5 h-5 border-2 border-solar-primary/30 dark:border-solar-yellow/30 rounded bg-white/5 peer-checked:bg-solar-yellow peer-checked:border-solar-yellow transition-all duration-200 group-hover:border-solar-yellow/50" />
            <svg 
              className="absolute left-1 top-1 w-3 h-3 text-solar-dark opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-solar-muted group-hover:text-solar-primary dark:group-hover:text-solar-yellow transition-colors select-none">
            Remember me
          </span>
        </label>
        
        <Link 
          to="/forgot-password" 
          className="text-xs text-solar-muted hover:text-solar-yellow transition-colors"
        >
          Forgot Password?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full sun-button disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && (
          <span className="h-4 w-4 border-2 border-solar-dark border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {loading ? "Charging energy..." : "Login"}
      </Button>

      <p className="text-center text-sm text-solar-muted dark:text-solar-muted/80">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-solar-yellow hover:text-solar-orange transition-colors duration-200"
        >
          Register
        </Link>
      </p>

      {/* Demo Info */}
      <div className="mt-4 p-3 rounded-xl bg-solar-yellow/5 border border-solar-yellow/10 animate-fade-in">
        <p className="text-center text-[10px] uppercase tracking-wider text-solar-yellow/60 mb-2">Demo Credentials</p>
        <div className="flex flex-col gap-1 text-center text-xs text-solar-muted/80">
          <p><span className="text-solar-yellow/70">Superadmin:</span> admin@solar.com / admin123</p>
          <p><span className="text-solar-yellow/70">Superadmin 2:</span> superAdmin@solar.com / SuperAdmin@123</p>
        </div>
      </div>
    </form>
  );
}

export default Login;

/* ================================
   🔌 SOLAR INPUT FIELD WITH ERROR STATES
================================ */
import { Eye, EyeOff, AlertCircle } from "lucide-react";

function Field({ 
  label, 
  name,
  value, 
  onChange, 
  onBlur,
  error,
  type, 
  placeholder,
  disabled = false
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-solar-primary dark:text-solar-yellow"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            solar-input h-11 pr-10
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
          `}
          required
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        
        {/* Password toggle or error icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {error && (
            <AlertCircle 
              size={18} 
              className="text-red-500 mr-2" 
              aria-hidden="true"
            />
          )}
          {isPassword && !error && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className="text-solar-muted hover:text-solar-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <p 
          id={`${name}-error`}
          className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
}