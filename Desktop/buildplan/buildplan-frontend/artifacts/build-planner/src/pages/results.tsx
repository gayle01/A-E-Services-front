import { MainLayout } from "@/components/layout/MainLayout";
import { useGetEstimate } from "@/lib/mock-api";
import { useParams, Link } from "wouter";
import { formatGHS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building, MapPin, Layers, Briefcase, Ruler, Calendar, DollarSign, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#1e3a5f', '#c05621', '#d9822b', '#4a7c82', '#8c92ac', '#5a6270', '#e2e8f0'];

export default function Results() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { data: estimate, isLoading } = useGetEstimate(id, { query: { enabled: !!id } });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-10">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!estimate) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Estimate not found</h2>
          <Link href="/dashboard" className="text-primary hover:underline">Return to Dashboard</Link>
        </div>
      </MainLayout>
    );
  }

  const chartData = [
    { name: 'Foundation', value: estimate.costBreakdown.foundation },
    { name: 'Structure', value: estimate.costBreakdown.structure },
    { name: 'Roofing', value: estimate.costBreakdown.roofing },
    { name: 'Finishes', value: estimate.costBreakdown.finishes },
    { name: 'MEP Services', value: estimate.costBreakdown.mepServices },
    { name: 'Site Work', value: estimate.costBreakdown.siteWork },
    { name: 'Contingency', value: estimate.costBreakdown.contingency },
  ];

  return (
    <MainLayout>
      <div className="bg-primary text-primary-foreground py-10">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <Link href="/dashboard" className="inline-flex items-center text-primary-foreground/70 hover:text-primary-foreground mb-6 text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white/10 text-xs font-medium mb-3 uppercase tracking-widest">
                Official Estimate Report
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">{estimate.projectName}</h1>
              <div className="flex items-center gap-4 text-primary-foreground/80">
                <span className="flex items-center gap-1 capitalize"><MapPin className="h-4 w-4" /> {estimate.location}</span>
                <span className="flex items-center gap-1 capitalize"><Building className="h-4 w-4" /> {estimate.buildingType}</span>
                <span className="flex items-center gap-1"><Ruler className="h-4 w-4" /> {estimate.floorArea} m²</span>
              </div>
            </div>
            <div className="bg-white text-primary rounded-xl p-6 shadow-xl min-w-[300px]">
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Estimated Total Cost</div>
              <div className="text-3xl font-bold font-data text-primary leading-none">
                {formatGHS(estimate.totalCostMin)}
              </div>
              <div className="text-xl font-bold font-data text-muted-foreground mt-1">
                to {formatGHS(estimate.totalCostMax)}
              </div>
              <div className="mt-4 pt-4 border-t text-sm font-medium flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4" /> Estimated Duration</span>
                <span>{estimate.durationMonthsMin} - {estimate.durationMonthsMax} Months</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Activity className="h-5 w-5 text-primary" /> Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatGHS(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 pt-6 border-t">
                  {chartData.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                        {item.name}
                      </span>
                      <span className="font-bold font-data">{formatGHS(item.value)}</span>
                    </div>
                  ))}
                  <div className="col-span-1 sm:col-span-2 flex justify-between items-center text-base font-bold mt-2 pt-2 border-t text-primary">
                    <span>Total Target</span>
                    <span className="font-data">{formatGHS(estimate.costBreakdown.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Layers className="h-5 w-5 text-primary" /> Core Materials Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Cement</div>
                    <div className="text-xl font-bold font-data">{estimate.materials.cementBags.toLocaleString()} <span className="text-sm font-normal">bags</span></div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Steel</div>
                    <div className="text-xl font-bold font-data">{estimate.materials.steelTonnes.toLocaleString()} <span className="text-sm font-normal">tonnes</span></div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Sand</div>
                    <div className="text-xl font-bold font-data">{estimate.materials.sandCubicMetres.toLocaleString()} <span className="text-sm font-normal">m³</span></div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Gravel</div>
                    <div className="text-xl font-bold font-data">{estimate.materials.gravellCubicMetres.toLocaleString()} <span className="text-sm font-normal">m³</span></div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Blocks</div>
                    <div className="text-xl font-bold font-data">{estimate.materials.blockCount.toLocaleString()} <span className="text-sm font-normal">pcs</span></div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Roofing</div>
                    <div className="text-xl font-bold font-data">{estimate.materials.roofingSheets.toLocaleString()} <span className="text-sm font-normal">sheets</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><Briefcase className="h-5 w-5 text-primary" /> Professional Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Architect</span>
                    <span className="text-muted-foreground font-data">{formatGHS(estimate.professionalFees.architectFeeMin)} - {formatGHS(estimate.professionalFees.architectFeeMax)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-1" style={{width: '25%'}}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Structural Engineer</span>
                    <span className="text-muted-foreground font-data">{formatGHS(estimate.professionalFees.structuralEngineerFeeMin)} - {formatGHS(estimate.professionalFees.structuralEngineerFeeMax)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-2" style={{width: '15%'}}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Quantity Surveyor</span>
                    <span className="text-muted-foreground font-data">{formatGHS(estimate.professionalFees.quantitySurveyorFeeMin)} - {formatGHS(estimate.professionalFees.quantitySurveyorFeeMax)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-3" style={{width: '15%'}}></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Project Manager</span>
                    <span className="text-muted-foreground font-data">{formatGHS(estimate.professionalFees.projectManagerFeeMin)} - {formatGHS(estimate.professionalFees.projectManagerFeeMax)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-4" style={{width: '20%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><DollarSign className="h-5 w-5 text-primary" /> Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Floors</dt>
                    <dd className="font-bold">{estimate.numFloors}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Site Condition</dt>
                    <dd className="font-bold capitalize">{estimate.siteCondition}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <dt className="text-muted-foreground">Finish Quality</dt>
                    <dd className="font-bold capitalize">{estimate.finishQuality}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-muted-foreground">Currency</dt>
                    <dd className="font-bold">{estimate.currency}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
