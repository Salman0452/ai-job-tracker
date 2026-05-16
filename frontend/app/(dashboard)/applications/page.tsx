"use client";
import { useEffect, useState } from "react";
import { applicationApi } from "@/lib/api";
import { Application, ApplicationStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/applications/StatusBadge";
import Link from "next/link";
import { Plus, Search, Trash2, ExternalLink } from "lucide-react";

const statuses: ApplicationStatus[] = ["saved", "applied", "interview", "offer", "rejected"];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const data = await applicationApi.list(params);
      setApplications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [statusFilter]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") fetchApplications();
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Delete this application?")) return;
    await applicationApi.delete(id);
    fetchApplications();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Applications</h1>
          <p className="text-slate-400">{applications.length} total applications tracked</p>
        </div>
        <Link href="/applications/new">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg hover:shadow-blue-500/50">
            <Plus size={18} className="mr-2" /> New Application
          </Button>
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search company or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 pl-10 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-slate-800/50 border-slate-700/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700/50">
            <SelectItem value="all" className="text-white">All statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s} className="text-white capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-xl animate-pulse border border-slate-700/30" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-24">
          <div className="space-y-4">
            <div className="text-6xl">📭</div>
            <p className="text-slate-400 text-lg">No applications found.</p>
            <Link href="/applications/new">
              <Button className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg hover:shadow-blue-500/50">Add your first application</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id}
              className="group bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/50 rounded-xl px-6 py-4 hover:border-slate-600/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer"
              onClick={() => window.location.href = `/applications/${app.id}`}>
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-semibold group-hover:text-blue-300 transition-colors truncate">{app.company_name}</h3>
                    {app.job_url && (
                      <a href={app.job_url} target="_blank" rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-500 hover:text-blue-400 flex-shrink-0 transition-colors">
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 truncate">{app.job_title}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {app.applied_date ? `Applied ${app.applied_date}` : `Saved ${new Date(app.created_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  <StatusBadge status={app.status} />
                  <button onClick={(e) => handleDelete(app.id, e)}
                    className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}