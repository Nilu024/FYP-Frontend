import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

export const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)}m away` : `${km.toFixed(1)}km away`;

export const formatDate = (date: string | Date) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));

export const getUrgencyColor = (urgency: string) => {
  const map: Record<string, string> = {
    low: "bg-blue-100 text-blue-700 border-blue-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    critical: "bg-red-100 text-red-700 border-red-200",
  };
  return map[urgency] || map.medium;
};

export const getCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    Education: "🎓", Healthcare: "🏥", Poverty: "🤝", Environment: "🌱",
    "Animal Welfare": "🐾", "Disaster Relief": "🆘", "Women Empowerment": "💪",
    "Child Welfare": "👶", "Elderly Care": "👴", "Disability Support": "♿",
    "Arts & Culture": "🎨", Sports: "⚽", "Water & Sanitation": "💧",
    "Food Security": "🌾", "Rural Development": "🏘️",
  };
  return map[category] || "💛";
};

export const truncate = (str: string, n: number) =>
  str.length > n ? str.substring(0, n - 1) + "…" : str;
