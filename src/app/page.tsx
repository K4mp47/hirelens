"use client"
import NavBar from "@/components/NavBar";
import ResumeCard from "@/components/ResumeCard";
import { resumes } from "@/constants";
import { usePuterStore } from "@/lib/puter";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {
  const { auth } = usePuterStore();
  const next = "/auth?next=/";
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push(next);
    }
  }, [auth.isAuthenticated, router, next]);

  return (
    <main className="flex flex-col items-center lg:mx-36">
      <NavBar />
      <section className="flex flex-col items-center justify-center w-full gap-6 px-4 py-8">
        <div className="text-center w-full">
          <h1 className="Titles md:text-8xl mask-x-from-80%">Track Your Applications & Resume Ratings</h1>
          <h2 className="subtitles mt-6">Review your submission and check AI-powered feedback.</h2>
        </div>
      </section>
      { resumes.length > 0 && (
        <section className="px-4 w-full flex flex-col lg:grid lg:grid-cols-3 items-center gap-4">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </section>
      )}
    </main>
  );
}
