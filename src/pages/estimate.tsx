import { useMemo, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ARCHITECTURAL_SCOPES,
  AGE_GROUPS,
  BUILDING_SHAPES,
  BUILDING_TYPES,
  FINISH_LEVELS,
  FOUNDATION_TYPES,
  LOCATION_OPTIONS,
  PROFESSIONS,
  RELIGIONS,
  ROOF_COMPLEXITIES,
  ROOF_TYPES,
  SITE_ACCESSIBILITY,
  SOIL_CONDITIONS,
  STRUCTURAL_SYSTEMS,
  calculateStructuralComplexity,
  type ProjectInput,
  useCreateEstimate,
} from "@/lib/mock-api";
import { Building2, Calculator, ChevronLeft, ChevronRight, ClipboardList, Home, Layers3, MapPin, ShieldCheck, Users } from "lucide-react";

const stepConfig = [
  { title: "Project Information", icon: ClipboardList },
  { title: "Owner Information", icon: Users },
  { title: "Primary User", icon: Users },
  { title: "Planning Profile", icon: Home },
  { title: "Building Details", icon: Building2 },
  { title: "Site + Fees", icon: ShieldCheck },
];

const formatAgeGroup = (ageGroup: string) => {
  if (ageGroup === "under-25") return "Under 25";
  if (ageGroup === "55-plus") return "55+";
  return ageGroup.replace("-", " – ");
};

const estimateSchema = z.object({
  userId: z.number().optional(),
  projectName: z.string().min(2, "Project name is required."),
  location: z.string().min(1, "Location is required."),
  buildingType: z.enum(BUILDING_TYPES),
  owner: z.object({
    name: z.string().min(2, "Owner name is required."),
    ageGroup: z.enum(AGE_GROUPS),
    profession: z.string().min(2, "Owner profession is required."),
    religion: z.enum(RELIGIONS),
  }),
  primaryUser: z.object({
    name: z.string().min(2, "Primary user name is required."),
    ageGroup: z.enum(AGE_GROUPS),
    profession: z.string().min(2, "Primary user profession is required."),
    religion: z.enum(RELIGIONS),
  }),
  floorArea: z.coerce.number().min(10, "Floor area must be at least 10 m²."),
  numberOfFloors: z.coerce.number().min(1, "Number of floors must be at least 1."),
  numberOfBedrooms: z.coerce.number().min(0),
  numberOfBathrooms: z.coerce.number().min(0),
  roofType: z.enum(ROOF_TYPES),
  soilCondition: z.enum(SOIL_CONDITIONS),
  siteAccessibility: z.enum(SITE_ACCESSIBILITY),
  finishLevel: z.enum(FINISH_LEVELS),
  buildingShape: z.enum(BUILDING_SHAPES),
  basement: z.boolean(),
  largeOpenSpaces: z.boolean(),
  cantileversOrBalconies: z.boolean(),
  roofComplexity: z.enum(ROOF_COMPLEXITIES),
  architecturalScope: z.enum(ARCHITECTURAL_SCOPES),
  foundationType: z.enum(FOUNDATION_TYPES),
  structuralSystem: z.enum(STRUCTURAL_SYSTEMS),
});

type FormValues = z.infer<typeof estimateSchema>;

