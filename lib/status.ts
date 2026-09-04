export type CaseStatus = "pending" | "active" | "not_active";

export const STATUS_LABEL: Record<CaseStatus, string> = {
  pending: "Pending",
  active: "Active",
  not_active: "Not Active",
};

export const STATUS_DESCRIPTION: Record<CaseStatus, string> = {
  pending: "Your case has been submitted and is awaiting verification.",
  active: "Your case is active.",
  not_active: "This case is currently not active.",
};

export function isCaseStatus(value: string): value is CaseStatus {
  return value === "pending" || value === "active" || value === "not_active";
}
