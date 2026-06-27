import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const BUILDING_TYPES = [
  "Residential",
  "Commercial",
  "Educational",
  "Healthcare",
  "Industrial",
  "Institutional",
  "Religious",
  "Recreational",
  "Agricultural",
] as const;

export const ROOF_TYPES = ["Gable", "Hip", "Flat"] as const;
export const SOIL_CONDITIONS = ["Normal", "Rocky", "Clay", "Waterlogged", "Unknown"] as const;
export const SITE_ACCESSIBILITY = ["Urban", "Peri-Urban", "Rural", "Remote"] as const;
export const FINISH_LEVELS = ["Basic", "Standard", "Premium"] as const;
export const BUILDING_SHAPES = ["Rectangular", "Square", "L-Shaped", "U-Shaped", "Irregular"] as const;
export const ROOF_COMPLEXITIES = ["Simple", "Moderate", "Complex"] as const;
export const ARCHITECTURAL_SCOPES = ["Concept Design", "Full Design", "Design + Supervision"] as const;
export const FOUNDATION_TYPES = ["Strip", "Raft", "Pile", "Combined"] as const;
export const STRUCTURAL_SYSTEMS = ["Load-Bearing", "Reinforced Concrete Frame", "Steel Frame", "Hybrid"] as const;
export const AGE_GROUPS = ["under-25", "25-34", "35-44", "45-54", "55-plus"] as const;
export const BUILDING_USES = ["Single-family residence", "Multi-family residence", "Retail", "Office", "Mixed-use", "Industrial", "Institutional", "Hospitality", "Educational", "Healthcare", "Agricultural"] as const;
export const CONSTRUCTION_METHODS = ["Conventional", "Modular", "Prefabricated", "Hybrid"] as const;
export const PROJECT_TYPES = ["New Build", "Renovation", "Extension", "Conversion", "Adaptive Reuse", "Mixed Use"] as const;
export const CONSTRUCTION_PHASES = ["Single Phase", "Multi Phase", "Staged", "Unknown"] as const;
export const PROJECT_COMPLEXITIES = ["Low", "Medium", "High"] as const;
export const COLOUR_SCHEMES = ["Neutral", "Warm", "Cool", "Bold", "Monochrome", "Custom"] as const;
export const DESIGN_STYLES = ["Introvert", "Extrovert", "Balanced"] as const;
export const OWN_LAND_OPTIONS = ["Yes", "No", "Maybe"] as const;
export const LAND_TENURES = ["Freehold", "Leasehold", "Don't Know"] as const;
export const SITE_ZONE_TYPES = ["Residential", "Religious", "Civic", "Mixed"] as const;
export const ENVIRONMENTAL_SENSITIVITIES = ["Low", "Medium", "High"] as const;
export const TOPOGRAPHIES = ["Flat", "Mild", "Steep"] as const;
export const NATURAL_FEATURES = ["None", "Water", "Rocks", "Trees", "Mixed"] as const;
export const VIEWS = ["Open", "Partial", "Limited"] as const;
export const ACCESS_ROADS = ["Good", "Fair", "Poor"] as const;
export const NEIGHBOURHOOD_CHARACTER = ["Residential", "Commercial", "Mixed", "Heritage", "Suburban"] as const;
export const RELATIONSHIP_OPTIONS = ["Self", "Spouse", "Child", "Parent", "Partner", "Relative", "Other"] as const;
export const SOCIAL_STATUSES = ["Single", "Married", "Divorced", "Widowed", "Separated", "Prefer not to say"] as const;
export const FAMILY_STATUSES = ["No dependents", "Young family", "Extended family", "Multi-generational", "Prefer not to say"] as const;
export const EXPECTED_COMPLETION_TIMES = ["6 months", "9 months", "12 months", "18 months", "24 months", "36+ months"] as const;
export const RELIGIONS = [
  "Christianity",
  "Islam",
  "Traditional Religion",
  "Hinduism",
  "Buddhism",
  "Atheist / Agnostic",
  "Other",
  "Prefer not to say",
] as const;

export const PROFESSIONS = [
  "Architect",
  "Civil Engineer",
  "Structural Engineer",
  "Quantity Surveyor",
  "Project Manager",
  "Developer",
  "Builder",
  "Contractor",
  "Interior Designer",
  "Urban Planner",
  "Surveyor",
  "Accountant",
  "Banker",
  "Lawyer",
  "Doctor",
  "Nurse",
  "Teacher",
  "Lecturer",
  "Entrepreneur",
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
] as const;

