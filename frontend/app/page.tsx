import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileSearch, TrendingUp, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-30 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl opacity-30 translate-x-1/3"></div>
      </div>

      <nav className="relative border-b border-slate-800/50 px-8 py-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Job Tracker</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/50">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-8 py-32 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold leading-tight tracking-tight">
            Track Applications.<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Let AI Do the Heavy Lifting.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Paste a job description. Get instant resume scoring, skill gap analysis, and a personalized cover letter — all powered by AI.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 font-medium shadow-lg hover:shadow-blue-500/50">
              Start Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white px-8 font-medium backdrop-blur-sm">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {[
            { title: "JD Analysis", desc: "Extract required skills, seniority level, and culture signals from any job posting.", icon: FileSearch, color: "text-blue-400" },
            { title: "Resume Scoring", desc: "Get an ATS match score with a breakdown of strengths and gaps.", icon: TrendingUp, color: "text-cyan-400" },
            { title: "Cover Letters", desc: "Generate tailored cover letters that speak directly to the role.", icon: FileText, color: "text-emerald-400" },
          ].map((f) => (
            <div key={f.title} className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/50 rounded-xl p-6 space-y-4 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
              <div className={`w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${f.color}`}>
                <f.icon size={24} />
              </div>
              <h3 className="font-semibold text-lg text-white">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}