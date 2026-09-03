export type CaseStatus = "active" | "not_active";

export const STATUS_LABEL: Record<CaseStatus, string> = {
  active: "Active",
  not_active: "Not Active",
};

export const STATUS_DESCRIPTION: Record<CaseStatus, string> = {
  active: "This case is active. The registry has this device on record as missing.",
  not_active: "This case is no longer active.",
};

export function isCaseStatus(value: string): value is CaseStatus {
  return value === "active" || value === "not_active";
}
