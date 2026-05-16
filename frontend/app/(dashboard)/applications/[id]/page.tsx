"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { applicationApi, aiApi } from "@/lib/api";
import { Application, AIResult, ApplicationStatus } from "@/types";
import { usePolling } from "@/hooks/usePolling";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "@/components/applications/StatusBadge";
import { ArrowLeft, Brain, Copy, CheckCheck } from "lucide-react";
import Link from "next/link";

const statuses: ApplicationStatus[] = ["saved", "applied", "interview", "offer", "rejected"];

const importanceColor: Record<string, string> = {
  critical: "border-red-500 bg-red-500/10",
  important: "border-yellow-500 bg-yellow-500/10",
  nice_to_have: "border-gray-500 bg-gray-500/10",
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const appId = parseInt(id as string);

  const [app, setApp] = useState<Application | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPolling = analyzing || aiResult?.processing_status === "processing" ||
    aiResult?.processing_status === "pending";

  const fetchAIResult = async () => {
    try {
      const result = await aiApi.results(appId);
      setAiResult(result);
      if (result.processing_status === "completed" || result.processing_status === "failed") {
        setAnalyzing(false);
      }
    } catch {
      // No result yet
    }
  };

  useEffect(() => {
    applicationApi.get(appId).then(setApp).catch(() => router.push("/applications"));
    fetchAIResult();
  }, [appId]);

  usePolling(fetchAIResult, 3000, isPolling);

  const handleStatusChange = async (status: ApplicationStatus | null) => {
    if (!status) return;
    const updated = await applicationApi.update(appId, { status });
    setApp(updated);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      await aiApi.trigger(appId);
      await fetchAIResult();
    } catch (e: any) {
      alert(e.message);
      setAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (aiResult?.cover_letter) {
      navigator.clipboard.writeText(aiResult.cover_letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!app) return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-900 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/applications">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <ArrowLeft size={16} className="mr-1" /> Back
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-5 flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">{app.company_name}</h1>
          <p className="text-gray-400">{app.job_title}</p>
          {app.job_url && (
            <a href={app.job_url} target="_blank" rel="noreferrer"
              className="text-xs text-blue-400 hover:underline">{app.job_url}</a>
          )}
        <div className="flex items-center gap-3">
          <Select value={app.status} onValueChange={(value: ApplicationStatus | null) => { if (value) { void handleStatusChange(value); } }}>
            <SelectTrigger className="w-36 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="text-white capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        </div>
      </div>

      {/* AI Trigger */}
      {!aiResult && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Run AI Analysis</p>
            <p className="text-sm text-gray-400">Score your resume, generate cover letter, identify skill gaps.</p>
          </div>
          <Button onClick={handleAnalyze} disabled={analyzing} className="bg-blue-600 hover:bg-blue-700">
            <Brain size={16} className="mr-2" />
            {analyzing ? "Starting..." : "Analyze"}
          </Button>
        </div>
      )}

      {/* Processing state */}
      {aiResult && isPolling && (
        <div className="bg-gray-900 border border-blue-800 rounded-xl px-6 py-5 space-y-3">
          <p className="text-blue-400 font-medium">AI Analysis in progress...</p>
          <Progress value={null} className="animate-pulse" />
          <p className="text-xs text-gray-500">This takes 15-30 seconds. Results update automatically.</p>
        </div>
      )}

      {/* Failed state */}
      {aiResult?.processing_status === "failed" && (
        <div className="bg-gray-900 border border-red-800 rounded-xl px-6 py-5 flex items-center justify-between">
          <p className="text-red-400">Analysis failed. Try again.</p>
          <Button onClick={handleAnalyze} variant="outline" className="border-red-700 text-red-400 hover:bg-red-900/20">
            Retry
          </Button>
        </div>
      )}

      {/* Completed AI Results */}
      {aiResult?.processing_status === "completed" && (
        <Tabs defaultValue="score" className="space-y-4">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="score" className="data-[state=active]:bg-blue-600">Match Score</TabsTrigger>
            <TabsTrigger value="jd" className="data-[state=active]:bg-blue-600">JD Analysis</TabsTrigger>
            <TabsTrigger value="gaps" className="data-[state=active]:bg-blue-600">Skill Gaps</TabsTrigger>
            <TabsTrigger value="cover" className="data-[state=active]:bg-blue-600">Cover Letter</TabsTrigger>
          </TabsList>

          {/* Match Score Tab */}
          <TabsContent value="score">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="pt-6 flex flex-col items-center space-y-4">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#1f2937" strokeWidth="12" />
                      <circle cx="60" cy="60" r="50" fill="none"
                        stroke={aiResult.match_score! >= 70 ? "#16a34a" : aiResult.match_score! >= 50 ? "#ca8a04" : "#dc2626"}
                        strokeWidth="12"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - (aiResult.match_score! / 100))}`}
                        strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-3xl font-bold text-white">{aiResult.match_score}%</span>
                  </div>
                  <p className="text-sm text-gray-400 text-center">{aiResult.match_breakdown?.score_explanation}</p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-400 text-sm">Matched Skills</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {aiResult.match_breakdown?.matched_skills.map((s) => (
                      <Badge key={s} className="bg-green-900/40 text-green-300 border border-green-700">{s}</Badge>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-red-400 text-sm">Missing Required</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {aiResult.match_breakdown?.missing_required_skills.length ? (
                      aiResult.match_breakdown.missing_required_skills.map((s) => (
                        <Badge key={s} className="bg-red-900/40 text-red-300 border border-red-700">{s}</Badge>
                      ))
                    ) : <p className="text-sm text-gray-500">None — great match!</p>}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* JD Analysis Tab */}
          <TabsContent value="jd">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Required Skills", items: aiResult.jd_analysis?.required_skills, color: "bg-blue-900/40 text-blue-300 border-blue-700" },
                { label: "Nice to Have", items: aiResult.jd_analysis?.nice_to_have_skills, color: "bg-purple-900/40 text-purple-300 border-purple-700" },
                { label: "Culture Signals", items: aiResult.jd_analysis?.company_culture, color: "bg-yellow-900/40 text-yellow-300 border-yellow-700" },
                { label: "Key Responsibilities", items: aiResult.jd_analysis?.key_responsibilities, color: "bg-gray-700 text-gray-300 border-gray-600" },
              ].map(({ label, items, color }) => (
                <Card key={label} className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-sm">{label}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {items?.map((item) => (
                      <Badge key={item} className={`border ${color}`}>{item}</Badge>
                    ))}
                  </CardContent>
                </Card>
              ))}
              <Card className="bg-gray-900 border-gray-800 col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm">{aiResult.jd_analysis?.summary}</p>
                  <div className="flex gap-4 mt-3">
                    <Badge className="bg-gray-800 text-gray-300 capitalize">
                      {aiResult.jd_analysis?.seniority_level}
                    </Badge>
                    <Badge className="bg-gray-800 text-gray-300 capitalize">
                      {aiResult.jd_analysis?.employment_type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Skill Gaps Tab */}
          <TabsContent value="gaps">
            <div className="space-y-3">
              {aiResult.skill_gaps?.gaps.length ? (
                aiResult.skill_gaps.gaps.map((gap) => (
                  <div key={gap.skill}
                    className={`border rounded-xl px-5 py-4 space-y-2 ${importanceColor[gap.importance] || "border-gray-700 bg-gray-900"}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">{gap.skill}</h3>
                      <Badge className="capitalize bg-gray-800 text-gray-300">{gap.importance.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-gray-300">{gap.learning_resource}</p>
                    <p className="text-xs text-gray-500">Estimated time: {gap.estimated_time}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No skill gaps identified. Strong match.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Cover Letter Tab */}
          <TabsContent value="cover">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-base">Generated Cover Letter</CardTitle>
                <Button size="sm" variant="outline" onClick={handleCopy}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800">
                  {copied ? <><CheckCheck size={14} className="mr-1" /> Copied</> : <><Copy size={14} className="mr-1" /> Copy</>}
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {aiResult.cover_letter}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Re-analyze button if completed */}
      {aiResult?.processing_status === "completed" && (
        <Button onClick={handleAnalyze} disabled={analyzing}
          variant="outline" className="border-gray-700 text-gray-400 hover:bg-gray-800">
          <Brain size={16} className="mr-2" /> Re-analyze
        </Button>
      )}
    </div>
  );
}