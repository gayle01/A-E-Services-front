import { formspreeUrl, companyEmail } from "./email-config";

export interface ProjectEmailData {
  // People Info
  ownerName: string;
  ownerEmail: string;
  ownerProfession: string;
  ownerAnnualIncome: number;
  ownerCurrency: string;
  ownerAgeGroup: string;
  ownerReligion: string;
  ownerEthnicity: string;
  ownerSocialStatus: string;
  ownerMaritalStatus: string;
  primaryUserName: string;
  primaryUserProfession: string;
  primaryUserAnnualIncome: number;
  primaryUserCurrency: string;
  primaryUserAgeGroup: string;
  primaryUserReligion: string;
  primaryUserEthnicity: string;
  primaryUserSocialStatus: string;
  primaryUserMaritalStatus: string;
  primaryUserSameAsOwner: boolean;

  // Land & Site Info
  ownLand: string;
  landDocumentsHeld: string;
  landTenure: string;
  yearsLeftOnLease: number;
  landAssistanceBuyLand: boolean;
  landAssistanceSiteSelection: boolean;
  sitePlanAvailable: boolean;
  landTitleAvailable: boolean;
  indentureAvailable: boolean;
  plotLength: number;
  plotBreadth: number;
  plotSize: number;
  isIrregularSite: boolean;
  sitePlanImage: string;
  zoning: string;
  environmentalZone: string;
  siteZoneType: string;
  siteTopography: string;
  siteAccessibility: string;
  accessWays: string;
  soilSurvey: boolean;
  topographicSurvey: boolean;
  specialViews: boolean;
  viewLocation: string;
  featuresOfViews: string;
  naturalFeatures: string;
  naturalFeatureNotes: string;
  hasVisitedLand: boolean;
  tellUsMore: string;
  accessRoads: string;
  orientation: string;
  buildingStyle: string;
  neighbourhoodCharacter: string;
  existingUtilities: string;
  roofComplexity: string;
  basement: boolean;
  largeOpenSpaces: boolean;
  cantileversOrBalconies: boolean;
  selectedAddOnServices: string[];

  // Project Info
  projectName: string;
  location: string;
  landmark: string;
  buildingType: string;
  projectType: string;
  constructionMethod: string;
  constructionPhasing: string;
  expectedCompletionTime: string;
  projectComplexity: string;
  designStyle: string;
  architecturalStyle: string;
  openAreaConcept: string;
  finishLevel: string;
  projectBudget: number;
  projectBudgetCurrency: string;
  constructionFeeStructure: string;
  floorArea: number;
  numberOfFloors: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  roofType: string;
  buildingShape: string;
  measurement: string;
  soilCondition: string;
  spacesRequired: Array<{
    name: string;
    dimensions: string;
    quantity: number;
    area: number;
    notes: string;
  }>;

  // Services
  architecturalScope: string;
  foundationType: string;
  structuralSystem: string;
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
}

