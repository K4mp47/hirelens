"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileCheck2, FileSearch2, Plus, Sparkles } from "lucide-react";
import NavBar from "@/components/NavBar";
import ResumeCard from "@/components/ResumeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePuterStore } from "@/lib/puter";

export default function Home() {
  const { auth, isLoading, kv } = usePuterStore();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) router.replace("/auth?next=/");
  }, [auth.isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    let cancelled = false;

    const fetchResumes = async () => {
      setLoadingResumes(true);
      setLoadError(null);
      try {
        const stored = await kv.list("resume:*", true);
        const items = Array.isArray(stored) ? stored : [];
        const parsed = items.flatMap((item) => {
          if (typeof item === "string") return [];
          try { return [JSON.parse(item.value) as Resume]; } catch { return []; }
        });
        if (!cancelled) setResumes(parsed);
      } catch {
        if (!cancelled) setLoadError("Your previous reviews could not be loaded. Try refreshing the page.");
      } finally {
        if (!cancelled) setLoadingResumes(false);
      }
    };

    fetchResumes();
    return () => { cancelled = true; };
  }, [auth.isAuthenticated, kv]);

  const latestScore = useMemo(() => resumes[0]?.feedback?.overallScore ?? null, [resumes]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card className="overflow-hidden border-primary/20">
            <CardHeader className="max-w-3xl gap-4 p-6 sm:p-8">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-5" aria-hidden="true" /></div>
              <div className="space-y-2">
                <CardTitle className="text-3xl tracking-tight sm:text-4xl">Tailor your resume to the role before you apply.</CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7">Upload a PDF, add the job description, and receive an AI-assisted compatibility review powered by Puter.js.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-6 pb-6 sm:flex-row sm:px-8 sm:pb-8">
              <Button size="lg" asChild><Link href="/upload"><Plus className="size-4" />Start a new review</Link></Button>
              <Button size="lg" variant="outline" asChild><a href="#reviews">View previous reviews<ArrowRight className="size-4" /></a></Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Card><CardHeader><CardDescription>Saved reviews</CardDescription><CardTitle className="text-3xl">{loadingResumes ? "—" : resumes.length}</CardTitle></CardHeader></Card>
            <Card><CardHeader><CardDescription>Latest score</CardDescription><CardTitle className="text-3xl">{latestScore === null ? "—" : `${latestScore}/100`}</CardTitle></CardHeader></Card>
          </div>
        </section>

        <section aria-labelledby="workflow-title" className="space-y-4">
          <div><p className="text-sm font-medium text-primary">How it works</p><h2 id="workflow-title" className="text-2xl font-semibold tracking-tight">From PDF to actionable feedback</h2></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [FileSearch2, "Add your context", "Upload the existing PDF and paste the exact job description."],
              [Sparkles, "Run the analysis", "Puter.js compares the document with the role without requiring a paid AI API."],
              [FileCheck2, "Prioritize improvements", "Review the score, ATS feedback, strengths, and concrete corrections."],
            ].map(([Icon, title, description]) => {
              const ItemIcon = Icon as typeof FileSearch2;
              return <Card key={String(title)}><CardHeader><ItemIcon className="size-5 text-primary" aria-hidden="true" /><CardTitle className="text-lg">{String(title)}</CardTitle><CardDescription className="leading-6">{String(description)}</CardDescription></CardHeader></Card>;
            })}
          </div>
        </section>

        <section id="reviews" aria-labelledby="reviews-title" className="space-y-4 scroll-mt-24">
          <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-primary">History</p><h2 id="reviews-title" className="text-2xl font-semibold tracking-tight">Your resume reviews</h2></div></div>
          {loadError ? <Card className="border-destructive/40"><CardContent className="p-6 text-sm text-destructive">{loadError}</CardContent></Card> : null}
          {loadingResumes ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading reviews">{[0,1,2].map((item) => <div key={item} className="h-64 animate-pulse rounded-xl border bg-muted/50" />)}</div>
          ) : resumes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{resumes.map((resume) => <ResumeCard key={resume.id} resume={resume} />)}</div>
          ) : (
            <Card className="border-dashed"><CardContent className="flex flex-col items-center gap-4 p-10 text-center"><div className="rounded-full bg-muted p-4"><FileSearch2 className="size-6 text-muted-foreground" /></div><div><h3 className="font-semibold">No reviews yet</h3><p className="mt-1 text-sm text-muted-foreground">Create your first role-specific resume review.</p></div><Button asChild><Link href="/upload">Start a review</Link></Button></CardContent></Card>
          )}
        </section>
      </main>
    </div>
  );
}
