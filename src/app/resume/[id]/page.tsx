"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, FileWarning, LoaderCircle } from "lucide-react";
import ATS from "@/components/ATS";
import Details from "@/components/Details";
import Summary from "@/components/Summary";
import NavBar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePuterStore } from "@/lib/puter";

export default function ResumeReportPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { auth, isLoading, fs, kv } = usePuterStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) router.replace(`/auth?next=/resume/${id}`);
  }, [auth.isAuthenticated, id, isLoading, router]);

  useEffect(() => {
    let active = true;
    let localResumeUrl: string | null = null;
    let localImageUrl: string | null = null;

    const fetchResumeData = async () => {
      try {
        const resumeData = await kv.get(`resume:${id}`);
        if (!resumeData) throw new Error("not-found");
        const data = JSON.parse(resumeData) as Resume & { jobDescription?: string };
        const [resumeBlob, imageBlob] = await Promise.all([fs.read(data.resumePath), fs.read(data.imagePath)]);
        if (!resumeBlob || !imageBlob) throw new Error("files-unavailable");

        localResumeUrl = URL.createObjectURL(new Blob([resumeBlob], { type: "application/pdf" }));
        localImageUrl = URL.createObjectURL(new Blob([imageBlob], { type: "image/png" }));
        if (!active) return;

        setResumeUrl(localResumeUrl);
        setImageUrl(localImageUrl);
        setFeedback(data.feedback || null);
        setJobDescription(data.jobDescription || "No job description provided.");
        setCompanyName(data.companyName || "Company not specified");
        setJobTitle(data.jobTitle || "Role not specified");
      } catch {
        if (active) setError("This review could not be loaded. It may have been removed or its Puter files are unavailable.");
      }
    };

    fetchResumeData();
    return () => {
      active = false;
      if (localResumeUrl) URL.revokeObjectURL(localResumeUrl);
      if (localImageUrl) URL.revokeObjectURL(localImageUrl);
    };
  }, [fs, id, kv]);

  if (error) {
    return <div className="min-h-screen"><NavBar /><main className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-24 text-center"><div className="rounded-full bg-destructive/10 p-4 text-destructive"><FileWarning className="size-7" /></div><div><h1 className="text-2xl font-semibold">Review unavailable</h1><p className="mt-2 text-muted-foreground">{error}</p></div><Button asChild><Link href="/"><ArrowLeft className="size-4" />Back to dashboard</Link></Button></main></div>;
  }

  if (!feedback || !imageUrl || !resumeUrl) {
    return <div className="min-h-screen"><NavBar /><main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center" aria-live="polite"><LoaderCircle className="size-8 animate-spin text-primary motion-reduce:animate-none" /><h1 className="text-xl font-semibold">Loading your report</h1><p className="text-sm text-muted-foreground">Retrieving the saved resume and AI feedback from Puter.</p></main></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-2"><Button variant="ghost" asChild className="-ml-3"><Link href="/"><ArrowLeft className="size-4" />Back to dashboard</Link></Button><p className="text-sm font-medium text-primary">Resume review</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{jobTitle}</h1><p className="text-muted-foreground">{companyName}</p></div>
          <Button variant="outline" asChild><a href={resumeUrl} target="_blank" rel="noopener noreferrer">Open original PDF<ExternalLink className="size-4" /></a></Button>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Review scores">
          {[
            ["Overall", feedback.overallScore],
            ["ATS", feedback.ATS.score],
            ["Content", feedback.content.score],
            ["Skills", feedback.skills.score],
          ].map(([label, score]) => <Card key={String(label)}><CardHeader className="pb-3"><CardDescription>{label}</CardDescription><CardTitle className="text-3xl">{Number(score)}/100</CardTitle></CardHeader><CardContent><Progress value={Number(score)} /></CardContent></Card>)}
        </section>

        <section className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="overflow-hidden lg:sticky lg:top-24"><CardHeader><CardTitle className="text-lg">Resume preview</CardTitle><CardDescription>First-page preview generated by the existing PDF pipeline.</CardDescription></CardHeader><CardContent><Image src={imageUrl} alt={`Preview of resume for ${jobTitle}`} width={800} height={1100} className="h-auto w-full rounded-lg border object-contain" unoptimized /></CardContent></Card>
          <div className="min-w-0 space-y-6"><Summary feedback={feedback} jobDescription={jobDescription} /><ATS score={feedback.ATS.score} suggestions={feedback.ATS.tips} /><Details feedback={feedback} /></div>
        </section>
      </main>
    </div>
  );
}
