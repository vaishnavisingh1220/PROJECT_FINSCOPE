import { useEffect, useState } from "react";
import { API } from "../services/api";
import "./AdminDashboard.css";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const data = [
  { name: "Mon", uploads: 2 },
  { name: "Tue", uploads: 5 },
  { name: "Wed", uploads: 3 },
  { name: "Thu", uploads: 6 },
  { name: "Fri", uploads: 4 },
];

  const fetchFiles = async () => {
    const res = await API.get("/api/admin/files");
    setFiles(res.data.files || []);
  };

  const deleteFile = async (filename) => {
    await API.post("/api/admin/delete", { filename });
    fetchFiles();
  };

  return (
    <div className="admin-container">
      
      {/* HEADER */}
      <div className="admin-header">
        <h2>⚙️ Admin Dashboard</h2>
        <span className="badge">{files.length} Files</span>
      </div>

      {/* CARDS */}
      <div className="admin-cards">
        <div className="card">
          <h4>Total Files</h4>
          <p>{files.length}</p>
        </div>

        <div className="card">
          <h4>Status</h4>
          <p className="status">Active</p>
        </div>
      </div>

      <div className="chart-card">
  <h3>📊 Upload Activity</h3>

  <ResponsiveContainer width="100%" height={250}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line
        type="monotone"
        dataKey="uploads"
        stroke="#6366f1"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>
</div>

      {/* TABLE */}
      <div className="table-card">
        <h3>📂 Uploaded Files</h3>

        {files.length === 0 ? (
          <p className="empty">No files uploaded</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {files.map((file, i) => (
                <tr key={i}>
                  <td>{file}</td>

                  <td>
                    <button
                      className="btn delete"
                      onClick={() => deleteFile(file)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}