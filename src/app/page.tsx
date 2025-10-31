"use client"
import NavBar from "@/components/NavBar";
import ResumeCard from "@/components/ResumeCard";
import ResumeCardFake from "@/components/ResumeCardFake";
import { resumes as constantresume } from "@/constants";
import { usePuterStore } from "@/lib/puter";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * The Home component serves as the main page of the application.
 * It handles user authentication, fetches and displays resumes,
 * and provides a loading state while data is being fetched.
 */
export default function Home() {
  // Accessing Puter store for authentication and key-value storage
  const { auth, kv } = usePuterStore();

  // State for storing fetched resumes and loading status
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Navigation and routing
  const next = "/auth?next=/";
  const router = useRouter();

  // Effect to fetch resumes from the key-value store when the component mounts
  useEffect(() => { 
    const fetchResumes = async () => {
      // Retrieve all resumes from the key-value store
      const storedResumes = (await kv.list('resume:*', true)) as KVItem[]

      // Parse the resume data from JSON strings
      const resumeData: Resume[] = storedResumes.map(item => (
        JSON.parse(item.value) as Resume
      ))

      // Update state with the fetched resumes and set loading to false
      setResumes(resumeData);
      setLoadingResumes(false);
    }
    fetchResumes();
  }, [kv]);

  // Effect to redirect unauthenticated users to the login page
  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push(next);
    }
  }, [auth.isAuthenticated, router, next]);

  return (
    <main className="flex flex-col items-center lg:mx-36 mb-8 lg:mb-20">
      <NavBar />

      {/* Header section with title and subtitle */}
      <section className="flex flex-col items-center justify-center w-full gap-6 px-4 py-8">
        <div className="text-center w-full">
          <h1 className="Titles md:text-8xl mask-x-from-80%">Track Your Applications & Resume Ratings</h1>
          <h2 className="subtitles mt-6">Review your submission and check AI-powered feedback.</h2>
        </div>
      </section>

      {/* Conditional rendering based on loading and resume availability */}
      {!loadingResumes ? (
        resumes.length > 0 ? (
          // Display fetched resumes if available
          <section className="px-4 w-full flex flex-col lg:grid lg:grid-cols-3 items-center gap-4">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </section>
        ) : (
          // Display fake resumes if no resumes are fetched
          <section className="px-4 w-full flex flex-col lg:grid lg:grid-cols-3 items-center gap-4">
            {constantresume.map((resume) => (
              <ResumeCardFake key={resume.id} resume={resume} />
            ))}
          </section>
        )
      ) : (
        // Display a loading skeleton while resumes are being fetched
        <div className="flex flex-col md:flex-row gap-4 w-full m-4 p-4">
          <div className="md:w-full animate-pulse">
            <div className="bg-gray-700 rounded-md h-48 w-full" />
            <div className="bg-gray-700 rounded-md h-12 w-3/4 mb-4 mt-4" />
            <div className="bg-gray-700 rounded-md h-12 w-3/4 mb-4 mt-4" />
          </div>
          <div className="md:w-1/2 animate-pulse">
            <div className="bg-gray-700 rounded-md h-12 w-3/4 mb-4" />
            <div className="bg-gray-700 rounded-md h-48 w-full" />
            <div className="bg-gray-700 rounded-md h-12 w-1/2 mt-4" />
          </div>
        </div>
      )}
    </main>
  );
}