export const LOCATION_OPTIONS = [
  { value: "accra", label: "Accra" },
  { value: "kumasi", label: "Kumasi" },
  { value: "takoradi", label: "Takoradi" },
  { value: "tamale", label: "Tamale" },
  { value: "cape-coast", label: "Cape Coast" },
  { value: "sunyani", label: "Sunyani" },
  { value: "tema", label: "Tema" },
  { value: "other", label: "Other" },
] as const;

export const MATERIAL_NAMES = ["Cement", "Sand", "Stone", "Blocks", "Steel", "Roofing Sheets"] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];
export type Religion = (typeof RELIGIONS)[number];
export type BuildingType = (typeof BUILDING_TYPES)[number];
export type BuildingUse = (typeof BUILDING_USES)[number];
export type ConstructionMethod = (typeof CONSTRUCTION_METHODS)[number];
export type ProjectType = (typeof PROJECT_TYPES)[number];
export type ConstructionPhase = (typeof CONSTRUCTION_PHASES)[number];
export type ProjectComplexity = (typeof PROJECT_COMPLEXITIES)[number];
export type ColourScheme = (typeof COLOUR_SCHEMES)[number];
export type DesignStyle = (typeof DESIGN_STYLES)[number];
export type OwnLandOption = (typeof OWN_LAND_OPTIONS)[number];
export type LandTenure = (typeof LAND_TENURES)[number];
export type SiteZoneType = (typeof SITE_ZONE_TYPES)[number];
export type EnvironmentalSensitivity = (typeof ENVIRONMENTAL_SENSITIVITIES)[number];
export type Topography = (typeof TOPOGRAPHIES)[number];
export type NaturalFeature = (typeof NATURAL_FEATURES)[number];
export type ViewType = (typeof VIEWS)[number];
export type AccessRoad = (typeof ACCESS_ROADS)[number];
export type NeighbourhoodCharacter = (typeof NEIGHBOURHOOD_CHARACTER)[number];
export type RelationshipOption = (typeof RELATIONSHIP_OPTIONS)[number];
export type SocialStatus = (typeof SOCIAL_STATUSES)[number];
export type FamilyStatus = (typeof FAMILY_STATUSES)[number];
export type ExpectedCompletionTime = (typeof EXPECTED_COMPLETION_TIMES)[number];

export type PersonProfile = {
  name: string;
  ageGroup: AgeGroup;
  profession: string;
  religion: Religion;
  annualIncome?: number;
  ethnicity?: string;
  socialStatus?: SocialStatus;
  familyStatus?: FamilyStatus;
  relationshipToOwner?: RelationshipOption;
};

export type ProjectInput = {
  userId?: number;
  projectName: string;
  location: string;
  buildingType: BuildingType;
  projectType: ProjectType;
  constructionPhasing: ConstructionPhase;
  expectedCompletionTime: ExpectedCompletionTime;
  projectComplexity: ProjectComplexity;
  preferredColourScheme: ColourScheme;
  designStyle: DesignStyle;
  owner: PersonProfile;
  primaryUser: PersonProfile;
  projectBudget: number;
  floorArea: number;
  numberOfFloors: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  roofType: RoofType;
  soilCondition: SoilCondition;
  siteAccessibility: SiteAccessibility;
  finishLevel: FinishLevel;
  buildingShape: BuildingShape;
  buildingUse: BuildingUse;
  constructionMethod: ConstructionMethod;
  ownLand: OwnLandOption;
  sitePlanAvailable: boolean;
  landTitleAvailable: boolean;
  indentureAvailable: boolean;
  landTenure: LandTenure;
  plotSize: number;
  zoning: string;
  siteZoneType: SiteZoneType;
  environmentalSensitivity: EnvironmentalSensitivity;
  siteTopography: Topography;
  soilSurvey: boolean;
  topographicSurvey: boolean;
  naturalFeatures: NaturalFeature;
  views: ViewType;
  accessRoads: AccessRoad;
  neighbourhoodCharacter: NeighbourhoodCharacter;
  existingUtilities: "Available" | "Partial" | "Not Available";
  environmentalConstraints: EnvironmentalSensitivity;
  basement: boolean;
  largeOpenSpaces: boolean;
  cantileversOrBalconies: boolean;
  roofComplexity: RoofComplexity;
  architecturalScope: ArchitecturalScope;
  foundationType: FoundationType;
  structuralSystem: StructuralSystem;
  architecturalServices: boolean;
  structuralEngineeringServices: boolean;
  mepEngineering: boolean;
  interiorDesign: boolean;
  customElements: boolean;
  postContractServices: boolean;
  architectReferral: boolean;
  serviceReferral: boolean;
  referralPercentage: number;
  complimentaryServices: boolean;
};

