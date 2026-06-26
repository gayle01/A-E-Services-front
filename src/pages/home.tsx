import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Download,
  FolderOpen,
  Gauge,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

const capabilityCards = [
  { title: "Create projects", description: "Capture project data, owner details, and planning profiles in one flow.", icon: FolderOpen },
  { title: "Run estimations", description: "Generate construction, material, labour, fee, and duration estimates.", icon: Calculator },
  { title: "Save estimations", description: "Persist each estimate locally so projects stay organized.", icon: Gauge },
  { title: "Download reports", description: "Export a report summary for sharing with clients and teams.", icon: Download },
  { title: "Compare projects", description: "Review two projects side by side to spot cost and scope differences.", icon: BarChart3 },
  { title: "Admin", description: "Manage pricing, formulas, users, and analytics from a dedicated area.", icon: SlidersHorizontal },
];

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col">
        <section className="py-20 md:py-28 px-4 container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
                <ShieldCheck className="h-4 w-4" />
                Modern construction planning workspace
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight mb-6 leading-tight">
                Plan every project with clarity, cost control, and confidence.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                BuildPlan now supports owner details, primary user details, planning profiles, automatic complexity scoring, fee estimation, saved projects, reports, comparisons, and admin management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-base font-semibold">
                  <Link href="/estimate">
                    Start a Project <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold">
                  <Link href="/dashboard">Open Dashboard</Link>
                </Button>
              </div>
            </div>

            <Card className="border shadow-lg bg-card">
              <CardContent className="p-6 md:p-8 space-y-4">
                <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">What the platform can do</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {capabilityCards.map((card) => (
                    <div key={card.title} className="rounded-xl border bg-background p-4">
                      <card.icon className="h-5 w-5 text-primary mb-3" />
                      <h3 className="font-semibold mb-1">{card.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-muted/50 py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Users className="h-5 w-5 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Owner and primary user profiles</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Owner and primary user details are collected separately before the planning profile, exactly as requested.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Calculator className="h-5 w-5 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Automatic complexity scoring</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The system calculates structural complexity from shape, basement, open spans, cantilevers, floors, and roof complexity.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <BarChart3 className="h-5 w-5 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Dashboard and admin insight</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    View cost breakdowns, compare projects, and manage pricing and formulas from the admin panel.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
