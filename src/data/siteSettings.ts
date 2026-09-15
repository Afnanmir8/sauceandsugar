export interface SiteSettings {
  batchNo: number;
  weekNo: number;
  weekLabel: string;
  cutoffLabel: string;
  preferredDay: string;
  preferredDays?: string[];
}

export const ALL_WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function getPreferredDays(settings?: Partial<SiteSettings> | null): string[] {
  if (Array.isArray(settings?.preferredDays) && settings.preferredDays.length > 0) {
    return settings.preferredDays;
  }
  if (settings?.preferredDay) {
    const split = settings.preferredDay.split(",").map((d) => d.trim()).filter(Boolean);
    if (split.length > 0) return split;
  }
  return ["Monday"];
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  batchNo: 42,
  weekNo: 42,
  weekLabel: "15 - 21 Sept",
  cutoffLabel: "Sunday 8 PM",
  preferredDay: "Monday",
  preferredDays: ["Monday"],
};

export function apiBase() {
  const endpoint = import.meta.env.VITE_ORDER_ENDPOINT;
  if (!endpoint) return "";
  return endpoint.replace(/\/api\/orders$/, "");
}