export type MaterialEstimateItem = {
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
};

export type ProjectRecord = ProjectInput & {
  id: number;
  createdAt: string;
  structuralComplexity: {
    score: number;
    label: "Simple" | "Moderate" | "Complex";
  };
  materialEstimate: {
    items: MaterialEstimateItem[];
    total: number;
  };
  labourEstimate: number;
  durationEstimate: {
    minMonths: number;
    maxMonths: number;
  };
  professionalFees: {
    architectural: number;
    structuralEngineering: number;
    quantitySurveying: number;
    projectManagement: number;
    total: number;
  };
  totalCost: number;
  costBreakdown: {
    material: number;
    labour: number;
    professionalFees: number;
    contingency: number;
    total: number;
  };
};

export type MaterialPrice = {
  id: number;
  location: string;
  materialName: string;
  unit: string;
  price: number;
  lastUpdated: string;
};

export type LocationPrice = {
  id: number;
  location: string;
  label: string;
  multiplier: number;
  lastUpdated: string;
};

export type FeeRate = {
  id: number;
  name: string;
  code: string;
  category: "architectural" | "structural" | "surveying" | "management";
  basis: "per-sqm" | "percent";
  rate: number;
  lastUpdated: string;
};

export type AppUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "planner" | "client";
  createdAt: string;
};

const ESTIMATE_STORAGE_KEY = "buildplan.projects";
const MATERIAL_STORAGE_KEY = "buildplan.material-prices";
const LOCATION_STORAGE_KEY = "buildplan.location-pricing";
const FEE_RATE_STORAGE_KEY = "buildplan.fee-rates";
const USER_STORAGE_KEY = "buildplan.users";

