"use client";
import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  saved: "#4b5563",
  applied: "#2563eb",
  interview: "#d97706",
  offer: "#16a34a",
  rejected: "#dc2626",
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    analyticsApi.summary().then(setSummary).catch(console.error);
    analyticsApi.skills().then((d) => setSkills(d.top_skills.slice(0, 10))).catch(console.error);
    analyticsApi.timeline().then((d) => setTimeline(d.timeline)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400">Insights from your job search activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Pie */}
        <Card className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-700/30">
            <CardTitle className="text-white text-lg font-semibold">Application Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {summary?.by_status.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={summary.by_status} dataKey="count" nameKey="status"
                    cx="50%" cy="50%" outerRadius={80} label={({ status, count }) => `${status}: ${count}`}>
                    {summary.by_status.map((entry: any) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", color: "#fff", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-500 text-sm py-10 text-center">No data yet.</p>}
          </CardContent>
        </Card>

        {/* Top Skills Bar */}
        <Card className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-700/50 shadow-lg">
          <CardHeader className="border-b border-slate-700/30">
            <CardTitle className="text-white text-lg font-semibold">Most In-Demand Skills</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {skills.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={skills} layout="vertical" margin={{ left: 40 }}>
                  <XAxis type="number" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis type="category" dataKey="skill" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", color: "#fff", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-500 text-sm py-10 text-center">Run AI analyses to see skill demand.</p>}
          </CardContent>
        </Card>

        {/* Timeline Line */}
        <Card className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-700/50 shadow-lg lg:col-span-2">
          <CardHeader className="border-b border-slate-700/30">
            <CardTitle className="text-white text-lg font-semibold">Applications Over Time (Weekly)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {timeline.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", color: "#fff", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-500 text-sm py-10 text-center">No timeline data yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}