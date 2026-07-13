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
      EUR: "€",
      GBP: "£",
      GHS: "₵",
      NGN: "₦",
      CNY: "¥",
    };
    const symbol = symbols[currency] || "$";
    return `${symbol}${amount.toLocaleString()}`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Project Estimate - ${data.projectName}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0b1d3a 0%, #1e3a5f 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .section { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section h2 { color: #0b1d3a; margin-top: 0; font-size: 20px; border-bottom: 2px solid #0b1d3a; padding-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .info-item { background: white; padding: 12px; border-radius: 6px; border-left: 3px solid #0b1d3a; }
    .info-label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
    .info-value { font-size: 16px; color: #333; font-weight: 600; }
    .cost-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .cost-table th { background: #0b1d3a; color: white; padding: 12px; text-align: left; font-weight: 600; }
    .cost-table td { padding: 12px; border-bottom: 1px solid #ddd; }
    .cost-table tr:hover { background: #f5f5f5; }
    .total-row { background: #e8f4f8 !important; font-weight: bold; }
    .total-row td { color: #0b1d3a; font-size: 16px; }
    .highlight-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .highlight-box h3 { margin: 0 0 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #ddd; margin-top: 30px; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .badge-simple { background: #28a745; color: white; }
    .badge-moderate { background: #ffc107; color: #333; }
    .badge-complex { background: #dc3545; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏗️ New Project Estimate Request</h1>
    <p>Project: ${data.projectName} | Submitted: ${new Date().toLocaleString()}</p>
  </div>

  <div class="highlight-box">
    <h3>📊 Project Summary</h3>
    <p><strong>Location:</strong> ${data.location} | <strong>Type:</strong> ${data.buildingType} | <strong>Area:</strong> ${data.floorArea} m²</p>
    <p><strong>Estimated Cost:</strong> ${formatCurrency(data.totalCost, data.ownerCurrency)} | <strong>Duration:</strong> ${data.durationMin}-${data.durationMax} months</p>
    <p><strong>Complexity:</strong> <span class="badge badge-${data.complexityLabel.toLowerCase()}">${data.complexityLabel} (${data.complexityScore}%)</span></p>
  </div>

  <div class="section">
    <h2>👤 Owner Information</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Name</div>
        <div class="info-value">${data.ownerName || "Not provided"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Profession</div>
        <div class="info-value">${data.ownerProfession}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Annual Income</div>
        <div class="info-value">${formatCurrency(data.ownerAnnualIncome, data.ownerCurrency)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Primary User</div>
        <div class="info-value">${data.primaryUserName || "Same as owner"}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>🏢 Project Details</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Project Type</div>
        <div class="info-value">${data.projectType}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Building Type</div>
        <div class="info-value">${data.buildingType}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Floor Area</div>
        <div class="info-value">${data.floorArea} m²</div>
      </div>
      <div class="info-item">
        <div class="info-label">Floors</div>
        <div class="info-value">${data.numberOfFloors}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Bedrooms</div>
        <div class="info-value">${data.numberOfBedrooms}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Bathrooms</div>
        <div class="info-value">${data.numberOfBathrooms}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>💰 Cost Breakdown</h2>
    <table class="cost-table">
      <thead>
        <tr>
          <th>Category</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Materials</td>
          <td>${formatCurrency(data.costBreakdown.material, data.ownerCurrency)}</td>
        </tr>
        <tr>
          <td>Labour</td>
          <td>${formatCurrency(data.costBreakdown.labour, data.ownerCurrency)}</td>
        </tr>
        <tr>
          <td>Professional Fees</td>
          <td>${formatCurrency(data.costBreakdown.professionalFees, data.ownerCurrency)}</td>
        </tr>
        <tr>
          <td>Contingency (8%)</td>
          <td>${formatCurrency(data.costBreakdown.contingency, data.ownerCurrency)}</td>
        </tr>
        <tr class="total-row">
          <td><strong>Total Estimated Cost</strong></td>
          <td><strong>${formatCurrency(data.costBreakdown.total, data.ownerCurrency)}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>📦 Material Estimate</h2>
    <table class="cost-table">
      <thead>
        <tr>
          <th>Material</th>
          <th>Quantity</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.materialEstimate.items.map(item => `
        <tr>
          <td>${item.materialName}</td>
          <td>${item.quantity} ${item.unit}</td>
          <td>${formatCurrency(item.unitPrice, data.ownerCurrency)}</td>
          <td>${formatCurrency(item.total, data.ownerCurrency)}</td>
        </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="3"><strong>Total Materials</strong></td>
          <td><strong>${formatCurrency(data.materialEstimate.total, data.ownerCurrency)}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>👷 Professional Fees</h2>
    <table class="cost-table">
      <thead>
        <tr>
          <th>Service</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Architectural Services</td>
          <td>${formatCurrency(data.professionalFees.architectural, data.ownerCurrency)}</td>
        </tr>
        <tr>
          <td>Structural Engineering</td>
          <td>${formatCurrency(data.professionalFees.structuralEngineering, data.ownerCurrency)}</td>
        </tr>
        <tr>
          <td>Quantity Surveying</td>
          <td>${formatCurrency(data.professionalFees.quantitySurveying, data.ownerCurrency)}</td>
        </tr>
        <tr>
          <td>Project Management</td>
          <td>${formatCurrency(data.professionalFees.projectManagement, data.ownerCurrency)}</td>
        </tr>
        <tr class="total-row">
          <td><strong>Total Professional Fees</strong></td>
          <td><strong>${formatCurrency(data.professionalFees.total, data.ownerCurrency)}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p><strong>BUILD PLAN</strong> - Professional Construction Cost Estimation</p>
    <p>This is an automated email. Please reply to contact the client.</p>
  </div>
</body>
</html>
  `.trim();
}

export async function sendProjectEmail(data: ProjectEmailData): Promise<boolean> {
  try {
    const emailHtml = generateProjectEmail(data);
    
    // Create a simple text version for the subject
    const subject = `New Project Estimate: ${data.projectName}`;
    
    // Send via Formspree using fetch
    const response = await fetch(formspreeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "BUILD PLAN System",
        email: companyEmail,
        subject: subject,
        message: emailHtml,
        projectName: data.projectName,
        location: data.location,
        buildingType: data.buildingType,
        totalCost: data.totalCost,
        complexity: data.complexityLabel,
        floorArea: data.floorArea,
        numberOfFloors: data.numberOfFloors,
        duration: `${data.durationMin}-${data.durationMax} months`,
      }),
    });

    if (response.ok) {
      console.log("Email sent successfully via Formspree");
      return true;
    } else {
      console.error("Failed to send email:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
