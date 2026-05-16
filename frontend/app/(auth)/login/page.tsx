"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authApi.login(email, password);
      setAuth(data.access_token, data.user);
      router.push("/dashboard");
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
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">Sign in to your AI Job Tracker account</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300 font-medium">Email</Label>
            <Input value={email} type="email" onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300 font-medium">Password</Label>
            <Input value={password} type="password" onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all" placeholder="••••••••" />
          </div>
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium shadow-lg hover:shadow-blue-500/50">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-sm text-slate-400 text-center">
            No account?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Create one</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}