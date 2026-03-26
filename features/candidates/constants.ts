import type { ApplicationStatus, CandidateStage } from "@/types/database";

export const candidateStageOptions: CandidateStage[] = [
  "sourced",
  "screening",
  "interview",
  "shortlisted",
  "placed",
  "rejected",
  "on_hold"
];

export const applicationStatusOptions: ApplicationStatus[] = [
  "applied",
  "screening",
  "interview",
  "submitted",
  "offer",
  "placed",
  "rejected",
  "withdrawn"
];

export function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getScreeningStatus(candidateStage: string, applicationStatus?: string | null) {
  if (applicationStatus === "screening" || candidateStage === "screening") {
    return "In progress";
  }

  if (
    ["interview", "submitted", "offer", "placed", "rejected", "withdrawn"].includes(
      applicationStatus ?? ""
    ) ||
    ["interview", "shortlisted", "placed", "rejected", "on_hold"].includes(candidateStage)
  ) {
    return "Complete";
  }

  return "Pending";
}

export function getInterviewStatus(candidateStage: string, applicationStatus?: string | null) {
  if (applicationStatus === "interview" || candidateStage === "interview") {
    return "In progress";
  }

  if (
    ["submitted", "offer", "placed"].includes(applicationStatus ?? "") ||
    ["shortlisted", "placed"].includes(candidateStage)
  ) {
    return "Complete";
  }

  return "Pending";
}

export function getShortlistStatus(candidateStage: string, applicationStatus?: string | null) {
  if (
    candidateStage === "shortlisted" ||
    candidateStage === "placed" ||
    ["submitted", "offer", "placed"].includes(applicationStatus ?? "")
  ) {
    return "Shortlisted";
  }

  return "Not shortlisted";
}

export function getPlacementStatus(candidateStage: string, applicationStatus?: string | null) {
  if (candidateStage === "placed" || applicationStatus === "placed") {
    return "Placed";
  }

  if (applicationStatus === "offer") {
    return "Offer";
  }

  return "Open";
}
