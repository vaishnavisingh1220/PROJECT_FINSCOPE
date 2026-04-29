import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { API } from "../services/api";
import "./UploadPage.css";
import avatar from "../assets/ai_avatar.png";
import { KpiContext } from "../context/KpiContext";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [localKpis, setLocalKpis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [summary, setSummary] = useState("");

  const { setKpis, setTraces, setInsights } = useContext(KpiContext);
  const navigate = useNavigate();

  const messages = [
    "Welcome 👋 Upload your financial report",
    "Let’s analyze your data 📊",
    "AI ready to extract insights 🤖",
    "Upload and unlock smart insights ✨",
  ];

  const [message, setMessage] = useState(
    messages[Math.floor(Math.random() * messages.length)]
  );

  /* =========================
     HANDLE FILE SELECT
  ========================= */
  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setMessage("File selected ✅ Ready to analyze");
    } else {
      setMessage("Only PDF files are allowed.");
    }
  };

  /* =========================
     DRAG EVENTS
  ========================= */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  /* =========================
     MAIN UPLOAD FUNCTION
  ========================= */
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setMessage("Uploading & extracting KPIs... 📊");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // ✅ STEP 1: Upload
      const uploadRes = await API.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0,
      });

      const filePath = uploadRes.data.file_path;

      // ✅ STEP 2: KPI Extraction
      const extractRes = await API.post(
        "/files/extract_kpi",
        { file_path: filePath },
        { timeout: 0 }
      );

      const extractedKpis = extractRes.data.kpis || {};
      const traceability = extractRes.data.traceability || [];

      // ✅ UPDATE UI IMMEDIATELY (🔥 KEY FIX)
      setKpis(extractedKpis);
      setTraces(traceability);
      setLocalKpis(extractedKpis);

      setLoading(false); // ✅ allow UI to render KPIs
      setMessage("KPIs ready ✅ Generating AI insights...");

      // ✅ STEP 3: INSIGHTS (optional existing API)
      const filename = filePath.split("/").pop();

      const insightsRes = await API.post("/api/analyze", {
        filename: filename,
      });

      const insights = insightsRes.data.insights || [];
      setInsights(insights);

      // ✅ STEP 4: NLP SUMMARY (BACKGROUND - NON BLOCKING)
      setTimeout(async () => {
        try {
          const analyzeForm = new FormData();
          analyzeForm.append("file", file);

          const analysisRes = await API.post(
            "/analyze-report",
            analyzeForm
          );

          const summaryText = analysisRes.data?.data?.summary || "";

          setSummary(summaryText);

          setMessage("Analysis complete ✅");

        } catch (err) {
          console.error("NLP error:", err);
        }
      }, 0);

    } catch (err) {
      console.error("Upload error:", err);
      setMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <motion.div
        className="upload-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* AI Avatar */}
        <img src={avatar} alt="AI Avatar" className="ai-avatar" />

        {/* Message */}
        <div className="ai-bubble">
          <p>{message}</p>
        </div>

        {/* ================= UPLOAD BOX ================= */}
        <div
          className={`upload-box ${dragActive ? "drag-active" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <p className="upload-text">📄 Drag & drop your PDF here</p>
          <p className="upload-sub">or click to browse</p>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFile(e.target.files[0])}
            className="file-input"
          />

          {file && (
            <div className="file-preview">
              <span>📄 {file.name}</span>
              <button className="remove-file" onClick={() => setFile(null)}>
                ✖
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            className="upload-btn"
            disabled={loading}
          >
            {loading ? "Processing..." : "Upload & Analyze 🚀"}
          </button>
        </div>

        {/* ================= KPI PREVIEW ================= */}
        {localKpis && Object.keys(localKpis).length > 0 && (
          <motion.div
            className="kpi-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3>📊 Extracted KPIs</h3>

            <div className="kpi-grid">
            { Object.entries(localKpis)
  .filter(([_, value]) => value !== null && value !== 0)
  .map(([key, value]) => (
                <div key={key} className="kpi-card">
                  <h4>{key.toUpperCase()}</h4>
                  <p>{value !== null ? value.toLocaleString() : "—"}</p>
                </div>
              ))}
            </div>

            {/* ✅ FIXED NAVIGATION */}
            <button
              className="goto-dashboard-btn"
              onClick={() =>
                navigate("/dashboard", { state: { summary } })
              }
            >
              View Dashboard →
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}