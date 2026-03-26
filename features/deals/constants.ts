import type { DealSeniority, DealStage, DealUrgency } from "@/types/database";

export const dealStageOptions: DealStage[] = [
  "new",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost"
];

export const dealUrgencyOptions: DealUrgency[] = ["low", "medium", "high", "critical"];

export const dealSeniorityOptions: DealSeniority[] = [
  "junior",
  "mid",
  "senior",
  "lead",
  "executive"
];

export function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
