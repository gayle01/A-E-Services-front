import { type ReactNode, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateEstimate } from "@/lib/mock-api";
import { ProjectInputBuildingType, ProjectInputSiteCondition, ProjectInputFinishQuality } from "@/lib/mock-api";
import type { ProjectInput } from "@/lib/mock-api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Building, CheckCircle2, Home, Factory, MapPin, Map, PaintBucket, Hammer, Briefcase, Users, CircleDollarSign, HeartHandshake } from "lucide-react";

const estimateSchema = z.object({
  projectName: z.string().min(2, "Project name must be at least 2 characters."),
  location: z.string().min(2, "Location is required."),
  profession: z.string().min(2, "Profession is required."),
  ageGroup: z.enum(["under-25", "25-34", "35-44", "45-54", "55-plus"]),
  annualIncome: z.string().optional(),
  projectBudgetType: z.enum(["individual", "corporate", "alliance"]),
  budgetPreference: z.enum(["amount", "dont-know", "loan"]),
  budgetAmount: z.string().optional(),
  religion: z.string().min(1, "Please select a religion."),
  buildingType: z.enum([ProjectInputBuildingType.residential, ProjectInputBuildingType.commercial, ProjectInputBuildingType.industrial, ProjectInputBuildingType.institutional]),
  floorArea: z.coerce.number().min(10, "Floor area must be at least 10 sqm."),
  numFloors: z.coerce.number().min(1, "Number of floors must be at least 1."),
  siteCondition: z.enum([ProjectInputSiteCondition.flat, ProjectInputSiteCondition.sloped, ProjectInputSiteCondition.rocky, ProjectInputSiteCondition.waterlogged]),
  finishQuality: z.enum([ProjectInputFinishQuality.basic, ProjectInputFinishQuality.standard, ProjectInputFinishQuality.premium]),
}).superRefine((data, ctx) => {
  if (data.budgetPreference === "amount" && !data.budgetAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["budgetAmount"],
      message: "Please choose a budget range.",
    });
  }
});

type FormValues = z.infer<typeof estimateSchema>;

const STEPS = [
  { id: "planning", title: "Planning Profile" },
  { id: "type", title: "Building Details" },
  { id: "site", title: "Size & Site" },
  { id: "finish", title: "Finishes" },
];

const PROFESSION_OPTIONS = [
  "Architect",
  "Civil Engineer",
  "Structural Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Quantity Surveyor",
  "Project Manager",
  "Builder",
  "Interior Designer",
  "Urban Planner",
  "Surveyor",
  "Accountant",
  "Banker",
  "Lawyer",
  "Doctor",
  "Nurse",
  "Teacher",
  "Software Engineer",
  "Teacher",
  "Entrepreneur",
  "Lecturer",
  "Lecturer",
  "Pilot",
  "Chef",
  "Business Analyst",
  "Marketing Manager",
  "Graphic Designer",
  "Logistics Officer",
  "Procurement Officer",
  "Public Servant",
  "Real Estate Developer",
  "Farmer",
  "Trader",
  "Mining Engineer",
  "Environmental Scientist",
  "Estate Surveyor",
  "Construction Manager",
  "Artisan",
  "Technician",
  "Health Officer",
  "Pharmacist",
  "Dentist",
  "IT Specialist",
  "Social Worker",
  "Retired Professional",
];

