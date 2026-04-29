// SAME IMPORTS (unchanged)
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

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await API.get("/files/history/1");
        setRecords(res.data.history || []);
      } catch (err) {
        console.error("Error fetching history:", err);
        setRecords([]);
      }
    }
    fetchHistory();
  }, []);

  const latestRecord =
    records.length > 0 ? records[records.length - 1] : {};

  const isNumber = (v) =>
    v !== null && v !== undefined && !isNaN(Number(v));

  const formatValue = (v) => {
    if (!isNumber(v)) return "—";
    return Number(v).toLocaleString();
  };

  const formatRatio = (v, isPercent = false) => {
    if (!isNumber(v)) return "—";
    return isPercent ? (v * 100).toFixed(2) + "%" : Number(v).toFixed(2);
  };

  const getLatestValue = (key) => {
    if (kpis && isNumber(kpis[key])) return kpis[key];
    if (latestRecord && isNumber(latestRecord[key])) return latestRecord[key];
    return null;
  };

  const getTraceForKpi = (kpiName) => {
    if (!Array.isArray(traces)) return [];
    return traces.filter((t) => t.kpi_name === kpiName);
  };

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
      { key: "gross_margin", label: "Gross Margin", isPercent: true },
      { key: "operating_margin", label: "Operating Margin", isPercent: true },
      { key: "ebitda_margin", label: "EBITDA Margin", isPercent: true },
      { key: "net_profit_margin", label: "Net Profit Margin", isPercent: true },
      { key: "roa", label: "ROA", isPercent: true },
      { key: "roe", label: "ROE", isPercent: true },
    ],
    liquidity: [
      { key: "current_ratio", label: "Current Ratio" },
      { key: "quick_ratio", label: "Quick Ratio" },
    ],
    leverage: [{ key: "debt_to_equity", label: "Debt to Equity" }],
  };

  const chartX = records.map((r) => r.upload_date || "");
  const chartRevenue = records.map((r) =>
    isNumber(r.revenue) ? r.revenue : 0
  );
  const chartProfit = records.map((r) =>
    isNumber(r.profit) ? r.profit : 0
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

      <h3 className="section-title">Basic KPIs</h3>
      <div className="dashboard-kpi-grid">
        {basicKPIs.map((k) => (
          <motion.div
            key={k}
            className="dashboard-kpi-card clickable"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedKpi(k)}
          >
            <h4>{k.toUpperCase()}</h4>
            <p>{formatValue(getLatestValue(k))}</p>
            <small className="trace-hint">Click for source</small>
          </motion.div>
        ))}
      </div>

      <h3 className="section-title">Advanced KPIs</h3>
      <div className="dashboard-kpi-grid">
        {advancedKPIs.map((k) => (
          <motion.div
            key={k}
            className="dashboard-kpi-card clickable"
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedKpi(k)}
          >
            <h4>{k.toUpperCase()}</h4>
            <p>{formatValue(getLatestValue(k))}</p>
            <small className="trace-hint">Click for source</small>
          </motion.div>
        ))}
      </div>

      <h3 className="section-title">Financial Ratios</h3>

      {Object.entries(ratioGroups).map(([group, items]) => (
        <div key={group}>
          <h4 className="ratio-group-title">{group.toUpperCase()}</h4>
          <div className="dashboard-kpi-grid">
            {items.map((item) => (
              <motion.div
  key={item.key}
  className="dashboard-kpi-card card clickable"
  whileHover={{ scale: 1.05 }}
  onClick={() => setSelectedKpi(item.key)}
>
  <div className="kpi-top">
    <span className="kpi-title">{item.key.toUpperCase()}</span>
    <span className="kpi-icon">📊</span>
  </div>

  <p className="kpi-value">{formatValue(getLatestValue(item.key))}</p>

  <small className="trace-hint">Click for details →</small>
</motion.div>
            ))}
          </div>
        </div>
      ))}

      <h3 className="section-title">Revenue & Profit Trend</h3>

      {records.length > 0 ? (
        <Plot
          data={[
            {
              x: chartX,
              y: chartRevenue,
              type: "scatter",
              mode: "lines+markers",
              name: "Revenue",
              line: { color: "#2563EB", width: 3 }, // blue
            },
            {
              x: chartX,
              y: chartProfit,
              type: "bar",
              name: "Profit",
              marker: { color: "#1E3A8A" }, // dark blue
            },
          ]}
          layout={{
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#ffffff",
            font: { color: "#0f172a" },
            xaxis: { title: "Upload Date" },
            yaxis: { title: "Amount" },
          }}
          style={{ width: "100%", height: "420px" }}
        />
      ) : (
        <p className="muted-text">No data available for charts.</p>
      )}

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
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>🔍 Traceability: {selectedKpi.toUpperCase()}</h3>

              {getTraceForKpi(selectedKpi).length === 0 ? (
                <p className="muted-text">
                  No source information available for this KPI.
                </p>
              ) : (
                getTraceForKpi(selectedKpi).map((t, idx) => (
                  <div key={idx} className="trace-card">
                    <p><strong>Source:</strong> {t.source_type}</p>
                    <p><strong>Page:</strong> {t.page_number}</p>
                    <p><strong>Confidence:</strong> {(t.confidence * 100).toFixed(1)}%</p>
                    <p className="trace-text">"{t.matched_text}"</p>
                  </div>
                ))
              )}

              <button
                className="close-btn"
                onClick={() => setSelectedKpi(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}