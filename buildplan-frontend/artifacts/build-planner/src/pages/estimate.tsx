import { Component, useEffect, useMemo, useState, type ReactNode } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ARCHITECTURAL_SCOPES,
  ARCHITECTURAL_STYLES,
  AGE_GROUPS,
  ACCESS_ROADS,
  ACCESS_WAYS,
  BUILDING_SHAPES,
  BUILDING_STYLES,
  BUILDING_TYPES,
  CONSTRUCTION_METHODS,
  CONSTRUCTION_PHASES,
  DESIGN_STYLES,
  ENVIRONMENTAL_ZONES,
  EXPECTED_COMPLETION_TIMES,
  FINISH_LEVELS,
  FOUNDATION_TYPES,
  LAND_TENURES,
  MARITAL_STATUSES,
  LOCATION_OPTIONS,
  SOCIAL_STATUSES,
  NATURAL_FEATURES,
  OPEN_AREA_CONCEPTS,
  OWN_LAND_OPTIONS,
  ORIENTATION_OPTIONS,
  PROFESSIONS,
  PROJECT_COMPLEXITIES,
  PROJECT_TYPES,
  RELIGIONS,
  ROOF_COMPLEXITIES,
  ROOF_STYLES,
  ROOF_TYPES,
  SITE_ACCESSIBILITY,
  SITE_ZONE_TYPES,
  SOIL_CONDITIONS,
  STRUCTURAL_SYSTEMS,
  TOPOGRAPHIES,
  ZONING_OPTIONS,
  calculateStructuralComplexity,
  type ProjectInput,
  useCreateEstimate,
} from "@/lib/mock-api";
import { MultiSelectInput } from "@/components/ui/multi-select-input";
import { CURRENCIES, LENGTH_UNITS, AREA_UNITS, formatCurrency, parseCurrency, formatNumberWithCommas } from "@/lib/i18n";
import { Building2, Calculator, ChevronLeft, ChevronRight, ClipboardList, Home, Layers3, MapPin, ShieldCheck, Users } from "lucide-react";

const stepConfig = [
  { title: "People Information", icon: Users },
  { title: "Land Information", icon: MapPin },
  { title: "Site Features", icon: Layers3 },
  { title: "Let's get right into the projects.", icon: ClipboardList },
  { title: "Developed Brief", icon: Home },
];

const ADD_ON_SERVICE_OPTIONS = [
  "Site visits",
  "Location verification",
  "Fencing",
  "Surveillance",
  "Storage",
  "Soil survey",
  "Topo survey",
] as const;

const formatAgeGroup = (ageGroup: string) => {
  if (ageGroup === "under-25") return "Under 25";
  if (ageGroup === "55-plus") return "55+";
  return ageGroup.replace("-", " - ");
};

