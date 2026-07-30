"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileSearch2, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePuterStore } from "@/lib/puter";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/upload", label: "New review" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = usePuterStore((state) => state.auth.signOut);

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold" aria-label="HireLens dashboard">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><FileSearch2 className="size-5" aria-hidden="true" /></span>
          <span>HireLens</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Button key={link.href} variant="ghost" asChild className={cn(pathname === link.href && "bg-accent text-accent-foreground")}>
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm"><Link href="/upload"><Plus className="size-4" aria-hidden="true" />New review</Link></Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out"><LogOut className="size-4" /></Button>
        </div>
      </div>
    </header>
  );
}
