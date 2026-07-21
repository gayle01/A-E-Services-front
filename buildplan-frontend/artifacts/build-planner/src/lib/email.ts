import { formspreeUrl, companyEmail } from "./email-config";

export interface ProjectEmailData {
  projectName: string;
  location: string;
  buildingType: string;
  projectType: string;
  floorArea: number;
  numberOfFloors: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  ownerName: string;
  ownerProfession: string;
  ownerAnnualIncome: number;
  ownerCurrency: string;
  ownerEmail?: string;
  primaryUserName: string;
  primaryUserProfession: string;
  primaryUserAnnualIncome: number;
  primaryUserCurrency: string;
  totalCost: number;
  complexityScore: number;
  complexityLabel: string;
  durationMin: number;
  durationMax: number;
  materialEstimate: {
    items: Array<{
      materialName: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      total: number;
    }>;
    total: number;
  };
  labourEstimate: number;
  professionalFees: {
    architectural: number;
    structuralEngineering: number;
    quantitySurveying: number;
    projectManagement: number;
    total: number;
  };
  costBreakdown: {
    material: number;
    labour: number;
    professionalFees: number;
    contingency: number;
    total: number;
  };
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
    return symbol + amount.toLocaleString();
  };

  const sep = "----------------------------------------";
  const line = "\n";

  let text = "";

  // Header
  text += "NEW PROJECT ESTIMATE REQUEST" + line;
  text += "Project: " + data.projectName + " | Submitted: " + new Date().toLocaleString() + line;
  text += sep + line + line;

  // Project Summary
  text += "PROJECT SUMMARY" + line;
  text += "  Location: " + data.location + line;
  text += "  Type: " + data.buildingType + line;
  text += "  Area: " + data.floorArea + " m2" + line;
  text += "  Estimated Cost: " + formatCurrency(data.totalCost, data.ownerCurrency) + line;
  text += "  Duration: " + data.durationMin + "-" + data.durationMax + " months" + line;
  text += "  Complexity: " + data.complexityLabel + " (" + data.complexityScore + "%)" + line;
  text += sep + line + line;

  // Owner Information
  text += "OWNER INFORMATION" + line;
  text += "  Name: " + (data.ownerName || "Not provided") + line;
  text += "  Profession: " + data.ownerProfession + line;
  text += "  Annual Income: " + formatCurrency(data.ownerAnnualIncome, data.ownerCurrency) + line;
  text += "  Primary User: " + (data.primaryUserName || "Same as owner") + line;
  text += sep + line + line;

  // Project Details
  text += "PROJECT DETAILS" + line;
  text += "  Project Type: " + data.projectType + line;
  text += "  Building Type: " + data.buildingType + line;
  text += "  Floor Area: " + data.floorArea + " m2" + line;
  text += "  Floors: " + data.numberOfFloors + line;
  text += "  Bedrooms: " + data.numberOfBedrooms + line;
  text += "  Bathrooms: " + data.numberOfBathrooms + line;
  text += sep + line + line;

  // Cost Breakdown
  text += "COST BREAKDOWN" + line;
  text += "  Materials: " + formatCurrency(data.costBreakdown.material, data.ownerCurrency) + line;
  text += "  Labour: " + formatCurrency(data.costBreakdown.labour, data.ownerCurrency) + line;
  text += "  Professional Fees: " + formatCurrency(data.costBreakdown.professionalFees, data.ownerCurrency) + line;
  text += "  Contingency (8%): " + formatCurrency(data.costBreakdown.contingency, data.ownerCurrency) + line;
  text += "  TOTAL ESTIMATED COST: " + formatCurrency(data.costBreakdown.total, data.ownerCurrency) + line;
  text += sep + line + line;

  // Material Estimate
  text += "MATERIAL ESTIMATE" + line;
  text += "  " + "Material".padEnd(20) + "Qty".padEnd(12) + "Unit Price".padEnd(14) + "Total" + line;
  text += "  " + "-".repeat(60) + line;
  for (const item of data.materialEstimate.items) {
    text += "  " + item.materialName.padEnd(20) + (item.quantity + " " + item.unit).padEnd(12) + formatCurrency(item.unitPrice, data.ownerCurrency).padEnd(14) + formatCurrency(item.total, data.ownerCurrency) + line;
  }
  text += "  " + "-".repeat(60) + line;
  text += "  " + "TOTAL MATERIALS".padEnd(46) + formatCurrency(data.materialEstimate.total, data.ownerCurrency) + line;
  text += sep + line + line;

  // Professional Fees
  text += "PROFESSIONAL FEES" + line;
  text += "  Architectural Services: " + formatCurrency(data.professionalFees.architectural, data.ownerCurrency) + line;
  text += "  Structural Engineering: " + formatCurrency(data.professionalFees.structuralEngineering, data.ownerCurrency) + line;
  text += "  Quantity Surveying: " + formatCurrency(data.professionalFees.quantitySurveying, data.ownerCurrency) + line;
  text += "  Project Management: " + formatCurrency(data.professionalFees.projectManagement, data.ownerCurrency) + line;
  text += "  TOTAL PROFESSIONAL FEES: " + formatCurrency(data.professionalFees.total, data.ownerCurrency) + line;
  text += sep + line + line;

  // Footer
  text += "BUILD PLAN - Professional Construction Cost Estimation" + line;
  text += "This is an automated email. Please reply to contact the client." + line;

  return text;
}

export async function sendProjectEmail(data: ProjectEmailData): Promise<boolean> {
  try {
    const subject = "New Project Estimate: " + data.projectName;
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