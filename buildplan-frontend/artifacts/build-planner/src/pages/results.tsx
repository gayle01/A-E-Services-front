import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEstimate } from "@/lib/mock-api";
import { ArrowLeft, Download, FileText, Layers3, Users, Wrench } from "lucide-react";
import { format } from "date-fns";

const COLORS = ["#1d4ed8", "#ea580c", "#16a34a", "#7c3aed", "#0f766e", "#ca8a04"];

const formatAgeGroup = (ageGroup: string) => {
  if (ageGroup === "under-25") return "Under 25";
  if (ageGroup === "55-plus") return "55+";
  return ageGroup.replace("-", " – ");
};

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Results() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id ?? 0);
  const { data: estimate, isLoading } = useGetEstimate(id, { query: { enabled: !!id } });

  const materialChart = useMemo(() => estimate?.materialEstimate.items ?? [], [estimate]);
  const feeChart = useMemo(
    () =>
      estimate
        ? [
            { name: "Architectural", value: estimate.professionalFees.architectural },
            { name: "Structural", value: estimate.professionalFees.structuralEngineering },
            { name: "QS", value: estimate.professionalFees.quantitySurveying },
            { name: "PM", value: estimate.professionalFees.projectManagement },
          ]
        : [],
    [estimate],
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-10 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-72 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!estimate) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <Link href="/dashboard" className="text-primary hover:underline">
            Return to dashboard
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-8 py-10 max-w-7xl">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-primary-foreground/75 hover:text-primary-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/10 text-xs uppercase tracking-wider mb-3">
                Report Summary
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">{estimate.projectName}</h1>
              <div className="flex flex-wrap gap-4 text-primary-foreground/80">
                <span>{estimate.location}</span>
                <span>{estimate.buildingType}</span>
                <span>{estimate.floorArea} m²</span>
                <span>{estimate.numberOfFloors} floors</span>
              </div>
            </div>

            <Card className="text-primary">
              <CardContent className="p-6 space-y-3">
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Estimated Construction Cost</div>
                <div className="text-3xl font-bold">Coming soon</div>
                <div className="text-sm text-muted-foreground">
                  Duration: {estimate.durationEstimate.minMonths} - {estimate.durationEstimate.maxMonths} months
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" onClick={() => downloadJson(`buildplan-project-${estimate.id}.json`, estimate)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download report
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard">Compare projects</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-7xl space-y-8">
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
          {[
            { label: "Estimated Construction Cost", value: "Coming soon", icon: FileText },
            { label: "Material Cost", value: "Coming soon", icon: Layers3 },
            { label: "Labour Cost", value: "Coming soon", icon: Wrench },
            { label: "Professional Fees", value: "Coming soon", icon: Users },
            { label: "Estimated Duration", value: `${estimate.durationEstimate.minMonths} - ${estimate.durationEstimate.maxMonths} months`, icon: FileText },
          ].map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <card.icon className="h-5 w-5 text-primary mb-3" />
                <div className="text-sm text-muted-foreground">{card.label}</div>
                <div className="text-xl font-bold mt-1">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] flex items-center justify-center text-muted-foreground">
              Cost breakdown chart coming soon
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="materialName" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Professional Fees Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip />
                <Bar dataKey="value" fill="#ea580c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{estimate.owner.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Age Group</span><span>{formatAgeGroup(estimate.owner.ageGroup)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Profession</span><span>{estimate.owner.profession}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Religion</span><span>{estimate.owner.religion}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Primary User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{estimate.primaryUser.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Age Group</span><span>{formatAgeGroup(estimate.primaryUser.ageGroup)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Profession</span><span>{estimate.primaryUser.profession}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Religion</span><span>{estimate.primaryUser.religion}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Planning Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Roof Type</span><span>{estimate.roofType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Soil Condition</span><span>{estimate.soilCondition}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Accessibility</span><span>{estimate.siteAccessibility}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Finish Level</span><span>{estimate.finishLevel}</span></div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-5 text-sm text-muted-foreground">
          Saved on {format(new Date(estimate.createdAt), "PPP")} · Structural complexity {estimate.structuralComplexity.label} ({estimate.structuralComplexity.score})
        </div>
      </div>
    </MainLayout>
  );
}