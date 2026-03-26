import type { CampaignStatus } from "@/types/database";

export const campaignStatusOptions: CampaignStatus[] = [
  "Draft",
  "Active",
  "Paused",
  "Completed",
  "Archived"
];

export function isCampaignStatus(value: string): value is CampaignStatus {
  return campaignStatusOptions.includes(value as CampaignStatus);
}
