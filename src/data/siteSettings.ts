export interface SiteSettings {
  batchNo: number;
  weekNo: number;
  weekLabel: string;
  cutoffLabel: string;
  preferredDay: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  batchNo: 42,
  weekNo: 42,
  weekLabel: "15 - 21 Sept",
  cutoffLabel: "Sunday 8 PM",
  preferredDay: "Monday",
};

export function apiBase() {
  const endpoint = import.meta.env.VITE_ORDER_ENDPOINT;
  if (!endpoint) return "";
  return endpoint.replace(/\/api\/orders$/, "");
}
