import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { postRequest } from "../lib/apiService";
import { notify } from "../lib/toast";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postRequest("/auth/register", {
        name,
        email,
        password,
      });
      notify.success("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      notify.error("Registration failed: " + (error.response?.data?.error || "Unknown error"));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister} className="space-y-5">
      <Field
        label="Full Name"
        value={name}
        onChange={setName}
        type="text"
        placeholder="Enter your full name"
      />

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
        placeholder="Create a password"
      />

      <Button
        type="button"
        onClick={handleRegister}
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
        {loading ? "Charging energy..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-solar-muted dark:text-solar-muted/80">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-solar-yellow hover:text-solar-orange transition-colors duration-200"
        >
          Login
        </Link>
      </p>
    </form>
  );
}

export default Register;

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
