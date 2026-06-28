import { useMemo, useState } from "react";
import { Link } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatGHS } from "@/lib/utils";
import { getProjectsForCompare, useGetEstimateStats, useListEstimates } from "@/lib/mock-api";
import { ArrowRight, BarChart3, CircleDollarSign, Clock3, Layers3, Plus, Scale, Wrench } from "lucide-react";
import { format } from "date-fns";

const COLORS = ["#1d4ed8", "#ea580c", "#16a34a", "#7c3aed", "#0f766e", "#ca8a04"];

export default function Dashboard() {
  const { data: estimates, isLoading } = useListEstimates();
  const { data: stats, isLoading: loadingStats } = useGetEstimateStats();
  const [leftId, setLeftId] = useState<string>("");
  const [rightId, setRightId] = useState<string>("");

  const comparisonLeft = useMemo(() => getProjectsForCompare().find((project) => String(project.id) === leftId), [leftId]);
  const comparisonRight = useMemo(() => getProjectsForCompare().find((project) => String(project.id) === rightId), [rightId]);

  const costChartData = useMemo(
    () => [
      { name: "Material", value: stats?.totalMaterialCost ?? 0 },
      { name: "Labour", value: stats?.totalLabourCost ?? 0 },
      { name: "Professional", value: stats?.totalProfessionalFees ?? 0 },
      { name: "Construction", value: stats?.totalConstructionCost ?? 0 },
    ],
    [stats],
  );

  const materialBreakdown = useMemo(() => {
    const firstEstimate = estimates?.[0];
    return firstEstimate?.materialEstimate.items ?? [];
  }, [estimates]);

  const professionalBreakdown = useMemo(() => {
    const firstEstimate = estimates?.[0];
    if (!firstEstimate) {
      return [];
    }
    return [
      { name: "Architectural", value: firstEstimate.professionalFees.architectural },
      { name: "Structural", value: firstEstimate.professionalFees.structuralEngineering },
      { name: "QS", value: firstEstimate.professionalFees.quantitySurveying },
      { name: "PM", value: firstEstimate.professionalFees.projectManagement },
    ];
  }, [estimates]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:px-8 py-10 max-w-7xl space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Projects Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor saved projects, cost breakdowns, and comparison views.</p>
          </div>
          <Button asChild>
            <Link href="/estimate">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {[
            { label: "Estimated Construction Cost", value: formatGHS(stats?.totalConstructionCost ?? 0), icon: CircleDollarSign },
            { label: "Material Cost", value: formatGHS(stats?.totalMaterialCost ?? 0), icon: Layers3 },
            { label: "Labour Cost", value: formatGHS(stats?.totalLabourCost ?? 0), icon: Wrench },
            { label: "Professional Fees", value: formatGHS(stats?.totalProfessionalFees ?? 0), icon: Scale },
            { label: "Estimated Duration", value: `${stats?.estimatedDurationMonths ?? 0} months`, icon: Clock3 },
          ].map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <card.icon className="h-5 w-5 text-primary mb-3" />
                <div className="text-sm text-muted-foreground">{card.label}</div>
                <div className="text-2xl font-bold mt-1">{loadingStats ? <Skeleton className="h-8 w-28" /> : card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costChartData} cx="50%" cy="50%" innerRadius={75} outerRadius={115} paddingAngle={4} dataKey="value">
                    {costChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatGHS(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Material Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="materialName" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatGHS(value)} />
                  <Bar dataKey="total" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Professional Fees Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={professionalBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatGHS(value)} />
                  <Bar dataKey="value" fill="#ea580c" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : estimates && estimates.length > 0 ? (
                estimates.slice(0, 4).map((project) => (
                  <Link key={project.id} href={`/results/${project.id}`}>
                    <div className="rounded-xl border p-4 hover:border-primary/50 transition-colors">
                      <div className="font-semibold line-clamp-1">{project.projectName}</div>
                      <div className="text-sm text-muted-foreground capitalize">{project.location} · {project.buildingType}</div>
                      <div className="text-sm font-medium text-primary mt-2">{formatGHS(project.totalCost)}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No projects saved yet.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compare Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Select value={leftId} onValueChange={setLeftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first project" />
                </SelectTrigger>
                <SelectContent>
                  {getProjectsForCompare().map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={rightId} onValueChange={setRightId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second project" />
                </SelectTrigger>
                <SelectContent>
                  {getProjectsForCompare().map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[comparisonLeft, comparisonRight].map((project, index) => (
                <Card key={index} className="border-dashed">
                  <CardContent className="p-5">
                    {project ? (
                      <div className="space-y-3">
                        <div className="font-semibold">{project.projectName}</div>
                        <div className="text-sm text-muted-foreground capitalize">{project.location} · {project.buildingType}</div>
                        <div className="flex justify-between text-sm"><span>Area</span><span>{project.floorArea} m²</span></div>
                        <div className="flex justify-between text-sm"><span>Floors</span><span>{project.numberOfFloors}</span></div>
                        <div className="flex justify-between text-sm"><span>Complexity</span><span>{project.structuralComplexity.label} ({project.structuralComplexity.score})</span></div>
                        <div className="flex justify-between text-sm font-semibold text-primary">
                          <span>Total</span>
                          <span>{formatGHS(project.totalCost)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Created {format(new Date(project.createdAt), "MMM d, yyyy")}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Pick a project to compare.</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/estimate">Create another project</Link>
              </Button>
              <Button asChild>
                <Link href="/admin">Open Admin</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/results/1">
                  Sample report
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
