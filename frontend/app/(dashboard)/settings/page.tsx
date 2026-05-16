"use client";
import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { getUser, setAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });

  useEffect(() => {
    const u = getUser();
    if (u) setForm((f) => ({ ...f, username: u.username }));
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const payload: any = {};
      if (form.username) payload.username = form.username;
      if (form.password) payload.password = form.password;
      const updated = await authApi.update(payload);
      // update localStorage user
      try {
        const token = document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith("refresh_token="))?.split("=")[1];
        // preserve token if available
        if (token) {
          setAuth(token, updated);
        } else {
          localStorage.setItem("user", JSON.stringify(updated));
        }
      } catch {
        localStorage.setItem("user", JSON.stringify(updated));
      }
      setSuccess("Settings saved")
    } catch (e: any) {
      setError(e.message || "Failed to update settings");
    } finally {
      setLoading(false);
      setForm((f) => ({ ...f, password: "" }));
    }
  };

  return (
    <div className="max-w-2xl">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300">Username</Label>
            <Input value={form.username} onChange={(e) => set("username", e.target.value)} className="bg-gray-800 border-gray-700 text-white" />
          </div>

          <div>
            <Label className="text-gray-300">New Password</Label>
            <Input value={form.password} onChange={(e) => set("password", e.target.value)} type="password" className="bg-gray-800 border-gray-700 text-white" />
            <p className="text-xs text-gray-500 mt-1">Leave blank to keep your current password.</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
