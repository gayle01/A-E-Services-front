import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ProjectInputBuildingType = {
  residential: "residential",
  commercial: "commercial",
  industrial: "industrial",
  institutional: "institutional",
} as const;

export const ProjectInputSiteCondition = {
  flat: "flat",
  sloped: "sloped",
  rocky: "rocky",
  waterlogged: "waterlogged",
} as const;

export const ProjectInputFinishQuality = {
  basic: "basic",
  standard: "standard",
  premium: "premium",
} as const;

export type ProjectInput = {
  projectName: string;
  location: string;
  profession?: string;
  ageGroup?: "under-25" | "25-34" | "35-44" | "45-54" | "55-plus";
  annualIncome?: string;
  projectBudgetType?: "individual" | "corporate" | "alliance";
  budgetPreference?: "amount" | "dont-know" | "loan";
  budgetAmount?: string;
  religion?: string;
  buildingType: (typeof ProjectInputBuildingType)[keyof typeof ProjectInputBuildingType];
  floorArea: number;
  numFloors: number;
  siteCondition: (typeof ProjectInputSiteCondition)[keyof typeof ProjectInputSiteCondition];
  finishQuality: (typeof ProjectInputFinishQuality)[keyof typeof ProjectInputFinishQuality];
};

type Estimate = {
  id: number;
  projectName: string;
  location: string;
  profession?: string;
  ageGroup?: string;
  annualIncome?: string;
  projectBudgetType?: string;
  budgetPreference?: string;
  budgetAmount?: string;
  religion?: string;
  buildingType: ProjectInput["buildingType"];
  floorArea: number;
  numFloors: number;
  siteCondition: ProjectInput["siteCondition"];
  finishQuality: ProjectInput["finishQuality"];
  totalCostMin: number;
  totalCostMax: number;
  durationMonthsMin: number;
  durationMonthsMax: number;
  currency: "GHS";
  createdAt: string;
  costBreakdown: {
    foundation: number;
    structure: number;
    roofing: number;
    finishes: number;
    mepServices: number;
    siteWork: number;
    contingency: number;
    total: number;
  };
  materials: {
    cementBags: number;
    steelTonnes: number;
    sandCubicMetres: number;
    gravellCubicMetres: number;
    blockCount: number;
    roofingSheets: number;
  };
  professionalFees: {
    architectFeeMin: number;
    architectFeeMax: number;
    structuralEngineerFeeMin: number;
    structuralEngineerFeeMax: number;
    quantitySurveyorFeeMin: number;
    quantitySurveyorFeeMax: number;
    projectManagerFeeMin: number;
    projectManagerFeeMax: number;
  };
};

const STORAGE_KEY = "buildplan.mock.estimates";

function seedEstimates(): Estimate[] {
  return [
    createEstimateRecord({
      projectName: "Osei Family Residence",
      location: "accra",
      buildingType: ProjectInputBuildingType.residential,
      floorArea: 240,
      numFloors: 2,
      siteCondition: ProjectInputSiteCondition.flat,
      finishQuality: ProjectInputFinishQuality.standard,
    }, 1, "2026-06-14T10:00:00.000Z"),
    createEstimateRecord({
      projectName: "Takoradi Retail Plaza",
      location: "takoradi",
      buildingType: ProjectInputBuildingType.commercial,
      floorArea: 680,
      numFloors: 3,
      siteCondition: ProjectInputSiteCondition.sloped,
      finishQuality: ProjectInputFinishQuality.premium,
    }, 2, "2026-06-18T15:30:00.000Z"),
  ];
}

function loadEstimates(): Estimate[] {
  if (typeof window === "undefined") {
    return seedEstimates();
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedEstimates();
    saveEstimates(seeded);
    return seeded;
  }
  try {
    return JSON.parse(raw) as Estimate[];
  } catch {
    const seeded = seedEstimates();
    saveEstimates(seeded);
    return seeded;
  }
}

function saveEstimates(estimates: Estimate[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estimates));
  }
}

