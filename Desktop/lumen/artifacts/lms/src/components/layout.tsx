import { Link, useLocation } from "wouter";
import { 
  BookOpen, 
  LayoutDashboard, 
  GraduationCap, 
  FileText, 
  CheckSquare, 
  Trophy,
  Settings,
  Library,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  const { theme, setTheme } = useTheme();

  const studentLinks = [
    { href: "/dashboard", label: "Studio Dashboard", icon: LayoutDashboard },
    { href: "/courses", label: "Design Library", icon: Library },
    { href: "/my-courses", label: "My Studio Learning", icon: BookOpen },
    { href: "/assignments", label: "Project Tasks", icon: FileText },
    { href: "/quizzes", label: "Knowledge Checks", icon: CheckSquare },
    { href: "/my-progress", label: "Progress Tracker", icon: Trophy },
  ];

  const adminLinks = [
    { href: "/admin", label: "Studio Overview", icon: LayoutDashboard },
    { href: "/admin/courses", label: "Manage Learning Modules", icon: BookOpen },
    { href: "/admin/assignments", label: "Manage Project Tasks", icon: FileText },
    { href: "/admin/quizzes", label: "Manage Knowledge Checks", icon: CheckSquare },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-sidebar">
        <div className="flex h-14 items-center border-b px-6">
          <Link
            href={isAdmin ? "/admin" : "/dashboard"}
            className="flex items-center gap-2 font-semibold tracking-tight text-sidebar-foreground"
          >
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>Skyline Architecture Academy</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-4 text-sm font-medium">
            {links.map((link) => {
              const isActive =
                location === link.href ||
                (link.href !== "/dashboard" &&
                  link.href !== "/admin" &&
                  location.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent",
                    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground/70"
                  )}
                >
                  <link.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-sidebar-foreground/50")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
            <div className="text-xs text-sidebar-foreground/60">
              {theme === "dark" ? "Dark" : "Light"} theme
            </div>
          </div>
          <Link
            href={isAdmin ? "/" : "/admin"}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Settings className="h-4 w-4" />
            Switch to {isAdmin ? "Learner" : "Admin"}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-64">
        <div className="h-full px-8 py-8 mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
