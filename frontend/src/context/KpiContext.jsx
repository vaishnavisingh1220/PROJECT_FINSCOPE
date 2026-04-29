// src/context/KpiContext.jsx
import React, { createContext, useState } from "react";
import { analyzeFinancialReport } from "../services/api";

/**
 * KpiContext
 * -------------
 * Global shared state for:
 * 1) Latest extracted KPIs
 * 2) KPI Traceability / Explainability data
 * 3) AI-generated Financial Insights
 *
 * Usage:
 * const {
 *   kpis,
 *   setKpis,
 *   traces,
 *   setTraces,
 *   insights,
 *   loading,
 *   analyzeReport
 * } = useContext(KpiContext);
 */

export const KpiContext = createContext({
  kpis: null,
  setKpis: () => {},
  traces: [],
  setTraces: () => {},
  insights: [],
  loading: false,
  analyzeReport: async () => {},
});

export function KpiProvider({ children }) {
  // Latest extracted KPIs
  const [kpis, setKpis] = useState(null);

  // Explainability / traceability info
  const [traces, setTraces] = useState([]);

  // AI-generated insights
  const [insights, setInsights] = useState([]);

  // Loading indicator
  const [loading, setLoading] = useState(false);

  /**
   * Trigger backend AI analysis
   * Fetches KPIs + insights together
   */
  const analyzeReport = async () => {
    try {
      setLoading(true);

      const response = await analyzeFinancialReport();

      // Expected backend response:
      // {
      //   kpis: {...},
      //   insights: [...]
      // }

      if (response?.data) {
        setKpis(response.data.kpis || null);
        setInsights(response.data.insights || []);
      }
    } catch (error) {
      console.error("Financial analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KpiContext.Provider
      value={{
        kpis,
        setKpis,
        traces,
        setTraces,
        insights,
        setInsights,
        loading,
        analyzeReport,
      }}
    >
      {children}
    </KpiContext.Provider>
  );
}

export default KpiProvider;
