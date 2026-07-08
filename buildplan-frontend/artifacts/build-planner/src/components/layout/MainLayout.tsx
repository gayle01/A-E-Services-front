import { ReactNode } from "react";
import { Link } from "wouter";
import { Hammer, LayoutDashboard, Calculator, Home, ShieldCheck, Settings } from "lucide-react";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/home" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Hammer className="h-6 w-6" />
            <span>BuildPlan</span>
          </Link>
          <nav className="flex items-center gap-2 md:gap-4 overflow-x-auto">
            <Link href="/home" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors px-3 py-2 rounded-md hover:bg-muted whitespace-nowrap">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors px-3 py-2 rounded-md hover:bg-muted whitespace-nowrap">
              <LayoutDashboard className="h-4 w-4" />
              Projects
            </Link>
            <Link href="/estimate" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2 transition-colors whitespace-nowrap">
              <Calculator className="h-4 w-4" />
              New Project
            </Link>
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors px-3 py-2 rounded-md hover:bg-muted whitespace-nowrap">
              <Settings className="h-4 w-4" />
              Admin
            </Link>
            <Link href="/dashboard" className="hidden lg:flex text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors px-3 py-2 rounded-md hover:bg-muted whitespace-nowrap">
              <ShieldCheck className="h-4 w-4" />
              Analytics
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 md:px-8 py-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BuildPlan GH. Authoritative Construction Intelligence.
        </div>
      </footer>
    </div>
  );
}
