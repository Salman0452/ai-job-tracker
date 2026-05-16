"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  setLoading(true);
  setError("");
  try {
    await authApi.register(form);
    // Redirect to verify page with email in query
    router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
  } catch (e: any) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-30 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl opacity-30 translate-y-1/2"></div>
      </div>

      <Card className="w-full max-w-md bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-slate-700/50 text-white backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Job Tracker</span>
          </div>
          <div className="pt-2">
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription className="text-slate-400">Start tracking smarter</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "email", label: "Email", type: "email", placeholder: "you@example.com" },
            { key: "username", label: "Username", type: "text", placeholder: "johndoe" },
            { key: "password", label: "Password", type: "password", placeholder: "••••••••" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} className="space-y-2">
              <Label className="text-slate-300 font-medium">{label}</Label>
              <Input type={type} placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all" />
            </div>
          ))}
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium shadow-lg hover:shadow-blue-500/50">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-sm text-slate-400 text-center">
            Have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}