import { createContext, useState, useEffect } from "react";
import {
  postLogin,
  postRegister,
  fetchCurrentUser,
} from "../services/api";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  // =========================
  // STATE
  // =========================
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null); // 🔥 full user object
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // =========================
  // LOAD USER ON APP START
  // =========================
  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const res = await fetchCurrentUser();
      setUser(res.data);
    } catch (err) {
      console.error("User load failed:", err);
      logout(); // invalid token
    }
  };

  // =========================
  // LOGIN
  // =========================
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await postLogin({ email, password });

      const token = res.data.token;

      // store token
      localStorage.setItem("token", token);
      setToken(token);

      // 🔥 fetch user immediately
      await loadUser();
    } catch (err) {
      const msg =
        err?.response?.data?.error || "Login failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // REGISTER (AUTO LOGIN)
  // =========================
  const register = async (data) => {
    setLoading(true);
    setError(null);

    try {
      await postRegister(data);

      // auto login
      await login(data.email, data.password);
    } catch (err) {
      const msg =
        err?.response?.data?.error || "Registration failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  // =========================
  // CONTEXT VALUE
  // =========================
  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user, // 🔥 important
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}