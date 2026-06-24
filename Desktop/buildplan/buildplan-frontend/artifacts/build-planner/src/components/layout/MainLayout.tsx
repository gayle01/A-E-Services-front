import { ReactNode } from "react";
import { Link } from "wouter";
import { Hammer, LayoutDashboard, Calculator } from "lucide-react";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <Hammer className="h-6 w-6" />
            <span>BuildPlan</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/estimate" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2 transition-colors">
              <Calculator className="h-4 w-4" />
              Start Estimate
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
