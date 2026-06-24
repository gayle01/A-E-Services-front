import { MainLayout } from "@/components/layout/MainLayout";
import { useListEstimates, useGetEstimateStats } from "@/lib/mock-api";
import { Link } from "wouter";
import { formatGHS } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Calculator, Plus, Activity, Layers, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: estimates, isLoading: loadingEstimates } = useListEstimates();
  const { data: stats, isLoading: loadingStats } = useGetEstimateStats();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:px-8 py-10 max-w-6xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Project Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of all your construction estimates.</p>
          </div>
          <Button asChild>
            <Link href="/estimate">
              <Plus className="mr-2 h-4 w-4" /> New Estimate
            </Link>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Estimates</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-3xl font-bold font-data">{stats?.totalEstimates || 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Cost</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? <Skeleton className="h-8 w-32" /> : (
                <div className="text-2xl font-bold text-primary font-data">{formatGHS(stats?.averageCost || 0)}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Floor Area</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-bold font-data">{stats?.totalFloorAreaEstimated?.toLocaleString()} m²</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Location</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-xl font-bold capitalize">{stats?.mostCommonLocation || "-"}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-bold mb-4 border-b pb-2">Recent Projects</h2>
        
        {loadingEstimates ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        ) : estimates && estimates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {estimates.map((est) => (
              <Link key={est.id} href={`/results/${est.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{est.projectName}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> <span className="capitalize">{est.location}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" /> <span className="capitalize">{est.buildingType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Maximize className="h-4 w-4" /> <span>{est.floorArea} m²</span>
                      </div>
                    </div>
                    <div className="bg-muted rounded-md p-3">
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Estimated Cost Range</div>
                      <div className="font-bold text-primary font-data">
                        {formatGHS(est.totalCostMin)} - {formatGHS(est.totalCostMax)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-4 flex justify-between">
                      <span>Created {format(new Date(est.createdAt), "MMM d, yyyy")}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No estimates yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Create your first construction estimate to see it appear here.</p>
            <Button asChild>
              <Link href="/estimate">Create Estimate</Link>
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