function createEstimateRecord(input: ProjectInput, id: number, createdAt = new Date().toISOString()): Estimate {
  const baseRateMap = {
    residential: 7200,
    commercial: 8800,
    industrial: 7600,
    institutional: 8300,
  } as const;
  const finishMultiplierMap = {
    basic: 0.92,
    standard: 1,
    premium: 1.22,
  } as const;
  const siteMultiplierMap = {
    flat: 1,
    sloped: 1.08,
    rocky: 1.13,
    waterlogged: 1.18,
  } as const;

  const baseRate = baseRateMap[input.buildingType];
  const finishMultiplier = finishMultiplierMap[input.finishQuality];
  const siteMultiplier = siteMultiplierMap[input.siteCondition];
  const floorMultiplier = 1 + Math.max(input.numFloors - 1, 0) * 0.07;
  const totalTarget = Math.round(input.floorArea * baseRate * finishMultiplier * siteMultiplier * floorMultiplier);

  const foundation = Math.round(totalTarget * 0.15);
  const structure = Math.round(totalTarget * 0.27);
  const roofing = Math.round(totalTarget * 0.11);
  const finishes = Math.round(totalTarget * 0.21);
  const mepServices = Math.round(totalTarget * 0.12);
  const siteWork = Math.round(totalTarget * 0.08);
  const contingency = Math.round(totalTarget * 0.06);

  const totalCostMin = Math.round(totalTarget * 0.94);
  const totalCostMax = Math.round(totalTarget * 1.08);

  return {
    id,
    projectName: input.projectName,
    location: input.location,
    profession: input.profession,
    ageGroup: input.ageGroup,
    annualIncome: input.annualIncome,
    projectBudgetType: input.projectBudgetType,
    budgetPreference: input.budgetPreference,
    budgetAmount: input.budgetAmount,
    religion: input.religion,
    buildingType: input.buildingType,
    floorArea: input.floorArea,
    numFloors: input.numFloors,
    siteCondition: input.siteCondition,
    finishQuality: input.finishQuality,
    totalCostMin,
    totalCostMax,
    durationMonthsMin: Math.max(4, Math.round(input.floorArea / 80)),
    durationMonthsMax: Math.max(6, Math.round(input.floorArea / 55)),
    currency: "GHS",
    createdAt,
    costBreakdown: {
      foundation,
      structure,
      roofing,
      finishes,
      mepServices,
      siteWork,
      contingency,
      total: foundation + structure + roofing + finishes + mepServices + siteWork + contingency,
    },
    materials: {
      cementBags: Math.round(input.floorArea * 18),
      steelTonnes: Number((input.floorArea * 0.042).toFixed(1)),
      sandCubicMetres: Math.round(input.floorArea * 0.7),
      gravellCubicMetres: Math.round(input.floorArea * 0.52),
      blockCount: Math.round(input.floorArea * 12),
      roofingSheets: Math.round(input.floorArea * 1.15),
    },
    professionalFees: {
      architectFeeMin: Math.round(totalTarget * 0.04),
      architectFeeMax: Math.round(totalTarget * 0.06),
      structuralEngineerFeeMin: Math.round(totalTarget * 0.015),
      structuralEngineerFeeMax: Math.round(totalTarget * 0.025),
      quantitySurveyorFeeMin: Math.round(totalTarget * 0.015),
      quantitySurveyorFeeMax: Math.round(totalTarget * 0.02),
      projectManagerFeeMin: Math.round(totalTarget * 0.02),
      projectManagerFeeMax: Math.round(totalTarget * 0.035),
    },
  };
}

export function useListEstimates() {
  return useQuery({
    queryKey: ["estimates"],
    queryFn: async () => loadEstimates(),
  });
}

export function useGetEstimateStats() {
  return useQuery({
    queryKey: ["estimate-stats"],
    queryFn: async () => {
      const estimates = loadEstimates();
      const totalEstimates = estimates.length;
      const averageCost = totalEstimates
        ? Math.round(estimates.reduce((sum, estimate) => sum + estimate.totalCostMax, 0) / totalEstimates)
        : 0;
      const totalFloorAreaEstimated = estimates.reduce((sum, estimate) => sum + estimate.floorArea, 0);
      const counts = estimates.reduce<Record<string, number>>((acc, estimate) => {
        acc[estimate.location] = (acc[estimate.location] ?? 0) + 1;
        return acc;
      }, {});
      const mostCommonLocation = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

      return {
        totalEstimates,
        averageCost,
        totalFloorAreaEstimated,
        mostCommonLocation,
      };
    },
  });
}

export function useGetEstimate(id: number, options?: { query?: { enabled?: boolean } }) {
  return useQuery({
    queryKey: ["estimate", id],
    enabled: options?.query?.enabled ?? true,
    queryFn: async () => loadEstimates().find((estimate) => estimate.id === id) ?? null,
  });
}

export function useCreateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data }: { data: ProjectInput }) => {
      const estimates = loadEstimates();
      const nextId = estimates.reduce((max, estimate) => Math.max(max, estimate.id), 0) + 1;
      const nextEstimate = createEstimateRecord(data, nextId);
      const updated = [nextEstimate, ...estimates];
      saveEstimates(updated);
      return nextEstimate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimates"] });
      queryClient.invalidateQueries({ queryKey: ["estimate-stats"] });
    },
  });
}
