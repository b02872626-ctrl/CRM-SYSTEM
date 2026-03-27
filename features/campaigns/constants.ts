import { NotionOption } from "@/components/ui/notion-select";
import { CampaignStatus } from "@/types/database";

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

export const SALES_STATUS_OPTIONS: NotionOption[] = [
  { label: "Connection Sent", value: "Connection Sent", color: "blue" },
  { label: "Email sent", value: "Email sent", color: "blue" },
  { label: "LinkedIn DM", value: "LinkedIn DM", color: "blue" },
  { label: "Follow Up 1", value: "Follow Up 1", color: "blue" },
  { label: "Follow Up 2", value: "Follow Up 2", color: "blue" },
  { label: "Won", value: "Won", color: "green" },
  { label: "Lost", value: "Lost", color: "rose" },
];

export const INTEREST_LEVEL_OPTIONS: NotionOption[] = [
  { label: "ICE Cold", value: "ICE Cold", color: "blue" },
  { label: "Cold", value: "Cold", color: "purple" },
  { label: "Room temp", value: "Room temp", color: "gray" },
  { label: "Warm", value: "Warm", color: "yellow" },
  { label: "HOT", value: "HOT", color: "green" },
];
