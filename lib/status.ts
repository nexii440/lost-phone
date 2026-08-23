export type CaseStatus = "open" | "found" | "closed";

export const STATUS_LABEL: Record<CaseStatus, string> = {
  open: "Open",
  found: "Found",
  closed: "Closed",
};

export const STATUS_DESCRIPTION: Record<CaseStatus, string> = {
  open: "This case is active. The registry has this device on record as missing.",
  found: "The owner or a finder has reported this device recovered.",
  closed: "This case is no longer active.",
};

export function isCaseStatus(value: string): value is CaseStatus {
  return value === "open" || value === "found" || value === "closed";
}
