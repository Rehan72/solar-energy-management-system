import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { login } from "../lib/auth";
import { notify } from "../lib/toast";
import { postRequest } from "../lib/apiService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await postRequest("/auth/login", {
        email,
        password,
      });
      const { token, user } = response.data;
      login(token, user);
      notify.success("Login successful! Welcome back.");
      navigate("/dashboard");
    } catch (error) {
      notify.error("Login failed: " + (error.response?.data?.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <Field
        label="Email"
        value={email}
        onChange={setEmail}
        type="email"
        placeholder="Enter your email"
      />

      <Field
        label="Password"
        value={password}
        onChange={setPassword}
        type="password"
        placeholder="Enter your password"
      />

      <Button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className="w-full h-11 sun-button"
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
      <div className="mt-4 text-center text-xs text-solar-muted/60 dark:text-solar-muted/50">
        Superadmin: admin@solar.com / admin123
      </div>
    </form>
  );
}

export default Login;

/* ================================
   🔌 SOLAR INPUT FIELD
================================ */
import { Eye, EyeOff } from "lucide-react";

function Field({ label, value, onChange, type, placeholder }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
        {label}
      </label>
      <div className="relative">
        <Input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="solar-input h-11 pr-10"
          required
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-solar-muted hover:text-solar-yellow transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
