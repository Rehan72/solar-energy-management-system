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
        className="
          w-full h-11 text-base tracking-wide
          bg-gradient-to-r from-solar-yellow to-solar-orange
          text-solar-textPrimaryLight
          border-0 rounded-lg
          shadow-[0_0_20px_rgba(245,158,11,0.3)]
          hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]
          hover:scale-[1.02]
          transition-all duration-300
        "
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
function Field({ label, value, onChange, type, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
        required
      />
    </div>
  );
}
