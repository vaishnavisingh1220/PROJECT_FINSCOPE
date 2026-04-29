import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">FinScope</h2>

        <nav>
          <NavLink to="/admin/dashboard">📊 Dashboard</NavLink>
          <NavLink to="/admin/users">👤 Users</NavLink>
        </nav>

        {/* 🔥 LOGOUT BUTTON */}
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="admin-main">
        <Outlet />
      </div>

    </div>
  );
}