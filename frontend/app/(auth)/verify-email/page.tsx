"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await authApi.verifyEmail({ email, code: fullCode });
      setAuth(data.access_token, data.user);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message);
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp(email);
      setCountdown(60);
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="text-gray-400">
            We sent a 6-digit code to <span className="text-blue-400">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input Grid */}
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-2xl font-bold bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            ))}
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={loading || code.join("").length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in <span className="text-gray-300">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-blue-400 hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>

          <p className="text-xs text-gray-600 text-center">
            Wrong email?{" "}
            <a href="/register" className="text-blue-400 hover:underline">Go back</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}