function readArray<T>(key: string, seed: () => T[]): T[] {
  if (typeof window === "undefined") {
    return seed();
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    const seeded = seed();
    window.localStorage.setItem(key, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    const seeded = seed();
    window.localStorage.setItem(key, JSON.stringify(seeded));
    return seeded;
  }
}

function writeArray<T>(key: string, value: T[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function calculateStructuralComplexity(project: ProjectInput) {
  let score = 0;

  const shapeScores: Record<BuildingShape, number> = {
    Rectangular: 0,
    Square: 0,
    "L-Shaped": 6,
    "U-Shaped": 8,
    Irregular: 12,
  };

  const roofScores: Record<RoofComplexity, number> = {
    Simple: 0,
    Moderate: 6,
    Complex: 12,
  };

  score += shapeScores[project.buildingShape];
  score += roofScores[project.roofComplexity];
  score += project.basement ? 12 : 0;
  score += project.largeOpenSpaces ? 8 : 0;
  score += project.cantileversOrBalconies ? 8 : 0;
  score += project.numberOfFloors > 2 ? 6 : 0;
  score += project.numberOfFloors > 4 ? 6 : 0;
  score += project.floorArea > 300 ? 4 : 0;

  const label: "Simple" | "Moderate" | "Complex" =
    score >= 28 || project.basement || (project.largeOpenSpaces && project.cantileversOrBalconies)
      ? "Complex"
      : score >= 12 || project.buildingShape === "Irregular" || project.cantileversOrBalconies
        ? "Moderate"
        : "Simple";

  return { score, label };
}

function getMaterialPrice(location: string, materialName: string, fallbackPrice: number) {
  const prices = readArray<MaterialPrice>(MATERIAL_STORAGE_KEY, seedMaterialPrices);
  const byLocation = prices.find((entry) => entry.location === location && entry.materialName === materialName);
  if (byLocation) {
    return byLocation;
  }
  const generic = prices.find((entry) => entry.location === "all" && entry.materialName === materialName);
  if (generic) {
    return generic;
  }
  return {
    id: 0,
    location,
    materialName,
    unit: "unit",
    price: fallbackPrice,
    lastUpdated: new Date().toISOString(),
  };
}

function calculateMaterialEstimate(project: ProjectInput) {
  const quantityPlan = [
    { materialName: "Cement", quantity: Math.max(120, Math.round(project.floorArea * 1.8 + project.numberOfFloors * 35)), unit: "bags", fallbackPrice: 78 },
    { materialName: "Sand", quantity: Math.max(40, Math.round(project.floorArea * 0.72)), unit: "m³", fallbackPrice: 380 },
    { materialName: "Stone", quantity: Math.max(28, Math.round(project.floorArea * 0.42)), unit: "m³", fallbackPrice: 420 },
    { materialName: "Blocks", quantity: Math.max(900, Math.round(project.floorArea * 13)), unit: "pcs", fallbackPrice: 9.5 },
    { materialName: "Steel", quantity: Number((project.floorArea * 0.045).toFixed(1)), unit: "tonnes", fallbackPrice: 8200 },
    { materialName: "Roofing Sheets", quantity: Math.max(20, Math.round(project.floorArea * 1.1)), unit: "sheets", fallbackPrice: 145 },
  ];

  const items = quantityPlan.map((item) => {
    const priceRecord = getMaterialPrice(project.location, item.materialName, item.fallbackPrice);
    const total = Math.round(item.quantity * priceRecord.price);

    return {
      materialName: item.materialName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: priceRecord.price,
      total,
    };
  });

  return {
    items,
    total: items.reduce((sum, item) => sum + item.total, 0),
  };
}

function calculateProfessionalFees(project: ProjectInput, baseConstructionCost: number, complexityScore: number) {
  const feeRates = readArray<FeeRate>(FEE_RATE_STORAGE_KEY, seedFeeRates);

  const architecturalRate = feeRates.find((entry) => entry.code === "architectural")?.rate ?? 95;
  const structuralRate = feeRates.find((entry) => entry.code === "structural")?.rate ?? 60;
  const surveyingRate = feeRates.find((entry) => entry.code === "surveying")?.rate ?? 1.5;
  const managementRate = feeRates.find((entry) => entry.code === "management")?.rate ?? 2;

  const scopeMultiplier: Record<ArchitecturalScope, number> = {
    "Concept Design": 0.72,
    "Full Design": 1,
    "Design + Supervision": 1.25,
  };

  const foundationMultiplier: Record<FoundationType, number> = {
    Strip: 0.92,
    Raft: 1.08,
    Pile: 1.28,
    Combined: 1.16,
  };

  const structuralMultiplier: Record<StructuralSystem, number> = {
    "Load-Bearing": 0.92,
    "Reinforced Concrete Frame": 1,
    "Steel Frame": 1.18,
    Hybrid: 1.1,
  };

  const buildingMultiplier: Record<BuildingType, number> = {
    Residential: 1,
    Commercial: 1.08,
    Educational: 1.05,
    Healthcare: 1.15,
    Industrial: 1.12,
    Institutional: 1.06,
    Religious: 1.03,
    Recreational: 1.08,
    Agricultural: 0.95,
  };

  const siteMultiplier: Record<SoilCondition, number> = {
    Normal: 1,
    Rocky: 1.12,
    Clay: 1.08,
    Waterlogged: 1.18,
    Unknown: 1.04,
  };

  const complexityMultiplier = 1 + Math.min(complexityScore, 40) / 100;

  const architectural = Math.round(
    project.floorArea *
      architecturalRate *
      scopeMultiplier[project.architecturalScope] *
      complexityMultiplier *
      buildingMultiplier[project.buildingType] *
      siteMultiplier[project.soilCondition],
  );

  const structuralEngineering = Math.round(
    project.floorArea *
      structuralRate *
      structuralMultiplier[project.structuralSystem] *
      foundationMultiplier[project.foundationType] *
      complexityMultiplier,
  );

  const surveying = Math.round(baseConstructionCost * (surveyingRate / 100));
  const management = Math.round(baseConstructionCost * (managementRate / 100) * (project.siteAccessibility === "Remote" ? 1.1 : 1));

  return {
    architectural,
    structuralEngineering,
    quantitySurveying: surveying,
    projectManagement: management,
    total: architectural + structuralEngineering + surveying + management,
  };
}

function calculateDuration(project: ProjectInput, complexityLabel: "Simple" | "Moderate" | "Complex") {
  const baseMonths = Math.max(4, Math.round(project.floorArea / 90));
  const floorAdjustment = Math.max(0, project.numberOfFloors - 1) * 1.5;
  const complexityAdjustment = complexityLabel === "Complex" ? 4 : complexityLabel === "Moderate" ? 2 : 0;
  const siteAdjustment = project.siteAccessibility === "Remote" ? 3 : project.siteAccessibility === "Rural" ? 2 : 0;
  const minMonths = Math.max(3, Math.round(baseMonths + floorAdjustment + complexityAdjustment + siteAdjustment));
  const maxMonths = minMonths + 3;

  return { minMonths, maxMonths };
}

function seedLocationPricing(): LocationPrice[] {
  return [
    { id: 1, location: "accra", label: "Accra", multiplier: 1.18, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 2, location: "kumasi", label: "Kumasi", multiplier: 1.08, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 3, location: "takoradi", label: "Takoradi", multiplier: 1.12, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 4, location: "tamale", label: "Tamale", multiplier: 1.05, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 5, location: "cape-coast", label: "Cape Coast", multiplier: 1.04, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 6, location: "sunyani", label: "Sunyani", multiplier: 1.02, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 7, location: "tema", label: "Tema", multiplier: 1.15, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 8, location: "other", label: "Other", multiplier: 1, lastUpdated: "2026-06-18T10:00:00.000Z" },
  ];
}

function seedMaterialPrices(): MaterialPrice[] {
  return [
    { id: 1, location: "all", materialName: "Cement", unit: "bag", price: 82, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 2, location: "all", materialName: "Sand", unit: "m³", price: 410, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 3, location: "all", materialName: "Stone", unit: "m³", price: 460, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 4, location: "all", materialName: "Blocks", unit: "piece", price: 10.5, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 5, location: "all", materialName: "Steel", unit: "tonne", price: 8600, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 6, location: "all", materialName: "Roofing Sheets", unit: "sheet", price: 155, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 7, location: "accra", materialName: "Cement", unit: "bag", price: 88, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 8, location: "accra", materialName: "Sand", unit: "m³", price: 450, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 9, location: "accra", materialName: "Stone", unit: "m³", price: 490, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 10, location: "accra", materialName: "Blocks", unit: "piece", price: 11.2, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 11, location: "kumasi", materialName: "Cement", unit: "bag", price: 84, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 12, location: "kumasi", materialName: "Sand", unit: "m³", price: 420, lastUpdated: "2026-06-18T10:00:00.000Z" },
  ];
}

function seedFeeRates(): FeeRate[] {
  return [
    { id: 1, name: "Architectural Fee", code: "architectural", category: "architectural", basis: "per-sqm", rate: 95, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 2, name: "Structural Engineering Fee", code: "structural", category: "structural", basis: "per-sqm", rate: 60, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 3, name: "Quantity Surveying Fee", code: "surveying", category: "surveying", basis: "percent", rate: 1.5, lastUpdated: "2026-06-18T10:00:00.000Z" },
    { id: 4, name: "Project Management Fee", code: "management", category: "management", basis: "percent", rate: 2, lastUpdated: "2026-06-18T10:00:00.000Z" },
  ];
}

function seedUsers(): AppUser[] {
  return [
    { id: 1, name: "Admin User", email: "admin@buildplan.local", password: "admin123", role: "admin", createdAt: "2026-06-18T10:00:00.000Z" },
    { id: 2, name: "Project Planner", email: "planner@buildplan.local", password: "planner123", role: "planner", createdAt: "2026-06-18T10:00:00.000Z" },
    { id: 3, name: "Client Account", email: "client@buildplan.local", password: "client123", role: "client", createdAt: "2026-06-18T10:00:00.000Z" },
  ];
}

function calculateProjectRecord(input: ProjectInput, id: number, createdAt = new Date().toISOString()): ProjectRecord {
  const complexity = calculateStructuralComplexity(input);
  const locationPricing = readArray<LocationPrice>(LOCATION_STORAGE_KEY, seedLocationPricing);
  const locationMultiplier = locationPricing.find((entry) => entry.location === input.location)?.multiplier ?? 1;
  const materialEstimate = calculateMaterialEstimate(input);

  const baseConstructionCost = Math.round(
    input.floorArea *
      (7600 + (input.numberOfFloors - 1) * 240 + (input.buildingType === "Commercial" ? 500 : input.buildingType === "Healthcare" ? 650 : 0)) *
      locationMultiplier *
      (1 + complexity.score / 180),
  );

  const labourEstimate = Math.max(0, Math.round(baseConstructionCost * 0.31));
  const professionalFees = calculateProfessionalFees(input, baseConstructionCost, complexity.score);
  const contingency = Math.round((materialEstimate.total + labourEstimate + professionalFees.total) * 0.08);
  const totalCost = materialEstimate.total + labourEstimate + professionalFees.total + contingency;
  const durationEstimate = calculateDuration(input, complexity.label);

  return {
    ...input,
    userId: input.userId ?? 1,
    id,
    createdAt,
    structuralComplexity: complexity,
    materialEstimate,
    labourEstimate,
    durationEstimate,
    professionalFees,
    totalCost,
    costBreakdown: {
      material: materialEstimate.total,
      labour: labourEstimate,
      professionalFees: professionalFees.total,
      contingency,
      total: totalCost,
    },
  };
}

function seedEstimates(): ProjectRecord[] {
  return [
    calculateProjectRecord(
      {
        userId: 1,
        projectName: "Osei Family Residence",
        location: "accra",
        buildingType: "Residential",
        owner: {
          name: "Kwame Osei",
          ageGroup: "35-44",
          profession: "Entrepreneur",
          religion: "Christianity",
        },
        primaryUser: {
          name: "Ama Osei",
          ageGroup: "35-44",
          profession: "Teacher",
          religion: "Christianity",
        },
        floorArea: 240,
        numberOfFloors: 2,
        numberOfBedrooms: 4,
        numberOfBathrooms: 4,
        roofType: "Hip",
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
      1,
      "2026-06-14T10:00:00.000Z",
    ),
    calculateProjectRecord(
      {
        userId: 2,
        projectName: "Takoradi Learning Centre",
        location: "takoradi",
        buildingType: "Educational",
        owner: {
          name: "Mabel Agyeman",
          ageGroup: "45-54",
          profession: "Lecturer",
          religion: "Christianity",
        },
        primaryUser: {
          name: "John Agyeman",
          ageGroup: "35-44",
          profession: "Project Manager",
          religion: "Christianity",
        },
        floorArea: 680,
        numberOfFloors: 3,
        numberOfBedrooms: 0,
        numberOfBathrooms: 8,
        roofType: "Gable",
        soilCondition: "Clay",
        siteAccessibility: "Peri-Urban",
        finishLevel: "Premium",
        buildingShape: "U-Shaped",
        basement: false,
        largeOpenSpaces: true,
        cantileversOrBalconies: true,
        roofComplexity: "Moderate",
        architecturalScope: "Design + Supervision",
        foundationType: "Raft",
        structuralSystem: "Reinforced Concrete Frame",
      },
      2,
      "2026-06-18T15:30:00.000Z",
    ),
  ];
}

function createArrayStore<T extends { id: number }>(options: {
  queryKey: string;
  storageKey: string;
  seed: () => T[];
}) {
  function useList() {
    return useQuery({
      queryKey: [options.queryKey],
      queryFn: async () => readArray<T>(options.storageKey, options.seed),
    });
  }

  function useUpsert() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (record: T) => {
        const records = readArray<T>(options.storageKey, options.seed);
        const next = records.some((entry) => entry.id === record.id)
          ? records.map((entry) => (entry.id === record.id ? record : entry))
          : [record, ...records];
        writeArray(options.storageKey, next);
        return record;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [options.queryKey] });
      },
    });
  }

  function useRemove() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id: number) => {
        const records = readArray<T>(options.storageKey, options.seed);
        const next = records.filter((record) => record.id !== id);
        writeArray(options.storageKey, next);
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [options.queryKey] });
      },
    });
  }

  function getAll() {
    return readArray<T>(options.storageKey, options.seed);
  }

  return { useList, useUpsert, useRemove, getAll };
}

