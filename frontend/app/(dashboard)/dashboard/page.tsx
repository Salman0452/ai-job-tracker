"use client";
import { useEffect, useState } from "react";
import { analyticsApi, applicationApi } from "@/lib/api";
import { AnalyticsSummary, Application } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, TrendingUp, Brain, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const statusColors: Record<string, string> = {
  saved: "bg-gray-600",
  applied: "bg-blue-600",
  interview: "bg-yellow-600",
  offer: "bg-green-600",
  rejected: "bg-red-600",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recent, setRecent] = useState<Application[]>([]);

  useEffect(() => {
    analyticsApi.summary().then(setSummary).catch(console.error);
    applicationApi.list().then((apps) => setRecent(apps.slice(0, 5))).catch(console.error);
  }, []);

  const statCards = [
    { label: "Total Applications", value: summary?.total_applications ?? 0, icon: Briefcase, color: "text-blue-400" },
    { label: "Avg Match Score", value: summary ? `${summary.average_match_score}%` : "—", icon: TrendingUp, color: "text-green-400" },
    { label: "AI Analyses Run", value: summary?.total_ai_analyses ?? 0, icon: Brain, color: "text-purple-400" },
    { label: "Offers", value: summary?.by_status.find(s => s.status === "offer")?.count ?? 0, icon: CheckCircle, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">Welcome back, {user?.username}</h1>
        <p className="text-slate-400">Here is your job search overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 font-medium">{label}</p>
                  <p className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</p>
                </div>
                <div className={`p-3 bg-slate-700/30 rounded-lg ${color}`}>
                  <Icon size={28} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 shadow-lg">
          <CardHeader className="pb-4 border-b border-slate-700/30">
            <CardTitle className="text-white text-lg font-semibold">Pipeline Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {summary?.by_status.length ? summary.by_status.map(({ status, count }) => (
              <div key={status} className="flex items-center justify-between group hover:bg-slate-700/20 px-3 py-2 rounded-lg transition-colors">
                <Badge className={`${statusColors[status] || "bg-slate-600"} font-medium capitalize text-sm`}>
                  {status}
                </Badge>
                <span className="text-white font-semibold text-lg">{count}</span>
              </div>
            )) : <p className="text-slate-500 text-sm">No applications yet.</p>}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 shadow-lg">
          <CardHeader className="pb-4 border-b border-slate-700/30 flex flex-row items-center justify-between">
            <CardTitle className="text-white text-lg font-semibold">Recent Applications</CardTitle>
            <Link href="/applications" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">View all →</Link>
          </CardHeader>
          <CardContent className="pt-6 space-y-2">
            {recent.length ? recent.map((app) => (
              <Link key={app.id} href={`/applications/${app.id}`}
                className="flex items-center justify-between hover:bg-slate-700/30 px-3 py-3 rounded-lg transition-colors group">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white font-medium group-hover:text-blue-300 transition-colors truncate">{app.company_name}</p>
                  <p className="text-xs text-slate-400 truncate">{app.job_title}</p>
                </div>
                <Badge className={`${statusColors[app.status] || "bg-slate-600"} font-medium text-xs flex-shrink-0 ml-2 capitalize`}>{app.status}</Badge>
              </Link>
            )) : <p className="text-slate-500 text-sm">No applications yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}