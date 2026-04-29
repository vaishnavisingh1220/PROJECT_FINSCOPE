import { useEffect, useState, useRef, useContext } from "react";
import Plot from "react-plotly.js";
import { API } from "../services/api";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { KpiContext } from "../context/KpiContext";
import "./SummaryPage.css";

export default function SummaryPage() {
  const { insights, loading, analyzeReport } = useContext(KpiContext);

  const [summary, setSummary] = useState("");
  const [bullets, setBullets] = useState([]);
  const [tips, setTips] = useState([]);
  const [traceability, setTraceability] = useState([]);
  const [history, setHistory] = useState([]);

  const reportRef = useRef(null);
  const userId = 1;

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, histRes] = await Promise.all([
          API.get(`/files/summary/${userId}`),
          API.get(`/files/history/${userId}`),
        ]);

        setSummary(sumRes.data.summary || "");
        setBullets(sumRes.data.bullets || []);
        setTips(sumRes.data.tips || []);
        setTraceability(sumRes.data.traceability || []);
        setHistory(histRes.data.history || []);
      } catch (e) {
        setSummary("Failed to generate summary.");
      }
    }

    fetchData();
    analyzeReport();
  }, [analyzeReport]);

  /* =========================
     FIX GRAPH DATA (🔥 IMPORTANT)
  ========================= */
  const chartData = history.map((h) => ({
    date: h.upload_date,
    revenue: h.revenue || 0,
    profit: Math.max(h.profit || 0, -100000), // prevent huge spikes
  }));

  const chartX = chartData.map((d) => d.date);
  const chartRevenue = chartData.map((d) => d.revenue);
  const chartProfit = chartData.map((d) => d.profit);

  /* =========================
     PDF DOWNLOAD
  ========================= */
  const downloadPdf = async () => {
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("FinScope_Traceable_Report.pdf");
  };

  return (
    <div className="summary-page">
      
      {/* HEADER */}
      <div className="summary-header">
        <h2>📋 Auto Summary Report</h2>

        {/* ✅ FIXED BUTTON */}
        <button className="download-btn" onClick={downloadPdf}>
          ⬇ Download PDF
        </button>
      </div>

      <div className="report-card" ref={reportRef}>
        
        {/* ================= EXEC SUMMARY ================= */}
        <section>
          <h3>Executive Summary</h3>
          <p>{summary}</p>
        </section>

        {/* ================= GRAPH ================= */}
        <section>
          <h3>📈 Revenue vs Profit Trend</h3>
          <p className="chart-subtitle">
            Blue line = Revenue, Green bars = Profit over time
          </p>

          <Plot
            data={[
              {
                x: chartX,
                y: chartRevenue,
                type: "scatter",
                mode: "lines+markers",
                name: "Revenue",
                line: {
                  color: "#4f46e5",
                  width: 4,
                  shape: "spline",
                },
                marker: {
                  size: 6,
                },
                fill: "tozeroy",
                fillcolor: "rgba(79,70,229,0.1)",
              },
              {
                x: chartX,
                y: chartProfit,
                type: "bar",
                name: "Profit",
                marker: {
                  color: "#22c55e",
                  opacity: 0.8,
                },
              },
            ]}
            layout={{
              paper_bgcolor: "#ffffff",
              plot_bgcolor: "#ffffff",

              margin: { t: 20, r: 20, l: 40, b: 40 },

              font: { color: "#0f172a" },

              xaxis: {
                title: "Date",
                showgrid: false,
              },

              yaxis: {
                title: "Amount",
                gridcolor: "#e5e7eb",
              },

              legend: {
                orientation: "h",
                y: 1.1,
              },

              hovermode: "x unified",
            }}

            config={{
              responsive: true,
              displayModeBar: false,
            }}

            style={{ width: "100%", height: "350px" }}
          />
        </section>

        {/* ================= AI INSIGHTS ================= */}
        <section>
          <h3>🤖 AI Financial Insights</h3>

          {loading ? (
            <p>Analyzing financial performance...</p>
          ) : insights.length === 0 ? (
            <p>No AI insights available.</p>
          ) : (
            <div className="insight-grid">
              {insights.map((ins, i) => (
                <div
                  key={i}
                  className={`insight-card ${ins.type?.toLowerCase() || ""}`}
                >
                  <h4>{ins.title}</h4>
                  <p className="desc">{ins.description}</p>
                  <p className="explain">{ins.explanation}</p>
                  <span className="confidence">
                    Confidence: {ins.confidence_score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= BULLETS ================= */}
        <section>
          <h3>Key Insights (Summary)</h3>
          <ul>
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>

        {/* ================= TRACE ================= */}
        <section className="trace-section">
          <h3>🔍 KPI Traceability & Explainability</h3>

          {traceability.length === 0 ? (
            <p>No traceability data available.</p>
          ) : (
            <table className="trace-table">
              <thead>
                <tr>
                  <th>KPI</th>
                  <th>Value</th>
                  <th>Source</th>
                  <th>Page</th>
                  <th>Matched Text</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {traceability.map((t, i) => (
                  <tr key={i}>
                    <td>{t.kpi_name}</td>
                    <td>{t.value}</td>
                    <td>{t.source_type}</td>
                    <td>{t.page_number}</td>
                    <td className="matched-text">{t.matched_text}</td>
                    <td>{Math.round(t.confidence * 100)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ================= TIPS ================= */}
        <section>
          <h3>Recommendations</h3>
          <ul>
            {tips.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>

      </div>
    </div>
  );
}