const estimateStore = createArrayStore<ProjectRecord>({
  queryKey: "projects",
  storageKey: ESTIMATE_STORAGE_KEY,
  seed: seedEstimates,
});

const materialStore = createArrayStore<MaterialPrice>({
  queryKey: "material-prices",
  storageKey: MATERIAL_STORAGE_KEY,
  seed: seedMaterialPrices,
});

const locationStore = createArrayStore<LocationPrice>({
  queryKey: "location-pricing",
  storageKey: LOCATION_STORAGE_KEY,
  seed: seedLocationPricing,
});

const feeStore = createArrayStore<FeeRate>({
  queryKey: "fee-rates",
  storageKey: FEE_RATE_STORAGE_KEY,
  seed: seedFeeRates,
});

const userStore = createArrayStore<AppUser>({
  queryKey: "users",
  storageKey: USER_STORAGE_KEY,
  seed: seedUsers,
});

export function useListEstimates() {
  return estimateStore.useList();
}

export function useGetEstimateStats() {
  return useQuery({
    queryKey: ["project-stats"],
    queryFn: async () => {
      const estimates = estimateStore.getAll();

      const totalProjects = estimates.length;
      const totalConstructionCost = estimates.reduce((sum, estimate) => sum + estimate.totalCost, 0);
      const averageConstructionCost = totalProjects ? Math.round(totalConstructionCost / totalProjects) : 0;
      const totalMaterialCost = estimates.reduce((sum, estimate) => sum + estimate.materialEstimate.total, 0);
      const totalLabourCost = estimates.reduce((sum, estimate) => sum + estimate.labourEstimate, 0);
      const totalProfessionalFees = estimates.reduce((sum, estimate) => sum + estimate.professionalFees.total, 0);
      const totalDurationMonths = estimates.reduce((sum, estimate) => sum + estimate.durationEstimate.maxMonths, 0);

      return {
        totalProjects,
        totalConstructionCost,
        averageConstructionCost,
        totalMaterialCost,
        totalLabourCost,
        totalProfessionalFees,
        estimatedDurationMonths: totalProjects ? Math.round(totalDurationMonths / totalProjects) : 0,
      };
    },
  });
}

