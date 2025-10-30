"use client"
import { Button } from "@/components/ui/button";
import { usePuterStore } from "@/lib/puter"
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const meta = () => ([
  { title: "Resumind | Auth" },
  { name: "description", content: "Log into your account" }
])

const AuthPage = () => {
  const { isLoading, auth } = usePuterStore();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "";
  const router = useRouter();

  const handleLogin = () => {
    auth.signIn();
    router.push("/");
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push(next);
    }
  }, [auth.isAuthenticated, router, next]);

  return (
    <main className="flex items-center justify-center min-h-screen w-full">
      <div className="shadow-lg w-full md:w-1/2 lg:w-1/3 text-left mx-4">
        <section className="flex flex-col gap-8 rounded-2xl p-10 bg-card w-full border border-border">
          <div className="flex flex-col gap-2 text-left border-b pb-4">
            <h1 className="Titles">Welcome!</h1>
            <h2 className="subtitles mt-1">Please log in to your account</h2>
          </div>
          <div>
            { isLoading ? (
              <div>
                <p>Loading...</p>
              </div>
            ) : (
              <>
                { auth.isAuthenticated ? (
                  <Button variant="default" onClick={auth.signOut}>
                    Log out
                  </Button>
                ) : (
                  <Button variant="default" onClick={handleLogin} className="w-full cursor-pointer">
                    Log In
                  </Button>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>  
  )
}

export default AuthPage;