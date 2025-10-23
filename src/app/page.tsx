import ResumeCard from "@/components/ResumeCard";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import { resumes } from "@/constants";
import Link from "next/link";


export default function Home() {
  return (
    <main className="flex flex-col items-center lg:mx-36">
      <NavigationMenu className="p-4 w-full flex justify-between border-b border-foreground/20">
        <div className="flex items-center gap-2">
          <div className="size-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h1 className="hidden md:flex text-xl font-mono font-bold">HIRELENS</h1>
        </div>
        <NavigationMenuList>
          <Button variant="default" size="sm">
            <Link href="#">Upload Resume</Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Link href="#">Sign In</Link>
          </Button>
          <Button variant="ghost" size="sm">
            <Link href="#">Sign Up</Link>
          </Button>
        </NavigationMenuList>
      </NavigationMenu>
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