function StepButton({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border px-4 py-3 text-left transition-all hover:border-primary hover:bg-primary/5 ${selected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-background"}`}
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
      location: "accra",
      buildingType: "Residential",
      owner: {
        name: "",
        ageGroup: "35-44",
        profession: "",
        religion: "Christianity",
      },
      primaryUser: {
        name: "",
        ageGroup: "35-44",
        profession: "",
        religion: "Christianity",
      },
      floorArea: 120,
      numberOfFloors: 1,
      numberOfBedrooms: 3,
      numberOfBathrooms: 2,
      roofType: "Gable",
      soilCondition: "Normal",
      siteAccessibility: "Urban",
      finishLevel: "Standard",
      buildingShape: "Rectangular",
      basement: false,
      largeOpenSpaces: false,
      cantileversOrBalconies: false,
      roofComplexity: "Simple",
      architecturalScope: "Full Design",
      foundationType: "Strip",
      structuralSystem: "Reinforced Concrete Frame",
    },
    mode: "onTouched",
  });

  const watchedValues = form.watch();
  const complexity = useMemo(() => calculateStructuralComplexity(watchedValues as ProjectInput), [watchedValues]);
  const progress = ((currentStep + 1) / stepConfig.length) * 100;

  const currentStepTitle = stepConfig[currentStep].title;

  const nextStep = async () => {
    const stepFields: Record<number, Array<keyof FormValues | string>> = {
      0: ["projectName", "location", "buildingType"],
      1: ["owner.name", "owner.ageGroup", "owner.profession", "owner.religion"],
      2: ["primaryUser.name", "primaryUser.ageGroup", "primaryUser.profession", "primaryUser.religion"],
      3: ["floorArea", "numberOfFloors", "numberOfBedrooms", "numberOfBathrooms", "roofType", "buildingShape"],
      4: ["soilCondition", "siteAccessibility", "basement", "largeOpenSpaces", "cantileversOrBalconies", "roofComplexity"],
      5: ["finishLevel", "architecturalScope", "foundationType", "structuralSystem"],
    };

    const valid = await form.trigger(stepFields[currentStep] as never[]);
    if (valid) {
      setCurrentStep((value) => Math.min(value + 1, stepConfig.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((value) => Math.max(value - 1, 0));
    window.scrollTo(0, 0);
  };

  const onSubmit = (values: FormValues) => {
    createEstimate(
      { data: values as ProjectInput },
      {
        onSuccess: (record) => {
          setLocation(`/results/${record.id}`);
        },
      },
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-8 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              <Calculator className="h-4 w-4" />
              Project estimation workflow
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Create a new project estimate</h1>
            <p className="text-muted-foreground">
              Owner details and primary user details are collected separately before the planning profile, then we calculate costs, fees, and complexity automatically.
            </p>
          </div>

          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Complexity engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Score</span>
                <span className="font-semibold font-data">{complexity.score}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Level</span>
                <span className="font-semibold">{complexity.label}</span>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                The score updates as shape, floors, basement, open spaces, cantilevers, and roof complexity change.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>Step {currentStep + 1} of {stepConfig.length}</span>
            <span>{currentStepTitle}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-6 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Project Information
                    </h2>

                    <FormField
                      control={form.control}
                      name="projectName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Osei Family Residence" {...field} />
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
                          <FormLabel>Location</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LOCATION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buildingType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Building Type</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid gap-3 md:grid-cols-3">
                              {BUILDING_TYPES.map((type) => (
                                <StepButton key={type} selected={field.value === type} onSelect={() => field.onChange(type)}>
                                  <div className="font-semibold">{type}</div>
                                </StepButton>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Owner Information
                    </h2>

                    <FormField
                      control={form.control}
                      name="owner.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Owner full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="owner.ageGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Group</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select age group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {AGE_GROUPS.map((ageGroup) => (
                                <SelectItem key={ageGroup} value={ageGroup}>
                                  {formatAgeGroup(ageGroup)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="owner.profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession</FormLabel>
                          <FormControl>
                            <Input list="professions" placeholder="Owner profession" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="owner.religion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Religion</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select religion" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RELIGIONS.map((religion) => (
                                <SelectItem key={religion} value={religion}>
                                  {religion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Primary User
                    </h2>

                    <FormField
                      control={form.control}
                      name="primaryUser.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary User Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Primary user full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryUser.ageGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Group</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select age group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {AGE_GROUPS.map((ageGroup) => (
                                <SelectItem key={ageGroup} value={ageGroup}>
                                  {formatAgeGroup(ageGroup)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryUser.profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession</FormLabel>
                          <FormControl>
                            <Input list="professions" placeholder="Primary user profession" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primaryUser.religion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Religion</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select religion" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {RELIGIONS.map((religion) => (
                                <SelectItem key={religion} value={religion}>
                                  {religion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      Planning Profile
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="floorArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floor Area (m²)</FormLabel>
                            <FormControl>
                              <Input type="number" min={10} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="numberOfFloors"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Floors</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="numberOfBedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Bedrooms</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="numberOfBathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Bathrooms</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="roofType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roof Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select roof type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ROOF_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="buildingShape"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Building Shape</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="grid gap-3 md:grid-cols-2">
                              {BUILDING_SHAPES.map((shape) => (
                                <StepButton key={shape} selected={field.value === shape} onSelect={() => field.onChange(shape)}>
                                  {shape}
                                </StepButton>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Layers3 className="h-5 w-5 text-primary" />
                      Site Conditions
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="soilCondition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soil Condition</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select soil condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SOIL_CONDITIONS.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="siteAccessibility"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Accessibility</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select access level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SITE_ACCESSIBILITY.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="basement"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Basement</FormLabel>
                              <p className="text-sm text-muted-foreground">Yes / No</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="largeOpenSpaces"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Large Open Spaces</FormLabel>
                              <p className="text-sm text-muted-foreground">Yes / No</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cantileversOrBalconies"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Cantilevers / Balconies</FormLabel>
                              <p className="text-sm text-muted-foreground">Yes / No</p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="roofComplexity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roof Complexity</FormLabel>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="grid gap-3 md:grid-cols-3">
                            {ROOF_COMPLEXITIES.map((option) => (
                              <StepButton key={option} selected={field.value === option} onSelect={() => field.onChange(option)}>
                                {option}
                              </StepButton>
                            ))}
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Finish Level and Professional Services
                    </h2>

                    <FormField
                      control={form.control}
                      name="finishLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Finish Level</FormLabel>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="grid gap-3 md:grid-cols-3">
                            {FINISH_LEVELS.map((level) => (
                              <StepButton key={level} selected={field.value === level} onSelect={() => field.onChange(level)}>
                                {level}
                              </StepButton>
                            ))}
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="architecturalScope"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scope of Service</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select scope" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ARCHITECTURAL_SCOPES.map((scope) => (
                                  <SelectItem key={scope} value={scope}>
                                    {scope}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="foundationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Foundation Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select foundation type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {FOUNDATION_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="structuralSystem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Structural System</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select structural system" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {STRUCTURAL_SYSTEMS.map((system) => (
                                  <SelectItem key={system} value={system}>
                                    {system}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="rounded-2xl border bg-muted/40 p-5">
                      <h3 className="font-semibold mb-2">Automatic complexity summary</h3>
                      <p className="text-sm text-muted-foreground">
                        Score: <span className="font-semibold text-foreground">{complexity.score}</span> · Level: <span className="font-semibold text-foreground">{complexity.label}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        This score will feed into the fee formulas, labour estimate, and duration estimate when the project is saved.
                      </p>
                    </div>
                  </div>
                )}

                <datalist id="professions">
                  {PROFESSIONS.map((profession) => (
                    <option key={profession} value={profession} />
                  ))}
                </datalist>

                <div className="flex justify-between pt-6 border-t">
                  {currentStep > 0 ? (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  ) : (
                    <span />
                  )}

                  {currentStep < stepConfig.length - 1 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Saving estimate..." : "Generate Estimate"}
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
