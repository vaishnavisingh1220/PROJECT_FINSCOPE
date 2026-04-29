import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  // ❌ Do NOT show sidebar on these pages
  const hiddenRoutes = ["/", "/login", "/register", "/admin/login"];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  // 🔐 Check if admin token exists
  const isAdmin = Boolean(localStorage.getItem("admin_token"));

  return (
    <motion.div
      className="sidebar-container"
      initial={{ x: -120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* LOGO */}
      <div className="sidebar-logo">
        <span className="logo-glow">⚡ FinScope AI</span>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <i className="fi fi-rr-upload"></i> Upload
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <i className="fi fi-rr-stats"></i> Dashboard
        </NavLink>

        <NavLink
          to="/summary"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <i className="fi fi-rr-document"></i> Summary
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <i className="fi fi-rr-user"></i> Profile
        </NavLink>

        {/* ================= ADMIN OPTION ================= */}
        {isAdmin && (
          <>
            <div className="sidebar-divider">Admin</div>

            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive ? "sidebar-link active admin-link" : "sidebar-link admin-link"
              }
            >
              <i className="fi fi-rr-rocket"></i> Admin Panel
            </NavLink>
          </>
        )}

        {/* LOGOUT */}
        <NavLink
          to="/logout"
          className="sidebar-link logout-link"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("admin_token");
          }}
        >
          <i className="fi fi-rr-exit"></i> Logout
        </NavLink>

      </nav>
    </motion.div>
  );
}
