import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";

const NavBar = () => {
  return (
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
          <Link href="/auth">Log out</Link>
        </Button>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default NavBar