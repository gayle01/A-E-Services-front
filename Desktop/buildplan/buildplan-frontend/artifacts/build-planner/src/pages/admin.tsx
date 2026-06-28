import { useMemo, useState } from "react";
import { Link } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatGHS } from "@/lib/utils";
import {
  getAdminSummary,
  getProjectsForCompare,
  LOCATION_OPTIONS,
  MATERIAL_NAMES,
  useDeleteFeeRate,
  useDeleteLocationPrice,
  useDeleteMaterialPrice,
  useDeleteUser,
  useListEstimates,
  useListFeeRates,
  useListLocationPrices,
  useListMaterialPrices,
  useListUsers,
  useUpsertFeeRate,
  useUpsertLocationPrice,
  useUpsertMaterialPrice,
  useUpsertUser,
  type AppUser,
  type FeeRate,
  type LocationPrice,
  type MaterialPrice,
} from "@/lib/mock-api";
import { BarChart3, Layers3, Plus, Settings, ShieldCheck, Users } from "lucide-react";

const COLORS = ["#1d4ed8", "#ea580c", "#16a34a", "#7c3aed"];

export default function Admin() {
  const { data: estimates } = useListEstimates();
  const { data: materials = [] } = useListMaterialPrices();
  const { data: locations = [] } = useListLocationPrices();
  const { data: feeRates = [] } = useListFeeRates();
  const { data: users = [] } = useListUsers();
  const summary = getAdminSummary();

  const upsertMaterial = useUpsertMaterialPrice();
  const upsertLocation = useUpsertLocationPrice();
  const upsertFeeRate = useUpsertFeeRate();
  const upsertUser = useUpsertUser();
  const deleteMaterial = useDeleteMaterialPrice();
  const deleteLocation = useDeleteLocationPrice();
  const deleteFeeRate = useDeleteFeeRate();
  const deleteUser = useDeleteUser();

  const nextIds = useMemo(
    () => ({
      material: Math.max(...materials.map((item) => item.id), 0) + 1,
      location: Math.max(...locations.map((item) => item.id), 0) + 1,
      feeRate: Math.max(...feeRates.map((item) => item.id), 0) + 1,
      user: Math.max(...users.map((item) => item.id), 0) + 1,
    }),
    [materials, locations, feeRates, users],
  );

  const [materialForm, setMaterialForm] = useState({
    location: "all",
    materialName: "Cement",
    unit: "bag",
    price: "0",
  });
  const [locationForm, setLocationForm] = useState({
    location: "new-location",
    label: "",
    multiplier: "1",
  });
  const [feeForm, setFeeForm] = useState({
    name: "Architectural Fee",
    code: "architectural",
    category: "architectural" as FeeRate["category"],
    basis: "per-sqm" as FeeRate["basis"],
    rate: "0",
  });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "planner" as AppUser["role"],
  });

  const saveMaterial = () => {
    upsertMaterial.mutate({
      id: nextIds.material,
      location: materialForm.location,
      materialName: materialForm.materialName,
      unit: materialForm.unit,
      price: Number(materialForm.price),
      lastUpdated: new Date().toISOString(),
    });
    setMaterialForm((value) => ({ ...value, price: "0" }));
  };

  const saveLocation = () => {
    upsertLocation.mutate({
      id: nextIds.location,
      location: locationForm.location,
      label: locationForm.label || locationForm.location,
      multiplier: Number(locationForm.multiplier),
      lastUpdated: new Date().toISOString(),
    });
    setLocationForm({ location: "new-location", label: "", multiplier: "1" });
  };

  const saveFeeRate = () => {
    upsertFeeRate.mutate({
      id: nextIds.feeRate,
      name: feeForm.name,
      code: feeForm.code,
      category: feeForm.category,
      basis: feeForm.basis,
      rate: Number(feeForm.rate),
      lastUpdated: new Date().toISOString(),
    });
    setFeeForm((value) => ({ ...value, rate: "0" }));
  };

  const saveUser = () => {
    upsertUser.mutate({
      id: nextIds.user,
      name: userForm.name,
      email: userForm.email,
      password: userForm.password,
      role: userForm.role,
      createdAt: new Date().toISOString(),
    });
    setUserForm({ name: "", email: "", password: "", role: "planner" });
  };

  const complexityMix = Object.entries(summary.complexityMix).map(([name, value]) => ({ name, value }));

  return (
    <MainLayout>
      <div className="container mx-auto px-4 md:px-8 py-10 max-w-7xl space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
            <Settings className="h-4 w-4" />
            Admin panel
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Manage pricing, formulas, users, and saved projects</h1>
          <p className="text-muted-foreground mt-2">This area covers the CRUD and analytics tools requested for the admin role.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {[
            { label: "Saved Projects", value: summary.projectCount, icon: ShieldCheck },
            { label: "Material Prices", value: summary.materialCount, icon: Layers3 },
            { label: "Locations", value: summary.locationCount, icon: BarChart3 },
            { label: "Fee Rates", value: summary.feeRateCount, icon: Settings },
            { label: "Users", value: summary.userCount, icon: Users },
          ].map((card) => (
            <Card key={card.label}>
              <CardContent className="p-5">
                <card.icon className="h-5 w-5 text-primary mb-3" />
                <div className="text-sm text-muted-foreground">{card.label}</div>
                <div className="text-2xl font-bold mt-1">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="materials">Material Prices</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="fees">Fee Rates</TabsTrigger>
            <TabsTrigger value="projects">Saved Projects</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CRUD Material Prices</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label>Location</Label>
                  <Select value={materialForm.location} onValueChange={(value) => setMaterialForm((form) => ({ ...form, location: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {LOCATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Material</Label>
                  <Select value={materialForm.materialName} onValueChange={(value) => setMaterialForm((form) => ({ ...form, materialName: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MATERIAL_NAMES.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input value={materialForm.unit} onChange={(event) => setMaterialForm((form) => ({ ...form, unit: event.target.value }))} />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input type="number" value={materialForm.price} onChange={(event) => setMaterialForm((form) => ({ ...form, price: event.target.value }))} />
                </div>
                <div className="md:col-span-4">
                  <Button onClick={saveMaterial}>
                    <Plus className="mr-2 h-4 w-4" />
                    Save Material Price
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="text-left p-4">Location</th>
                      <th className="text-left p-4">Material</th>
                      <th className="text-left p-4">Unit</th>
                      <th className="text-left p-4">Price</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-4 capitalize">{item.location}</td>
                        <td className="p-4">{item.materialName}</td>
                        <td className="p-4">{item.unit}</td>
                        <td className="p-4">{formatGHS(item.price)}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" onClick={() => deleteMaterial.mutate(item.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CRUD Locations</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Location Code</Label>
                  <Input value={locationForm.location} onChange={(event) => setLocationForm((form) => ({ ...form, location: event.target.value }))} />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input value={locationForm.label} onChange={(event) => setLocationForm((form) => ({ ...form, label: event.target.value }))} />
                </div>
                <div>
                  <Label>Multiplier</Label>
                  <Input type="number" step="0.01" value={locationForm.multiplier} onChange={(event) => setLocationForm((form) => ({ ...form, multiplier: event.target.value }))} />
                </div>
                <div className="md:col-span-3">
                  <Button onClick={saveLocation}>
                    <Plus className="mr-2 h-4 w-4" />
                    Save Location
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="text-left p-4">Code</th>
                      <th className="text-left p-4">Label</th>
                      <th className="text-left p-4">Multiplier</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-4">{item.location}</td>
                        <td className="p-4">{item.label}</td>
                        <td className="p-4">{item.multiplier}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" onClick={() => deleteLocation.mutate(item.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CRUD Fee Rates</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-5 gap-4">
                <div><Label>Name</Label><Input value={feeForm.name} onChange={(event) => setFeeForm((form) => ({ ...form, name: event.target.value }))} /></div>
                <div><Label>Code</Label><Input value={feeForm.code} onChange={(event) => setFeeForm((form) => ({ ...form, code: event.target.value }))} /></div>
                <div>
                  <Label>Category</Label>
                  <Select value={feeForm.category} onValueChange={(value: FeeRate["category"]) => setFeeForm((form) => ({ ...form, category: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="architectural">Architectural</SelectItem>
                      <SelectItem value="structural">Structural</SelectItem>
                      <SelectItem value="surveying">Surveying</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Basis</Label>
                  <Select value={feeForm.basis} onValueChange={(value: FeeRate["basis"]) => setFeeForm((form) => ({ ...form, basis: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per-sqm">Per sqm</SelectItem>
                      <SelectItem value="percent">Percent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Rate</Label><Input type="number" step="0.01" value={feeForm.rate} onChange={(event) => setFeeForm((form) => ({ ...form, rate: event.target.value }))} /></div>
                <div className="md:col-span-5">
                  <Button onClick={saveFeeRate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Save Fee Rate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Category</th>
                      <th className="text-left p-4">Basis</th>
                      <th className="text-left p-4">Rate</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeRates.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-4">{item.name}</td>
                        <td className="p-4 capitalize">{item.category}</td>
                        <td className="p-4">{item.basis}</td>
                        <td className="p-4">{item.rate}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" onClick={() => deleteFeeRate.mutate(item.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>View Saved Projects</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="text-left p-4">Project</th>
                      <th className="text-left p-4">Location</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Cost</th>
                      <th className="text-left p-4">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getProjectsForCompare().map((project) => (
                      <tr key={project.id} className="border-b">
                        <td className="p-4">{project.projectName}</td>
                        <td className="p-4 capitalize">{project.location}</td>
                        <td className="p-4">{project.buildingType}</td>
                        <td className="p-4">{formatGHS(project.totalCost)}</td>
                        <td className="p-4">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/results/${project.id}`}>Open report</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-4">
                <div><Label>Name</Label><Input value={userForm.name} onChange={(event) => setUserForm((form) => ({ ...form, name: event.target.value }))} /></div>
                <div><Label>Email</Label><Input value={userForm.email} onChange={(event) => setUserForm((form) => ({ ...form, email: event.target.value }))} /></div>
                <div><Label>Password</Label><Input value={userForm.password} onChange={(event) => setUserForm((form) => ({ ...form, password: event.target.value }))} /></div>
                <div>
                  <Label>Role</Label>
                  <Select value={userForm.role} onValueChange={(value: AppUser["role"]) => setUserForm((form) => ({ ...form, role: value }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="planner">Planner</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-4">
                  <Button onClick={saveUser}>
                    <Plus className="mr-2 h-4 w-4" />
                    Save User
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-4">{item.name}</td>
                        <td className="p-4">{item.email}</td>
                        <td className="p-4 capitalize">{item.role}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" onClick={() => deleteUser.mutate(item.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Complexity Mix</CardTitle>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={complexityMix} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4}>
                        {complexityMix.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Average project cost</span><span>{formatGHS(estimates?.length ? estimates.reduce((sum, project) => sum + project.totalCost, 0) / estimates.length : 0)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Highest project cost</span><span>{formatGHS(Math.max(...(estimates?.map((project) => project.totalCost) ?? [0]), 0))}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Saved projects</span><span>{summary.projectCount}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Materials tracked</span><span>{summary.materialCount}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Users managed</span><span>{summary.userCount}</span></div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
