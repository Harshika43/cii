"use client";
import { useState, useEffect } from "react";
import { dbGetOrgResults } from "@/lib/db/results";
import { getProfile } from "@/constants/profiles";
import { AVG_BENCHMARK } from "@/constants/dimensions";
import type { ResultRow } from "@/types/results";
import type { DeptStats } from "@/types/organization";

const DIM_KEYS = ["dim_divergent","dim_assoc","dim_risk","dim_vision","dim_behavior","dim_innovation"] as const;

export function useOrganization(orgId?: string | null) {
  const [results,  setResults]  = useState<ResultRow[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!orgId) { setLoading(false); return; }
    setLoading(true);
    dbGetOrgResults(orgId)
      .then(data => setResults((data || []) as ResultRow[]))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [orgId]);

  const totalEmployees = results.length;
  const avgCII = totalEmployees
    ? Math.round(results.reduce((s, r) => s + r.cii_score, 0) / totalEmployees)
    : 0;
  const orgProfile = getProfile(avgCII);

  const avgDims = DIM_KEYS.map(k =>
    totalEmployees
      ? Math.round(results.reduce((s, r) => s + (r[k] || 0), 0) / totalEmployees)
      : 0
  );

  const deptMap: Record<string, ResultRow[]> = {};
  results.forEach(r => {
    const d = r.department || "Other";
    if (!deptMap[d]) deptMap[d] = [];
    deptMap[d].push(r);
  });
  const deptStats: DeptStats[] = Object.entries(deptMap)
    .map(([dept, rows]) => ({
      dept,
      count:   rows.length,
      avgCII:  Math.round(rows.reduce((s, r) => s + r.cii_score, 0) / rows.length),
      avgDims: DIM_KEYS.map(k => Math.round(rows.reduce((s, r) => s + (r[k] || 0), 0) / rows.length)),
    }))
    .sort((a, b) => b.avgCII - a.avgCII);

  const profileDist = [
    { name: "Visionary Innovator",   color: "#1A6FC4", range: "85–100" },
    { name: "Creative Catalyst",     color: "#0D9E6E", range: "70–84"  },
    { name: "Adaptive Innovator",    color: "#6B3FA0", range: "55–69"  },
    { name: "Structured Thinker",    color: "#F07C1A", range: "40–54"  },
    { name: "Conventional Executor", color: "#6b8aaa", range: "0–39"   },
  ].map(p => ({
    ...p,
    count: results.filter(r => r.profile_name === p.name).length,
  }));

  const topPerformers   = [...results].sort((a, b) => b.cii_score - a.cii_score).slice(0, 5);
  const hiddenCreatives = results.filter(r => r.dim_divergent > 65 && r.dim_vision > 65 && r.cii_score < 55).slice(0, 4);
  const aboveAvgDims    = avgDims.filter((d, i) => d > AVG_BENCHMARK[i]).length;
  const riskAversionPct = Math.round(results.filter(r => (r.dim_risk || 0) < 45).length / Math.max(totalEmployees, 1) * 100);
  const visionBehaviorGap = avgDims[3] - avgDims[4];

  return {
    results, loading,
    totalEmployees, avgCII, orgProfile, avgDims,
    deptStats, profileDist,
    topPerformers, hiddenCreatives,
    aboveAvgDims, riskAversionPct, visionBehaviorGap,
  };
}
