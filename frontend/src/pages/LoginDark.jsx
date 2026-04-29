import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

export default function LoginDark() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // 🔥 IMPORTANT FIX
      localStorage.setItem("token", data.token);

      // (optional) store user
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ redirect
      navigate("/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Welcome back 👋</h2>
        <p className="login-sub">
          Sign in to access your FinScope AI dashboard
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <label className="field-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="input-field"
            />
          </label>

          <label className="field-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
            />
          </label>

          <div className="login-row">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((s) => !s)}
              />
              Remember me
            </label>

            <Link className="forgot-link" to="/forgot">
              Forgot?
            </Link>
          </div>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="signup-row">
            <span>Don’t have an account?</span>
            <Link to="/register" className="signup-link">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}