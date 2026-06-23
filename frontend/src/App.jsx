import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

/* ================= USER PAGES ================= */
import Landing from "./pages/Landing";
import LoginDark from "./pages/LoginDark";
import RegisterDark from "./pages/RegisterDark";
import UploadPage from "./pages/UploadPage";
import Dashboard from "./pages/Dashboard";
import SummaryPage from "./pages/SummaryPage";
import ProfilePage from "./pages/ProfilePage";

/* ================= COMPONENTS ================= */
import Sidebar from "./components/Sidebar";

/* ================= ADMIN PAGES ================= */
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminLayout from "./admin/AdminLayout";
import AdminUsers from "./admin/AdminUsers";

/* =================================================
   USER PROTECTED ROUTE
================================================= */
const ProtectedUser = ({ children }) => {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
};

/* =================================================
   ADMIN PROTECTED ROUTE
================================================= */
const ProtectedAdmin = ({ children }) => {
  const adminToken = localStorage.getItem("admin_token");

  return adminToken
    ? children
    : <Navigate to="/admin/login" replace />;
};

/* =================================================
   USER LAYOUT
================================================= */
const UserLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-content">
        {children}
      </div>
    </div>
  );
};

/* =================================================
   APP
================================================= */
export default function App() {
  return (
    <Router>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}

        <Route path="/" element={<Landing />} />

        <Route
          path="/login"
          element={<LoginDark />}
        />

        <Route
          path="/register"
          element={<RegisterDark />}
        />

        {/* ================= USER ROUTES ================= */}

        <Route
          path="/upload"
          element={
            <ProtectedUser>
              <UserLayout>
                <UploadPage />
              </UserLayout>
            </ProtectedUser>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedUser>
              <UserLayout>
                <Dashboard />
              </UserLayout>
            </ProtectedUser>
          }
        />

        <Route
          path="/summary"
          element={
            <ProtectedUser>
              <UserLayout>
                <SummaryPage />
              </UserLayout>
            </ProtectedUser>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedUser>
              <UserLayout>
                <ProfilePage />
              </UserLayout>
            </ProtectedUser>
          }
        />

        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminLayout />
            </ProtectedAdmin>
          }
        >
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="users"
            element={<AdminUsers />}
          />
        </Route>

        {/* ================= FALLBACK ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </Router>
  );
}