import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../services/api";
import FloatingShapes from "../components/FloatingShapes";
import BackgroundParticles from "../components/BackgroundParticles";
import "./AuthDark.css";
import { AuthContext } from "../context/AuthContext";

export default function RegisterDark() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/register", form);

      const loginRes = await API.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const token = loginRes.data.token;
      const userId = loginRes.data.user_id;

      if (token && userId) {
        login(token, userId);
        navigate("/dashboard");
      } else {
        alert("Registered. Please login.");
        navigate("/login");
      }
    } catch (err) {
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message;

      setError(serverMsg || "Registration failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <BackgroundParticles />
      <FloatingShapes />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.h2>Create your account</motion.h2>
        <p className="muted">Sign up to start using FinScope AI</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            className="auth-input"
            placeholder="Username"
            value={form.username}
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <input
            type="email"
            className="auth-input"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <motion.button
            type="submit"
            className="auth-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
          >
            {loading ? "Creating account…" : "Sign Up"}
          </motion.button>
        </form>

        <div className="auth-footer">
          <span className="muted">Already have an account? </span>
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}