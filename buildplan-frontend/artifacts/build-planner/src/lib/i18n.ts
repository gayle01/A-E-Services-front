export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "GHS", symbol: "₵", name: "Ghana Cedi" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const LENGTH_UNITS = [
  { code: "m", name: "Meters", toMeters: 1 },
  { code: "ft", name: "Feet", toMeters: 0.3048 },
  { code: "yd", name: "Yards", toMeters: 0.9144 },
] as const;

export const AREA_UNITS = [
  { code: "m²", name: "Square Meters", toSqMeters: 1 },
  { code: "ft²", name: "Square Feet", toSqMeters: 0.092903 },
  { code: "ac", name: "Acres", toSqMeters: 4046.86 },
  { code: "ha", name: "Hectares", toSqMeters: 10000 },
  { code: "plot", name: "Plot", toSqMeters: 1000 },
] as const;

export type LengthUnit = (typeof LENGTH_UNITS)[number]["code"];
export type AreaUnit = (typeof AREA_UNITS)[number]["code"];

export function formatCurrency(amount: number, currency: CurrencyCode = "USD"): string {
  const currencyInfo = CURRENCIES.find((c) => c.code === currency);
  const symbol = currencyInfo?.symbol || "$";
  return `${symbol}${amount.toLocaleString()}`;
}

export function parseCurrency(value: string, currency: CurrencyCode = "USD"): number {
  const currencyInfo = CURRENCIES.find((c) => c.code === currency);
  const symbol = currencyInfo?.symbol || "$";
  const cleaned = value.replace(new RegExp(`[${symbol}\\s,]`, "g"), "");
  return parseFloat(cleaned) || 0;
}

export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  const fromUnit = LENGTH_UNITS.find((u) => u.code === from);
  const toUnit = LENGTH_UNITS.find((u) => u.code === to);
  if (!fromUnit || !toUnit) return value;
  
  const inMeters = value * fromUnit.toMeters;
  return inMeters / toUnit.toMeters;
}

export function convertArea(value: number, from: AreaUnit, to: AreaUnit): number {
  const fromUnit = AREA_UNITS.find((u) => u.code === from);
  const toUnit = AREA_UNITS.find((u) => u.code === to);
  if (!fromUnit || !toUnit) return value;
  
  const inSqMeters = value * fromUnit.toSqMeters;
  return inSqMeters / toUnit.toSqMeters;
}

export function formatNumberWithCommas(value: number): string {
  return value.toLocaleString();
}