export function useGetEstimate(id: number, options?: { query?: { enabled?: boolean } }) {
  return useQuery({
    queryKey: ["project", id],
    enabled: options?.query?.enabled ?? true,
    queryFn: async () => estimateStore.getAll().find((estimate) => estimate.id === id) ?? null,
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data }: { data: ProjectInput }) => {
      const records = estimateStore.getAll();
      const nextId = records.reduce((max, record) => Math.max(max, record.id), 0) + 1;
      const nextRecord = calculateProjectRecord(data, nextId);
      writeArray(ESTIMATE_STORAGE_KEY, [nextRecord, ...records]);
      return nextRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-stats"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });
}

export function useListMaterialPrices() {
  return materialStore.useList();
}

export function useUpsertMaterialPrice() {
  return materialStore.useUpsert();
}

export function useDeleteMaterialPrice() {
  return materialStore.useRemove();
}

export function useListLocationPrices() {
  return locationStore.useList();
}

export function useUpsertLocationPrice() {
  return locationStore.useUpsert();
}

export function useDeleteLocationPrice() {
  return locationStore.useRemove();
}

export function useListFeeRates() {
  return feeStore.useList();
}

export function useUpsertFeeRate() {
  return feeStore.useUpsert();
}

export function useDeleteFeeRate() {
  return feeStore.useRemove();
}

export function useListUsers() {
  return userStore.useList();
}

export function useUpsertUser() {
  return userStore.useUpsert();
}

export function useDeleteUser() {
  return userStore.useRemove();
}

export function getProjectsForCompare() {
  return estimateStore.getAll();
}

export function getAdminSummary() {
  const projects = estimateStore.getAll();
  const materialPrices = materialStore.getAll();
  const locationPrices = locationStore.getAll();
  const feeRates = feeStore.getAll();
  const users = userStore.getAll();

  return {
    projectCount: projects.length,
    materialCount: materialPrices.length,
    locationCount: locationPrices.length,
    feeRateCount: feeRates.length,
    userCount: users.length,
    complexityMix: projects.reduce<Record<string, number>>((acc, project) => {
      acc[project.structuralComplexity.label] = (acc[project.structuralComplexity.label] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