export function generateProjectEmail(data: ProjectEmailData): string {
  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "\u20AC",
      GBP: "\u00A3",
      GHS: "\u20B5",
      NGN: "\u20A6",
      CNY: "\u00A5",
    };
    const symbol = symbols[currency] || "$";
    return symbol + (amount || 0).toLocaleString();
  };

  const boolYesNo = (val: boolean) => (val ? "Yes" : "No");
  const listItems = (items: string[]) => (items?.length ? items.join(", ") : "None selected");
  const ifPresent = (val: string | undefined | null) =>
    val && val.trim() ? val.trim() : "Not provided";

  const sep = "----------------------------------------";
  const line = "\n";

  let text = "";

  // Header
  text += "NEW PROJECT REQUEST" + line;
  text += "Project: " + data.projectName + " | Submitted: " + new Date().toLocaleString() + line;
  text += sep + line + line;

  // === PEOPLE INFORMATION ===
  text += "PEOPLE INFORMATION" + line;
  text += sep + line;

  text += "--- Owner ---" + line;
  text += "  Name: " + ifPresent(data.ownerName) + line;
  text += "  Email: " + ifPresent(data.ownerEmail) + line;
  text += "  Profession: " + data.ownerProfession + line;
  text += "  Annual Income: " + formatCurrency(data.ownerAnnualIncome, data.ownerCurrency) + line;
  text += "  Currency: " + data.ownerCurrency + line;
  text += "  Age Group: " + data.ownerAgeGroup + line;
  text += "  Religion: " + data.ownerReligion + line;
  text += "  Ethnicity: " + ifPresent(data.ownerEthnicity) + line;
  text += "  Social Status: " + ifPresent(data.ownerSocialStatus) + line;
  text += "  Marital Status: " + data.ownerMaritalStatus + line;

  text += "--- Primary User ---" + line;
  text += "  Same as Owner: " + boolYesNo(data.primaryUserSameAsOwner) + line;
  text += "  Name: " + ifPresent(data.primaryUserName) + line;
  text += "  Profession: " + data.primaryUserProfession + line;
  text += "  Annual Income: " + formatCurrency(data.primaryUserAnnualIncome, data.primaryUserCurrency) + line;
  text += "  Currency: " + data.primaryUserCurrency + line;
  text += "  Age Group: " + data.primaryUserAgeGroup + line;
  text += "  Religion: " + data.primaryUserReligion + line;
  text += "  Ethnicity: " + ifPresent(data.primaryUserEthnicity) + line;
  text += "  Social Status: " + ifPresent(data.primaryUserSocialStatus) + line;
  text += "  Marital Status: " + data.primaryUserMaritalStatus + line;
  text += sep + line + line;

  // === LAND INFORMATION ===
  text += "LAND INFORMATION" + line;
  text += sep + line;
  text += "  Location: " + data.location + line;
  text += "  Landmark: " + ifPresent(data.landmark) + line;
  text += "  Own Land: " + data.ownLand + line;
  text += "  Land Tenure: " + data.landTenure + line;
  if (data.yearsLeftOnLease > 0) {
    text += "  Years Left on Lease: " + data.yearsLeftOnLease + line;
  }
  text += "  Land Documents Held: " + ifPresent(data.landDocumentsHeld) + line;
  text += "  Assistance to Buy Land: " + boolYesNo(data.landAssistanceBuyLand) + line;
  text += "  Site Selection Assistance: " + boolYesNo(data.landAssistanceSiteSelection) + line;
  text += "  Site Plan Available: " + boolYesNo(data.sitePlanAvailable) + line;
  text += "  Land Title Available: " + boolYesNo(data.landTitleAvailable) + line;
  text += "  Indenture Available: " + boolYesNo(data.indentureAvailable) + line;
  text += "  Plot Length: " + (data.plotLength || 0) + line;
  text += "  Plot Breadth: " + (data.plotBreadth || 0) + line;
  text += "  Plot Size: " + (data.plotSize || 0) + " sq units" + line;
  text += "  Irregular Site: " + boolYesNo(data.isIrregularSite) + line;
  if (data.isIrregularSite && data.sitePlanImage) {
    text += "  Site Plan Image: " + data.sitePlanImage + line;
  }
  text += "  Zoning: " + data.zoning + line;
  text += "  EPA Consideration: " + data.environmentalZone + line;
  text += "  Site Zone Type: " + ifPresent(data.siteZoneType) + line;
  text += sep + line + line;

  // === SITE FEATURES ===
  text += "SITE FEATURES" + line;
  text += sep + line;
  text += "  Topography: " + data.siteTopography + line;
  text += "  Site Accessibility: " + data.siteAccessibility + line;
  text += "  Access Roads: " + data.accessRoads + line;
  text += "  Access Ways: " + ifPresent(data.accessWays) + line;
  text += "  Orientation: " + ifPresent(data.orientation) + line;
  text += "  Building Style: " + ifPresent(data.buildingStyle) + line;
  text += "  Neighbourhood Character: " + ifPresent(data.neighbourhoodCharacter) + line;
  text += "  Existing Utilities: " + ifPresent(data.existingUtilities) + line;
  text += "  Soil Survey Done: " + boolYesNo(data.soilSurvey) + line;
  text += "  Topographic Survey Done: " + boolYesNo(data.topographicSurvey) + line;
  text += "  Special Views: " + boolYesNo(data.specialViews) + line;
  if (data.specialViews) {
    text += "  View Location: " + ifPresent(data.viewLocation) + line;
    text += "  Features of Views: " + ifPresent(data.featuresOfViews) + line;
    text += "  Dominant Features: " + ifPresent(data.naturalFeatures) + line;
    text += "  Feature Notes: " + ifPresent(data.naturalFeatureNotes) + line;
  }
  text += "  Has Visited Land: " + boolYesNo(data.hasVisitedLand) + line;
  text += "  Tell Us More: " + ifPresent(data.tellUsMore) + line;
  text += "  Basement: " + boolYesNo(data.basement) + line;
  text += "  Large Open Spaces: " + boolYesNo(data.largeOpenSpaces) + line;
  text += "  Cantilevers/Balconies: " + boolYesNo(data.cantileversOrBalconies) + line;
  text += "  Roof Complexity: " + ifPresent(data.roofComplexity) + line;
  text += "  Add-on Services: " + listItems(data.selectedAddOnServices) + line;
  text += sep + line + line;

  // === PROJECT DETAILS ===
  text += "PROJECT DETAILS" + line;
  text += sep + line;
  text += "  Building Classification: " + data.buildingType + line;
  text += "  Project Type: " + data.projectType + line;
  text += "  Construction Method: " + data.constructionMethod + line;
  text += "  Construction Phasing: " + data.constructionPhasing + line;
  text += "  Expected Completion: " + data.expectedCompletionTime + line;
  text += "  Project Complexity: " + data.projectComplexity + line;
  text += "  Design Concept: " + data.designStyle + line;
  text += "  Architectural Style: " + ifPresent(data.architecturalStyle) + line;
  text += "  General Concept: " + ifPresent(data.openAreaConcept) + line;
  text += "  Finish Level: " + data.finishLevel + line;
  text += "  Floor Area: " + data.floorArea + " m2" + line;
  text += "  Number of Floors: " + data.numberOfFloors + line;
  text += "  Number of Bedrooms: " + data.numberOfBedrooms + line;
  text += "  Number of Bathrooms: " + data.numberOfBathrooms + line;
  text += "  Roof Type: " + data.roofType + line;
  text += "  Building Shape: " + data.buildingShape + line;
  text += "  Soil Condition: " + data.soilCondition + line;
  text += "  Measurement: " + ifPresent(data.measurement) + line;
  if (data.projectBudget > 0) {
    text += "  Project Budget: " + formatCurrency(data.projectBudget, data.projectBudgetCurrency) + " (" + data.projectBudgetCurrency + ")" + line;
  }
  text += "  Payment Tranche: " + ifPresent(data.constructionFeeStructure) + line;

  // Spaces
  if (data.spacesRequired?.length) {
    text += line + "  --- Required Spaces ---" + line;
    for (const space of data.spacesRequired) {
      text += "    - " + (space.name || "Unnamed") + line;
      text += "      Quantity: " + (space.quantity || 1) + line;
      text += "      Dimensions: " + ifPresent(space.dimensions) + line;
      text += "      Area: " + (space.area || 0) + " m2" + line;
      if (space.notes) text += "      Notes: " + space.notes + line;
    }
  }
  text += sep + line + line;

  // === SERVICES ===
  text += "SERVICES" + line;
  text += sep + line;
  text += "  Scope of Service: " + data.architecturalScope + line;
  text += "  Foundation Type: " + data.foundationType + line;
  text += "  Structural System: " + data.structuralSystem + line;
  text += "  Architectural Services: " + boolYesNo(data.architecturalServices) + line;
  text += "  Structural Engineering: " + boolYesNo(data.structuralEngineeringServices) + line;
  text += "  MEP Engineering: " + boolYesNo(data.mepEngineering) + line;
  text += "  Interior Design: " + boolYesNo(data.interiorDesign) + line;
  text += "  Custom Elements: " + boolYesNo(data.customElements) + line;
  text += "  Post-Contract Services: " + boolYesNo(data.postContractServices) + line;
  text += "  Architect Referral: " + boolYesNo(data.architectReferral) + line;
  text += "  Service Referral: " + boolYesNo(data.serviceReferral) + line;
  if (data.referralPercentage > 0) {
    text += "  Referral Percentage: " + data.referralPercentage + "%" + line;
  }
  text += "  Complimentary Services: " + boolYesNo(data.complimentaryServices) + line;
  text += sep + line + line;

  // Footer
  text += "BUILD PLAN - Professional Construction Planning Service" + line;
  text += "This is an automated email. Please reply to contact the client." + line;

  return text;
}

export async function sendProjectEmail(data: ProjectEmailData): Promise<boolean> {
  try {
    const subject = "New Project Request: " + data.projectName;
    const textContent = generateProjectEmail(data);

    const payload = JSON.stringify({
      _replyto: data.ownerEmail || companyEmail,
      name: data.ownerName || "BUILD PLAN System",
      email: data.ownerEmail || companyEmail,
      subject: subject,
      message: textContent,
    });

    const response = await fetch(formspreeUrl, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    if (response.ok) {
      console.log("Email sent successfully via Formspree");
      return true;
    } else {
      const text = await response.text();
      console.error("Formspree error:", response.status, text);
      return false;
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}