import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="min-h-screen bg-gradient-to-b from-transparent via-slate-900/30 to-slate-950">
          <div className="p-8 space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}