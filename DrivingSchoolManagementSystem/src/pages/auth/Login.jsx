import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import GlobalLogo from "../../components/common/GlobalLogo";
import "./auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data?.message || "Login failed");
      }

      // Save token
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));

      redirectByRole(data.user.role);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === "Admin") navigate("/admin");
    else if (role === "Instructor") navigate("/instructor");
    else navigate("/student");
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />

      <main className="auth-shell">
        <section className="auth-card" aria-label="Login form">
          <div className="auth-top">
            <div className="auth-logo" aria-hidden="true">
              <GlobalLogo layout="vertical" />
            </div>

            <h1 className="auth-title">Login</h1>
            <p className="auth-subtitle">
              School management access for students, instructors, and administrators
            </p>
          </div>

          <div className="auth-body">
            <Link className="auth-back" to="/">
              ← Back to home
            </Link>

            <form className="auth-form" onSubmit={onSubmit}>
              <label className="field">
                <span className="label">Email Address</span>
                <input
                  className="input"
                  type="email"
                  placeholder="your.email@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span className="label">Password</span>

                <div className="password-wrap">
                  <input
                    className="input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </label>

              <div className="auth-row">
                <label className="check">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <Link className="auth-link" to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>

              {error && (
                <div style={{ marginTop: 12, color: "crimson", fontSize: 14, padding: '8px', background: 'rgba(220, 20, 60, 0.1)', borderRadius: '4px', textAlign: 'center' }}>
                  ✗ {error}
                </div>
              )}

              <p className="auth-footer">
                Don&apos;t have an account?{" "}
                <Link className="auth-accent" to="/register">
                  Create Account
                </Link>
              </p>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
