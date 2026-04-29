import { useEffect, useState } from "react";
import { API } from "../services/api";
import "./admin.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/api/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?"))
      return;

    try {
      await API.post("/api/admin/delete-user", { userId: id });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await API.post("/api/admin/update-role", { userId: id, role });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔍 FILTER USERS
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="user-card">

        {/* HEADER */}
        <div className="user-header">
          <h2>👤 User Management</h2>

          <input
            className="search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>

                  {/* NAME + AVATAR */}
                  <td>
                    <div className="user-info">
                      <div className="avatar">
                        {u.name ? u.name[0].toUpperCase() : "U"}
                      </div>
                      {u.name}
                    </div>
                  </td>

                  <td>{u.email}</td>

                  {/* ROLE */}
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  {/* ACTIONS */}
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn delete"
                      onClick={() => deleteUser(u.id)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
}