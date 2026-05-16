"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { applicationApi, resumeApi } from "@/lib/api";
import { Resume } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewApplicationPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    company_name: "",
    job_title: "",
    job_description: "",
    job_url: "",
    resume_id: "",
    notes: "",
  });

  useEffect(() => {
    resumeApi.list().then(setResumes).catch(console.error);
  }, []);

  const set = (key: string, value: string | null) => setForm((f) => ({ ...f, [key]: value ?? "" }));

  const handleSubmit = async () => {
    if (!form.company_name || !form.job_title || !form.job_description) {
      setError("Company, job title, and job description are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload: any = {
        company_name: form.company_name,
        job_title: form.job_title,
        job_description: form.job_description,
        job_url: form.job_url || undefined,
        notes: form.notes || undefined,
        resume_id: form.resume_id ? parseInt(form.resume_id) : undefined,
      };
      const app = await applicationApi.create(payload);
      router.push(`/applications/${app.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">New Application</h1>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white text-base">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-gray-300">Company Name *</Label>
              <Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)}
                placeholder="e.g. Stripe" className="bg-gray-800 border-gray-700 text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-gray-300">Job Title *</Label>
              <Input value={form.job_title} onChange={(e) => set("job_title", e.target.value)}
                placeholder="e.g. Backend Engineer" className="bg-gray-800 border-gray-700 text-white" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300">Job URL</Label>
            <Input value={form.job_url} onChange={(e) => set("job_url", e.target.value)}
              placeholder="https://..." className="bg-gray-800 border-gray-700 text-white" />
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300">Job Description *</Label>
            <Textarea value={form.job_description} onChange={(e) => set("job_description", e.target.value)}
              placeholder="Paste the full job description here..."
              className="bg-gray-800 border-gray-700 text-white min-h-48 resize-none" />
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300">Resume</Label>
            <Select value={form.resume_id} onValueChange={(v) => set("resume_id", v)} disabled={loading}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                {form.resume_id ? (
                  <SelectValue>
                    {resumes.find((r) => String(r.id) === form.resume_id)?.filename ?? "Unknown resume"}
                  </SelectValue>
                ) : (
                  <SelectValue placeholder="Use primary resume (default)" />
                )}
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)} className="text-white">
                    {r.filename} {r.is_primary ? "(primary)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="Any notes about this application..."
              className="bg-gray-800 border-gray-700 text-white min-h-24 resize-none" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? "Saving..." : "Save Application"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}