"use client";
import { useEffect, useRef, useState } from "react";
import { resumeApi } from "@/lib/api";
import { Resume } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, Star, FileText } from "lucide-react";

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchResumes = () => resumeApi.list().then(setResumes).catch(console.error);

  useEffect(() => { fetchResumes(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      await resumeApi.upload(file);
      fetchResumes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSetPrimary = async (id: number) => {
    await resumeApi.setPrimary(id);
    fetchResumes();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await resumeApi.delete(id);
      fetchResumes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Resume</h1>
          <p className="text-slate-400">Manage your resumes. Primary resume is used for AI analysis.</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg hover:shadow-blue-500/50">
            <Upload size={18} className="mr-2" />
            {uploading ? "Uploading..." : "Upload PDF"}
          </Button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

      {resumes.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-800/20">
          <FileText size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg font-medium">No resumes uploaded yet.</p>
          <Button onClick={() => fileRef.current?.click()} variant="outline"
            className="mt-6 border-slate-700 text-slate-300 hover:bg-slate-800/50 font-medium">
            Upload your first resume
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <Card key={resume.id} className={`bg-gradient-to-br from-slate-800/30 to-slate-900/30 border transition-all ${resume.is_primary ? "border-blue-500/50 shadow-lg shadow-blue-500/10" : "border-slate-700/50 hover:border-slate-600/50"}`}>
              <CardContent className="pt-4 flex items-center justify-between group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-semibold truncate group-hover:text-blue-300 transition-colors">{resume.filename}</p>
                    <p className="text-xs text-slate-500">
                      Uploaded {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {resume.is_primary && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium flex-shrink-0">
                      <Star size={12} className="mr-1" /> Primary
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!resume.is_primary && (
                    <Button size="sm" variant="outline"
                      onClick={() => handleSetPrimary(resume.id)}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800/50 text-xs font-medium">
                      <Star size={14} className="mr-1" /> Set Primary
                    </Button>
                  )}
                  {!resume.is_primary && (
                    <Button size="sm" variant="ghost"
                      onClick={() => handleDelete(resume.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}