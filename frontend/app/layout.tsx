import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Job Tracker",
  description: "Track your job applications with AI-powered insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}