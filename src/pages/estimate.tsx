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
  ACCESS_ROADS,
  BUILDING_SHAPES,
  BUILDING_TYPES,
  BUILDING_USES,
  COLOUR_SCHEMES,
  CONSTRUCTION_METHODS,
  CONSTRUCTION_PHASES,
  DESIGN_STYLES,
  ENVIRONMENTAL_SENSITIVITIES,
  ENVIRONMENTAL_ZONES,
  EXPECTED_COMPLETION_TIMES,
  FINISH_LEVELS,
  FOUNDATION_TYPES,
  LAND_TENURES,
  MARITAL_STATUSES,
  LOCATION_OPTIONS,
  SOCIAL_STATUSES,
  NATURAL_FEATURES,
  NEIGHBOURHOOD_CHARACTER,
  OWN_LAND_OPTIONS,
  PROFESSIONS,
  PROJECT_COMPLEXITIES,
  PROJECT_TYPES,
  RELIGIONS,
  ROOF_COMPLEXITIES,
  ROOF_TYPES,
  SITE_ACCESSIBILITY,
  SITE_ZONE_TYPES,
  SOIL_CONDITIONS,
  STRUCTURAL_SYSTEMS,
  TOPOGRAPHIES,
  VIEWS,
  calculateStructuralComplexity,
  type ProjectInput,
  useCreateEstimate,
} from "@/lib/mock-api";
import { Building2, Calculator, ChevronLeft, ChevronRight, ClipboardList, Home, Layers3, MapPin, ShieldCheck, Users } from "lucide-react";

const stepConfig = [
  { title: "Project Information", icon: ClipboardList },
  { title: "Client Information", icon: Users },
  { title: "Land Information", icon: MapPin },
  { title: "Project Parameters", icon: ClipboardList },
  { title: "Planning Profile", icon: Home },
  { title: "Site Conditions", icon: Layers3 },
  { title: "Professional Services", icon: Building2 },
  { title: "Referral & Finish", icon: ShieldCheck },
];

const formatAgeGroup = (ageGroup: string) => {
  if (ageGroup === "under-25") return "Under 25";
  if (ageGroup === "55-plus") return "55+";
  return ageGroup.replace("-", " - ");
};

