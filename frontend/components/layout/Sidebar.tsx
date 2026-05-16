"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Briefcase, FileText,
  BarChart2, Settings, LogOut, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/50 flex flex-col fixed left-0 top-0 shadow-2xl">
      <div className="px-6 py-6 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Job Tracker</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
              pathname.startsWith(href)
                ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            )}>
            <Icon size={18} className="group-hover:scale-110 transition-transform" />
            {label}
          </Link>
        ))}

        {user?.role === "admin" && (
          <Link href="/admin"
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
              pathname.startsWith("/admin")
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
            )}>
            <Shield size={18} className="group-hover:scale-110 transition-transform" />
            Admin
          </Link>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-slate-800/50 backdrop-blur-sm space-y-3">
        {mounted && (
          <div className="px-4 py-2 bg-slate-800/30 rounded-lg border border-slate-700/30">
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        )}
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/30 group">
          <LogOut size={18} className="group-hover:scale-110 transition-transform" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}