import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading || !user) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>

        <div className="profile-details">
          <div className="profile-row">
            <span>Username</span>
            <strong>{user.username}</strong>
          </div>

          <div className="profile-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="profile-row">
            <span>User ID</span>
            <strong>{user.id}</strong>
          </div>

          <div className="profile-row">
            <span>Status</span>
            <strong className="active">Active</strong>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn primary">Edit Profile</button>

          <button className="btn secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}