function OptionButton({
  selected,
  onSelect,
  children,
  className = "",
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-md border-2 p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground ${selected ? "border-primary bg-primary/5" : "border-muted bg-popover"} ${className}`}
    >
      {children}
    </button>
  );
}

export default function EstimateForm() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const { mutate: createEstimate, isPending } = useCreateEstimate();

  const form = useForm<FormValues>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      projectName: "",
      location: "",
      profession: "",
      ageGroup: "25-34",
      annualIncome: "",
      projectBudgetType: "individual",
      budgetPreference: "amount",
      budgetAmount: "",
      religion: "prefer-not-say",
      buildingType: ProjectInputBuildingType.residential,
      floorArea: 100,
      numFloors: 1,
      siteCondition: ProjectInputSiteCondition.flat,
      finishQuality: ProjectInputFinishQuality.standard,
    },
    mode: "onTouched",
  });

  const budgetPreference = form.watch("budgetPreference");

  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 0) {
      isValid = await form.trigger(["projectName", "location", "profession", "ageGroup", "projectBudgetType", "budgetPreference", "religion", ...(budgetPreference === "amount" ? ["budgetAmount"] : [])]);
    } else if (currentStep === 1) {
      isValid = await form.trigger(["buildingType", "numFloors"]);
    } else if (currentStep === 2) {
      isValid = await form.trigger(["floorArea", "siteCondition"]);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const onSubmit = (data: FormValues) => {
    createEstimate(
      { data: data as ProjectInput },
      {
        onSuccess: (result) => {
          setLocation(`/results/${result.id}`);
        },
      }
    );
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Configure Your Estimate</h1>
          <p className="text-muted-foreground">Provide detailed planning details to generate a precise cost projection.</p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{STEPS[currentStep].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {currentStep === 0 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
                      <MapPin className="h-6 w-6 text-primary" /> Planning Profile
                    </h2>
                    <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Osei Family Residence" className="h-12 text-lg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Location (City/Region in Ghana)</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg">
                                <SelectValue placeholder="Select a location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="accra">Accra (Greater Accra)</SelectItem>
                              <SelectItem value="kumasi">Kumasi (Ashanti)</SelectItem>
                              <SelectItem value="takoradi">Takoradi (Western)</SelectItem>
                              <SelectItem value="tamale">Tamale (Northern)</SelectItem>
                              <SelectItem value="cape_coast">Cape Coast (Central)</SelectItem>
                              <SelectItem value="sunyani">Sunyani (Central)</SelectItem>
                              <SelectItem value="other">Other Region</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Profession
                          </FormLabel>
                          <FormControl>
                            <Input
                              list="professions"
                              placeholder="Start typing your profession"
                              className="h-12 text-lg"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <datalist id="professions">
                            {PROFESSION_OPTIONS.map((profession) => (
                              <option key={profession} value={profession} />
                            ))}
                          </datalist>
                          <p className="text-sm text-muted-foreground">Suggestions will appear as you type so it is easier to select your profession.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ageGroup"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" /> Age Group
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-2 gap-3"
                            >
                              {[
                                { value: "under-25", label: "Under 25" },
                                { value: "25-34", label: "25 - 34" },
                                { value: "35-44", label: "35 - 44" },
                                { value: "45-54", label: "45 - 54" },
                                { value: "55-plus", label: "55+" },
                              ].map((option) => (
                                <OptionButton
                                  key={option.value}
                                  selected={field.value === option.value}
                                  onSelect={() => field.onChange(option.value)}
                                  className="flex items-center justify-center text-sm font-medium"
                                >
                                  {option.label}
                                </OptionButton>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="annualIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base flex items-center gap-2">
                            <CircleDollarSign className="h-4 w-4" /> Annual Income (Optional)
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value ?? ""}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg">
                                <SelectValue placeholder="Select your annual income range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                              <SelectItem value="under-30000">Below GHS 30,000</SelectItem>
                              <SelectItem value="30000-49999">GHS 30,000 - GHS 49,999</SelectItem>
                              <SelectItem value="50000-99999">GHS 50,000 - GHS 99,999</SelectItem>
                              <SelectItem value="100000-249999">GHS 100,000 - GHS 249,999</SelectItem>
                              <SelectItem value="250000-499999">GHS 250,000 - GHS 499,999</SelectItem>
                              <SelectItem value="500000-999999">GHS 500,000 - GHS 999,999</SelectItem>
                              <SelectItem value="1000000-plus">GHS 1,000,000+</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">This helps us estimate affordability for a mortgage or long-term project finance.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="projectBudgetType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base">Project Budget Type</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid gap-3 md:grid-cols-3">
                              {[
                                { value: "individual", label: "Individual" },
                                { value: "corporate", label: "Corporate" },
                                { value: "alliance", label: "Alliance" },
                              ].map((option) => (
                                <OptionButton
                                  key={option.value}
                                  selected={field.value === option.value}
                                  onSelect={() => field.onChange(option.value)}
                                  className="flex items-center justify-center text-sm font-medium"
                                >
                                  {option.label}
                                </OptionButton>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="budgetPreference"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base">Budget Preference</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid gap-3 md:grid-cols-3">
                              {[
                                { value: "amount", label: "Amount" },
                                { value: "dont-know", label: "I don't know" },
                                { value: "loan", label: "Loan / Mortgage" },
                              ].map((option) => (
                                <OptionButton
                                  key={option.value}
                                  selected={field.value === option.value}
                                  onSelect={() => field.onChange(option.value)}
                                  className="flex items-center justify-center text-sm font-medium"
                                >
                                  {option.label}
                                </OptionButton>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {budgetPreference === "amount" && (
                      <FormField
                        control={form.control}
                        name="budgetAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base flex items-center gap-2">
                              <HeartHandshake className="h-4 w-4" /> Project Budget Range
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                              <FormControl>
                                <SelectTrigger className="h-12 text-lg">
                                  <SelectValue placeholder="Choose a budget range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="under-30000">Below GHS 30,000</SelectItem>
                                <SelectItem value="30000-49999">GHS 30,000 - GHS 49,999</SelectItem>
                                <SelectItem value="50000-99999">GHS 50,000 - GHS 99,999</SelectItem>
                                <SelectItem value="100000-249999">GHS 100,000 - GHS 249,999</SelectItem>
                                <SelectItem value="250000-499999">GHS 250,000 - GHS 499,999</SelectItem>
                                <SelectItem value="500000-999999">GHS 500,000 - GHS 999,999</SelectItem>
                                <SelectItem value="1000000-plus">GHS 1,000,000+</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="religion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Religion</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 text-lg">
                                <SelectValue placeholder="Select your religion" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="christianity">Christianity</SelectItem>
                              <SelectItem value="islam">Islam</SelectItem>
                              <SelectItem value="traditional">Traditional Religion</SelectItem>
                              <SelectItem value="hinduism">Hinduism</SelectItem>
                              <SelectItem value="buddhism">Buddhism</SelectItem>
                              <SelectItem value="atheist">Atheist / Agnostic</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
                      <Building className="h-6 w-6 text-primary" /> Structural Definition
                    </h2>
                    <FormField
                      control={form.control}
                      name="buildingType"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-base">Primary Use Case</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <OptionButton
                                selected={field.value === ProjectInputBuildingType.residential}
                                onSelect={() => field.onChange(ProjectInputBuildingType.residential)}
                                className="flex flex-col items-center justify-between"
                              >
                                <Home className="mb-3 h-8 w-8 text-primary" />
                                <span className="font-semibold text-lg">Residential</span>
                                <span className="text-sm text-muted-foreground mt-1 text-center">Houses, apartments, compounds</span>
                              </OptionButton>
                              <OptionButton
                                selected={field.value === ProjectInputBuildingType.commercial}
                                onSelect={() => field.onChange(ProjectInputBuildingType.commercial)}
                                className="flex flex-col items-center justify-between"
                              >
                                <Building className="mb-3 h-8 w-8 text-primary" />
                                <span className="font-semibold text-lg">Commercial</span>
                                <span className="text-sm text-muted-foreground mt-1 text-center">Offices, retail, mixed-use</span>
                              </OptionButton>
                              <OptionButton
                                selected={field.value === ProjectInputBuildingType.industrial}
                                onSelect={() => field.onChange(ProjectInputBuildingType.industrial)}
                                className="flex flex-col items-center justify-between"
                              >
                                <Factory className="mb-3 h-8 w-8 text-primary" />
                                <span className="font-semibold text-lg">Industrial</span>
                                <span className="text-sm text-muted-foreground mt-1 text-center">Warehouses, factories</span>
                              </OptionButton>
                              <OptionButton
                                selected={field.value === ProjectInputBuildingType.institutional}
                                onSelect={() => field.onChange(ProjectInputBuildingType.institutional)}
                                className="flex flex-col items-center justify-between"
                              >
                                <Hammer className="mb-3 h-8 w-8 text-primary" />
                                <span className="font-semibold text-lg">Institutional</span>
                                <span className="text-sm text-muted-foreground mt-1 text-center">Schools, clinics, civic</span>
                              </OptionButton>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numFloors"
                      render={({ field }) => (
                        <FormItem className="mt-8">
                          <FormLabel className="text-base">Number of Floors (Storeys)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={20} className="h-12 text-lg font-data" {...field} />
                          </FormControl>
                          <p className="text-sm text-muted-foreground mt-2">1 = Ground floor only. 2 = Ground + 1 suspended floor.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
                      <Map className="h-6 w-6 text-primary" /> Dimensions & Topography
                    </h2>

                    <FormField
                      control={form.control}
                      name="floorArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Total Floor Area (sqm)</FormLabel>
                          <FormControl>
                            <Input type="number" min={10} className="h-12 text-lg font-data" {...field} />
                          </FormControl>
                          <p className="text-sm text-muted-foreground mt-2">Combined area of all floors. Standard 3-bedroom house is ~150-200 sqm.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="siteCondition"
                      render={({ field }) => (
                        <FormItem className="mt-8">
                          <FormLabel className="text-base">Site Condition (Topography & Soil)</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                              <OptionButton
                                selected={field.value === ProjectInputSiteCondition.flat}
                                onSelect={() => field.onChange(ProjectInputSiteCondition.flat)}
                                className="flex items-center gap-3"
                              >
                                <div className="h-4 w-12 bg-slate-300 rounded"></div>
                                <div>
                                  <div className="font-semibold">Flat & Firm</div>
                                  <div className="text-xs text-muted-foreground">Standard foundation</div>
                                </div>
                              </OptionButton>
                              <OptionButton
                                selected={field.value === ProjectInputSiteCondition.sloped}
                                onSelect={() => field.onChange(ProjectInputSiteCondition.sloped)}
                                className="flex items-center gap-3"
                              >
                                <div className="h-4 w-12 bg-slate-300 rounded transform -rotate-12"></div>
                                <div>
                                  <div className="font-semibold">Sloped</div>
                                  <div className="text-xs text-muted-foreground">Requires cut & fill / retaining walls</div>
                                </div>
                              </OptionButton>
                              <OptionButton
                                selected={field.value === ProjectInputSiteCondition.rocky}
                                onSelect={() => field.onChange(ProjectInputSiteCondition.rocky)}
                                className="flex items-center gap-3"
                              >
                                <div className="flex gap-1"><div className="h-4 w-4 bg-slate-400 rounded-full"></div><div className="h-5 w-6 bg-slate-500 rounded-lg"></div></div>
                                <div>
                                  <div className="font-semibold">Rocky</div>
                                  <div className="text-xs text-muted-foreground">High excavation costs</div>
                                </div>
                              </OptionButton>
                              <OptionButton
                                selected={field.value === ProjectInputSiteCondition.waterlogged}
                                onSelect={() => field.onChange(ProjectInputSiteCondition.waterlogged)}
                                className="flex items-center gap-3"
                              >
                                <div className="h-4 w-12 bg-blue-300 rounded"></div>
                                <div>
                                  <div className="font-semibold">Waterlogged</div>
                                  <div className="text-xs text-muted-foreground">Requires deep piling/raft foundation</div>
                                </div>
                              </OptionButton>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
                      <PaintBucket className="h-6 w-6 text-primary" /> Interior & Exterior Finishes
                    </h2>

                    <FormField
                      control={form.control}
                      name="finishQuality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Quality of Finishes</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-1 gap-4"
                            >
                              <OptionButton
                                selected={field.value === ProjectInputFinishQuality.basic}
                                onSelect={() => field.onChange(ProjectInputFinishQuality.basic)}
                                className="flex flex-col"
                              >
                                <span className="font-bold text-lg mb-1">Basic Specification</span>
                                <span className="text-sm text-muted-foreground">Standard cement blockwork, simple screed/basic tiles, exposed surface wiring, unpainted or single-coat paint, basic plumbing fixtures.</span>
                              </OptionButton>
                              <OptionButton
                                selected={field.value === ProjectInputFinishQuality.standard}
                                onSelect={() => field.onChange(ProjectInputFinishQuality.standard)}
                                className="flex flex-col"
                              >
                                <span className="font-bold text-lg mb-1">Standard Specification (Market Average)</span>
                                <span className="text-sm text-muted-foreground">Plastered & painted walls, standard ceramic/porcelain tiles, concealed wiring with standard fittings, POP ceiling, standard aluminum roofing.</span>
                              </OptionButton>
                              <OptionButton
                                selected={field.value === ProjectInputFinishQuality.premium}
                                onSelect={() => field.onChange(ProjectInputFinishQuality.premium)}
                                className="flex flex-col"
                              >
                                <span className="font-bold text-lg mb-1">Premium / Luxury Specification</span>
                                <span className="text-sm text-muted-foreground">High-end imported tiles/marble, custom POP designs, hidden architectural lighting, high-end sanitary ware, stone cladding, smart home features.</span>
                              </OptionButton>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted/50 p-6 rounded-lg mt-8 border">
                      <h3 className="font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Ready to Generate Estimate</h3>
                      <p className="text-sm text-muted-foreground">
                        Your inputs will be processed using current Ghanaian market rates for materials, labor, and professional fees.
                        Cost ranges include standard contingencies.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t mt-8">
                  {currentStep > 0 ? (
                    <Button type="button" variant="outline" onClick={prevStep} size="lg">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < STEPS.length - 1 ? (
                    <Button type="button" onClick={nextStep} size="lg">
                      Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" size="lg" disabled={isPending}>
                      {isPending ? "Generating Report..." : "Generate Estimate"}
                      {!isPending && <CheckCircle2 className="ml-2 h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
