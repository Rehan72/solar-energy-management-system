import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { notify } from "../lib/toast";
import { postRequest } from "../lib/apiService";
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "../components/ui/input";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Mocking the API call for now or using a placeholder if backend doesn't exist yet
      await postRequest("/auth/forgot-password", { email });
      setSubmitted(true);
      notify.success("Reset link sent! Check your email.");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to send reset link";
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-solar-success/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-solar-success/30">
          <CheckCircle2 className="w-8 h-8 text-solar-success" />
        </div>
        <h2 className="text-2xl font-bold text-solar-primary dark:text-solar-yellow">Check your email</h2>
        <p className="text-solar-muted dark:text-solar-muted/80">
          We've sent a password reset link to <span className="font-semibold text-solar-primary dark:text-solar-yellow">{email}</span>.
        </p>
        <div className="pt-4">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-solar-yellow hover:text-solar-orange transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-solar-primary dark:text-solar-yellow">Forgot Password?</h2>
        <p className="mt-2 text-sm text-solar-muted dark:text-solar-muted/80">
          No worries! Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-solar-primary dark:text-solar-yellow">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-solar-muted pointer-events-none">
              <Mail size={18} />
            </div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`solar-input h-11 pl-10 ${error ? "border-red-500" : ""}`}
              disabled={loading}
              required
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle size={12} />
              {error}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || !email}
          className="w-full sun-button"
        >
          {loading ? (
            <span className="h-4 w-4 border-2 border-solar-dark border-t-transparent rounded-full animate-spin mr-2" />
          ) : null}
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-solar-muted hover:text-solar-yellow transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