const estimateSchema = z.object({
  userId: z.number().optional(),
  projectName: z.string().min(2, "Project name is required."),
  location: z.string().min(1, "Location is required."),
  landmark: z.string().optional(),
  buildingType: z.string(),
  projectType: z.enum(PROJECT_TYPES),
  constructionPhasing: z.enum(CONSTRUCTION_PHASES),
  expectedCompletionTime: z.enum(EXPECTED_COMPLETION_TIMES),
  projectComplexity: z.enum(PROJECT_COMPLEXITIES),
  designStyle: z.enum(DESIGN_STYLES),
  projectBudget: z.coerce.number().min(0).optional(),
  projectBudgetCurrency: z.string().optional(),
  constructionFeeStructure: z.enum(["Single", "Double", "Multiple"]).optional(),
  openAreaConcept: z.enum(OPEN_AREA_CONCEPTS).optional(),
  architecturalStyle: z.enum(ARCHITECTURAL_STYLES).optional(),
  owner: z.object({
    name: z.string().optional(),
    profession: z.string().min(2, "Owner profession is required."),
    annualIncome: z.coerce.number().min(0, "Owner annual income is required."),
    currency: z.string().optional(),
    ageGroup: z.enum(AGE_GROUPS),
    religion: z.enum(RELIGIONS),
    ethnicity: z.string().optional(),
    socialStatus: z.string().optional(),
    maritalStatus: z.enum(MARITAL_STATUSES).optional(),
  }),
  primaryUser: z.object({
    name: z.string().optional(),
    profession: z.string().min(2, "Primary user profession is required."),
    annualIncome: z.coerce.number().min(0, "Primary user annual income is required."),
    currency: z.string().optional(),
    ageGroup: z.enum(AGE_GROUPS),
    religion: z.enum(RELIGIONS),
    ethnicity: z.string().optional(),
    socialStatus: z.string().optional(),
    maritalStatus: z.enum(MARITAL_STATUSES).optional(),
  }),
  primaryUserSameAsOwner: z.boolean().optional(),
  floorArea: z.coerce.number().min(10, "Floor area must be at least 10 m2."),
  spacesRequired: z.array(z.object({
    name: z.string(),
    dimensions: z.string().optional(),
    quantity: z.coerce.number().min(1).default(1),
    area: z.coerce.number().optional(),
    notes: z.string().optional(),
  })).optional(),
  measurement: z.string().optional(),
  plotLength: z.coerce.number().min(0, "Plot length must be zero or more.").optional(),
  plotBreadth: z.coerce.number().min(0, "Plot breadth must be zero or more.").optional(),
  numberOfFloors: z.coerce.number().min(1, "Number of floors must be at least 1."),
  numberOfBedrooms: z.coerce.number().min(0),
  numberOfBathrooms: z.coerce.number().min(0),
  roofType: z.enum(ROOF_TYPES),
  soilCondition: z.enum(SOIL_CONDITIONS),
  siteAccessibility: z.enum(SITE_ACCESSIBILITY),
  finishLevel: z.enum(FINISH_LEVELS),
  buildingShape: z.enum(BUILDING_SHAPES),
  constructionMethod: z.enum(CONSTRUCTION_METHODS),
  ownLand: z.enum(OWN_LAND_OPTIONS),
  landDocumentsHeld: z.string().optional(),
  landAssistanceBuyLand: z.boolean(),
  landAssistanceSiteSelection: z.boolean(),
  sitePlanAvailable: z.boolean(),
  landTitleAvailable: z.boolean(),
  indentureAvailable: z.boolean(),
  landTenure: z.enum(LAND_TENURES),
  yearsLeftOnLease: z.coerce.number().min(0).optional(),
  plotSize: z.coerce.number().min(0, "Plot size must be zero or more."),
  plotAreaUnit: z.string().optional(),
  plotLengthUnit: z.string().optional(),
  plotBreadthUnit: z.string().optional(),
  isIrregularSite: z.boolean().optional(),
  sitePlanImage: z.string().optional(),
  zoning: z.enum(ZONING_OPTIONS),
  environmentalZone: z.enum(ENVIRONMENTAL_ZONES),
  siteZoneType: z.string().optional(),
  siteTopography: z.enum(TOPOGRAPHIES),
  hasVisitedLand: z.boolean().optional(),
  tellUsMore: z.string().optional(),
  soilSurvey: z.boolean(),
  soilSurveyFile: z.string().optional(),
  topographicSurvey: z.boolean(),
  topographicSurveyFile: z.string().optional(),
  specialViews: z.boolean(),
  viewLocation: z.string().optional(),
  featuresOfViews: z.string().optional(),
  naturalFeatures: z.string().optional(),
  naturalFeatureNotes: z.string().optional(),
  accessRoads: z.enum(ACCESS_ROADS),
  accessWays: z.string().optional(),
  orientation: z.string().optional(),
  buildingStyle: z.string().optional(),
  neighbourhoodCharacter: z.string().optional(),
  existingUtilities: z.string().optional(),
  roofStyle: z.enum(ROOF_STYLES).optional(),
  basement: z.boolean(),
  largeOpenSpaces: z.boolean(),
  cantileversOrBalconies: z.boolean(),
  roofComplexity: z.enum(ROOF_COMPLEXITIES).optional(),
  architecturalScope: z.enum(ARCHITECTURAL_SCOPES),
  foundationType: z.enum(FOUNDATION_TYPES),
  structuralSystem: z.enum(STRUCTURAL_SYSTEMS),
  architecturalServices: z.boolean(),
  structuralEngineeringServices: z.boolean(),
  mepEngineering: z.boolean(),
  interiorDesign: z.boolean(),
  customElements: z.boolean(),
  postContractServices: z.boolean(),
  selectedAddOnServices: z.array(z.enum(ADD_ON_SERVICE_OPTIONS)).optional(),
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

class StepErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Unknown rendering error" };
  }

  componentDidCatch(error: Error) {
    console.error("Estimate wizard render error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border border-destructive/40 bg-destructive/5">
          <CardContent className="p-6 space-y-2">
            <h2 className="text-lg font-semibold text-destructive">The step crashed while rendering</h2>
            <p className="text-sm text-muted-foreground">{this.state.message}</p>
            <p className="text-sm text-muted-foreground">
              Please share the error message from this screen or your browser console so we can fix the exact field.
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default function EstimateForm() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
      projectComplexity: "Moderate",
      designStyle: "Balanced",
      projectBudget: 0,
      projectBudgetCurrency: "USD",
      constructionFeeStructure: "Single",
      owner: {
        name: "",
        profession: "",
        annualIncome: 0,
        currency: "USD",
        ageGroup: "35-44",
        religion: "Christianity",
        ethnicity: "",
        socialStatus: "Employed",
        maritalStatus: "Single",
      },
      primaryUser: {
        name: "",
        profession: "",
        annualIncome: 0,
        currency: "USD",
        ageGroup: "35-44",
        religion: "Christianity",
        ethnicity: "",
        socialStatus: "Employed",
        maritalStatus: "Single",
      },
      floorArea: 120,
      spacesRequired: [],
      measurement: "",
      plotLength: 20,
      plotBreadth: 10,
      numberOfFloors: 1,
      numberOfBedrooms: 3,
      numberOfBathrooms: 2,
      roofType: "Gable",
      soilCondition: "Normal",
      siteAccessibility: "Urban",
      finishLevel: "Standard",
      buildingShape: "Rectangular",
      constructionMethod: "Conventional",
      ownLand: "Yes",
      landDocumentsHeld: "",
      landAssistanceBuyLand: false,
      landAssistanceSiteSelection: false,
      sitePlanAvailable: false,
      landTitleAvailable: false,
      indentureAvailable: false,
      landTenure: "Freehold",
      yearsLeftOnLease: 0,
      plotSize: 0,
      plotAreaUnit: "m²",
      plotLengthUnit: "m",
      plotBreadthUnit: "m",
      isIrregularSite: false,
      sitePlanImage: "",
      zoning: "Residential",
      environmentalZone: "Environmentally sensitive",
      siteZoneType: "",
      siteTopography: "Flat",
      hasVisitedLand: false,
      tellUsMore: "",
      soilSurvey: false,
      soilSurveyFile: "",
      topographicSurvey: false,
      topographicSurveyFile: "",
      specialViews: false,
      viewLocation: "",
      featuresOfViews: "",
      naturalFeatures: "",
      naturalFeatureNotes: "",
      accessRoads: "Good",
      accessWays: "",
      orientation: "",
      buildingStyle: "",
      neighbourhoodCharacter: "",
      existingUtilities: "",
      roofStyle: "Flat",
      basement: false,
      largeOpenSpaces: false,
      cantileversOrBalconies: false,
      roofComplexity: undefined,
      architecturalScope: "Full Design",
      foundationType: "Strip",
      structuralSystem: "Reinforced Concrete Frame",
      architecturalServices: true,
      structuralEngineeringServices: true,
      mepEngineering: false,
      interiorDesign: false,
      customElements: false,
      postContractServices: false,
      selectedAddOnServices: [],
      architectReferral: false,
      serviceReferral: false,
      referralPercentage: 0,
      complimentaryServices: false,
      primaryUserSameAsOwner: false,
    },
    mode: "onTouched",
  });

  const watchedValues = form.watch();
  const complexity = useMemo(() => calculateStructuralComplexity(watchedValues as ProjectInput), [watchedValues]);
  const ownLand = form.watch("ownLand");
  const plotLength = form.watch("plotLength");
  const plotBreadth = form.watch("plotBreadth");
  const buildingType = form.watch("buildingType");
  const projectType = form.watch("projectType");
  const selectedNaturalFeature = form.watch("naturalFeatures");
  const landTenure = form.watch("landTenure");
  const specialViews = form.watch("specialViews");
  const showLandDocuments = ownLand === "Yes" || ownLand === "Maybe";
  const showLandAssistance = ownLand === "No" || ownLand === "Maybe";
  const showYearsLeftOnLease = landTenure === "Leasehold";
  const showNaturalFeatureNotes = Boolean(selectedNaturalFeature?.trim());
  const suggestedSpaces = useMemo(() => {
    const suggestions = new Set<string>(["Living Room", "Kitchen", "Bathrooms", "Circulation"]);

    if (buildingType.includes("Residential")) {
      suggestions.add("Dining Area");
      suggestions.add("Primary Bedroom");
      suggestions.add("Guest Room");
      suggestions.add("Laundry");
    }

    if (buildingType.includes("Commercial")) {
      suggestions.add("Reception");
      suggestions.add("Open Office");
      suggestions.add("Meeting Room");
      suggestions.add("Store");
    }

    if (buildingType.includes("Educational")) {
      suggestions.add("Classroom");
      suggestions.add("Library");
      suggestions.add("Administration");
    }

    if (projectType === "Renovation") {
      suggestions.add("Existing Space Review");
      suggestions.add("Extension Allowance");
    }

    return Array.from(suggestions);
  }, [buildingType, projectType]);

  useEffect(() => {
    const length = Number(plotLength ?? 0);
    const breadth = Number(plotBreadth ?? 0);
    const nextPlotSize = length > 0 && breadth > 0 ? length * breadth : 0;
    if (form.getValues("plotSize") !== nextPlotSize) {
      form.setValue("plotSize", nextPlotSize, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, plotLength, plotBreadth]);

  useEffect(() => {
    if (!showYearsLeftOnLease && form.getValues("yearsLeftOnLease") !== undefined) {
      form.setValue("yearsLeftOnLease", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, showYearsLeftOnLease]);

  useEffect(() => {
    if (!specialViews) {
      form.setValue("viewLocation", undefined, { shouldDirty: true, shouldValidate: true });
      form.setValue("featuresOfViews", undefined, { shouldDirty: true, shouldValidate: true });
      form.setValue("naturalFeatures", undefined, { shouldDirty: true, shouldValidate: true });
      form.setValue("naturalFeatureNotes", undefined, { shouldDirty: true, shouldValidate: true });
    }
  }, [form, specialViews]);

  const progress = ((currentStep + 1) / stepConfig.length) * 100;

  const currentStepTitle = stepConfig[currentStep].title;

  const nextStep = async () => {
    const stepFields: Record<number, Array<keyof FormValues | string>> = {
      0: ["owner.name", "owner.profession", "owner.ageGroup", "owner.annualIncome", "owner.religion", "owner.ethnicity", "owner.socialStatus", "owner.maritalStatus", "primaryUser.name", "primaryUser.profession", "primaryUser.ageGroup", "primaryUser.annualIncome", "primaryUser.religion", "primaryUser.ethnicity", "primaryUser.socialStatus", "primaryUser.maritalStatus"],
      1: ["ownLand", "landDocumentsHeld", "landAssistanceBuyLand", "landAssistanceSiteSelection", "landTenure", "sitePlanAvailable", "landTitleAvailable", "indentureAvailable", "plotSize", "zoning", "environmentalZone"],
      2: ["siteTopography", "siteAccessibility", "soilSurvey", "topographicSurvey", "specialViews", "viewLocation", "accessRoads", "orientation", "buildingStyle", "naturalFeatures", "naturalFeatureNotes", "selectedAddOnServices", "existingUtilities", "basement", "largeOpenSpaces", "cantileversOrBalconies", "roofComplexity"],
      3: ["projectName", "location", "buildingType", "projectType", "constructionMethod", "projectComplexity", "designStyle", "spacesRequired", "measurement", "projectBudget", "projectBudgetCurrency", "constructionFeeStructure", "floorArea", "plotLength", "plotBreadth", "numberOfFloors", "numberOfBedrooms", "numberOfBathrooms", "roofType", "buildingShape"],
      4: ["constructionPhasing", "soilCondition", "finishLevel", "architecturalServices", "structuralEngineeringServices", "mepEngineering", "interiorDesign", "customElements", "postContractServices", "architecturalScope", "foundationType", "structuralSystem"],
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

        <StepErrorBoundary>
          <Card className="shadow-sm">
            <CardContent className="p-6 md:p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {currentStep === 0 && (
                  <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          Tell us about you
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
                          name="owner.profession"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profession</FormLabel>
                              <FormControl>
                                <MultiSelectInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  suggestions={PROFESSIONS as string[]}
                                  placeholder="Start typing or add multiple professions with commas"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Choose from the list or type a custom profession. Separate multiple entries with commas.</p>
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
                          name="owner.annualIncome"
                          render={({ field }) => {
                            const currency = form.watch("owner.currency") || "USD";
                            return (
                              <FormItem>
                                <FormLabel>Annual Income</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="Owner annual income"
                                    value={formatNumberWithCommas(field.value)}
                                    onChange={(e) => {
                                      const parsed = parseCurrency(e.target.value, currency as any);
 if (!isNaN(parsed)) field.onChange(parsed);
                                    }}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Commas will be added automatically as you type.</p>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                        <FormField
                          control={form.control}
                          name="owner.currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CURRENCIES.map((currency) => (
                                    <SelectItem key={currency.code} value={currency.code}>
                                      {currency.symbol} - {currency.name}
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
                              <FormControl>
                                <MultiSelectInput
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  suggestions={SOCIAL_STATUSES as string[]}
                                  placeholder="Select multiple social statuses with commas"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Select multiple options by separating with commas.</p>
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
                          Who will be the primary user of this project?
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <FormField
                          control={form.control}
                          name="primaryUserSameAsOwner"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (checked) {
                                      form.setValue("primaryUser.name", form.watch("owner.name"));
                                      form.setValue("primaryUser.profession", form.watch("owner.profession"));
                                      form.setValue("primaryUser.ageGroup", form.watch("owner.ageGroup"));
                                      form.setValue("primaryUser.annualIncome", form.watch("owner.annualIncome"));
                                      form.setValue("primaryUser.currency", form.watch("owner.currency"));
                                      form.setValue("primaryUser.religion", form.watch("owner.religion"));
                                      form.setValue("primaryUser.ethnicity", form.watch("owner.ethnicity"));
                                      form.setValue("primaryUser.socialStatus", form.watch("owner.socialStatus"));
                                      form.setValue("primaryUser.maritalStatus", form.watch("owner.maritalStatus"));
                                    } else {
                                      form.setValue("primaryUser.name", "");
                                      form.setValue("primaryUser.profession", "");
                                      form.setValue("primaryUser.ageGroup", "35-44");
                                      form.setValue("primaryUser.annualIncome", 0);
                                      form.setValue("primaryUser.currency", "USD");
                                      form.setValue("primaryUser.religion", "Christianity");
                                      form.setValue("primaryUser.ethnicity", "");
                                      form.setValue("primaryUser.socialStatus", "Employed");
                                      form.setValue("primaryUser.maritalStatus", "Single");
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Primary user is the same as owner</FormLabel>
                                <p className="text-xs text-muted-foreground">Copy all owner details to primary user</p>
                              </div>
                            </FormItem>
                          )}
                        />
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
                          name="primaryUser.profession"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profession</FormLabel>
                              <FormControl>
                                <MultiSelectInput
                                  value={field.value}
                                  onChange={field.onChange}
                                  suggestions={PROFESSIONS as string[]}
                                  placeholder="Start typing or add multiple professions with commas"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Choose from the list or type a custom profession. Separate multiple entries with commas.</p>
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
                          name="primaryUser.annualIncome"
                          render={({ field }) => {
                            const currency = form.watch("primaryUser.currency") || "USD";
                            return (
                              <FormItem>
                                <FormLabel>Annual Income</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="Primary user annual income"
                                    value={formatNumberWithCommas(field.value)}
                                    onChange={(e) => {
                                      const parsed = parseCurrency(e.target.value, currency as any);
                                      if (!isNaN(parsed)) field.onChange(parsed);
                                    }}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Commas will be added automatically as you type.</p>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                        <FormField
                          control={form.control}
                          name="primaryUser.currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CURRENCIES.map((currency) => (
                                    <SelectItem key={currency.code} value={currency.code}>
                                      {currency.symbol} - {currency.name}
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
                              <FormControl>
                                <MultiSelectInput
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  suggestions={SOCIAL_STATUSES as string[]}
                                  placeholder="Select multiple social statuses with commas"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Select multiple options by separating with commas.</p>
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

                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Tell us about your land. Every project needs a site.
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desired project location</FormLabel>
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
                        name="landmark"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Landmark (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. near Central Market, opposite Police Station" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Name a landmark close to the land</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ownLand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Do you already own the land?</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select land ownership" />
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
                            <p className="text-xs text-muted-foreground">Select the land tenure type, such as Freehold or Leasehold.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="landTenure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Land Tenure</FormLabel>
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
                      {showYearsLeftOnLease && (
                        <FormField
                          control={form.control}
                          name="yearsLeftOnLease"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years Left on Lease</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} placeholder="Enter years remaining" {...field} />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Only applicable for leasehold properties</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {showLandDocuments && (
                      <FormField
                        control={form.control}
                        name="landDocumentsHeld"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Land Documents Held</FormLabel>
                            <FormControl>
                              <Textarea placeholder="List any land documents you already have" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">List any existing land documents, such as title deeds or survey reports.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {showLandAssistance && (
                      <div>
                        <h3 className="text-sm font-medium mb-3">Available Services</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="landAssistanceBuyLand"
                            render={({ field }) => (
                              <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Assistance to buy land</FormLabel>
                                  <p className="text-xs text-muted-foreground">Tick if available</p>
                                </div>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="landAssistanceSiteSelection"
                            render={({ field }) => (
                              <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Site selection</FormLabel>
                                  <p className="text-xs text-muted-foreground">Tick if available</p>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {showLandDocuments && (
                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="sitePlanAvailable"
                          render={({ field }) => (
                            <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Site plan available</FormLabel>
                                <p className="text-xs text-muted-foreground">Tick if available</p>
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
                                <FormLabel>Land title available</FormLabel>
                                <p className="text-xs text-muted-foreground">Tick if available</p>
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
                                <FormLabel>Indenture available</FormLabel>
                                <p className="text-xs text-muted-foreground">Tick if available</p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="plotLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plot Length</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="number" min={0} placeholder="Enter plot length" {...field} />
                              </FormControl>
                              <FormField
                                control={form.control}
                                name="plotLengthUnit"
                                render={({ field }) => (
                                  <FormItem className="w-24">
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {LENGTH_UNITS.map((unit) => (
                                          <SelectItem key={unit.code} value={unit.code}>
                                            {unit.code}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">Enter the longer dimension of the land parcel in the selected unit.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="plotBreadth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plot Breadth</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="number" min={0} placeholder="Enter plot breadth" {...field} />
                              </FormControl>
                              <FormField
                                control={form.control}
                                name="plotBreadthUnit"
                                render={({ field }) => (
                                  <FormItem className="w-24">
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {LENGTH_UNITS.map((unit) => (
                                          <SelectItem key={unit.code} value={unit.code}>
                                            {unit.code}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">Enter the shorter dimension of the land parcel in the selected unit.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Plot Area</label>
                        <div className="flex gap-2">
                          <Input value={Number(plotLength || 0) * Number(plotBreadth || 0)} readOnly />
                          <FormField
                            control={form.control}
                            name="plotAreaUnit"
                            render={({ field }) => (
                              <FormItem className="w-24">
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {AREA_UNITS.map((unit) => (
                                      <SelectItem key={unit.code} value={unit.code}>
                                        {unit.code}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Automatically calculated as length x breadth.</p>
                      </div>

                    <FormField
                      control={form.control}
                      name="isIrregularSite"
                      render={({ field }) => (
                        <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Irregular Site Shape</FormLabel>
                            <p className="text-xs text-muted-foreground">Check if site has irregular shape</p>
                          </div>
                        </FormItem>
                      )}
                    />

                    {form.watch("isIrregularSite") && (
                      <FormField
                        control={form.control}
                        name="sitePlanImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload Site Plan</FormLabel>
                            <FormControl>
                              <Input type="file" accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(file.name);
                                }
                              }} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Upload a photo or site plan for irregular sites. AI tool will calculate area automatically.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                      <FormField
                        control={form.control}
                        name="zoning"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zoning</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select zoning" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ZONING_OPTIONS.map((option) => (
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
                      name="environmentalZone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EPA Consideration for Site</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select EPA consideration" />
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
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Layers3 className="h-5 w-5 text-primary" />
                      Site Features
                    </h2>

                    <FormField
                      control={form.control}
                      name="tellUsMore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tell us more</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Provide any additional details about the site" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hasVisitedLand"
                      render={({ field }) => (
                        <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I have visited the land</FormLabel>
                            <p className="text-xs text-muted-foreground">Tick if applicable</p>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="siteTopography"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Topography</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select topography" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TOPOGRAPHIES.map((option) => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
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
                                  <SelectValue placeholder="Select site accessibility" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SITE_ACCESSIBILITY.map((option) => (
                                  <SelectItem key={option} value={option}>{option}</SelectItem>
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
                      name="accessWays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How do you enter the land? (Access ways)</FormLabel>
                          <FormControl>
                            <MultiSelectInput
                              value={field.value || ""}
                              onChange={field.onChange}
                              suggestions={ACCESS_WAYS as string[]}
                              placeholder="Select access directions with commas"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Select access directions (East, West, Front, Back) by separating with commas.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="soilSurvey"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} /></FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>I have done soil survey</FormLabel>
                              <p className="text-xs text-muted-foreground">Yes / No</p>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="topographicSurvey"
                        render={({ field }) => (
                          <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} /></FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>I have done topographic survey</FormLabel>
                              <p className="text-xs text-muted-foreground">Yes / No</p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("soilSurvey") && (
                      <FormField
                        control={form.control}
                        name="soilSurveyFile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload Soil Survey Report</FormLabel>
                            <FormControl>
                              <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(file.name);
                                }
                              }} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Upload your soil survey report (PDF, DOC, DOCX)</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch("topographicSurvey") && (
                      <FormField
                        control={form.control}
                        name="topographicSurveyFile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Upload Topographic Survey Report</FormLabel>
                            <FormControl>
                              <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  field.onChange(file.name);
                                }
                              }} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Upload your topographic survey report (PDF, DOC, DOCX)</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="specialViews"
                      render={({ field }) => (
                        <FormItem className="rounded-xl border p-4 flex flex-row items-start gap-3">
                          <FormControl><Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} /></FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>There are special views</FormLabel>
                            <p className="text-sm text-muted-foreground">Yes / No</p>
                          </div>
                        </FormItem>
                      )}
                    />

                    {specialViews && (
                      <>
                        <FormField
                          control={form.control}
                          name="viewLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location of the Views</FormLabel>
                              <FormControl><Input placeholder="e.g. north side, roadside, waterfront" {...field} /></FormControl>
                              <p className="text-xs text-muted-foreground">Describe the position of the views, such as north-facing or road-facing.</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="featuresOfViews"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Features of the Views</FormLabel>
                              <FormControl><Textarea placeholder="Describe the features of the views (e.g., ocean, mountains, city skyline)" {...field} /></FormControl>
                              <p className="text-xs text-muted-foreground">What makes the views special?</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      </>
                    )}

                    <h3 className="text-lg font-semibold mt-6 mb-4">Neighbourhood Character</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="orientation" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Orientation of Buildings</FormLabel>
                          <FormControl>
                            <MultiSelectInput
                              value={field.value || ""}
                              onChange={field.onChange}
                              suggestions={ORIENTATION_OPTIONS as string[]}
                              placeholder="Select multiple orientations with commas"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Select the direction(s) buildings face (e.g., North, South, East, West). This affects sunlight exposure and energy efficiency.</p>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="buildingStyle" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Building Styles</FormLabel>
                          <FormControl>
                            <MultiSelectInput
                              value={field.value || ""}
                              onChange={field.onChange}
                              suggestions={BUILDING_STYLES as string[]}
                              placeholder="Select multiple building styles with commas"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Select the architectural style(s) preferred for the building (e.g., Modern, Traditional, Contemporary).</p>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField
                      control={form.control}
                      name="neighbourhoodCharacter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Neighbourhood Character</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select neighbourhood character" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["Residential", "Commercial", "Mixed", "Heritage", "Suburban"].map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Describe the surrounding area type to ensure design compatibility.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                      <div className="space-y-6">
                        {specialViews ? (
                          <>
                            <FormField
                              control={form.control}
                              name="naturalFeatures"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Dominant Features</FormLabel>
                                  <FormControl>
                                    <MultiSelectInput
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      suggestions={NATURAL_FEATURES as string[]}
                                      placeholder="Select multiple dominant features with commas"
                                    />
                                  </FormControl>
                                  <p className="text-xs text-muted-foreground">Select one or more features present on or near the site (e.g., trees, water bodies, hills).</p>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            {showNaturalFeatureNotes && (
                              <FormField
                                control={form.control}
                                name="naturalFeatureNotes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Additional Notes</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Add any extra notes about the dominant features."
                                        {...field}
                                      />
                                    </FormControl>
                                    <p className="text-xs text-muted-foreground">Share anything that could affect the design or site work.</p>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </>
                        ) : null}
                        <FormField
                          control={form.control}
                          name="existingUtilities"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Existing Utilities</FormLabel>
                              <FormControl>
                                <MultiSelectInput
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  suggestions={["Water", "Electricity", "Gas", "Sewerage", "Internet", "Telephone"]}
                                  placeholder="Select available utilities with commas"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Select which utility services are already available at the site.</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4 rounded-2xl border bg-muted/20 p-5">
                        <div>
                          <h3 className="font-semibold text-lg">Add-on Services</h3>
                          <p className="text-xs text-muted-foreground">
                            Choose optional site-related support services such as site visits, verification, fencing, and surveys.
                          </p>
                        </div>
                        <FormField
                          control={form.control}
                          name="selectedAddOnServices"
                          render={({ field }) => {
                            const selected = Array.isArray(field.value) ? field.value : [];

                            return (
                              <div className="grid gap-3 md:grid-cols-2">
                                {ADD_ON_SERVICE_OPTIONS.map((option) => {
                                  const checked = selected.includes(option);

                                  return (
                                    <FormItem key={option} className="rounded-xl border p-4 flex flex-row items-start gap-3">
                                      <FormControl>
                                        <Checkbox
                                          checked={checked}
                                          onCheckedChange={(nextChecked) => {
                                            if (nextChecked) {
                                              field.onChange([...selected, option]);
                                              return;
                                            }

                                            field.onChange(selected.filter((item) => item !== option));
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>{option}</FormLabel>
                                        <p className="text-xs text-muted-foreground">Add this support service to the site brief.</p>
                                      </div>
                                    </FormItem>
                                  );
                                })}
                              </div>
                            );
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="roofComplexity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Roof Complexity (Optional)</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value || undefined)} value={field.value ?? ""}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Optional: select roof complexity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ROOF_COMPLEXITIES.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Leave this blank if roof complexity should not affect the brief.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="siteZoneType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Zone Type</FormLabel>
                            <FormControl>
                              <MultiSelectInput
                                value={field.value || ""}
                                onChange={field.onChange}
                                suggestions={SITE_ZONE_TYPES as string[]}
                                placeholder="Select multiple site zone types with commas"
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Select the zoning classification(s) for the site (e.g., Residential, Commercial, Industrial).</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Let's get right into the projects.
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Osei Family Residence" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Give the project a name that helps you identify it later.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="buildingType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Building Classification</FormLabel>
                          <FormControl>
                            <MultiSelectInput
                              value={field.value}
                              onChange={field.onChange}
                              suggestions={BUILDING_TYPES as string[]}
                              placeholder="Select multiple building types with commas"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">Select the building classification that best matches the intended use of the project.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
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
                            <p className="text-xs text-muted-foreground">Select the main project type, for example New Build or Renovation.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="constructionMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Construction Preference</FormLabel>
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
                            <p className="text-xs text-muted-foreground">Select the preferred construction approach, such as conventional, modular, or prefabricated.</p>
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
                            <FormLabel>Desired Completion Time</FormLabel>
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
                            <p className="text-xs text-muted-foreground">Choose the desired project completion timeline.</p>
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
                            <p className="text-xs text-muted-foreground">Choose the overall complexity level that best describes the project.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                      control={form.control}
                      name="spacesRequired"
                      render={({ field }) => {
                        const spaces = Array.isArray(field.value) ? field.value : [];
                        const baseArea = spaces.reduce((sum, space) => {
                          const quantity = Number(space.quantity || 0);
                          const area = Number(space.area || 0);
                          return sum + area * Math.max(quantity, 1);
                        }, 0);
                        const corridorAllowance = baseArea * 0.15;
                        const circulationAllowance = baseArea * 0.1;
                        const totalArea = baseArea + corridorAllowance + circulationAllowance;

                        const addSuggestedSpace = (name: string) => {
                          if (spaces.some((space) => space.name.toLowerCase() === name.toLowerCase())) {
                            return;
                          }

                          field.onChange([
                            ...spaces,
                            { name, dimensions: "", quantity: 1, area: 0, notes: "" },
                          ]);
                        };
                        return (
                          <FormItem>
                          <FormLabel>Space Details</FormLabel>
                          <div className="rounded-2xl border bg-muted/20 p-4 space-y-3">
                            <div>
                              <h4 className="font-semibold">AI-powered suggestions</h4>
                              <p className="text-xs text-muted-foreground">
                                Tap a suggestion to add it to the list. We tailor the options from the project type and building classification.
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {suggestedSpaces.map((space) => (
                                <Button key={space} type="button" variant="outline" size="sm" onClick={() => addSuggestedSpace(space)}>
                                  {space}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                              {spaces.map((space, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Space {index + 1}</h4>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        field.onChange(spaces.filter((_, i) => i !== index));
                                      }}
                                      className="text-destructive text-sm hover:underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <div className="grid md:grid-cols-3 gap-3">
                                    <Input
                                      placeholder="Space name (e.g., Living Room)"
                                      value={space.name}
                                      onChange={(e) => {
                                        const newSpaces = [...spaces];
                                        newSpaces[index] = { ...space, name: e.target.value };
                                        field.onChange(newSpaces);
                                      }}
                                    />
                                    <Input
                                      type="number"
                                      min={1}
                                      placeholder="Quantity"
                                      value={space.quantity || 1}
                                      onChange={(e) => {
                                        const newSpaces = [...spaces];
                                        newSpaces[index] = { ...space, quantity: Math.max(1, Number(e.target.value) || 1) };
                                        field.onChange(newSpaces);
                                      }}
                                    />
                                    <Input
                                      placeholder="Dimensions (e.g., 5m x 4m)"
                                      value={space.dimensions || ""}
                                      onChange={(e) => {
                                        const newSpaces = [...spaces];
                                        newSpaces[index] = { ...space, dimensions: e.target.value };
                                        field.onChange(newSpaces);
                                      }}
                                    />
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-3">
                                    <Input
                                      type="number"
                                      placeholder="Area (m²)"
                                      value={space.area || ""}
                                      onChange={(e) => {
                                        const newSpaces = [...spaces];
                                        newSpaces[index] = { ...space, area: parseFloat(e.target.value) || 0 };
                                        field.onChange(newSpaces);
                                      }}
                                    />
                                    <Input
                                      placeholder="Notes (optional)"
                                      value={space.notes || ""}
                                      onChange={(e) => {
                                        const newSpaces = [...spaces];
                                        newSpaces[index] = { ...space, notes: e.target.value };
                                        field.onChange(newSpaces);
                                      }}
                                    />
                                  </div>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const newSpaces = [...spaces, { name: "", dimensions: "", quantity: 1, area: 0, notes: "" }];
                                  field.onChange(newSpaces);
                                }}
                                className="w-full py-2 px-4 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                              >
                                + Add Space
                              </button>
                              <div className="grid gap-3 rounded-2xl border bg-muted/20 p-4 md:grid-cols-4">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Base area</p>
                                  <p className="text-lg font-semibold">{formatNumberWithCommas(baseArea)} m²</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Corridor allowance</p>
                                  <p className="text-lg font-semibold">{formatNumberWithCommas(corridorAllowance)} m²</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Other spaces</p>
                                  <p className="text-lg font-semibold">{formatNumberWithCommas(circulationAllowance)} m²</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated total</p>
                                  <p className="text-lg font-semibold text-primary">{formatNumberWithCommas(totalArea)} m²</p>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Add detailed information for each required space, then review the estimated total area for circulation and support spaces.</p>
                            <FormMessage />
                          </FormItem>
                          );
                        }}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="measurement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Measurement</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 120 m2" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Enter any existing summary measurement you have for this project.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div />
                    </div>

                    <FormField
                      control={form.control}
                      name="designStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Design Concept</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select design concept" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DESIGN_STYLES.map((style) => (
                                <SelectItem key={style} value={style}>
                                  {style}
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
                      name="architecturalStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Architectural Style</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select architectural style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ARCHITECTURAL_STYLES.map((style) => (
                                <SelectItem key={style} value={style}>
                                  {style}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4 rounded-2xl border bg-muted/20 p-5">
                      <h3 className="text-lg font-semibold">Budget and Fees</h3>
                      <div className="grid gap-6 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="projectBudget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Project Budget</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} placeholder="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="projectBudgetCurrency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CURRENCIES.map((currency) => (
                                    <SelectItem key={currency.code} value={currency.code}>
                                      {currency.code} - {currency.name}
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
                          name="constructionFeeStructure"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Construction Fees</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select fee structure" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {["Single", "Double", "Multiple"].map((option) => (
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
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <>
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        Desired Services
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="constructionPhasing"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phasing</FormLabel>
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
                      </div>
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

                    <h3 className="text-lg font-semibold mt-6 mb-4">Desired Services</h3>

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
                              <p className="text-xs text-muted-foreground">Include basement</p>
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
                              <p className="text-xs text-muted-foreground">Include large open spaces</p>
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
                              <FormLabel>Cantilevers or Balconies</FormLabel>
                              <p className="text-xs text-muted-foreground">Include cantilevers or balconies</p>
                            </div>
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
                          <p className="text-xs text-muted-foreground">Choose the roof type that best fits the building design.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roofStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roof Style</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select roof style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ROOF_STYLES.map((style) => (
                                <SelectItem key={style} value={style}>
                                  {style}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">Select the visual roof style for the project.</p>
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
                          <p className="text-xs text-muted-foreground">Choose the main building footprint shape for the design.</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              <p className="text-sm text-muted-foreground">Include custom design elements</p>
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
                              <p className="text-sm text-muted-foreground">Include post-contract services</p>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="rounded-2xl border bg-muted/40 p-6 mt-8">
                      <h3 className="font-semibold mb-4 text-lg">Project Feasibility Assessment</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Feasibility Score</span>
                          <span className="text-2xl font-bold text-primary">{complexity.score}%</span>
                        </div>
                        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500 ease-out"
                            style={{ width: `${complexity.score}%` }}
                          />
                          <div className="absolute top-0 left-0 h-full flex items-center justify-between px-2 text-xs font-medium text-white/80">
                            <span>Low</span>
                            <span>Medium</span>
                            <span>High</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Based on the information provided, your project has a <span className="font-semibold text-foreground">{complexity.label}</span> complexity level. This assessment considers factors like building type, site conditions, structural requirements, and selected services.
                        </p>
                      </div>
                    </div>
                  </>
                )}{currentStep === 999 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Layers3 className="h-5 w-5 text-primary" />
                      Site Conditions
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
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
                        name="accessRoads"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Access Ways</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select access ways" />
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
                    {specialViews ? (
                      <>
                        <FormField
                          control={form.control}
                          name="naturalFeatures"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dominant Features</FormLabel>
                              <FormControl>
                                <MultiSelectInput
                                  value={field.value || ""}
                                  onChange={field.onChange}
                                  suggestions={NATURAL_FEATURES as string[]}
                                  placeholder="Select multiple dominant features with commas"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">Select one or more features present on or near the site.</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {showNaturalFeatureNotes && (
                          <FormField
                            control={form.control}
                            name="naturalFeatureNotes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Additional Notes</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Add any extra notes about the dominant features."
                                    {...field}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">Share anything that could affect the design or site work.</p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </>
                    ) : null}
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
                                {["Available", "Partial", "Not Available"].map((option) => (
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
                    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                      <Button type="button" onClick={() => setConfirmOpen(true)} disabled={isPending}>
                        Engage
                      </Button>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Review and confirm</DialogTitle>
                          <DialogDescription>
                            We&apos;ll review your project details and confirm the request. Typically responds within 24 hours.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              void form.handleSubmit(onSubmit)();
                            }}
                          >
                            Engage
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </StepErrorBoundary>
      </div>
    </MainLayout>
  );
}