const estimateSchema = z.object({
  userId: z.number().optional(),
  projectName: z.string().min(2, "Project name is required."),
  location: z.string().min(1, "Location is required."),
  buildingType: z.enum(BUILDING_TYPES),
  projectType: z.enum(PROJECT_TYPES),
  constructionPhasing: z.enum(CONSTRUCTION_PHASES),
  expectedCompletionTime: z.enum(EXPECTED_COMPLETION_TIMES),
  projectComplexity: z.enum(PROJECT_COMPLEXITIES),
  preferredColourScheme: z.enum(COLOUR_SCHEMES),
  designStyle: z.enum(DESIGN_STYLES),
  owner: z.object({
    name: z.string().optional(),
    ageGroup: z.enum(AGE_GROUPS),
    profession: z.string().min(2, "Owner profession is required."),
    religion: z.enum(RELIGIONS),
    annualIncome: z.coerce.number().min(0, "Owner annual income is required."),
    ethnicity: z.string().optional(),
    socialStatus: z.enum(SOCIAL_STATUSES).optional(),
    maritalStatus: z.enum(MARITAL_STATUSES).optional(),
  }),
  primaryUser: z.object({
    name: z.string().optional(),
    ageGroup: z.enum(AGE_GROUPS),
    profession: z.string().min(2, "Primary user profession is required."),
    religion: z.enum(RELIGIONS),
    ethnicity: z.string().optional(),
    socialStatus: z.enum(SOCIAL_STATUSES).optional(),
    maritalStatus: z.enum(MARITAL_STATUSES).optional(),
  }),
  projectBudget: z.coerce.number().min(0, "Project budget must be zero or more."),
  floorArea: z.coerce.number().min(10, "Floor area must be at least 10 m²."),
  numberOfFloors: z.coerce.number().min(1, "Number of floors must be at least 1."),
  numberOfBedrooms: z.coerce.number().min(0),
  numberOfBathrooms: z.coerce.number().min(0),
  roofType: z.enum(ROOF_TYPES),
  soilCondition: z.enum(SOIL_CONDITIONS),
  siteAccessibility: z.enum(SITE_ACCESSIBILITY),
  finishLevel: z.enum(FINISH_LEVELS),
  buildingShape: z.enum(BUILDING_SHAPES),
  buildingUse: z.enum(BUILDING_USES),
  constructionMethod: z.enum(CONSTRUCTION_METHODS),
  ownLand: z.enum(OWN_LAND_OPTIONS),
  landDocumentsHeld: z.string().optional(),
  landAssistanceBuyLand: z.boolean(),
  landAssistanceRegularizeDocuments: z.boolean(),
  landAssistanceRedemarcateLand: z.boolean(),
  sitePlanAvailable: z.boolean(),
  landTitleAvailable: z.boolean(),
  indentureAvailable: z.boolean(),
  landTenure: z.enum(LAND_TENURES),
  plotSize: z.coerce.number().min(0, "Plot size must be zero or more."),
  zoning: z.string().min(1, "Zoning is required."),
  environmentalZone: z.enum(ENVIRONMENTAL_ZONES),
  siteZoneType: z.enum(SITE_ZONE_TYPES),
  environmentalSensitivity: z.enum(ENVIRONMENTAL_SENSITIVITIES),
  siteTopography: z.enum(TOPOGRAPHIES),
  soilSurvey: z.boolean(),
  topographicSurvey: z.boolean(),
  naturalFeatures: z.enum(NATURAL_FEATURES),
  views: z.enum(VIEWS),
  accessRoads: z.enum(ACCESS_ROADS),
  neighbourhoodCharacter: z.enum(NEIGHBOURHOOD_CHARACTER),
  existingUtilities: z.enum(["Available", "Partial", "Not Available"] as const),
  environmentalConstraints: z.enum(ENVIRONMENTAL_SENSITIVITIES),
  basement: z.boolean(),
  largeOpenSpaces: z.boolean(),
  cantileversOrBalconies: z.boolean(),
  roofComplexity: z.enum(ROOF_COMPLEXITIES),
  architecturalScope: z.enum(ARCHITECTURAL_SCOPES),
  foundationType: z.enum(FOUNDATION_TYPES),
  structuralSystem: z.enum(STRUCTURAL_SYSTEMS),
  architecturalServices: z.boolean(),
  structuralEngineeringServices: z.boolean(),
  mepEngineering: z.boolean(),
  interiorDesign: z.boolean(),
  customElements: z.boolean(),
  postContractServices: z.boolean(),
  architectReferral: z.boolean(),
  serviceReferral: z.boolean(),
  referralPercentage: z.coerce.number().min(0, "Referral percentage must be zero or more."),
  complimentaryServices: z.boolean(),
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
      projectType: "New Build",
      constructionPhasing: "Single Phase",
      expectedCompletionTime: "12 months",
      projectComplexity: "Medium",
      preferredColourScheme: "Neutral",
      designStyle: "Balanced",
      projectBudget: 0,
      owner: {
        name: "",
        ageGroup: "35-44",
        profession: "",
        religion: "Christianity",
        annualIncome: 0,
        ethnicity: "",
        socialStatus: "Employed",
        maritalStatus: "Single",
      },
      primaryUser: {
        name: "",
        ageGroup: "35-44",
        profession: "",
        religion: "Christianity",
        ethnicity: "",
        socialStatus: "Employed",
        maritalStatus: "Single",
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
      buildingUse: "Single-family residence",
      constructionMethod: "Conventional",
      ownLand: "Yes",
      landDocumentsHeld: "",
      landAssistanceBuyLand: false,
      landAssistanceRegularizeDocuments: false,
      landAssistanceRedemarcateLand: false,
      sitePlanAvailable: false,
      landTitleAvailable: false,
      indentureAvailable: false,
      landTenure: "Freehold",
      plotSize: 0,
      zoning: "Residential",
      environmentalZone: "Cultural sensitivity",
      siteZoneType: "Residential",
      environmentalSensitivity: "Low",
      siteTopography: "Flat",
      soilSurvey: false,
      topographicSurvey: false,
      naturalFeatures: "None",
      views: "Open",
      accessRoads: "Good",
      neighbourhoodCharacter: "Residential",
      existingUtilities: "Available",
      environmentalConstraints: "Low",
      basement: false,
      largeOpenSpaces: false,
      cantileversOrBalconies: false,
      roofComplexity: "Simple",
      architecturalScope: "Full Design",
      foundationType: "Strip",
      structuralSystem: "Reinforced Concrete Frame",
      architecturalServices: true,
      structuralEngineeringServices: true,
      mepEngineering: false,
      interiorDesign: false,
      customElements: false,
      postContractServices: false,
      architectReferral: false,
      serviceReferral: false,
      referralPercentage: 0,
      complimentaryServices: false,
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
      1: ["owner.name", "owner.ageGroup", "owner.profession", "owner.annualIncome", "owner.religion", "owner.ethnicity", "owner.socialStatus", "owner.maritalStatus", "primaryUser.name", "primaryUser.ageGroup", "primaryUser.profession", "primaryUser.religion", "primaryUser.ethnicity", "primaryUser.socialStatus", "primaryUser.maritalStatus"],
      2: ["ownLand", "landDocumentsHeld", "landAssistanceBuyLand", "landAssistanceRegularizeDocuments", "landAssistanceRedemarcateLand", "landTenure", "plotSize", "zoning", "environmentalZone"],
      3: ["projectBudget", "projectType", "constructionPhasing", "expectedCompletionTime", "projectComplexity", "preferredColourScheme", "designStyle", "buildingUse", "constructionMethod"],
      4: ["floorArea", "numberOfFloors", "numberOfBedrooms", "numberOfBathrooms", "roofType", "buildingShape"],
      5: [
        "soilCondition",
        "siteAccessibility",
        "sitePlanAvailable",
        "landTitleAvailable",
        "indentureAvailable",
        "siteZoneType",
        "environmentalSensitivity",
        "siteTopography",
        "soilSurvey",
        "topographicSurvey",
        "naturalFeatures",
        "views",
        "accessRoads",
        "neighbourhoodCharacter",
        "existingUtilities",
        "environmentalConstraints",
        "basement",
        "largeOpenSpaces",
        "cantileversOrBalconies",
        "roofComplexity",
      ],
      6: [
        "architecturalServices",
        "structuralEngineeringServices",
        "mepEngineering",
        "interiorDesign",
        "customElements",
        "postContractServices",
        "finishLevel",
        "architecturalScope",
        "foundationType",
        "structuralSystem",
      ],
      7: [
        "architectReferral",
        "serviceReferral",
        "referralPercentage",
        "complimentaryServices",
      ],
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
                  <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Owner Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <FormField
                          control={form.control}
                          name="owner.name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Owner Name (Optional)</FormLabel>
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
                          name="owner.annualIncome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Income</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} placeholder="Owner annual income" {...field} />
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

                        <FormField
                          control={form.control}
                          name="owner.ethnicity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ethnicity</FormLabel>
                              <FormControl>
                                <Input placeholder="Owner ethnicity" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="owner.socialStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Social Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select social status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SOCIAL_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
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
                          name="owner.maritalStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marital Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select marital status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {MARITAL_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Card className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Primary User Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <FormField
                          control={form.control}
                          name="primaryUser.name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary User Name (Optional)</FormLabel>
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

                        <FormField
                          control={form.control}
                          name="primaryUser.ethnicity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ethnicity</FormLabel>
                              <FormControl>
                                <Input placeholder="Primary user ethnicity" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="primaryUser.socialStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Social Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select social status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SOCIAL_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
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
                          name="primaryUser.maritalStatus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marital Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select marital status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {MARITAL_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Land Information
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="ownLand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Own Land</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Yes / No / Maybe" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {OWN_LAND_OPTIONS.map((option) => (
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
                        name="landTenure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tenure</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tenure" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {LAND_TENURES.map((option) => (
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

                    {watchedValues.ownLand === "Yes" && (
                      <FormField
                        control={form.control}
                        name="landDocumentsHeld"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Land Document Held</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Title deed, allocation letter, lease agreement" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {watchedValues.ownLand === "Maybe" && (
                      <div className="grid gap-4 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="landAssistanceBuyLand"
                          render={({ field }) => (
                            <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Assistance to Buy Land</FormLabel>
                                <p className="text-sm text-muted-foreground">Help finding and purchasing land</p>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="landAssistanceRegularizeDocuments"
                          render={({ field }) => (
                            <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Regularize Documents</FormLabel>
                                <p className="text-sm text-muted-foreground">Help fixing land paperwork</p>
                              </div>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="landAssistanceRedemarcateLand"
                          render={({ field }) => (
                            <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Re-demarcate Land</FormLabel>
                                <p className="text-sm text-muted-foreground">Help redefining land boundaries</p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="zoning"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zoning</FormLabel>
                            <FormControl>
                              <Input placeholder="Zoning" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="environmentalZone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Environmental Zone</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select environmental zone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ENVIRONMENTAL_ZONES.map((option) => (
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
                      name="plotSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plot Size (m²)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Project Parameters
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="projectBudget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Budget</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="projectType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select project type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PROJECT_TYPES.map((option) => (
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

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="buildingUse"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Building Use</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select building use" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BUILDING_USES.map((option) => (
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
                        name="constructionMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Construction Method</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select construction method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CONSTRUCTION_METHODS.map((option) => (
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

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="constructionPhasing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Construction Phasing</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select phasing" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CONSTRUCTION_PHASES.map((option) => (
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
                        name="expectedCompletionTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Completion Time</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a timeline" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {EXPECTED_COMPLETION_TIMES.map((option) => (
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

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="projectComplexity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Complexity</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select complexity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PROJECT_COMPLEXITIES.map((option) => (
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
                        name="preferredColourScheme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Colour Scheme</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select colour scheme" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COLOUR_SCHEMES.map((option) => (
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

                    <FormField
                      control={form.control}
                      name="designStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Design Style</FormLabel>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="grid gap-3 md:grid-cols-3">
                            {DESIGN_STYLES.map((style) => (
                              <StepButton key={style} selected={field.value === style} onSelect={() => field.onChange(style)}>
                                {style}
                              </StepButton>
                            ))}
                          </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 4 && (
                  <>
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        Planning Profile
                      </h2>
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
                  </>
                )}{currentStep === 5 && (
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

                    <div className="grid md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="sitePlanAvailable"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Site Plan Available</FormLabel>
                              <p className="text-sm text-muted-foreground">Yes / No</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="landTitleAvailable"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Land Title Available</FormLabel>
                              <p className="text-sm text-muted-foreground">Yes / No</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="indentureAvailable"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Indenture Available</FormLabel>
                              <p className="text-sm text-muted-foreground">Yes / No</p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="siteZoneType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Zone Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select site zone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SITE_ZONE_TYPES.map((option) => (
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
                        name="environmentalSensitivity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Environmental Sensitivity</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sensitivity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ENVIRONMENTAL_SENSITIVITIES.map((option) => (
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

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="siteTopography"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Topography</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select topography" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TOPOGRAPHIES.map((option) => (
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
                        name="existingUtilities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Existing Utilities</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select utility status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {['Available', 'Partial', 'Not Available'].map((option) => (
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

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="environmentalConstraints"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Environmental Constraints</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select constraints" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ENVIRONMENTAL_SENSITIVITIES.map((option) => (
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
                        name="neighbourhoodCharacter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Neighbourhood Character</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select character" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {NEIGHBOURHOOD_CHARACTER.map((option) => (
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

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="views"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Views</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select views" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {VIEWS.map((option) => (
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
                        name="accessRoads"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Roads</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select access roads" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ACCESS_ROADS.map((option) => (
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
                        name="soilSurvey"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Soil Survey</FormLabel>
                              <p className="text-sm text-muted-foreground">Yes / No</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="topographicSurvey"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Topographic Survey</FormLabel>
                              <p className="text-sm text-muted-foreground">Yes / No</p>
                            </div>
                          </FormItem>
                        )}
                      />
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
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
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
                  </div>
                )}

                {currentStep === 6 && (
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

                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="architecturalServices"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Architectural Services</FormLabel>
                              <p className="text-sm text-muted-foreground">Include architectural services</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="structuralEngineeringServices"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Structural Engineering</FormLabel>
                              <p className="text-sm text-muted-foreground">Include structural engineering services</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mepEngineering"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>MEP Engineering</FormLabel>
                              <p className="text-sm text-muted-foreground">Include MEP engineering services</p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="interiorDesign"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Interior Design</FormLabel>
                              <p className="text-sm text-muted-foreground">Include interior design services</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customElements"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Custom Elements</FormLabel>
                              <p className="text-sm text-muted-foreground">Include custom architectural elements</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postContractServices"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Post-Contract Services</FormLabel>
                              <p className="text-sm text-muted-foreground">Include post-contract support</p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="rounded-2xl border bg-muted/40 p-5">
                      <h3 className="font-semibold mb-2">Automatic complexity summary</h3>
                      <p className="text-sm text-muted-foreground">
                        Score: <span className="font-semibold text-foreground">{complexity.score}</span> - Level: <span className="font-semibold text-foreground">{complexity.label}</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        This score will feed into the fee formulas, labour estimate, and duration estimate when the project is saved.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Referral & Finish
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="architectReferral"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Architect Referral</FormLabel>
                              <p className="text-sm text-muted-foreground">Recommend an architect referral</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serviceReferral"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Service Referral</FormLabel>
                              <p className="text-sm text-muted-foreground">Recommend a service referral</p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="referralPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referral Percentage</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="complimentaryServices"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Complimentary Services</FormLabel>
                              <p className="text-sm text-muted-foreground">Include complimentary services</p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="rounded-2xl border bg-muted/40 p-5">
                      <h3 className="font-semibold mb-2">Final review</h3>
                      <p className="text-sm text-muted-foreground">
                        Review the referral and finish settings before generating your project estimate. These values will be included in the final professional fee and service recommendations.
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



