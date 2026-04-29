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

  /* ================= KPI CALCULATIONS ================= */
  const latest = history[history.length - 1] || {};
  const prev = history[history.length - 2] || {};

  const calcChange = (curr, prevVal) => {
    if (!curr || !prevVal) return 0;
    return (((curr - prevVal) / prevVal) * 100).toFixed(1);
  };

  const revenueChange = calcChange(latest.revenue, prev.revenue);
  const profitChange = calcChange(latest.profit, prev.profit);

  const margin = latest.revenue
    ? ((latest.profit / latest.revenue) * 100).toFixed(1)
    : 0;

  /* ================= CHART DATA ================= */
  const chartX = history.map((h) => h.upload_date);
  const chartRevenue = history.map((h) => h.revenue || 0);
  const chartProfit = history.map((h) => h.profit || 0);

  /* ================= FORECAST ================= */
  const forecastPeriods = 3;
  const lastRevenue = chartRevenue[chartRevenue.length - 1] || 0;
  const prevRevenue = chartRevenue[chartRevenue.length - 2] || 0;
  const trend = lastRevenue - prevRevenue;

  const forecastX = [];
  const forecastY = [];

  for (let i = 1; i <= forecastPeriods; i++) {
    forecastX.push(`F${i}`);
    forecastY.push(lastRevenue + trend * i);
  }

  /* ================= AI NARRATIVES ================= */
  const generateNarratives = () => {
    if (history.length < 2) return [];

    const narratives = [];

    if (latest.revenue > prev.revenue) {
      narratives.push({
        type: "positive",
        text: "Revenue increased compared to last period, indicating strong growth.",
      });
    } else {
      narratives.push({
        type: "negative",
        text: "Revenue declined, suggesting reduced sales or demand.",
      });
    }

    if (latest.profit < prev.profit) {
      narratives.push({
        type: "negative",
        text: "Profit dropped likely due to rising expenses or reduced margins.",
      });
    } else {
      narratives.push({
        type: "positive",
        text: "Profit improved, indicating better efficiency or cost control.",
      });
    }

    const margin = latest.revenue
      ? latest.profit / latest.revenue
      : 0;

    if (margin < 0.1) {
      narratives.push({
        type: "negative",
        text: "Low profit margin indicates high operational costs.",
      });
    } else {
      narratives.push({
        type: "neutral",
        text: "Profit margin is stable, showing balanced financial health.",
      });
    }

    return narratives;
  };

  const narratives = generateNarratives();

  /* ================= PDF ================= */
  const downloadPdf = async () => {
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("FinScope_Report.pdf");
  };

  return (
    <div className="summary-page">

      {/* HEADER */}
      <div className="summary-header">
        <h2>📋 Auto Summary Report</h2>
        <button className="download-btn" onClick={downloadPdf}>
          ⬇ Download PDF
        </button>
      </div>

      <div className="report-card" ref={reportRef}>

        {/* KPI STRIP */}
        <div className="kpi-strip">
          <div className="kpi-box">
            <h4>Revenue</h4>
            <p>{latest.revenue?.toLocaleString()}</p>
            <span className={revenueChange >= 0 ? "up" : "down"}>
              {revenueChange}% {revenueChange >= 0 ? "↑" : "↓"}
            </span>
          </div>

          <div className="kpi-box">
            <h4>Profit</h4>
            <p>{latest.profit?.toLocaleString()}</p>
            <span className={profitChange >= 0 ? "up" : "down"}>
              {profitChange}% {profitChange >= 0 ? "↑" : "↓"}
            </span>
          </div>

          <div className="kpi-box">
            <h4>Profit Margin</h4>
            <p>{margin}%</p>
            <span className="neutral">Efficiency</span>
          </div>
        </div>

        {/* SUMMARY */}
        <section>
          <h3>Executive Summary</h3>
          <p>{summary}</p>
        </section>

        {/* CHART */}
        <section>
          <h3>📈 Revenue vs Profit Trend + Forecast</h3>

          <Plot
            data={[
              {
                x: chartX,
                y: chartRevenue,
                type: "scatter",
                mode: "lines",
                name: "Revenue",
                line: { color: "#6366f1", width: 3, shape: "spline" },
                fill: "tozeroy",
                fillcolor: "rgba(99,102,241,0.15)",
              },
              {
                x: chartX,
                y: chartProfit,
                type: "scatter",
                mode: "lines",
                name: "Profit",
                line: { color: "#22c55e", width: 3, shape: "spline" },
              },
              {
                x: [...chartX, ...forecastX],
                y: [...chartRevenue, ...forecastY],
                type: "scatter",
                mode: "lines",
                name: "Forecast",
                line: {
                  color: "#f59e0b",
                  width: 3,
                  dash: "dot",
                },
              },
            ]}
            layout={{
              paper_bgcolor: "#fff",
              plot_bgcolor: "#fff",
              hovermode: "x unified",
              margin: { t: 20 },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: "350px" }}
          />
        </section>

        {/* AI NARRATIVES */}
        <section>
          <h3>🧠 AI Narrative Insights</h3>
          <div className="narrative-grid">
            {narratives.map((n, i) => (
              <div key={i} className={`narrative-card ${n.type}`}>
                {n.text}
              </div>
            ))}
          </div>
        </section>


        {/* BULLETS */}
        <section>
          <h3>Key Insights</h3>
          <ul>
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>

        {/* TRACE */}
        <section>
          <h3>🔍 Traceability</h3>
          <table className="trace-table">
            <thead>
              <tr>
                <th>KPI</th>
                <th>Value</th>
                <th>Source</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {traceability.map((t, i) => (
                <tr key={i}>
                  <td>{t.kpi_name}</td>
                  <td>{t.value}</td>
                  <td>{t.source_type}</td>
                  <td>{Math.round(t.confidence * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* TIPS */}
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