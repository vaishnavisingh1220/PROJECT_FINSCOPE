import { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Plot from "react-plotly.js";
import { API } from "../services/api";
import { KpiContext } from "../context/KpiContext";
import "./Dashboard.css";

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [selectedKpi, setSelectedKpi] = useState(null);

  const { kpis, traces } = useContext(KpiContext) || {};

  /* =========================
     SAFE VALUE CHECK
  ========================= */
  const isValid = (value) => {
    return (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      value !== 0 &&
      value !== "—" &&
      !isNaN(Number(value))
    );
  };

  /* =========================
     FETCH HISTORY
  ========================= */
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await API.get("/files/history/1");
        setRecords(Array.isArray(res.data.history) ? res.data.history : []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setRecords([]);
      }
    }
    fetchHistory();
  }, []);

  const latestRecord =
    records.length > 0 ? records[records.length - 1] : {};

  const formatValue = (v) => {
    if (!isValid(v)) return null;
    return Number(v).toLocaleString();
  };

  const getLatestValue = (key) => {
    if (kpis && isValid(kpis[key])) return kpis[key];
    if (latestRecord && isValid(latestRecord[key]))
      return latestRecord[key];
    return null;
  };

  const getTraceForKpi = (kpiName) => {
    if (!Array.isArray(traces)) return [];
    return traces.filter((t) => t.kpi_name === kpiName);
  };

  /* =========================
     KPI LISTS
  ========================= */
  const basicKPIs = ["revenue", "profit", "eps", "cash_flow"];
  const advancedKPIs = [
    "ebitda",
    "ebit",
    "pbt",
    "total_expense",
    "gross_profit",
  ];

  const ratioGroups = {
    profitability: [
      "gross_margin",
      "operating_margin",
      "ebitda_margin",
      "net_profit_margin",
      "roa",
      "roe",
    ],
    liquidity: ["current_ratio", "quick_ratio"],
    leverage: ["debt_to_equity"],
  };

  /* =========================
     CHART DATA
  ========================= */
  const chartX = records.map((r) => r.upload_date || "");
  const chartRevenue = records.map((r) =>
    isValid(r.revenue) ? r.revenue : 0
  );
  const chartProfit = records.map((r) =>
    isValid(r.profit) ? r.profit : 0
  );

  return (
    <div className="dashboard-container">
      <motion.h2
        className="dashboard-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📈 Financial KPI Dashboard
      </motion.h2>

      {/* ================= BASIC KPIs ================= */}
      <h3 className="section-title">Basic KPIs</h3>
      <div className="dashboard-kpi-grid">
        {basicKPIs
          .filter((k) => isValid(getLatestValue(k)))
          .map((k) => (
            <motion.div
              key={k}
              className="dashboard-kpi-card clickable"
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedKpi(k)}
            >
              <h4>{k.toUpperCase()}</h4>
              <p>{formatValue(getLatestValue(k))}</p>
              <small className="trace-hint"></small>
            </motion.div>
          ))}
      </div>

      {/* ================= ADVANCED KPIs ================= */}
      <h3 className="section-title">Advanced KPIs</h3>
      <div className="dashboard-kpi-grid">
        {advancedKPIs
          .filter((k) => isValid(getLatestValue(k)))
          .map((k) => (
            <motion.div
              key={k}
              className="dashboard-kpi-card clickable"
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedKpi(k)}
            >
              <h4>{k.toUpperCase()}</h4>
              <p>{formatValue(getLatestValue(k))}</p>
              <small className="trace-hint"></small>
            </motion.div>
          ))}
      </div>

      {/* ================= RATIOS ================= */}
      <h3 className="section-title">Financial Ratios</h3>

      {Object.entries(ratioGroups).map(([group, items]) => {
        const validItems = items.filter((k) =>
          isValid(getLatestValue(k))
        );

        if (validItems.length === 0) return null;

        return (
          <div key={group}>
            <h4 className="ratio-group-title">
              {group.toUpperCase()}
            </h4>

            <div className="dashboard-kpi-grid">
              {validItems.map((k) => (
                <motion.div
                  key={k}
                  className="dashboard-kpi-card clickable"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedKpi(k)}
                >
                  <h4>{k.toUpperCase()}</h4>
                  <p>{formatValue(getLatestValue(k))}</p>
                  <small className="trace-hint">
                    
                  </small>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ================= MODERN CHART ================= */}
      <h3 className="section-title">Revenue & Profit Trend</h3>

      {records.length > 0 ? (
        <Plot
          data={[
            {
              x: chartX,
              y: chartRevenue,
              type: "scatter",
              mode: "lines",
              name: "Revenue",
              line: {
                color: "#6366f1",
                width: 3,
                shape: "spline", // smooth curve 🔥
              },
              fill: "tozeroy",
              fillcolor: "rgba(99,102,241,0.15)", // gradient feel
            },
            {
              x: chartX,
              y: chartProfit,
              type: "scatter",
              mode: "lines",
              name: "Profit",
              line: {
                color: "#22c55e",
                width: 3,
                shape: "spline",
              },
            },
          ]}
          layout={{
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#ffffff",
            margin: { l: 40, r: 20, t: 20, b: 40 },

            xaxis: {
              showgrid: false,
              tickfont: { color: "#6b7280" },
            },

            yaxis: {
              gridcolor: "#f1f5f9",
              tickfont: { color: "#6b7280" },
            },

            legend: {
              orientation: "h",
              y: 1.1,
            },

            hovermode: "x unified", // 🔥 better tooltip
          }}
          config={{ displayModeBar: false }}
          style={{
            width: "100%",
            height: "420px",
            borderRadius: "16px",
          }}
        />
      ) : (
        <p className="muted-text">No data available for charts.</p>
      )}

      {/* ================= TRACE MODAL ================= */}
      <AnimatePresence>
        {selectedKpi && (
          <motion.div
            className="trace-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedKpi(null)}
          >
            <motion.div
              className="trace-modal"
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>🔍 Traceability: {selectedKpi.toUpperCase()}</h3>

              {getTraceForKpi(selectedKpi).length === 0 ? (
                <p>No source info available.</p>
              ) : (
                getTraceForKpi(selectedKpi).map((t, i) => (
                  <div key={i} className="trace-card">
                    <p><strong>Source:</strong> {t.source_type}</p>
                    <p><strong>Page:</strong> {t.page_number}</p>
                    <p>
                      <strong>Confidence:</strong>{" "}
                      {(t.confidence * 100).toFixed(1)}%
                    </p>
                    <p>"{t.matched_text}"</p>
                  </div>
                ))
              )}

              <button onClick={() => setSelectedKpi(null)}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}