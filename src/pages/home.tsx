import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calculator, CheckCircle2, ShieldCheck, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
            <ShieldCheck className="h-4 w-4" />
            Professional Grade Construction Intelligence
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight mb-6 leading-tight">
            Plan your project before you invest.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Receive a structured project checklist and budget from architects, engineers, and quantity surveyors designed for Ghanaian construction planning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-8 text-base font-semibold">
              <Link href="/estimate">
                Start Project Planning <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base font-semibold">
              <Link href="/dashboard">View Past Projects</Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-muted py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Comprehensive Breakdown</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get detailed cost projections covering foundation, structure, finishes, and MEP services based on current Ghanaian market rates.
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Material Quantification</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Understand exactly how many bags of cement, tonnes of steel, and roofing sheets your project demands.
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Professional Fees</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Budget accurately for architects, structural engineers, and quantity surveyors with standard industry percentage brackets.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
